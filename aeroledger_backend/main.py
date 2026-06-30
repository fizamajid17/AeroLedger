from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import ingest, breach, invoice

app = FastAPI(title="AeroLedger API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingest.router)
app.include_router(breach.router)
app.include_router(invoice.router)

@app.get("/")
def root():
    return {"message": "AeroLedger API running"}