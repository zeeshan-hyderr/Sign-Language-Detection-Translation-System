import cv2
import numpy as np
import requests
import sys
sys.path.insert(0, '.')
from preprocessing.video2landmarks import VideoLandmarksExtractor

API_URL = "http://localhost:8000/predict"
MAX_FRAMES = 60
BUFFER_SIZE = MAX_FRAMES

extractor = VideoLandmarksExtractor()
cap = cv2.VideoCapture(0)

frame_buffer = []
predicting = False
last_predictions = []

print("Press SPACE to start recording a sign (195 frames), Q to quit.")

while cap.isOpened():
    success, image = cap.read()
    if not success:
        break

    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image_rgb.flags.writeable = False
    frame_landmarks, mp_hands, mp_pose, mp_face = extractor.extract_frame_landmarks(
        image_rgb, return_mp_results=True
    )
    image_rgb.flags.writeable = True
    display = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)
    display = cv2.flip(display, 1)

    # Draw landmarks
    if mp_hands and mp_hands.multi_hand_landmarks:
        for hand_lm in mp_hands.multi_hand_landmarks:
            extractor.mp_drawing.draw_landmarks(
                display, hand_lm, extractor.hand_connections,
                landmark_drawing_spec=extractor.mp_drawing_styles.get_default_hand_landmarks_style(),
                connection_drawing_spec=extractor.mp_drawing_styles.get_default_hand_connections_style()
            )
    if mp_pose and mp_pose.pose_landmarks:
        extractor.mp_drawing.draw_landmarks(
            display, mp_pose.pose_landmarks, extractor.pose_connections,
            landmark_drawing_spec=extractor.mp_drawing_styles.get_default_pose_landmarks_style()
        )
    if mp_face and mp_face.multi_face_landmarks:
        for face_lm in mp_face.multi_face_landmarks:
            extractor.mp_drawing.draw_landmarks(
                display, face_lm, extractor.face_contours,
                landmark_drawing_spec=None,
                connection_drawing_spec=extractor.mp_drawing_styles.get_default_face_mesh_contours_style()
            )

    # Recording logic
    if predicting:
        frame_buffer.append(frame_landmarks)
        remaining = BUFFER_SIZE - len(frame_buffer)

        # Show recording status
        cv2.putText(display, f'RECORDING... {remaining} frames left',
                    (10, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)

        if len(frame_buffer) >= BUFFER_SIZE:
            predicting = False
            print("Sending to API...")
            landmarks_list = np.array(frame_buffer, dtype=float).tolist()
            try:
                response = requests.post(
                    API_URL,
                    json={"landmarks": landmarks_list, "top_n": 5},
                    timeout=30
                )
                data = response.json()
                last_predictions = data.get("predictions", [])
                print("Predictions:")
                for p in last_predictions:
                    print(f"  {p['gloss']}: {p['score']:.4f}")
            except Exception as e:
                print(f"API error: {e}")
            frame_buffer = []
    else:
        cv2.putText(display, 'Press SPACE to sign',
                    (10, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

    # Show last predictions on screen
    y = 80
    for i, p in enumerate(last_predictions):
        text = f"{i+1}. {p['gloss']}: {p['score']:.4f}"
        cv2.putText(display, text, (10, y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
        y += 30

    cv2.imshow('Sign Language Recognition', display)
    key = cv2.waitKey(5) & 0xFF

    if key == ord('q'):
        break
    elif key == ord(' ') and not predicting:
        print("Recording started...")
        frame_buffer = []
        predicting = True

cap.release()
cv2.destroyAllWindows()
extractor.mp_hands.reset()
extractor.mp_pose.reset()
extractor.mp_face.reset()