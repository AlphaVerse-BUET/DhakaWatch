import { NextRequest, NextResponse } from "next/server";

import {
  fetchRealFactories,
  haversineDistance,
  loadCachedData,
  type FactoryRecord,
} from "@/lib/backend-parity";
import {
  bboxFromLatLngRadius,
  parseBooleanParam,
  parseIntegerParam,
  parseOptionalLatLngRadius,
  parseNumberParam,
} from "@/lib/route-query";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function applyFactoryFilters(
  factories: FactoryRecord[],
  river: string | null,
  industry: string | null,
) {
  return factories.filter((factory) => {
    if (river && factory.nearest_river !== river) {
      return false;
    }
    if (industry && factory.industry_type !== industry) {
      return false;
    }
    return true;
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const south = parseNumberParam(searchParams.get("south"));
  const west = parseNumberParam(searchParams.get("west"));
  const north = parseNumberParam(searchParams.get("north"));
  const east = parseNumberParam(searchParams.get("east"));
  const river = searchParams.get("river");
  const industry = searchParams.get("industry");
  const maxDistance = parseIntegerParam(searchParams.get("max_distance"), 3000);
  const refresh = parseBooleanParam(searchParams.get("refresh"));
  const pointRadius = parseOptionalLatLngRadius(searchParams, 10);
  const hasAnyBBoxParam =
    searchParams.has("south") ||
    searchParams.has("west") ||
    searchParams.has("north") ||
    searchParams.has("east");

  if (pointRadius && "error" in pointRadius) {
    return NextResponse.json({ detail: pointRadius.error }, { status: 400 });
  }

  if (
    hasAnyBBoxParam &&
    [south, west, north, east].some((value) => value == null)
  ) {
    return NextResponse.json(
      { detail: "south, west, north, and east must all be valid numbers" },
      { status: 400 },
    );
  }

  const queryBBox =
    south != null && west != null && north != null && east != null
      ? { south, west, north, east }
      : pointRadius
        ? bboxFromLatLngRadius(
            pointRadius.lat,
            pointRadius.lng,
            pointRadius.radiusKm,
          )
        : null;

  if (queryBBox) {
    const factories = applyFactoryFilters(
      await fetchRealFactories(
        queryBBox.south,
        queryBBox.west,
        queryBBox.north,
        queryBBox.east,
        maxDistance,
      ),
      river,
      industry,
    );

    const filteredFactories = pointRadius
      ? factories.filter(
          (factory) =>
            haversineDistance(
              pointRadius.lat,
              pointRadius.lng,
              factory.lat,
              factory.lng,
            ) <=
            pointRadius.radiusKm * 1000,
        )
      : factories;

    return NextResponse.json({
      factories: filteredFactories,
      total: filteredFactories.length,
      source: "live_osm",
    });
  }

  if (!refresh) {
    const cached = await loadCachedData<{ factories?: FactoryRecord[] }>(
      "real_factories.json",
    );
    if (cached) {
      const factories = applyFactoryFilters(
        cached.factories ?? [],
        river,
        industry,
      );
      return NextResponse.json({
        factories,
        total: factories.length,
        source: "cached",
      });
    }
  }

  const factories = applyFactoryFilters(
    await fetchRealFactories(
      undefined,
      undefined,
      undefined,
      undefined,
      maxDistance,
    ),
    river,
    industry,
  );

  return NextResponse.json({
    factories,
    total: factories.length,
    source: "live_osm",
  });
}
