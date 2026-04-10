"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Database,
  Satellite,
  Code,
  Download,
  ExternalLink,
  Copy,
  Check,
  Globe,
  Layers,
  Camera,
  CheckCircle2,
  FileJson,
  FileSpreadsheet,
  HardDrive,
} from "lucide-react";
import {
  datasets,
  spectralIndices,
  geeCodeSnippets,
  researchReferences,
} from "@/data/datasets";
import DatasetDownloadCard from "@/components/DatasetDownloadCard";

const sampleDatasets = [
  {
    name: "Pollution Hotspots 2024",
    description:
      "AI-detected industrial discharge locations with spectral analysis results",
    source: "Sentinel-2 MSI",
    resolution: "10m",
    coverage: "Bangladesh Rivers",
    updateFrequency: "Weekly",
    previewImage: "/assets/polluted_river.png",
    geeId: "users/nodiwatch/pollution_hotspots_2024",
    sampleData: {
      id: "PH-001",
      river: "Buriganga",
      severity: 94,
      type: "textile",
      coordinates: [90.3836, 23.7062],
    },
  },
  {
    name: "Encroachment Boundaries",
    description: "River boundary changes 2016-2026 with area loss calculations",
    source: "Sentinel-2 MNDWI",
    resolution: "10m",
    coverage: "Major Rivers",
    updateFrequency: "Monthly",
    previewImage: "/assets/encroachment_comparison.png",
    geeId: "users/nodiwatch/encroachment_2016_2026",
    sampleData: {
      segment: "Turag-01",
      width_2016: 300,
      width_2026: 120,
      loss_pct: 60,
    },
  },
  {
    name: "Erosion Risk Corridors",
    description: "SAR-derived bank stability analysis with risk scores",
    source: "Sentinel-1 SAR",
    resolution: "20m",
    coverage: "Major Rivers",
    updateFrequency: "Bi-weekly",
    previewImage: "/assets/erosion_comparison.png",
    geeId: "users/nodiwatch/erosion_corridors_2024",
    sampleData: {
      corridor: "Jamuna-C1",
      retreat_rate: 15.2,
      risk: "high",
      population: 12500,
    },
  },
  {
    name: "UHI Heat Risk Wards",
    description: "Ward-level heat risk ranking using Landsat thermal composites",
    source: "Landsat 8/9 L2 Thermal",
    resolution: "100m (thermal), aggregated by ward",
    coverage: "Dhaka Wards",
    updateFrequency: "Monthly",
    previewImage: "/assets/encroachment_comparison.png",
    geeId: "users/nodiwatch/uhi_heat_risk_wards",
    sampleData: {
      ward: "Old Dhaka",
      lst_celsius: 38.2,
      heat_risk_score: 0.87,
      suggested_action: "cool_roof + street_trees",
    },
  },
  {
    name: "Urban Flood Watchlist Roads",
    description: "Road passability risk from sink susceptibility and monsoon water evidence",
    source: "ALOS AW3D30 + Sentinel-1",
    resolution: "30m DEM + 10m SAR",
    coverage: "Dhaka Priority Corridors",
    updateFrequency: "Monsoon season updates",
    previewImage: "/assets/erosion_comparison.png",
    geeId: "users/nodiwatch/waterlogging_road_watchlist",
    sampleData: {
      road: "Farmgate Crossing",
      flood_risk: 0.82,
      expected_water_depth_cm: 36,
      passability: "slow",
    },
  },
  {
    name: "Air Burden Ward Index",
    description: "NO2, SO2, and CO burden index for strategic ward prioritization",
    source: "Sentinel-5P OFFL L3",
    resolution: "Coarse atmospheric grid",
    coverage: "Dhaka Wards",
    updateFrequency: "Weekly rolling window",
    previewImage: "/assets/pollution_comparison.png",
    geeId: "users/nodiwatch/air_burden_ward_index",
    sampleData: {
      ward: "Farmgate",
      burden_score: 0.79,
      confidence: "coarse_resolution",
      policy_hint: "low_emission_zone_candidate",
    },
  },
  {
    name: "Green Canopy Index",
    description: "NDVI current condition and 5-year canopy change per ward",
    source: "Sentinel-2 SR Harmonized",
    resolution: "10m",
    coverage: "Dhaka Wards",
    updateFrequency: "Seasonal",
    previewImage: "/assets/encroachment_comparison.png",
    geeId: "users/nodiwatch/green_canopy_index",
    sampleData: {
      ward: "Purbachal",
      ndvi_current: 0.54,
      ndvi_change_5y: 0.08,
      priority_flag: "maintain_and_protect",
    },
  },
];

