# Sign Language Detection & Translation System

A comprehensive AI-powered system for real-time sign language recognition and translation. This project combines computer vision, deep learning, and natural language processing to recognize sign language gestures from video input and translate them into readable text in multiple languages.

## 🎯 Overview

This project enables users to:
- **Recognize sign language in real-time** using a webcam
- **Upload pre-recorded videos** (.mp4) for batch gesture recognition
- **Generate readable sentences** from sequential gesture predictions
- **Translate recognized text** into multiple languages (English, Sindhi, Urdu)
- **Filter and refine predictions** using confidence thresholds and duplicate detection

## 🏗️ Architecture

The system consists of three main components:

### Backend (Python/FastAPI)
- **Pose Extraction**: Uses MediaPipe to extract hand/body landmarks from video frames
- **Gesture Recognition**: TensorFlow Lite model (GISLR) predicts sign language glosses from landmarks
- **Translation Service**: Converts glosses to natural language in multiple languages

### Frontend (React + Vite)
- **Real-time Webcam Interface**: Live video feed with continuous gesture recognition
- **Video Upload Interface**: Support for uploading .mp4 files for batch processing
- **Translation Panel**: Display predictions and translated output with language selection
- **History Tracking**: Keep record of recognized sentences with timestamps

### Core Features

```
User Input (Webcam or Video Upload)
    ↓
Video Frames Extraction
    ↓
Landmark Detection (MediaPipe)
    ↓
Pose-to-Gloss Prediction (TensorFlow Lite)
    ↓
Sentence Generation (Duplicate Filtering + Confidence Thresholds)
    ↓
Language Translation
    ↓
Display to User
```

## ✨ Key Features

### 1. Real-Time Webcam Prediction
- Start/stop recording gestures from your webcam
- Continuous landmark extraction and frame analysis
- Top-5 gesture predictions with confidence scores
- Minimum duration validation (20+ frames)

### 2. Video Upload for Prediction
- Upload `.mp4` or other video formats
- Preview uploaded video before processing
- Process entire video file through the recognition pipeline
- Consistent prediction flow with webcam mode

### 3. Sentence Generation with Intelligence
The system implements smart sentence generation that:

#### Duplicate Filtering
- **Problem**: Sequential frames may predict the same gesture multiple times
- **Solution**: Removes consecutive duplicate predictions
- **Example**: `[HELLO, HELLO, HELLO, HOW, HOW, ARE, YOU]` → `[HELLO, HOW, ARE, YOU]`

#### Confidence Threshold Filtering
- **Problem**: Low-confidence predictions reduce sentence quality
- **Solution**: Only includes predictions above a configurable confidence threshold (default: 0.3)
- **Example**: With threshold 0.5:
  ```
  [HELLO (0.95), WORLD (0.25), HOW (0.88), ARE (0.45), YOU (0.92)]
  → [HELLO, HOW, YOU]
  ```

#### Sequential Processing
- Processes predictions frame-by-frame
- Maintains prediction history to detect duplicates
- Accumulates high-confidence predictions into final sentence

### 4. Multi-Language Translation
- **English**: Base language for all predictions
- **Sindhi**: Regional language translation
- **Urdu**: Regional language translation
- Real-time language switching on existing predictions

### 5. History & Output Management
- View last 10 recognized sentences with timestamps
- Copy recognized text to clipboard
- Text-to-speech synthesis of translations
- Clear history between sessions

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- FFmpeg (for video processing)
- Webcam (for real-time mode)

## 🚀 Setup Instructions

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd my-sign-language-app
   ```

2. **Create virtual environment**
   ```bash
   python -m venv .venv
   ```

3. **Activate virtual environment**
   - **Windows (PowerShell)**
     ```powershell
     .\.venv\Scripts\Activate.ps1
     ```
   - **macOS/Linux**
     ```bash
     source .venv/bin/activate
     ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Verify model files**
   - Ensure `wlasl300.h5` exists in project root
   - Ensure `label_encoder.pkl` exists in project root

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../FYP-UI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   - Frontend will run on `http://localhost:5173`

### Starting the System

**Terminal 1 - Start Backend API Server**
```bash
cd my-sign-language-app
.\.venv\Scripts\Activate.ps1  # Activate virtual environment
uvicorn serving.pose2gloss:app --host 0.0.0.0 --port 8000
```

You should see:
```
Uvicorn running on http://0.0.0.0:8000
```

**Terminal 2 - Start Frontend**
```bash
cd FYP-UI
npm run dev
```

Open `http://localhost:5173` in your browser.

