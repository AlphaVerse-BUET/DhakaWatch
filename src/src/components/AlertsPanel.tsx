"use client";

import { AlertTriangle, AlertCircle, Info, CheckCircle, X } from "lucide-react";

export interface Alert {
  id: string;
  type: "critical" | "warning" | "info" | "success";
  title: string;
  location: string;
  time: string;
  description: string;
}

interface AlertsPanelProps {
  alerts: Alert[];
  maxHeight?: string;
  onDismiss?: (id: string) => void;
}

const alertConfig = {
  critical: {
    icon: AlertTriangle,
    borderClass: "alert-critical",
    iconClass: "text-red",
    bgClass: "bg-red/10",
  },
  warning: {
    icon: AlertCircle,
    borderClass: "alert-warning",
    iconClass: "text-yellow",
    bgClass: "bg-yellow/10",
  },
  info: {
    icon: Info,
    borderClass: "alert-info",
    iconClass: "text-blue",
    bgClass: "bg-blue/10",
  },
  success: {
    icon: CheckCircle,
    borderClass: "alert-success",
    iconClass: "text-teal",
    bgClass: "bg-teal/10",
  },
};

export default function AlertsPanel({
  alerts,
  maxHeight = "400px",
  onDismiss,
}: AlertsPanelProps) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Alert Feed</h3>
        <span className="badge badge-red">{alerts.length} Active</span>
      </div>

      <div className="space-y-3 overflow-y-auto pr-2" style={{ maxHeight }}>
        {alerts.map((alert) => {
          const config = alertConfig[alert.type];
          const Icon = config.icon;

          return (
            <div key={alert.id} className={`alert-card ${config.borderClass}`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${config.bgClass}`}>
                  <Icon className={`w-4 h-4 ${config.iconClass}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium text-white truncate">
                      {alert.title}
                    </h4>
                    {onDismiss && (
                      <button
                        onClick={() => onDismiss(alert.id)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        <X className="w-3 h-3 text-slate-500" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {alert.location}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {alert.description}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-2">
                    {alert.time}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
