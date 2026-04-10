import { NextResponse } from "next/server";

import {
  createGreenCanopyIntelligence,
  getGeeLastError,
} from "@/lib/gee-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const payload = await createGreenCanopyIntelligence();
    if (!payload) {
      return NextResponse.json(
        { error: getGeeLastError() || "Earth Engine unavailable" },
        { status: 503 },
      );
    }

    return NextResponse.json({
      tiles: payload.tiles,
      summary: payload.summary,
      scoresRef: {
        endpoint: `/api/analytics/ward-scores?layer=green&period=${encodeURIComponent(payload.summary.period)}`,
      },
      wardSignals: payload.wardSignals,
    });
  } catch (error: any) {
    console.error(
      "Green-canopy intelligence generation failed:",
      error?.message || error,
    );
    return NextResponse.json(
      {
        error:
          error?.message ||
          getGeeLastError() ||
          "Failed to get green-canopy tiles",
      },
      { status: 503 },
    );
  }
}

