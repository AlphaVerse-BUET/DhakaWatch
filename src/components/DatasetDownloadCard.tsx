"use client";

/**
 * NodiWatch Dataset Download Card
 * =================================
 * Visual card component for displaying and downloading satellite datasets.
 * Shows preview, metadata, and download options.
 */

import { useState } from "react";
import {
  Download,
  Database,
  FileJson,
  FileSpreadsheet,
  ExternalLink,
  Copy,
  Check,
  Eye,
  Satellite,
  Calendar,
  MapPin,
  Layers,
} from "lucide-react";

interface DatasetDownloadCardProps {
  name: string;
  description: string;
  source: string;
  resolution?: string;
  coverage?: string;
  updateFrequency?: string;
  geeId?: string;
  previewImage?: string;
  sampleData?: object;
  downloadFormats?: Array<"geojson" | "csv" | "json">;
  externalUrl?: string;
  className?: string;
}

export default function DatasetDownloadCard({
  name,
  description,
  source,
  resolution,
  coverage,
  updateFrequency,
  geeId,
  previewImage,
  sampleData,
  downloadFormats = ["geojson", "json"],
  externalUrl,
  className = "",
}: DatasetDownloadCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const copyGeeId = async () => {
    if (!geeId) return;
    await navigator.clipboard.writeText(geeId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async (format: string) => {
    setDownloading(format);

    // Simulate download preparation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create and trigger download
    const data = sampleData || { message: "Sample data", dataset: name };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: format === "csv" ? "text/csv" : "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nodiwatch_${name.toLowerCase().replace(/\s+/g, "_")}_sample.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloading(null);
  };

  const formatIcons = {
    geojson: FileJson,
    json: FileJson,
    csv: FileSpreadsheet,
  };

  return (
    <div
      className={`bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all ${className}`}
    >
      {/* Preview Image */}
      {previewImage && (
        <div className="relative h-40 bg-slate-900">
          <img
            src={previewImage}
            alt={name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 rounded-full bg-teal-600/90 backdrop-blur-sm text-white text-xs font-medium">
              {source}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-blue-500/20 border border-teal-500/30 flex items-center justify-center">
              <Satellite className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{name}</h3>
              {!previewImage && (
                <span className="text-xs text-slate-500">{source}</span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-400 leading-relaxed">{description}</p>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-3">
          {resolution && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Layers className="w-4 h-4 text-slate-500" />
              <span>{resolution}</span>
            </div>
          )}
          {coverage && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>{coverage}</span>
            </div>
          )}
          {updateFrequency && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>{updateFrequency}</span>
            </div>
          )}
        </div>

        {/* GEE ID */}
        {geeId && (
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 rounded-lg bg-slate-900/80 text-teal-400 text-xs font-mono truncate">
              {geeId}
            </code>
            <button
              onClick={copyGeeId}
              className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Copy GEE ID"
            >
              {copied ? (
                <Check className="w-4 h-4 text-teal-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        )}

        {/* Sample Data Preview Toggle */}
        {sampleData && (
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300 transition-colors"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? "Hide sample data" : "View sample data"}
          </button>
        )}

        {/* Sample Data Preview */}
        {showPreview && sampleData && (
          <div className="rounded-xl bg-slate-900/80 border border-slate-700/50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700/50">
              <span className="text-xs font-medium text-slate-400">
                Sample Data Preview
              </span>
              <span className="text-xs text-slate-500">JSON</span>
            </div>
            <pre className="p-4 text-xs text-slate-300 overflow-x-auto max-h-48 scrollbar-thin scrollbar-thumb-slate-700">
              {JSON.stringify(sampleData, null, 2)}
            </pre>
          </div>
        )}

        {/* Download Buttons */}
        <div className="flex items-center gap-2 pt-2">
          {downloadFormats.map((format) => {
            const Icon = formatIcons[format] || Database;
            const isDownloading = downloading === format;

            return (
              <button
                key={format}
                onClick={() => handleDownload(format)}
                disabled={isDownloading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-slate-300 hover:text-white text-sm font-medium transition-all disabled:opacity-50"
              >
                {isDownloading ? (
                  <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                {format.toUpperCase()}
              </button>
            );
          })}

          {externalUrl && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-slate-300 hover:text-white transition-all"
              title="View on external source"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Compact dataset card for lists
 */
export function DatasetDownloadCardCompact({
  name,
  description,
  geeId,
  resolution,
  onDownload,
}: {
  name: string;
  description: string;
  geeId?: string;
  resolution?: string;
  onDownload?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyGeeId = async () => {
    if (!geeId) return;
    await navigator.clipboard.writeText(geeId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-slate-600/50 transition-all">
      <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center flex-shrink-0">
        <Database className="w-5 h-5 text-teal-400" />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-white truncate">{name}</h4>
        <p className="text-xs text-slate-400 truncate">{description}</p>
        {geeId && (
          <code className="text-xs text-teal-400/70 font-mono">{geeId}</code>
        )}
      </div>

      <div className="flex items-center gap-2">
        {resolution && (
          <span className="px-2 py-1 rounded-md bg-slate-700/50 text-xs text-slate-400">
            {resolution}
          </span>
        )}
        {geeId && (
          <button
            onClick={copyGeeId}
            className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-teal-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        )}
        {onDownload && (
          <button
            onClick={onDownload}
            className="p-2 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 text-teal-400 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
