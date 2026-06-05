import sys
from pathlib import Path
_PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

from fastapi import APIRouter, UploadFile, File, HTTPException
from preprocessing.video2landmarks import VideoLandmarksExtractor
import tempfile
import os
import numpy as np

router = APIRouter()

# Expensive to initialize — instantiate once at module level
extractor = VideoLandmarksExtractor()


@router.post('/extract')
async def extract_video(video: UploadFile = File(...)):
    tmp_path = None
    try:
        # Save upload to a tempfile with .webm suffix
        tmp_file = tempfile.NamedTemporaryFile(suffix='.webm', delete=False)
        tmp_path = tmp_file.name
        try:
            content = await video.read()
            tmp_file.write(content)
        finally:
            tmp_file.close()

        # Extract landmarks (returns (landmarks, width, height, fps))
        result = extractor.extract_video_landmarks(tmp_path)
        if result is None or result[0] is None:
            raise HTTPException(status_code=422, detail='No landmarks could be extracted from the video')
        landmarks, width, height, fps = result

        # Normalisation: nose-centering to match serving/predict pipeline.
        # Use slice [49:50] to preserve dimensions for broadcasting.
        try:
            landmarks = np.array(landmarks, dtype=np.float32)
            nose_center = landmarks[:, 49:50, :]
            landmarks = landmarks - nose_center
        except Exception:
            # If anything goes wrong, fall back to raw landmarks (will be handled by caller)
            pass

        return {"landmarks": landmarks.tolist(), "frame_count": len(landmarks)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Extraction error: {str(e)}')

    finally:
        # Ensure tempfile is removed
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass
