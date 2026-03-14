"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { MouseEvent as ReactMouseEvent } from "react";
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

const Scene3D = dynamic(() => import("@/components/3d/Scene3D"), { ssr: false });

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
    icon: <Brain size={28} />,
    title: "AI-Powered Summarization",
    desc: "GPT-4o extracts structured clinical summaries from unstructured patient text or audio in seconds.",
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    icon: <Sparkles size={28} />,
    title: "NER Entity Extraction",
    desc: "Automatically identifies symptoms, vitals, medications, risk factors, and timelines using NLP.",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    icon: <ShieldCheck size={28} />,
    title: "Urgency Classification",
    desc: "ML-powered classifier assigns Critical / High / Medium / Low urgency with transparent reasoning.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: <BarChart3 size={28} />,
    title: "Real-Time Dashboard",
    desc: "Clinicians see prioritized cases in real-time with structured cards and actionable insights.",
    gradient: "from-purple-500 to-pink-500",
  },
];

const pipeline = [
  { icon: <FileText size={20} />, label: "Text / Audio Input", color: "text-cyan-400" },
  { icon: <Mic size={20} />, label: "Speech-to-Text (Whisper)", color: "text-blue-400" },
  { icon: <Brain size={20} />, label: "LLM Summarization", color: "text-teal-400" },
  { icon: <Sparkles size={20} />, label: "NER Extraction", color: "text-purple-400" },
  { icon: <ShieldCheck size={20} />, label: "Urgency Classifier", color: "text-orange-400" },
  { icon: <BarChart3 size={20} />, label: "Dashboard Output", color: "text-green-400" },
];

function SpotlightCard({ feat, i }: { feat: any; i: number }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: ReactMouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      custom={i + 2}
      onMouseMove={handleMouseMove}
      className="relative glass-card group cursor-default overflow-hidden p-6"
    >
      {/* Magic Spotlight hover effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100 hidden md:block"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              rgba(20, 184, 166, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center text-white mb-4 shadow-[0_0_20px_rgba(20,184,166,0.3)] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(20,184,166,0.6)] transition-all duration-300`}>
          {feat.icon}
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{feat.desc}</p>
      </div>
    </motion.div>
  );
}

function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const mouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", mouseMove);
    return () => window.removeEventListener("mousemove", mouseMove);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full border border-teal-500/50 pointer-events-none z-[100] items-center justify-center mix-blend-screen hidden lg:flex shadow-[0_0_15px_rgba(20,184,166,0.3)]"
      animate={{ x: mousePosition.x - 16, y: mousePosition.y - 16 }}
      transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.1 }}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_10px_2px_rgba(45,212,191,1)]" />
    </motion.div>
  );
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] mesh-gradient cursor-default">
      <CustomCursor />
      {mounted && <Scene3D variant="full" />}

      <div className="content-overlay">
        <Navbar />

        {/* ═══ Hero Section ═══ */}
        <section className="min-h-[90vh] flex items-center justify-center px-6 py-20 relative">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold mb-8 backdrop-blur-sm"
              >
                <Zap size={12} />
                HackCrux 2026 — AI-Powered Clinical Intelligence
              </motion.div>

              {/* Title with Blur Reveal */}
              <motion.h1 
                initial={{ opacity: 0, filter: "blur(20px)", y: 20 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-[0.95] tracking-tight relative"
              >
                <motion.span 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 2 }}
                  className="absolute -inset-x-8 -inset-y-4 bg-teal-500/20 blur-[80px] rounded-full z-0 pointer-events-none"
                />
                <span className="text-white relative z-10">Triage</span>
                <span className="gradient-text relative z-10">IQ</span>
              </motion.h1>

              <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                Transform unstructured patient notes into{" "}
                <span className="text-teal-400 font-semibold">structured clinical intelligence</span>.
                AI-powered triage that empowers clinicians with instant, evidence-based prioritization.
              </p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link href="/dashboard" className="btn-primary text-base">
                  <BarChart3 size={18} />
                  Open Dashboard
                  <ArrowRight size={16} />
                </Link>
                <Link href="/new-case" className="btn-secondary text-base">
                  <Zap size={18} />
                  Try Triage Now
                </Link>
              </motion.div>
              
              {/* Developer Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-12 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl glass border border-white/5 hover:border-teal-500/30 transition-colors shadow-lg group cursor-default"
              >
                <span className="text-gray-400 text-sm">Developed by</span>
                <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent font-bold tracking-wide group-hover:drop-shadow-[0_0_8px_rgba(45,212,191,0.5)] transition-all">
                  Piyush Sharma
                </span>
                <Sparkles size={14} className="text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
              <ChevronDown size={24} className="text-gray-600 animate-bounce" />
            </motion.div>
          </div>
        </section>

        {/* ═══ Pipeline Section ═══ */}
        <section className="px-6 py-20 relative">
          <div className="max-w-4xl mx-auto">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
              className="text-3xl md:text-4xl font-bold text-center mb-4"
            >
              How <span className="gradient-text">TriageIQ</span> Works
            </motion.h2>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={1}
              className="text-gray-400 text-center mb-14 max-w-xl mx-auto"
            >
              A multi-stage AI pipeline processes patient data in seconds
            </motion.p>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/30 via-teal-500/30 to-transparent hidden md:block" />

              <div className="space-y-6">
                {pipeline.map((step, i) => (
                  <motion.div
                    key={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    custom={i + 2}
                    className="flex items-center gap-5 group"
                  >
                    <div className={`relative z-10 w-12 h-12 rounded-xl glass-subtle flex items-center justify-center ${step.color} group-hover:scale-110 transition-transform`}>
                      {step.icon}
                    </div>
                    <div className="glass-subtle px-5 py-3 flex-1 group-hover:border-teal-500/20 transition-colors">
                      <span className="text-sm font-semibold text-white">{step.label}</span>
                      <span className="text-xs text-gray-500 ml-3">Stage {i + 1}</span>
                    </div>
                    {i < pipeline.length - 1 && (
                      <ArrowRight size={16} className="text-gray-600 hidden md:block" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Features Grid ═══ */}
        <section className="px-6 py-20">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
              className="text-3xl md:text-4xl font-bold text-center mb-4"
            >
              Intelligent <span className="gradient-text">Features</span>
            </motion.h2>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={1}
              className="text-gray-400 text-center mb-14 max-w-xl mx-auto"
            >
              Built with cutting-edge AI to support clinicians in emergency and triage workflows
            </motion.p>

              {features.map((feat, i) => (
                <SpotlightCard key={i} feat={feat} i={i} />
              ))}
          </div>
        </section>

        {/* ═══ CTA Section ═══ */}
        <section className="px-6 py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="max-w-3xl mx-auto glass p-10 md:p-14 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to <span className="gradient-text">Transform Triage</span>?
              </h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                Start analyzing patient cases with AI-powered clinical intelligence. No real patient data — fully synthetic and safe.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/new-case" className="btn-primary">
                  <Zap size={18} />
                  Analyze a Case
                  <ArrowRight size={16} />
                </Link>
                <Link href="/dashboard" className="btn-secondary">
                  View Dashboard
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ═══ Footer ═══ */}
        <footer className="px-6 py-8 border-t border-white/5">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-black text-[10px] font-black">T</div>
              <span>TriageIQ — AI-Powered Intelligent Triage</span>
            </div>
            <div>
              Built with ❤️ at HackCrux 2026 — LNMIIT, Jaipur | Syntax Squad 07 | Developed by Piyush Sharma
            </div>
            <div className="flex items-center gap-1 text-yellow-600">
              ⚠️ Advisory only — not for clinical use
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
