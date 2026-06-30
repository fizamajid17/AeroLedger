# AeroLedger ✈️

**Aviation Vendor Contract & SLA Management System**

From contract upload to penalty invoice — fully automated.

---

## The Problem

Airports lose real money every month because vendor contracts go unmanaged:

- **Contracts Buried** — PDF files sit in legal folders. Nobody reads SLA terms regularly.
- **Breaches Undetected** — SLA violations happen daily but go unnoticed for weeks or months.
- **Penalties Uncollected** — Penalty clauses exist in every contract, but fines are almost never charged.
- **Bad Renewals** — Underperforming vendors auto-renew because no one checked the data.

**Example:** A contract requires baggage delivery within 30 minutes of landing, with a $150 fine per breach. In one month, 43 breaches occurred — $6,450 lost, completely unnoticed, and the contract auto-renewed anyway. AeroLedger catches this automatically.

---

## How It Works

A 5-phase automated lifecycle:

1. **Ingest** — Upload a contract PDF → AI extracts SLA terms, penalties, and dates
2. **Track** — Daily performance is measured against the SLA threshold for a live compliance score
3. **Detect** — When a threshold is breached, it's logged with a timestamp and flight number
4. **Calculate** — Breaches × penalty clause = an invoice PDF is auto-generated
5. **Renew** — A 90-day alert plus a 12-month score drives a Renew / Renegotiate / Replace recommendation

---

## AI Contract Intelligence (RAG)

AeroLedger uses Retrieval-Augmented Generation to turn raw legal language into structured data.

**Raw contract text:**
> "The ground handling service provider shall ensure that all passenger baggage is delivered to the baggage reclaim belt within thirty (30) minutes of aircraft block-on time. Failure to meet this standard shall attract a penalty of USD 150 per occurrence..."

**Structured output:**
```json
{
  "sla_metric": "baggage delivery time",
  "threshold": "30 minutes",
  "measurement_start": "aircraft block-on time",
  "penalty_per_breach": "$150",
  "penalty_type": "per occurrence"
}
```

The RAG pipeline understands meaning, not just keywords — phrasings like "thirty (30) minutes," "half hour," and "1800 seconds" all extract identically. Per-vendor metadata tagging keeps each vendor's clauses isolated, preventing cross-vendor data bleed in retrieval.

---

## Who It's For

| Role | Access Level | Capabilities |
|------|---------------|---------------|
| **Contracts Manager** (Airport) | Airport-side | Upload & manage contracts, view live SLA scores, receive breach alerts, generate penalty invoices, make data-driven renewal decisions |
| **Vendor** (Ground Handler) | Vendor-side | View own performance score, breach count & penalty total, renewal risk status, raise disputes, monthly scorecard access |
| **Admin** | Platform-level | Monitor all airports at once, cross-airport vendor comparisons, platform-wide analytics, user & permission management, system health monitoring |

---

## Core Modules

- **Contract Vault** — Upload PDFs; AI auto-extracts SLA terms, penalties, and dates
- **SLA Dashboard** — Live compliance scores per vendor (Green / Yellow / Red)
- **Breach Logger** — Auto-detects every SLA violation with flight-level evidence
- **Penalty Engine** — Reads the penalty clause, calculates the fine, generates a PDF invoice
- **Renewal Tracker** — 90-day alerts plus performance-based renewal recommendations
- **Analytics Dashboard** — 12-month trends, worst performers, money recovered

---

## Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| Frontend | React (Vite) + Recharts | Component-based UI, real-time dashboards, SLA charts |
| Backend | FastAPI (Python) | Async, auto-generated API docs, handles the RAG pipeline |
| Database | PostgreSQL | Relational structure links vendors, contracts, and breaches |
| AI / RAG | LangChain + FAISS + Groq | Contract reading, SLA extraction, intelligent parsing |
| PDF Processing | pdfplumber + ReportLab | Extract contract text, generate penalty invoices |
| Auth | JWT Tokens (RBAC) | Managers, Vendors, and Admins each see only their own data |

---

## Project Structure

```
AeroLedger/
├── aeroledger-frontend/   # React + Vite frontend
└── aeroledger_backend/    # FastAPI backend (RAG, FAISS, breach detection, invoicing)
```

---

## Getting Started

### Backend

```bash
cd aeroledger_backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# add your own .env with GROQ_API_KEY and DATABASE_URL
uvicorn main:app --reload
```

### Frontend

```bash
cd aeroledger-frontend
npm install
npm run dev
```

> **Note:** `.env` files are excluded via `.gitignore` and must be created locally with your own API keys and database URL — they are never committed to this repository.

---

## Business Value

Airports lose real money every month from undetected breaches and uncollected penalties. AeroLedger automates the entire contract-to-cash cycle — AI contract reading, breach detection, penalty calculation, and renewal intelligence — turning unrecovered fines into reportable savings.

---

*Internal product — v1.0*
