import { NextRequest, NextResponse } from "next/server";

import {
  RouteError,
  verifySatelliteScene,
} from "@/lib/backend-parity";
import { parseRequiredLatLng } from "@/lib/route-query";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = parseRequiredLatLng(searchParams);

  if ("error" in parsed) {
    return NextResponse.json({ detail: parsed.error }, { status: 400 });
  }

  try {
    return NextResponse.json(
      await verifySatelliteScene(parsed.lat, parsed.lng),
    );
  } catch (error) {
    if (error instanceof RouteError) {
      return NextResponse.json({ detail: error.detail }, { status: error.status });
    }

    return NextResponse.json(
      { detail: "Satellite lookup failed" },
      { status: 500 },
    );
  }
}
