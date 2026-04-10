import { NextRequest, NextResponse } from "next/server";

import {
  fetchRealFactories,
  generatePollutionHotspots,
  getCachedFactories,
  loadCachedData,
  type HotspotRecord,
} from "@/lib/backend-parity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const river = searchParams.get("river");
  const severity = searchParams.get("severity");

  const cached = await loadCachedData<{ hotspots?: HotspotRecord[] }>(
    "real_pollution_hotspots.json",
  );
  const cachedFactories = await getCachedFactories();

  let hotspots =
    cached?.hotspots ??
    generatePollutionHotspots(
      cachedFactories.length > 0
        ? cachedFactories
        : await fetchRealFactories(),
    );

  if (river) {
    hotspots = hotspots.filter((hotspot) => hotspot.river_id === river);
  }
  if (severity) {
    hotspots = hotspots.filter((hotspot) => hotspot.severity === severity);
  }

  return NextResponse.json({
    hotspots,
    total: hotspots.length,
  });
}
