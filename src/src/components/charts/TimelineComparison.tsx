"use client";

import { useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { GitCompare, Calendar } from "lucide-react";
import { riverTrends } from "@/data/trends";

interface TimelineComparisonProps {
  className?: string;
}

export default function TimelineComparison({
  className = "",
}: TimelineComparisonProps) {
  const [selectedRiver, setSelectedRiver] = useState("Buriganga");
  const [year1, setYear1] = useState(2016);
  const [year2, setYear2] = useState(2025);

  const riverData = riverTrends.find((r) => r.river === selectedRiver);
  const data1 = riverData?.yearlyData.find((d) => d.year === year1);
  const data2 = riverData?.yearlyData.find((d) => d.year === year2);

  if (!data1 || !data2) return null;

  // Radar chart data
  const radarData = [
    {
      metric: "Pollution",
      year1: data1.pollution_index,
      year2: data2.pollution_index,
      fullMark: 100,
    },
    {
      metric: "Encroachment",
      year1: (data1.encroachment_area_km2 / 6) * 100,
      year2: (data2.encroachment_area_km2 / 6) * 100,
      fullMark: 100,
    },
    {
      metric: "Erosion",
      year1: (data1.erosion_rate_m_year / 15) * 100,
      year2: (data2.erosion_rate_m_year / 15) * 100,
      fullMark: 100,
    },
    {
      metric: "Turbidity",
      year1: (data1.turbidity_ntu / 250) * 100,
      year2: (data2.turbidity_ntu / 250) * 100,
      fullMark: 100,
    },
    {
      metric: "Water Quality",
      year1: data1.water_quality_index,
      year2: data2.water_quality_index,
      fullMark: 100,
    },
  ];

  // Bar comparison data
  const barData = [
    {
      name: "Pollution Index",
      [year1]: data1.pollution_index,
      [year2]: data2.pollution_index,
    },
    {
      name: "Water Quality",
      [year1]: data1.water_quality_index,
      [year2]: data2.water_quality_index,
    },
    {
      name: "Violations",
      [year1]: data1.violations_detected,
      [year2]: data2.violations_detected,
    },
  ];

  const changes = {
    pollution: (
      ((data2.pollution_index - data1.pollution_index) /
        data1.pollution_index) *
      100
    ).toFixed(1),
    water_quality: (
      ((data2.water_quality_index - data1.water_quality_index) /
        data1.water_quality_index) *
      100
    ).toFixed(1),
    encroachment: (
      ((data2.encroachment_area_km2 - data1.encroachment_area_km2) /
        data1.encroachment_area_km2) *
      100
    ).toFixed(1),
    erosion: (
      ((data2.erosion_rate_m_year - data1.erosion_rate_m_year) /
        data1.erosion_rate_m_year) *
      100
    ).toFixed(1),
  };

  return (
    <div className={`glass-card p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <GitCompare size={20} className="text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Timeline Comparison</h3>
            <p className="text-sm text-gray-400">
              Compare metrics across years
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedRiver}
            onChange={(e) => setSelectedRiver(e.target.value)}
            className="bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
          >
            {riverTrends.map((r) => (
              <option key={r.river} value={r.river}>
                {r.river}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-blue-400" />
            <select
              value={year1}
              onChange={(e) => setYear1(Number(e.target.value))}
              className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-3 py-2 text-sm text-blue-400"
            >
              {renderYearOptions()}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-red-400" />
            <select
              value={year2}
              onChange={(e) => setYear2(Number(e.target.value))}
              className="bg-red-500/20 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-400"
            >
              {renderYearOptions()}
            </select>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-4">
            Multi-Metric Comparison
          </h4>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: "#64748b", fontSize: 10 }}
                />
                <Radar
                  name={String(year1)}
                  dataKey="year1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name={String(year2)}
                  dataKey="year2"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Legend />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-4">
            Key Indicators
          </h4>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={barData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#94a3b8"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey={year1}
                  fill="#3b82f6"
                  name={String(year1)}
                  radius={[0, 4, 4, 0]}
                />
                <Bar
                  dataKey={year2}
                  fill="#ef4444"
                  name={String(year2)}
                  radius={[0, 4, 4, 0]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Change Summary */}
      <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 rounded-lg bg-red-500/10">
          <div className="text-xs text-gray-400 mb-1">Pollution</div>
          <div
            className={`text-lg font-bold ${Number(changes.pollution) > 0 ? "text-red-400" : "text-green-400"}`}
          >
            {Number(changes.pollution) > 0 ? "+" : ""}
            {changes.pollution}%
          </div>
        </div>
        <div className="text-center p-3 rounded-lg bg-green-500/10">
          <div className="text-xs text-gray-400 mb-1">Water Quality</div>
          <div
            className={`text-lg font-bold ${Number(changes.water_quality) < 0 ? "text-red-400" : "text-green-400"}`}
          >
            {Number(changes.water_quality) > 0 ? "+" : ""}
            {changes.water_quality}%
          </div>
        </div>
        <div className="text-center p-3 rounded-lg bg-purple-500/10">
          <div className="text-xs text-gray-400 mb-1">Encroachment</div>
          <div
            className={`text-lg font-bold ${Number(changes.encroachment) > 0 ? "text-red-400" : "text-green-400"}`}
          >
            {Number(changes.encroachment) > 0 ? "+" : ""}
            {changes.encroachment}%
          </div>
        </div>
        <div className="text-center p-3 rounded-lg bg-orange-500/10">
          <div className="text-xs text-gray-400 mb-1">Erosion Rate</div>
          <div
            className={`text-lg font-bold ${Number(changes.erosion) > 0 ? "text-red-400" : "text-green-400"}`}
          >
            {Number(changes.erosion) > 0 ? "+" : ""}
            {changes.erosion}%
          </div>
        </div>
      </div>
    </div>
  );
}

function renderYearOptions() {
  return Array.from({ length: 10 }, (_, i) => 2016 + i).map((year) => (
    <option key={year} value={year}>
      {year}
    </option>
  ));
}
