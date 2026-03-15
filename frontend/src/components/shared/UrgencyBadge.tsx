"use client";

const URGENCY_STYLES: Record<string, { bg: string; text: string; icon: string; label: string }> = {
  critical: {
    bg: "bg-red-50 border-red-200",
    text: "text-red-700",
    icon: "🔴",
    label: "CRITICAL",
  },
  high: {
    bg: "bg-orange-50 border-orange-200",
    text: "text-orange-700",
    icon: "🟠",
    label: "HIGH",
  },
  medium: {
    bg: "bg-yellow-50 border-yellow-200",
    text: "text-yellow-700",
    icon: "🟡",
    label: "MEDIUM",
  },
  low: {
    bg: "bg-green-50 border-green-200",
    text: "text-green-700",
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
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-xs px-3 py-1.5",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded bg-white font-bold border shadow-sm
        ${style.bg} ${style.text} ${sizeClasses[size]} tracking-wider uppercase
      `}
    >
      <span className="text-[8px]">{style.icon}</span>
      <span>{style.label}</span>
      {score !== undefined && (
        <span className="opacity-80 ml-1 bg-white/50 px-1 py-0.5 rounded font-mono text-[10px] border border-current/10">
          {Math.round(score * 100)}%
        </span>
      )}
    </span>
  );
}

export { URGENCY_STYLES };
