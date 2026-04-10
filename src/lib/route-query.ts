import "server-only";

import type { BBox } from "@/lib/backend-parity";

export function parseNumberParam(value: string | null) {
  if (value == null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseIntegerParam(
  value: string | null,
  fallback: number,
) {
  if (value == null || value === "") {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseBooleanParam(value: string | null) {
  return value === "true";
}

export function parseRequiredBBox(searchParams: URLSearchParams) {
  const south = parseNumberParam(searchParams.get("south"));
  const west = parseNumberParam(searchParams.get("west"));
  const north = parseNumberParam(searchParams.get("north"));
  const east = parseNumberParam(searchParams.get("east"));

  if (
    south == null ||
    west == null ||
    north == null ||
    east == null
  ) {
    return {
      error: "Missing or invalid bbox parameters (south, west, north, east required)",
    } as const;
  }

  return {
    bbox: { south, west, north, east } satisfies BBox,
  } as const;
}

export function parseRequiredLatLng(searchParams: URLSearchParams) {
  const lat = parseNumberParam(searchParams.get("lat"));
  const lng = parseNumberParam(searchParams.get("lng"));

  if (lat == null || lng == null) {
    return {
      error: "Missing or invalid lat/lng parameters",
    } as const;
  }

  return {
    lat,
    lng,
  } as const;
}
