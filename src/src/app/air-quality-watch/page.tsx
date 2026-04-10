"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Wind,
  Loader2,
  Car,
  AlertCircle,
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

export default function AirQualityWatchPage() {
  const [layerPayload, setLayerPayload] = useState<UrbanLayerPayload | null>(null);
  const [wardScores, setWardScores] = useState<WardScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [layerRes, scoreRes] = await Promise.all([
          fetch("/api/gee/air-quality", { cache: "no-store" }),
          fetch("/api/analytics/ward-scores?layer=air", { cache: "no-store" }),
        ]);

        if (!cancelled && layerRes.ok) {
          setLayerPayload((await layerRes.json()) as UrbanLayerPayload);
        }
        if (!cancelled && scoreRes.ok) {
          const payload = (await scoreRes.json()) as { wards?: WardScore[] };
          setWardScores(payload.wards ?? []);
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
            opacity: id === "burden_index" ? 0.74 : 0.5,
          }))
        : [],
    [layerPayload],
  );

  const highestBurden = wardScores[0];

  return (
    <div className="min-h-screen animate-fadeIn py-8">
      <div className="container mx-auto px-4 space-y-8">
        <section className="glass-card p-6 lg:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs text-sky-300">
                <Wind size={14} />
                Air Quality & Invisible Pollutants
              </div>
              <h1 className="mt-4 text-3xl lg:text-4xl font-bold text-white">
                NO2, SO2, CO Burden by Ward
              </h1>
              <p className="mt-3 text-slate-300 max-w-2xl">
                Sentinel-5P layers show strategic pollution burden patterns
                across Dhaka, helping target mobility interventions and
                low-emission policy zones.
              </p>
            </div>
            <Link
              href="/waterlogging-watch"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10 transition-colors"
            >
              Back to Flood Watch
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Highest Burden Ward"
            value={highestBurden?.wardName ?? "Pending"}
            icon={AlertCircle}
            color="red"
          />
          <StatsCard
            title="High Burden Wards"
            value={wardScores.filter((ward) => ward.normalizedScore >= 0.62).length}
            icon={Wind}
            color="blue"
          />
          <StatsCard title="Traffic Correlation Proxy" value="Active" icon={Car} color="yellow" />
        </div>

        <section className="grid lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] gap-6">
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
            <h2 className="text-lg font-semibold text-white mb-4">Burden Ranking</h2>
            <div className="space-y-3">
              {wardScores.slice(0, 6).map((ward) => (
                <div
                  key={ward.wardId}
                  className="rounded-xl border border-white/10 bg-slate-900/40 p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-white font-medium">{ward.wardName}</div>
                    <div className="text-xs text-slate-300">#{ward.rank}</div>
                  </div>
                  <div className="mt-2 text-xs text-slate-400 capitalize">
                    Burden {(ward.normalizedScore * 100).toFixed(1)} · {ward.riskLevel}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-orange-300">
              Resolution caution: Sentinel-5P values are coarse and should be
              interpreted at strategic ward scale, not street scale.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

