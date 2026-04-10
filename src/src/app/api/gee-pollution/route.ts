import { NextResponse } from "next/server";

import {
  getGeeLastError,
  getPollutionTileUrl,
} from "@/lib/gee-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const tileUrl = await getPollutionTileUrl();
  if (!tileUrl) {
    const reason = getGeeLastError() ?? "Unknown GEE error";
    return NextResponse.json(
      { detail: `GEE pollution tile generation failed: ${reason}` },
      { status: 503 },
    );
  }

  return NextResponse.json({
    tile_url: tileUrl,
    layer_type: "pollution_indices",
    indices: ["red_blue_ratio"],
    description:
      "Red/Blue spectral ratio for textile dye detection. Higher values = more red (dye).",
    palette: "blue -> purple -> red",
    source: "Sentinel-2 (ESA Copernicus)",
  });
}
