import { NextRequest, NextResponse } from "next/server";

import { fetchWaterways } from "@/lib/backend-parity";
import {
  bboxFromLatLngRadius,
  parseOptionalLatLngRadius,
  parseRequiredBBox,
} from "@/lib/route-query";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hasAnyBBoxParam =
    searchParams.has("south") ||
    searchParams.has("west") ||
    searchParams.has("north") ||
    searchParams.has("east");

  const pointRadius = parseOptionalLatLngRadius(searchParams, 10);

  if (!hasAnyBBoxParam && pointRadius == null) {
    return NextResponse.json(
      {
        detail:
          "Provide either bbox (south, west, north, east) or point-radius (lat, lng, radius in km)",
      },
      { status: 400 },
    );
  }

  if (pointRadius && "error" in pointRadius) {
    return NextResponse.json({ detail: pointRadius.error }, { status: 400 });
  }

  const parsedBBox = hasAnyBBoxParam ? parseRequiredBBox(searchParams) : null;
  if (parsedBBox && "error" in parsedBBox) {
    return NextResponse.json({ detail: parsedBBox.error }, { status: 400 });
  }

  const bbox =
    parsedBBox?.bbox ??
    bboxFromLatLngRadius(pointRadius!.lat, pointRadius!.lng, pointRadius!.radiusKm);
  const { south, west, north, east } = bbox;

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
