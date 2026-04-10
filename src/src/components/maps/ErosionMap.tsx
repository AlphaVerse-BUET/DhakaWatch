"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Mountain,
  AlertTriangle,
  TrendingDown,
  Eye,
  EyeOff,
  Layers,
  Users,
  Home,
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

import erosionData from "@/data/erosion-corridors.json";
import riversData from "@/data/rivers.json";

// GEE Tile Service
import { getErosionTile, type ErosionTile } from "@/lib/gee-tiles";

/**
 * Compute a filled polygon representing the at-risk zone behind a river bank.
 * Returns [lat, lng] pairs (Leaflet order) for a Polygon component.
 * Uses perpendicular offset from corridor tangent to project inland.
 */
function computeZonePolygon(
  coords: number[][],
  bufferM: number
): [number, number][] {
  const n = coords.length;
  const inland: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const prev = coords[Math.max(0, i - 1)];
    const next = coords[Math.min(n - 1, i + 1)];
    const dlng = next[0] - prev[0];
    const dlat = next[1] - prev[1];
    const mplng = 111_000 * Math.cos((coords[i][1] * Math.PI) / 180);
    const dx = dlng * mplng;
    const dy = dlat * 111_000;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    // Right perpendicular of flow direction (inland for right/west bank of N→S rivers)
    const px = dy / len;
    const py = -dx / len;
    inland.push([
      coords[i][0] + (px * bufferM) / mplng,
      coords[i][1] + (py * bufferM) / 111_000,
    ]);
  }
  const bankLine: [number, number][] = coords.map((c) => [c[1], c[0]] as [number, number]);
  const inlandLine: [number, number][] = inland.map((c) => [c[1], c[0]] as [number, number]).reverse();
  return [...bankLine, ...inlandLine];
}

interface LiveWaterway {
  id: string;
  name: string;
  type: string;
  coordinates: [number, number][];
}

interface ErosionMapProps {
  className?: string;
  onCorridorSelect?: (corridor: any) => void;
  selectedCorridor?: string | null;
}

const getRiskColor = (level: string) => {
  switch (level) {
    case "high":
      return "#ef476f";
    case "medium":
      return "#ffd166";
    case "low":
      return "#06d6a0";
    default:
      return "#118ab2";
  }
};

