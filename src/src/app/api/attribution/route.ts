import { NextRequest, NextResponse } from "next/server";

import {
  fetchRealFactories,
  getCachedFactories,
  runBayesianAttribution,
} from "@/lib/backend-parity";
import { parseIntegerParam, parseRequiredLatLng } from "@/lib/route-query";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = parseRequiredLatLng(searchParams);
  const pollutionType = searchParams.get("pollution_type") ?? "mixed";
  const radius = parseIntegerParam(searchParams.get("radius"), 2000);

  if ("error" in parsed) {
    return NextResponse.json({ detail: parsed.error }, { status: 400 });
  }

  const cachedFactories = await getCachedFactories();
  const factories =
    cachedFactories.length > 0 ? cachedFactories : await fetchRealFactories();
  const results = runBayesianAttribution(
    parsed.lat,
    parsed.lng,
    pollutionType,
    factories,
    radius,
  );

  return NextResponse.json({
    hotspot: {
      lat: parsed.lat,
      lng: parsed.lng,
      type: pollutionType,
    },
    attributed_factories: results,
    methodology:
      "Bayesian spatial probability: P(factory|pollution) is proportional to P(spectral_match|industry_type) x P(proximity)",
    disclaimer:
      "Spatial heuristic ranking indicates cluster-level probability, not definitive source identification.",
  });
}
