// Demo data for standalone frontend preview without backend

export interface DemoCase {
  case_id: string;
  patient_id: string;
  original_text: string;
  summary: string;
  entities: { type: string; value: string; confidence: number }[];
  urgency: "critical" | "high" | "medium" | "low";
  urgency_score: number;
  urgency_reasons: string[];
  recommended_actions: string[];
  timestamp: string;
  processing_time_ms: number;
  status: string;
}

export const DEMO_CASES: DemoCase[] = [
  {
    case_id: "A1F3C8E2",
    patient_id: "PT-00471",
    original_text:
      "63yo M presents with crushing substernal chest pain radiating to left arm x 30 min. Diaphoretic, nauseous. PMHx: HTN, DM2, former smoker. BP 168/95, HR 112, SpO2 94%. ECG shows ST elevation in leads II, III, aVF.",
    summary:
      "63-year-old male presenting with acute ST-elevation myocardial infarction (STEMI). Patient reports 30 minutes of crushing substernal chest pain with radiation to left arm, accompanied by diaphoresis and nausea. Significant cardiac risk factors present.",
    entities: [
      { type: "symptom", value: "crushing substernal chest pain", confidence: 0.98 },
      { type: "symptom", value: "diaphoresis", confidence: 0.95 },
      { type: "symptom", value: "nausea", confidence: 0.93 },
      { type: "vital", value: "BP 168/95", confidence: 0.99 },
      { type: "vital", value: "HR 112", confidence: 0.99 },
      { type: "vital", value: "SpO2 94%", confidence: 0.99 },
      { type: "risk_factor", value: "hypertension", confidence: 0.96 },
      { type: "risk_factor", value: "diabetes mellitus type 2", confidence: 0.95 },
      { type: "risk_factor", value: "former smoker", confidence: 0.91 },
      { type: "timeline", value: "30 minutes", confidence: 0.97 },
      { type: "finding", value: "ST elevation leads II, III, aVF", confidence: 0.99 },
    ],
    urgency: "critical",
    urgency_score: 0.97,
    urgency_reasons: [
      "ST-elevation myocardial infarction identified on ECG",
      "Active chest pain with hemodynamic instability (tachycardia)",
      "Hypoxia (SpO2 94%) suggesting cardiogenic compromise",
      "Multiple cardiac risk factors amplify short-term mortality risk",
    ],
    recommended_actions: [
      "Activate cardiac catheterization lab immediately (door-to-balloon < 90 min)",
      "Administer aspirin 325mg, dual antiplatelet per STEMI protocol",
      "Continuous cardiac monitoring, 12-lead ECG every 15 min",
      "IV access bilateral, prepare for possible PCI or thrombolytics",
      "Cardiology consult STAT",
    ],
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    processing_time_ms: 2340,
    status: "pending",
  },
  {
    case_id: "B7D4E1A9",
    patient_id: "PT-00523",
    original_text:
      "45yo F, severe headache 'worst of my life', sudden onset 2 hrs ago. Neck stiffness, photophobia. PMHx: migraines. BP 152/88, HR 98, GCS 14. No focal neuro deficits on exam.",
    summary:
      "45-year-old female presenting with thunderclap headache concerning for subarachnoid hemorrhage (SAH). Sudden-onset 'worst headache of my life' with meningeal signs (neck stiffness, photophobia). Despite migraine history, presentation warrants urgent CT head and LP.",
    entities: [
      { type: "symptom", value: "thunderclap headache", confidence: 0.97 },
      { type: "symptom", value: "neck stiffness", confidence: 0.96 },
      { type: "symptom", value: "photophobia", confidence: 0.94 },
      { type: "vital", value: "BP 152/88", confidence: 0.99 },
      { type: "vital", value: "HR 98", confidence: 0.99 },
      { type: "vital", value: "GCS 14", confidence: 0.99 },
      { type: "timeline", value: "2 hours ago", confidence: 0.95 },
      { type: "risk_factor", value: "migraine history", confidence: 0.88 },
    ],
    urgency: "critical",
    urgency_score: 0.93,
    urgency_reasons: [
      "Thunderclap headache is a red flag for subarachnoid hemorrhage",
      "Meningeal signs (neck stiffness, photophobia) support SAH differential",
      "Slightly altered consciousness (GCS 14)",
      "Hypertensive response may indicate elevated ICP",
    ],
    recommended_actions: [
      "Urgent non-contrast CT head within 30 minutes",
      "If CT negative, perform lumbar puncture for xanthochromia",
      "Neurosurgery consult on standby",
      "Strict BP control — target SBP < 160 mmHg",
      "Establish IV access, continuous monitoring",
    ],
    timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
    processing_time_ms: 1890,
    status: "pending",
  },
  {
    case_id: "C3E8F2B6",
    patient_id: "PT-00617",
    original_text:
      "28yo M, right lower quadrant abdominal pain x 12 hrs, progressively worsening. Low-grade fever 38.2C. Nausea, anorexia. Rebound tenderness at McBurney's point. WBC 14.2. No prior surgeries.",
    summary:
      "28-year-old male with clinical presentation consistent with acute appendicitis. Progressive RLQ pain with classic McBurney's point tenderness, fever, and leukocytosis. Surgical consultation recommended.",
    entities: [
      { type: "symptom", value: "RLQ abdominal pain", confidence: 0.97 },
      { type: "symptom", value: "nausea", confidence: 0.92 },
      { type: "symptom", value: "anorexia", confidence: 0.90 },
      { type: "vital", value: "temp 38.2°C", confidence: 0.99 },
      { type: "finding", value: "rebound tenderness McBurney's point", confidence: 0.96 },
      { type: "finding", value: "WBC 14.2", confidence: 0.99 },
      { type: "timeline", value: "12 hours", confidence: 0.95 },
    ],
    urgency: "high",
    urgency_score: 0.82,
    urgency_reasons: [
      "Classic presentation of acute appendicitis with peritoneal signs",
      "Leukocytosis (WBC 14.2) confirms inflammatory process",
      "Risk of perforation increases with delay in diagnosis",
      "Progressive worsening over 12 hours",
    ],
    recommended_actions: [
      "CT abdomen/pelvis with IV contrast for confirmation",
      "Surgical consult for possible appendectomy",
      "NPO status, IV fluids, pain management",
      "Broad-spectrum antibiotics if perforation suspected",
    ],
    timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
    processing_time_ms: 1560,
    status: "pending",
  },
  {
    case_id: "D9A2B5C7",
    patient_id: "PT-00742",
    original_text:
      "72yo F, increasing SOB over 3 days, productive cough with green sputum, fever 39.1C. PMHx: COPD, CHF. BP 125/78, HR 105, SpO2 89%, RR 28. Bilateral crackles on auscultation.",
    summary:
      "72-year-old female with acute respiratory distress, likely pneumonia superimposed on COPD/CHF. Significant hypoxia, tachypnea, and tachycardia. High-risk due to cardiopulmonary comorbidities.",
    entities: [
      { type: "symptom", value: "shortness of breath", confidence: 0.97 },
      { type: "symptom", value: "productive cough with green sputum", confidence: 0.95 },
      { type: "vital", value: "temp 39.1°C", confidence: 0.99 },
      { type: "vital", value: "SpO2 89%", confidence: 0.99 },
      { type: "vital", value: "RR 28", confidence: 0.99 },
      { type: "vital", value: "HR 105", confidence: 0.99 },
      { type: "risk_factor", value: "COPD", confidence: 0.96 },
      { type: "risk_factor", value: "CHF", confidence: 0.95 },
      { type: "finding", value: "bilateral crackles", confidence: 0.94 },
      { type: "timeline", value: "3 days", confidence: 0.93 },
    ],
    urgency: "high",
    urgency_score: 0.85,
    urgency_reasons: [
      "Significant hypoxia (SpO2 89%) requiring supplemental oxygen",
      "Tachypnea and tachycardia indicating respiratory distress",
      "High-risk comorbidities (COPD, CHF) increase complication risk",
      "Fever and purulent sputum suggest bacterial pneumonia",
    ],
    recommended_actions: [
      "Supplemental oxygen to maintain SpO2 > 92%",
      "Chest X-ray, blood cultures, sputum culture",
      "Empiric antibiotics per CAP guidelines",
      "BNP level to assess CHF exacerbation component",
      "Consider ICU admission if clinical deterioration",
    ],
    timestamp: new Date(Date.now() - 50 * 60000).toISOString(),
    processing_time_ms: 1780,
    status: "in_review",
  },
  {
    case_id: "E5F1D3A8",
    patient_id: "PT-00856",
    original_text:
      "34yo M, twisted ankle playing basketball 4 hrs ago. Swelling and bruising over lateral malleolus. Can bear weight with limp. No deformity. Point tenderness over ATFL. Ottawa ankle rules positive.",
    summary:
      "34-year-old male with lateral ankle sprain following sports injury. Ottawa ankle rules positive, warranting X-ray to rule out fracture. Able to bear weight, suggesting likely ligamentous injury.",
    entities: [
      { type: "symptom", value: "ankle pain and swelling", confidence: 0.96 },
      { type: "symptom", value: "bruising lateral malleolus", confidence: 0.94 },
      { type: "finding", value: "Ottawa ankle rules positive", confidence: 0.97 },
      { type: "finding", value: "ATFL tenderness", confidence: 0.93 },
      { type: "timeline", value: "4 hours ago", confidence: 0.95 },
    ],
    urgency: "medium",
    urgency_score: 0.45,
    urgency_reasons: [
      "Ottawa ankle rules positive requires radiographic evaluation",
      "Able to weight-bear suggests lower fracture likelihood",
      "No neurovascular compromise",
    ],
    recommended_actions: [
      "Ankle X-ray (AP, lateral, mortise views)",
      "RICE protocol (Rest, Ice, Compression, Elevation)",
      "NSAIDs for pain and swelling",
      "Orthopedic follow-up if fracture identified",
    ],
    timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
    processing_time_ms: 1120,
    status: "resolved",
  },
  {
    case_id: "F2G8H4K1",
    patient_id: "PT-00903",
    original_text:
      "22yo F, sore throat x 3 days, low-grade fever 37.8C. No difficulty swallowing or breathing. Tonsillar erythema without exudates. No cervical lymphadenopathy. Rapid strep negative.",
    summary:
      "22-year-old female with viral pharyngitis. Negative rapid strep test, no concerning features. Supportive care recommended.",
    entities: [
      { type: "symptom", value: "sore throat", confidence: 0.96 },
      { type: "vital", value: "temp 37.8°C", confidence: 0.99 },
      { type: "finding", value: "tonsillar erythema without exudates", confidence: 0.94 },
      { type: "finding", value: "rapid strep negative", confidence: 0.99 },
      { type: "timeline", value: "3 days", confidence: 0.95 },
    ],
    urgency: "low",
    urgency_score: 0.15,
    urgency_reasons: [
      "Viral pharyngitis — self-limiting condition",
      "No airway compromise or dysphagia",
      "Negative strep screening",
    ],
    recommended_actions: [
      "Supportive care: fluids, rest, salt water gargles",
      "OTC analgesics (acetaminophen/ibuprofen) for comfort",
      "Return if symptoms worsen or persist > 7 days",
    ],
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    processing_time_ms: 890,
    status: "resolved",
  },
];
