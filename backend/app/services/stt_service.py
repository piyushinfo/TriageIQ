from openai import AsyncOpenAI
from app.core.config import settings
import tempfile, os

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

async def transcribe_audio(audio_bytes: bytes, filename: str = "audio.webm") -> dict:
    """Transcribe audio using OpenAI Whisper."""
    try:
        with tempfile.NamedTemporaryFile(suffix=os.path.splitext(filename)[1], delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        with open(tmp_path, "rb") as audio_file:
            response = await client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="verbose_json",
            )

        os.unlink(tmp_path)

        return {
            "transcript": response.text,
            "language": getattr(response, "language", "en"),
            "duration_seconds": getattr(response, "duration", 0.0),
            "confidence": 0.90,
        }
    except Exception as e:
        return {
            "transcript": "",
            "language": "en",
            "duration_seconds": 0.0,
            "confidence": 0.0,
            "error": str(e)
        }