## 📖 Usage Guide

### Using Webcam Mode

1. Open the app at `http://localhost:5173`
2. Navigate to the **Recognize** page
3. Click **"Use Webcam"** button
4. Click **Start Camera** to enable webcam
5. **Record a gesture**:
   - Hold a sign language gesture for 1-2 seconds
   - Click **Start Recording**
   - Click **Stop Recording** when done
6. **View results**:
   - Predicted glosses appear with confidence percentages
   - Translation appears on the right panel
   - Select language to re-translate instantly

### Using Video Upload Mode

1. On the **Recognize** page, click **"Upload Video for Prediction"**
2. **Select a video file**:
   - Supports .mp4 and other video formats
   - Video preview appears after selection
3. Click **"Run Prediction"** to process
4. System will:
   - Extract landmarks from all frames
   - Generate predictions
   - Apply sentence generation logic
   - Display translations
5. Use the same translation and history features as webcam mode

### Sentence Generation Example

**Input video with frame-by-frame predictions:**
```
Frame 1-30:  HELLO (confidence: 0.95)
Frame 31-45: HELLO (confidence: 0.92)  ← Filtered (duplicate)
Frame 46-60: HOW (confidence: 0.88)
Frame 61-75: ARE (confidence: 0.35)    ← Filtered (confidence < 0.3 threshold)
Frame 76-90: YOU (confidence: 0.93)
```

**Generated sentence after filtering:**
```
"Hello how you."
```

**Output:**
- Gesture sequence with high confidence words only
- Duplicates removed for natural flow
- Low-confidence predictions excluded
- Final sentence shown in Translation Output panel

## 🔧 How Word-to-Sentence Conversion Works

### Step 1: Landmark Extraction
```python
Video Frames → MediaPipe → Hand/Body Keypoints (60 frames × 180 points × 3 coordinates)
```

### Step 2: Pose Normalization
- Center all landmarks around the nose keypoint
- Ensures invariance to position and scale
- Applied during both extraction and prediction

### Step 3: Frame Batching
- Frames grouped into 60-frame windows
- Frames padded if fewer than 60
- Padded value: -100 (used as signal for padding)

### Step 4: Gesture Prediction
- TensorFlow Lite model processes each 60-frame window
- Outputs: Probability distribution across 300 gesture classes
- Top-N (default: 5) predictions selected
- Each prediction: `{gloss: "HELLO", score: 0.95}`

### Step 5: Sentence Generation Algorithm

```javascript
function generateSentence(predictions, confidenceThreshold = 0.3) {
  let sentence = [];
  let lastGloss = null;
  
  for (let pred of predictions) {
    // 1. Skip low-confidence predictions
    if (pred.score < confidenceThreshold) continue;
    
    // 2. Skip consecutive duplicates
    if (pred.gloss === lastGloss) continue;
    
    // 3. Add to sentence
    sentence.push(pred.gloss);
    lastGloss = pred.gloss;
  }
  
  return sentence.join(' ') + '.';
}
```

### Step 6: Language Translation
- English sentence created: `"Hello how are you."`
- User selects target language
- Translation API converts to selected language
- Result cached for instant language switching

## 📁 Project Structure

```
my-sign-language-app/
├── serving/
│   ├── pose2gloss.py          # Main FastAPI server & prediction endpoint
│   ├── extract.py              # Video landmark extraction endpoint
│   ├── translate.py            # Translation endpoint
│   └── schemas.py              # Request/response data models
├── preprocessing/
│   ├── video2landmarks.py      # Video to landmarks converter
│   └── webcam_test.py          # Webcam testing utility
├── gloss2text/
│   └── translator.py           # Language translation service
├── pose2gloss/
│   └── model_utils.py          # TensorFlow model utilities
├── frontend/
│   ├── app.py                  # Flask frontend server
│   └── components/
│       └── realtime_signer.py  # Real-time gesture recognition
├── wlasl300.h5                 # Pre-trained gesture model (300 classes)
├── label_encoder.pkl           # Gesture label encoder
├── requirements.txt            # Python dependencies
└── guide.md                    # Quick start guide
```

## 🎬 Frontend Structure

```
FYP-UI/
├── src/
│   ├── pages/
│   │   ├── Home.jsx            # Landing page
│   │   ├── Recognize.jsx       # Main recognition interface
│   │   ├── Dashboard.jsx       # Statistics & insights
│   │   └── ...
│   ├── components/
│   │   ├── WebcamFeed.jsx      # Real-time webcam component
│   │   ├── Navbar.jsx          # Navigation bar
│   │   ├── GlassCard.jsx       # Glass morphism card
│   │   └── ...
│   └── utils/
│       └── signApi.js          # Backend API wrapper
```

