"use client";

/**
 * NodiWatch Evidence Submission Page
 * =====================================
 * Community evidence submission with AI-powered analysis.
 * Features: Upload, GPS capture, AI analysis, recent submissions gallery.
 */

import { useState } from "react";
import Link from "next/link";
import {
  Upload,
  Camera,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Users,
  TrendingUp,
  Eye,
  ArrowRight,
  Sparkles,
  Shield,
  Globe,
} from "lucide-react";
import EvidenceUpload from "@/components/EvidenceUpload";
import {
  evidenceReports,
  evidenceStats,
  EvidenceReport,
} from "@/data/evidence-reports";

export default function EvidencePage() {
  const [filter, setFilter] = useState<
    "all" | "pollution" | "encroachment" | "erosion"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredReports = evidenceReports.filter((report) => {
    const matchesFilter = filter === "all" || report.type === filter;
    const matchesSearch =
      searchQuery === "" ||
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.location.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSubmit = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const severityColors = {
    low: "text-green-400 bg-green-500/10 border-green-500/30",
    medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    high: "text-orange-400 bg-orange-500/10 border-orange-500/30",
    critical: "text-red-400 bg-red-500/10 border-red-500/30",
  };

  const statusColors = {
    pending: "text-slate-400 bg-slate-500/10",
    verified: "text-teal-400 bg-teal-500/10",
    investigating: "text-blue-400 bg-blue-500/10",
    resolved: "text-green-400 bg-green-500/10",
  };

  const typeIcons = {
    pollution: "🏭",
    encroachment: "🏗️",
    erosion: "🌊",
  };

  const typeLabels = {
    pollution: "নদী দূষণ",
    encroachment: "নদী দখল",
    erosion: "নদী ভাঙন",
  };

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-900 to-blue-900/20" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Analysis</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Citizen Ground-Truth
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                Reporting Platform
              </span>
            </h1>

            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Submit environmental evidence from your community. Our AI analyzes
              images instantly to detect pollution, encroachment, and erosion —
              creating actionable intelligence for enforcement.
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
              <div className="text-3xl font-bold text-white mb-1">
                {evidenceStats.totalReports}
              </div>
              <div className="text-sm text-slate-400">Total Reports</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
              <div className="text-3xl font-bold text-teal-400 mb-1">
                {evidenceStats.byStatus.verified}
              </div>
              <div className="text-sm text-slate-400">Verified</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
              <div className="text-3xl font-bold text-red-400 mb-1">
                {evidenceStats.criticalAlerts}
              </div>
              <div className="text-sm text-slate-400">Critical Alerts</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-1">
                {evidenceStats.totalValidations}
              </div>
              <div className="text-sm text-slate-400">Validations</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div>
              <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 sticky top-24">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                  <Upload className="w-6 h-6 text-purple-400" />
                  Submit Evidence
                </h2>
                <p className="text-slate-400 mb-6">
                  Upload a photo and let our AI analyze it for environmental
                  issues.
                </p>

                {showSuccess && (
                  <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">
                        Evidence submitted successfully!
                      </p>
                      <p className="text-sm opacity-80">
                        Your report is now pending review.
                      </p>
                    </div>
                  </div>
                )}

                <EvidenceUpload onSubmit={handleSubmit} />

                {/* Trust Indicators */}
                <div className="mt-8 pt-6 border-t border-slate-700/50">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <Shield className="w-6 h-6 text-teal-400 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">
                        Privacy Protected
                      </p>
                    </div>
                    <div>
                      <Sparkles className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">AI Analyzed</p>
                    </div>
                    <div>
                      <Globe className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">GPS Verified</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Submissions */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Users className="w-6 h-6 text-teal-400" />
                  Community Reports
                </h2>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(
                    ["all", "pollution", "encroachment", "erosion"] as const
                  ).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilter(type)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        filter === type
                          ? "bg-teal-600 text-white"
                          : "bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700"
                      }`}
                    >
                      {type === "all"
                        ? "All"
                        : `${typeIcons[type]} ${typeLabels[type]}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reports List */}
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <Link
                    key={report.id}
                    href={`/reports/${report.id}`}
                    className="block bg-slate-800/30 rounded-xl border border-slate-700/50 hover:border-slate-600/50 overflow-hidden transition-all hover:bg-slate-800/50 group"
                  >
                    <div className="flex">
                      {/* Thumbnail */}
                      <div className="w-32 h-32 flex-shrink-0 bg-slate-900">
                        <img
                          src={report.imageUrl}
                          alt={report.title}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {typeIcons[report.type]}
                            </span>
                            <h3 className="font-semibold text-white group-hover:text-teal-400 transition-colors line-clamp-1">
                              {report.title}
                            </h3>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${severityColors[report.severity]}`}
                          >
                            {report.severity}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {report.location.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(report.submittedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                          {report.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ${statusColors[report.status]}`}
                            >
                              {report.status}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              {report.validations} validations
                            </span>
                          </div>
                          <span className="text-teal-400 text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            View details
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}

                {filteredReports.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No reports found matching your criteria.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Camera,
                title: "Capture",
                description:
                  "Take a photo of environmental damage you observe in your community.",
                color: "text-blue-400",
              },
              {
                icon: Upload,
                title: "Upload",
                description:
                  "Submit the image with GPS location for precise geographic context.",
                color: "text-purple-400",
              },
              {
                icon: Sparkles,
                title: "AI Analysis",
                description:
                  "Our Gemini AI instantly analyzes the image for pollution, erosion, or encroachment.",
                color: "text-pink-400",
              },
              {
                icon: Shield,
                title: "Enforcement",
                description:
                  "Verified reports are shared with DoE and NRCC for regulatory action.",
                color: "text-teal-400",
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 text-center h-full">
                  <div
                    className={`w-14 h-14 rounded-xl bg-slate-700/50 flex items-center justify-center mx-auto mb-4 ${step.color}`}
                  >
                    <step.icon className="w-7 h-7" />
                  </div>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-400">{step.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 text-slate-600">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">
              Together We Can Protect Bangladesh&apos;s Rivers
            </h2>
            <p className="text-slate-400 mb-8">
              Every report helps build a more complete picture of environmental
              threats. Your observations, combined with satellite data, create
              actionable evidence for enforcement.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/about"
                className="px-6 py-3 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors border border-slate-700"
              >
                Learn About NodiWatch
              </Link>
              <Link
                href="/datasets"
                className="px-6 py-3 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-500 transition-colors"
              >
                Explore Datasets
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
