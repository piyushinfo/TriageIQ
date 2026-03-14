import re
from typing import List
from app.models.schemas import ExtractedEntity

# Clinical keywords for rule-based NER fallback
SYMPTOM_KEYWORDS = [
    "pain", "fever", "cough", "breathlessness", "nausea", "vomiting",
    "dizziness", "headache", "chest pain", "palpitations", "swelling",
    "fatigue", "weakness", "confusion", "bleeding", "rash", "seizure",
    "unconscious", "shortness of breath", "abdominal pain", "back pain"
]

RISK_KEYWORDS = [
    "diabetes", "hypertension", "cardiac", "heart disease", "asthma",
    "cancer", "stroke", "renal failure", "liver disease", "hiv",
    "immunocompromised", "pregnant", "elderly", "obese", "smoker",
    "alcohol", "drug", "allergy", "anaphylaxis"
]

VITAL_PATTERNS = {
    "heart_rate": r'\b(\d{2,3})\s*(?:bpm|beats per minute|hr)\b',
    "blood_pressure": r'\b(\d{2,3}\/\d{2,3})\s*(?:mmhg|bp|mm hg)?\b',
    "temperature": r'\b(\d{2,3}(?:\.\d)?)\s*(?:°f|°c|degrees|temp)\b',
    "spo2": r'\b(?:spo2|oxygen saturation|o2 sat)[:\s]*(\d{2,3})\s*%?\b',
    "respiratory_rate": r'\b(\d{1,2})\s*(?:breaths per minute|rr|resp rate)\b',
}

def extract_entities(text: str, llm_data: dict = None) -> List[ExtractedEntity]:
    """Extract clinical entities from text using spaCy + rules."""
    entities = []
    text_lower = text.lower()

    # --- Extract from LLM output if available ---
    if llm_data:
        for symptom in llm_data.get("key_symptoms", []):
            entities.append(ExtractedEntity(type="symptom", value=symptom, confidence=0.90))
        for risk in llm_data.get("risk_flags", []):
            entities.append(ExtractedEntity(type="risk_flag", value=risk, confidence=0.90))
        for vital in llm_data.get("vitals", []):
            entities.append(ExtractedEntity(type="vital", value=str(vital), confidence=0.85))
        if llm_data.get("timeline"):
            entities.append(ExtractedEntity(type="timeline", value=llm_data["timeline"], confidence=0.85))
        return entities

    # --- Rule-based fallback ---
    for symptom in SYMPTOM_KEYWORDS:
        if symptom in text_lower:
            entities.append(ExtractedEntity(type="symptom", value=symptom, confidence=0.75))

    for risk in RISK_KEYWORDS:
        if risk in text_lower:
            entities.append(ExtractedEntity(type="risk_factor", value=risk, confidence=0.75))

    for vital_name, pattern in VITAL_PATTERNS.items():
        match = re.search(pattern, text_lower)
        if match:
            entities.append(ExtractedEntity(
                type="vital",
                value=f"{vital_name}: {match.group(1)}",
                confidence=0.80
            ))

    return entities
