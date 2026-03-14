from pydantic import BaseModel
from typing import List, Optional
from enum import Enum
from datetime import datetime

class UrgencyLevel(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class ExtractedEntity(BaseModel):
    type: str           # symptom, vital, medication, risk_factor, timeline
    value: str
    confidence: float

class TriageRequest(BaseModel):
    text: str
    patient_id: Optional[str] = None
    source: Optional[str] = "text"  # text | audio_transcribed

class TriageResult(BaseModel):
    case_id: str
    patient_id: Optional[str] = None
    original_text: str
    summary: str
    entities: List[ExtractedEntity]
    urgency: UrgencyLevel
    urgency_score: float        # 0.0 - 1.0
    urgency_reasons: List[str]  # why this urgency was assigned
    recommended_actions: List[str]
    timestamp: datetime
    processing_time_ms: int
    status: Optional[str] = "pending"  # pending | in_review | resolved

class CaseStatus(str, Enum):
    PENDING = "pending"
    IN_REVIEW = "in_review"
    RESOLVED = "resolved"

class Case(BaseModel):
    case_id: str
    triage: TriageResult
    status: CaseStatus = CaseStatus.PENDING
    assigned_to: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

class AudioTranscribeRequest(BaseModel):
    # For JSON-based requests; multipart handled separately
    language: Optional[str] = "en"

class TranscribeResult(BaseModel):
    transcript: str
    language: str
    duration_seconds: float
    confidence: float
