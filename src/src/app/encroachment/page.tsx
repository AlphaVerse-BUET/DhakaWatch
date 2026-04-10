"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Building2,
  TrendingDown,
  MapPin,
  Users,
  Download,
  Satellite,
  Ruler,
  AlertTriangle,
  Camera,
  CheckCircle2,
  Scale,
  FileText,
  Waves,
} from "lucide-react";
import StatsCard from "@/components/StatsCard";
import ComparisonSlider from "@/components/ComparisonSlider";
import encroachmentData from "@/data/encroachment.json";

const EncroachmentMap = dynamic(
  () => import("@/components/maps/EncroachmentMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-900/50 rounded-xl flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-teal border-t-transparent rounded-full"></div>
      </div>
    ),
  },
);

const TimelineComparison = dynamic(
  () => import("@/components/charts/TimelineComparison"),
  { ssr: false },
);

export default function EncroachmentPage() {
  const [selectedSegment, setSelectedSegment] = useState<any>(null);

  const criticalCount = encroachmentData.segments.filter(
    (s) => s.severity === "critical",
  ).length;
  const totalPopulation = encroachmentData.statistics.total_affected_population;

  return (
    <div className="min-h-screen animate-fadeIn">
      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-yellow-900/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 mb-6">
                <Building2 size={16} className="text-yellow-400" />
                <span className="text-yellow-400 text-sm font-medium">
                  নদী দখল (Nodi Dokhol)
                </span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                <span className="text-white">River</span>{" "}
                <span className="text-yellow-400">Encroachment</span>{" "}
                <span className="text-white">Detection</span>
              </h1>

              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                Using{" "}
                <span className="text-teal font-semibold">
                  MNDWI water boundary analysis
                </span>{" "}
                with decade-long historical comparison to identify illegal land
                filling, construction, and river shrinkage.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 size={18} className="text-green-400" />
                  <span>10-year satellite archive comparison (2016-2026)</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 size={18} className="text-green-400" />
                  <span>MNDWI-based water classification at 10m resolution</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 size={18} className="text-green-400" />
                  <span>Enforcement triage intelligence for agency action</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Link
                  href="/evidence"
                  className="px-6 py-3 bg-yellow-600 text-white rounded-xl font-semibold hover:bg-yellow-500 transition-colors flex items-center gap-2"
                >
                  <Camera size={18} />
                  Report Encroachment
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
                beforeImage="/assets/encroachment_comparison.png"
                afterImage="/assets/encroachment_comparison.png"
                beforeLabel="Natural Bank"
                afterLabel="Encroached"
                beforeYear="2016"
                afterYear="2026"
                title="Turag River Encroachment"
                description="River width reduced from 300m to 120m due to illegal filling"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Monitored Segments"
            value={encroachmentData.segments.length}
            icon={MapPin}
            color="purple"
          />
          <StatsCard
            title="Critical Sites"
            value={criticalCount}
            icon={Building2}
            color="red"
            change={{ value: 1, isPositive: false }}
          />
          <StatsCard
            title="Avg Shrinkage"
            value={`${encroachmentData.statistics.average_shrinkage_pct.toFixed(1)}%`}
            icon={TrendingDown}
            color="yellow"
          />
          <StatsCard
            title="Affected Population"
            value={`${(totalPopulation / 1000).toFixed(0)}K`}
            icon={Users}
            color="blue"
          />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Map */}
          <div className="lg:col-span-2 h-[600px]">
            <EncroachmentMap
              className="w-full h-full"
              onSegmentSelect={setSelectedSegment}
              selectedSegment={selectedSegment?.id}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-4">How It Works</h3>
              <div className="space-y-3 text-sm text-gray-400">
                <p>
                  Our system uses multi-temporal satellite imagery to detect
                  changes in river boundaries over the past decade.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-blue-500"></div>
                    <span>Blue: 2016 River Boundary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-red-500"></div>
                    <span>Red: 2026 River Boundary</span>
                  </div>
                </div>
                <p>
                  The difference between boundaries represents land that has
                  been illegally filled or encroached upon.
                </p>
              </div>
            </div>

            {/* Segments List */}
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-4">
                Encroachment Sites
              </h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {encroachmentData.segments.map((segment) => (
                  <div
                    key={segment.id}
                    onClick={() => setSelectedSegment(segment)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedSegment?.id === segment.id
                        ? "bg-purple-500/20 border border-purple-500/30"
                        : "bg-slate-800/30 hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-white font-medium">
                          {segment.location}
                        </div>
                        <div className="text-xs text-gray-400">
                          {segment.river}
                        </div>
                      </div>
                      <span
                        className={`badge-${segment.severity === "critical" ? "red" : "yellow"}`}
                      >
                        {segment.severity}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <span className="text-gray-400">Shrinkage: </span>
                        <span className="text-red-400 font-semibold">
                          {segment.shrinkage_pct}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Lost: </span>
                        <span className="text-white">
                          {segment.width_2016 - segment.width_2026}m
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
              <span>Download Encroachment Report</span>
            </button>
          </div>
        </div>

        {/* Timeline Comparison */}
        <TimelineComparison />

        {/* Data Table */}
        <div className="mt-8 glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Detailed Encroachment Data
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
                    Width 2016
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Width 2026
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Shrinkage
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Cause
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Affected
                  </th>
                </tr>
              </thead>
              <tbody>
                {encroachmentData.segments.map((segment) => (
                  <tr
                    key={segment.id}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                    onClick={() => setSelectedSegment(segment)}
                  >
                    <td className="py-3 px-4 text-white">{segment.location}</td>
                    <td className="py-3 px-4 text-gray-300">{segment.river}</td>
                    <td className="py-3 px-4 text-blue-400">
                      {segment.width_2016}m
                    </td>
                    <td className="py-3 px-4 text-red-400">
                      {segment.width_2026}m
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500"
                            style={{ width: `${segment.shrinkage_pct}%` }}
                          />
                        </div>
                        <span className="text-red-400">
                          {segment.shrinkage_pct}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-xs max-w-[200px] truncate">
                      {segment.cause}
                    </td>
                    <td className="py-3 px-4 text-white">
                      {segment.affected_population.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Methodology Section */}
        <div className="mt-12 glass-card p-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 mb-4">
                <Satellite size={14} className="text-purple-400" />
                <span className="text-purple-400 text-xs font-medium">
                  Technical Methodology
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                How Encroachment Detection Works
              </h2>
              <p className="text-gray-300 mb-6 leading-relaxed">
                NodiWatch uses Modified Normalized Difference Water Index
                (MNDWI) to precisely delineate water boundaries. By comparing
                decade-old imagery with current observations, we quantify
                exactly how much river area has been lost to illegal filling and
                construction.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-400 font-semibold text-sm">
                      1
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">
                      Water Boundary Extraction
                    </h4>
                    <p className="text-sm text-gray-400">
                      MNDWI = (Green - SWIR) / (Green + SWIR) identifies water
                      pixels with high precision
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-400 font-semibold text-sm">
                      2
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">
                      Threshold Segmentation
                    </h4>
                    <p className="text-sm text-gray-400">
                      MNDWI threshold-based classification isolates water
                      pixels for boundary refinement
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-400 font-semibold text-sm">
                      3
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">
                      Temporal Differencing
                    </h4>
                    <p className="text-sm text-gray-400">
                      Multi-temporal stack analysis quantifies area change from
                      2016 baseline to present
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-400 font-semibold text-sm">
                      4
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">
                      Enforcement Reports
                    </h4>
                    <p className="text-sm text-gray-400">
                      Georeferenced evidence packages with satellite
                      timestamps for agency enforcement action
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-xl p-6">
                <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Ruler size={18} className="text-purple-400" />
                  Measurement Standards
                </h4>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                    <span className="text-sm text-gray-400">
                      Spatial Resolution
                    </span>
                    <span className="text-white font-semibold">
                      10m (Sentinel-2)
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                    <span className="text-sm text-gray-400">
                      Temporal Resolution
                    </span>
                    <span className="text-white font-semibold">
                      5 days revisit
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                    <span className="text-sm text-gray-400">
                      Boundary Accuracy
                    </span>
                    <span className="text-white font-semibold">±10m (MNDWI)</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                    <span className="text-sm text-gray-400">Archive Depth</span>
                    <span className="text-white font-semibold">
                      2016-Present
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-900/20 to-transparent rounded-xl p-6 border border-yellow-500/20">
                <div className="flex items-start gap-3">
                  <Scale size={24} className="text-yellow-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-2">
                      Legal Evidence Standard
                    </h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Our encroachment reports provide georeferenced satellite
                      evidence to support agency enforcement and referral to
                      DoE and BWDB for field verification. At 10m resolution,
                      reports serve as enforcement triage — not standalone
                      legal proof.
                    </p>
                    <Link
                      href="/evidence"
                      className="inline-flex items-center gap-1 text-yellow-400 text-sm mt-3 hover:underline"
                    >
                      Submit Evidence <FileText size={14} />
                    </Link>
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
