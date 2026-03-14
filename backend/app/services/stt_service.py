from openai import AsyncOpenAI
from app.core.config import settings
import tempfile, os
import logging

logger = logging.getLogger("triageiq")

# Use Groq Whisper (free, insanely fast) if available, fallback to OpenAI
if settings.GROQ_API_KEY:
    client = AsyncOpenAI(
        api_key=settings.GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1"
    )
    STT_MODEL = "whisper-large-v3"
    STT_PROVIDER = "Groq"
else:
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    STT_MODEL = "whisper-1"
    STT_PROVIDER = "OpenAI"

logger.info(f"[TriageIQ] STT Provider: {STT_PROVIDER} ({STT_MODEL})")

async def transcribe_audio(audio_bytes: bytes, filename: str = "audio.webm") -> dict:
    """Transcribe audio using Whisper."""
    try:
        logger.info(f"[TriageIQ] Transcribing audio ({len(audio_bytes)} bytes) via {STT_PROVIDER}...")
        
        with tempfile.NamedTemporaryFile(suffix=os.path.splitext(filename)[1] or ".webm", delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        with open(tmp_path, "rb") as audio_file:
            response = await client.audio.transcriptions.create(
                model=STT_MODEL,
                file=audio_file,
                response_format="verbose_json",
            )

        os.unlink(tmp_path)
        logger.info("[TriageIQ] ✅ Audio transcription successful")

        return {
            "transcript": response.text,
            "language": getattr(response, "language", "en"),
            "duration_seconds": getattr(response, "duration", 0.0),
            "confidence": 0.95,
        }
    except Exception as e:
        logger.error(f"[TriageIQ] ❌ Transcription failed: {e}")
        return {
            "transcript": "",
            "language": "en",
            "duration_seconds": 0.0,
            "confidence": 0.0,
            "error": str(e)
        }
