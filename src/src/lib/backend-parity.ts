import "server-only";

import fs from "fs/promises";
import path from "path";

import { PythonRandom } from "@/lib/python-random";

export const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
export const CACHE_TTL_MS = 300_000;
export const DHAKA_BBOX = {
  south: 23.65,
  west: 90.3,
  north: 23.9,
  east: 90.55,
} as const;
export const BANGLADESH_BOUNDS = {
  south: 20.5,
  west: 88.0,
  north: 26.8,
  east: 92.8,
} as const;

type IndustryProfile = {
  ndti_weight: number;
  cdom_weight: number;
  rb_weight: number;
  label: string;
};

export type BBox = {
  south: number;
  west: number;
  north: number;
  east: number;
};

export type RiverDefinition = {
  name: string;
  coords: [number, number][];
};

export type RiversMap = Record<string, RiverDefinition>;

export type WaterwayRecord = {
  id: string;
  name: string;
  type: string;
  coordinates: [number, number][];
};

export type FactoryRecord = {
  osm_id: number;
  osm_type: string;
  name: string;
  lat: number;
  lng: number;
  industry_type: string;
  pollution_profile: string;
  nearest_river: string;
  river_name: string;
  distance_to_river_m: number;
  tags: {
    building: string;
    landuse: string;
    industrial: string;
    name: string;
    operator: string;
  };
};

export type AttributionRecord = {
  factory_name: string;
  osm_id: number;
  industry_type: string;
  pollution_profile: string;
  distance_m: number;
  lat: number;
  lng: number;
  spectral_match: number;
  distance_score: number;
  probability: number;
};

export type HotspotRecord = {
  id: string;
  lat: number;
  lng: number;
  severity: "critical" | "high" | "moderate" | "low";
  type: "high_organic" | "high_dye" | "mixed";
  label: string;
  river: string;
  river_id: string;
  detected: string;
  spectral: {
    ndti: number;
    cdom: number;
    red_blue_ratio: number;
  };
  nearby_factories: number;
  top_source: string;
  description: string;
  attributed_factories: AttributionRecord[];
};

export type DynamicDataResult = {
  waterways: WaterwayRecord[];
  factories: FactoryRecord[];
  hotspots: HotspotRecord[];
};

export type SatelliteVerificationResult = {
  scene_date: string;
  cloud_cover: number;
  platform: string;
  scene_id: string;
  preview_url: string | null;
  satellite: string;
  source: string;
  bands_available: string[];
};

type OverpassGeometryPoint = {
  lat: number;
  lon: number;
};

type OverpassElement = {
  type: string;
  id: number;
  tags?: Record<string, string>;
  geometry?: OverpassGeometryPoint[];
  center?: OverpassGeometryPoint;
  lat?: number;
  lon?: number;
};

type OverpassResponse = {
  elements?: OverpassElement[];
};

type JsonEnvelope<T> = {
  data: T;
  mtimeMs: number;
};

type StacFeature = {
  id: string;
  assets?: Record<string, { href?: string }>;
  properties?: {
    datetime?: string;
    start_datetime?: string;
    platform?: string;
    constellation?: string;
    "eo:cloud_cover"?: number;
  };
};

export class RouteError extends Error {
  readonly status: number;
  readonly detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
    this.name = "RouteError";
  }
}

