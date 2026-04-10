"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Building2,
  TrendingDown,
  ArrowLeftRight,
  Eye,
  EyeOff,
  Calendar,
  Layers,
  Satellite,
  Loader,
} from "lucide-react";

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
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false },
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false },
);

// Map event listener rendered inside MapContainer — safe from SSR
const MapEventListener = dynamic(
  async () => {
    const rl = await import("react-leaflet");
    function MapEventListenerInner({
      onBoundsChange,
    }: {
      onBoundsChange: (b: any) => void;
    }) {
      const map = rl.useMap();
      useEffect(() => {
        onBoundsChange(map.getBounds());
        const handler = () => onBoundsChange(map.getBounds());
        map.on("moveend", handler);
        return () => { map.off("moveend", handler); };
      }, [map]);
      return null;
    }
    return MapEventListenerInner;
  },
  { ssr: false },
);

import encroachmentData from "@/data/encroachment.json";
import riversData from "@/data/rivers.json";

// GEE Tile Service
import { getWaterTiles, type WaterTiles } from "@/lib/gee-tiles";

interface LiveWaterway {
  id: string;
  name: string;
  type: string;
  coordinates: [number, number][];
}

interface EncroachmentMapProps {
  className?: string;
  onSegmentSelect?: (segment: any) => void;
  selectedSegment?: string | null;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "#ef476f";
    case "severe":
      return "#ff8c00";
    case "moderate":
      return "#ffd166";
    default:
      return "#06d6a0";
  }
};

