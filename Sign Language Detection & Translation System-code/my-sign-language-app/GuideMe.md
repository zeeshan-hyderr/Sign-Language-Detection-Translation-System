# Terminal 1 - Start the FastAPI backend
cd my-sign-language-app
deactivate
python -m uvicorn serving.pose2gloss:app --host 0.0.0.0 --port 8000

# Terminal 2 - Start the React frontend
cd FYP-UI
npm run dev