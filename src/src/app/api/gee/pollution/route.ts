import { NextResponse } from "next/server";
import { createPollutionTiles, getGeeLastError } from "@/lib/gee-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const tiles = await createPollutionTiles();
    if (!tiles) {
      return NextResponse.json(
        { error: getGeeLastError() || "Earth Engine unavailable" },
        { status: 503 },
      );
    }

    return NextResponse.json(tiles, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error: any) {
    console.error("Pollution tile generation failed:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || getGeeLastError() || "Failed to get pollution tile" },
      { status: 503 },
    );
  }
}