export default function EncroachmentMap({
  className = "",
  onSegmentSelect,
  selectedSegment,
}: EncroachmentMapProps) {
  const [mounted, setMounted] = useState(false);
  const [activeYear, setActiveYear] = useState<"2016" | "2026">("2026");
  const [showComparison, setShowComparison] = useState(true);
  const [showRivers, setShowRivers] = useState(true);
  const [showSegments, setShowSegments] = useState(true);
  const [showGEEWater, setShowGEEWater] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [basemap, setBasemap] = useState<"dark" | "satellite">("satellite");
  const [liveWaterways, setLiveWaterways] = useState<LiveWaterway[] | null>(null);
  const [geeTiles, setGeeTiles] = useState<WaterTiles | null>(null);
  const [geeLoading, setGeeLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastKeyRef = useRef<string>("");

  // Load GEE water tiles on mount
  useEffect(() => {
    setGeeLoading(true);
    getWaterTiles().then((tiles) => {
      setGeeTiles(tiles);
      setGeeLoading(false);
    });
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBoundsChange = useCallback(async (bounds: any) => {
    const S = bounds.getSouth().toFixed(3);
    const W = bounds.getWest().toFixed(3);
    const N = bounds.getNorth().toFixed(3);
    const E = bounds.getEast().toFixed(3);
    const key = `${S},${W},${N},${E}`;
    if (key === lastKeyRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      lastKeyRef.current = key;
      try {
        const res = await fetch(`/api/geo?south=${S}&west=${W}&north=${N}&east=${E}`);
        if (res.ok) {
          const data = await res.json();
          if (data.waterways?.length) setLiveWaterways(data.waterways);
        }
      } catch {
        // Backend unavailable — keep static rivers
      }
    }, 600);
  }, []);

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

  const center: [number, number] = [23.75, 90.4];

  return (
    <div className={`relative ${className}`}>
      {/* Year Toggle */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] glass-card p-2 flex gap-1">
        <button
          onClick={() => setActiveYear("2016")}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            activeYear === "2016"
              ? "bg-blue-500 text-white"
              : "bg-slate-700/50 text-gray-400 hover:text-white"
          }`}
        >
          <Calendar size={16} />
          2016
        </button>
        <button
          onClick={() => setActiveYear("2026")}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            activeYear === "2026"
              ? "bg-red-500 text-white"
              : "bg-slate-700/50 text-gray-400 hover:text-white"
          }`}
        >
          <Calendar size={16} />
          2026
        </button>
        <button
          onClick={() => setShowComparison(!showComparison)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            showComparison
              ? "bg-purple-500 text-white"
              : "bg-slate-700/50 text-gray-400 hover:text-white"
          }`}
        >
          <ArrowLeftRight size={16} />
          Compare
        </button>
      </div>

      {/* Layer Controls */}
      <div className="absolute top-4 right-4 z-[1000] glass-card p-3 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
          <Layers size={16} />
          <span>Layers</span>
        </div>

        <button
          onClick={() => setShowRivers(!showRivers)}
          className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm transition-colors ${
            showRivers
              ? "bg-blue-500/20 text-blue-400"
              : "bg-slate-700/50 text-gray-400"
          }`}
        >
          {showRivers ? <Eye size={14} /> : <EyeOff size={14} />}
          Rivers
        </button>

        <button
          onClick={() => setShowSegments(!showSegments)}
          className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm transition-colors ${
            showSegments
              ? "bg-red-500/20 text-red-400"
              : "bg-slate-700/50 text-gray-400"
          }`}
        >
          {showSegments ? <Eye size={14} /> : <EyeOff size={14} />}
          Encroachment Sites
        </button>

        {/* GEE Water Segmentation Toggle */}
        <button
          onClick={() => setShowGEEWater(!showGEEWater)}
          disabled={!geeTiles}
          className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm transition-colors ${
            showGEEWater && geeTiles
              ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400"
              : "bg-slate-700/50 text-gray-400"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={!geeTiles ? "GEE not available" : "Live satellite water segmentation (MNDWI)"}
        >
          {showGEEWater && geeTiles ? <Eye size={14} /> : <EyeOff size={14} />}
          <span>GEE Water Mask</span>
          {geeLoading && <Loader size={12} className="animate-spin ml-auto" />}
          {geeTiles && !geeLoading && <span className="ml-auto text-xs text-cyan-400">●live</span>}
        </button>

        <div className="border-t border-white/10 pt-2 mt-1">
          <button
            onClick={() => setBasemap(basemap === "dark" ? "satellite" : "dark")}
            className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm transition-colors ${
              basemap === "satellite"
                ? "bg-blue-500/20 text-blue-400"
                : "bg-slate-700/50 text-gray-400"
            }`}
          >
            <Satellite size={14} />
            {basemap === "satellite" ? "Satellite" : "Dark Map"}
          </button>
        </div>
      </div>

      {/* Selected Segment Panel */}
      {selectedData && (
        <div className="absolute top-20 left-4 z-[1000] glass-card p-4 w-80">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-red-400" />
              <h3 className="font-semibold text-white">
                {selectedData.location}
              </h3>
            </div>
            <button
              onClick={() => setSelectedData(null)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">River:</span>
              <span className="text-white">
                {selectedData.river} ({selectedData.riverBn})
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Severity:</span>
              <span
                className={`badge-${selectedData.severity === "critical" ? "red" : "yellow"}`}
              >
                {selectedData.severity}
              </span>
            </div>

            {/* Width Comparison */}
            <div className="pt-2 border-t border-white/10">
              <div className="text-xs text-gray-400 mb-2">
                River Width Change
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center bg-blue-500/10 rounded p-2">
                  <div className="text-blue-400 text-xs">2016</div>
                  <div className="text-white font-bold">
                    {selectedData.width_2016}m
                  </div>
                </div>
                <div className="text-center bg-red-500/10 rounded p-2">
                  <div className="text-red-400 text-xs">2026</div>
                  <div className="text-white font-bold">
                    {selectedData.width_2026}m
                  </div>
                </div>
              </div>
            </div>

            {/* Shrinkage Bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Shrinkage</span>
                <span className="text-red-400 font-semibold">
                  {selectedData.shrinkage_pct}%
                </span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-red-500"
                  style={{ width: `${selectedData.shrinkage_pct}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Cause:</span>
              <span className="text-white text-right text-xs">
                {selectedData.cause}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Affected:</span>
              <span className="text-white">
                {selectedData.affected_population.toLocaleString()} people
              </span>
            </div>
          </div>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={12}
        className="w-full h-full rounded-xl"
        style={{ background: "#0a0f1a" }}
      >
        {basemap === "satellite" ? (
          <TileLayer
            attribution='&copy; Esri, Maxar, Earthstar Geographics'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        )}

        {/* GEE Water Segmentation Layer */}
        {showGEEWater && geeTiles && showComparison && (
          <>
            <TileLayer
              url={geeTiles.baseline_2016.url}
              attribution="Google Earth Engine | MNDWI Water Mask (2016)"
              opacity={0.55}
              zIndex={500}
            />
            <TileLayer
              url={geeTiles.current_2026.url}
              attribution="Google Earth Engine | MNDWI Water Mask (2026)"
              opacity={0.55}
              zIndex={510}
            />
          </>
        )}

        {showGEEWater && geeTiles && !showComparison && (
          <TileLayer
            url={
              activeYear === "2016"
                ? geeTiles.baseline_2016.url
                : geeTiles.current_2026.url
            }
            attribution="Google Earth Engine | MNDWI Water Mask"
            opacity={0.6}
            zIndex={500}
          />
        )}

        {/* Viewport event listener — triggers waterway fetch on pan/zoom */}
        <MapEventListener onBoundsChange={handleBoundsChange} />

        {/* Rivers — live OSM if available, else static fallback */}
        {showRivers &&
          (liveWaterways
            ? liveWaterways.map((w) => (
                <Polyline
                  key={`w-${w.id}`}
                  positions={w.coordinates.map((c) => [c[1], c[0]] as [number, number])}
                  pathOptions={{ color: "#118ab2", weight: 3, opacity: 0.7 }}
                >
                  <Popup>
                    <strong>{w.name}</strong>
                    <br />
                    <span className="text-xs capitalize">{w.type} · OSM</span>
                  </Popup>
                </Polyline>
              ))
            : riversData.features.map((river: any) => (
                <Polyline
                  key={river.properties.id}
                  positions={river.geometry.coordinates.map((c: number[]) => [
                    c[1],
                    c[0],
                  ])}
                  pathOptions={{
                    color: "#118ab2",
                    weight: 4,
                    opacity: 0.7,
                  }}
                >
                  <Popup>
                    <div className="text-center">
                      <strong>{river.properties.name}</strong>
                      <br />
                      <span className="text-xs">{river.properties.nameBn}</span>
                    </div>
                  </Popup>
                </Polyline>
              )))}

        {/* Encroachment Segments */}
        {showSegments &&
          encroachmentData.segments.map((segment: any) => (
            <div key={segment.id}>
              {/* 2016 Boundary - Blue */}
              {(showComparison || activeYear === "2016") &&
                segment.boundary_2016 && (
                  <Polyline
                    positions={segment.boundary_2016.map((c: number[]) => [
                      c[1],
                      c[0],
                    ])}
                    pathOptions={{
                      color: "#3b82f6",
                      weight: 3,
                      opacity: activeYear === "2016" ? 1 : 0.4,
                      dashArray: "5, 5",
                    }}
                  />
                )}

              {/* 2026 Boundary - Red */}
              {(showComparison || activeYear === "2026") &&
                segment.boundary_2026 && (
                  <Polyline
                    positions={segment.boundary_2026.map((c: number[]) => [
                      c[1],
                      c[0],
                    ])}
                    pathOptions={{
                      color: "#ef4444",
                      weight: 3,
                      opacity: activeYear === "2026" ? 1 : 0.4,
                      dashArray: "5, 5",
                    }}
                  />
                )}

              {/* Location Marker */}
              <CircleMarker
                center={[segment.lat, segment.lng]}
                radius={10}
                pathOptions={{
                  color: getSeverityColor(segment.severity),
                  fillColor: getSeverityColor(segment.severity),
                  fillOpacity: 0.7,
                  weight: 2,
                }}
                eventHandlers={{
                  click: () => {
                    setSelectedData(segment);
                    onSegmentSelect?.(segment);
                  },
                }}
              >
                <Popup>
                  <div className="text-center min-w-[150px]">
                    <strong>{segment.location}</strong>
                    <br />
                    <span className="text-xs">River: {segment.river}</span>
                    <br />
                    <span
                      className={`text-xs ${
                        segment.severity === "critical"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      Shrinkage: {segment.shrinkage_pct}%
                    </span>
                  </div>
                </Popup>
              </CircleMarker>
            </div>
          ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] glass-card p-3">
        <div className="text-xs font-medium text-gray-300 mb-2">Legend</div>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-0.5 bg-blue-500"
              style={{ borderStyle: "dashed" }}
            ></div>
            <span>2016 Boundary</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-0.5 bg-red-500"
              style={{ borderStyle: "dashed" }}
            ></div>
            <span>2026 Boundary</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Critical (&gt;50% shrinkage)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Moderate (&lt;50% shrinkage)</span>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="absolute bottom-4 right-4 z-[1000] glass-card p-3">
        <div className="text-xs font-medium text-gray-300 mb-2">
          10-Year Impact
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-red-400 font-bold text-lg">
              {encroachmentData.statistics.average_shrinkage_pct.toFixed(1)}%
            </div>
            <div className="text-gray-400">Avg Shrinkage</div>
          </div>
          <div>
            <div className="text-yellow-400 font-bold text-lg">
              {(
                encroachmentData.statistics.total_affected_population / 1000
              ).toFixed(0)}
              K
            </div>
            <div className="text-gray-400">People Affected</div>
          </div>
        </div>
      </div>
    </div>
  );
}
