from typing import Tuple, List, Optional
from app.models.schemas import UrgencyLevel, ExtractedEntity
import re

# ═══════════════════════════════════════════════
# Urgency Classification Engine
# PRIMARY: AI (GPT-4o) decision
# FALLBACK: Keyword matching + vital sign parsing
# ═══════════════════════════════════════════════

# Keyword safety net — catches cases if LLM fails
CRITICAL_KEYWORDS = [
    "cardiac arrest", "heart attack", "stemi", "st elevation", "unresponsive",
    "unconscious", "not breathing", "respiratory arrest", "anaphylaxis",
    "septic shock", "major trauma", "road accident", "road traffic accident",
    "rta", "motor vehicle accident", "mva", "head injury", "traumatic brain injury",
    "spinal injury", "amputation", "crush injury", "gunshot", "stab wound",
    "severe bleeding", "hemorrhage", "overdose", "poisoning", "stroke",
    "seizure", "tension pneumothorax", "aortic dissection", "pulmonary embolism",
    "drowning", "electrocution", "burns over",
]

HIGH_KEYWORDS = [
    "chest pain", "difficulty breathing", "shortness of breath", "fracture",
    "broken bone", "accident", "collision", "car crash", "concussion",
    "head trauma", "fall from height", "severe headache", "worst headache",
    "vomiting blood", "blood in stool", "acute abdomen", "confusion",
    "high fever", "severe pain", "diabetic emergency", "dka", "deep laceration",
    "bleeding wound", "snake bite", "dislocation", "whiplash",
    "asthma attack", "copd exacerbation", "pneumonia",
]

MEDIUM_KEYWORDS = [
    "fever", "moderate pain", "nausea", "vomiting", "dizziness",
    "abdominal pain", "sprain", "strain", "minor burn", "minor cut",
    "cough", "rash", "swelling", "migraine", "uti", "cellulitis",
    "allergic reaction", "anxiety", "panic attack", "sports injury",
]


def classify_urgency(
    text: str,
    entities: List[ExtractedEntity],
    llm_data: dict = None
) -> Tuple[UrgencyLevel, float, List[str]]:
    """
    Classify urgency using AI-first approach:
    1. PRIMARY: Use GPT-4o's triage decision (ai_triage_decision)
    2. VALIDATION: Cross-check with keywords and vitals
    3. FALLBACK: Use keyword-only scoring if AI unavailable
    """
    text_lower = text.lower()

    # ═══════════════════════════════════════════
    # PRIMARY: AI Decision (GPT-4o)
    # ═══════════════════════════════════════════
    ai_decision = None
    if llm_data:
        ai_decision = llm_data.get("ai_triage_decision")

    if ai_decision and isinstance(ai_decision, dict):
        ai_level_str = ai_decision.get("urgency_level", "").lower()
        ai_score = float(ai_decision.get("urgency_score", 0.5))
        ai_reasons = ai_decision.get("reasoning", [])

        # Map AI level to enum
        level_map = {
            "critical": UrgencyLevel.CRITICAL,
            "high": UrgencyLevel.HIGH,
            "medium": UrgencyLevel.MEDIUM,
            "low": UrgencyLevel.LOW,
        }
        ai_level = level_map.get(ai_level_str)

        if ai_level is not None:
            # Clamp score to valid range for the level
            if ai_level == UrgencyLevel.CRITICAL:
                ai_score = max(ai_score, 0.80)
            elif ai_level == UrgencyLevel.HIGH:
                ai_score = max(min(ai_score, 0.79), 0.60)
            elif ai_level == UrgencyLevel.MEDIUM:
                ai_score = max(min(ai_score, 0.59), 0.35)
            else:
                ai_score = min(ai_score, 0.34)

            # ── Validation: keywords can only UPGRADE, never downgrade ──
            keyword_boost = _get_keyword_boost(text_lower)
            vital_boost = _parse_vital_signs(text_lower)

            final_score = max(ai_score, keyword_boost, vital_boost)
            final_level = ai_level

            # If keywords/vitals suggest higher urgency, upgrade
            if keyword_boost >= 0.80 and ai_level not in [UrgencyLevel.CRITICAL]:
                final_level = UrgencyLevel.CRITICAL
                ai_reasons.append("Upgraded by safety keywords: critical indicators in text")
            elif keyword_boost >= 0.60 and ai_level in [UrgencyLevel.MEDIUM, UrgencyLevel.LOW]:
                final_level = UrgencyLevel.HIGH
                ai_reasons.append("Upgraded by safety keywords: high-priority indicators in text")

            if vital_boost >= 0.80 and final_level != UrgencyLevel.CRITICAL:
                final_level = UrgencyLevel.CRITICAL
                ai_reasons.append("Upgraded by vital sign analysis: critically abnormal vitals")

            # Prefix reasons to show AI is deciding
            tagged_reasons = [f"[AI] {r}" for r in ai_reasons[:5]]
            return final_level, round(final_score, 2), tagged_reasons

    # ═══════════════════════════════════════════
    # FALLBACK: Keyword + Vitals (if AI unavailable)
    # ═══════════════════════════════════════════
    return _fallback_classification(text_lower, entities, llm_data)


