from openai import AsyncOpenAI
from app.core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

SYSTEM_PROMPT = """You are a clinical information assistant. Your job is to summarize patient intake notes into a concise, structured clinical summary. 

Always output valid JSON with these fields:
- summary: 2-3 sentence clinical summary
- key_symptoms: list of main symptoms mentioned
- vitals: any vital signs mentioned (heart rate, BP, temperature, etc.)
- medical_history: relevant past conditions or medications
- timeline: when symptoms started / progression
- risk_flags: any red flag indicators (e.g. chest pain, difficulty breathing, altered consciousness)
- recommended_actions: 2-3 suggested next steps for the clinician

Be concise, clinical, and objective. Do NOT make diagnoses."""

async def summarize_patient_note(text: str) -> dict:
    """Summarize unstructured patient note using LLM."""
    try:
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Patient note:\n\n{text}"}
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
            max_tokens=800,
        )
        import json
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        # Fallback: return basic structure if LLM fails
        return {
            "summary": text[:200] + "..." if len(text) > 200 else text,
            "key_symptoms": [],
            "vitals": [],
            "medical_history": [],
            "timeline": "Unknown",
            "risk_flags": [],
            "recommended_actions": ["Manual review required"],
            "error": str(e)
        }
