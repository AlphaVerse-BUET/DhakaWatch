"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CloudRain,
  Loader2,
  Route,
  TriangleAlert,
  ArrowRight,
} from "lucide-react";

import StatsCard from "@/components/StatsCard";
import UrbanIntelligenceMap from "@/components/maps/UrbanIntelligenceMap";
import type { UrbanLayerPayload } from "@/lib/gee-tiles";

type WardScore = {
  wardId: string;
  wardName: string;
  normalizedScore: number;
  rank: number;
  riskLevel: "critical" | "high" | "moderate" | "low";
};

type RoadRisk = {
  roadId: string;
  roadName: string;
  wardName: string;
  floodRisk: number;
  passability: "impassable" | "slow" | "watch" | "open";
  expectedWaterDepthCm: number;
};

export default function WaterloggingWatchPage() {
  const [layerPayload, setLayerPayload] = useState<UrbanLayerPayload | null>(null);
  const [wardScores, setWardScores] = useState<WardScore[]>([]);
  const [roadRisks, setRoadRisks] = useState<RoadRisk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [layerRes, scoreRes, roadRes] = await Promise.all([
          fetch("/api/gee/waterlogging", { cache: "no-store" }),
          fetch("/api/analytics/ward-scores?layer=flood", { cache: "no-store" }),
          fetch("/api/analytics/road-flood-risk?minRisk=0.45", {
            cache: "no-store",
          }),
        ]);

        if (!cancelled && layerRes.ok) {
          setLayerPayload((await layerRes.json()) as UrbanLayerPayload);
        }
        if (!cancelled && scoreRes.ok) {
          const payload = (await scoreRes.json()) as { wards?: WardScore[] };
          setWardScores(payload.wards ?? []);
        }
        if (!cancelled && roadRes.ok) {
          const payload = (await roadRes.json()) as { roads?: RoadRisk[] };
          setRoadRisks(payload.roads ?? []);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const mapLayers = useMemo(
    () =>
      layerPayload
        ? Object.entries(layerPayload.tiles).map(([id, tile]) => ({
            id,
            label: id.replaceAll("_", " ").toUpperCase(),
            url: tile.url,
            opacity: id === "waterlogging_risk" ? 0.74 : 0.52,
          }))
        : [],
    [layerPayload],
  );

  const topRoad = roadRisks[0];

  return (
    <div className="min-h-screen animate-fadeIn py-8">
      <div className="container mx-auto px-4 space-y-8">
        <section className="glass-card p-6 lg:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                <CloudRain size={14} />
                Urban Flood & Waterlogging Watch
              </div>
              <h1 className="mt-4 text-3xl lg:text-4xl font-bold text-white">
                Sink Susceptibility + Monsoon Water Evidence
              </h1>
              <p className="mt-3 text-slate-300 max-w-2xl">
                Terrain sinks from AW3D30 are cross-checked with Sentinel-1
                monsoon accumulation to prioritize flood-prone wards and
                identify likely impassable road corridors.
              </p>
            </div>
            <Link
              href="/air-quality-watch"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10 transition-colors"
            >
              Go to Air Quality
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Highest Risk Ward"
            value={wardScores[0]?.wardName ?? "Pending"}
            icon={TriangleAlert}
            color="red"
          />
          <StatsCard
            title="Roads on Watchlist"
            value={roadRisks.length}
            icon={Route}
            color="orange"
          />
          <StatsCard
            title="Top Corridor Depth"
            value={topRoad ? `${topRoad.expectedWaterDepthCm} cm` : "0 cm"}
            icon={CloudRain}
            color="blue"
          />
        </div>

        <section className="grid lg:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)] gap-6">
          <div className="h-[560px] rounded-2xl overflow-hidden border border-white/10">
            {loading ? (
              <div className="h-full flex items-center justify-center bg-slate-900/40">
                <Loader2 size={22} className="animate-spin text-teal-300" />
              </div>
            ) : (
              <UrbanIntelligenceMap
                className="w-full h-full"
                tileLayers={mapLayers}
                wardScores={wardScores}
              />
            )}
          </div>

          <div className="glass-card p-5">
            <h2 className="text-lg font-semibold text-white mb-4">
              Road Passability Forecast
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {roadRisks.map((road) => (
                <div
                  key={road.roadId}
                  className="rounded-xl border border-white/10 bg-slate-900/40 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-white font-medium">{road.roadName}</div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded capitalize ${
                        road.passability === "impassable"
                          ? "bg-red-500/20 text-red-300"
                          : road.passability === "slow"
                            ? "bg-orange-500/20 text-orange-300"
                            : road.passability === "watch"
                              ? "bg-yellow-500/20 text-yellow-300"
                              : "bg-green-500/20 text-green-300"
                      }`}
                    >
                      {road.passability}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-400">
                    {road.wardName} · Flood risk {(road.floodRisk * 100).toFixed(1)}
                    {" · "}Expected depth {road.expectedWaterDepthCm} cm
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

