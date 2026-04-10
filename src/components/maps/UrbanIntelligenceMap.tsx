"use client";

import { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Layers, Satellite } from "lucide-react";

import { DHAKA_WARDS_GEOJSON } from "@/data/dhaka-ward-boundaries";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Polygon = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polygon),
  { ssr: false },
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

type ScoreRecord = {
  wardId: string;
  wardName: string;
  normalizedScore: number;
  rank: number;
  riskLevel: "critical" | "high" | "moderate" | "low";
};

type UrbanTileLayer = {
  id: string;
  label: string;
  url: string;
  opacity?: number;
};

type UrbanIntelligenceMapProps = {
  className?: string;
  tileLayers: UrbanTileLayer[];
  wardScores: ScoreRecord[];
};

function scoreToColor(score: number) {
  if (score >= 0.8) return "#dc2626";
  if (score >= 0.62) return "#f97316";
  if (score >= 0.4) return "#eab308";
  return "#16a34a";
}

export default function UrbanIntelligenceMap({
  className = "",
  tileLayers,
  wardScores,
}: UrbanIntelligenceMapProps) {
  const [mounted, setMounted] = useState(false);
  const [basemap, setBasemap] = useState<"dark" | "satellite">("satellite");
  const [enabledLayerIds, setEnabledLayerIds] = useState<string[]>(() =>
    tileLayers.slice(0, 1).map((layer) => layer.id),
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setEnabledLayerIds(tileLayers.slice(0, 1).map((layer) => layer.id));
  }, [tileLayers]);

  const scoreByWardId = useMemo(
    () => new Map(wardScores.map((score) => [score.wardId, score] as const)),
    [wardScores],
  );

  if (!mounted) {
    return (
      <div
        className={`bg-slate-900/50 rounded-xl flex items-center justify-center ${className}`}
      >
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-teal border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-400">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      <div className="absolute top-4 left-4 z-[1000] glass-card p-3 space-y-2 w-72">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
          <Layers size={16} />
          <span>Layer Controls</span>
        </div>
        {tileLayers.map((layer) => {
          const enabled = enabledLayerIds.includes(layer.id);
          return (
            <button
              key={layer.id}
              onClick={() =>
                setEnabledLayerIds((prev) =>
                  prev.includes(layer.id)
                    ? prev.filter((id) => id !== layer.id)
                    : [...prev, layer.id],
                )
              }
              className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors ${
                enabled
                  ? "bg-teal/20 text-teal border border-teal/30"
                  : "bg-slate-700/40 text-slate-300 hover:text-white"
              }`}
            >
              {layer.label}
            </button>
          );
        })}
      </div>

      <div className="absolute top-4 right-4 z-[1000]">
        <button
          onClick={() => setBasemap(basemap === "dark" ? "satellite" : "dark")}
          className="glass-card px-3 py-2 rounded-lg text-xs text-slate-200 flex items-center gap-2"
        >
          <Satellite size={14} />
          {basemap === "satellite" ? "Satellite" : "Dark"}
        </button>
      </div>

      <MapContainer
        center={[23.79, 90.41]}
        zoom={11}
        className="w-full h-full"
        style={{ background: "#0a0f1a" }}
      >
        {basemap === "satellite" ? (
          <TileLayer
            attribution="&copy; Esri, Maxar, Earthstar Geographics"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        )}

        {tileLayers
          .filter((layer) => enabledLayerIds.includes(layer.id))
          .map((layer) => (
            <TileLayer
              key={layer.id}
              attribution={`Google Earth Engine | ${layer.label}`}
              url={layer.url}
              opacity={layer.opacity ?? 0.6}
            />
          ))}

        {DHAKA_WARDS_GEOJSON.features.map((feature) => {
          const wardId = feature.properties.ward_id;
          const score = scoreByWardId.get(wardId);
          const positions = feature.geometry.coordinates[0].map(
            ([lng, lat]) => [lat, lng] as [number, number],
          );
          const fillColor = score ? scoreToColor(score.normalizedScore) : "#1f2937";

          return (
            <Polygon
              key={wardId}
              positions={positions}
              pathOptions={{
                color: "#94a3b8",
                weight: 1,
                fillColor,
                fillOpacity: 0.28,
              }}
            >
              <Popup>
                <div className="text-xs min-w-[160px]">
                  <div className="font-semibold text-slate-900 mb-1">
                    {feature.properties.ward_name}
                  </div>
                  {score ? (
                    <>
                      <div>Rank: #{score.rank}</div>
                      <div>Risk Score: {(score.normalizedScore * 100).toFixed(1)}</div>
                      <div className="capitalize">Risk Level: {score.riskLevel}</div>
                    </>
                  ) : (
                    <div>No score yet</div>
                  )}
                </div>
              </Popup>
            </Polygon>
          );
        })}
      </MapContainer>

      <div className="absolute bottom-4 left-4 z-[1000] glass-card px-3 py-2 text-xs text-slate-200">
        Ward scoring: green = lower risk, red = higher risk
      </div>
    </div>
  );
}

