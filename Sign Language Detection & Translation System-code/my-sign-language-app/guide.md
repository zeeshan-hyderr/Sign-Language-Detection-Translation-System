Terminal 1 — Start the API Server
bashcd D:\my-sign-language-app
uvicorn serving.pose2gloss:app --host 0.0.0.0 --port 8000


Terminal 2 — Start the Webcam
bashcd D:\my-sign-language-app
python webcam_test.py