import os
import sys
import threading
import time
from collections import Counter, deque
from typing import Deque, List

import av
import cv2
import numpy as np
import requests
from streamlit_webrtc import VideoProcessorBase


PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from preprocessing.video2landmarks import VideoLandmarksExtractor


class RealTimeSignProcessor(VideoProcessorBase):
    """Real-time video processor using direct per-frame landmark extraction."""

    def __init__(self, api_url: str = "http://127.0.0.1:8000/predict"):
        self.api_url = api_url
        self.extractor = VideoLandmarksExtractor()
        # Keep an exact-length sequence to match training input: (60, 180, 3)
        self.frame_buffer: List[np.ndarray] = []
        self.sequence_length = 60
        self.latest_predictions: List[dict] = []
        self.latest_word: str = ""
        self.latest_score: float = 0.0
        self.confidence_threshold = 0.7
        # Enable to inspect sequence shape and prediction outputs.
        self.debug = True
        # Keep last N predictions for smoothing
        self.prediction_history: Deque[str] = deque(maxlen=10)
        self.last_predict_time = 0.0
        self.predict_every_sec = 0.65
        self.prediction_inflight = False
        self.lock = threading.Lock()

    def recv(self, frame: av.VideoFrame) -> av.VideoFrame:
        image = frame.to_ndarray(format="bgr24")
        image = cv2.flip(image, 1)
        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        landmarks, mp_hands, mp_pose, mp_face = self.extract_landmarks(rgb)
        self.update_sequence(landmarks, mp_hands)
        self.draw_landmarks(image, mp_hands, mp_pose, mp_face)
        self.predict_sequence()

        with self.lock:
            cached_word = self.latest_word
            cached_score = self.latest_score

        if cached_word:
            cv2.rectangle(image, (12, 12), (390, 60), (5, 14, 57), -1)
            cv2.putText(
                image,
                f"{cached_word} ({cached_score:.2f})",
                (20, 44),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 255, 255),
                2,
                cv2.LINE_AA,
            )

        return av.VideoFrame.from_ndarray(image, format="bgr24")

    # Extract and normalize landmarks for a single frame.
    def extract_landmarks(self, rgb: np.ndarray):
        landmarks, mp_hands, mp_pose, mp_face = self.extractor.extract_frame_landmarks(
            rgb,
            return_mp_results=True,
        )
        # This uses z-score normalisation — different from the REST API pipeline in serving/pose2gloss.py
        # Only used by the Streamlit WebRTC path, not the React frontend
        # Per-frame normalization keeps real-time input distribution aligned with training.
        # This preserves shape (180, 3) and stabilizes scale across frames.
        if landmarks.shape == (180, 3):
            mean = landmarks.mean(axis=0, keepdims=True)
            std = landmarks.std(axis=0, keepdims=True)
            std = np.where(std == 0, 1.0, std)
            landmarks = (landmarks - mean) / std
        return landmarks, mp_hands, mp_pose, mp_face

    # Append a frame to the exact-length sequence buffer if valid.
    def update_sequence(self, landmarks: np.ndarray, mp_hands) -> None:
        # Skip frames with no hand detections to keep the sequence clean and accurate.
        has_hands = bool(mp_hands and mp_hands.multi_hand_landmarks)
        if landmarks.shape == (180, 3) and has_hands and len(self.frame_buffer) < self.sequence_length:
            self.frame_buffer.append(landmarks)

    # Trigger prediction only when sequence length matches training input.
    def predict_sequence(self) -> None:
        now = time.time()
        if (
            len(self.frame_buffer) == self.sequence_length
            and now - self.last_predict_time >= self.predict_every_sec
            and not self.prediction_inflight
        ):
            self.prediction_inflight = True
            # Send the exact-length sequence only (no partials, no backend padding).
            payload_landmarks = np.array(self.frame_buffer, dtype=np.float32).tolist()
            if self.debug:
                print("[DEBUG] Sequence shape:", np.array(self.frame_buffer).shape)
            threading.Thread(
                target=self._predict_now,
                args=(payload_landmarks,),
                daemon=True,
            ).start()
            self.last_predict_time = now
            # Clear sequence after prediction request to enforce strict 60-frame windows.
            self.frame_buffer = []

    # Draw the latest landmarks onto the frame for visual feedback.
    def draw_landmarks(self, image: np.ndarray, mp_hands, mp_pose, mp_face) -> None:
        if mp_hands and mp_hands.multi_hand_landmarks:
            for hand_landmarks in mp_hands.multi_hand_landmarks:
                self.extractor.mp_drawing.draw_landmarks(
                    image,
                    hand_landmarks,
                    self.extractor.hand_connections,
                    landmark_drawing_spec=self.extractor.mp_drawing_styles.get_default_hand_landmarks_style(),
                    connection_drawing_spec=self.extractor.mp_drawing_styles.get_default_hand_connections_style(),
                )

        if mp_pose and mp_pose.pose_landmarks:
            self.extractor.mp_drawing.draw_landmarks(
                image,
                mp_pose.pose_landmarks,
                self.extractor.pose_connections,
                landmark_drawing_spec=self.extractor.mp_drawing_styles.get_default_pose_landmarks_style(),
            )

        if mp_face and mp_face.multi_face_landmarks:
            for face_landmarks in mp_face.multi_face_landmarks:
                self.extractor.mp_drawing.draw_landmarks(
                    image,
                    face_landmarks,
                    self.extractor.face_contours,
                    landmark_drawing_spec=None,
                    connection_drawing_spec=self.extractor.mp_drawing_styles.get_default_face_mesh_contours_style(),
                )

    # Call API prediction and update smoothed output.
    def _predict_now(self, payload_landmarks: List[List[List[float]]]) -> None:
        payload = {
            "landmarks": payload_landmarks,
            "top_n": 5,
        }
        try:
            response = requests.post(self.api_url, json=payload, timeout=5)
            response.raise_for_status()
            preds = response.json().get("predictions", [])
        except Exception:
            self.prediction_inflight = False
            return

        with self.lock:
            self.latest_predictions = preds
            if preds:
                raw_word = preds[0].get("gloss", "")
                raw_score = float(preds[0].get("score", 0.0))
                self.latest_score = raw_score
                self.latest_word = self.smooth_predictions(raw_word, raw_score)
        if self.debug:
            print("[DEBUG] Raw predictions:", preds)
            print("[DEBUG] Predicted label:", self.latest_word)
            print("[DEBUG] Confidence:", self.latest_score)
        self.prediction_inflight = False

    # Majority-vote smoothing with confidence threshold.
    def smooth_predictions(self, raw_word: str, raw_score: float) -> str:
        if raw_word and raw_score >= self.confidence_threshold:
            self.prediction_history.append(raw_word)
            return Counter(self.prediction_history).most_common(1)[0][0]
        return "No confident prediction"

    def get_state(self):
        with self.lock:
            return {
                "latest_word": self.latest_word,
                "latest_score": self.latest_score,
                "latest_predictions": list(self.latest_predictions),
            }

    def close(self) -> None:
        self.extractor.mp_hands.reset()
        self.extractor.mp_pose.reset()
        self.extractor.mp_face.reset()
