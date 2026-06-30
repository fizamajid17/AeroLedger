from fastapi import APIRouter, UploadFile, File
from services.rag import ingest_sla

router = APIRouter(prefix="/ingest", tags=["Ingest"])

@router.post("/sla")
async def upload_sla(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        return {"status": "error", "message": "Only PDF files accepted"}
    file_bytes = await file.read()
    result = ingest_sla(file_bytes)
    return result