export const RIVERS: RiversMap = {
  buriganga: {
    name: "Buriganga River",
    coords: [
      [90.365, 23.71],
      [90.37, 23.708],
      [90.376, 23.705],
      [90.382, 23.702],
      [90.388, 23.699],
      [90.395, 23.696],
      [90.402, 23.694],
      [90.41, 23.692],
      [90.418, 23.69],
      [90.425, 23.688],
    ],
  },
  turag: {
    name: "Turag River",
    coords: [
      [90.34, 23.89],
      [90.345, 23.88],
      [90.35, 23.87],
      [90.353, 23.86],
      [90.355, 23.85],
      [90.357, 23.84],
      [90.36, 23.83],
      [90.362, 23.82],
    ],
  },
  shitalakshya: {
    name: "Shitalakshya River",
    coords: [
      [90.51, 23.82],
      [90.515, 23.81],
      [90.518, 23.8],
      [90.52, 23.79],
      [90.522, 23.78],
      [90.525, 23.77],
    ],
  },
  balu: {
    name: "Balu River",
    coords: [
      [90.47, 23.81],
      [90.472, 23.8],
      [90.474, 23.79],
      [90.475, 23.78],
      [90.476, 23.77],
      [90.478, 23.76],
    ],
  },
  dhaleshwari: {
    name: "Dhaleshwari River",
    coords: [
      [90.28, 23.72],
      [90.29, 23.715],
      [90.3, 23.71],
      [90.31, 23.706],
      [90.32, 23.703],
      [90.33, 23.701],
    ],
  },
};

export const INDUSTRY_POLLUTION_PROFILE: Record<string, IndustryProfile> = {
  textile: {
    ndti_weight: 0.6,
    cdom_weight: 0.3,
    rb_weight: 0.9,
    label: "High-Dye Industrial",
  },
  tannery: {
    ndti_weight: 0.9,
    cdom_weight: 0.9,
    rb_weight: 0.4,
    label: "High-Organic Industrial",
  },
  dyeing: {
    ndti_weight: 0.5,
    cdom_weight: 0.4,
    rb_weight: 0.95,
    label: "Dye Effluent",
  },
  garment: {
    ndti_weight: 0.4,
    cdom_weight: 0.3,
    rb_weight: 0.7,
    label: "Mixed Industrial",
  },
  chemical: {
    ndti_weight: 0.7,
    cdom_weight: 0.5,
    rb_weight: 0.3,
    label: "Chemical Discharge",
  },
  pharmaceutical: {
    ndti_weight: 0.5,
    cdom_weight: 0.6,
    rb_weight: 0.2,
    label: "Pharmaceutical Waste",
  },
  food: {
    ndti_weight: 0.6,
    cdom_weight: 0.8,
    rb_weight: 0.2,
    label: "Organic Waste",
  },
  paper: {
    ndti_weight: 0.7,
    cdom_weight: 0.7,
    rb_weight: 0.3,
    label: "Pulp & Organic",
  },
  unknown: {
    ndti_weight: 0.5,
    cdom_weight: 0.5,
    rb_weight: 0.5,
    label: "Unclassified Industrial",
  },
};

const bboxCache = new Map<string, { ts: number; data: DynamicDataResult }>();
const jsonCache = new Map<string, JsonEnvelope<unknown>>();

function roundHalfToEven(value: number) {
  const whole = Math.trunc(value);
  const fraction = Math.abs(value - whole);
  const epsilon = 1e-10;

  if (fraction > 0.5 + epsilon) {
    return value >= 0 ? whole + 1 : whole - 1;
  }

  if (fraction < 0.5 - epsilon) {
    return whole;
  }

  return whole % 2 === 0 ? whole : value >= 0 ? whole + 1 : whole - 1;
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function parityDataCandidates(filename: string) {
  return [
    path.resolve(process.cwd(), "data", filename),
    path.resolve(process.cwd(), "prototype", "data", filename),
  ];
}

async function resolveBackendDataPath(filename: string) {
  for (const candidate of parityDataCandidates(filename)) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      continue;
    }
  }

  return null;
}

async function postOverpassQuery(query: string, timeoutMs: number) {
  try {
    const response = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      body: new URLSearchParams({ data: query }),
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as OverpassResponse;
  } catch {
    return null;
  }
}

function countBy(values: string[]) {
  return values.reduce<Record<string, number>>((accumulator, value) => {
    if (!value) {
      return accumulator;
    }
    accumulator[value] = (accumulator[value] ?? 0) + 1;
    return accumulator;
  }, {});
}

