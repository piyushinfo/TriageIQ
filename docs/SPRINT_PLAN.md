# ⏱️ TriageIQ — 36-Hour Sprint Plan
### HackCrux 2026 | Syntax Squad 07 | March 14–15, LNMIIT Jaipur

---

## 👥 Role Assignments

| Member | Primary Role | Focus Area |
|---|---|---|
| **Piyush** | Frontend Lead | React Dashboard, Case Queue UI, Urgency Cards |
| **Himanshu Saini** | Frontend Dev | Input Panel, Entity Display, Charts/Visualizations |
| **Nikhil Tetarwal** | Backend Lead | FastAPI, LLM Pipeline, REST APIs |
| **Ritesh Kumar** | AI/ML Lead | NER service, Urgency Classifier, STT integration |

---

## 🗓️ Hour-by-Hour Schedule

### 🟢 PHASE 1: Setup & Foundation (Hours 0–6)
> Goal: Everyone has a running local environment. APIs reachable. No blockers.

| Time | Piyush (FE) | Himanshu (FE) | Nikhil (BE) | Ritesh (AI) |
|---|---|---|---|---|
| **H0–1** | Clone repo, `npm install`, start Next.js | Same setup | Clone repo, create venv, `pip install` | Same setup |
| **H1–2** | Build layout shell: Header + sidebar + main panel | Create urgency badge component | Wire up FastAPI with CORS, test `/health` | Implement rule-based NER (ner_service.py) |
| **H2–3** | Case queue list UI (static mock data) | Urgency color system + stat cards | Implement `/api/triage/analyze` endpoint (skeleton) | Build urgency classifier (urgency_service.py) |
| **H3–4** | Connect case queue to GET /api/triage/cases | Case detail panel layout | Wire LLM service (llm_service.py) with OpenAI | Test NER + urgency on 3 synthetic cases |
| **H4–5** | Input panel: textarea + submit button | Loading states + spinners | Full pipeline: LLM → NER → Urgency working | Fix edge cases in classifier |
| **H5–6** | 🔗 **INTEGRATION CHECKPOINT** — FE talks to BE end-to-end on 1 test case | ← same | → | → |

---

### 🟡 PHASE 2: Core Features (Hours 6–18)
> Goal: All core features working. Demo-able prototype by hour 18.

| Time | Piyush (FE) | Himanshu (FE) | Nikhil (BE) | Ritesh (AI) |
|---|---|---|---|---|
| **H6–8** | Real-time case queue refresh (polling) | Entity tags display on case card | Test all 8 synthetic cases, fix bugs | Improve urgency scoring logic |
| **H8–10** | Case detail view: summary, entities, actions | Urgency score progress bar | Add case status update endpoint (PATCH) | Add more clinical keyword rules |
| **H10–12** | Sort + filter cases by urgency | Stats bar: total/critical/high counts | Error handling & validation | Test with edge case notes |
| **H12–14** | 🍽️ **BREAK — EAT + 30min REST** | ← | → | → |
| **H14–16** | Responsive layout polish | Recharts: urgency distribution donut | Audio upload endpoint (STT service) | Whisper STT integration |
| **H16–18** | 🔗 **INTEGRATION CHECKPOINT 2** — Full demo flow works | ← | → | → |

---

### 🔴 PHASE 3: Polish & Extra Features (Hours 18–28)
> Goal: Polished demo. Bonus features if time allows.

| Time | Piyush (FE) | Himanshu (FE) | Nikhil (BE) | Ritesh (AI) |
|---|---|---|---|---|
| **H18–20** | Dark theme refinements, typography | Micro-animations on urgency cards | API docs review (FastAPI /docs) | STT → auto-fill input field |
| **H20–22** | Audio record button in input panel | Case timeline view | Performance optimization | Improve LLM prompt |
| **H22–24** | 💤 **SLEEP SHIFT A** (Piyush + Himanshu sleep, Nikhil + Ritesh continue) | ← | Continue & monitor | Continue |
| **H24–26** | 💤 **SLEEP SHIFT B** (Nikhil + Ritesh sleep, Piyush + Himanshu take over) | → | Sleep | Sleep |
| **H26–28** | Bug fixes from overnight | Dashboard QA pass | Wake up, code review | Wake up, final AI tests |

---

### 🏁 PHASE 4: Demo Prep (Hours 28–36)
> Goal: Flawless, rehearsed demo. Clean codebase. No surprises.

| Time | Task | Owner |
|---|---|---|
| **H28–30** | Full end-to-end QA with all 8 synthetic cases | All |
| **H30–31** | Prepare demo script — 5-min walkthrough | Piyush + Nikhil |
| **H31–32** | README updates, code cleanup, remove console.logs | Himanshu + Ritesh |
| **H32–33** | Rehearse demo presentation out loud | All |
| **H33–34** | Final bug fixes only | Nikhil + Ritesh |
| **H34–35** | Rest + freshen up | All |
| **H35–36** | 🎯 **DEMO TIME** | All |

---

## ✅ Minimum Viable Demo (Must Have by H18)

- [ ] Text input → API call → structured output
- [ ] Urgency level displayed (Critical/High/Medium/Low)
- [ ] Extracted entities shown (symptoms, vitals, risk flags)
- [ ] Clinical summary displayed
- [ ] Case queue sorted by urgency
- [ ] At least 3 cases in the queue simultaneously

---

## 🌟 Bonus Features (Nice to Have)

- [ ] Audio recording → Whisper STT → auto-fill input
- [ ] Case status update (Pending → In Review → Resolved)
- [ ] Urgency distribution chart (Recharts)
- [ ] "Responsible AI" disclaimer on every output

---

## 🚨 Emergency Playbook

| Problem | Solution |
|---|---|
| OpenAI API down / rate limited | Switch to Gemini API (google-generativeai) |
| LLM too slow | Use rule-based NER only — still shows urgency |
| Backend crashes | Restart: `uvicorn app.main:app --reload` |
| Frontend build fails | Revert to last working commit: `git stash` |
| Integration broken | Use hardcoded mock data on frontend to unblock |

---

## 💡 Demo Script (5 minutes)

1. **[30s]** Open dashboard — show empty case queue
2. **[60s]** Paste PT-001 (chest pain critical case) → click Analyze
3. **[60s]** Show result: CRITICAL badge, extracted entities, urgency reasons, summary
4. **[30s]** Add 2 more cases (PT-003 HIGH, PT-008 LOW) — show queue sorted
5. **[30s]** Show audio input panel (bonus)
6. **[30s]** Responsible AI statement — "TriageIQ advises, clinicians decide"
7. **[30s]** Architecture overview (if asked)

---

## 📌 Key API Endpoints for Demo

```
POST /api/triage/analyze     → Main pipeline
GET  /api/triage/cases       → Get all cases
GET  /api/triage/cases/{id}  → Get specific case
POST /api/audio/transcribe   → STT endpoint
GET  /health                 → System health check
GET  /docs                   → Swagger UI (impress judges!)
```

---

## ⚡ Git Workflow

```bash
# Each member works on their own branch
git checkout -b feature/frontend-dashboard    # Piyush
git checkout -b feature/frontend-components   # Himanshu
git checkout -b feature/backend-api           # Nikhil
git checkout -b feature/ai-pipeline           # Ritesh

# Merge to main after each integration checkpoint
git checkout main
git merge feature/backend-api
```

---

*Syntax Squad 07 — HackCrux 2026 — LNMIIT Jaipur*
*"TriageIQ doesn't replace the clinician — it gives them a superpower."*
