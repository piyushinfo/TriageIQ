"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Brain, FileText, Mic, ShieldCheck, Sparkles } from "lucide-react";

type CanvasNode = {
  id: string;
  title: string;
  detail: string;
  x: string;
  y: string;
  icon: React.ReactNode;
};

const nodes: CanvasNode[] = [
  {
    id: "input",
    title: "Patient Input",
    detail: "Voice + notes",
    x: "6%",
    y: "18%",
    icon: <Mic size={16} className="text-blue-600" />,
  },
  {
    id: "triage",
    title: "AI Triage",
    detail: "Risk reasoning",
    x: "34%",
    y: "48%",
    icon: <Brain size={16} className="text-blue-600" />,
  },
  {
    id: "entities",
    title: "Clinical Entities",
    detail: "Symptoms, meds",
    x: "62%",
    y: "18%",
    icon: <Sparkles size={16} className="text-blue-600" />,
  },
  {
    id: "dashboard",
    title: "Live Dashboard",
    detail: "Priority queue",
    x: "78%",
    y: "52%",
    icon: <ShieldCheck size={16} className="text-blue-600" />,
  },
  {
    id: "notes",
    title: "Case Summary",
    detail: "Structured output",
    x: "18%",
    y: "68%",
    icon: <FileText size={16} className="text-blue-600" />,
  },
];

export default function LiveDesignCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [pointer, setPointer] = useState({ x: 50, y: 50 });
  const [activeNode, setActiveNode] = useState("triage");

  const links = useMemo(
    () => [
      { x1: "13%", y1: "28%", x2: "38%", y2: "57%" },
      { x1: "39%", y1: "56%", x2: "66%", y2: "27%" },
      { x1: "67%", y1: "28%", x2: "82%", y2: "57%" },
      { x1: "23%", y1: "72%", x2: "41%", y2: "58%" },
      { x1: "41%", y1: "58%", x2: "80%", y2: "58%" },
    ],
    []
  );

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setPointer({ x, y });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-end">
        <div className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 border border-blue-200 text-blue-700">
          Interactive Prototype
        </div>
      </div>

      <motion.div
        ref={canvasRef}
        onMouseMove={onMove}
        className="relative h-[480px] md:h-[540px] bg-slate-50"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.18) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      >
        <motion.div
          className="absolute w-40 h-40 rounded-full bg-blue-200/40 blur-3xl pointer-events-none"
          animate={{ left: `${pointer.x - 9}%`, top: `${pointer.y - 10}%` }}
          transition={{ type: "spring", stiffness: 70, damping: 22 }}
        />

        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {links.map((line) => (
            <line
              key={`${line.x1}-${line.y1}-${line.x2}-${line.y2}`}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="rgb(148 163 184 / 0.55)"
              strokeWidth="2"
              strokeDasharray="6 6"
            />
          ))}
        </svg>

        {nodes.map((node, index) => {
          const focused = activeNode === node.id;

          return (
            <motion.div
              key={node.id}
              drag
              dragConstraints={canvasRef}
              dragElastic={0.15}
              initial={{ opacity: 0, scale: 0.9, y: 16 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.35 }}
              whileHover={{ y: -4 }}
              onMouseEnter={() => setActiveNode(node.id)}
              className={`absolute w-52 rounded-xl border p-4 bg-white shadow-sm cursor-grab active:cursor-grabbing transition-all ${
                focused ? "border-blue-300 shadow-md" : "border-slate-200"
              }`}
              style={{ left: node.x, top: node.y }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                  {node.icon}
                </div>
                {focused && (
                  <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                    Active
                  </span>
                )}
              </div>
              <h4 className="mt-3 text-sm font-semibold text-slate-900">{node.title}</h4>
              <p className="mt-1 text-xs text-slate-500">{node.detail}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
