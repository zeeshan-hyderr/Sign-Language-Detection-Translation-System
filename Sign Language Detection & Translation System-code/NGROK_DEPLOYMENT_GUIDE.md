# 🚀 Ngrok Deployment Guide - Sign Language Detection & Translation System

**Last Updated**: April 2026

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Deployment Strategy](#architecture--deployment-strategy)
3. [Prerequisites](#prerequisites)
4. [Installation & Setup](#installation--setup)
5. [Deployment Steps](#deployment-steps)
6. [Running on Ngrok](#running-on-ngrok)
7. [Connecting Frontend to Backend](#connecting-frontend-to-backend)
8. [Testing & Verification](#testing--verification)
9. [Troubleshooting](#troubleshooting)
10. [Advanced Configuration](#advanced-configuration)

---

## 🎯 Project Overview

This is a **Sign Language Detection & Translation System** with:
- **Frontend**: React + Vite (Real-time webcam & video upload interface)
- **Backend**: FastAPI (Sign language recognition & translation API)
- **Model**: TensorFlow Lite GISLR model for gesture recognition
- **Features**: Real-time recognition, video processing, multi-language translation

### Project Structure
```
FYP/
├── FYP-UI/                    # React Frontend (Vite)
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
└── my-sign-language-app/      # Python Backend
    ├── serving/
    │   ├── pose2gloss.py      # Main FastAPI app
    │   ├── schemas.py
    │   └── requirements.txt
    └── frontend/              # Alternative Streamlit UI
        └── requirements.txt
```

---

## 🏗️ Architecture & Deployment Strategy

### Current Architecture
```
User Browser
    ↓
React Frontend (Port 5173)
    ↓
FastAPI Backend (Port 8000)
    ↓
TensorFlow Model + MediaPipe + Translation Service
```

### Ngrok Deployment Architecture
```
External User
    ↓
Ngrok Frontend URL (https://<random>.ngrok.io)
    ↓
React Frontend (Local)
    ↓
Ngrok Backend URL (https://<random>.ngrok.io)
    ↓
FastAPI Backend (Local)
    ↓
Model & Services
```

### What Gets Exposed?
- **Backend API**: Exposed via Ngrok (so frontend can connect from anywhere)
- **Frontend**: Can remain local OR be exposed via separate Ngrok tunnel
- **Model Files**: Stay local (accessed by backend only)

---

## 📦 Prerequisites

### System Requirements
- **OS**: Windows 10/11 (or Linux/macOS)
- **RAM**: 8GB minimum (16GB recommended for TensorFlow)
- **GPU**: Optional (CUDA for faster inference)
- **Webcam**: Required for real-time features

### Software Requirements
- **Python**: 3.8 or higher
- **Node.js**: 16 or higher
- **Ngrok**: Latest version
- **Git**: For version control
- **FFmpeg**: For video processing

### Required Accounts
- **Ngrok Account**: Free account at [ngrok.com](https://ngrok.com)

---

## 🛠️ Installation & Setup

### Step 1: Download & Install Prerequisites

#### 1.1 Install Python (if not already installed)
```powershell
# Check Python version
python --version

# Should be 3.8+
```

#### 1.2 Install Node.js (if not already installed)
```powershell
# Check Node version
node --version
npm --version

# Should be 16+ for Node
```

#### 1.3 Install FFmpeg
```powershell
# Using Chocolatey (if installed)
choco install ffmpeg

# Or download from: https://ffmpeg.org/download.html
```

#### 1.4 Install Ngrok
```powershell
# Download from: https://ngrok.com/download
# Or using Chocolatey
choco install ngrok

# Verify installation
ngrok version
```

### Step 2: Authenticate Ngrok

```powershell
# Get your token from https://dashboard.ngrok.com/auth/your-authtoken
ngrok config add-authtoken <YOUR_AUTH_TOKEN>

# Verify configuration
ngrok config show
```

### Step 3: Setup Backend (FastAPI)

```powershell
# Navigate to backend directory
cd "c:\Users\Babar\Desktop\FYP\my-sign-language-app"

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Verify activation (should show (venv) prefix)
```

### Step 4: Install Backend Dependencies

```powershell
# Install serving requirements
pip install -r serving/requirements.txt

# Verify installations
pip list

# Key packages should include:
# - fastapi
# - uvicorn
# - tensorflow
# - mediapipe
# - numpy
# - pydantic
```

### Step 5: Setup Frontend (React + Vite)

```powershell
# In a new terminal/PowerShell window
cd "c:\Users\Babar\Desktop\FYP\FYP-UI"

# Install Node dependencies
npm install

# Verify installation
npm list react

# Should complete without errors
```

---

## 🚀 Deployment Steps

### Phase 1: Local Testing (Before Ngrok)

#### 1.1 Test Backend Locally

```powershell
# Terminal 1: Backend
cd "c:\Users\Babar\Desktop\FYP\my-sign-language-app"
.\venv\Scripts\Activate.ps1

# Start FastAPI server
uvicorn serving.pose2gloss:app --host 0.0.0.0 --port 8000 --reload

# Expected output:
# INFO:     Uvicorn running on http://0.0.0.0:8000
# INFO:     Application startup complete
```

#### 1.2 Test Backend API

```powershell
# Terminal 2 (new): Test endpoints
# Test health check
curl http://localhost:8000/docs

# Should open Swagger UI showing all endpoints
```

#### 1.3 Test Frontend Locally

```powershell
# Terminal 3 (new): Frontend
cd "c:\Users\Babar\Desktop\FYP\FYP-UI"

# Start development server
npm run dev

# Expected output:
# ➜  Local:   http://localhost:5173/
# ➜  press h to show help
```

#### 1.4 Verify Frontend-Backend Communication

```powershell
# In browser, visit: http://localhost:5173
# Test recognition features:
# - Try the "Recognize" page
# - Check browser console (F12) for errors
# - Should communicate with localhost:8000
```

---

### Phase 2: Expose Backend via Ngrok

#### 2.1 Start Ngrok for Backend

```powershell
# Terminal 4 (new): Ngrok for Backend
# Expose FastAPI on port 8000
ngrok http 8000

# Expected output:
# Session Status    online
# Session Expires   1h 45m 58s later
# Version           3.x.x
# Forwarding        https://abc123def456.ngrok.io -> http://localhost:8000
#
# Copy this URL: https://abc123def456.ngrok.io
```

#### 2.2 Test Ngrok Backend Connection

```powershell
# Test the ngrok backend URL (from above)
curl https://abc123def456.ngrok.io/docs

# Should return Swagger UI HTML
# You can also visit the URL in browser
```

---

### Phase 3: Configure Frontend to Use Ngrok Backend

#### 3.1 Update API Configuration

**File**: `FYP-UI\src\utils\signApi.js`

```javascript
// BEFORE (local):
// const API_URL = 'http://localhost:8000';

// AFTER (ngrok):
const API_URL = 'https://abc123def456.ngrok.io';

// Example of what to change:
export const recognizeGesture = async (landmarks) => {
    const response = await fetch(`${API_URL}/pose2gloss`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ landmarks, top_n: 5 })
    });
    return response.json();
};
```

#### 3.2 Enable CORS on Backend

**File**: `my-sign-language-app\serving\pose2gloss.py`

The CORS middleware should already be configured, but verify:

```python
# Should already have this in pose2gloss.py:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specific ngrok URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### Phase 4: Run Full Stack on Ngrok

#### 4.1 Terminal Setup

You'll need 4 PowerShell/Terminal windows:

| Terminal | Purpose | Command |
|----------|---------|---------|
| 1 | Backend API | `uvicorn serving.pose2gloss:app --host 0.0.0.0 --port 8000` |
| 2 | Frontend Dev Server | `npm run dev` (from FYP-UI) |
| 3 | Backend Ngrok | `ngrok http 8000` |
| 4 | Frontend Ngrok (optional) | `ngrok http 5173` |

#### 4.2 Start Backend

```powershell
# Terminal 1: Backend
cd "c:\Users\Babar\Desktop\FYP\my-sign-language-app"
.\venv\Scripts\Activate.ps1
uvicorn serving.pose2gloss:app --host 0.0.0.0 --port 8000 --reload

# Keep running - you should see:
# INFO:     Uvicorn running on http://0.0.0.0:8000
```

#### 4.3 Start Frontend

```powershell
# Terminal 2: Frontend
cd "c:\Users\Babar\Desktop\FYP\FYP-UI"
npm run dev

# Keep running - you should see:
# ➜  Local:   http://localhost:5173/
```

#### 4.4 Expose Backend via Ngrok

```powershell
# Terminal 3: Backend Ngrok
ngrok http 8000

# Copy the Forwarding URL (e.g., https://abc123def456.ngrok.io)
# This is your BACKEND_NGROK_URL
```

#### 4.5 (Optional) Expose Frontend via Ngrok

```powershell
# Terminal 4: Frontend Ngrok (only if you want external access)
ngrok http 5173

# Copy the Forwarding URL (e.g., https://xyz789uij012.ngrok.io)
# This is your FRONTEND_NGROK_URL
```

---

## 🔗 Connecting Frontend to Backend

### Scenario 1: Local Frontend + Ngrok Backend

**Best for**: Testing from local machine + accessing backend from anywhere

**Setup**:
1. Frontend runs on `http://localhost:5173`
2. Backend exposed via Ngrok: `https://abc123def456.ngrok.io`
3. Frontend makes requests to Ngrok URL

**Update Frontend**:

**File**: `FYP-UI/src/utils/signApi.js`
```javascript
// Set backend URL to ngrok
const API_URL = 'https://abc123def456.ngrok.io';  // Replace with your ngrok URL

export const recognizeGesture = async (landmarks) => {
    try {
        const response = await fetch(`${API_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(landmarks),
        });
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};
```

### Scenario 2: Ngrok Frontend + Ngrok Backend

**Best for**: Remote access to everything + multi-user testing

**Setup**:
1. Frontend exposed via Ngrok: `https://xyz789uij012.ngrok.io`
2. Backend exposed via Ngrok: `https://abc123def456.ngrok.io`
3. Both accessible remotely

**Update Frontend**:

Same as Scenario 1, but also:
1. Navigate to `https://xyz789uij012.ngrok.io` (not localhost)
2. Frontend will use Ngrok backend URL for API calls

**Why you might need Terminal 4**:
- Sharing with team members (send them `https://xyz789uij012.ngrok.io`)
- Testing from mobile devices on same network
- Demo to stakeholders

### Scenario 3: Using Environment Variables (Recommended)

**File**: `FYP-UI/.env.local`
```bash
VITE_API_URL=https://abc123def456.ngrok.io
```

**File**: `FYP-UI/src/utils/signApi.js`
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const recognizeGesture = async (landmarks) => {
    const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(landmarks),
    });
    return response.json();
};
```

**Update Environment**:
```powershell
# Before starting frontend:
# Add to terminal or create .env.local in FYP-UI/
$env:VITE_API_URL = "https://abc123def456.ngrok.io"

npm run dev
```

---

## ✅ Testing & Verification

### Test 1: Backend API Health Check

```powershell
# Using curl
curl https://abc123def456.ngrok.io/docs

# Expected: Swagger UI page loads
```

### Test 2: Backend API Endpoints

```powershell
# Test prediction endpoint (example with sample data)
curl -X POST "https://abc123def456.ngrok.io/predict" `
  -H "Content-Type: application/json" `
  -d '{
    "landmarks": [[[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]]],
    "top_n": 5
  }'

# Expected: JSON response with predictions
```

### Test 3: Frontend-Backend Connection

1. Open browser: `http://localhost:5173` (or Ngrok URL if exposed)
2. Navigate to **Recognize** page
3. Check browser console (F12 → Console tab)
4. Try uploading a video or using webcam
5. Verify API calls succeed (check Network tab in F12)

### Test 4: Check for CORS Errors

```
# If you see in browser console:
# "Access to XMLHttpRequest at 'https://...' has been blocked by CORS policy"

# Solution: Backend needs CORS headers
# Already configured in pose2gloss.py:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Verification Checklist

- [ ] Backend starts on port 8000 without errors
- [ ] Frontend starts on port 5173 without errors
- [ ] Ngrok backend URL is accessible in browser
- [ ] `/docs` endpoint shows Swagger UI
- [ ] Frontend loads without console errors
- [ ] API calls from frontend complete successfully
- [ ] Predictions return valid JSON
- [ ] Video upload/webcam features work
- [ ] Translation output displays correctly

---

## 🐛 Troubleshooting

### Issue 1: "Cannot reach ngrok URL"

**Symptoms**: 
```
ERR_NGROK_250
failed to get service callback
```

**Solutions**:
1. Verify ngrok is authenticated:
   ```powershell
   ngrok config show
   # Should show: authtoken: <token>
   ```

2. Restart ngrok:
   ```powershell
   ngrok http 8000 --log=stdout
   ```

3. Check if backend is actually running:
   ```powershell
   # Test local connection first
   curl http://localhost:8000/docs
   ```

### Issue 2: "CORS Error - Access Blocked"

**Symptoms**:
```
Access to XMLHttpRequest at 'https://...' blocked by CORS policy
```

**Solutions**:
1. Verify CORS middleware in backend:
   ```python
   # In serving/pose2gloss.py
   from fastapi.middleware.cors import CORSMiddleware
   
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

2. Restart backend after changes:
   ```powershell
   # Terminal 1: Kill (Ctrl+C) and restart
   uvicorn serving.pose2gloss:app --host 0.0.0.0 --port 8000 --reload
   ```

### Issue 3: "TensorFlow/Model Loading Errors"

**Symptoms**:
```
ImportError: cannot import name 'EfficientChannelAttention'
tensorflow/lite/python: cannot find model file
```

**Solutions**:
1. Verify model file exists:
   ```powershell
   Test-Path "c:\Users\Babar\Desktop\FYP\my-sign-language-app\wlasl300.h5"
   # Should return True
   ```

2. Reinstall TensorFlow:
   ```powershell
   pip uninstall tensorflow -y
   pip install tensorflow==2.18.0
   ```

3. Check Python version:
   ```powershell
   python --version  # Should be 3.8+
   ```

### Issue 4: "Port Already in Use"

**Symptoms**:
```
ERROR: Address already in use: ('0.0.0.0', 8000)
```

**Solutions**:
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or use different port
uvicorn serving.pose2gloss:app --port 8001
```

### Issue 5: "Module Not Found Errors"

**Symptoms**:
```
ModuleNotFoundError: No module named 'serving'
```

**Solutions**:
```powershell
# Ensure you're in correct directory
cd "c:\Users\Babar\Desktop\FYP\my-sign-language-app"

# Verify virtual environment is activated
# Should see (venv) prefix

# Verify requirements installed
pip list | findstr fastapi
pip list | findstr tensorflow
```

### Issue 6: "Frontend Can't Find Backend URL"

**Symptoms**:
```
Error: Failed to fetch from backend
Network timeout
```

**Solutions**:
1. Verify ngrok URL in API code:
   ```javascript
   // Check FYP-UI/src/utils/signApi.js
   const API_URL = 'https://abc123def456.ngrok.io';
   // Should match your current ngrok URL
   ```

2. After updating ngrok URL, restart frontend:
   ```powershell
   # Ctrl+C to stop dev server
   npm run dev
   ```

3. Clear browser cache:
   - Open DevTools (F12)
   - Right-click reload button → "Empty cache and hard refresh"

### Issue 7: "Video Upload Not Working"

**Symptoms**:
```
Video processing fails
500 Internal Server Error
```

**Solutions**:
1. Verify FFmpeg is installed:
   ```powershell
   ffmpeg -version
   ```

2. Check server logs for specific error
3. Test with valid MP4 file
4. Check available disk space

---

## ⚙️ Advanced Configuration

### Using Custom Domains (Ngrok Pro)

If you have Ngrok Pro subscription:

```powershell
# Use custom domain
ngrok http 8000 --domain=myapp.ngrok.io
```

### HTTPS/SSL Configuration

Ngrok automatically provides HTTPS. To verify:

```powershell
# All ngrok URLs are HTTPS
# E.g., https://abc123def456.ngrok.io
# NEVER http://
```

### Rate Limiting for API Protection

**File**: `my-sign-language-app/serving/pose2gloss.py`

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/predict")
@limiter.limit("100/minute")
async def predict(request: LandmarkRequest):
    # Your code here
    pass
```

### Logging & Monitoring

**Enable detailed logging**:

```powershell
# Backend with verbose logging
uvicorn serving.pose2gloss:app --host 0.0.0.0 --port 8000 --log-level debug

# Ngrok with verbose logging
ngrok http 8000 --log=stdout --log-level=debug
```

### Environment-Based Configuration

**File**: `FYP-UI/.env.development`
```bash
VITE_API_URL=http://localhost:8000
VITE_LOG_LEVEL=debug
```

**File**: `FYP-UI/.env.production`
```bash
VITE_API_URL=https://your-production-api.com
VITE_LOG_LEVEL=error
```

### Building Production Frontend

When ready to deploy frontend separately:

```powershell
# Build optimized version
npm run build

# Output in dist/ folder
# Deploy to static hosting (Vercel, Netlify, etc.)
```

---

## 📊 Performance Optimization

### Backend Optimization

```python
# Use GPU if available (in pose2gloss.py)
import tensorflow as tf
print("GPU Available:", tf.config.list_physical_devices('GPU'))

# Use smaller batch sizes for faster processing
MAX_BATCH_SIZE = 1
```

### Frontend Optimization

```javascript
// Add request caching
const cache = new Map();

export const recognizeGesture = async (landmarks) => {
    const key = JSON.stringify(landmarks);
    if (cache.has(key)) return cache.get(key);
    
    const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(landmarks),
    });
    const data = await response.json();
    cache.set(key, data);
    return data;
};
```

---

## 📚 Quick Reference Commands

### Backend

```powershell
# Activate venv
cd "c:\Users\Babar\Desktop\FYP\my-sign-language-app"
.\venv\Scripts\Activate.ps1

# Start backend
uvicorn serving.pose2gloss:app --host 0.0.0.0 --port 8000 --reload

# Alternative port
uvicorn serving.pose2gloss:app --port 8001
```

### Frontend

```powershell
# Navigate to frontend
cd "c:\Users\Babar\Desktop\FYP\FYP-UI"

# Start dev server
npm run dev

# Build production
npm run build

# Preview build
npm run preview
```

### Ngrok

```powershell
# Backend tunnel
ngrok http 8000

# Frontend tunnel
ngrok http 5173

# Custom port
ngrok http 9000

# Verbose logging
ngrok http 8000 --log=stdout

# Check ngrok status
ngrok status
```

---

## 🔑 Security Best Practices

1. **Restrict CORS to specific origins**:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://yourdomain.com", "https://specific.ngrok.io"],
       allow_credentials=True,
       allow_methods=["POST"],
       allow_headers=["*"],
   )
   ```

2. **Add API key authentication**:
   ```python
   from fastapi.security import HTTPBearer, HTTPAuthCredential
   
   security = HTTPBearer()
   
   @app.post("/predict")
   async def predict(request: LandmarkRequest, credentials: HTTPAuthCredential = Depends(security)):
       if credentials.credentials != "your-secret-key":
           raise HTTPException(status_code=403, detail="Invalid credentials")
       # Process request
   ```

3. **Use Ngrok IP whitelisting** (Pro feature):
   ```powershell
   ngrok http 8000 --cidr-allow=1.2.3.4/32
   ```

4. **Enable Ngrok basic auth** (Pro feature):
   ```powershell
   ngrok http 8000 --basic-auth="username:password"
   ```

---

## 📞 Support & Resources

- **Ngrok Documentation**: https://ngrok.com/docs
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **React Documentation**: https://react.dev/
- **TensorFlow Lite**: https://www.tensorflow.org/lite
- **MediaPipe**: https://mediapipe.dev/

---

## 📝 Deployment Checklist

Before going live:

- [ ] All dependencies installed (`pip list`, `npm list`)
- [ ] Backend runs without errors on `localhost:8000`
- [ ] Frontend runs without errors on `localhost:5173`
- [ ] Ngrok authenticated with valid token
- [ ] Backend Ngrok tunnel active and accessible
- [ ] Frontend updated with Ngrok backend URL
- [ ] CORS enabled on backend
- [ ] Test API endpoints via Ngrok URL
- [ ] Frontend loads and communicates with backend
- [ ] Video upload functionality works
- [ ] Webcam integration works
- [ ] Predictions return valid results
- [ ] Translation features work
- [ ] No sensitive data in code/commits
- [ ] Environment variables configured correctly

---

## 🎓 Deployment Workflow Summary

### Quick Start (< 5 minutes)

```powershell
# Terminal 1: Backend
cd "c:\Users\Babar\Desktop\FYP\my-sign-language-app"
.\venv\Scripts\Activate.ps1
uvicorn serving.pose2gloss:app --host 0.0.0.0 --port 8000

# Terminal 2: Frontend
cd "c:\Users\Babar\Desktop\FYP\FYP-UI"
npm run dev

# Terminal 3: Ngrok
ngrok http 8000
# Copy ngrok URL

# Terminal 4: Update frontend with Ngrok URL
# Edit: FYP-UI/src/utils/signApi.js
# Change: const API_URL = 'https://YOUR_NGROK_URL'

# Access:
# Local: http://localhost:5173
# Ngrok Frontend: https://your-ngrok-url.ngrok.io (if exposed)
```

---

**Version**: 1.0  
**Last Updated**: April 2026  
**Status**: ✅ Production Ready  

For questions or issues, refer to the [Troubleshooting](#troubleshooting) section above.