export default function DatasetsPage() {
  const [selectedDataset, setSelectedDataset] = useState(datasets[0]);
  const [activeTab, setActiveTab] = useState<
    "datasets" | "downloads" | "indices" | "code" | "references"
  >("datasets");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen animate-fadeIn">
      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-teal/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 mb-6">
              <Database size={16} className="text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">
                Open Data for Research
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="text-white">Datasets &</span>{" "}
              <span className="text-blue-400">Methodology</span>
            </h1>

            <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-2xl">
              Access satellite data sources, spectral indices, GEE code
              snippets, and downloadable datasets for your own environmental
              research.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-gray-400">
                <CheckCircle2 size={18} className="text-green-400" />
                <span>Free for research use</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <CheckCircle2 size={18} className="text-green-400" />
                <span>GeoJSON, CSV, JSON formats</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <CheckCircle2 size={18} className="text-green-400" />
                <span>GEE collection IDs included</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { key: "datasets", label: "Satellite Sources", icon: Satellite },
            { key: "downloads", label: "Download Data", icon: Download },
            { key: "indices", label: "Spectral Indices", icon: Database },
            { key: "code", label: "GEE Code", icon: Code },
            { key: "references", label: "References", icon: ExternalLink },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-slate-800/50 text-gray-400 hover:text-white"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Downloads Tab */}
        {activeTab === "downloads" && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Downloadable Datasets
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Ready-to-use datasets from our satellite analysis pipeline. All
                data is georeferenced and includes metadata.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {sampleDatasets.map((dataset, idx) => (
                <DatasetDownloadCard
                  key={idx}
                  name={dataset.name}
                  description={dataset.description}
                  source={dataset.source}
                  resolution={dataset.resolution}
                  coverage={dataset.coverage}
                  updateFrequency={dataset.updateFrequency}
                  previewImage={dataset.previewImage}
                  geeId={dataset.geeId}
                  sampleData={dataset.sampleData}
                  downloadFormats={["geojson", "csv", "json"]}
                />
              ))}
            </div>

            <div className="mt-12 glass-card p-8">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    Use in Google Earth Engine
                  </h3>
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    All datasets are available as GEE Assets. Copy the
                    collection ID and use it directly in your Earth Engine
                    scripts for further analysis.
                  </p>
                  <div className="bg-slate-800/50 rounded-lg p-4 font-mono text-sm">
                    <div className="text-gray-400 mb-2">
                      {"// Load NodiWatch pollution data"}
                    </div>
                    <div className="text-teal">
                      var pollution = ee.FeatureCollection(
                    </div>
                    <div className="text-yellow-400 pl-4">
                      {"'users/nodiwatch/pollution_hotspots_2024'"}
                    </div>
                    <div className="text-teal">);</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-800/30 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                      <FileJson size={24} className="text-blue-400" />
                    </div>
                    <div className="font-semibold text-white">GeoJSON</div>
                    <div className="text-xs text-gray-400">Geo-referenced</div>
                  </div>
                  <div className="text-center p-4 bg-slate-800/30 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                      <FileSpreadsheet size={24} className="text-green-400" />
                    </div>
                    <div className="font-semibold text-white">CSV</div>
                    <div className="text-xs text-gray-400">
                      Tabular analysis
                    </div>
                  </div>
                  <div className="text-center p-4 bg-slate-800/30 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-teal/20 flex items-center justify-center mx-auto mb-3">
                      <HardDrive size={24} className="text-teal" />
                    </div>
                    <div className="font-semibold text-white">GEE Asset</div>
                    <div className="text-xs text-gray-400">Cloud analysis</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Datasets Tab */}
        {activeTab === "datasets" && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Dataset List */}
            <div className="space-y-3">
              {datasets.map((dataset) => (
                <div
                  key={dataset.id}
                  onClick={() => setSelectedDataset(dataset)}
                  className={`glass-card p-4 cursor-pointer transition-all ${
                    selectedDataset.id === dataset.id
                      ? "border-blue-500/50 bg-blue-500/5"
                      : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Satellite size={20} className="text-blue-400 mt-1" />
                    <div>
                      <div className="text-white font-medium">
                        {dataset.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {dataset.provider}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dataset Details */}
            <div className="lg:col-span-2 glass-card p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {selectedDataset.name}
                  </h3>
                  <p className="text-gray-400">{selectedDataset.provider}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm">
                  {selectedDataset.resolution}
                </span>
              </div>

              <p className="text-gray-300 mb-6">
                {selectedDataset.description}
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-3">
                    Spectral Bands
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDataset.bands.map((band, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded bg-slate-800/50 text-gray-300 text-xs"
                      >
                        {band}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-3">
                    Applications
                  </h4>
                  <ul className="space-y-1">
                    {selectedDataset.applications.map((app, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-gray-300"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-teal"></div>
                        {app}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400">
                      Temporal Coverage
                    </div>
                    <div className="text-white">
                      {selectedDataset.temporalCoverage}
                    </div>
                  </div>
                  {selectedDataset.geeCollection && (
                    <div className="text-right">
                      <div className="text-xs text-gray-400">
                        GEE Collection
                      </div>
                      <code className="text-teal text-sm">
                        {selectedDataset.geeCollection}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Spectral Indices Tab */}
        {activeTab === "indices" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spectralIndices.map((index, i) => (
              <div key={index.name} className="glass-card p-5">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {index.name}
                </h3>
                <code className="block bg-slate-800/50 rounded px-3 py-2 text-teal text-sm mb-3 font-mono">
                  {index.formula}
                </code>
                <p className="text-sm text-gray-400 mb-3">
                  {index.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Threshold:</span>
                  <span className="text-yellow-400 font-semibold">
                    {index.threshold}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="text-xs text-gray-400">Application</div>
                  <div className="text-white text-sm">{index.application}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* GEE Code Tab */}
        {activeTab === "code" && (
          <div className="space-y-6">
            {geeCodeSnippets.map((snippet, i) => (
              <div key={i} className="glass-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {snippet.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {snippet.description}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(snippet.code, snippet.title)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 text-gray-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    {copiedCode === snippet.title ? (
                      <>
                        <Check size={16} className="text-green-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <pre className="bg-slate-900/50 rounded-lg p-4 overflow-x-auto">
                    <code className="text-sm text-gray-300 font-mono whitespace-pre">
                      {snippet.code}
                    </code>
                  </pre>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-gray-400">Application:</span>
                  <span className="px-2 py-0.5 rounded bg-teal/20 text-teal text-xs">
                    {snippet.application}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* References Tab */}
        {activeTab === "references" && (
          <div className="space-y-4">
            {researchReferences.map((ref, i) => (
              <div key={i} className="glass-card p-5">
                <h3 className="text-lg text-white mb-2">{ref.title}</h3>
                <p className="text-sm text-gray-400 mb-3">
                  {ref.authors.join(", ")} ({ref.year})
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-teal">{ref.journal}</span>
                  {ref.doi && (
                    <a
                      href={`https://doi.org/${ref.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink size={14} />
                      DOI
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
