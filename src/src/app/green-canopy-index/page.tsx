"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Trees,
  Loader2,
  Leaf,
  ShieldCheck,
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

export default function GreenCanopyIndexPage() {
  const [layerPayload, setLayerPayload] = useState<UrbanLayerPayload | null>(null);
  const [wardScores, setWardScores] = useState<WardScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [layerRes, scoreRes] = await Promise.all([
          fetch("/api/gee/green-canopy", { cache: "no-store" }),
          fetch("/api/analytics/ward-scores?layer=green", { cache: "no-store" }),
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
            opacity: id === "ndvi_change" ? 0.7 : 0.52,
          }))
        : [],
    [layerPayload],
  );

  const bestGreenWard = [...wardScores].reverse()[0];

  return (
    <div className="min-h-screen animate-fadeIn py-8">
      <div className="container mx-auto px-4 space-y-8">
        <section className="glass-card p-6 lg:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-green-500/10 px-3 py-1 text-xs text-green-300">
                <Trees size={14} />
                Green Space & Tree Canopy Index
              </div>
              <h1 className="mt-4 text-3xl lg:text-4xl font-bold text-white">
                Five-Year NDVI Green Score by Ward
              </h1>
              <p className="mt-3 text-slate-300 max-w-2xl">
                Sentinel-2 NDVI tracks canopy condition and change, giving each
                ward a strategic green score for urban greening decisions.
              </p>
            </div>
            <Link
              href="/uhi-monitoring"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10 transition-colors"
            >
              Back to UHI
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Top Green Ward"
            value={bestGreenWard?.wardName ?? "Pending"}
            icon={ShieldCheck}
            color="teal"
          />
          <StatsCard
            title="Low Green Priority Wards"
            value={wardScores.filter((ward) => ward.normalizedScore >= 0.62).length}
            icon={Leaf}
            color="yellow"
          />
          <StatsCard
            title="Ward Coverage"
            value={wardScores.length}
            icon={Trees}
            color="blue"
          />
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
            <h2 className="text-lg font-semibold text-white mb-4">
              Greening Action Queue
            </h2>
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
                    Priority {(ward.normalizedScore * 100).toFixed(1)} · {ward.riskLevel}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-400">
              Greening policy: focus pocket parks, school-corridor trees, and
              rooftop greening in high-priority wards.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
