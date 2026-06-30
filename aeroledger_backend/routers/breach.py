from fastapi import APIRouter, UploadFile, File
from services.breach_detector import detect_breaches

router = APIRouter(prefix="/breach", tags=["Breach Detection"])

@router.post("/detect")
async def detect(file: UploadFile = File(...)):
    if not file.filename.endswith(".docx"):
        return {"status": "error", "message": "Only .docx files accepted"}
    file_bytes = await file.read()
    result = detect_breaches(file_bytes)
    return result