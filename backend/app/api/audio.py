from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.stt_service import transcribe_audio

router = APIRouter()

ALLOWED_TYPES = {"audio/webm", "audio/mp4", "audio/mpeg", "audio/wav", "audio/ogg"}
MAX_SIZE_MB = 25

@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    """Transcribe uploaded audio file using Whisper."""
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported audio format: {file.content_type}")

    audio_bytes = await file.read()
    size_mb = len(audio_bytes) / (1024 * 1024)
    if size_mb > MAX_SIZE_MB:
        raise HTTPException(status_code=400, detail=f"File too large: {size_mb:.1f}MB (max {MAX_SIZE_MB}MB)")

    result = await transcribe_audio(audio_bytes, file.filename or "audio.webm")

    if "error" in result and not result["transcript"]:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {result['error']}")

    return result
