from fastapi import APIRouter, HTTPException
from app.api.triage import cases_store
from app.models.schemas import CaseStatus
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter()

class CaseUpdateRequest(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    notes: Optional[str] = None

@router.patch("/{case_id}")
async def update_case(case_id: str, update: CaseUpdateRequest):
    """Update case status, assignment, or notes."""
    case = cases_store.get(case_id.upper())
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")

    # Update fields on the stored TriageResult (which now has status)
    if update.status:
        case.status = update.status
    if update.assigned_to is not None:
        # Store as extra attribute (in-memory only)
        setattr(case, '_assigned_to', update.assigned_to)
    if update.notes is not None:
        setattr(case, '_notes', update.notes)

    return {"message": "Case updated", "case_id": case_id, "status": case.status}

@router.delete("/{case_id}")
async def delete_case(case_id: str):
    """Remove a resolved case."""
    if case_id.upper() not in cases_store:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")
    del cases_store[case_id.upper()]
    return {"message": f"Case {case_id} deleted"}
