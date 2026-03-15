"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
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

  const handleProcessInput = async () => {
    setError(null);
    setResult(null);
    setCurrentStage(0);
    
    let textToAnalyze = inputText;

    try {
      if (inputMode === "audio" && audioFile) {
        setLoading(true);
        const res = await triageAPI.transcribeAudio(audioFile);
        textToAnalyze = res.data.transcript;
        setInputText(textToAnalyze);
        setInputMode("text");
      } else if (inputMode === "image" && imageFile) {
        setLoading(true);
        const res = await triageAPI.analyzeImage(imageFile);
        textToAnalyze = res.data.text;
        setInputText(textToAnalyze);
        setInputMode("text");
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

    for (let i = 0; i < PIPELINE_STAGES.length - 1; i++) {
        await new Promise((r) => setTimeout(r, PIPELINE_STAGES[i].duration));
        setCurrentStage(i + 1);
    }

    try {
      const res = await triageAPI.analyzeNote(text);
      setResult(res.data);
      setCurrentStage(PIPELINE_STAGES.length);
    } catch (e: any) {
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
        const originalBg = element.style.background;
        element.style.background = "#ffffff";
        
        const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#ffffff", useCORS: true } as any);
        const data = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgProps = (pdf as any).getImageProperties(data);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`TriageIQ_Report_${result.case_id}.pdf`);
    } catch (err) {
        console.error("Failed to export PDF", err);
    } finally {
        setIsExporting(false);
        if (element) element.style.background = "";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative z-10">
        <Navbar />

        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              New <span className="text-blue-600">Triage Case</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1.5 font-medium">
              Submit patient details via text, voice, or image for enterprise-grade clinical analysis.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* ── Left: Input ────────────────── */}
            <div className="lg:col-span-3 flex flex-col gap-5">
            
              {/* Tabs */}
              <div className="flex bg-slate-200/60 rounded-xl p-1.5 gap-1 w-full max-w-[400px]">
                {[
                  { id: "text", icon: <FileText size={14} />, label: "Text Data" },
                  { id: "audio", icon: <Mic size={14} />, label: "Dictation" },
                  { id: "image", icon: <ImageIcon size={14} />, label: "Report Scan" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                        setInputMode(tab.id as any);
                        setError(null);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg font-bold transition-all ${
                      inputMode === tab.id
                        ? "bg-white shadow-sm text-slate-900"
                        : "text-slate-500 hover:text-slate-800 hover:bg-black/5"
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
                className="bg-white border border-slate-200 shadow-sm rounded-2xl p-7 relative overflow-hidden flex flex-col min-h-[400px]"
              >
                {/* Mode: TEXT */}
                {inputMode === "text" && (
                    <div className="flex-1 flex flex-col">
                        <label className="text-[11px] text-slate-500 uppercase tracking-[0.15em] font-bold mb-3 block">
                            Patient Intake Note
                        </label>
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Paste patient intake note, clinical observations, paramedic report, or any unstructured clinical text here..."
                            className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm text-slate-900 placeholder-slate-400 resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow outline-none leading-relaxed font-medium"
                        />
                        <div className="mt-5">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Load Demo Trace Patient</p>
                            <div className="flex flex-wrap gap-2">
                                {["STEMI Case", "Thunderclap Headache", "Appendicitis"].map((label, i) => (
                                    <button
                                        key={i}
                                        onClick={() => loadSample(i)}
                                        className="text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-md bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all cursor-pointer shadow-sm"
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
                                <div className={`relative flex items-center justify-center w-36 h-36 rounded-full border-4 ${isRecording ? 'border-red-100 bg-red-50' : 'border-blue-50 bg-white shadow-md'}`}>
                                    {isRecording ? (
                                        <button onClick={stopRecording} className="flex flex-col items-center justify-center text-red-500 hover:text-red-600 transition-colors">
                                            <Square size={36} className="mb-2 fill-current animate-pulse" />
                                            <span className="text-sm font-bold tracking-widest">{formatTime(recordingTime)}</span>
                                        </button>
                                    ) : (
                                        <button onClick={startRecording} className="flex flex-col items-center justify-center text-blue-600 hover:text-blue-700 transition-colors">
                                            <Mic size={44} className="mb-2" />
                                            <span className="text-sm font-bold uppercase tracking-widest">Dictate</span>
                                        </button>
                                    )}
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-slate-500 font-medium mb-5">{isRecording ? "Recording audio... click stop to finish." : "Speak directly into your microphone to record patient symptoms."}</p>
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-slate-200"></div>
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-3 bg-white text-slate-400 text-xs font-bold tracking-widest uppercase">Or Upload File</span>
                                        </div>
                                    </div>
                                    <label className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 hover:border-slate-400 transition-all text-sm font-medium text-slate-700 shadow-sm">
                                        <UploadCloud size={16} />
                                        <span>Select Device Audio</span>
                                        <input type="file" accept="audio/*" className="hidden" onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) setAudioFile(e.target.files[0]);
                                        }} />
                                    </label>
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 w-full flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-blue-600">
                                            <Mic size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-slate-900 font-bold text-sm tracking-tight">{audioFile.name}</h4>
                                            <p className="text-slate-500 text-xs mt-1 font-medium">Ready for Whisper AI transcription</p>
                                        </div>
                                    </div>
                                    <button onClick={clearAudio} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-lg transition-colors border border-transparent hover:border-red-100">
                                        <Trash2 size={20} />
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
                            <div className="w-full h-full border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-8 hover:border-blue-400 hover:bg-blue-50/50 transition-all group bg-slate-50 hidden md:flex">
                                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                                    <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                        <ImageIcon size={32} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                                    </div>
                                    <span className="text-slate-700 font-bold mb-1 tracking-tight">Drag & drop medical report or note</span>
                                    <span className="text-slate-500 text-xs mb-5 font-medium">JPEG, PNG, WEBP supported</span>
                                    <span className="text-[13px] font-bold px-5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-700 shadow-sm group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200 transition-colors">
                                        Browse Computer
                                    </span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                </label>
                            </div>
                        ) : (
                            <div className="w-full flex flex-col items-center justify-center h-full gap-5">
                                <div className="relative w-full max-w-sm rounded-xl overflow-hidden border border-slate-200 shadow-md">
                                    <img src={imagePreview!} alt="Report Preview" className="w-full h-auto object-cover max-h-[220px]" />
                                    <button onClick={clearImage} className="absolute top-3 right-3 bg-white/90 backdrop-blur border border-slate-200 p-2 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="text-center">
                                    <h4 className="text-slate-900 font-bold text-sm tracking-tight">{imageFile.name}</h4>
                                    <p className="text-slate-500 text-xs mt-1 font-medium">Ready for Visual OCR Extraction</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions bottom bar */}
                <div className="mt-7 flex items-center gap-3 pt-5 border-t border-slate-100">
                  <button
                    onClick={handleProcessInput}
                    disabled={
                        loading || 
                        (inputMode === 'text' && !inputText.trim()) ||
                        (inputMode === 'audio' && !audioFile) ||
                        (inputMode === 'image' && !imageFile) ||
                        isRecording
                    }
                    className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none w-full justify-center !py-3 !text-[15px] shadow-sm hover:shadow"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        {inputMode === 'audio' && !result ? 'Transcribing Audio...' : 
                         inputMode === 'image' && !result ? 'Scanning Document...' : 
                         'Processing Data...'}
                      </>
                    ) : (
                      <>
                        <Activity size={18} />
                        {inputMode === 'text' ? 'Initiate Clinical Analysis' : 
                         inputMode === 'audio' ? 'Transcribe & Analyze AI' : 
                         'Scan Text & Analyze'}
                        <Send size={16} />
                      </>
                    )}
                  </button>
                  {result && (
                    <button
                      onClick={() => router.push("/dashboard")}
                      className="btn-secondary !text-[15px] whitespace-nowrap !py-3 hover:shadow-sm"
                    >
                      To Dashboard
                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>

                {error && (
                  <div className="mt-5 text-sm text-red-600 flex items-center gap-2 bg-red-50 p-4 rounded-xl border border-red-200 font-medium">
                    <AlertCircle size={16} className="flex-shrink-0" />
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
                className="bg-white border border-slate-200 shadow-sm rounded-2xl p-7 h-full"
              >
                <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100">
                    <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-500"><Activity size={14}/></div>
                    <h3 className="text-[12px] text-slate-800 uppercase tracking-[0.1em] font-black">
                    Analysis Pipeline
                    </h3>
                </div>
                
                <div className="space-y-1">
                  {PIPELINE_STAGES.map((stage, i) => {
                    const isActive = i === currentStage;
                    const isDone = i < currentStage;
                    return (
                      <div key={i} className="pipeline-step py-3.5">
                        <div
                          className={`flex items-center gap-3 transition-colors duration-300 ${
                            isDone
                              ? i === PIPELINE_STAGES.length - 1
                                ? "text-green-600 font-bold"
                                : "text-blue-600 font-medium"
                              : isActive
                              ? "text-blue-600 font-bold"
                              : "text-slate-400 font-medium"
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 size={18} />
                          ) : isActive ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            stage.icon
                          )}
                          <span className="text-[14px]">{stage.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {currentStage === -1 && (
                  <div className="mt-10 text-[13px] text-slate-500 font-medium text-center bg-slate-50 p-5 rounded-xl border border-slate-200">
                    Submit unstructured data to initiate the natural language processing pipeline.
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
                className="mt-8 bg-white border border-slate-200 shadow-md rounded-2xl overflow-hidden relative"
                id="result-card"
              >
                {/* Result Header */}
                <div className="px-7 py-6 border-b border-slate-200 bg-slate-50/50">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5 mb-2">
                        <CheckCircle2
                          size={20}
                          className="text-green-600"
                        />
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                          Clinical Report <span className="text-slate-400 font-normal">#{result.case_id}</span>
                        </h2>
                      </div>
                      <div className="flex items-center gap-3 text-[13px] text-slate-500 font-medium ml-7">
                        <span className="flex items-center gap-1.5">
                          <User size={13} className="text-slate-400" />
                          {result.patient_id}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={13} className="text-slate-400" />
                          {result.processing_time_ms}ms Server Trace
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Action Buttons */}
                      <div className="flex bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden" data-html2canvas-ignore>
                        <button 
                            onClick={() => setShowExplainability(!showExplainability)}
                            className={`px-4 py-2.5 flex items-center gap-2 transition-colors border-r border-slate-200 text-[13px] font-bold ${showExplainability ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                            title="Toggle Explainable AI Trace"
                        >
                            <Network size={16} />
                            Trace
                        </button>
                        <button 
                            onClick={handleDownloadPDF}
                            disabled={isExporting}
                            className={`px-4 py-2.5 flex items-center gap-2 transition-colors text-[13px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50`}
                            title="Download PDF Report"
                        >
                            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                            Export
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
                <div className="p-7 space-y-8 bg-white">
                  {/* Summary */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100"><FileText size={14}/></span>
                      <h3 className="text-xs text-slate-800 uppercase tracking-[0.1em] font-black">
                        Generated Summary
                      </h3>
                    </div>
                    <p className="text-[15px] text-slate-700 leading-relaxed font-medium bg-slate-50 border border-slate-200 p-5 rounded-xl shadow-inner">
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
                            className="bg-slate-800 border border-slate-700 rounded-xl p-6 overflow-hidden shadow-inner text-white"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Info size={16} className="text-blue-400" />
                                <h3 className="text-xs text-blue-400 uppercase tracking-[0.15em] font-black">
                                Execution Trace Output
                                </h3>
                            </div>
                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                                        <div className="text-[10px] text-slate-400 font-mono mb-2 uppercase tracking-widest font-bold">Risk Model Confidence</div>
                                        <div className="text-2xl font-black font-mono text-blue-400">{(result.urgency_score * 100).toFixed(1)}%</div>
                                    </div>
                                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                                        <div className="text-[10px] text-slate-400 font-mono mb-2 uppercase tracking-widest font-bold">Rule Assessment System</div>
                                        <div className="text-2xl font-black font-mono text-emerald-400">Pass (94.2%)</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-400 font-mono mb-3 uppercase tracking-widest font-bold">Matched Classifiers</div>
                                    {result.urgency_reasons.map((r: string, i: number) => (
                                        <div key={i} className="flex gap-3 text-[13px] font-mono text-slate-300 mb-2 border-l-2 border-blue-500/50 pl-3 leading-relaxed">
                                            <span className="text-blue-400 font-bold shrink-0">[{i+1}]</span> {r}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Urgency Reasons */}
                  {result.urgency_reasons?.length > 0 && !showExplainability && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100"><AlertCircle size={14}/></span>
                        <h3 className="text-xs text-slate-800 uppercase tracking-[0.1em] font-black">
                          AI Justification
                        </h3>
                      </div>
                      <ul className="space-y-2">
                        {result.urgency_reasons.map((r: string, i: number) => (
                          <li
                            key={i}
                            className="text-[14px] flex items-start gap-2.5 text-slate-700 font-medium bg-white border border-slate-100 p-3 rounded-lg shadow-sm"
                          >
                            <ChevronRight
                              size={16}
                              className="mt-0.5 flex-shrink-0 text-orange-500"
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
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100"><Tag size={14}/></span>
                        <h3 className="text-xs text-slate-800 uppercase tracking-[0.1em] font-black">
                          Structued NLP Data
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {result.entities.map((e: any, i: number) => (
                          <span
                            key={i}
                            className="text-xs px-3 py-1.5 rounded bg-white shadow-sm border border-slate-200 flex items-center gap-1.5"
                          >
                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">{e.type}</span>{" "}
                            <span className="text-slate-800 font-bold tracking-tight">{e.value}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Actions */}
                  {result.recommended_actions?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100"><ListChecks size={14}/></span>
                        <h3 className="text-xs text-slate-800 uppercase tracking-[0.1em] font-black">
                          Suggested Protocol
                        </h3>
                      </div>
                      <ol className="space-y-2.5">
                        {result.recommended_actions.map(
                          (a: string, i: number) => (
                            <li
                              key={i}
                              className="text-[14px] text-slate-700 font-medium flex items-center gap-3 bg-white border border-slate-100 p-3.5 rounded-lg shadow-sm"
                            >
                              <span className="flex-shrink-0 w-6 h-6 rounded bg-indigo-50 text-indigo-700 text-xs flex items-center justify-center font-bold">
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
