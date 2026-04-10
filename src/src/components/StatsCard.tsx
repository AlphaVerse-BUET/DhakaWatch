import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: "teal" | "red" | "yellow" | "blue" | "purple" | "orange";
  change?: {
    value: number;
    isPositive: boolean;
  };
}

const colorClasses = {
  teal: {
    border: "border-l-teal",
    icon: "text-teal bg-teal/10",
    badge: "text-teal",
  },
  red: {
    border: "border-l-red",
    icon: "text-red bg-red/10",
    badge: "text-red",
  },
  yellow: {
    border: "border-l-yellow",
    icon: "text-yellow bg-yellow/10",
    badge: "text-yellow",
  },
  blue: {
    border: "border-l-blue",
    icon: "text-blue bg-blue/10",
    badge: "text-blue",
  },
  purple: {
    border: "border-l-purple",
    icon: "text-purple bg-purple/10",
    badge: "text-purple",
  },
  orange: {
    border: "border-l-orange-400",
    icon: "text-orange-400 bg-orange-400/10",
    badge: "text-orange-400",
  },
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  change,
}: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <div
      className={`glass-card glass-card-hover p-5 border-l-4 ${colors.border}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colors.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {change && (
        <div className="mt-3 flex items-center gap-2">
          <span
            className={`text-xs font-medium ${change.isPositive ? "text-teal" : "text-red"}`}
          >
            {change.isPositive ? "↑" : "↓"} {Math.abs(change.value)}%
          </span>
          <span className="text-xs text-slate-500">vs last month</span>
        </div>
      )}
    </div>
  );
}
