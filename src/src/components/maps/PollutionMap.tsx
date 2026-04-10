"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  AlertCircle,
  Factory,
  Eye,
  EyeOff,
  Layers,
  Satellite,
  Loader,
  ExternalLink,
} from "lucide-react";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false },
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false },
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

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
import factoriesData from "@/data/factories.json";
import pollutionData from "@/data/pollution-hotspots.json";
import riversData from "@/data/rivers.json";

// GEE Tile Service
import { getPollutionTiles, type PollutionTiles } from "@/lib/gee-tiles";

interface LiveHotspot {
  id: string;
  lat: number;
  lng: number;
  severity: string;
  type: string;
  label: string;
  river: string;
  river_id: string;
  spectral: { ndti: number; cdom: number; red_blue_ratio: number };
  nearby_factories: number;
  top_source: string;
  description: string;
  attributed_factories?: Array<{
    factory_name: string;
    industry_type: string;
    distance_m: number;
    probability: number;
  }>;
}

interface LiveFactory {
  osm_id: number;
  name: string;
  lat: number;
  lng: number;
  industry_type: string;
  pollution_profile: string;
  nearest_river: string;
  river_name: string;
  distance_to_river_m: number;
}

interface LiveWaterway {
  id: string;
  name: string;
  type: string;
  coordinates: [number, number][];
}

interface SatelliteVerification {
  scene_date: string;
  cloud_cover: number;
  platform: string;
  scene_id: string;
  preview_url: string | null;
  satellite: string;
  source: string;
}

interface PollutionMapProps {
  className?: string;
  onHotspotSelect?: (hotspot: any) => void;
  selectedHotspot?: string | null;
}

const getFactoryIcon = (type: string) => {
  const colors: Record<string, string> = {
    textile: "#7b2ff7",
    tannery: "#ef476f",
    industrial: "#ffd166",
    garment: "#06d6a0",
    chemical: "#ff6b6b",
    food: "#4ecdc4",
  };
  return colors[type] || "#118ab2";
};

const getSeverityColor = (severity: number | string): string => {
  const n =
    typeof severity === "number"
      ? severity
      : severity === "critical"
        ? 88
        : severity === "high"
          ? 72
          : severity === "moderate"
            ? 52
            : 30;
  if (n >= 85) return "#ef476f";
  if (n >= 70) return "#ff8c00";
  if (n >= 50) return "#ffd166";
  return "#06d6a0";
};

const severityRadius = (s: string | number): number => {
  const n = typeof s === "number" ? s : s === "critical" ? 88 : s === "high" ? 72 : s === "moderate" ? 52 : 30;
  return Math.max(6, n / 5);
};

