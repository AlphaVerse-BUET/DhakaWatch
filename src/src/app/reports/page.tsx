"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  Printer,
  Calendar,
  MapPin,
  Factory,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileImage,
} from "lucide-react";
import pollutionData from "@/data/pollution-hotspots.json";
import factoriesData from "@/data/factories.json";
import { alerts } from "@/data/datasets";

interface Report {
  id: string;
  title: string;
  type: "pollution" | "encroachment" | "erosion" | "comprehensive";
  date: string;
  status: "ready" | "generating" | "pending";
  summary: string;
}

export default function ReportsPage() {
  const [selectedHotspot, setSelectedHotspot] = useState<string>("");
  const [reportType, setReportType] = useState<
    "evidence" | "analysis" | "summary"
  >("evidence");
  const [isGenerating, setIsGenerating] = useState(false);

  const recentReports: Report[] = [
    {
      id: "R001",
      title: "Hazaribagh Tannery Pollution - Evidence Package",
      type: "pollution",
      date: "2026-03-10",
      status: "ready",
      summary:
        "Complete evidence documentation for tannery discharge violations at Hazaribagh cluster.",
    },
    {
      id: "R002",
      title: "Turag River Encroachment - Legal Brief",
      type: "encroachment",
      date: "2026-03-08",
      status: "ready",
      summary:
        "10-year satellite imagery analysis showing illegal land filling near Aminbazar Bridge.",
    },
    {
      id: "R003",
      title: "Balu River Critical Dye Discharge",
      type: "pollution",
      date: "2026-03-08",
      status: "ready",
      summary:
        "Spectral analysis confirming textile dye contamination with factory attribution.",
    },
    {
      id: "R004",
      title: "Monthly Comprehensive Report - March 2026",
      type: "comprehensive",
      date: "2026-03-01",
      status: "ready",
      summary:
        "Full analysis of all monitored rivers including pollution, encroachment, and erosion.",
    },
  ];

  const handleGenerateReport = () => {
    if (!selectedHotspot) return;
    setIsGenerating(true);

    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      alert(
        "Report generated successfully! In a real implementation, this would download a PDF.",
      );
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return (
          <span className="badge-green flex items-center gap-1">
            <CheckCircle size={12} /> Ready
          </span>
        );
      case "generating":
        return (
          <span className="badge-yellow flex items-center gap-1">
            <Clock size={12} /> Generating
          </span>
        );
      default:
        return <span className="badge-gray">Pending</span>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "pollution":
        return <span className="badge-red">Pollution</span>;
      case "encroachment":
        return <span className="badge-purple">Encroachment</span>;
      case "erosion":
        return <span className="badge-orange">Erosion</span>;
      default:
        return <span className="badge-blue">Comprehensive</span>;
    }
  };

  return (
    <div className="min-h-screen py-8 animate-fadeIn">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <FileText size={28} className="text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Evidence Reports
              </h1>
              <p className="text-gray-400">
                Generate enforcement triage reports with satellite evidence
              </p>
            </div>
          </div>
        </div>

        {/* Report Generator */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-6">
              Generate New Report
            </h3>

            <div className="space-y-6">
              {/* Report Type */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Report Type
                </label>
                <div className="flex gap-3">
                  {[
                    {
                      key: "evidence",
                      label: "Evidence Package",
                      desc: "Legal-ready documentation",
                    },
                    {
                      key: "analysis",
                      label: "Technical Analysis",
                      desc: "Detailed spectral data",
                    },
                    {
                      key: "summary",
                      label: "Executive Summary",
                      desc: "Brief overview",
                    },
                  ].map((type) => (
                    <button
                      key={type.key}
                      onClick={() => setReportType(type.key as any)}
                      className={`flex-1 p-4 rounded-lg text-left transition-colors ${
                        reportType === type.key
                          ? "bg-purple-500/20 border border-purple-500/30"
                          : "bg-slate-800/50 hover:bg-slate-800"
                      }`}
                    >
                      <div className="text-white font-medium">{type.label}</div>
                      <div className="text-xs text-gray-400">{type.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Hotspot */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Select Pollution Hotspot
                </label>
                <select
                  value={selectedHotspot}
                  onChange={(e) => setSelectedHotspot(e.target.value)}
                  className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-3 text-white"
                >
                  <option value="">Choose a hotspot...</option>
                  {pollutionData.hotspots.map((hs) => (
                    <option key={hs.id} value={hs.id}>
                      {hs.label} - {hs.river} (Severity: {hs.severity})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Hotspot Preview */}
              {selectedHotspot && (
                <div className="bg-slate-800/30 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">
                    Report Preview
                  </h4>
                  {(() => {
                    const hs = pollutionData.hotspots.find(
                      (h) => h.id === selectedHotspot,
                    );
                    if (!hs) return null;

                    const relatedFactories = factoriesData.factories.filter(
                      (f) => f.hotspot === hs.id,
                    );

                    return (
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-gray-400" />
                            <span className="text-gray-400">Location:</span>
                            <span className="text-white">{hs.river}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertTriangle size={14} className="text-red-400" />
                            <span className="text-gray-400">Severity:</span>
                            <span className="text-red-400 font-semibold">
                              {hs.severity}/100
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="text-gray-400">Detected:</span>
                            <span className="text-white">
                              {hs.detected ? (() => { const d = new Date(hs.detected); return isNaN(d.getTime()) ? hs.detected : d.toLocaleDateString("en-GB"); })() : "—"}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Factory size={14} className="text-purple-400" />
                            <span className="text-gray-400">
                              Related Factories:
                            </span>
                            <span className="text-white">
                              {relatedFactories.length}
                            </span>
                          </div>
                          <div className="text-gray-400">
                            <div>
                              NDTI:{" "}
                              <span className="text-yellow-400">
                                {hs.spectral.ndti}
                              </span>
                            </div>
                            <div>
                              R/B Ratio:{" "}
                              <span className="text-yellow-400">
                                {(hs.spectral as any).red_blue_ratio ?? (hs.spectral as any).redBlueRatio ?? "—"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Generate Button */}
              <div className="flex gap-4">
                <button
                  onClick={handleGenerateReport}
                  disabled={!selectedHotspot || isGenerating}
                  className="flex-1 px-6 py-3 bg-teal text-slate-900 rounded-lg font-semibold hover:bg-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText size={18} />
                      Generate Report
                    </>
                  )}
                </button>
                <button className="px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors flex items-center gap-2">
                  <Printer size={18} />
                  Print Preview
                </button>
              </div>
            </div>
          </div>

          {/* Report Contents */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Report Includes
            </h3>
            <div className="space-y-3 text-sm">
              {[
                { icon: FileImage, text: "Satellite imagery with timestamps" },
                { icon: MapPin, text: "Precise GPS coordinates" },
                { icon: Factory, text: "Factory attribution analysis" },
                { icon: AlertTriangle, text: "Spectral signature evidence" },
                { icon: Calendar, text: "Historical trend data" },
                { icon: CheckCircle, text: "Methodology documentation" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/30"
                >
                  <item.icon size={16} className="text-teal" />
                  <span className="text-gray-300">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="text-xs text-gray-400 mb-2">Output Format</div>
              <div className="flex gap-2">
                <span className="px-2 py-1 rounded bg-slate-800/50 text-gray-300 text-xs">
                  PDF
                </span>
                <span className="px-2 py-1 rounded bg-slate-800/50 text-gray-300 text-xs">
                  GeoJSON
                </span>
                <span className="px-2 py-1 rounded bg-slate-800/50 text-gray-300 text-xs">
                  CSV
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-6">
            Recent Reports
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Report
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="text-white font-medium">
                        {report.title}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {report.summary}
                      </div>
                    </td>
                    <td className="py-4 px-4">{getTypeBadge(report.type)}</td>
                    <td className="py-4 px-4 text-gray-400">
                      {new Date(report.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <button className="p-2 rounded-lg bg-teal/10 text-teal hover:bg-teal/20 transition-colors">
                          <Download size={16} />
                        </button>
                        <button className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
                          <Printer size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
