import { NextRequest, NextResponse } from "next/server";

import {
  fetchRealFactories,
  loadCachedData,
  type FactoryRecord,
} from "@/lib/backend-parity";
import {
  parseBooleanParam,
  parseIntegerParam,
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
  const hasAnyBBoxParam =
    searchParams.has("south") ||
    searchParams.has("west") ||
    searchParams.has("north") ||
    searchParams.has("east");

  if (hasAnyBBoxParam && [south, west, north, east].some((value) => value == null)) {
    return NextResponse.json(
      { detail: "south, west, north, and east must all be valid numbers" },
      { status: 400 },
    );
  }

  if (south != null && west != null && north != null && east != null) {
    const factories = applyFactoryFilters(
      await fetchRealFactories(south, west, north, east, maxDistance),
      river,
      industry,
    );

    return NextResponse.json({
      factories,
      total: factories.length,
      source: "live_osm",
    });
  }

  if (!refresh) {
    const cached = await loadCachedData<{ factories?: FactoryRecord[] }>(
      "real_factories.json",
    );
    if (cached) {
      const factories = applyFactoryFilters(cached.factories ?? [], river, industry);
      return NextResponse.json({
        factories,
        total: factories.length,
        source: "cached",
      });
    }
  }

  const factories = applyFactoryFilters(
    await fetchRealFactories(undefined, undefined, undefined, undefined, maxDistance),
    river,
    industry,
  );

  return NextResponse.json({
    factories,
    total: factories.length,
    source: "live_osm",
  });
}
