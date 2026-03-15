"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain,
  ShieldCheck,
  BarChart3,
  ArrowRight,
  Mic,
  FileText,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import LiveDesignCanvas from "@/components/shared/LiveDesignCanvas";

const fadeUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const features = [
  {
    icon: <Brain size={24} className="text-blue-600" />,
    title: "AI-Powered Summarization",
    desc: "Extracts structured clinical summaries from unstructured patient text or audio effortlessly.",
  },
  {
    icon: <Sparkles size={24} className="text-blue-600" />,
    title: "Entity Extraction",
    desc: "Automatically identifies symptoms, vitals, medications, risk factors, and timelines.",
  },
  {
    icon: <ShieldCheck size={24} className="text-blue-600" />,
    title: "Urgency Classification",
    desc: "ML classifier strictly assigns priority with transparent, evidence-based reasoning.",
  },
  {
    icon: <BarChart3 size={24} className="text-blue-600" />,
    title: "Real-Time Dashboard",
    desc: "Review prioritized cases in real-time with clean, rapid actionable insights.",
  },
];

const pipeline = [
  { icon: <FileText size={18} className="text-slate-600" />, label: "Data Ingestion" },
  { icon: <Mic size={18} className="text-slate-600" />, label: "Speech Transcription" },
  { icon: <Brain size={18} className="text-slate-600" />, label: "LLM Processing" },
  { icon: <Sparkles size={18} className="text-slate-600" />, label: "Entity Extraction" },
  { icon: <ShieldCheck size={18} className="text-slate-600" />, label: "Risk Stratification" },
  { icon: <BarChart3 size={18} className="text-slate-600" />, label: "Clinical Dashboard" },
];

