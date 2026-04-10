"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Droplets,
  Factory,
  AlertTriangle,
  Info,
  Download,
  Filter,
  Satellite,
  Target,
  Shield,
  Thermometer,
  Waves,
  Eye,
  Camera,
  ChevronRight,
  CheckCircle2,
  Palette,
  Flame,
} from "lucide-react";
import StatsCard from "@/components/StatsCard";
import ComparisonSlider from "@/components/ComparisonSlider";
import pollutionData from "@/data/pollution-hotspots.json";
import factoriesData from "@/data/factories.json";

const PollutionMap = dynamic(() => import("@/components/maps/PollutionMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900/50 rounded-xl flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-teal border-t-transparent rounded-full"></div>
    </div>
  ),
});

const FactoryAttributionChart = dynamic(
  () => import("@/components/charts/FactoryAttributionChart"),
  { ssr: false },
);

export default function PollutionPage() {
  const [selectedHotspot, setSelectedHotspot] = useState<any>(null);
  const [filterType, setFilterType] = useState<
    "all" | "textile" | "tannery" | "industrial"
  >("all");

  const filteredHotspots =
    filterType === "all"
      ? pollutionData.hotspots
      : pollutionData.hotspots.filter((h) => h.type === filterType);

  const criticalCount = pollutionData.hotspots.filter(
    (h) => h.severity >= 85,
  ).length;
  const avgSeverity = (
    pollutionData.hotspots.reduce((sum, h) => sum + h.severity, 0) /
    pollutionData.hotspots.length
  ).toFixed(1);
  const flaggedFactories = factoriesData.factories.filter(
    (f) => f.status === "flagged",
  ).length;

  const pollutionTypes = [
    {
      type: "textile",
      icon: Palette,
      title: "Textile Dye Effluent",
      color: "purple",
      description:
        "Synthetic dyes create distinct spectral signatures in red/blue bands",
      indicators: [
        "High R/B ratio (>1.5)",
        "NDTI < -0.2",
        "Visible color change",
      ],
      sources: "Garment factories, dyeing units",
    },
    {
      type: "tannery",
      icon: Flame,
      title: "Tannery Waste",
      color: "red",
      description:
        "Chromium and organic compounds detectable via NIR absorption",
      indicators: [
        "Elevated chromium signatures",
        "Low MNDWI",
        "Brown/gray plume",
      ],
      sources: "Leather processing plants, chemical treatment facilities",
    },
    {
      type: "organic",
      icon: Thermometer,
      title: "High-CDOM (Organic Waste)",
      color: "orange",
      description: "Chromophoric dissolved organic matter detectable via Green/Blue band ratio",
      indicators: [
        "CDOM index > 2.5",
        "High NDTI (> 0.3)",
        "Brown/dark water plume",
      ],
      sources: "Tannery waste, sewage discharge, food processing",
    },
  ];

  return (
    <div className="min-h-screen animate-fadeIn">
      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-transparent to-purple-900/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 mb-6">
                <Droplets size={16} className="text-red-400" />
                <span className="text-red-400 text-sm font-medium">
                  নদী দূষণ (Nodi Dushon)
                </span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                <span className="text-white">Industrial</span>{" "}
                <span className="text-red-400">Pollution</span>{" "}
                <span className="text-white">Monitoring</span>
              </h1>

              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                Using{" "}
                <span className="text-teal font-semibold">
                  Sentinel-2 multispectral imagery
                </span>{" "}
                and machine learning to detect, classify, and attribute
                industrial discharge to specific sources.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 size={18} className="text-green-400" />
                  <span>
                    Spectral fingerprinting using NDTI, CDOM, and R/B ratio indices</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 size={18} className="text-green-400" />
                  <span>
                    Probabilistic factory attribution using Bayesian inference
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 size={18} className="text-green-400" />
                  <span>
                    Near-real-time alerts with 5-day Sentinel-2 revisit cycle
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <Link
                  href="/evidence"
                  className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-500 transition-colors flex items-center gap-2"
                >
                  <Camera size={18} />
                  Report Pollution
                </Link>
                <Link
                  href="/datasets"
                  className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors flex items-center gap-2"
                >
                  <Download size={18} />
                  View Datasets
                </Link>
              </div>
            </div>

            <div className="relative">
              <ComparisonSlider
                beforeImage="/assets/pollution_comparison.png"
                afterImage="/assets/pollution_comparison.png"
                beforeLabel="Clean River"
                afterLabel="Polluted"
                beforeYear="2020"
                afterYear="2026"
                title="Buriganga River Pollution"
                description="Industrial effluent has severely degraded water quality"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Active Hotspots"
            value={pollutionData.hotspots.length}
            icon={AlertTriangle}
            color="red"
          />
          <StatsCard
            title="Critical Zones"
            value={criticalCount}
            icon={Droplets}
            color="red"
            change={{ value: 2, isPositive: false }}
          />
          <StatsCard
            title="Avg Severity"
            value={avgSeverity}
            icon={Info}
            color="yellow"
          />
          <StatsCard
            title="Flagged Factories"
            value={flaggedFactories}
            icon={Factory}
            color="purple"
            change={{ value: 3, isPositive: false }}
          />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 text-gray-400">
            <Filter size={18} />
            <span className="text-sm">Filter by type:</span>
          </div>
          <div className="flex gap-2">
            {(["all", "textile", "tannery", "industrial"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                  filterType === type
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-slate-800/50 text-gray-400 hover:text-white"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 h-[600px]">
            <PollutionMap
              className="w-full h-full"
              onHotspotSelect={setSelectedHotspot}
              selectedHotspot={selectedHotspot?.id}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Hotspot Details */}
            {selectedHotspot && (
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">
                    {selectedHotspot.label}
                  </h3>
                  <span
                    className={`badge-${selectedHotspot.severity >= 85 ? "red" : "yellow"}`}
                  >
                    {selectedHotspot.severity}/100
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">River:</span>
                    <span className="text-white">{selectedHotspot.river}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white capitalize">
                      {selectedHotspot.type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Detected:</span>
                    <span className="text-white">
                      {selectedHotspot.detected ? (() => { const d = new Date(selectedHotspot.detected); return isNaN(d.getTime()) ? selectedHotspot.detected : d.toLocaleDateString("en-GB"); })() : "—"}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-white/10">
                    <div className="text-xs text-gray-400 mb-2">
                      Spectral Analysis
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-slate-800/50 rounded p-2 text-center">
                        <div className="text-xs text-gray-400">NDTI</div>
                        <div className="text-white font-semibold">
                          {selectedHotspot.spectral.ndti}
                        </div>
                      </div>
                      <div className="bg-slate-800/50 rounded p-2 text-center">
                        <div className="text-xs text-gray-400">R/B Ratio</div>
                        <div className="text-white font-semibold">
                          {(selectedHotspot.spectral as any).red_blue_ratio ?? (selectedHotspot.spectral as any).redBlueRatio ?? "—"}
                        </div>
                      </div>
                      <div className="bg-slate-800/50 rounded p-2 text-center">
                        <div className="text-xs text-gray-400">CDOM</div>
                        <div className="text-white font-semibold">
                          {selectedHotspot.spectral.cdom || "—"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-400 text-xs pt-2">
                    {selectedHotspot.description}
                  </p>
                </div>
              </div>
            )}

            {/* Factory Attribution */}
            <FactoryAttributionChart hotspotId={selectedHotspot?.id} />

            {/* Download Button */}
            <button className="w-full glass-card p-4 flex items-center justify-center gap-2 text-teal hover:bg-white/5 transition-colors">
              <Download size={18} />
              <span>Download Pollution Report</span>
            </button>
          </div>
        </div>

        {/* Hotspots Table */}
        <div className="mt-8 glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            All Detected Hotspots
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Location
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    River
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Severity
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    NDTI
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Detected
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredHotspots.map((hotspot) => (
                  <tr
                    key={hotspot.id}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                    onClick={() => setSelectedHotspot(hotspot)}
                  >
                    <td className="py-3 px-4 text-white">{hotspot.label}</td>
                    <td className="py-3 px-4 text-gray-300">{hotspot.river}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`badge-${hotspot.type === "textile" ? "purple" : hotspot.type === "tannery" ? "red" : "yellow"}`}
                      >
                        {hotspot.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${hotspot.severity >= 85 ? "bg-red-500" : hotspot.severity >= 70 ? "bg-orange-500" : "bg-yellow-500"}`}
                            style={{ width: `${hotspot.severity}%` }}
                          />
                        </div>
                        <span className="text-white">{hotspot.severity}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {hotspot.spectral.ndti}
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {hotspot.detected ? (() => { const d = new Date(hotspot.detected); return isNaN(d.getTime()) ? hotspot.detected : d.toLocaleDateString("en-GB"); })() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pollution Type Classification */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Pollution Classification
          </h2>
          <p className="text-gray-400 mb-8">
            Our AI identifies three primary industrial pollution sources using
            spectral analysis
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {pollutionTypes.map((pType) => (
              <div
                key={pType.type}
                className={`glass-card p-6 border-t-4 border-${pType.color}-500/50`}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-${pType.color}-500/20 flex items-center justify-center mb-4`}
                >
                  <pType.icon size={24} className={`text-${pType.color}-400`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {pType.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {pType.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wider">
                    Spectral Indicators
                  </div>
                  {pType.indicators.map((ind, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-gray-300"
                    >
                      <Eye size={12} className={`text-${pType.color}-400`} />
                      {ind}
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/5">
                  <div className="text-xs text-gray-500">Primary Sources</div>
                  <div className="text-sm text-white mt-1">{pType.sources}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Methodology Section */}
        <div className="mt-12 glass-card p-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 mb-4">
                <Satellite size={14} className="text-blue-400" />
                <span className="text-blue-400 text-xs font-medium">
                  Technical Methodology
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                How Pollution Detection Works
              </h2>
              <p className="text-gray-300 mb-6 leading-relaxed">
                NodiWatch uses the Normalized Difference Turbidity Index (NDTI)
                derived from Sentinel-2 multispectral imagery to detect water
                quality anomalies. Combined with CDOM (Green/Blue ratio) and
                Red/Blue band ratios, we classify pollution cluster types.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-teal/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-teal font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">
                      Satellite Image Acquisition
                    </h4>
                    <p className="text-sm text-gray-400">
                      Sentinel-2 MSI provides 10m resolution multispectral
                      imagery every 5 days
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-teal/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-teal font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">
                      Spectral Index Calculation
                    </h4>
                    <p className="text-sm text-gray-400">
                      NDTI = (Red - Green) / (Red + Green) identifies turbidity
                      and color changes
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-teal/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-teal font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">
                      Threshold-Based Classification
                    </h4>
                    <p className="text-sm text-gray-400">
                      Index thresholds classify pollution cluster types:
                      high-dye, high-organic, mixed industrial
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-teal/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-teal font-semibold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">
                      Factory Attribution
                    </h4>
                    <p className="text-sm text-gray-400">
                      Bayesian inference combines proximity, industry type, and
                      discharge timing
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6">
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Waves size={18} className="text-teal" />
                Spectral Index Reference
              </h4>

              <div className="space-y-4">
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">
                      NDTI (Turbidity)
                    </span>
                    <span className="text-xs text-gray-500">
                      Range: -1 to +1
                    </span>
                  </div>
                  <div className="flex gap-1 h-4 rounded overflow-hidden">
                    <div className="flex-1 bg-blue-500" title="Clean: <0"></div>
                    <div
                      className="flex-1 bg-yellow-500"
                      title="Moderate: 0-0.2"
                    ></div>
                    <div
                      className="flex-1 bg-orange-500"
                      title="Polluted: 0.2-0.4"
                    ></div>
                    <div
                      className="flex-1 bg-red-500"
                      title="Severe: >0.4"
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Clean</span>
                    <span>Moderate</span>
                    <span>Polluted</span>
                    <span>Severe</span>
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">
                      R/B Ratio (Dye Detection)
                    </span>
                    <span className="text-xs text-gray-500">
                      Threshold: 1.5
                    </span>
                  </div>
                  <div className="flex gap-1 h-4 rounded overflow-hidden">
                    <div
                      className="flex-1 bg-green-500"
                      title="Normal: <1.2"
                    ></div>
                    <div
                      className="flex-1 bg-purple-400"
                      title="Likely dye: 1.2-1.5"
                    ></div>
                    <div
                      className="flex-1 bg-purple-600"
                      title="Confirmed: >1.5"
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Normal</span>
                    <span>Likely Dye</span>
                    <span>Confirmed</span>
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">
                      CDOM Index (Organic)
                    </span>
                    <span className="text-xs text-gray-500">Green/Blue ratio</span>
                  </div>
                  <div className="flex gap-1 h-4 rounded overflow-hidden">
                    <div
                      className="flex-1 bg-cyan-400"
                      title="Normal: <1.5"
                    ></div>
                    <div
                      className="flex-1 bg-yellow-500"
                      title="Elevated: 1.5-2.5"
                    ></div>
                    <div
                      className="flex-1 bg-orange-600"
                      title="High: >2.5"
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Normal (&lt;1.5)</span>
                    <span>Elevated (1.5-2.5)</span>
                    <span>High (&gt;2.5)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