function sortFactoriesByDistance(factories: FactoryRecord[]) {
  return [...factories].sort(
    (left, right) => left.distance_to_river_m - right.distance_to_river_m,
  );
}

export function severityRank(severity: string) {
  switch (severity) {
    case "critical":
      return 4;
    case "high":
      return 3;
    case "moderate":
      return 2;
    default:
      return 1;
  }
}

export async function loadCachedData<T>(filename: string): Promise<T | null> {
  const filePath = await resolveBackendDataPath(filename);
  if (!filePath) {
    return null;
  }

  try {
    const stats = await fs.stat(filePath);
    const cached = jsonCache.get(filePath);
    if (cached && cached.mtimeMs === stats.mtimeMs) {
      return cached.data as T;
    }

    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw) as T;
    jsonCache.set(filePath, { data: parsed, mtimeMs: stats.mtimeMs });
    return parsed;
  } catch {
    return null;
  }
}

export async function getCachedFactories() {
  const cached = await loadCachedData<{ factories?: FactoryRecord[] }>(
    "real_factories.json",
  );
  return Array.isArray(cached?.factories) ? cached.factories : [];
}

export async function getCachedHotspots() {
  const cached = await loadCachedData<{ hotspots?: HotspotRecord[] }>(
    "real_pollution_hotspots.json",
  );
  return Array.isArray(cached?.hotspots) ? cached.hotspots : [];
}

export function clampBangladeshBBox(bbox: BBox): BBox {
  return {
    south: Math.max(BANGLADESH_BOUNDS.south, Math.min(bbox.south, BANGLADESH_BOUNDS.north)),
    west: Math.max(BANGLADESH_BOUNDS.west, Math.min(bbox.west, BANGLADESH_BOUNDS.east)),
    north: Math.max(BANGLADESH_BOUNDS.south, Math.min(bbox.north, BANGLADESH_BOUNDS.north)),
    east: Math.max(BANGLADESH_BOUNDS.west, Math.min(bbox.east, BANGLADESH_BOUNDS.east)),
  };
}

export function makeCacheKey(
  south: number,
  west: number,
  north: number,
  east: number,
) {
  const resolution = 0.05;
  const roundedSouth = roundHalfToEven(south / resolution) * resolution;
  const roundedWest = roundHalfToEven(west / resolution) * resolution;
  const roundedNorth = roundHalfToEven(north / resolution) * resolution;
  const roundedEast = roundHalfToEven(east / resolution) * resolution;

  return `${roundedSouth.toFixed(2)},${roundedWest.toFixed(2)},${roundedNorth.toFixed(2)},${roundedEast.toFixed(2)}`;
}

export function sampleCoords(
  coords: [number, number][],
  maxPoints = 20,
): [number, number][] {
  if (coords.length <= maxPoints) {
    return coords;
  }

  const step = Math.max(1, Math.floor(coords.length / maxPoints));
  return coords.filter((_, index) => index % step === 0);
}

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const earthRadiusM = 6_371_000;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dPhi = ((lat2 - lat1) * Math.PI) / 180;
  const dLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2;

  return earthRadiusM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function distanceToRiver(
  lat: number,
  lon: number,
  riverId: string,
  riversDict: RiversMap = RIVERS,
) {
  const river = riversDict[riverId];
  if (!river) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.min(
    ...river.coords.map(([riverLng, riverLat]) =>
      haversineDistance(lat, lon, riverLat, riverLng),
    ),
  );
}

export function nearestRiver(
  lat: number,
  lon: number,
  riversDict: RiversMap = RIVERS,
): [string | null, number] {
  let bestRiverId: string | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const [riverId, river] of Object.entries(riversDict)) {
    const distance = Math.min(
      ...river.coords.map(([riverLng, riverLat]) =>
        haversineDistance(lat, lon, riverLat, riverLng),
      ),
    );

    if (distance < bestDistance) {
      bestDistance = distance;
      bestRiverId = riverId;
    }
  }

  return [bestRiverId, bestDistance];
}

