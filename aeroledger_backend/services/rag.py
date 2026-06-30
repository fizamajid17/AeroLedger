import os
import io
import shutil
import pdfplumber
from dotenv import load_dotenv
from typing import List
from pydantic import BaseModel, Field
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings

load_dotenv()

FAISS_INDEX_PATH = "faiss_store/sla_index"
SLA_TEXT_PATH    = "faiss_store/sla_raw.txt"
EMBEDDING_MODEL  = "sentence-transformers/all-MiniLM-L6-v2"

def get_embeddings():
    return HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)

def sla_is_ingested() -> bool:
    return os.path.exists(FAISS_INDEX_PATH)

class VendorList(BaseModel):
    vendors: List[str] = Field(description="Every distinct vendor name exactly as written.")

def discover_vendors(raw_text: str) -> List[str]:
    llm = ChatGroq(model_name="llama-3.3-70b-versatile", temperature=0)
    structured_llm = llm.with_structured_output(VendorList)
    prompt = ChatPromptTemplate.from_template(
        "List every distinct vendor or service-provider name in this contract. Do not include the Airport itself.\n\n{raw_text}"
    )
    try:
        result = (prompt | structured_llm).invoke({"raw_text": raw_text[:4000]})
        return [v.strip() for v in result.vendors if v.strip()]
    except:
        return []

# ── The Fix: Page-Level Chunking ──────────────────────────────────────────────
def extract_pages_with_tables(file_bytes: bytes) -> List[Document]:
    docs = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for i, page in enumerate(pdf.pages):
            page_text = page.extract_text() or ""
            
            tables = page.extract_tables()
            md_tables = []
            for table in tables:
                if not table or len(table) < 2: continue
                md = "\n### TABLE ON THIS PAGE:\n"
                headers = [str(c).replace('\n', ' ').strip() if c else "" for c in table[0]]
                md += "| " + " | ".join(headers) + " |\n"
                md += "|" + "|".join(["---"] * len(headers)) + "|\n"
                for row in table[1:]:
                    row_data = [str(c).replace('\n', ' ').strip() if c else "" for c in row]
                    md += "| " + " | ".join(row_data) + " |\n"
                md_tables.append(md)
            
            # Store the ENTIRE PAGE as one chunk so tables are never orphaned
            full_content = f"--- PAGE {i+1} ---\n{page_text}\n" + "".join(md_tables)
            docs.append(Document(page_content=full_content, metadata={"page": i+1}))
    return docs

def ingest_sla(file_bytes: bytes) -> dict:
    # Completely wipe the old multi-folder faiss_store
    if os.path.exists("faiss_store"):
        shutil.rmtree("faiss_store")
    os.makedirs("faiss_store", exist_ok=True)
    
    docs = extract_pages_with_tables(file_bytes)
    
    raw_text = "\n\n".join([d.page_content for d in docs])
    with open(SLA_TEXT_PATH, "w", encoding="utf-8") as f:
        f.write(raw_text)
        
    embeddings = get_embeddings()
    vectorstore = FAISS.from_documents(docs, embeddings)
    vectorstore.save_local(FAISS_INDEX_PATH)
    
    vendors = discover_vendors(raw_text)
    
    return {"status": "success", "vendors_found": vendors, "message": "Pure RAG active (Page-level chunking)."}

def query_sla(query: str, k: int = 4) -> str:
    if not os.path.exists(FAISS_INDEX_PATH): return ""
    embeddings = get_embeddings()
    vectorstore = FAISS.load_local(FAISS_INDEX_PATH, embeddings, allow_dangerous_deserialization=True)
    docs = vectorstore.similarity_search(query, k=k)
    return "\n\n====================\n\n".join([doc.page_content for doc in docs])