export default function ErosionMap({
  className = "",
  onCorridorSelect,
  selectedCorridor,
}: ErosionMapProps) {
  const [mounted, setMounted] = useState(false);
  const [showCorridors, setShowCorridors] = useState(true);
  const [showBufferZones, setShowBufferZones] = useState(true);
  const [showRivers, setShowRivers] = useState(true);
  const [showGEEErosion, setShowGEEErosion] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [basemap, setBasemap] = useState<"dark" | "satellite">("satellite");
  const [liveWaterways, setLiveWaterways] = useState<LiveWaterway[] | null>(null);
  const [geeTile, setGeeTile] = useState<ErosionTile | null>(null);
  const [geeLoading, setGeeLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastKeyRef = useRef<string>("");

  // Load GEE erosion tile on mount
  useEffect(() => {
    setGeeLoading(true);
    getErosionTile().then((tile) => {
      setGeeTile(tile);
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

  const center: [number, number] = [23.75, 90.42];

  return (
    <div className={`relative ${className}`}>
      {/* Layer Controls */}
      <div className="absolute top-4 right-4 z-[1000] glass-card p-3 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
          <Layers size={16} />
          <span>Layers</span>
        </div>

        <button
          onClick={() => setShowCorridors(!showCorridors)}
          className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm transition-colors ${
            showCorridors
              ? "bg-red-500/20 text-red-400"
              : "bg-slate-700/50 text-gray-400"
          }`}
        >
          {showCorridors ? <Eye size={14} /> : <EyeOff size={14} />}
          Erosion Corridors
        </button>

        <button
          onClick={() => setShowBufferZones(!showBufferZones)}
          className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm transition-colors ${
            showBufferZones
              ? "bg-yellow-500/20 text-yellow-400"
              : "bg-slate-700/50 text-gray-400"
          }`}
        >
          {showBufferZones ? <Eye size={14} /> : <EyeOff size={14} />}
          Buffer Zones
        </button>

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

        {/* GEE SAR Erosion Toggle */}
        <button
          onClick={() => setShowGEEErosion(!showGEEErosion)}
          disabled={!geeTile}
          className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm transition-colors ${
            showGEEErosion && geeTile
              ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400"
              : "bg-slate-700/50 text-gray-400"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={!geeTile ? "GEE not available" : "Live satellite SAR erosion detection (Sentinel-1)"}
        >
          {showGEEErosion && geeTile ? <Eye size={14} /> : <EyeOff size={14} />}
          <span>GEE SAR Erosion</span>
          {geeLoading && <Loader size={12} className="animate-spin ml-auto" />}
          {geeTile && !geeLoading && <span className="ml-auto text-xs text-orange-400">●live</span>}
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

      {/* Selected Corridor Panel */}
      {selectedData && (
        <div className="absolute top-4 left-4 z-[1000] glass-card p-4 w-80">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <Mountain size={18} className="text-orange-400" />
              <h3 className="font-semibold text-white">{selectedData.name}</h3>
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
              <span className="text-white">{selectedData.river}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Risk Level:</span>
              <span
                className={`badge-${selectedData.risk_level === "high" ? "red" : selectedData.risk_level === "medium" ? "yellow" : "green"}`}
              >
                {selectedData.risk_level}
              </span>
            </div>

            {/* Retreat Rate */}
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown size={14} className="text-red-400" />
                <span className="text-xs text-gray-400">Bank Retreat Rate</span>
              </div>
              <div className="text-2xl font-bold text-red-400">
                {selectedData.retreat_rate_m_year}{" "}
                <span className="text-sm font-normal">m/year</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Total retreat: {selectedData.total_retreat_m}m over 10 years
              </div>
            </div>

            {/* SAR Analysis */}
            <div className="pt-2 border-t border-white/10">
              <div className="text-xs text-gray-400 mb-2">
                SAR Coherence Analysis
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-700/50 rounded p-2">
                  <div className="text-gray-400">Pre-Monsoon</div>
                  <div className="text-white font-semibold">
                    {selectedData.analysis?.sar_coherence_pre_monsoon ?? selectedData.analysis?.sar_coherence ?? '—'}
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded p-2">
                  <div className="text-gray-400">Post-Monsoon</div>
                  <div className="text-red-400 font-semibold">
                    {selectedData.analysis?.sar_coherence_post_monsoon ?? '—'}
                  </div>
                </div>
              </div>
              {selectedData.analysis?.interpretation && (
                <div className="mt-2 text-xs text-gray-400 bg-slate-700/30 rounded p-2">
                  {selectedData.analysis.interpretation}
                </div>
              )}
            </div>

            {/* Impact */}
            <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-yellow-400" />
                <div>
                  <div className="text-white font-semibold">
                    {selectedData.population_at_risk.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">At Risk</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Home size={14} className="text-orange-400" />
                <div>
                  <div className="text-white font-semibold">
                    {selectedData.structures_at_risk}
                  </div>
                  <div className="text-xs text-gray-400">Structures</div>
                </div>
              </div>
            </div>

            {/* Trend */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-gray-400">Trend:</span>
              <span
                className={`px-2 py-0.5 rounded text-xs ${
                  selectedData.trend === "accelerating"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-green-500/20 text-green-400"
                }`}
              >
                {selectedData.trend}
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

        {/* GEE SAR Erosion Detection Layer */}
        {showGEEErosion && geeTile && (
          <TileLayer
            url={geeTile.sar_erosion.url}
            attribution="Google Earth Engine | Sentinel-1 SAR"
            opacity={0.65}
            zIndex={500}
          />
        )}

        {/* Viewport event listener — triggers waterway fetch on pan/zoom */}
        <MapEventListener onBoundsChange={handleBoundsChange} />

        {/* Rivers — static always + live OSM layer when available */}
        {showRivers && riversData.features.map((river: any) => (
          <Polyline
            key={river.properties.id}
            positions={river.geometry.coordinates.map((c: number[]) => [c[1], c[0]])}
            pathOptions={{
              color: river.properties.status === "critical" ? "#ef476f"
                : river.properties.status === "severe" ? "#ff8c00"
                : "#118ab2",
              weight: 3,
              opacity: 0.6,
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
        ))}
        {showRivers && liveWaterways && liveWaterways.map((w) => (
          <Polyline
            key={`w-${w.id}`}
            positions={w.coordinates.map((c) => [c[1], c[0]] as [number, number])}
            pathOptions={{ color: "#118ab2", weight: 4, opacity: 0.75 }}
          >
            <Popup>
              <strong>{w.name}</strong>
              <br />
              <span className="text-xs capitalize">{w.type} · OSM live</span>
            </Popup>
          </Polyline>
        ))}

        {/* Erosion Corridors — bank line + at-risk zone polygon */}
        {showCorridors &&
          erosionData.corridors.map((corridor: any) => {
            const color = getRiskColor(corridor.risk_level);
            const isSelected = selectedCorridor === corridor.id;
            const bankPositions = corridor.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
            const handleClick = () => { setSelectedData(corridor); onCorridorSelect?.(corridor); };

            return (
              <div key={corridor.id}>
                {/* Warning zone polygon (outer, wider, lighter) */}
                {showBufferZones && corridor.coordinates.length >= 2 && (
                  <Polygon
                    positions={computeZonePolygon(corridor.coordinates, corridor.buffer_zone?.warning_m ?? 100)}
                    pathOptions={{
                      color,
                      fillColor: color,
                      fillOpacity: 0.12,
                      weight: 0,
                    }}
                    eventHandlers={{ click: handleClick }}
                  />
                )}

                {/* Critical zone polygon (inner, tighter, more opaque) */}
                {showBufferZones && corridor.coordinates.length >= 2 && (
                  <Polygon
                    positions={computeZonePolygon(corridor.coordinates, corridor.buffer_zone?.critical_m ?? 50)}
                    pathOptions={{
                      color,
                      fillColor: color,
                      fillOpacity: 0.22,
                      weight: 1,
                      dashArray: "4, 4",
                      opacity: 0.4,
                    }}
                    eventHandlers={{ click: handleClick }}
                  />
                )}

                {/* Bank edge polyline */}
                <Polyline
                  positions={bankPositions}
                  pathOptions={{
                    color,
                    weight: isSelected ? 6 : 4,
                    opacity: isSelected ? 1 : 0.85,
                    dashArray: corridor.trend === "stable" ? "8, 4" : undefined,
                  }}
                  eventHandlers={{ click: handleClick }}
                >
                  <Popup>
                    <div className="min-w-[180px] text-sm">
                      <div className="font-bold mb-1">{corridor.name}</div>
                      <div className="text-xs text-gray-600 space-y-0.5">
                        <p>River: <strong>{corridor.river}</strong></p>
                        <p>Retreat: <strong className={corridor.risk_level === "high" ? "text-red-600" : "text-yellow-600"}>{corridor.retreat_rate_m_year} m/year</strong></p>
                        <p>Population at risk: {corridor.population_at_risk.toLocaleString()}</p>
                        <p>SAR coherence: {corridor.analysis?.sar_coherence_pre_monsoon} → <span className="text-red-600">{corridor.analysis?.sar_coherence_post_monsoon}</span></p>
                        <p>Trend: <span className={corridor.trend === "accelerating" ? "text-red-600 font-semibold" : "text-green-600"}>{corridor.trend}</span></p>
                      </div>
                    </div>
                  </Popup>
                </Polyline>

                {/* Pulsing start marker for accelerating corridors */}
                <CircleMarker
                  center={[corridor.coordinates[0][1], corridor.coordinates[0][0]]}
                  radius={corridor.trend === "accelerating" ? 7 : 5}
                  pathOptions={{
                    color,
                    fillColor: color,
                    fillOpacity: 0.9,
                    weight: 2,
                    className: corridor.trend === "accelerating" ? "pulse-marker" : "",
                  }}
                  eventHandlers={{ click: handleClick }}
                />
              </div>
            );
          })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] glass-card p-3">
        <div className="text-xs font-medium text-gray-300 mb-2">
          Risk Levels
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-red-500 rounded"></div>
            <span>High Risk (&gt;10m/year)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-yellow-500 rounded"></div>
            <span>Medium Risk (5-10m/year)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-green-500 rounded"></div>
            <span>Low Risk (&lt;5m/year)</span>
          </div>
        </div>
        {showBufferZones && (
          <div className="mt-2 pt-2 border-t border-white/10">
            <div className="text-xs text-gray-400 mb-1">Buffer Zones</div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 border-2 border-red-500/50 rounded"></div>
              <span>
                Critical ({erosionData.corridors[0]?.buffer_zone?.critical_m}m)
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs mt-1">
              <div className="w-3 h-3 border-2 border-yellow-500/50 rounded"></div>
              <span>
                Warning ({erosionData.corridors[0]?.buffer_zone?.warning_m}m)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="absolute bottom-4 right-4 z-[1000] glass-card p-3">
        <div className="text-xs font-medium text-gray-300 mb-2">
          Monitoring Summary
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-red-400 font-bold text-lg">
              {erosionData.statistics.high_risk}
            </div>
            <div className="text-gray-400">High Risk</div>
          </div>
          <div>
            <div className="text-yellow-400 font-bold text-lg">
              {erosionData.statistics.total_population_at_risk.toLocaleString()}
            </div>
            <div className="text-gray-400">People at Risk</div>
          </div>
          <div>
            <div className="text-orange-400 font-bold text-lg">
              {erosionData.statistics.max_retreat_rate}
            </div>
            <div className="text-gray-400">Max m/year</div>
          </div>
          <div>
            <div className="text-purple-400 font-bold text-lg">
              {erosionData.statistics.total_structures_at_risk}
            </div>
            <div className="text-gray-400">Structures</div>
          </div>
        </div>
      </div>
    </div>
  );
}