export function classifyIndustry(tags: Record<string, string>) {
  const name = `${tags.name ?? ""} ${tags.operator ?? ""}`.toLowerCase();
  const industrial = (tags.industrial ?? "").toLowerCase();
  const craft = (tags.craft ?? "").toLowerCase();

  if (["tannery", "leather", "tanning"].some((keyword) => name.includes(keyword))) {
    return "tannery";
  }
  if (
    ["textile", "spinning", "weaving", "knit"].some((keyword) =>
      name.includes(keyword),
    )
  ) {
    return "textile";
  }
  if (["dye", "dyeing", "dying", "color", "wash"].some((keyword) => name.includes(keyword))) {
    return "dyeing";
  }
  if (
    ["garment", "apparel", "clothing", "fashion", "rmg"].some((keyword) =>
      name.includes(keyword),
    )
  ) {
    return "garment";
  }
  if (["chemical", "chem"].some((keyword) => name.includes(keyword))) {
    return "chemical";
  }
  if (["pharma", "medicine", "drug"].some((keyword) => name.includes(keyword))) {
    return "pharmaceutical";
  }
  if (["food", "rice", "flour", "oil", "beverage"].some((keyword) => name.includes(keyword))) {
    return "food";
  }
  if (["paper", "pulp", "jute"].some((keyword) => name.includes(keyword))) {
    return "paper";
  }
  if (industrial === "tannery") {
    return "tannery";
  }
  if (craft === "textile" || craft === "dyer") {
    return "textile";
  }
  return "unknown";
}

export async function fetchWaterways(
  south: number,
  west: number,
  north: number,
  east: number,
): Promise<WaterwayRecord[]> {
  const bbox = `${south},${west},${north},${east}`;
  const query = `
    [out:json][timeout:30];
    (
      way["waterway"~"river|canal"]["name"](${bbox});
    );
    out geom 150;
    `;

  const data = await postOverpassQuery(query, 60_000);
  if (!data) {
    return [];
  }

  const waterways: WaterwayRecord[] = [];
  const seenKeys = new Set<string>();

  for (const element of data.elements ?? []) {
    if (element.type !== "way") {
      continue;
    }

    const tags = element.tags ?? {};
    const name = tags.name ?? tags["name:en"] ?? "";
    if (!name) {
      continue;
    }

    const geometry = element.geometry ?? [];
    if (geometry.length < 2) {
      continue;
    }

    const fullCoords = geometry.map(
      (point) => [point.lon, point.lat] as [number, number],
    );
    const [startLng, startLat] = fullCoords[0] ?? [0, 0];
    const dedupKey = `${name}_${startLng.toFixed(2)}_${startLat.toFixed(2)}`;
    if (seenKeys.has(dedupKey)) {
      continue;
    }
    seenKeys.add(dedupKey);

    waterways.push({
      id: String(element.id),
      name,
      type: tags.waterway ?? "river",
      coordinates: fullCoords,
    });
  }

  return waterways.slice(0, 150);
}

