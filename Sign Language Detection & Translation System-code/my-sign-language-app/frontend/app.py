import os
import sys
from pathlib import Path

import requests
import streamlit as st
import streamlit.components.v1 as components
from streamlit_autorefresh import st_autorefresh
from streamlit_webrtc import WebRtcMode, webrtc_streamer


PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from frontend.components.realtime_signer import RealTimeSignProcessor
from frontend.services.localization import t
from frontend.services.session_store import add_history, init_state
from frontend.services.translation_service import FreeTranslator


API_BASE_URL = os.getenv("SIGN_API_URL", "http://127.0.0.1:8000")
SIGN_CONVERTER_URL = "https://sign-kit.vercel.app/sign-kit/convert"

PAGE_KEYS = [
    "Landing",
    "Login",
    "Signup",
    "Dashboard",
    "Signer Page",
    "Non-Signer Page",
    "Session History",
]


def apply_css() -> None:
    css_file = Path(__file__).parent / "assets" / "styles.css"
    st.markdown(f"<style>{css_file.read_text(encoding='utf-8')}</style>", unsafe_allow_html=True)


@st.cache_data(ttl=6)
def api_is_alive(base_url: str) -> bool:
    try:
        response = requests.get(f"{base_url}/health", timeout=2)
        return response.status_code == 200
    except Exception:
        return False


def set_page(page: str) -> None:
    st.session_state.current_page = page
    st.rerun()


