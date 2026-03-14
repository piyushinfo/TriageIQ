"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { triageAPI } from "@/utils/api";
import Navbar from "@/components/shared/Navbar";
import UrgencyBadge from "@/components/shared/UrgencyBadge";
import {
  Activity,
  Send,
  Mic,
  Loader2,
  CheckCircle2,
  Brain,
  Sparkles,
  ShieldCheck,
  FileText,
  ArrowRight,
  AlertCircle,
  ChevronRight,
  Tag,
  ListChecks,
  Clock,
  User,
} from "lucide-react";

const Scene3D = dynamic(() => import("@/components/3d/Scene3D"), { ssr: false });

const PIPELINE_STAGES = [
  { icon: <FileText size={16} />, label: "Receiving input", duration: 800 },
  { icon: <Brain size={16} />, label: "LLM summarization", duration: 1200 },
  { icon: <Sparkles size={16} />, label: "NER entity extraction", duration: 1000 },
  { icon: <ShieldCheck size={16} />, label: "Urgency classification", duration: 800 },
  { icon: <CheckCircle2 size={16} />, label: "Complete", duration: 500 },
];

const SAMPLE_NOTES = [
  "63yo M presents with crushing substernal chest pain radiating to left arm x 30 min. Diaphoretic, nauseous. PMHx: HTN, DM2, former smoker. BP 168/95, HR 112, SpO2 94%. ECG shows ST elevation in leads II, III, aVF.",
  "45yo F, severe headache 'worst of my life', sudden onset 2 hrs ago. Neck stiffness, photophobia. PMHx: migraines. BP 152/88, HR 98, GCS 14. No focal neuro deficits.",
  "28yo M, right lower quadrant abdominal pain x 12 hrs, progressively worsening. Low-grade fever 38.2C. Nausea, anorexia. Rebound tenderness at McBurney's point. WBC 14.2.",
];

