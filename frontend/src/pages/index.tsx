"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain,
  ShieldCheck,
  Zap,
  BarChart3,
  ArrowRight,
  Mic,
  FileText,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import Navbar from "@/components/shared/Navbar";

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

      {/* ═══ Video Hero Section ═══ */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden">
        {/* Abstract Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-[0.35] mix-blend-multiply"
          >
            <source
              src="https://assets.mixkit.co/videos/preview/mixkit-white-abstract-architecture-loop-42289-large.mp4"
              type="video/mp4"
            />
          </video>
          {/* Subtle gradient overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-slate-50/95 to-slate-50" />
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

      {/* ═══ Features Grid ═══ */}
      <section className="px-6 py-24 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
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
      <section className="px-6 py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto">
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
      <footer className="px-6 py-10 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500 font-medium">
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
