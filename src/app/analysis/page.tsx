"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  TrendingUp,
  Filter,
  ThermometerSun,
  CloudRain,
  Wind,
  Trees,
} from "lucide-react";

const TrendChart = dynamic(() => import("@/components/charts/TrendChart"), {
  ssr: false,
});
const TimelineComparison = dynamic(
  () => import("@/components/charts/TimelineComparison"),
  { ssr: false },
);
const FactoryAttributionChart = dynamic(
  () => import("@/components/charts/FactoryAttributionChart"),
  { ssr: false },
);

import { aggregatedStats, riverTrends } from "@/data/trends";

export default function AnalysisPage() {
  const [activeMetric, setActiveMetric] = useState<
    "pollution" | "encroachment" | "erosion" | "water_quality"
  >("pollution");

  const metrics = [
    { key: "pollution", label: "Pollution", color: "red" },
    { key: "encroachment", label: "Encroachment", color: "purple" },
    { key: "erosion", label: "Erosion", color: "orange" },
    { key: "water_quality", label: "Water Quality", color: "teal" },
  ] as const;

  return (
    <div className="min-h-screen py-8 animate-fadeIn">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-green-500/20">
              <TrendingUp size={28} className="text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Trend Analysis</h1>
              <p className="text-gray-400">
                10-year historical data analysis across all rivers
              </p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="glass-card p-4 text-center">
            <div className="text-3xl font-bold text-white">
              {aggregatedStats.totalRivers}
            </div>
            <div className="text-sm text-gray-400">Rivers Monitored</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-3xl font-bold text-red-400">
              {aggregatedStats.averagePollutionIndex}
            </div>
            <div className="text-sm text-gray-400">Avg Pollution Index</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-3xl font-bold text-purple-400">
              {aggregatedStats.totalEncroachmentArea}km²
            </div>
            <div className="text-sm text-gray-400">Encroachment Area</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-3xl font-bold text-orange-400">
              {aggregatedStats.averageErosionRate}m/yr
            </div>
            <div className="text-sm text-gray-400">Avg Erosion Rate</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-3xl font-bold text-teal">
              {aggregatedStats.averageWaterQuality}
            </div>
            <div className="text-sm text-gray-400">Avg Water Quality</div>
          </div>
        </div>

        {/* Metric Selector */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 text-gray-400">
            <Filter size={18} />
            <span className="text-sm">Select metric:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {metrics.map((metric) => {
              const activeStyles: Record<string, string> = {
                red: "bg-red-500/20 text-red-400 border border-red-500/30",
                purple: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
                orange: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
                teal: "bg-teal-500/20 text-teal-400 border border-teal-500/30",
              };
              return (
                <button
                  key={metric.key}
                  onClick={() => setActiveMetric(metric.key)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    activeMetric === metric.key
                      ? activeStyles[metric.color]
                      : "bg-slate-800/50 text-gray-400 hover:text-white"
                  }`}
                >
                  {metric.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="glass-card p-4 mb-6">
          <div className="text-sm text-slate-300 mb-3">
            New urban intelligence modules
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link
              href="/uhi-monitoring"
              className="rounded-xl border border-white/10 bg-slate-900/40 p-3 hover:bg-slate-900/60 transition-colors"
            >
              <ThermometerSun size={16} className="text-orange-300 mb-1" />
              <div className="text-sm text-white font-medium">UHI Heat Risk</div>
            </Link>
            <Link
              href="/waterlogging-watch"
              className="rounded-xl border border-white/10 bg-slate-900/40 p-3 hover:bg-slate-900/60 transition-colors"
            >
              <CloudRain size={16} className="text-cyan-300 mb-1" />
              <div className="text-sm text-white font-medium">Waterlogging</div>
            </Link>
            <Link
              href="/air-quality-watch"
              className="rounded-xl border border-white/10 bg-slate-900/40 p-3 hover:bg-slate-900/60 transition-colors"
            >
              <Wind size={16} className="text-sky-300 mb-1" />
              <div className="text-sm text-white font-medium">Air Burden</div>
            </Link>
            <Link
              href="/green-canopy-index"
              className="rounded-xl border border-white/10 bg-slate-900/40 p-3 hover:bg-slate-900/60 transition-colors"
            >
              <Trees size={16} className="text-green-300 mb-1" />
              <div className="text-sm text-white font-medium">Green Index</div>
            </Link>
          </div>
        </div>

        {/* Main Trend Chart */}
        <div key={activeMetric}>
          <TrendChart metric={activeMetric} className="mb-8" />
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Timeline Comparison */}
          <TimelineComparison />

          {/* Factory Attribution */}
          <FactoryAttributionChart />
        </div>

        {/* River Summary Table */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            River-wise Summary (2025)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    River
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Pollution Index
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Water Quality
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Encroachment (km²)
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Erosion (m/yr)
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Violations
                  </th>
                </tr>
              </thead>
              <tbody>
                {riverTrends.map((river) => {
                  const latest = river.yearlyData[river.yearlyData.length - 1];
                  return (
                    <tr
                      key={river.river}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="text-white font-medium">
                          {river.river}
                        </div>
                        <div className="text-xs text-gray-400">
                          {river.riverBn}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-red-500"
                              style={{ width: `${latest.pollution_index}%` }}
                            />
                          </div>
                          <span className="text-red-400">
                            {latest.pollution_index}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{
                                width: `${latest.water_quality_index}%`,
                              }}
                            />
                          </div>
                          <span
                            className={
                              latest.water_quality_index < 20
                                ? "text-red-400"
                                : "text-green-400"
                            }
                          >
                            {latest.water_quality_index}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-purple-400">
                        {latest.encroachment_area_km2}
                      </td>
                      <td className="py-3 px-4 text-orange-400">
                        {latest.erosion_rate_m_year}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`badge-${latest.violations_detected > 30 ? "red" : "yellow"}`}
                        >
                          {latest.violations_detected}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <h4 className="font-medium text-white">Critical Finding</h4>
            </div>
            <p className="text-sm text-gray-400">
              Buriganga and Balu rivers show the highest NDTI turbidity indices,
              exceeding 225 NTU — far above the 50 NTU threshold for aquatic
              habitat viability. Spectral signatures confirm tannery and textile
              effluent as dominant sources.
            </p>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <h4 className="font-medium text-white">Encroachment Trend</h4>
            </div>
            <p className="text-sm text-gray-400">
              River encroachment has accelerated significantly from 2016 to 2025. The
              Turag (Aminbazar) shows the most severe width reduction at 58%,
              while NRCC documented over 37,000 illegal structures on 48 rivers nationally.
            </p>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <h4 className="font-medium text-white">Erosion Alert</h4>
            </div>
            <p className="text-sm text-gray-400">
              Freihardt & Frey (2023) quantify ~8,700 ha/yr consumed by erosion
              nationally. The Sirajganj Jamuna corridor shows 45.2 m/yr retreat —
              within the published range of 11–84 m/yr for that zone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
