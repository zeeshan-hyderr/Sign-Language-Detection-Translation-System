# Frontend Streamlit UI

This frontend extends the existing sign language prediction backend without changing model logic.

## Run

1. Start backend API in project root:

   uvicorn serving.pose2gloss:app --host 0.0.0.0 --port 8000

2. Install frontend dependencies:

   pip install -r frontend/requirements.txt

3. Start Streamlit app:

   streamlit run frontend/app.py

## Notes

- Real-time prediction uses a sliding frame window in the background and continuously calls the existing /predict endpoint.
- Session history is kept in Streamlit session state (no database).
- Free translation uses public endpoints (MyMemory with LibreTranslate fallback).
- The non-signer converter is embedded from:
  https://sign-kit.vercel.app/sign-kit/convert
