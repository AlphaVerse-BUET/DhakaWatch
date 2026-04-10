"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { Eye, Layers, Droplets, Factory, Satellite, Loader } from "lucide-react";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false },
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false },
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

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
        // Fire initial load
        onBoundsChange(map.getBounds());
        const handler = () => onBoundsChange(map.getBounds());
        map.on("moveend", handler);
        return () => {
          map.off("moveend", handler);
        };
      }, [map]);
      return null;
    }
    return MapEventListenerInner;
  },
  { ssr: false },
);

// Static fallback data
import riversData from "@/data/rivers.json";
import pollutionData from "@/data/pollution-hotspots.json";
import encroachmentData from "@/data/encroachment.json";
import erosionData from "@/data/erosion-corridors.json";

interface LiveData {
  waterways: Array<{
    id: string;
    name: string;
    type: string;
    coordinates: [number, number][];
  }>;
  hotspots: Array<{
    id: string;
    lat: number;
    lng: number;
    severity: string | number;
    label: string;
    river: string;
    type: string;
    spectral: { ndti: number; cdom: number; red_blue_ratio: number };
    nearby_factories: number;
  }>;
  factories: Array<{
    osm_id: number;
    name: string;
    lat: number;
    lng: number;
    industry_type: string;
    river_name: string;
    distance_to_river_m: number;
  }>;
}

interface DashboardMapProps {
  className?: string;
}

const severityToNum = (s: string | number): number => {
  if (typeof s === "number") return s;
  return s === "critical" ? 88 : s === "high" ? 72 : s === "moderate" ? 52 : 30;
};

const formatSeverityLabel = (s: string | number): string => {
  if (typeof s === "number") {
    if (s >= 85) return "CRITICAL";
    if (s >= 70) return "HIGH";
    if (s >= 45) return "MODERATE";
    return "LOW";
  }
  return s.toUpperCase();
};

