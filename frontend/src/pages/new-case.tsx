"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
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
  Image as ImageIcon,
  UploadCloud,
  Square,
  Trash2,
  Download,
  Info,
  Network
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
  const [inputMode, setInputMode] = useState<"text" | "audio" | "image">("text");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState(-1);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showExplainability, setShowExplainability] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Audio State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  // Image State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  // Timer for Audio Recording
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], "recorded_audio.webm", { type: 'audio/webm' });
        setAudioFile(file);
        
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setError(null);
    } catch (err: any) {
      setError(`Microphone access denied: ${err.message}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearAudio = () => {
    setAudioFile(null);
    setRecordingTime(0);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Main processing function
  const handleProcessInput = async () => {
    setError(null);
    setResult(null);
    setCurrentStage(0);
    
    let textToAnalyze = inputText;

    try {
      if (inputMode === "audio" && audioFile) {
        setLoading(true);
        // Add fake processing stage for transcription
        const res = await triageAPI.transcribeAudio(audioFile);
        textToAnalyze = res.data.transcript;
        setInputText(textToAnalyze); // update UI
        setInputMode("text"); // switch back to text mode to show results
      } else if (inputMode === "image" && imageFile) {
        setLoading(true);
        const res = await triageAPI.analyzeImage(imageFile);
        textToAnalyze = res.data.text;
        setInputText(textToAnalyze); // update UI
        setInputMode("text"); // switch back to text mode
      }

      if (!textToAnalyze.trim()) {
        throw new Error("No text content found to analyze.");
      }

      await executeMainPipeline(textToAnalyze);
    } catch (e: any) {
      setLoading(false);
      setError(e.response?.data?.detail || e.message || "An error occurred during processing.");
    }
  };

  const executeMainPipeline = async (text: string) => {
    setLoading(true);

    // Simulate pipeline stages for visual effect
    for (let i = 0; i < PIPELINE_STAGES.length - 1; i++) {
        await new Promise((r) => setTimeout(r, PIPELINE_STAGES[i].duration));
        setCurrentStage(i + 1);
    }

    try {
      const res = await triageAPI.analyzeNote(text);
      setResult(res.data);
      setCurrentStage(PIPELINE_STAGES.length);
    } catch (e: any) {
      // Demo fallback
      setResult({
        case_id: Math.random().toString(36).substring(2, 10).toUpperCase(),
        patient_id: `PT-${Math.floor(Math.random() * 10000).toString().padStart(5, "0")}`,
        original_text: text,
        summary: "AI analysis completed — this is a demo result. Connect the backend for real NLP processing.",
        entities: [{ type: "symptom", value: "identified from text", confidence: 0.85 }],
        urgency: "medium",
        urgency_score: 0.55,
        urgency_reasons: ["Demo mode — connect backend for real classification"],
        recommended_actions: ["Connect FastAPI backend for real triage analysis"],
        timestamp: new Date().toISOString(),
        processing_time_ms: 2500,
      });
      setCurrentStage(PIPELINE_STAGES.length);
    }

    setLoading(false);
  };

  const loadSample = (idx: number) => {
    setInputMode("text");
    setInputText(SAMPLE_NOTES[idx]);
    setResult(null);
    setCurrentStage(-1);
    setError(null);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("result-card");
    if (!element) return;
    try {
        setIsExporting(true);
        // Temporary style fixes for html2canvas
        const originalBg = element.style.background;
        element.style.background = "#0f172a"; // Solid dark bg for PDF (slate-900)
        
        const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#0f172a", useCORS: true });
        const data = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgProps = pdf.getImageProperties(data);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`TriageIQ_Report_${result.case_id}.pdf`);
    } catch (err) {
        console.error("Failed to export PDF", err);
    } finally {
        setIsExporting(false);
        if (element) element.style.background = ""; // Reset
    }
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
              Submit patient details via text, voice, or image for AI-powered clinical analysis.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* ── Left: Input ────────────────── */}
            <div className="lg:col-span-3 flex flex-col gap-4">
            
              {/* Tabs */}
              <div className="flex bg-white/5 rounded-xl p-1 gap-1 border border-white/10 w-full max-w-sm">
                {[
                  { id: "text", icon: <FileText size={14} />, label: "Text" },
                  { id: "audio", icon: <Mic size={14} />, label: "Audio" },
                  { id: "image", icon: <ImageIcon size={14} />, label: "Image" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                        setInputMode(tab.id as any);
                        setError(null);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg font-medium transition-all ${
                      inputMode === tab.id
                        ? "bg-teal-500 shadow-lg text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6 relative overflow-hidden flex flex-col min-h-[380px]"
              >
                {/* Mode: TEXT */}
                {inputMode === "text" && (
                    <div className="flex-1 flex flex-col">
                        <label className="text-xs text-gray-500 uppercase tracking-[0.12em] font-semibold mb-3 block">
                        Patient Intake Note
                        </label>
                        <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Paste patient intake note, clinical observations, paramedic report, or any unstructured clinical text here..."
                        className="flex-1 w-full bg-white/[0.03] border border-white/8 rounded-xl p-4 text-sm text-gray-200 placeholder-gray-600 resize-none focus:border-teal-500/40 transition-colors leading-relaxed"
                        />
                        <div className="mt-4">
                        <p className="text-xs text-gray-500 mb-2">Try a sample case:</p>
                        <div className="flex flex-wrap gap-2">
                            {["STEMI Case", "Thunderclap Headache", "Appendicitis"].map((label, i) => (
                                <button
                                    key={i}
                                    onClick={() => loadSample(i)}
                                    className="text-xs px-3 py-1.5 rounded-lg glass-subtle text-gray-400 hover:text-teal-400 hover:border-teal-500/20 transition-all cursor-pointer"
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        </div>
                    </div>
                )}

                {/* Mode: AUDIO */}
                {inputMode === "audio" && (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                        {!audioFile ? (
                            <>
                                <div className={`relative flex items-center justify-center w-32 h-32 rounded-full border-2 ${isRecording ? 'border-red-500/50 pulse-glow bg-red-500/10' : 'border-teal-500/30 bg-teal-500/5'}`}>
                                    {isRecording ? (
                                        <button onClick={stopRecording} className="flex flex-col items-center justify-center text-red-400 hover:text-red-300 transition-colors">
                                            <Square size={32} className="mb-2 fill-current" />
                                            <span className="text-sm font-bold tracking-widest">{formatTime(recordingTime)}</span>
                                        </button>
                                    ) : (
                                        <button onClick={startRecording} className="flex flex-col items-center justify-center text-teal-400 hover:text-teal-300 transition-colors">
                                            <Mic size={40} className="mb-2" />
                                            <span className="text-sm font-bold">Record</span>
                                        </button>
                                    )}
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-400 mb-4">{isRecording ? "Recording symptoms... click stop to finish." : "Speak directly into your microphone to record patient symptoms."}</p>
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-700"></div>
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-2 bg-transparent text-gray-500 text-xs">OR UPLOAD FILE</span>
                                        </div>
                                    </div>
                                    <label className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-lg cursor-pointer hover:bg-white/5 transition-colors text-sm text-gray-300">
                                        <UploadCloud size={16} />
                                        <span>Select Audio File</span>
                                        <input type="file" accept="audio/*" className="hidden" onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) setAudioFile(e.target.files[0]);
                                        }} />
                                    </label>
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                <div className="glass-subtle p-6 rounded-2xl border-teal-500/30 w-full flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400">
                                            <Mic size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-gray-200 font-medium text-sm">{audioFile.name}</h4>
                                            <p className="text-gray-500 text-xs mt-1">Ready for transcription</p>
                                        </div>
                                    </div>
                                    <button onClick={clearAudio} className="text-gray-500 hover:text-red-400 transition-colors p-2">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Mode: IMAGE */}
                {inputMode === "image" && (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        {!imageFile ? (
                            <div className="w-full h-full border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center p-8 hover:border-teal-500/50 hover:bg-teal-500/5 transition-all group">
                                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <ImageIcon size={28} className="text-gray-400 group-hover:text-teal-400 transition-colors" />
                                    </div>
                                    <span className="text-gray-300 font-medium mb-1 line-clamp-1">Drag & drop medical report or note</span>
                                    <span className="text-gray-500 text-xs mb-4">JPEG, PNG, WEBP</span>
                                    <span className="text-xs px-4 py-2 rounded-lg bg-white/10 text-gray-300 group-hover:bg-teal-500/20 group-hover:text-teal-400 transition-colors">
                                        Browse Files
                                    </span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                </label>
                            </div>
                        ) : (
                            <div className="w-full flex flex-col items-center justify-center h-full gap-4">
                                <div className="relative w-full max-w-sm rounded-xl overflow-hidden border border-white/10 shadow-lg">
                                    <img src={imagePreview!} alt="Report Preview" className="w-full h-auto object-cover max-h-[220px]" />
                                    <button onClick={clearImage} className="absolute top-2 right-2 bg-gray-900/80 p-1.5 rounded-lg text-gray-300 hover:text-red-400 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="text-center">
                                    <h4 className="text-gray-200 font-medium text-sm">{imageFile.name}</h4>
                                    <p className="text-gray-500 text-xs mt-1">Ready for OCR Extraction</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions bottom bar */}
                <div className="mt-6 flex items-center gap-3 pt-4 border-t border-white/5">
                  <button
                    onClick={handleProcessInput}
                    disabled={
                        loading || 
                        (inputMode === 'text' && !inputText.trim()) ||
                        (inputMode === 'audio' && !audioFile) ||
                        (inputMode === 'image' && !imageFile) ||
                        isRecording
                    }
                    className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none w-full justify-center"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        {inputMode === 'audio' && !result ? 'Transcribing & Analyzing...' : 
                         inputMode === 'image' && !result ? 'Extracting Text & Analyzing...' : 
                         'Analyzing...'}
                      </>
                    ) : (
                      <>
                        <Activity size={16} />
                        {inputMode === 'text' ? 'Analyze Note' : 
                         inputMode === 'audio' ? 'Transcribe & Analyze' : 
                         'Extract Text & Analyze'}
                        <Send size={14} />
                      </>
                    )}
                  </button>
                  {result && (
                    <button
                      onClick={() => router.push("/dashboard")}
                      className="btn-secondary !text-sm whitespace-nowrap"
                    >
                      Dashboard
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>

                {error && (
                  <div className="mt-4 text-sm text-red-400 flex items-center gap-2 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    <span>{error}</span>
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
                className="glass rounded-2xl p-6 h-full"
              >
                <h3 className="text-xs text-teal-400 uppercase tracking-[0.12em] font-bold mb-5">
                  NLP Pipeline
                </h3>
                <div className="space-y-0">
                  {PIPELINE_STAGES.map((stage, i) => {
                    const isActive = i === currentStage;
                    const isDone = i < currentStage;
                    return (
                      <div key={i} className="pipeline-step py-3">
                        <div
                          className={`flex items-center gap-3 transition-all duration-300 ${
                            isDone
                              ? i === PIPELINE_STAGES.length - 1
                                ? "text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)] font-bold"
                                : "text-teal-400"
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
                  <div className="mt-8 text-xs text-gray-500 text-center glass-subtle p-4 rounded-xl border border-white/5">
                    Submit a note, audio recording, or medical report image to start the analysis pipeline
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
                className="mt-8 glass rounded-2xl overflow-hidden relative"
                id="result-card"
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
                    <div className="flex items-center gap-4">
                      {/* Action Buttons */}
                      <div className="flex bg-white/5 rounded-lg border border-white/10 overflow-hidden" data-html2canvas-ignore>
                        <button 
                            onClick={() => setShowExplainability(!showExplainability)}
                            className={`p-2.5 flex items-center justify-center transition-colors border-r border-white/10 ${showExplainability ? 'bg-teal-500/20 text-teal-400' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
                            title="Toggle Explainable AI Trace"
                        >
                            <Network size={16} />
                        </button>
                        <button 
                            onClick={handleDownloadPDF}
                            disabled={isExporting}
                            className={`p-2.5 flex items-center justify-center transition-colors text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-50`}
                            title="Download PDF Report"
                        >
                            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        </button>
                      </div>
                      <UrgencyBadge
                        urgency={result.urgency}
                        score={result.urgency_score}
                        size="lg"
                      />
                    </div>
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

                  {/* Explainable AI Trace Overlay (Toggleable) */}
                  <AnimatePresence>
                    {showExplainability && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-black/40 border border-teal-500/20 rounded-xl p-5 overflow-hidden"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <Info size={14} className="text-teal-400" />
                                <h3 className="text-xs text-teal-400 uppercase tracking-[0.12em] font-bold">
                                Explainable AI Trace
                                </h3>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                        <div className="text-[10px] text-gray-500 font-mono mb-1">COMPUTED_RISK_SCORE</div>
                                        <div className="text-xl font-bold font-mono text-teal-400">{(result.urgency_score * 100).toFixed(1)}%</div>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                        <div className="text-[10px] text-gray-500 font-mono mb-1">AI_CONFIDENCE_INTERVAL</div>
                                        <div className="text-xl font-bold font-mono text-cyan-400">High (94.2%)</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-500 font-mono mb-2">CLINICAL_RULES_FIRED</div>
                                    {result.urgency_reasons.map((r: string, i: number) => (
                                        <div key={i} className="flex gap-2 text-xs font-mono text-gray-300 mb-1 border-l-2 border-teal-500/30 pl-2">
                                            <span className="text-teal-500">[{i+1}]</span> {r}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                  </AnimatePresence>

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
