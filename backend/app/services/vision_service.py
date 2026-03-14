from openai import AsyncOpenAI
from app.core.config import settings
import logging

logger = logging.getLogger("triageiq")

# Instantiate Gemini using the OpenAI compatibility layer
gemini_client = None
if settings.GEMINI_API_KEY:
    gemini_client = AsyncOpenAI(
        api_key=settings.GEMINI_API_KEY,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    )

async def extract_text_from_image(base64_image: str) -> dict:
    """Use Gemini 2.5 Flash to extract text/handwriting from medical reports."""
    
    if not gemini_client:
        return {"text": "", "success": False, "error": "GEMINI_API_KEY not found in .env"}

    try:
        logger.info("[TriageIQ] Extracting text from image via Gemini (gemini-2.5-flash)...")
        response = await gemini_client.chat.completions.create(
            model="gemini-2.5-flash",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Extract all the text from this medical document or note exactly as written. Do not add any conversational filler. Only output the extracted text."},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"},
                        },
                    ],
                }
            ],
            max_tokens=2000,
            temperature=0.1
        )
        extracted_text = response.choices[0].message.content
        logger.info(f"[TriageIQ] ✅ Image text extraction successful via Gemini ({len(extracted_text)} chars)")
        return {"text": extracted_text, "success": True}
    except Exception as e:
        logger.error(f"[TriageIQ] ❌ Vision extraction failed: {e}")
        return {"text": "", "success": False, "error": str(e)}
