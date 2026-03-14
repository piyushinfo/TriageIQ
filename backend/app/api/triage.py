from fastapi import APIRouter, HTTPException
from app.models.schemas import TriageRequest, TriageResult, UrgencyLevel
from app.services.llm_service import summarize_patient_note
from app.services.ner_service import extract_entities
from app.services.urgency_service import classify_urgency
from datetime import datetime
import uuid, time

router = APIRouter()

# In-memory case store for demo (replace with DB in production)
cases_store: dict = {}

@router.post("/analyze", response_model=TriageResult)
async def analyze_patient_note(request: TriageRequest):
    """
    Full triage pipeline:
    1. LLM summarization
    2. NER entity extraction
    3. Urgency classification
    """
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Patient note text cannot be empty")

    start_time = time.time()
    case_id = str(uuid.uuid4())[:8].upper()

    # Step 1: LLM summarization
    llm_data = await summarize_patient_note(request.text)

    # Step 2: NER extraction
    entities = extract_entities(request.text, llm_data)

    # Step 3: Urgency classification
    urgency, score, reasons = classify_urgency(request.text, entities, llm_data)

    processing_ms = int((time.time() - start_time) * 1000)

    result = TriageResult(
        case_id=case_id,
        patient_id=request.patient_id or f"PT-{case_id}",
        original_text=request.text,
        summary=llm_data.get("summary", "Summary unavailable"),
        entities=entities,
        urgency=urgency,
        urgency_score=score,
        urgency_reasons=reasons,
        recommended_actions=llm_data.get("recommended_actions", []),
        timestamp=datetime.utcnow(),
        processing_time_ms=processing_ms,
        status="pending",
    )

    # Store in memory
    cases_store[case_id] = result
    return result


@router.get("/cases")
async def get_all_cases():
    """Return all triaged cases sorted by urgency."""
    urgency_order = {
        UrgencyLevel.CRITICAL: 0,
        UrgencyLevel.HIGH: 1,
        UrgencyLevel.MEDIUM: 2,
        UrgencyLevel.LOW: 3,
    }
    sorted_cases = sorted(
        cases_store.values(),
        key=lambda c: (urgency_order.get(c.urgency, 4), -c.urgency_score)
    )
    return {"cases": sorted_cases, "total": len(sorted_cases)}


@router.get("/cases/{case_id}", response_model=TriageResult)
async def get_case(case_id: str):
    """Get a specific case by ID."""
    case = cases_store.get(case_id.upper())
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")
    return case