export default function PollutionMap({
  className = "",
  onHotspotSelect,
  selectedHotspot,
}: PollutionMapProps) {
  const [mounted, setMounted] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showFactories, setShowFactories] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [showRivers, setShowRivers] = useState(true);
  const [showGEEPollution, setShowGEEPollution] = useState(false);
  const [selectedFactory, setSelectedFactory] = useState<any>(null);
  const [basemap, setBasemap] = useState<"dark" | "satellite">("satellite");
  const [loading, setLoading] = useState(false);
  const [liveWaterways, setLiveWaterways] = useState<LiveWaterway[]>([]);
  const [liveHotspots, setLiveHotspots] = useState<LiveHotspot[]>([]);
  const [liveFactories, setLiveFactories] = useState<LiveFactory[]>([]);
  const [verifying, setVerifying] = useState<string | null>(null); // hotspot id being verified
  const [satResult, setSatResult] = useState<Record<string, SatelliteVerification>>({}); // cache by hotspot id
  const [geeTiles, setGeeTiles] = useState<PollutionTiles | null>(null);
  const [geeLoading, setGeeLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastKeyRef = useRef<string>("");

  // Load GEE tiles on mount
  useEffect(() => {
    setGeeLoading(true);
    getPollutionTiles().then((tiles) => {
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
      setLoading(true);
      try {
        const res = await fetch(
          `/api/geo?south=${S}&west=${W}&north=${N}&east=${E}`
        );
        if (res.ok) {
          const data = await res.json();
          // Always update state — empty arrays are valid (no features in this area)
          // geo/route.ts now returns bbox-filtered static hotspots even on Overpass fallback
          setLiveWaterways(data.waterways || []);
          setLiveHotspots(data.hotspots || []);
          setLiveFactories(data.factories || []);
        }
      } catch {
        // Backend unavailable — show static fallback
      } finally {
        setLoading(false);
      }
    }, 600);
  }, []);

  const handleVerifySatellite = async (hotspot: LiveHotspot) => {
    if (satResult[hotspot.id]) return; // already fetched
    setVerifying(hotspot.id);
    try {
      const res = await fetch(
        `/api/geo/verify?lat=${hotspot.lat}&lng=${hotspot.lng}`
      );
      const data = await res.json();
      setSatResult((prev) => ({ ...prev, [hotspot.id]: data }));
    } catch {
      setSatResult((prev) => ({
        ...prev,
        [hotspot.id]: {
          scene_date: "Unavailable",
          cloud_cover: 0,
          platform: "",
          scene_id: "",
          preview_url: null,
          satellite: "",
          source: "Error fetching satellite data",
        },
      }));
    } finally {
      setVerifying(null);
    }
  };

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

  // hasLive = geo API has responded at least once for current viewport
  const hasApiData = liveHotspots.length > 0 || liveWaterways.length > 0 || liveFactories.length > 0;
  const hasLive = hasApiData; // used for "●live" badge display
  // Hotspots: use API response (which includes bbox-filtered static hotspots); fallback to all static on initial load
  const displayHotspots = liveHotspots.length > 0 ? liveHotspots : (pollutionData.hotspots as any[]);
  // Factories: use live backend data when available; fallback to static
  const displayFactories = liveFactories.length > 0 ? liveFactories : (factoriesData.factories as any[]);

  return (
    <div className={`relative ${className}`}>
      {/* Layer Controls */}
      <div className="absolute top-4 right-4 z-[1000] glass-card p-3 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
          <Layers size={16} />
          <span>Layers</span>
          {loading && <Loader size={12} className="animate-spin text-teal-400 ml-auto" />}
        </div>

        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm transition-colors ${
            showHeatmap ? "bg-red-500/20 text-red-400" : "bg-slate-700/50 text-gray-400"
          }`}
        >
          {showHeatmap ? <Eye size={14} /> : <EyeOff size={14} />}
          Pollution Heatmap
        </button>

        <button
          onClick={() => setShowHotspots(!showHotspots)}
          className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm transition-colors ${
            showHotspots ? "bg-orange-500/20 text-orange-400" : "bg-slate-700/50 text-gray-400"
          }`}
        >
          {showHotspots ? <Eye size={14} /> : <EyeOff size={14} />}
          Hotspots {hasLive && <span className="ml-auto text-xs text-green-400">●live</span>}
        </button>

        <button
          onClick={() => setShowFactories(!showFactories)}
          className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm transition-colors ${
            showFactories ? "bg-purple-500/20 text-purple-400" : "bg-slate-700/50 text-gray-400"
          }`}
        >
          {showFactories ? <Eye size={14} /> : <EyeOff size={14} />}
          Factories {hasLive && <span className="ml-auto text-xs text-green-400">●live</span>}
        </button>

        <button
          onClick={() => setShowRivers(!showRivers)}
          className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm transition-colors ${
            showRivers ? "bg-blue-500/20 text-blue-400" : "bg-slate-700/50 text-gray-400"
          }`}
        >
          {showRivers ? <Eye size={14} /> : <EyeOff size={14} />}
          Rivers {hasLive && <span className="ml-auto text-xs text-green-400">●live</span>}
        </button>

        {/* GEE Pollution Indices Toggle */}
        <button
          onClick={() => setShowGEEPollution(!showGEEPollution)}
          disabled={!geeTiles}
          className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm transition-colors ${
            showGEEPollution && geeTiles
              ? "bg-gradient-to-r from-red-500/20 to-purple-500/20 text-red-400"
              : "bg-slate-700/50 text-gray-400"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={!geeTiles ? "GEE not available" : "Live satellite spectral indices"}
        >
          {showGEEPollution && geeTiles ? <Eye size={14} /> : <EyeOff size={14} />}
          <span>GEE Spectral</span>
          {geeLoading && <Loader size={12} className="animate-spin ml-auto" />}
          {geeTiles && !geeLoading && <span className="ml-auto text-xs text-amber-400">●live</span>}
        </button>

        <div className="border-t border-white/10 pt-2 mt-1">
          <button
            onClick={() => setBasemap(basemap === "dark" ? "satellite" : "dark")}
            className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm transition-colors ${
              basemap === "satellite" ? "bg-blue-500/20 text-blue-400" : "bg-slate-700/50 text-gray-400"
            }`}
          >
            <Satellite size={14} />
            {basemap === "satellite" ? "Satellite" : "Dark Map"}
          </button>
        </div>
      </div>

      {/* Selected Factory Panel */}
      {selectedFactory && (
        <div className="absolute top-4 left-4 z-[1000] glass-card p-4 w-72">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <Factory size={18} className="text-purple-400" />
              <h3 className="font-semibold text-white text-sm truncate max-w-[180px]">
                {selectedFactory.name}
              </h3>
            </div>
            <button
              onClick={() => setSelectedFactory(null)}
              className="text-gray-400 hover:text-white flex-shrink-0"
            >
              ×
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Type:</span>
              <span className={`badge-${
                (selectedFactory.type || selectedFactory.industry_type) === "textile" ? "purple"
                : (selectedFactory.type || selectedFactory.industry_type) === "tannery" ? "red"
                : "yellow"
              }`}>
                {selectedFactory.type || selectedFactory.industry_type || "industrial"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Distance to river:</span>
              <span className="text-white">
                {selectedFactory.distance_m || selectedFactory.distance_to_river_m || 0}m
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">River:</span>
              <span className="text-white text-xs">
                {selectedFactory.river_name || selectedFactory.nearest_river || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Profile:</span>
              <span className="text-white text-xs">
                {selectedFactory.pollution_profile || "Industrial"}
              </span>
            </div>
          </div>
        </div>
      )}

      <MapContainer
        center={[23.75, 90.4]}
        zoom={12}
        className="w-full h-full rounded-xl"
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

        {/* GEE Pollution Spectral Indices Layers */}
        {showGEEPollution && geeTiles && (
          <>
            <TileLayer
              url={geeTiles.redBlueRatio.url}
              attribution="Google Earth Engine | Red/Blue Ratio (Dye Detection)"
              opacity={0.5}
              zIndex={500}
            />
          </>
        )}

        <MapEventListener onBoundsChange={handleBoundsChange} />

        {/* Heatmap — derived from hotspots positions */}
        {showHeatmap &&
          displayHotspots.slice(0, 50).map((h: any, idx: number) => (
            <CircleMarker
              key={`heat-${h.id || idx}`}
              center={[h.lat, h.lng]}
              radius={severityRadius(h.severity) * 3}
              pathOptions={{
                fillColor: getSeverityColor(h.severity),
                fillOpacity: 0.15,
                stroke: false,
              }}
            />
          ))}

        {/* Rivers — static (always) + Overpass live layer when available */}
        {showRivers && riversData.features.map((river: any) => (
          <Polyline
            key={river.properties.id}
            positions={river.geometry.coordinates.map((c: number[]) => [c[1], c[0]])}
            pathOptions={{
              color:
                river.properties.status === "critical" ? "#ef476f"
                : river.properties.status === "severe" ? "#ff8c00"
                : "#118ab2",
              weight: 3,
              opacity: 0.65,
            }}
          >
            <Popup>
              <div className="text-center">
                <strong>{river.properties.name}</strong>
              </div>
            </Popup>
          </Polyline>
        ))}

        {/* Overpass live waterways (additional rivers from current viewport) */}
        {showRivers &&
          liveWaterways.map((w) => (
                <Polyline
                  key={`w-${w.id}`}
                  positions={w.coordinates.map((c) => [c[1], c[0]] as [number, number])}
                  pathOptions={{
                    color: w.type === "river" ? "#118ab2" : "#4ecdc4",
                    weight: w.type === "river" ? 4 : 2,
                    opacity: 0.75,
                  }}
                >
                  <Popup>
                    <div className="text-center">
                      <strong>{w.name}</strong>
                      <br />
                      <span className="text-xs capitalize">{w.type} · OSM live</span>
                    </div>
                  </Popup>
                </Polyline>
              ))}


        {/* Pollution Hotspots */}
        {showHotspots &&
          displayHotspots.map((hotspot: any) => {
            const sat = satResult[hotspot.id];
            const isVerifying = verifying === hotspot.id;
            return (
              <CircleMarker
                key={hotspot.id}
                center={[hotspot.lat, hotspot.lng]}
                radius={severityRadius(hotspot.severity)}
                pathOptions={{
                  color: getSeverityColor(hotspot.severity),
                  fillColor: getSeverityColor(hotspot.severity),
                  fillOpacity: 0.6,
                  weight: 2,
                  className: selectedHotspot === hotspot.id ? "pulse-marker" : "",
                }}
                eventHandlers={{ click: () => onHotspotSelect?.(hotspot) }}
              >
                <Popup maxWidth={280}>
                  <div className="min-w-[200px]">
                    <div className="flex items-center gap-1 mb-1">
                      <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                      <strong className="text-sm">{hotspot.label}</strong>
                    </div>
                    <div className="text-xs text-gray-600 space-y-0.5 mb-2">
                      <p>River: {hotspot.river || hotspot.river_id || "—"}</p>
                      <p>Severity: <strong>{typeof hotspot.severity === "string" ? hotspot.severity.toUpperCase() : `${hotspot.severity}/100`}</strong></p>
                      <p>Nearby facilities: {hotspot.nearby_factories ?? "—"}</p>
                    </div>
                    <div className="text-xs bg-gray-100 p-2 rounded mb-2">
                      <p className="font-semibold mb-0.5">Spectral Indices:</p>
                      <p>NDTI: {hotspot.spectral?.ndti ?? hotspot.spectral?.ndti ?? "—"}</p>
                      <p>Red/Blue: {hotspot.spectral?.red_blue_ratio ?? (hotspot.spectral as any)?.redBlueRatio ?? "—"}</p>
                      <p>CDOM: {hotspot.spectral?.cdom ?? "—"}</p>
                    </div>

                    {/* Satellite Verification */}
                    {!sat && (
                      <button
                        onClick={() => handleVerifySatellite(hotspot)}
                        disabled={isVerifying}
                        className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
                      >
                        {isVerifying ? (
                          <>
                            <Loader size={11} className="animate-spin" />
                            Fetching Sentinel-2...
                          </>
                        ) : (
                          <>
                            <Satellite size={11} />
                            Verify with Satellite
                          </>
                        )}
                      </button>
                    )}
                    {sat && !sat.scene_date?.includes("Unavail") && (
                      <div className="text-xs bg-blue-50 border border-blue-200 rounded p-2 space-y-1">
                        <div className="flex items-center gap-1 font-semibold text-blue-800">
                          <Satellite size={11} />
                          Real Sentinel-2 Scene
                        </div>
                        <p className="text-blue-700">Date: {sat.scene_date}</p>
                        <p className="text-blue-700">Cloud cover: {sat.cloud_cover}%</p>
                        <p className="text-blue-700">Platform: {sat.platform}</p>
                        {sat.preview_url && (
                          <img
                            src={sat.preview_url}
                            alt="Sentinel-2 preview"
                            className="w-full rounded mt-1 border border-blue-200"
                            style={{ maxHeight: 120, objectFit: "cover" }}
                          />
                        )}
                        <p className="text-gray-500 text-xs">{sat.source}</p>
                      </div>
                    )}
                    {sat?.scene_date?.includes("Unavail") && (
                      <p className="text-xs text-red-500 mt-1">Satellite verification unavailable</p>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

        {/* Factories */}
        {showFactories &&
          displayFactories.map((factory: any) => (
            <CircleMarker
              key={factory.id || factory.osm_id}
              center={[factory.lat, factory.lng]}
              radius={7}
              pathOptions={{
                color: getFactoryIcon(factory.type || factory.industry_type),
                fillColor: getFactoryIcon(factory.type || factory.industry_type),
                fillOpacity: 0.8,
                weight: 2,
              }}
              eventHandlers={{ click: () => setSelectedFactory(factory) }}
            >
              <Popup>
                <div className="text-center">
                  <strong>{factory.name}</strong>
                  <br />
                  <span className="text-xs">
                    {factory.type || factory.industry_type}
                    {factory.distance_to_river_m != null && ` · ${factory.distance_to_river_m}m from river`}
                    {factory.attribution != null && ` · ${factory.attribution}% attribution`}
                  </span>
                </div>
              </Popup>
            </CircleMarker>
          ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] glass-card p-3">
        <div className="text-xs font-medium text-gray-300 mb-2">
          Pollution Severity
          {hasLive && (
            <span className="ml-2 text-green-400">● OSM Live Data</span>
          )}
        </div>
        <div className="flex gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-teal-500"></div>
            <span>Low</span>
          </div>
        </div>
      </div>
    </div>
  );
}
