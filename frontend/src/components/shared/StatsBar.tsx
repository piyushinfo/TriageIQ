"use client";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, Clock, TrendingUp } from "lucide-react";

interface StatsBarProps {
  totalCases: number;
  criticalCount: number;
  highCount: number;
  pendingCount: number;
}

export default function StatsBar({ totalCases, criticalCount, highCount, pendingCount }: StatsBarProps) {
  const stats = [
    {
      label: "Total Cases",
      value: totalCases,
      icon: <Activity size={18} />,
      color: "text-blue-600",
      bg: "bg-white",
      border: "border-slate-200",
      iconBg: "bg-blue-50 border-blue-100",
    },
    {
      label: "Critical",
      value: criticalCount,
      icon: <AlertTriangle size={18} />,
      color: "text-red-600",
      bg: "bg-white",
      border: criticalCount > 0 ? "border-red-200" : "border-slate-200",
      alert: criticalCount > 0,
      iconBg: criticalCount > 0 ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-100",
    },
    {
      label: "High Priority",
      value: highCount,
      icon: <TrendingUp size={18} />,
      color: "text-orange-600",
      bg: "bg-white",
      border: "border-slate-200",
      iconBg: "bg-orange-50 border-orange-100",
    },
    {
      label: "Pending Review",
      value: pendingCount,
      icon: <Clock size={18} />,
      color: "text-amber-600",
      bg: "bg-white",
      border: "border-slate-200",
      iconBg: "bg-amber-50 border-amber-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`p-5 rounded-xl border shadow-sm flex flex-col items-start ${stat.bg} ${stat.border}`}
        >
          <div className="flex items-center justify-between w-full mb-3">
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center border ${stat.iconBg} ${stat.color}`}>
              {stat.icon}
            </span>
            <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
          </div>
          <p className="text-[13px] text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
