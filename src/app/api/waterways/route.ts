import { NextRequest, NextResponse } from "next/server";

import { fetchWaterways } from "@/lib/backend-parity";
import { parseRequiredBBox } from "@/lib/route-query";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = parseRequiredBBox(searchParams);

  if ("error" in parsed) {
    return NextResponse.json({ detail: parsed.error }, { status: 400 });
  }

  const { south, west, north, east } = parsed.bbox;
  if (north <= south || east <= west) {
    return NextResponse.json({ detail: "Invalid bounding box" }, { status: 400 });
  }

  const waterways = await fetchWaterways(south, west, north, east);
  return NextResponse.json({
    waterways,
    total: waterways.length,
    source: "OpenStreetMap Overpass API",
  });
}