def show_header(lang: str) -> None:
    st.markdown(
        f"""
        <div class='panel-card' style='display:flex;justify-content:space-between;align-items:center;'>
            <h3 style='margin:0'>{t(lang, 'app_name')}</h3>
            <span class='badge'>{'LIVE' if api_is_alive(API_BASE_URL) else 'OFFLINE'}</span>
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_landing(lang: str) -> None:
    st.markdown(
        f"""
        <div class='hero-card'>
            <h1 class='page-title'>{t(lang, 'landing_title')}</h1>
            <p class='small-note'>{t(lang, 'landing_subtitle')}</p>
            <div class='feature-grid'>
                <div class='feature-cell'>{t(lang, 'landing_feature_1')}</div>
                <div class='feature-cell'>{t(lang, 'landing_feature_2')}</div>
                <div class='feature-cell'>{t(lang, 'landing_feature_3')}</div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    col1, col2 = st.columns(2)
    with col1:
        if st.button(t(lang, "get_started"), use_container_width=True):
            set_page("Login")
    with col2:
        if st.button(t(lang, "watch_demo"), use_container_width=True):
            set_page("Signer Page")


def render_login(lang: str) -> None:
    st.markdown(f"## {t(lang, 'login')}")
    st.caption(t(lang, "auth_hint"))
    with st.form("login_form", clear_on_submit=False):
        st.text_input(t(lang, "email"), key="login_email")
        st.text_input(t(lang, "password"), type="password", key="login_password")
        submitted = st.form_submit_button(t(lang, "submit_login"), use_container_width=True)
    if submitted:
        st.session_state.logged_in = True
        st.session_state.current_page = "Dashboard"
        st.success(t(lang, "login_success"))
        st.rerun()


def render_signup(lang: str) -> None:
    st.markdown(f"## {t(lang, 'signup')}")
    with st.form("signup_form", clear_on_submit=False):
        st.text_input(t(lang, "full_name"), key="signup_name")
        st.text_input(t(lang, "email"), key="signup_email")
        st.text_input(t(lang, "password"), type="password", key="signup_password")
        st.text_input(t(lang, "confirm_password"), type="password", key="signup_confirm_password")
        role = st.radio(t(lang, "role"), [t(lang, "signer"), t(lang, "non_signer")], horizontal=True)
        submitted = st.form_submit_button(t(lang, "submit_signup"), use_container_width=True)
    if submitted:
        st.session_state.role = "Signer" if role == t(lang, "signer") else "Non-Signer"
        st.session_state.logged_in = True
        st.session_state.current_page = "Dashboard"
        st.success(t(lang, "account_created"))
        st.rerun()


def render_dashboard(lang: str) -> None:
    history = st.session_state.history
    latest = history[0]["word"] if history else "-"
    st.markdown(f"## {t(lang, 'dashboard')}")
    c1, c2, c3 = st.columns(3)
    c1.markdown(f"<div class='metric-card'><h3>{len(history)}</h3><p>{t(lang, 'sessions')}</p></div>", unsafe_allow_html=True)
    c2.markdown(f"<div class='metric-card'><h3>{len(history)}</h3><p>{t(lang, 'recognized_signs')}</p></div>", unsafe_allow_html=True)
    c3.markdown(f"<div class='metric-card'><h3>{latest}</h3><p>{t(lang, 'latest_word')}</p></div>", unsafe_allow_html=True)

    st.markdown(f"### {t(lang, 'dashboard_summary')}")
    st.dataframe(history[:10], use_container_width=True, hide_index=True)


def render_signer_page(lang: str) -> None:
    st.markdown(f"## {t(lang, 'signer_page')}")
    if api_is_alive(API_BASE_URL):
        st.success(t(lang, "api_status_ok"))
    else:
        st.error(t(lang, "api_status_fail"))
    st.caption(t(lang, "instant_note"))

    control_left, control_right = st.columns(2)
    with control_left:
        if st.button(t(lang, "open_camera"), use_container_width=True):
            st.session_state.camera_open = True
    with control_right:
        if st.button(t(lang, "close_camera"), use_container_width=True):
            st.session_state.camera_open = False

    st.markdown(f"### {t(lang, 'camera_feed')}")

    webrtc_ctx = webrtc_streamer(
        key="signer-camera",
        mode=WebRtcMode.SENDRECV,
        desired_playing_state=st.session_state.camera_open,
        media_stream_constraints={"video": True, "audio": False},
        video_processor_factory=lambda: RealTimeSignProcessor(api_url=f"{API_BASE_URL}/predict"),
        async_processing=True,
    )

    latest_predictions = []
    latest_word = ""
    latest_score = 0.0

    if webrtc_ctx and webrtc_ctx.video_processor:
        state = webrtc_ctx.video_processor.get_state()
        latest_word = state.get("latest_word", "")
        latest_score = state.get("latest_score", 0.0)
        latest_predictions = state.get("latest_predictions", [])
        st.session_state.latest_prediction = latest_word
        st.session_state.latest_predictions = latest_predictions

        if latest_word and latest_word != st.session_state.last_logged_word:
            add_history(latest_word)
            st.session_state.last_logged_word = latest_word

    pred_col, trans_col = st.columns([1, 1])

    with pred_col:
        st.markdown(f"### {t(lang, 'realtime_prediction')}")
        st.markdown(
            f"<div class='prediction-box'><h3>{latest_word or '-'} </h3><p class='small-note'>{t(lang, 'score_label')}: {latest_score:.4f}</p></div>",
            unsafe_allow_html=True,
        )

        st.markdown(f"### {t(lang, 'top_predictions')}")
        if latest_predictions:
            st.dataframe(latest_predictions, use_container_width=True, hide_index=True)
        else:
            st.info(t(lang, "waiting_predictions"))

    with trans_col:
        st.markdown(f"### {t(lang, 'translate')}")
        st.session_state.target_language = st.selectbox(
            t(lang, "language_choice"),
            ["English", "Urdu", "Sindhi"],
            index=["English", "Urdu", "Sindhi"].index(st.session_state.target_language),
        )

        if st.button(t(lang, "translate"), use_container_width=True):
            try:
                translator = FreeTranslator()
                st.session_state.translated_text = translator.translate(
                    st.session_state.latest_prediction,
                    st.session_state.target_language,
                )
            except Exception:
                st.error(t(lang, "translator_failed"))

        st.markdown(f"### {t(lang, 'translated_text')}")
        st.markdown(
            f"<div class='prediction-box'><p>{st.session_state.translated_text or '-'}</p></div>",
            unsafe_allow_html=True,
        )


def render_non_signer_page(lang: str) -> None:
    st.markdown(f"## {t(lang, 'non_signer_page')}")
    st.caption(t(lang, "converter_caption"))
    if st.button(t(lang, "open_converter"), use_container_width=True):
        st.session_state.show_converter = True

    st.link_button(t(lang, "converter_link"), SIGN_CONVERTER_URL)

    if st.session_state.show_converter:
        components.iframe(SIGN_CONVERTER_URL, height=820, scrolling=True)


def render_history_page(lang: str) -> None:
    st.markdown(f"## {t(lang, 'history_title')}")
    if not st.session_state.history:
        st.info(t(lang, "no_history"))
        return

    rows = [
        {t(lang, "predicted_word"): item["word"], t(lang, "timestamp"): item["timestamp"]}
        for item in st.session_state.history
    ]
    st.dataframe(rows, use_container_width=True, hide_index=True)


def sidebar_navigation(lang: str) -> None:
    st.sidebar.markdown(f"## {t(lang, 'app_name')}")

    is_sindhi = st.sidebar.toggle(t(lang, "language_toggle"), value=(lang == "sd"))
    st.session_state.ui_lang = "sd" if is_sindhi else "en"
    lang = st.session_state.ui_lang

    pages = ["Landing", "Login", "Signup", "Dashboard", "Signer Page", "Non-Signer Page", "Session History"]

    page_label_map = {
        "Landing": t(lang, "landing_page"),
        "Login": t(lang, "login"),
        "Signup": t(lang, "signup"),
        "Dashboard": t(lang, "dashboard"),
        "Signer Page": t(lang, "signer_page"),
        "Non-Signer Page": t(lang, "non_signer_page"),
        "Session History": t(lang, "history_page"),
    }
    reverse = {v: k for k, v in page_label_map.items()}

    selected_label = st.sidebar.radio(
        t(lang, "navigation"),
        [page_label_map[p] for p in pages],
        index=max(0, pages.index(st.session_state.current_page)) if st.session_state.current_page in pages else 0,
    )
    st.session_state.current_page = reverse[selected_label]

    if st.session_state.logged_in and st.sidebar.button(t(lang, "logout"), use_container_width=True):
        st.session_state.logged_in = False
        st.session_state.current_page = "Landing"
        st.rerun()


def main() -> None:
    st.set_page_config(page_title="Sigdhi-Sign Connect", page_icon="", layout="wide")
    init_state()
    apply_css()

    lang = st.session_state.ui_lang
    sidebar_navigation(lang)
    lang = st.session_state.ui_lang

    show_header(lang)

    current_page = st.session_state.current_page

    if current_page == "Landing":
        render_landing(lang)
    elif current_page == "Login":
        render_login(lang)
    elif current_page == "Signup":
        render_signup(lang)
    elif current_page == "Dashboard":
        render_dashboard(lang)
    elif current_page == "Signer Page":
        render_signer_page(lang)
    elif current_page == "Non-Signer Page":
        render_non_signer_page(lang)
    elif current_page == "Session History":
        render_history_page(lang)
    elif current_page in PAGE_KEYS:
        st.info(t(lang, "page_loaded"))


if __name__ == "__main__":
    main()