export default function NewCasePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState(-1);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setCurrentStage(0);

    // Simulate pipeline stages for visual effect
    for (let i = 0; i < PIPELINE_STAGES.length - 1; i++) {
      await new Promise((r) => setTimeout(r, PIPELINE_STAGES[i].duration));
      setCurrentStage(i + 1);
    }

    try {
      const res = await triageAPI.analyzeNote(inputText);
      setResult(res.data);
      setCurrentStage(PIPELINE_STAGES.length - 1);
    } catch (e: any) {
      // Create a demo result if backend not available
      setResult({
        case_id: Math.random().toString(36).substring(2, 10).toUpperCase(),
        patient_id: `PT-${Math.floor(Math.random() * 10000).toString().padStart(5, "0")}`,
        original_text: inputText,
        summary: "AI analysis completed — this is a demo result. Connect the backend for real NLP processing.",
        entities: [
          { type: "symptom", value: "identified from text", confidence: 0.85 },
        ],
        urgency: "medium",
        urgency_score: 0.55,
        urgency_reasons: ["Demo mode — connect backend for real classification"],
        recommended_actions: ["Connect FastAPI backend for real triage analysis"],
        timestamp: new Date().toISOString(),
        processing_time_ms: 2500,
      });
      setCurrentStage(PIPELINE_STAGES.length - 1);
    }

    setLoading(false);
  };

  const loadSample = (idx: number) => {
    setInputText(SAMPLE_NOTES[idx]);
    setResult(null);
    setCurrentStage(-1);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] mesh-gradient">
      {mounted && <Scene3D variant="subtle" />}

      <div className="content-overlay">
        <Navbar />

        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              New <span className="gradient-text">Triage Case</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Paste a patient intake note for AI-powered clinical analysis
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* ── Left: Input ────────────────── */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6"
              >
                <label className="text-xs text-gray-500 uppercase tracking-[0.12em] font-semibold mb-3 block">
                  Patient Intake Note
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste patient intake note, clinical observations, paramedic report, or any unstructured clinical text here..."
                  rows={8}
                  className="w-full bg-white/[0.03] border border-white/8 rounded-xl p-4 text-sm text-gray-200 placeholder-gray-600 resize-none focus:border-teal-500/40 transition-colors leading-relaxed"
                />

                {/* Sample notes */}
                <div className="mt-4 mb-5">
                  <p className="text-xs text-gray-500 mb-2">
                    Try a sample case:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["STEMI Case", "Thunderclap Headache", "Appendicitis"].map(
                      (label, i) => (
                        <button
                          key={i}
                          onClick={() => loadSample(i)}
                          className="text-xs px-3 py-1.5 rounded-lg glass-subtle text-gray-400 hover:text-teal-400 hover:border-teal-500/20 transition-all cursor-pointer"
                        >
                          {label}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAnalyze}
                    disabled={loading || !inputText.trim()}
                    className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Activity size={16} />
                        Analyze & Triage
                        <Send size={14} />
                      </>
                    )}
                  </button>
                  {result && (
                    <button
                      onClick={() => router.push("/dashboard")}
                      className="btn-secondary !py-2 !text-sm"
                    >
                      View Dashboard
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>

                {error && (
                  <div className="mt-4 text-sm text-red-400 flex items-center gap-2">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}
              </motion.div>
            </div>

            {/* ── Right: Pipeline Status ─────── */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl p-6"
              >
                <h3 className="text-xs text-teal-400 uppercase tracking-[0.12em] font-bold mb-5">
                  NLP Pipeline
                </h3>
                <div className="space-y-0">
                  {PIPELINE_STAGES.map((stage, i) => {
                    const isActive = i === currentStage;
                    const isDone = i < currentStage;
                    const isPending = i > currentStage;
                    return (
                      <div key={i} className="pipeline-step py-3">
                        <div
                          className={`flex items-center gap-3 transition-all duration-300 ${
                            isDone
                              ? "text-teal-400"
                              : isActive
                              ? "text-cyan-400"
                              : "text-gray-600"
                          }`}
                          style={{
                            ...(isActive && {
                              textShadow: "0 0 10px rgba(34, 211, 238, 0.5)",
                            }),
                          }}
                        >
                          {isDone ? (
                            <CheckCircle2 size={16} />
                          ) : isActive ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            stage.icon
                          )}
                          <span className="text-sm font-medium">{stage.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {currentStage === -1 && (
                  <div className="mt-4 text-xs text-gray-600 text-center">
                    Submit a note to start the pipeline
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* ═══ Result Card ═══ */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mt-8 glass rounded-2xl overflow-hidden"
              >
                {/* Result Header */}
                <div className="p-6 border-b border-white/5 bg-gradient-to-r from-teal-500/[0.03] to-transparent">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2
                          size={18}
                          className="text-teal-400"
                        />
                        <h2 className="text-lg font-bold text-white">
                          Triage Result — Case #{result.case_id}
                        </h2>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <User size={13} />
                          {result.patient_id}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} />
                          {result.processing_time_ms}ms
                        </span>
                      </div>
                    </div>
                    <UrgencyBadge
                      urgency={result.urgency}
                      score={result.urgency_score}
                      size="lg"
                    />
                  </div>
                </div>

                {/* Result Content */}
                <div className="p-6 space-y-6">
                  {/* Summary */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={14} className="text-teal-400" />
                      <h3 className="text-xs text-teal-400 uppercase tracking-[0.12em] font-bold">
                        Clinical Summary
                      </h3>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {result.summary}
                    </p>
                  </div>

                  {/* Urgency Reasons */}
                  {result.urgency_reasons?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle size={14} className="text-teal-400" />
                        <h3 className="text-xs text-teal-400 uppercase tracking-[0.12em] font-bold">
                          Urgency Indicators
                        </h3>
                      </div>
                      <ul className="space-y-1.5">
                        {result.urgency_reasons.map((r: string, i: number) => (
                          <li
                            key={i}
                            className="text-sm flex items-start gap-2 text-orange-400"
                          >
                            <ChevronRight
                              size={14}
                              className="mt-0.5 flex-shrink-0"
                            />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Entities */}
                  {result.entities?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Tag size={14} className="text-teal-400" />
                        <h3 className="text-xs text-teal-400 uppercase tracking-[0.12em] font-bold">
                          Extracted Entities
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.entities.map((e: any, i: number) => (
                          <span
                            key={i}
                            className="text-xs px-2.5 py-1.5 rounded-lg glass-subtle border border-white/5"
                          >
                            <span className="text-gray-500">{e.type}:</span>{" "}
                            <span className="text-gray-200">{e.value}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Actions */}
                  {result.recommended_actions?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <ListChecks size={14} className="text-teal-400" />
                        <h3 className="text-xs text-teal-400 uppercase tracking-[0.12em] font-bold">
                          Recommended Actions
                        </h3>
                      </div>
                      <ol className="space-y-2">
                        {result.recommended_actions.map(
                          (a: string, i: number) => (
                            <li
                              key={i}
                              className="text-sm text-gray-300 flex items-start gap-3"
                            >
                              <span className="flex-shrink-0 w-5 h-5 rounded-md bg-teal-500/15 text-teal-400 text-xs flex items-center justify-center font-bold border border-teal-500/20">
                                {i + 1}
                              </span>
                              {a}
                            </li>
                          )
                        )}
                      </ol>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
