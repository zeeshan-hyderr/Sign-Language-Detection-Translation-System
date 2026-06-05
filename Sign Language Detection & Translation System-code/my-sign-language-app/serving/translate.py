import sys
from pathlib import Path
_PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from frontend.services.translation_service import FreeTranslator

router = APIRouter()

# Expensive translator initialization — instantiate once
translator = FreeTranslator()


class TranslateRequest(BaseModel):
    glosses: List[str]
    target_language: str = "English"


@router.post('/translate')
async def translate(req: TranslateRequest):
    try:
        # Simple English sentence: capitalize each word, join with spaces, add a period
        english_sentence = ' '.join([g.capitalize() for g in req.glosses]).strip()
        if not english_sentence.endswith('.'):
            english_sentence = english_sentence + '.' if english_sentence else '.'

        if req.target_language == 'English':
            return {"text": english_sentence, "language": "English"}

        translated = translator.translate(english_sentence, req.target_language)
        return {"text": translated, "language": req.target_language}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Translation error: {e}')
