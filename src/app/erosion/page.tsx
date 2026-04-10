"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Mountain,
  TrendingDown,
  Users,
  Home,
  AlertTriangle,
  Download,
  Satellite,
  Radio,
  CloudRain,
  Waves,
  Camera,
  CheckCircle2,
  Bell,
  Clock,
} from "lucide-react";
import StatsCard from "@/components/StatsCard";
import ComparisonSlider from "@/components/ComparisonSlider";
import erosionData from "@/data/erosion-corridors.json";

const ErosionMap = dynamic(() => import("@/components/maps/ErosionMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900/50 rounded-xl flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-teal border-t-transparent rounded-full"></div>
    </div>
  ),
});

const TrendChart = dynamic(() => import("@/components/charts/TrendChart"), {
  ssr: false,
});

export default function ErosionPage() {
  const [selectedCorridor, setSelectedCorridor] = useState<any>(null);

  return (
    <div className="min-h-screen animate-fadeIn">
      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-transparent to-red-900/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/30 mb-6">
                <Mountain size={16} className="text-orange-400" />
                <span className="text-orange-400 text-sm font-medium">
                  নদী ভাঙন (Nodi Vangon)
                </span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                <span className="text-white">Riverbank</span>{" "}
                <span className="text-orange-400">Erosion</span>{" "}
                <span className="text-white">Monitoring</span>
              </h1>

              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                Using{" "}
                <span className="text-teal font-semibold">Sentinel-1 SAR</span>{" "}
                for all-weather riverbank stability analysis with early warning
                systems for at-risk communities.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 size={18} className="text-green-400" />
                  <span>SAR coherence analysis penetrates cloud cover</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 size={18} className="text-green-400" />
                  <span>Monsoon-season early warning system (72h advance)</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 size={18} className="text-green-400" />
                  <span>Community displacement risk assessment</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Link
                  href="/evidence"
                  className="px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-500 transition-colors flex items-center gap-2"
                >
                  <Camera size={18} />
                  Report Erosion
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
                beforeImage="/assets/erosion_comparison.png"
                afterImage="/assets/erosion_comparison.png"
                beforeLabel="Stable Bank"
                afterLabel="Eroded"
                beforeYear="2020"
                afterYear="2026"
                title="Jamuna River Erosion"
                description="Riverbank retreated 45m, displacing 200+ families"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Erosion Corridors"
            value={erosionData.statistics.total_corridors}
            icon={Mountain}
            color="orange"
          />
          <StatsCard
            title="High Risk Zones"
            value={erosionData.statistics.high_risk}
            icon={AlertTriangle}
            color="red"
          />
          <StatsCard
            title="Population at Risk"
            value={erosionData.statistics.total_population_at_risk.toLocaleString()}
            icon={Users}
            color="yellow"
          />
          <StatsCard
            title="Structures at Risk"
            value={erosionData.statistics.total_structures_at_risk}
            icon={Home}
            color="purple"
          />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Map */}
          <div className="lg:col-span-2 h-[600px]">
            <ErosionMap
              className="w-full h-full"
              onCorridorSelect={setSelectedCorridor}
              selectedCorridor={selectedCorridor?.id}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* How SAR Works */}
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-4">
                SAR Analysis Explained
              </h3>
              <div className="space-y-3 text-sm text-gray-400">
                <p>
                  We use Sentinel-1 SAR (Synthetic Aperture Radar) imagery for
                  all-weather erosion monitoring. Key indicators:
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-400 mt-1.5"></div>
                    <div>
                      <span className="text-white">SAR Coherence</span>: Lower
                      values indicate surface instability and active erosion.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5"></div>
                    <div>
                      <span className="text-white">NDVI Change</span>: Negative
                      values show vegetation loss from bank collapse.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5"></div>
                    <div>
                      <span className="text-white">Soil Moisture</span>: High
                      values indicate water-saturated, unstable banks.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Corridors List */}
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-4">
                Erosion Corridors
              </h3>
              <div className="space-y-3">
                {erosionData.corridors.map((corridor) => (
                  <div
                    key={corridor.id}
                    onClick={() => setSelectedCorridor(corridor)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedCorridor?.id === corridor.id
                        ? "bg-orange-500/20 border border-orange-500/30"
                        : "bg-slate-800/30 hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-white font-medium">
                          {corridor.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {corridor.river}
                        </div>
                      </div>
                      <span
                        className={`badge-${corridor.risk_level === "high" ? "red" : corridor.risk_level === "medium" ? "yellow" : "green"}`}
                      >
                        {corridor.risk_level}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <span className="text-gray-400">Retreat: </span>
                        <span className="text-orange-400 font-semibold">
                          {corridor.retreat_rate_m_year}m/yr
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Trend: </span>
                        <span
                          className={
                            corridor.trend === "accelerating"
                              ? "text-red-400"
                              : "text-green-400"
                          }
                        >
                          {corridor.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Download Button */}
            <button className="w-full glass-card p-4 flex items-center justify-center gap-2 text-teal hover:bg-white/5 transition-colors">
              <Download size={18} />
              <span>Download Erosion Report</span>
            </button>
          </div>
        </div>

        {/* Trend Chart */}
        <TrendChart metric="erosion" />

        {/* Methodology */}
        <div className="mt-8 glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Methodology & Data Sources
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="text-white font-medium mb-2">Data Sources</h4>
              <ul className="space-y-1 text-gray-400">
                {erosionData.methodology.data_sources.map((source, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal"></div>
                    {source}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Analysis Details</h4>
              <div className="space-y-2 text-gray-400">
                <p>
                  Analysis Period: {erosionData.methodology.analysis_period}
                </p>
                <p>
                  Confidence Level:{" "}
                  {(erosionData.methodology.confidence_level * 100).toFixed(0)}%
                </p>
                <p>
                  The erosion corridors are identified by combining SAR
                  coherence analysis with optical change detection and DEM slope
                  analysis.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Early Warning Section */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <div className="glass-card p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <Bell size={24} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Early Warning System
                </h3>
                <p className="text-gray-400 text-sm">
                  Protecting communities before disaster strikes
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                <Clock size={20} className="text-red-400" />
                <div>
                  <div className="font-semibold text-white">
                    72-Hour Warning
                  </div>
                  <div className="text-sm text-gray-400">
                    SAR coherence drop triggers alert
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl">
                <CloudRain size={20} className="text-orange-400" />
                <div>
                  <div className="font-semibold text-white">
                    Monsoon Integration
                  </div>
                  <div className="text-sm text-gray-400">
                    Weather forecasts enhance predictions
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                <Users size={20} className="text-yellow-400" />
                <div>
                  <div className="font-semibold text-white">
                    Community Alerts
                  </div>
                  <div className="text-sm text-gray-400">
                    SMS & local authority notifications
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Radio size={24} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  How SAR Detection Works
                </h3>
                <p className="text-gray-400 text-sm">
                  Cloud-penetrating radar technology
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">
                    Radar Backscatter
                  </h4>
                  <p className="text-gray-400">
                    Sentinel-1 C-band SAR measures surface roughness changes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">
                    Coherence Analysis
                  </h4>
                  <p className="text-gray-400">
                    Phase difference between acquisitions detects ground
                    movement
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">
                    Risk Scoring
                  </h4>
                  <p className="text-gray-400">
                    ML model combines SAR, soil moisture, and slope data
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
