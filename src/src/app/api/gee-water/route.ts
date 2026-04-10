import { NextRequest, NextResponse } from "next/server";

import {
  getGeeLastError,
  getWaterSegmentationTileUrl,
} from "@/lib/gee-server";
import { parseIntegerParam } from "@/lib/route-query";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year = parseIntegerParam(searchParams.get("year"), 2026);

  if (year < 2016 || year > 2026) {
    return NextResponse.json(
      { detail: "year must be between 2016 and 2026" },
      { status: 400 },
    );
  }

  const tileUrl = await getWaterSegmentationTileUrl(year);
  if (!tileUrl) {
    const reason = getGeeLastError() ?? "Unknown GEE error";
    return NextResponse.json(
      { detail: `GEE water tile generation failed: ${reason}` },
      { status: 503 },
    );
  }

  return NextResponse.json({
    tile_url: tileUrl,
    layer_type: "water_segmentation",
    index: "mndwi",
    year,
    description:
      "MNDWI water mask (normalized difference water index). Transparent background; 2016=blue, 2026=red.",
    palette: "transparent background + year color",
    source: "Sentinel-2 (ESA Copernicus)",
    date_range: `${year - 1}-11-01 to ${year}-03-31 (dry season)`,
  });
}
