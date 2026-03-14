# 🏥 TriageIQ — AI-Powered Intelligent Triage & Decision Support System

> **HackCrux 2026 | Build with AI Series | Syntax Squad 07**
> LNMIIT, Jaipur | Problem Statement 2

---

## 👥 Team — Syntax Squad 07
| Member | Role |
|---|---|
| Piyush | Frontend — React Dashboard & UI |
| Himanshu Saini | Frontend — Components & Visualization |
| Nikhil Tetarwal | Backend — FastAPI & LLM Pipeline |
| Ritesh Kumar | AI/ML — NER, Urgency Classifier & STT |

---

## 🧠 What is TriageIQ?

TriageIQ is a clinical information assistant that:
- Converts **unstructured patient text/audio** into structured summaries
- Extracts **symptoms, timelines, risk indicators** using NLP/NER
- **Classifies urgency** (Critical / High / Medium / Low)
- Displays a **real-time dashboard** for clinicians to prioritize cases

> TriageIQ does NOT automate medical decisions — it empowers clinicians with structured information.

---

## 🏗️ Architecture

```
Input (Text/Audio)
      │
      ▼
[Speech-to-Text]  ←  Whisper API
      │
      ▼
[LLM Summarization]  ←  GPT-4o / Gemini
      │
      ▼
[NER Extraction]  ←  spaCy / HuggingFace
      │
      ▼
[Urgency Classifier]  ←  Scikit-learn / Transformers
      │
      ▼
[React Dashboard]  ←  Case Queue + Structured Card
```

---

## 🛠️ Tech Stack

**Frontend:** React.js + Next.js, Tailwind CSS, Recharts
**Backend:** Python 3.11+, FastAPI, Pydantic
**AI/NLP:** OpenAI GPT-4o, spaCy, Whisper STT
**ML:** Scikit-learn, HuggingFace Transformers
**Database:** PostgreSQL (SQLite for dev)
**Infra:** Docker, GitHub Actions

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Add your API keys
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### Full Stack (Docker)
```bash
docker-compose up --build
```

---

## 📁 Project Structure

```
triageiq/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── api/
│   │   │   ├── triage.py        # Triage endpoints
│   │   │   ├── cases.py         # Case management
│   │   │   └── audio.py         # STT endpoints
│   │   ├── core/
│   │   │   ├── config.py        # Settings & env vars
│   │   │   └── database.py      # DB connection
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic models
│   │   └── services/
│   │       ├── llm_service.py   # LLM summarization
│   │       ├── ner_service.py   # NER extraction
│   │       ├── urgency_service.py # Urgency classifier
│   │       └── stt_service.py   # Speech-to-text
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/       # Main dashboard views
│   │   │   ├── triage/          # Triage input & output
│   │   │   └── shared/          # Reusable components
│   │   ├── pages/               # Next.js pages
│   │   ├── hooks/               # Custom React hooks
│   │   └── utils/               # Helpers & API calls
│   └── package.json
├── data/
│   └── synthetic/               # Synthetic patient data
├── docs/
├── docker-compose.yml
└── README.md
```

---

## 🔑 Environment Variables

**Backend `.env`:**
```
OPENAI_API_KEY=your_key_here
DATABASE_URL=sqlite:///./triageiq.db
SECRET_KEY=your_secret_key
ENVIRONMENT=development
```

**Frontend `.env.local`:**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📊 Demo Flow

1. Clinician pastes patient intake note OR records audio
2. TriageIQ extracts: symptoms, vitals, history, risk flags
3. Urgency level assigned: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low
4. Structured case card appears on dashboard
5. Cases sorted by urgency for quick prioritization

---

## ⚖️ Responsible AI

- Human-in-the-loop: all outputs are advisory only
- Synthetic data only — no real PHI/PII
- Explainable outputs: urgency scores include evidence
- Bias auditing across demographics

---

*Built with ❤️ at HackCrux 2026 — LNMIIT, Jaipur*