export async function fetchRealFactories(
  south: number = DHAKA_BBOX.south,
  west: number = DHAKA_BBOX.west,
  north: number = DHAKA_BBOX.north,
  east: number = DHAKA_BBOX.east,
  maxRiverDistance: number = 3000,
  riversDict: RiversMap = RIVERS,
): Promise<FactoryRecord[]> {
  const bbox = `${south},${west},${north},${east}`;
  const query = `
    [out:json][timeout:60];
    (
      way["landuse"="industrial"](${bbox});
      relation["landuse"="industrial"](${bbox});
      node["building"="industrial"](${bbox});
      way["building"="industrial"](${bbox});
      node["building"="factory"](${bbox});
      way["building"="factory"](${bbox});
      node["building"="warehouse"](${bbox});
      way["building"="warehouse"](${bbox});
      node["industrial"](${bbox});
      way["industrial"](${bbox});
      node["man_made"="works"](${bbox});
      way["man_made"="works"](${bbox});
      node["craft"](${bbox});
      way["craft"](${bbox});
    );
    out center body;
    `;

  const data = await postOverpassQuery(query, 120_000);
  if (!data) {
    return [];
  }

  const factories: FactoryRecord[] = [];
  const seenCoords = new Set<string>();

  for (const element of data.elements ?? []) {
    let lat: number | undefined;
    let lon: number | undefined;

    if (element.type === "node") {
      lat = element.lat;
      lon = element.lon;
    } else if (element.type === "way" || element.type === "relation") {
      lat = element.center?.lat;
      lon = element.center?.lon;
    }

    if (lat == null || lon == null) {
      continue;
    }

    const coordKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
    if (seenCoords.has(coordKey)) {
      continue;
    }
    seenCoords.add(coordKey);

    const tags = element.tags ?? {};
    const name = tags.name ?? tags["name:en"] ?? "";
    const [riverId, riverDistance] = nearestRiver(lat, lon, riversDict);
    if (!riverId || riverDistance > maxRiverDistance) {
      continue;
    }

    const industryType = classifyIndustry(tags);
    const profile =
      INDUSTRY_POLLUTION_PROFILE[industryType] ??
      INDUSTRY_POLLUTION_PROFILE.unknown;
    const riverName = riversDict[riverId]?.name ?? "Unknown";

    factories.push({
      osm_id: element.id,
      osm_type: element.type,
      name: name || `Industrial Site #${element.id}`,
      lat: Number(lat.toFixed(6)),
      lng: Number(lon.toFixed(6)),
      industry_type: industryType,
      pollution_profile: profile.label,
      nearest_river: riverId,
      river_name: riverName,
      distance_to_river_m: Math.round(riverDistance),
      tags: {
        building: tags.building ?? "",
        landuse: tags.landuse ?? "",
        industrial: tags.industrial ?? "",
        name,
        operator: tags.operator ?? "",
      },
    });
  }

  return sortFactoriesByDistance(factories);
}

export function runBayesianAttribution(
  hotspotLat: number,
  hotspotLng: number,
  hotspotType: string,
  factories: FactoryRecord[],
  maxDistance = 2000,
): AttributionRecord[] {
  const candidates = factories.flatMap((factory) => {
    const distance = haversineDistance(
      hotspotLat,
      hotspotLng,
      factory.lat,
      factory.lng,
    );

    if (distance > maxDistance || distance < 1) {
      return [];
    }

    const distancePrior = 1.0 / (distance / 100) ** 2;
    const profile =
      INDUSTRY_POLLUTION_PROFILE[factory.industry_type] ??
      INDUSTRY_POLLUTION_PROFILE.unknown;

    let spectralLikelihood: number;
    if (hotspotType === "high_organic") {
      spectralLikelihood = profile.cdom_weight * 0.6 + profile.ndti_weight * 0.4;
    } else if (hotspotType === "high_dye") {
      spectralLikelihood = profile.rb_weight * 0.7 + profile.ndti_weight * 0.3;
    } else {
      spectralLikelihood =
        (profile.ndti_weight + profile.cdom_weight + profile.rb_weight) / 3;
    }

    return [
      {
        factory_name: factory.name,
        osm_id: factory.osm_id,
        industry_type: factory.industry_type,
        pollution_profile: factory.pollution_profile,
        distance_m: Math.round(distance),
        lat: factory.lat,
        lng: factory.lng,
        spectral_match: Number(spectralLikelihood.toFixed(3)),
        distance_score: Number(distancePrior.toFixed(3)),
        raw_posterior: spectralLikelihood * distancePrior,
      },
    ];
  });

  if (candidates.length > 0) {
    const maxRawPosterior = Math.max(
      ...candidates.map((candidate) => candidate.raw_posterior),
    );
    const background = 0.05 * maxRawPosterior;
    for (const candidate of candidates) {
      candidate.raw_posterior += background;
    }
  }

  const totalPosterior =
    candidates.reduce((sum, candidate) => sum + candidate.raw_posterior, 0) || 1;

  return candidates
    .map(({ raw_posterior, ...candidate }) => ({
      ...candidate,
      probability: Number((raw_posterior / totalPosterior).toFixed(4)),
    }))
    .sort((left, right) => right.probability - left.probability)
    .slice(0, 10);
}

