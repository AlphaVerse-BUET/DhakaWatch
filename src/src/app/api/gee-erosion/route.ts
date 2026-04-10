import { NextResponse } from "next/server";

import {
  getGeeLastError,
  getSarErosionTileUrl,
} from "@/lib/gee-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const tileUrl = await getSarErosionTileUrl();
  if (!tileUrl) {
    const reason = getGeeLastError() ?? "Unknown GEE error";
    return NextResponse.json(
      { detail: `GEE erosion tile generation failed: ${reason}` },
      { status: 503 },
    );
  }

  return NextResponse.json({
    tile_url: tileUrl,
    layer_type: "sar_erosion",
    sensor: "sentinel_1_sar_vv",
    description:
      "SAR backscatter erosion index. Green = stable, yellow = moderate, red = critical erosion.",
    palette: "green -> yellow -> red",
    source: "Sentinel-1 SAR (ESA Copernicus)",
    methodology: "VV polarization median composite with speckle filtering",
  });
}
