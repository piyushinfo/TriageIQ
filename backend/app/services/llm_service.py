from openai import AsyncOpenAI
from app.core.config import settings
import json
import logging

logger = logging.getLogger("triageiq")
logging.basicConfig(level=logging.INFO)

# Use Groq (free) if available, fallback to OpenAI
if settings.GROQ_API_KEY:
    client = AsyncOpenAI(
        api_key=settings.GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1"
    )
    MODEL = "llama-3.3-70b-versatile"
    PROVIDER = "Groq (Llama 3.3 70B)"
else:
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    MODEL = "gpt-4o-mini"
    PROVIDER = "OpenAI (GPT-4o-mini)"

logger.info(f"[TriageIQ] AI Provider: {PROVIDER}")

SYSTEM_PROMPT = """You are an AI-powered clinical triage engine. Your job is to analyze patient intake notes and make triage decisions.

You MUST output valid JSON with ALL of these fields:

{
  "summary": "2-3 sentence clinical summary including mechanism of injury if applicable",
  "key_symptoms": ["list of all symptoms and complaints mentioned"],
  "vitals": ["any vital signs: HR, BP, SpO2, temp, GCS, RR"],
  "medical_history": ["relevant past conditions or medications"],
  "timeline": "when symptoms started / progression",
  "risk_flags": ["ALL red-flag indicators — include mechanism of injury, life threats, severity indicators"],
  "recommended_actions": ["3-5 suggested clinical next steps, prioritized by urgency"],
  "ai_triage_decision": {
    "urgency_level": "critical | high | medium | low",
    "urgency_score": 0.85,
    "reasoning": ["reason 1 for this classification", "reason 2", "reason 3"]
  }
}

## TRIAGE CLASSIFICATION RULES:

🔴 CRITICAL (urgency_score: 0.80-1.00) — Immediate life threat:
- Cardiac: STEMI, cardiac arrest, unstable arrhythmia, aortic dissection
- Neuro: stroke symptoms, GCS ≤ 8, status epilepticus, intracranial hemorrhage
- Respiratory: respiratory failure, airway obstruction, SpO2 < 90%
- Trauma: major RTA/MVA, polytrauma, penetrating trauma, TBI, spinal injury, crush injury, amputation, severe hemorrhage
- Burns: chemical burns (acid/alkali), burns >20% TBSA, electrical burns, inhalation injury
- Other: anaphylaxis, septic shock, poisoning/overdose, organ failure

🟠 HIGH (urgency_score: 0.60-0.79) — Urgent, rapid attention needed:
- Cardiac: chest pain, hypertensive crisis, new arrhythmia
- Neuro: severe headache, confusion, focal deficits, GCS 9-12
- Respiratory: acute asthma, COPD exacerbation, pneumonia with hypoxia
- Trauma: fractures, concussion, lacerations, any road/vehicle accident, falls from height
- Burns: partial thickness burns, chemical exposure, burns 10-20% TBSA
- Abdomen: acute abdomen, GI bleeding
- Other: high fever (>39°C), DKA, severe dehydration, animal/snake bites

🟡 MEDIUM (urgency_score: 0.35-0.59) — Needs attention, stable:
- Moderate pain, fever, vomiting, dizziness, sprains, minor burns <10% TBSA
- UTI, cellulitis, migraine, mild allergic reactions, minor injuries

🟢 LOW (urgency_score: 0.00-0.34) — Non-urgent, routine care:
- Sore throat, common cold, minor rash, chronic stable conditions
- Follow-up visits, medication refills, minor cuts/bruises

IMPORTANT RULES:
1. ANY accident (road, vehicle, industrial, fall) is AT LEAST HIGH priority
2. ANY chemical burn (acid, alkali, chemical exposure) is CRITICAL
3. Mechanism of injury matters — high-energy mechanisms elevate urgency even without visible injuries
4. Multiple symptoms compound urgency — 3+ concerning symptoms should elevate the level
5. Always err on the side of caution — when in doubt, classify higher
6. Provide at least 3 specific clinical reasons for your classification"""

async def summarize_patient_note(text: str) -> dict:
    """Use configured LLM as the primary triage decision maker."""
    try:
        logger.info(f"[TriageIQ] Calling {PROVIDER} for triage analysis...")
        has_key = bool(settings.GROQ_API_KEY or settings.OPENAI_API_KEY)
        logger.info(f"[TriageIQ] API Key present: {has_key}")

        response = await client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Triage this patient note:\n\n{text}"}
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
            max_tokens=1000,
        )

        raw = response.choices[0].message.content
        logger.info(f"[TriageIQ] ✅ {PROVIDER} responded successfully")
        logger.info(f"[TriageIQ] Raw AI response: {raw[:300]}...")

        result = json.loads(raw)

        # Verify ai_triage_decision exists
        if "ai_triage_decision" not in result or result["ai_triage_decision"] is None:
            logger.warning(f"[TriageIQ] ⚠️ {PROVIDER} responded but missing ai_triage_decision, adding from context")
            # The model sometimes omits this — construct it from risk_flags
            risk_flags = result.get("risk_flags", [])
            if len(risk_flags) >= 3:
                result["ai_triage_decision"] = {
                    "urgency_level": "high",
                    "urgency_score": 0.75,
                    "reasoning": risk_flags[:5]
                }
            elif len(risk_flags) >= 1:
                result["ai_triage_decision"] = {
                    "urgency_level": "medium",
                    "urgency_score": 0.50,
                    "reasoning": risk_flags[:5]
                }

        ai_decision = result.get("ai_triage_decision", {})
        logger.info(f"[TriageIQ] AI Decision: {ai_decision.get('urgency_level', 'N/A')} "
                     f"(score: {ai_decision.get('urgency_score', 'N/A')})")

        return result

    except Exception as e:
        logger.error(f"[TriageIQ] ❌ {PROVIDER} FAILED: {type(e).__name__}: {e}")
        logger.error(f"[TriageIQ] Falling back to keyword-only classification")
        # Fallback when AI is unavailable
        return {
            "summary": text[:200] + "..." if len(text) > 200 else text,
            "key_symptoms": [],
            "vitals": [],
            "medical_history": [],
            "timeline": "Unknown",
            "risk_flags": [],
            "recommended_actions": ["Manual review required — AI service unavailable"],
            "ai_triage_decision": None,
            "error": str(e)
        }