function PolicyCard({ feat, i }: { feat: any; i: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      custom={i + 2}
      className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-5">
        {feat.icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{feat.title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{feat.desc}</p>
    </motion.div>
  );
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      {/* ═══ Hero Section ═══ */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden">
        {/* Mesh-style Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-slate-100 to-blue-50" />

          <div
            className="absolute inset-0 opacity-50 hero-grid-shift"
            style={{
              backgroundImage:
                "linear-gradient(rgba(148,163,184,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.28) 1px, transparent 1px)",
              backgroundSize: "46px 46px",
            }}
          />

          <div className="absolute -top-24 -left-24 h-[30rem] w-[30rem] rounded-full bg-blue-300/35 blur-3xl hero-float-slow" />
          <div className="absolute top-12 right-0 h-[26rem] w-[26rem] rounded-full bg-cyan-300/40 blur-3xl hero-float-medium" />
          <div className="absolute -bottom-20 right-1/4 h-[22rem] w-[22rem] rounded-full bg-blue-200/35 blur-3xl hero-float-slow" />
          <div className="absolute -bottom-12 -left-8 h-[18rem] w-[18rem] rounded-full bg-sky-300/35 blur-3xl hero-float-medium" />
          <div className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-cyan-200/25 blur-3xl hero-float-slow" />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.85),transparent_50%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.75),transparent_40%),radial-gradient(circle_at_70%_75%,rgba(255,255,255,0.6),transparent_45%)]" />

          <svg
            viewBox="0 0 1400 900"
            className="absolute inset-0 w-full h-full opacity-65 hero-network-drift"
            preserveAspectRatio="none"
          >
            <g stroke="rgb(226 232 240 / 1)" strokeWidth="2" fill="none" opacity="0.92">
              <path d="M120 210L310 290L470 180L670 255L870 170L1110 250L1280 150" />
              <path d="M80 560L260 520L430 610L620 520L800 610L1020 530L1260 610" />
              <path d="M210 130L170 330L350 430L310 630" />
              <path d="M620 140L560 360L760 450L720 690" />
              <path d="M1050 100L980 320L1180 420L1120 690" />
              <path d="M330 300L560 360L760 250L980 320" />
              <path d="M170 330L560 360L980 320" />
            </g>
            <g fill="rgb(255 255 255 / 0.95)">
              <circle className="hero-node-pulse" cx="120" cy="210" r="6" />
              <circle className="hero-node-pulse" cx="310" cy="290" r="6" />
              <circle className="hero-node-pulse" cx="470" cy="180" r="6" />
              <circle className="hero-node-pulse" cx="670" cy="255" r="6" />
              <circle className="hero-node-pulse" cx="870" cy="170" r="6" />
              <circle className="hero-node-pulse" cx="1110" cy="250" r="6" />
              <circle className="hero-node-pulse" cx="1280" cy="150" r="6" />
              <circle className="hero-node-pulse" cx="260" cy="520" r="6" />
              <circle className="hero-node-pulse" cx="430" cy="610" r="6" />
              <circle className="hero-node-pulse" cx="620" cy="520" r="6" />
              <circle className="hero-node-pulse" cx="800" cy="610" r="6" />
              <circle className="hero-node-pulse" cx="1020" cy="530" r="6" />
              <circle className="hero-node-pulse" cx="1260" cy="610" r="6" />
              <circle className="hero-node-pulse" cx="560" cy="360" r="5" />
              <circle className="hero-node-pulse" cx="760" cy="250" r="5" />
            </g>
          </svg>

          <svg
            viewBox="0 0 1400 900"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full opacity-55"
          >
            <g stroke="rgb(226 232 240 / 0.8)" strokeWidth="1.8" fill="none">
              <path d="M1020 720V530" />
              <path d="M1140 760V560" />
              <path d="M1240 760V520" />
              <path d="M920 760H1250V700H1040" />
              <path d="M530 780H760V710H620" />
              <path d="M610 710V520" />
            </g>
            <g fill="rgb(255 255 255 / 0.9)">
              <circle cx="1020" cy="530" r="5" />
              <circle cx="1140" cy="560" r="4.5" />
              <circle cx="1240" cy="520" r="4.5" />
              <circle cx="1240" cy="700" r="4.5" />
              <circle cx="760" cy="710" r="4.5" />
            </g>
            <g fill="rgb(226 232 240 / 0.95)" opacity="0.75">
              <rect x="560" y="610" width="110" height="190" />
              <rect x="590" y="735" width="200" height="45" />
              <rect x="1180" y="300" width="55" height="160" />
              <rect x="420" y="480" width="85" height="140" />
              <rect x="1080" y="580" width="120" height="60" />
            </g>
            <g fill="rgb(255 255 255 / 0.8)">
              <circle cx="1230" cy="360" r="5" />
              <circle cx="1230" cy="385" r="5" />
              <circle cx="1230" cy="410" r="5" />
              <circle cx="1230" cy="435" r="5" />
              <circle cx="1205" cy="360" r="5" />
              <circle cx="1205" cy="385" r="5" />
              <circle cx="1205" cy="410" r="5" />
              <circle cx="1205" cy="435" r="5" />
              <circle cx="1180" cy="360" r="5" />
              <circle cx="1180" cy="385" r="5" />
              <circle cx="1180" cy="410" r="5" />
              <circle cx="1180" cy="435" r="5" />
            </g>
          </svg>

          <svg
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
            className="absolute bottom-0 left-0 w-full h-[42%] opacity-75 hero-wave-drift"
          >
            <path
              fill="none"
              stroke="rgb(226 232 240 / 0.95)"
              strokeWidth="2"
              d="M0,150 C220,80 320,230 520,150 C720,70 860,220 1080,145 C1240,95 1330,150 1440,130"
            />
            <path
              fill="none"
              stroke="rgb(226 232 240 / 0.95)"
              strokeWidth="2"
              d="M0,168 C210,98 330,245 520,168 C700,94 880,245 1080,168 C1250,108 1320,175 1440,154"
            />
            <path
              fill="none"
              stroke="rgb(226 232 240 / 0.95)"
              strokeWidth="2"
              d="M0,186 C205,116 325,260 520,186 C710,114 890,260 1080,186 C1250,126 1320,194 1440,174"
            />
            <path
              fill="none"
              stroke="rgb(226 232 240 / 0.9)"
              strokeWidth="2"
              d="M0,204 C210,136 325,278 520,204 C705,132 885,278 1080,205 C1240,146 1320,212 1440,194"
            />
            <path
              fill="none"
              stroke="rgb(226 232 240 / 0.9)"
              strokeWidth="2"
              d="M0,222 C210,154 325,294 520,222 C705,150 885,294 1080,223 C1240,164 1320,230 1440,214"
            />
            <path
              fill="none"
              stroke="rgb(226 232 240 / 0.85)"
              strokeWidth="2"
              d="M0,240 C212,172 326,310 520,240 C706,168 885,310 1080,241 C1240,182 1320,248 1440,234"
            />
            <path
              fill="none"
              stroke="rgb(226 232 240 / 0.8)"
              strokeWidth="2"
              d="M0,258 C214,190 328,326 520,258 C708,186 887,326 1080,259 C1240,200 1320,264 1440,252"
            />
          </svg>

          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/40 via-slate-50/35 to-transparent" />
        </div>

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/50 text-blue-700 text-sm font-medium mb-8 border border-blue-200">
               Engineering Modern Healthcare
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight text-slate-900">
              Triage<span className="text-blue-600">IQ</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Transform unstructured patient interactions into structured clinical intelligence.
              An enterprise-grade triage platform for the modern hospital.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="btn-primary py-3 px-6 text-[15px]">
                Open Dashboard
                <ArrowRight size={18} />
              </Link>
              <Link href="/new-case" className="btn-secondary py-3 px-6 text-[15px]">
                Analyze Patient Note
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <ChevronDown size={24} className="text-slate-400 animate-bounce" />
          </motion.div>
        </div>
      </section>

      <section className="relative px-6 py-20 bg-white border-t border-slate-200 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 via-transparent to-slate-50/20" />
          <div className="absolute -top-40 -right-32 h-96 w-96 rounded-full bg-cyan-200/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-blue-200/15 blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Interactive Product Design
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <LiveDesignCanvas />
          </motion.div>
        </div>
      </section>

      {/* ═══ Features Grid ═══ */}
      <section className="relative px-6 py-24 bg-white border-t border-slate-200 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/20 via-transparent to-blue-50/25" />
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "linear-gradient(rgba(226,232,240,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(226,232,240,0.15) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />
          <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-48 h-80 w-80 rounded-full bg-cyan-200/18 blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Enterprise Capabilities
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              Streamlining clinical workflows through robust data processing and analysis.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, i) => (
              <PolicyCard key={i} feat={feat} i={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Pipeline Section ═══ */}
      <section className="relative px-6 py-24 bg-slate-50 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/25 via-transparent to-slate-100/20" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(rgba(148,163,184,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.2) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div className="absolute -top-32 right-1/4 h-80 w-80 rounded-full bg-blue-200/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-sky-200/18 blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              System Architecture
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto text-lg">
              A transparent, highly-available pipeline moving from raw data to actionable insight.
            </p>
          </motion.div>

          <div className="relative max-w-md mx-auto">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-300 hidden md:block" />
            <div className="space-y-4">
              {pipeline.map((step, i) => (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i + 2}
                  className="flex items-center gap-5"
                >
                  <div className="relative z-10 w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                    {step.icon}
                  </div>
                  <div className="bg-white border border-slate-200 px-6 py-4 rounded-lg flex-1 shadow-sm flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{step.label}</span>
                    <span className="text-xs font-medium text-slate-400">Step 0{i + 1}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="relative px-6 py-10 bg-white border-t border-slate-200 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-50/40 via-transparent to-transparent" />
          <div className="absolute -bottom-20 -right-32 h-64 w-64 rounded-full bg-cyan-200/15 blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500 font-medium relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white text-[11px] font-bold">
              T
            </div>
            <span className="text-slate-900 font-semibold">TriageIQ</span>
          </div>
          <div>
            Built at HackCrux 2026 | Engineered by <a href="https://github.com/piyushinfo/TriageIQ" target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors">Piyush Sharma</a>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            Internal evaluation system only
          </div>
        </div>
      </footer>
    </div>
  );
}
