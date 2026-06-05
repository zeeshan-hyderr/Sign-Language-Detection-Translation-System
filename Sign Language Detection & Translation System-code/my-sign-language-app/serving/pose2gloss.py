import os
os.environ['TF_USE_LEGACY_KERAS'] = '0'

import pickle
import numpy as np
import tensorflow as tf
import keras
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from .schemas import LandmarkRequest, PredictionResponse, GlossPrediction
from pose2gloss.model_utils import EfficientChannelAttention, CausalDWConv1D, build_and_compile_GISLR

INTERPRETER = None
INPUT_DETAILS = None
OUTPUT_DETAILS = None
LABEL_ENCODER = None
MAX_FRAMES = 60
PAD_VALUE = -100
NUM_LANDMARKS = 180
MAX_LABELS = 300


@asynccontextmanager
async def lifespan(app: FastAPI):
    global INTERPRETER, INPUT_DETAILS, OUTPUT_DETAILS, LABEL_ENCODER

    label_path = Path(__file__).resolve().parents[1] / 'label_encoder.pkl'
    with label_path.open('rb') as f:
        LABEL_ENCODER = pickle.load(f)

    tf_model = build_and_compile_GISLR(
        max_frames=MAX_FRAMES,
        num_landmarks=NUM_LANDMARKS,
        num_glosses=MAX_LABELS,
        pad_value=PAD_VALUE,
    )
    weights_path = Path(__file__).resolve().parents[1] / 'wlasl300.h5'
    tf_model.load_weights(str(weights_path), by_name=False, skip_mismatch=False)

    tflite_model = tf.lite.TFLiteConverter.from_keras_model(tf_model).convert()
    INTERPRETER = tf.lite.Interpreter(model_content=tflite_model)
    INTERPRETER.allocate_tensors()
    INPUT_DETAILS = INTERPRETER.get_input_details()
    OUTPUT_DETAILS = INTERPRETER.get_output_details()
    yield

    del INTERPRETER, INPUT_DETAILS, OUTPUT_DETAILS, LABEL_ENCODER


app = FastAPI(
    title='Pose-to-Gloss Model Serving',
    lifespan=lifespan,
    description='API for predicting glosses from a list of frame landmarks.',
)

# Allow requests from local frontend dev servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

from serving.extract import router as extract_router
app.include_router(extract_router)
from serving.translate import router as translate_router
app.include_router(translate_router)


@app.get('/health')
async def health_check():
    return {'status': 'healthy'}


@app.get('/metadata')
async def get_metadata():
    return JSONResponse(content={
        'max_frames': MAX_FRAMES,
        'pad_value': PAD_VALUE,
        'num_landmarks': NUM_LANDMARKS,
        'max_labels': MAX_LABELS,
        'label_encoder_classes': LABEL_ENCODER.classes_.tolist(),
        'label_encoder_mapping': {i: gloss for i, gloss in enumerate(LABEL_ENCODER.classes_)}
    })


@app.post('/predict', response_model=PredictionResponse)
async def predict(request: LandmarkRequest):
    try:
        landmarks = np.array(request.landmarks, dtype=np.float32)
        if len(landmarks.shape) != 3 or landmarks.shape[2] != 3:
            raise HTTPException(status_code=400, detail='Landmarks must have shape (frames, 180, 3)')
        if request.top_n < 1 or request.top_n > MAX_LABELS:
            raise HTTPException(status_code=400, detail=f'top_n must be between 1 and {MAX_LABELS}')

        if len(landmarks) > MAX_FRAMES:
            landmarks = landmarks[:MAX_FRAMES]
        else:
            landmarks = np.pad(landmarks, (
                (0, MAX_FRAMES - len(landmarks)),
                (0, 0),
                (0, 0)
            ), mode='constant', constant_values=PAD_VALUE)

        # Normalisation applied here AND in serving/extract.py — must stay in sync
        nose_center = landmarks[:, 49, :]
        landmarks = landmarks - nose_center[:, None, :]
        landmarks = tf.expand_dims(landmarks, axis=0)

        INTERPRETER.set_tensor(INPUT_DETAILS[0]['index'], landmarks)
        INTERPRETER.invoke()
        logits = INTERPRETER.get_tensor(OUTPUT_DETAILS[0]['index'])
        probabilities = tf.nn.softmax(logits, axis=-1).numpy()[0]

        top_n_indices = np.argsort(probabilities)[-request.top_n:][::-1]
        top_n_scores = probabilities[top_n_indices]
        top_n_glosses = LABEL_ENCODER.inverse_transform(top_n_indices)

        predictions = [
            GlossPrediction(gloss=gloss, score=float(score))
            for gloss, score in zip(top_n_glosses, top_n_scores)
        ]
        return PredictionResponse(predictions=predictions)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Prediction error: {str(e)}')