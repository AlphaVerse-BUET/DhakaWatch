import { NextResponse } from "next/server";
import { createErosionTile, getGeeLastError } from "@/lib/gee-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const tile = await createErosionTile();
    if (!tile) {
      return NextResponse.json(
        { error: getGeeLastError() || "Earth Engine unavailable" },
        { status: 503 },
      );
    }

    return NextResponse.json(tile);
  } catch (error: any) {
    console.error("Erosion tile generation failed:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || getGeeLastError() || "Failed to get erosion tile" },
      { status: 503 },
    );
  }
}
