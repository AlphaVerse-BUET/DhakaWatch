import { NextResponse } from "next/server";
import { createWaterTiles, getGeeLastError } from "@/lib/gee-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const tiles = await createWaterTiles();
    if (!tiles) {
      return NextResponse.json(
        { error: getGeeLastError() || "Earth Engine unavailable" },
        { status: 503 },
      );
    }

    return NextResponse.json(tiles);
  } catch (error: any) {
    console.error("Water tile generation failed:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || getGeeLastError() || "Failed to get water tile" },
      { status: 503 },
    );
  }
}