export default function DashboardMap({ className = "" }: DashboardMapProps) {
  const [mounted, setMounted] = useState(false);
  const [activeLayer, setActiveLayer] = useState<
    "all" | "pollution" | "encroachment" | "erosion"
  >("all");
  const [basemap, setBasemap] = useState<"dark" | "satellite">("satellite");
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastKeyRef = useRef<string>("");

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
      setLoading(true);
      try {
        const res = await fetch(
          `/api/geo?south=${S}&west=${W}&north=${N}&east=${E}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.waterways?.length || data.hotspots?.length) {
            setLiveData(data);
          }
        }
      } catch {
        // Backend unavailable — keep showing static data
      } finally {
        setLoading(false);
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

  const getSeverityColor = (severity: number | string) => {
    const n = severityToNum(severity);
    if (n >= 85) return "#ef476f";
    if (n >= 70) return "#ff8c00";
    return "#ffd166";
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high": return "#ef476f";
      case "medium": return "#ffd166";
      default: return "#06d6a0";
    }
  };

  const getWaterwayColor = (type: string) => {
    return type === "river" ? "#118ab2" : "#4ecdc4";
  };

  const getFactoryColor = (type: string) => {
    const colors: Record<string, string> = {
      textile: "#7b2ff7",
      tannery: "#ef476f",
      garment: "#06d6a0",
      chemical: "#ff6b6b",
      food: "#4ecdc4",
    };
    return colors[type] || "#ffd166";
  };

  // Use live data when available, else static fallback
  const hasLiveData = liveData && (liveData.waterways.length > 0 || liveData.hotspots.length > 0);

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      {/* Layer Toggle */}
      <div className="absolute top-4 left-4 z-[1000] glass-card p-2 flex gap-1">
        {(["all", "pollution", "encroachment", "erosion"] as const).map(
          (layer) => (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer)}
              className={`px-3 py-1.5 rounded text-xs font-medium capitalize transition-colors ${
                activeLayer === layer
                  ? "bg-teal text-slate-900"
                  : "bg-slate-700/50 text-gray-300 hover:text-white"
              }`}
            >
              {layer}
            </button>
          ),
        )}
      </div>

      {/* Basemap Toggle */}
      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2">
        {loading && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs glass-card text-teal-400">
            <Loader size={12} className="animate-spin" />
            Fetching OSM data...
          </div>
        )}
        {hasLiveData && !loading && (
          <div className="px-2 py-1 rounded text-xs glass-card text-green-400">
            ● Live OSM · {liveData!.waterways.length} rivers
          </div>
        )}
        <button
          onClick={() => setBasemap(basemap === "dark" ? "satellite" : "dark")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            basemap === "satellite"
              ? "bg-blue-500/90 text-white shadow-lg shadow-blue-500/30"
              : "glass-card text-gray-300 hover:text-white"
          }`}
        >
          <Satellite size={14} />
          {basemap === "satellite" ? "Satellite" : "Dark"}
        </button>
      </div>

      <MapContainer
        center={center}
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

        {/* Viewport event listener — triggers data fetch on pan/zoom */}
        <MapEventListener onBoundsChange={handleBoundsChange} />

        {/* Rivers — live OSM waterways if available, else static */}
        {hasLiveData
          ? liveData!.waterways.map((w) => (
              <Polyline
                key={`w-${w.id}`}
                positions={w.coordinates.map((c) => [c[1], c[0]] as [number, number])}
                pathOptions={{
                  color: getWaterwayColor(w.type),
                  weight: w.type === "river" ? 3 : 2,
                  opacity: 0.75,
                }}
              >
                <Popup>
                  <strong>{w.name}</strong>
                  <br />
                  <span className="text-xs capitalize">{w.type} · OSM data</span>
                </Popup>
              </Polyline>
            ))
          : riversData.features.map((river: any) => (
              <Polyline
                key={river.properties.id}
                positions={river.geometry.coordinates.map((c: number[]) => [c[1], c[0]])}
                pathOptions={{
                  color:
                    river.properties.status === "critical"
                      ? "#ef476f"
                      : river.properties.status === "severe"
                        ? "#ff8c00"
                        : "#118ab2",
                  weight: 3,
                  opacity: 0.7,
                }}
              >
                <Popup>
                  <strong>{river.properties.name}</strong>
                  <br />
                  <span className="text-xs">Status: {river.properties.status}</span>
                </Popup>
              </Polyline>
            ))}

        {/* Pollution Hotspots — live if available */}
        {(activeLayer === "all" || activeLayer === "pollution") &&
          (hasLiveData
            ? liveData!.hotspots.map((spot) => (
                <CircleMarker
                  key={spot.id}
                  center={[spot.lat, spot.lng]}
                  radius={Math.max(6, severityToNum(spot.severity) / 8)}
                  pathOptions={{
                    color: getSeverityColor(spot.severity),
                    fillColor: getSeverityColor(spot.severity),
                    fillOpacity: 0.6,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="text-center">
                      <strong>{spot.label}</strong>
                      <br />
                      <span className="text-xs">
                        {spot.river} · {formatSeverityLabel(spot.severity)}
                      </span>
                      <br />
                      <span className="text-xs text-gray-500">
                        NDTI: {spot.spectral.ndti} · {spot.nearby_factories} facilities
                      </span>
                    </div>
                  </Popup>
                </CircleMarker>
              ))
            : pollutionData.hotspots.slice(0, 6).map((spot: any) => (
                <CircleMarker
                  key={spot.id}
                  center={[spot.lat, spot.lng]}
                  radius={spot.severity / 8}
                  pathOptions={{
                    color: getSeverityColor(spot.severity),
                    fillColor: getSeverityColor(spot.severity),
                    fillOpacity: 0.6,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="text-center">
                      <strong>{spot.label}</strong>
                      <br />
                      <span className="text-xs">Severity: {spot.severity}/100</span>
                    </div>
                  </Popup>
                </CircleMarker>
              )))}

        {/* Factories — live layer (only when liveData available) */}
        {(activeLayer === "all" || activeLayer === "pollution") &&
          hasLiveData &&
          liveData!.factories.map((f) => (
            <CircleMarker
              key={`f-${f.osm_id}`}
              center={[f.lat, f.lng]}
              radius={5}
              pathOptions={{
                color: getFactoryColor(f.industry_type),
                fillColor: getFactoryColor(f.industry_type),
                fillOpacity: 0.85,
                weight: 1,
              }}
            >
              <Popup>
                <div className="text-center">
                  <strong>{f.name}</strong>
                  <br />
                  <span className="text-xs capitalize">{f.industry_type}</span>
                  <br />
                  <span className="text-xs text-gray-500">
                    {f.distance_to_river_m}m from {f.river_name}
                  </span>
                </div>
              </Popup>
            </CircleMarker>
          ))}

        {/* Encroachment Sites — always static (requires dedicated analysis) */}
        {(activeLayer === "all" || activeLayer === "encroachment") &&
          encroachmentData.segments.slice(0, 3).map((seg: any) => (
            <CircleMarker
              key={seg.id}
              center={[seg.lat, seg.lng]}
              radius={10}
              pathOptions={{
                color: getSeverityColor(seg.severity),
                fillColor: getSeverityColor(seg.severity),
                fillOpacity: 0.6,
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-center">
                  <strong>{seg.location}</strong>
                  <br />
                  <span className="text-xs">
                    Shrinkage: {seg.shrinkage_pct}%
                  </span>
                </div>
              </Popup>
            </CircleMarker>
          ))}

        {/* Erosion Corridors — always static */}
        {(activeLayer === "all" || activeLayer === "erosion") &&
          erosionData.corridors.slice(0, 3).map((corridor: any) => (
            <Polyline
              key={corridor.id}
              positions={corridor.coordinates.map((c: number[]) => [c[1], c[0]])}
              pathOptions={{
                color: getRiskColor(corridor.risk_level),
                weight: 4,
                opacity: 0.8,
              }}
            >
              <Popup>
                <div className="text-center">
                  <strong>{corridor.name}</strong>
                  <br />
                  <span className="text-xs">
                    Risk: {corridor.risk_level} · {corridor.retreat_rate_m_year}m/yr
                  </span>
                </div>
              </Popup>
            </Polyline>
          ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] glass-card p-3">
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Moderate</span>
          </div>
          {hasLiveData && (
            <div className="border-t border-white/10 pt-1 mt-1 text-gray-400">
              Data: OpenStreetMap
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
