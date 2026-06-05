from datetime import datetime

import streamlit as st


DEFAULTS = {
    "ui_lang": "en",
    "logged_in": False,
    "current_page": "Landing",
    "role": "Signer",
    "history": [],
    "latest_prediction": "",
    "latest_predictions": [],
    "translated_text": "",
    "show_converter": False,
    "camera_open": False,
    "last_logged_word": "",
    "target_language": "English",
}


def init_state() -> None:
    for key, value in DEFAULTS.items():
        if key not in st.session_state:
            st.session_state[key] = value


def add_history(word: str) -> None:
    if not word:
        return
    st.session_state.history.insert(
        0,
        {
            "word": word,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        },
    )
    st.session_state.history = st.session_state.history[:200]
