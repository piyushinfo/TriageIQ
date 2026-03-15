"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { triageAPI } from "@/utils/api";
import { DEMO_CASES, DemoCase } from "@/utils/demoData";
import Navbar from "@/components/shared/Navbar";
import StatsBar from "@/components/shared/StatsBar";
import UrgencyBadge from "@/components/shared/UrgencyBadge";
import {
  FileText,
  Clock,
  Tag,
  ListChecks,
  ChevronRight,
  Search,
  Filter,
  User,
  Stethoscope,
  AlertCircle,
} from "lucide-react";

export default function DashboardPage() {
  const [cases, setCases] = useState<DemoCase[]>([]);
  const [selected, setSelected] = useState<DemoCase | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    triageAPI
      .getAllCases()
      .then((res) => {
        const backendCases = res.data.cases || [];
        if (backendCases.length > 0) {
          setCases(backendCases);
        } else {
          setCases(DEMO_CASES);
        }
      })
      .catch(() => {
        setCases(DEMO_CASES);
      });
  }, []);

  const filteredCases = cases.filter((c) => {
    const matchesFilter = filter === "all" || c.urgency === filter;
    const matchesSearch =
      !searchQuery ||
      c.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.case_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patient_id?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const criticalCount = cases.filter((c) => c.urgency === "critical").length;
  const highCount = cases.filter((c) => c.urgency === "high").length;
  const pendingCount = cases.filter((c) => c.status === "pending").length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative z-10">
        <Navbar criticalCount={criticalCount} />

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Clinical <span className="text-blue-600">Dashboard</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1.5 font-medium">
              Real-time case queue — prioritized by AI urgency classification
            </p>
          </motion.div>

          {/* Stats Bar */}
          <StatsBar
            totalCases={cases.length}
            criticalCount={criticalCount}
            highCount={highCount}
            pendingCount={pendingCount}
          />

          {/* Hospital Capacity Mock */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-1 shadow-sm">
              <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold flex items-center gap-1.5"><Clock size={12} className="text-slate-400"/> ER Wait Time</span>
              <span className="text-xl font-bold text-slate-900">45 min</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-orange-200 flex flex-col gap-1 shadow-sm">
              <span className="text-xs text-orange-600 uppercase tracking-widest font-semibold flex items-center gap-1.5"><User size={12}/> Beds Available</span>
              <span className="text-xl font-bold text-orange-600">3 / 20</span>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col gap-1 shadow-sm md:col-span-2 py-3 justify-center">
              <span className="text-xs text-blue-700 uppercase tracking-widest font-bold flex items-center gap-1 mb-1"><AlertCircle size={14}/> System Protocol Active</span>
              <span className="text-sm font-medium text-blue-900">High volume mode is currently engaged. AI-flagged Critical cases bypass standard triage sequence and jump immediately to the top of the queue.</span>
            </div>
          </motion.div>

          {/* Main Layout */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* ── Left: Case Queue ────────────── */}
            <div className="lg:w-[400px] flex-shrink-0">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-280px)] min-h-[500px]">
                {/* Search & Filter */}
                <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50">
                  <div className="relative">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      placeholder="Search cases by ID or summary..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-shadow"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                    <Filter size={13} className="text-slate-400 flex-shrink-0" />
                    {["all", "critical", "high", "medium", "low"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                          filter === f
                            ? "bg-slate-800 text-white shadow-sm"
                            : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-100 hover:text-slate-800"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Queue Header */}
                <div className="px-4 py-3 bg-white text-[10px] text-slate-400 uppercase tracking-[0.15em] font-bold border-b border-slate-100 flex justify-between">
                  <span>Queue Roster</span>
                  <span>{filteredCases.length} Cases</span>
                </div>

                {/* Case List */}
                <div className="flex-1 overflow-y-auto bg-white">
                  {filteredCases.length === 0 && (
                    <div className="p-8 text-center text-slate-500 font-medium text-sm flex flex-col items-center">
                      <Filter size={24} className="mb-2 text-slate-300" />
                      No cases match current filters
                    </div>
                  )}
                  {filteredCases.map((c, i) => (
                    <motion.div
                      key={c.case_id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i * 0.05, 0.5) }}
                      onClick={() => setSelected(c)}
                      className={`px-4 py-4 border-b border-slate-100 cursor-pointer transition-all duration-200 urgency-${c.urgency} ${
                        selected?.case_id === c.case_id
                          ? "bg-blue-50"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] text-slate-400 font-bold tracking-wider font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                          #{c.case_id}
                        </span>
                        <UrgencyBadge urgency={c.urgency} size="sm" />
                      </div>
                      <div className="text-sm font-medium text-slate-700 line-clamp-2 leading-relaxed mb-3">
                        {c.summary}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <User size={12} className="text-slate-400" />
                          {c.patient_id}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                          <Clock size={12} />
                          {c.processing_time_ms}ms
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right: Case Detail ─────────── */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                {selected ? (
                  <CaseDetailPanel key={selected.case_id} caseData={selected} />
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white border border-slate-200 shadow-sm rounded-xl h-[calc(100vh-280px)] min-h-[500px] flex flex-col items-center justify-center text-center p-10"
                  >
                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                       <Stethoscope size={36} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">No Case Selected</h3>
                    <p className="text-slate-500 text-sm max-w-sm">
                      Select a patient case from the queue roster on the left to view detailed triage and analysis information.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Case Detail Panel
   ═══════════════════════════════════════════════ */
function CaseDetailPanel({ caseData }: { caseData: DemoCase }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden flex flex-col h-[calc(100vh-280px)] min-h-[500px]"
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Case Report <span className="text-slate-400 font-normal">#{caseData.case_id}</span>
              </h2>
              <span
                className={`text-[10px] px-2.5 py-1 rounded-md uppercase font-bold tracking-wider ${
                  caseData.status === "pending"
                    ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                    : caseData.status === "in_review"
                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                    : "bg-green-100 text-green-800 border border-green-200"
                }`}
              >
                {caseData.status?.replace("_", " ")}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <User size={14} className="text-slate-400" />
                Patient: <span className="text-slate-700">{caseData.patient_id}</span>
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-slate-400" />
                {new Date(caseData.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
          <UrgencyBadge
            urgency={caseData.urgency}
            score={caseData.urgency_score}
            size="lg"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 bg-white">
        {/* Urgency Meter */}
        <div className="bg-slate-50 border border-slate-100 p-5 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] text-slate-500 uppercase tracking-[0.15em] font-bold">
              Computed Urgency Score
            </span>
            <span className="text-lg font-black text-slate-900">
              {Math.round(caseData.urgency_score * 100)}%
            </span>
          </div>
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${caseData.urgency_score * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${
                caseData.urgency === "critical"
                  ? "bg-red-500"
                  : caseData.urgency === "high"
                  ? "bg-orange-500"
                  : caseData.urgency === "medium"
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
            />
          </div>
        </div>

        {/* Clinical Summary */}
        <DetailSection title="Clinical Summary" icon={<FileText size={16} />}>
          <p className="text-[15px] text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-lg border border-slate-100">{caseData.summary}</p>
        </DetailSection>

        {/* Urgency Reasons */}
        <DetailSection
          title="Clinical Justification (AI Trace)"
          icon={<AlertCircle size={16} />}
        >
          <ul className="space-y-3">
            {caseData.urgency_reasons?.map((r, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`text-[14px] flex items-start gap-3 p-3 rounded-lg border ${
                  caseData.urgency === "critical"
                    ? "bg-red-50 border-red-100 text-red-900 font-medium"
                    : caseData.urgency === "high"
                    ? "bg-orange-50 border-orange-100 text-orange-900 font-medium"
                    : "bg-yellow-50 border-yellow-100 text-yellow-900 font-medium"
                }`}
              >
                <div className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 relative top-1.5 ${
                  caseData.urgency === "critical" ? "bg-red-500" : caseData.urgency === "high" ? "bg-orange-500" : "bg-yellow-500"
                }`} />
                <span>{r}</span>
              </motion.li>
            ))}
          </ul>
        </DetailSection>

        {/* Extracted Entities */}
        <DetailSection title="Structured Entities" icon={<Tag size={16} />}>
          <div className="flex flex-wrap gap-2.5">
            {caseData.entities?.map((e, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="text-xs px-3 py-1.5 rounded bg-white border border-slate-200 shadow-sm hover:border-blue-300 transition-colors flex items-center gap-1.5"
              >
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">{e.type}</span>
                <span className="text-slate-800 font-medium">{e.value}</span>
                <span className="text-blue-600 font-bold ml-1 text-[10px]">
                  {Math.round(e.confidence * 100)}%
                </span>
              </motion.span>
            ))}
          </div>
        </DetailSection>

        {/* Recommended Actions */}
        <DetailSection
          title="Protocol Recommendations"
          icon={<ListChecks size={16} />}
        >
          <ol className="space-y-3">
            {caseData.recommended_actions?.map((a, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="text-sm text-slate-700 flex items-start gap-3 bg-white border border-slate-100 p-3 rounded-lg shadow-sm"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded bg-slate-100 text-slate-600 text-xs flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                <span className="leading-relaxed font-medium pt-0.5">{a}</span>
              </motion.li>
            ))}
          </ol>
        </DetailSection>

        {/* Original Note */}
        <DetailSection title="Original Transcript" icon={<FileText size={16} />}>
          <div className="text-[13px] text-slate-500 leading-relaxed bg-slate-50 rounded-lg p-5 border border-slate-200 font-mono shadow-inner whitespace-pre-wrap">
            {caseData.original_text}
          </div>
        </DetailSection>

        {/* Advisory */}
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium pt-4 pb-2 border-t border-slate-100">
          <AlertCircle size={14} className="text-amber-500" />
          Advisory only — all clinical decisions remain with the healthcare professional. Processed in {caseData.processing_time_ms}ms.
        </div>
      </div>
    </motion.div>
  );
}

function DetailSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-blue-600 bg-blue-50 p-1.5 rounded flex items-center justify-center border border-blue-100">{icon}</span>
        <h3 className="text-sm text-slate-900 font-bold tracking-tight">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}
