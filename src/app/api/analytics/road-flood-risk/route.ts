import { NextRequest, NextResponse } from "next/server";

import {
  createWaterloggingIntelligence,
  getGeeLastError,
} from "@/lib/gee-server";
import {
  buildRoadFloodRiskRecords,
  normalizeWardSignals,
} from "@/lib/ward-analytics";
import { parseNumberParam } from "@/lib/route-query";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const minRiskRaw = parseNumberParam(searchParams.get("minRisk"));
  const minRisk = Math.max(0, Math.min(1, minRiskRaw ?? 0.55));

  try {
    const floodPayload = await createWaterloggingIntelligence();
    if (!floodPayload) {
      return NextResponse.json(
        { error: getGeeLastError() || "Earth Engine unavailable" },
        { status: 503 },
      );
    }

    const floodWardScores = normalizeWardSignals("flood", floodPayload.wardSignals);
    const roads = buildRoadFloodRiskRecords(floodWardScores).filter(
      (road) => road.floodRisk >= minRisk,
    );

    return NextResponse.json({
      layer: "flood",
      generatedAt: new Date().toISOString(),
      period: floodPayload.summary.period,
      minRisk,
      roads,
      total: roads.length,
    });
  } catch (error: any) {
    console.error("Road flood-risk generation failed:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Road flood-risk generation failed" },
      { status: 503 },
    );
  }
}

