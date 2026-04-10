import { NextRequest, NextResponse } from "next/server";

import {
  fetchRealFactories,
  getCachedFactories,
  runBayesianAttribution,
} from "@/lib/backend-parity";
import {
  parseIntegerParam,
  parseNumberParam,
  parseRequiredLatLng,
} from "@/lib/route-query";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = parseRequiredLatLng(searchParams);
  const pollutionType = searchParams.get("pollution_type") ?? "mixed";
  const radiusKm = parseNumberParam(searchParams.get("radius_km"));
  const radiusMetersRaw =
    radiusKm == null
      ? parseIntegerParam(searchParams.get("radius"), 2000)
      : Math.round(radiusKm * 1000);

  if ("error" in parsed) {
    return NextResponse.json({ detail: parsed.error }, { status: 400 });
  }

  if (!Number.isFinite(radiusMetersRaw) || radiusMetersRaw <= 0) {
    return NextResponse.json(
      { detail: "radius must be a positive number (meters or radius_km)" },
      { status: 400 },
    );
  }

  const radiusMeters = Math.min(Math.max(radiusMetersRaw, 100), 50_000);

  const cachedFactories = await getCachedFactories();
  const factories =
    cachedFactories.length > 0 ? cachedFactories : await fetchRealFactories();
  const results = runBayesianAttribution(
    parsed.lat,
    parsed.lng,
    pollutionType,
    factories,
    radiusMeters,
  );

  return NextResponse.json({
    hotspot: {
      lat: parsed.lat,
      lng: parsed.lng,
      type: pollutionType,
      radius_m: radiusMeters,
    },
    attributed_factories: results,
    methodology:
      "Bayesian spatial probability: P(factory|pollution) is proportional to P(spectral_match|industry_type) x P(proximity)",
    disclaimer:
      "Spatial heuristic ranking indicates cluster-level probability, not definitive source identification.",
  });
}