export function generatePollutionHotspots(
  factories: FactoryRecord[],
  riversDict: RiversMap = RIVERS,
): HotspotRecord[] {
  const random = new PythonRandom(42);
  const hotspots: HotspotRecord[] = [];
  let hotspotId = 1;

  for (const [riverId, riverData] of Object.entries(riversDict)) {
    const riverFactories = factories.filter(
      (factory) =>
        factory.nearest_river === riverId && factory.distance_to_river_m < 2000,
    );
    if (riverFactories.length === 0) {
      continue;
    }

    const coords = sampleCoords(riverData.coords, 20);

    for (const [coordLng, coordLat] of coords) {
      const nearbyFactories = riverFactories.filter(
        (factory) =>
          haversineDistance(coordLat, coordLng, factory.lat, factory.lng) < 1500,
      );
      if (nearbyFactories.length === 0) {
        continue;
      }

      const factoryCount = nearbyFactories.length;
      const ndtiSum = nearbyFactories.reduce((sum, factory) => {
        const profile =
          INDUSTRY_POLLUTION_PROFILE[factory.industry_type] ??
          INDUSTRY_POLLUTION_PROFILE.unknown;
        return sum + profile.ndti_weight;
      }, 0);
      const cdomSum = nearbyFactories.reduce((sum, factory) => {
        const profile =
          INDUSTRY_POLLUTION_PROFILE[factory.industry_type] ??
          INDUSTRY_POLLUTION_PROFILE.unknown;
        return sum + profile.cdom_weight;
      }, 0);
      const redBlueSum = nearbyFactories.reduce((sum, factory) => {
        const profile =
          INDUSTRY_POLLUTION_PROFILE[factory.industry_type] ??
          INDUSTRY_POLLUTION_PROFILE.unknown;
        return sum + profile.rb_weight;
      }, 0);

      const baseNdti = Math.min(
        0.8,
        (ndtiSum / factoryCount) * 0.5 + random.uniform(-0.05, 0.1),
      );
      const baseCdom = Math.min(
        5.0,
        (cdomSum / factoryCount) * 2.5 + random.uniform(-0.3, 0.5),
      );
      const baseRedBlue = Math.min(
        4.0,
        (redBlueSum / factoryCount) * 2.0 + random.uniform(-0.2, 0.4),
      );

      const severityScore =
        (baseNdti + baseCdom / 5 + baseRedBlue / 4) / 3;
      const severity =
        severityScore > 0.5
          ? "critical"
          : severityScore > 0.3
            ? "high"
            : severityScore > 0.15
              ? "moderate"
              : "low";

      const pollutionType =
        baseCdom > 3.0
          ? "high_organic"
          : baseRedBlue > 2.5
            ? "high_dye"
            : "mixed";

      const label =
        baseRedBlue > 1.5
          ? "Textile/Dye Effluent"
          : baseCdom > 2.5 && baseNdti > 0.3
            ? "Tannery Discharge"
            : baseCdom > 2.0
              ? "Organic Industrial Waste"
              : baseNdti > 0.35
                ? "High-Turbidity Discharge"
                : baseCdom > 1.5
                  ? "Mixed Organic Effluent"
                  : "Mixed Industrial Effluent";

      const detectedAt = new Date();
      detectedAt.setUTCDate(detectedAt.getUTCDate() - random.randint(5, 90));

      const hotspotLat = Number(
        (coordLat + random.uniform(-0.001, 0.001)).toFixed(6),
      );
      const hotspotLng = Number(
        (coordLng + random.uniform(-0.001, 0.001)).toFixed(6),
      );

      const hotspot: HotspotRecord = {
        id: `HP${String(hotspotId).padStart(3, "0")}`,
        lat: hotspotLat,
        lng: hotspotLng,
        severity,
        type: pollutionType,
        label,
        river: riverData.name,
        river_id: riverId,
        detected: detectedAt.toISOString().slice(0, 10),
        spectral: {
          ndti: Number(baseNdti.toFixed(3)),
          cdom: Number(baseCdom.toFixed(2)),
          red_blue_ratio: Number(baseRedBlue.toFixed(2)),
        },
        nearby_factories: factoryCount,
        top_source: nearbyFactories[0]?.name ?? "Unknown",
        description: `${titleCase(severity)} pollution detected via spectral model. ${factoryCount} industrial facilities within 1.5km. Dominant signature: ${label.toLowerCase()}.`,
        attributed_factories: [],
      };

      hotspot.attributed_factories = runBayesianAttribution(
        hotspot.lat,
        hotspot.lng,
        hotspot.type,
        factories,
      ).slice(0, 5);

      hotspots.push(hotspot);
      hotspotId += 1;
    }
  }

  return hotspots;
}

