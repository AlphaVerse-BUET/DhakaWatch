"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ThermometerSun,
  Loader2,
  Trees,
  ShieldAlert,
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

export default function UhiMonitoringPage() {
  const [layerPayload, setLayerPayload] = useState<UrbanLayerPayload | null>(null);
  const [wardScores, setWardScores] = useState<WardScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [layerRes, scoreRes] = await Promise.all([
          fetch("/api/gee/uhi", { cache: "no-store" }),
          fetch("/api/analytics/ward-scores?layer=uhi", { cache: "no-store" }),
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
            opacity: id === "heat_risk" ? 0.72 : 0.5,
          }))
        : [],
    [layerPayload],
  );

  const topWard = wardScores[0];

  return (
    <div className="min-h-screen animate-fadeIn py-8">
      <div className="container mx-auto px-4 space-y-8">
        <section className="glass-card p-6 lg:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-3 py-1 text-xs text-orange-300">
                <ThermometerSun size={14} />
                Urban Heat Island Monitoring
              </div>
              <h1 className="mt-4 text-3xl lg:text-4xl font-bold text-white">
                Heat Risk Map for Dhaka Wards
              </h1>
              <p className="mt-3 text-slate-300 max-w-2xl">
                Landsat thermal composites identify persistent heat-stress zones
                and rank wards for cooling interventions such as tree planting
                and reflective rooftops.
              </p>
            </div>
            <Link
              href="/green-canopy-index"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10 transition-colors"
            >
              Go to Green Canopy
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Hotspot Ward"
            value={topWard?.wardName ?? "Pending"}
            icon={ShieldAlert}
            color="red"
          />
          <StatsCard
            title="Heat Risk Score"
            value={topWard ? `${(topWard.normalizedScore * 100).toFixed(1)}` : "0"}
            icon={ThermometerSun}
            color="orange"
          />
          <StatsCard
            title="Cooling Priority Wards"
            value={wardScores.filter((ward) => ward.normalizedScore >= 0.62).length}
            icon={Trees}
            color="teal"
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
              Cooling Intervention Queue
            </h2>
            <div className="space-y-3">
              {wardScores.slice(0, 5).map((ward) => (
                <div
                  key={ward.wardId}
                  className="rounded-xl border border-white/10 bg-slate-900/40 p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-white font-medium">{ward.wardName}</div>
                    <div className="text-xs text-slate-300">#{ward.rank}</div>
                  </div>
                  <div className="mt-2 text-xs text-slate-400">
                    Heat score {(ward.normalizedScore * 100).toFixed(1)} ·{" "}
                    <span className="capitalize">{ward.riskLevel}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-4">
              Intervention guidance: prioritize shade trees, cool roof pilots,
              and heat-safe public shelters in top-ranked wards.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