## 🔌 API Endpoints

### Health Check
```
GET /health
Response: { "status": "healthy" }
```

### Extract Landmarks from Video
```
POST /extract
Content-Type: multipart/form-data
Body: video file (.webm)

Response: {
  "landmarks": [[[x1, y1, z1], ...], ...],  // (frames, 180, 3)
  "frame_count": 45
}
```

### Predict Glosses from Landmarks
```
POST /predict
Content-Type: application/json
Body: {
  "landmarks": [[[x1, y1, z1], ...], ...],
  "top_n": 5
}

Response: {
  "predictions": [
    {"gloss": "HELLO", "score": 0.95},
    {"gloss": "HI", "score": 0.03},
    ...
  ]
}
```

### Translate Glosses to Text
```
POST /translate
Content-Type: application/json
Body: {
  "glosses": ["HELLO", "HOW", "ARE", "YOU"],
  "target_language": "English"
}

Response: {
  "text": "Hello how are you.",
  "language": "English"
}
```

## 🧠 Model Information

**Model**: GISLR (Gesture Isolated Sign Language Recognition)
- **Framework**: TensorFlow Lite
- **Input**: 60 frames × 180 landmarks × 3 coordinates
- **Output**: 300 gesture classes with confidence scores
- **Optimization**: Quantized for mobile/edge inference
- **Training Data**: WLASL-300 (Isolated Sign Language dataset)

## ⚙️ Configuration & Thresholds

Key configurable parameters:

| Parameter | Default | Location | Purpose |
|-----------|---------|----------|---------|
| MAX_FRAMES | 60 | serving/pose2gloss.py | Frames per gesture window |
| NUM_LANDMARKS | 180 | serving/pose2gloss.py | MediaPipe landmarks |
| CONFIDENCE_THRESHOLD | 0.3 | Frontend logic | Min prediction confidence |
| MIN_DURATION | 20 frames | WebcamFeed.jsx | Minimum gesture duration |
| TOP_N | 5 | API default | Top predictions returned |

## 🐛 Troubleshooting

### Backend won't start
```
Error: Cannot find wlasl300.h5
→ Ensure model file is in project root
```

### Camera access denied
```
Error: Camera access failed
→ Allow browser camera permissions in settings
```

### Low prediction accuracy
```
Solution: 
- Ensure good lighting
- Keep hand movements clear and distinct
- Record for 1-2 seconds per gesture
- Reduce CONFIDENCE_THRESHOLD in code
```

### Translation not working
```
Error: Translation failed
→ Check internet connection (translator uses online API)
→ Verify target_language parameter is supported
```

### GPU not being used
```
Solution:
- Ensure TensorFlow GPU is installed: pip install tensorflow[and-cuda]
- Check CUDA and cuDNN are properly installed
- Backend will auto-detect and use GPU if available
```

## 📊 Performance Metrics

- **Prediction latency**: ~200-500ms per gesture (60 frames)
- **Extraction latency**: ~100-300ms per video (MediaPipe processing)
- **Translation latency**: ~500-1000ms (API-dependent)
- **Total E2E latency**: ~1-2 seconds per gesture in production

## 🚀 Optimization Tips

1. **For Production**:
   - Use GPU-enabled TensorFlow
   - Deploy backend on dedicated server
   - Use CORS proxy for translation API
   - Cache frequent translations

2. **For Edge Devices**:
   - TensorFlow Lite already optimized
   - Consider reducing TOP_N predictions
   - Use quantized model version

3. **For Accuracy**:
   - Increase MIN_DURATION for longer gestures
   - Lower CONFIDENCE_THRESHOLD for more predictions
   - Adjust duplicate filtering logic

## 📝 License

This project is part of an academic Final Year Project (FYP).

## 👥 Contributing

For contributions or issues, please contact the development team.

## 🙏 Acknowledgments

- **WLASL Dataset**: American Sign Language Recognition Dataset
- **MediaPipe**: Real-time pose detection by Google
- **TensorFlow**: Deep learning framework by Google
- **FastAPI**: Modern Python web framework
- **React**: UI framework

## 📞 Support

For issues, questions, or suggestions:
1. Check this README and API documentation
2. Review the guide.md for quick start
3. Check backend/frontend console logs for errors
4. Ensure all dependencies are installed correctly

---

**Last Updated**: April 2026  
**Status**: Production Ready