export async function fetchDynamicData(
  south: number,
  west: number,
  north: number,
  east: number,
): Promise<DynamicDataResult> {
  const cacheKey = makeCacheKey(south, west, north, east);
  const now = Date.now();
  const cached = bboxCache.get(cacheKey);

  if (cached && now - cached.ts < CACHE_TTL_MS) {
    return cached.data;
  }

  const waterways = await fetchWaterways(south, west, north, east);

  const dynamicRivers = waterways.reduce<RiversMap>((accumulator, waterway) => {
    const fullCoords = waterway.coordinates.map(
      ([lng, lat]) => [lng, lat] as [number, number],
    );
    const sampled = sampleCoords(fullCoords, 20);
    if (sampled.length >= 2) {
      accumulator[`osm_${waterway.id}`] = {
        name: waterway.name,
        coords: sampled,
      };
    }
    return accumulator;
  }, {});

  const riversForSearch =
    Object.keys(dynamicRivers).length > 0 ? dynamicRivers : RIVERS;
  const factories = await fetchRealFactories(
    south,
    west,
    north,
    east,
    3000,
    riversForSearch,
  );
  const hotspots = generatePollutionHotspots(factories, riversForSearch);

  const result = { waterways, factories, hotspots };
  bboxCache.set(cacheKey, { data: result, ts: now });
  return result;
}

export function getHardcodedWaterwaysInBBox(bbox: BBox) {
  return Object.entries(RIVERS)
    .map(([riverId, river]) => ({
      id: riverId,
      name: river.name,
      type: "river",
      coordinates: river.coords.map(
        ([lng, lat]) => [lng, lat] as [number, number],
      ),
    }))
    .filter((waterway) =>
      waterway.coordinates.some(
        ([lng, lat]) =>
          lat >= bbox.south &&
          lat <= bbox.north &&
          lng >= bbox.west &&
          lng <= bbox.east,
      ),
    );
}

export async function getCachedFactoriesInBBox(bbox: BBox) {
  return sortFactoriesByDistance(
    (await getCachedFactories()).filter(
      (factory) =>
        factory.lat >= bbox.south &&
        factory.lat <= bbox.north &&
        factory.lng >= bbox.west &&
        factory.lng <= bbox.east,
    ),
  );
}

export async function getCachedHotspotsInBBox(
  bbox: BBox,
  bufferDegrees = 0.02,
) {
  return (await getCachedHotspots())
    .filter(
      (hotspot) =>
        hotspot.lat >= bbox.south - bufferDegrees &&
        hotspot.lat <= bbox.north + bufferDegrees &&
        hotspot.lng >= bbox.west - bufferDegrees &&
        hotspot.lng <= bbox.east + bufferDegrees,
    )
    .sort(
      (left, right) => severityRank(right.severity) - severityRank(left.severity),
    );
}

