from typing import Tuple, List
from app.models.schemas import UrgencyLevel, ExtractedEntity

# Critical red flags — immediate attention required
CRITICAL_FLAGS = [
    "chest pain", "cardiac arrest", "heart attack", "stroke", "unconscious",
    "not breathing", "severe bleeding", "anaphylaxis", "sepsis",
    "respiratory failure", "airway obstruction", "altered consciousness",
    "seizure", "severe allergic reaction", "spo2", "oxygen saturation"
]

HIGH_FLAGS = [
    "difficulty breathing", "shortness of breath", "high fever", "severe pain",
    "vomiting blood", "head injury", "fracture", "severe headache",
    "confusion", "disorientation", "high blood pressure", "diabetic",
    "palpitations", "chest tightness", "sudden weakness"
]

MEDIUM_FLAGS = [
    "fever", "moderate pain", "nausea", "vomiting", "dizziness",
    "abdominal pain", "back pain", "rash", "swelling", "fatigue",
    "cough", "sore throat", "ear pain", "urinary symptoms"
]

def classify_urgency(
    text: str,
    entities: List[ExtractedEntity],
    llm_data: dict = None
) -> Tuple[UrgencyLevel, float, List[str]]:
    """
    Classify urgency level based on extracted entities and text.
    Returns: (UrgencyLevel, score 0-1, list of reasons)
    """
    text_lower = text.lower()
    reasons = []
    score = 0.0

    # Check risk flags from LLM
    risk_flags = []
    if llm_data:
        risk_flags = [f.lower() for f in llm_data.get("risk_flags", [])]

    # Check for CRITICAL indicators
    for flag in CRITICAL_FLAGS:
        if flag in text_lower or any(flag in r for r in risk_flags):
            reasons.append(f"Critical indicator: {flag}")
            score = max(score, 0.90)

    # Check spo2 / oxygen levels
    import re
    spo2_match = re.search(r'spo2[:\s]*(\d{2,3})', text_lower)
    if spo2_match:
        spo2 = int(spo2_match.group(1))
        if spo2 < 90:
            reasons.append(f"SpO2 critically low: {spo2}%")
            score = max(score, 0.95)
        elif spo2 < 95:
            reasons.append(f"SpO2 low: {spo2}%")
            score = max(score, 0.75)

    # Check HIGH indicators
    if score < 0.80:
        for flag in HIGH_FLAGS:
            if flag in text_lower:
                reasons.append(f"High priority indicator: {flag}")
                score = max(score, 0.65)

    # Check MEDIUM indicators
    if score < 0.60:
        for flag in MEDIUM_FLAGS:
            if flag in text_lower:
                reasons.append(f"Medium priority indicator: {flag}")
                score = max(score, 0.40)

    # Entity-based scoring
    entity_types = [e.type for e in entities]
    risk_count = entity_types.count("risk_flag") + entity_types.count("risk_factor")
    symptom_count = entity_types.count("symptom")

    if risk_count >= 3:
        score = max(score, 0.70)
        reasons.append(f"Multiple risk factors present: {risk_count}")
    if symptom_count >= 5:
        score = max(score, 0.55)
        reasons.append(f"Multiple symptoms: {symptom_count}")

    # Default to LOW if nothing detected
    if score == 0.0:
        score = 0.15
        reasons.append("No high-priority indicators detected")

    # Map score to level
    if score >= 0.80:
        level = UrgencyLevel.CRITICAL
    elif score >= 0.60:
        level = UrgencyLevel.HIGH
    elif score >= 0.35:
        level = UrgencyLevel.MEDIUM
    else:
        level = UrgencyLevel.LOW

    return level, round(score, 2), reasons[:5]  # cap reasons at 5
