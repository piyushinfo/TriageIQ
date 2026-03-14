from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.vision_service import extract_text_from_image
import base64

router = APIRouter()

ALLOWED_IMAGES = {"image/jpeg", "image/png", "image/jpg", "image/webp"}
MAX_SIZE_MB = 10

@router.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    """Upload an image of a medical report to extract text."""
    if file.content_type not in ALLOWED_IMAGES:
        raise HTTPException(status_code=400, detail=f"Unsupported image format: {file.content_type}")
        
    image_bytes = await file.read()
    size_mb = len(image_bytes) / (1024 * 1024)
    if size_mb > MAX_SIZE_MB:
        raise HTTPException(status_code=400, detail=f"File too large: {size_mb:.1f}MB (max {MAX_SIZE_MB}MB)")

    # Convert to base64 for the Vision API
    base64_img = base64.b64encode(image_bytes).decode('utf-8')
    
    result = await extract_text_from_image(base64_img)
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {result.get('error')}")
        
    return result
