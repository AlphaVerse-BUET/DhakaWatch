import "server-only";

import type { BBox } from "@/lib/backend-parity";

type LatLngRadius = {
  lat: number;
  lng: number;
  radiusKm: number;
};

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

export function bboxFromLatLngRadius(
  lat: number,
  lng: number,
  radiusKm: number,
): BBox {
  const boundedRadiusKm = Math.min(Math.max(radiusKm, 0.1), 50);
  const latDelta = boundedRadiusKm / 111.32;
  const cosLat = Math.cos((lat * Math.PI) / 180);
  const safeCosLat = Math.max(Math.abs(cosLat), 0.01);
  const lngDelta = boundedRadiusKm / (111.32 * safeCosLat);

  return {
    south: lat - latDelta,
    west: lng - lngDelta,
    north: lat + latDelta,
    east: lng + lngDelta,
  };
}

export function parseOptionalLatLngRadius(
  searchParams: URLSearchParams,
  defaultRadiusKm: number,
) {
  const latRaw = searchParams.get("lat");
  const lngRaw = searchParams.get("lng");
  const radiusRaw = searchParams.get("radius");

  const hasAnyPointParam =
    searchParams.has("lat") ||
    searchParams.has("lng") ||
    searchParams.has("radius");

  if (!hasAnyPointParam) {
    return null;
  }

  const lat = parseNumberParam(latRaw);
  const lng = parseNumberParam(lngRaw);
  const radiusValue = parseNumberParam(radiusRaw);
  const radiusKm = radiusValue == null ? defaultRadiusKm : radiusValue;

  if (lat == null || lng == null) {
    return {
      error: "lat and lng must be valid numbers when using point-radius queries",
    } as const;
  }

  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return {
      error: "lat/lng out of valid range",
    } as const;
  }

  if (!Number.isFinite(radiusKm) || radiusKm <= 0) {
    return {
      error: "radius must be a positive number in kilometers",
    } as const;
  }

  return {
    lat,
    lng,
    radiusKm,
  } satisfies LatLngRadius;
}
