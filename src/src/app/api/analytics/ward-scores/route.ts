import { NextRequest, NextResponse } from "next/server";

import {
  createAirQualityIntelligence,
  createGreenCanopyIntelligence,
  createUhiIntelligence,
  createWaterloggingIntelligence,
  getGeeLastError,
} from "@/lib/gee-server";
import {
  type AnalyticsLayer,
  normalizeWardSignals,
} from "@/lib/ward-analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type LayerQuery = "uhi" | "flood" | "air" | "green";

function parseLayer(raw: string | null): LayerQuery | null {
  if (raw === "uhi" || raw === "flood" || raw === "air" || raw === "green") {
    return raw;
  }
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const layerQuery = parseLayer(searchParams.get("layer"));
  const periodOverride = searchParams.get("period");

  if (!layerQuery) {
    return NextResponse.json(
      { error: "layer must be one of: uhi, flood, air, green" },
      { status: 400 },
    );
  }

  try {
    const sourcePayload =
      layerQuery === "uhi"
        ? await createUhiIntelligence()
        : layerQuery === "flood"
          ? await createWaterloggingIntelligence()
          : layerQuery === "air"
            ? await createAirQualityIntelligence()
            : await createGreenCanopyIntelligence();

    if (!sourcePayload) {
      return NextResponse.json(
        { error: getGeeLastError() || "Earth Engine unavailable" },
        { status: 503 },
      );
    }

    const normalized = normalizeWardSignals(
      layerQuery as AnalyticsLayer,
      sourcePayload.wardSignals,
    );

    return NextResponse.json({
      layer: layerQuery,
      period: periodOverride || sourcePayload.summary.period,
      generatedAt: new Date().toISOString(),
      summary: sourcePayload.summary,
      wards: normalized,
      topPriorities: normalized.slice(0, 3),
    });
  } catch (error: any) {
    console.error("Ward analytics failed:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Ward analytics failed" },
      { status: 503 },
    );
  }
}

