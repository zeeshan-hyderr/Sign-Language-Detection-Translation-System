import requests


LANG_CODE_MAP = {
    "English": "en",
    "Urdu": "ur",
    "Sindhi": "sd",
}


class FreeTranslator:
    """Simple free translator wrapper with fallbacks."""

    def __init__(self, timeout: int = 8):
        self.timeout = timeout

    def translate(self, text: str, target_language: str) -> str:
        if not text:
            return ""
        target_code = LANG_CODE_MAP.get(target_language, "en")
        if target_code == "en":
            return text

        translated = self._via_mymemory(text, target_code)
        if translated:
            return translated

        translated = self._via_libretranslate(text, target_code)
        if translated:
            return translated

        raise RuntimeError("No free translation service returned a valid response")

    def _via_mymemory(self, text: str, target_code: str) -> str:
        resp = requests.get(
            "https://api.mymemory.translated.net/get",
            params={"q": text, "langpair": f"en|{target_code}"},
            timeout=self.timeout,
        )
        resp.raise_for_status()
        data = resp.json()
        return data.get("responseData", {}).get("translatedText", "")

    def _via_libretranslate(self, text: str, target_code: str) -> str:
        resp = requests.post(
            "https://libretranslate.de/translate",
            data={
                "q": text,
                "source": "en",
                "target": target_code,
                "format": "text",
            },
            timeout=self.timeout,
        )
        resp.raise_for_status()
        data = resp.json()
        return data.get("translatedText", "")
