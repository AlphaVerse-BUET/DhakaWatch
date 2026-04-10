import { NextRequest, NextResponse } from "next/server";

import {
  clampBangladeshBBox,
  fetchDynamicData,
} from "@/lib/backend-parity";
import { buildGeoCompatPayload } from "@/lib/parity-contracts";
import { parseRequiredBBox } from "@/lib/route-query";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = parseRequiredBBox(searchParams);

  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const bbox = clampBangladeshBBox(parsed.bbox);
  if (bbox.north <= bbox.south || bbox.east <= bbox.west) {
    return NextResponse.json({ error: "Invalid bounding box" }, { status: 400 });
  }

  const dynamicData = await fetchDynamicData(
    bbox.south,
    bbox.west,
    bbox.north,
    bbox.east,
  );

  return NextResponse.json(await buildGeoCompatPayload(bbox, dynamicData));
}
