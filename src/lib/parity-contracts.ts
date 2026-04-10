import "server-only";

import {
  type BBox,
  type DynamicDataResult,
  type SatelliteVerificationResult,
  getCachedFactoriesInBBox,
  getCachedHotspotsInBBox,
  getHardcodedWaterwaysInBBox,
} from "@/lib/backend-parity";

export async function buildGeoCompatPayload(
  bbox: BBox,
  dynamicData: DynamicDataResult,
) {
  const waterways = (
    dynamicData.waterways.length > 0
      ? dynamicData.waterways
      : getHardcodedWaterwaysInBBox(bbox)
  ).slice(0, 120);

  const factories = (
    dynamicData.factories.length > 0
      ? dynamicData.factories
      : await getCachedFactoriesInBBox(bbox)
  ).slice(0, 250);

  const hotspots = (
    dynamicData.hotspots.length > 0
      ? dynamicData.hotspots
      : await getCachedHotspotsInBBox(bbox)
  ).slice(0, 120);

  let source = "OpenStreetMap Overpass API";
  const usedCachedFactories =
    dynamicData.factories.length === 0 && factories.length > 0;
  const usedCachedHotspots =
    dynamicData.hotspots.length === 0 && hotspots.length > 0;

  if (
    dynamicData.waterways.length > 0 &&
    (usedCachedFactories || usedCachedHotspots)
  ) {
    source = "OpenStreetMap waterways + local cached overlays";
  } else if (dynamicData.waterways.length === 0 && dynamicData.factories.length > 0) {
    source = "OpenStreetMap factories + hardcoded rivers";
  } else if (
    dynamicData.waterways.length === 0 &&
    (factories.length > 0 || hotspots.length > 0)
  ) {
    source = "Local cached fallback";
  } else if (waterways.length === 0 && factories.length === 0 && hotspots.length === 0) {
    source = "No data";
  }

  return {
    waterways,
    factories,
    hotspots,
    source,
  };
}

export function buildVerifyCompatPayload(
  result: SatelliteVerificationResult,
) {
  return {
    ...result,
    item_id: result.scene_id,
    status: "ok" as const,
  };
}

export function buildVerifyCompatError(detail: string, status: number) {
  return {
    scene_date: "Unavailable",
    cloud_cover: 0,
    platform: "",
    scene_id: "",
    item_id: "",
    preview_url: null,
    satellite: "",
    source: detail,
    bands_available: [] as string[],
    status: status === 404 ? "not_found" : "unavailable",
    error: detail,
  };
}