def _get_keyword_boost(text_lower: str) -> float:
    """Check text against keyword lists, return max score."""
    score = 0.0
    for kw in CRITICAL_KEYWORDS:
        if kw in text_lower:
            score = max(score, 0.90)
            break
    if score < 0.80:
        for kw in HIGH_KEYWORDS:
            if kw in text_lower:
                score = max(score, 0.65)
                break
    if score < 0.60:
        for kw in MEDIUM_KEYWORDS:
            if kw in text_lower:
                score = max(score, 0.40)
                break
    # Trauma mechanism check
    trauma_words = ["accident", "crash", "collision", "trauma", "injured",
                    "hit", "struck", "fell", "fall", "assault", "bleeding",
                    "blood", "broken", "fracture", "wound"]
    trauma_count = sum(1 for w in trauma_words if w in text_lower)
    if trauma_count >= 2:
        score = max(score, 0.65)
    return score


def _parse_vital_signs(text_lower: str) -> float:
    """Extract vital signs and return urgency boost."""
    score = 0.0

    # SpO2
    spo2_match = re.search(r'spo2[:\s]*(\d{2,3})', text_lower)
    if spo2_match:
        spo2 = int(spo2_match.group(1))
        if spo2 < 90:
            score = max(score, 0.95)
        elif spo2 < 95:
            score = max(score, 0.70)

    # Heart rate
    hr_match = re.search(r'(?:hr|heart rate|pulse)[:\s]*(\d{2,3})', text_lower)
    if hr_match:
        hr = int(hr_match.group(1))
        if hr > 130 or hr < 40:
            score = max(score, 0.85)
        elif hr > 110 or hr < 50:
            score = max(score, 0.60)

    # Blood pressure
    bp_match = re.search(r'(?:bp|blood pressure)[:\s]*(\d{2,3})/(\d{2,3})', text_lower)
    if bp_match:
        sys_bp = int(bp_match.group(1))
        if sys_bp > 180 or sys_bp < 80:
            score = max(score, 0.85)
        elif sys_bp > 160 or sys_bp < 90:
            score = max(score, 0.60)

    # GCS
    gcs_match = re.search(r'gcs[:\s]*(\d{1,2})', text_lower)
    if gcs_match:
        gcs = int(gcs_match.group(1))
        if gcs <= 8:
            score = max(score, 0.95)
        elif gcs <= 12:
            score = max(score, 0.75)

    # Temperature
    temp_match = re.search(r'(?:temp|temperature)[:\s]*(\d{2,3}(?:\.\d)?)', text_lower)
    if temp_match:
        temp = float(temp_match.group(1))
        if temp > 40:
            score = max(score, 0.80)
        elif temp > 39:
            score = max(score, 0.55)

    return score


def _fallback_classification(
    text_lower: str,
    entities: List[ExtractedEntity],
    llm_data: dict = None
) -> Tuple[UrgencyLevel, float, List[str]]:
    """Fallback when AI triage decision is unavailable."""
    reasons = []
    score = 0.0

    # Keyword matching
    for kw in CRITICAL_KEYWORDS:
        if kw in text_lower:
            reasons.append(f"Critical indicator: {kw}")
            score = max(score, 0.90)

    if score < 0.80:
        for kw in HIGH_KEYWORDS:
            if kw in text_lower:
                reasons.append(f"High priority indicator: {kw}")
                score = max(score, 0.65)

    if score < 0.60:
        for kw in MEDIUM_KEYWORDS:
            if kw in text_lower:
                reasons.append(f"Medium indicator: {kw}")
                score = max(score, 0.40)

    # Vital signs
    vital_score = _parse_vital_signs(text_lower)
    if vital_score > score:
        score = vital_score
        reasons.append(f"Abnormal vital signs detected (score: {vital_score})")

    # Trauma mechanism
    trauma_words = ["accident", "crash", "collision", "trauma", "injured",
                    "hit", "struck", "fell", "fall", "bleeding", "broken"]
    trauma_count = sum(1 for w in trauma_words if w in text_lower)
    if trauma_count >= 2 and score < 0.60:
        score = max(score, 0.65)
        reasons.append(f"Trauma mechanism detected ({trauma_count} indicators)")

    # LLM risk flags (if available but ai_triage_decision was missing)
    if llm_data:
        risk_flags = llm_data.get("risk_flags", [])
        if len(risk_flags) >= 3 and score < 0.60:
            score = max(score, 0.60)
            reasons.append(f"Multiple LLM risk flags: {len(risk_flags)}")

    # Default
    if score == 0.0:
        score = 0.15
        reasons.append("No high-priority indicators detected")

    # Deduplicate
    seen = set()
    unique_reasons = []
    for r in reasons:
        if r not in seen:
            seen.add(r)
            unique_reasons.append(r)

    # Map to level
    if score >= 0.80:
        level = UrgencyLevel.CRITICAL
    elif score >= 0.60:
        level = UrgencyLevel.HIGH
    elif score >= 0.35:
        level = UrgencyLevel.MEDIUM
    else:
        level = UrgencyLevel.LOW

    return level, round(score, 2), [f"[Fallback] {r}" for r in unique_reasons[:5]]
