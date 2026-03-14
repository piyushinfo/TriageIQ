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
      color: "text-cyan-400",
      bg: "from-cyan-500/10 to-blue-500/10",
      border: "border-cyan-500/20",
    },
    {
      label: "Critical",
      value: criticalCount,
      icon: <AlertTriangle size={18} />,
      color: "text-red-400",
      bg: "from-red-500/10 to-orange-500/10",
      border: "border-red-500/20",
      alert: criticalCount > 0,
    },
    {
      label: "High Priority",
      value: highCount,
      icon: <TrendingUp size={18} />,
      color: "text-orange-400",
      bg: "from-orange-500/10 to-amber-500/10",
      border: "border-orange-500/20",
    },
    {
      label: "Pending Review",
      value: pendingCount,
      icon: <Clock size={18} />,
      color: "text-yellow-400",
      bg: "from-yellow-500/10 to-amber-500/10",
      border: "border-yellow-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`glass-subtle p-4 rounded-xl bg-gradient-to-br ${stat.bg} border ${stat.border} ${stat.alert ? "animate-pulse-glow" : ""}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`${stat.color}`}>{stat.icon}</span>
            <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
          </div>
          <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
