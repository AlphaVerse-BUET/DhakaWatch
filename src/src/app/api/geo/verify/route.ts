import { NextRequest, NextResponse } from "next/server";

import {
  RouteError,
  verifySatelliteScene,
} from "@/lib/backend-parity";
import {
  buildVerifyCompatError,
  buildVerifyCompatPayload,
} from "@/lib/parity-contracts";
import { parseRequiredLatLng } from "@/lib/route-query";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = parseRequiredLatLng(searchParams);

  if ("error" in parsed) {
    return NextResponse.json(
      buildVerifyCompatError(
        parsed.error ?? "Missing or invalid lat/lng parameters",
        400,
      ),
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(
      buildVerifyCompatPayload(
        await verifySatelliteScene(parsed.lat, parsed.lng),
      ),
    );
  } catch (error) {
    if (error instanceof RouteError) {
      return NextResponse.json(
        buildVerifyCompatError(error.detail, error.status),
        { status: error.status },
      );
    }

    return NextResponse.json(
      buildVerifyCompatError("Satellite verification unavailable", 503),
      { status: 503 },
    );
  }
}
