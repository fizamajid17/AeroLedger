from fastapi import APIRouter
from fastapi.responses import FileResponse
from utils.pdf_generator import generate_invoice_pdf
import os

router = APIRouter(prefix="/invoice", tags=["Invoice"])

@router.post("/generate")
async def generate_invoice(breach_result: dict):
    filepath = generate_invoice_pdf(breach_result)
    return FileResponse(
        path=filepath,
        media_type="application/pdf",
        filename=os.path.basename(filepath)
    )