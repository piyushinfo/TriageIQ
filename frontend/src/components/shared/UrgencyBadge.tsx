"use client";

const URGENCY_STYLES: Record<string, { bg: string; text: string; glow: string; icon: string; label: string }> = {
  critical: {
    bg: "bg-red-500/15 border-red-500/40",
    text: "text-red-400",
    glow: "shadow-red-500/20",
    icon: "🔴",
    label: "CRITICAL",
  },
  high: {
    bg: "bg-orange-500/15 border-orange-500/40",
    text: "text-orange-400",
    glow: "shadow-orange-500/20",
    icon: "🟠",
    label: "HIGH",
  },
  medium: {
    bg: "bg-yellow-500/15 border-yellow-500/40",
    text: "text-yellow-400",
    glow: "shadow-yellow-500/20",
    icon: "🟡",
    label: "MEDIUM",
  },
  low: {
    bg: "bg-green-500/15 border-green-500/40",
    text: "text-green-400",
    glow: "shadow-green-500/20",
    icon: "🟢",
    label: "LOW",
  },
};

interface UrgencyBadgeProps {
  urgency: string;
  score?: number;
  size?: "sm" | "md" | "lg";
}

export default function UrgencyBadge({ urgency, score, size = "md" }: UrgencyBadgeProps) {
  const style = URGENCY_STYLES[urgency] || URGENCY_STYLES.low;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-3 py-1",
    lg: "text-sm px-4 py-1.5",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-bold border
        shadow-lg ${style.bg} ${style.text} ${style.glow} ${sizeClasses[size]}
      `}
    >
      <span>{style.icon}</span>
      <span>{style.label}</span>
      {score !== undefined && (
        <span className="opacity-70 ml-0.5">{Math.round(score * 100)}%</span>
      )}
    </span>
  );
}

export { URGENCY_STYLES };
