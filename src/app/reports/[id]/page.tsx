"use client";

/**
 * NodiWatch Evidence Report Detail Page
 * ========================================
 * Dynamic page for viewing individual evidence reports with full AI analysis.
 */

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  Download,
  Share2,
  ThumbsUp,
  MessageSquare,
  Factory,
  TrendingUp,
  Sparkles,
  FileText,
  Printer,
  ExternalLink,
  Navigation,
  Eye,
} from "lucide-react";
import { getReportById, EvidenceReport } from "@/data/evidence-reports";

export default function ReportDetailPage() {
  const params = useParams();
  const reportId = params.id as string;
  const [report, setReport] = useState<EvidenceReport | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [hasValidated, setHasValidated] = useState(false);

  useEffect(() => {
    const foundReport = getReportById(reportId);
    setReport(foundReport || null);
  }, [reportId]);

  if (!report) {
    return (
      <main className="min-h-screen bg-slate-950 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Report Not Found
          </h1>
          <p className="text-slate-400 mb-6">
            The evidence report you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/evidence"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Evidence
          </Link>
        </div>
      </main>
    );
  }

  const severityColors = {
    low: "text-green-400 bg-green-500/10 border-green-500/30",
    medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    high: "text-orange-400 bg-orange-500/10 border-orange-500/30",
    critical: "text-red-400 bg-red-500/10 border-red-500/30",
  };

  const statusColors = {
    pending: {
      bg: "bg-slate-500/10",
      text: "text-slate-400",
      label: "Pending Review",
    },
    verified: {
      bg: "bg-teal-500/10",
      text: "text-teal-400",
      label: "Verified",
    },
    investigating: {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      label: "Under Investigation",
    },
    resolved: {
      bg: "bg-green-500/10",
      text: "text-green-400",
      label: "Resolved",
    },
  };

  const typeLabels = {
    pollution: {
      icon: "🏭",
      label: "নদী দূষণ (River Pollution)",
      color: "text-red-400",
    },
    encroachment: {
      icon: "🏗️",
      label: "নদী দখল (River Encroachment)",
      color: "text-yellow-400",
    },
    erosion: {
      icon: "🌊",
      label: "নদী ভাঙন (Riverbank Erosion)",
      color: "text-orange-400",
    },
  };

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    // Simulate PDF generation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // In production, this would generate actual PDF
    alert(
      "PDF report generated! (Demo mode - actual PDF generation would occur here)",
    );
    setIsGeneratingPDF(false);
  };

  const handleValidate = () => {
    setHasValidated(true);
  };

  return (
    <main className="min-h-screen bg-slate-950 pt-20 pb-16">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link
          href="/evidence"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Evidence Reports
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
              {/* Image */}
              <div className="relative h-80 bg-slate-900">
                <img
                  src={report.imageUrl}
                  alt={report.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span
                    className={`px-3 py-1.5 rounded-full text-sm font-medium ${severityColors[report.severity]}`}
                  >
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    {report.severity.charAt(0).toUpperCase() +
                      report.severity.slice(1)}{" "}
                    Severity
                  </span>
                </div>

                <div className="absolute top-4 right-4">
                  <span
                    className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusColors[report.status].bg} ${statusColors[report.status].text}`}
                  >
                    {statusColors[report.status].label}
                  </span>
                </div>

                {/* Type Badge */}
                <div className="absolute bottom-4 left-4">
                  <span
                    className={`px-4 py-2 rounded-xl bg-slate-900/90 backdrop-blur-sm text-sm font-medium ${typeLabels[report.type].color}`}
                  >
                    {typeLabels[report.type].icon}{" "}
                    {typeLabels[report.type].label}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm text-teal-400 font-mono mb-2">
                      {report.id}
                    </p>
                    <h1 className="text-2xl font-bold text-white">
                      {report.title}
                    </h1>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                      <Printer className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-6">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    {report.location.name}
                  </span>
                  <span className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-slate-500" />
                    {report.location.lat.toFixed(4)}°N,{" "}
                    {report.location.lng.toFixed(4)}°E
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    {new Date(report.submittedAt).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-500" />
                    {report.submittedBy}
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed">
                  {report.description}
                </p>
              </div>
            </div>

            {/* AI Analysis */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">AI Analysis</h2>
                  <p className="text-sm text-slate-500">
                    Powered by Gemini Vision
                  </p>
                </div>
                <div className="ml-auto px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm">
                  {Math.round(report.confidence * 100)}% confidence
                </div>
              </div>

              {/* Summary */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-400 mb-3">
                  Analysis Summary
                </h3>
                <p className="text-slate-200 leading-relaxed bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  {report.aiAnalysis.summary}
                </p>
              </div>

              {/* Spectral Indicators */}
              {report.aiAnalysis.spectralIndicators && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-slate-400 mb-3">
                    Spectral Analysis
                  </h3>
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <code className="text-teal-400 text-sm font-mono">
                      {report.aiAnalysis.spectralIndicators}
                    </code>
                  </div>
                </div>
              )}

              {/* Detected Issues */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-400 mb-3">
                  Detected Issues
                </h3>
                <div className="space-y-2">
                  {report.aiAnalysis.detectedIssues.map((issue, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/20"
                    >
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-200 text-sm">{issue}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-3">
                  Recommended Actions
                </h3>
                <div className="space-y-2">
                  {report.aiAnalysis.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-xl bg-teal-500/5 border border-teal-500/20"
                    >
                      <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-200 text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Nearby Factories (for pollution reports) */}
            {report.nearbyFactories && report.nearbyFactories.length > 0 && (
              <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                    <Factory className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Industrial Attribution
                    </h2>
                    <p className="text-sm text-slate-500">
                      Nearby facilities within 500m radius
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {report.nearbyFactories.map((factory, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center text-2xl">
                          🏭
                        </div>
                        <div>
                          <h4 className="font-medium text-white">
                            {factory.name}
                          </h4>
                          <p className="text-sm text-slate-500">
                            {factory.type} • {factory.distance}m away
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-400">
                          {factory.attribution}%
                        </div>
                        <p className="text-xs text-slate-500">
                          Attribution score
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-slate-500 mt-4 italic">
                  * Attribution scores are probabilistic estimates based on
                  proximity and spectral signature matching. On-ground
                  verification required for legal proceedings.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions Card */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
              <h3 className="font-semibold text-white mb-4">Actions</h3>

              <div className="space-y-3">
                <button
                  onClick={handleGeneratePDF}
                  disabled={isGeneratingPDF}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 text-white font-medium hover:from-teal-500 hover:to-blue-500 disabled:opacity-50 transition-all"
                >
                  {isGeneratingPDF ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Generate PDF Report
                    </>
                  )}
                </button>

                <button
                  onClick={handleValidate}
                  disabled={hasValidated}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-medium transition-all ${
                    hasValidated
                      ? "bg-teal-500/10 border-teal-500/30 text-teal-400"
                      : "bg-slate-800/50 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600"
                  }`}
                >
                  <ThumbsUp className="w-5 h-5" />
                  {hasValidated
                    ? "Validated!"
                    : `Validate (${report.validations})`}
                </button>

                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-all">
                  <MessageSquare className="w-5 h-5" />
                  Add Comment
                </button>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="h-48 bg-slate-800 relative">
                <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                  <MapPin className="w-12 h-12 opacity-50" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-white font-medium">
                      {report.location.name}
                    </p>
                    <p className="text-sm text-slate-400">
                      {report.location.lat.toFixed(4)}°N,{" "}
                      {report.location.lng.toFixed(4)}°E
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <a
                  href={`https://www.google.com/maps?q=${report.location.lat},${report.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-teal-400 hover:text-teal-300 text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in Google Maps
                </a>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
              <h3 className="font-semibold text-white mb-4">
                Report Statistics
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Views
                  </span>
                  <span className="text-white font-medium">1,247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4" />
                    Validations
                  </span>
                  <span className="text-white font-medium">
                    {report.validations}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Downloads
                  </span>
                  <span className="text-white font-medium">89</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    AI Confidence
                  </span>
                  <span className="text-teal-400 font-medium">
                    {Math.round(report.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Related Reports */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
              <h3 className="font-semibold text-white mb-4">Similar Reports</h3>
              <p className="text-sm text-slate-500">
                AI-matched reports with similar characteristics in this region.
              </p>
              <Link
                href="/evidence"
                className="mt-4 inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 text-sm"
              >
                View all reports
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