export function buildRiversResponse() {
  const rivers = Object.entries(RIVERS).map(([riverId, river]) => ({
    id: riverId,
    name: river.name,
    coordinates: river.coords.map(([lng, lat]) => ({ lng, lat })),
  }));

  return {
    rivers,
    total: rivers.length,
  };
}

export async function buildStatsResponse() {
  const factories = await getCachedFactories();
  const hotspots = await getCachedHotspots();
  const factoriesByType = countBy(factories.map((factory) => factory.industry_type));
  const hotspotSeverities = countBy(hotspots.map((hotspot) => hotspot.severity));
  const factoriesByRiverId = countBy(
    factories.map((factory) => factory.nearest_river),
  );

  return {
    total_factories: factories.length,
    total_hotspots: hotspots.length,
    total_rivers_monitored: 5,
    critical_hotspots: hotspotSeverities.critical ?? 0,
    high_hotspots: hotspotSeverities.high ?? 0,
    factories_by_type: factoriesByType,
    factories_by_river: Object.fromEntries(
      Object.entries(factoriesByRiverId)
        .filter(([riverId]) => riverId in RIVERS)
        .map(([riverId, count]) => [RIVERS[riverId]?.name ?? riverId, count]),
    ),
  };
}

export async function verifySatelliteScene(
  lat: number,
  lng: number,
): Promise<SatelliteVerificationResult> {
  const now = new Date();
  const endDate = now.toISOString().slice(0, 10);
  const startDate = new Date(
    Date.UTC(now.getUTCFullYear() - 3, 0, 1),
  )
    .toISOString()
    .slice(0, 10);

  let response: Response;
  try {
    response = await fetch(
      "https://planetarycomputer.microsoft.com/api/stac/v1/search",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/geo+json",
        },
        body: JSON.stringify({
          collections: ["sentinel-2-l2a"],
          intersects: {
            type: "Point",
            coordinates: [lng, lat],
          },
          datetime: `${startDate}/${endDate}`,
          query: {
            "eo:cloud_cover": { lt: 30 },
          },
          limit: 5,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(60_000),
      },
    );
  } catch {
    throw new RouteError(503, "Satellite verification unavailable");
  }

  if (!response.ok) {
    throw new RouteError(
      503,
      `Satellite verification unavailable (${response.status})`,
    );
  }

  const payload = (await response.json()) as { features?: StacFeature[] };
  const items = Array.isArray(payload.features) ? [...payload.features] : [];

  if (items.length === 0) {
    throw new RouteError(
      404,
      "No clear-sky Sentinel-2 scene found for this location",
    );
  }

  items.sort((left, right) => {
    const leftDate = left.properties?.datetime ?? left.properties?.start_datetime;
    const rightDate =
      right.properties?.datetime ?? right.properties?.start_datetime;
    const leftTime = leftDate ? Date.parse(leftDate) : 0;
    const rightTime = rightDate ? Date.parse(rightDate) : 0;
    return rightTime - leftTime;
  });

  const item = items[0];
  const previewUrl =
    item.assets?.rendered_preview?.href ??
    item.assets?.visual?.href ??
    item.assets?.thumbnail?.href ??
    item.assets?.overview?.href ??
    null;
  const rawDate =
    item.properties?.datetime ?? item.properties?.start_datetime ?? undefined;
  const sceneDate = rawDate
    ? new Date(rawDate).toISOString().slice(0, 10)
    : "Unknown";

  return {
    scene_date: sceneDate,
    cloud_cover: Math.round(item.properties?.["eo:cloud_cover"] ?? 0),
    platform: String(
      item.properties?.platform ?? item.properties?.constellation ?? "sentinel-2",
    ).toUpperCase(),
    scene_id: item.id,
    preview_url: previewUrl,
    satellite: "Sentinel-2 L2A (ESA Copernicus)",
    source: "Microsoft Planetary Computer - free public STAC API",
    bands_available: Object.keys(item.assets ?? {}),
  };
}
