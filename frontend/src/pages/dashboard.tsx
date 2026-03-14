"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
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

const Scene3D = dynamic(() => import("@/components/3d/Scene3D"), { ssr: false });

export default function DashboardPage() {
  const [cases, setCases] = useState<DemoCase[]>([]);
  const [selected, setSelected] = useState<DemoCase | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Try to load from backend, fall back to demo data
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
    <div className="min-h-screen bg-[var(--bg-primary)] mesh-gradient">
      {mounted && <Scene3D variant="subtle" />}

      <div className="content-overlay">
        <Navbar criticalCount={criticalCount} />

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Clinical <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
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
            <div className="glass-subtle p-4 rounded-xl border border-white/5 flex flex-col gap-1">
              <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold flex items-center gap-1"><Clock size={12}/> ER Wait Time</span>
              <span className="text-xl font-bold text-white">45 min</span>
            </div>
            <div className="glass-subtle p-4 rounded-xl border border-orange-500/20 flex flex-col gap-1">
              <span className="text-xs text-orange-400 uppercase tracking-widest font-semibold flex items-center gap-1"><User size={12}/> Beds Available</span>
              <span className="text-xl font-bold text-orange-400">3 / 20</span>
            </div>
            <div className="glass-subtle p-4 rounded-xl border border-white/5 flex flex-col gap-1 md:col-span-2 bg-teal-500/5 py-3 justify-center">
              <span className="text-xs text-teal-400 uppercase tracking-widest font-semibold flex items-center gap-1 mb-1"><AlertCircle size={12}/> System Protocol</span>
              <span className="text-sm font-medium text-teal-300">High volume mode active. AI-flagged Critical cases bypass standard triage sequence and jump the queue.</span>
            </div>
          </motion.div>

          {/* Main Layout */}
          <div className="flex flex-col lg:flex-row gap-5">
            {/* ── Left: Case Queue ────────────── */}
            <div className="lg:w-[380px] flex-shrink-0">
              <div className="glass rounded-2xl overflow-hidden">
                {/* Search & Filter */}
                <div className="p-4 border-b border-white/5 space-y-3">
                  <div className="relative">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <input
                      type="text"
                      placeholder="Search cases..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/8 rounded-lg py-2 pl-9 pr-3 text-sm text-white placeholder-gray-500 focus:border-teal-500/40"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Filter size={13} className="text-gray-500" />
                    {["all", "critical", "high", "medium", "low"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                          filter === f
                            ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                            : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Queue Header */}
                <div className="px-4 py-2 text-[10px] text-gray-500 uppercase tracking-[0.15em] font-semibold border-b border-white/5">
                  Case Queue — {filteredCases.length} cases
                </div>

                {/* Case List */}
                <div className="max-h-[calc(100vh-380px)] overflow-y-auto">
                  {filteredCases.length === 0 && (
                    <div className="p-8 text-center text-gray-600 text-sm">
                      No cases match your filters
                    </div>
                  )}
                  {filteredCases.map((c, i) => (
                    <motion.div
                      key={c.case_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setSelected(c)}
                      className={`px-4 py-3.5 border-b border-white/4 cursor-pointer transition-all duration-200 urgency-${c.urgency} ${
                        selected?.case_id === c.case_id
                          ? "bg-teal-500/8 border-l-teal-400"
                          : "hover:bg-white/3"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-500 font-mono">
                          #{c.case_id}
                        </span>
                        <UrgencyBadge urgency={c.urgency} size="sm" />
                      </div>
                      <div className="text-sm text-gray-300 line-clamp-2 leading-relaxed">
                        {c.summary}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 text-[11px] text-gray-600">
                          <User size={11} />
                          {c.patient_id}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-gray-600">
                          <Clock size={11} />
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
                    className="glass rounded-2xl h-full min-h-[400px] flex flex-col items-center justify-center text-center p-10"
                  >
                    <Stethoscope
                      size={48}
                      className="text-gray-700 mb-4 animate-float"
                    />
                    <p className="text-gray-500 text-sm mb-1">
                      Select a case from the queue
                    </p>
                    <p className="text-gray-600 text-xs">
                      Click on any case card to view detailed triage information
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
      className="glass rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-white">
                Case #{caseData.case_id}
              </h2>
              <span
                className={`text-xs px-2 py-0.5 rounded-md capitalize font-medium ${
                  caseData.status === "pending"
                    ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25"
                    : caseData.status === "in_review"
                    ? "bg-blue-500/15 text-blue-400 border border-blue-500/25"
                    : "bg-green-500/15 text-green-400 border border-green-500/25"
                }`}
              >
                {caseData.status?.replace("_", " ")}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <User size={13} />
                {caseData.patient_id}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock size={13} />
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
      <div className="p-6 space-y-6 max-h-[calc(100vh-380px)] overflow-y-auto">
        {/* Urgency Meter */}
        <div className="glass-subtle p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Urgency Score
            </span>
            <span className="text-sm font-bold text-white">
              {Math.round(caseData.urgency_score * 100)}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${caseData.urgency_score * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${
                caseData.urgency === "critical"
                  ? "bg-gradient-to-r from-red-600 to-red-400"
                  : caseData.urgency === "high"
                  ? "bg-gradient-to-r from-orange-600 to-orange-400"
                  : caseData.urgency === "medium"
                  ? "bg-gradient-to-r from-yellow-600 to-yellow-400"
                  : "bg-gradient-to-r from-green-600 to-green-400"
              }`}
            />
          </div>
        </div>

        {/* Clinical Summary */}
        <DetailSection title="Clinical Summary" icon={<FileText size={15} />}>
          <p className="text-sm text-gray-300 leading-relaxed">{caseData.summary}</p>
        </DetailSection>

        {/* Urgency Reasons */}
        <DetailSection
          title="Urgency Indicators"
          icon={<AlertCircle size={15} />}
        >
          <ul className="space-y-2">
            {caseData.urgency_reasons?.map((r, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`text-sm flex items-start gap-2 ${
                  caseData.urgency === "critical"
                    ? "text-red-400"
                    : caseData.urgency === "high"
                    ? "text-orange-400"
                    : "text-yellow-400"
                }`}
              >
                <ChevronRight size={14} className="mt-0.5 flex-shrink-0" />
                <span>{r}</span>
              </motion.li>
            ))}
          </ul>
        </DetailSection>

        {/* Extracted Entities */}
        <DetailSection title="Extracted Entities" icon={<Tag size={15} />}>
          <div className="flex flex-wrap gap-2">
            {caseData.entities?.map((e, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="text-xs px-2.5 py-1.5 rounded-lg glass-subtle border border-white/5 hover:border-teal-500/20 transition-colors"
              >
                <span className="text-gray-500 mr-1">{e.type}:</span>
                <span className="text-gray-200">{e.value}</span>
                <span className="text-gray-600 ml-1.5 text-[10px]">
                  {Math.round(e.confidence * 100)}%
                </span>
              </motion.span>
            ))}
          </div>
        </DetailSection>

        {/* Recommended Actions */}
        <DetailSection
          title="Recommended Actions"
          icon={<ListChecks size={15} />}
        >
          <ol className="space-y-2">
            {caseData.recommended_actions?.map((a, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="text-sm text-gray-300 flex items-start gap-3"
              >
                <span className="flex-shrink-0 w-5 h-5 rounded-md bg-teal-500/15 text-teal-400 text-xs flex items-center justify-center font-bold border border-teal-500/20">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{a}</span>
              </motion.li>
            ))}
          </ol>
        </DetailSection>

        {/* Original Note */}
        <DetailSection title="Original Note" icon={<FileText size={15} />}>
          <div className="text-xs text-gray-500 leading-relaxed bg-white/[0.03] rounded-xl p-4 border border-white/5 font-mono">
            {caseData.original_text}
          </div>
        </DetailSection>

        {/* Advisory */}
        <div className="flex items-center gap-2 text-[11px] text-gray-600 pt-2">
          <AlertCircle size={12} />
          Advisory only — all clinical decisions remain with the healthcare professional.
          Processed in {caseData.processing_time_ms}ms.
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
      <div className="flex items-center gap-2 mb-3">
        <span className="text-teal-400">{icon}</span>
        <h3 className="text-xs text-teal-400 uppercase tracking-[0.12em] font-bold">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}
