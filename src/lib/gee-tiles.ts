/**
 * Frontend GEE Tile Service
 * Calls Next.js API routes to get live Earth Engine tile URLs
 * Gracefully falls back to null on any error (maps show static data)
 */

export interface PollutionTiles {
  redBlueRatio: { url: string; description: string; palette: string };
  ndti: { url: string; description: string; palette: string };
  cdom: { url: string; description: string; palette: string };
}

export interface WaterTiles {
  baseline_2016: { url: string; year: number; description: string };
  current_2026: { url: string; year: number; description: string };
}

export interface ErosionTile {
  sar_erosion: {
    url: string;
    description: string;
    interpretation: string;
    methodology: string;
  };
}

export interface WardSignal {
  wardId: string;
  wardName: string;
  rawValue: number;
}

export interface UrbanLayerPayload {
  tiles: Record<string, { url: string; description: string; palette?: string }>;
  summary: {
    layer: "uhi" | "flood" | "air" | "green";
    period: string;
    datasets: string[];
    confidence: string;
    notes: string;
  };
  scoresRef: { endpoint: string };
  wardSignals: WardSignal[];
}

/**
 * Fetch pollution spectral index tiles from GEE
 * Returns null if GEE is unavailable; map falls back to static data
 */
export async function getPollutionTiles(): Promise<PollutionTiles | null> {
  try {
    const response = await fetch("/api/gee/pollution", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn("GEE pollution endpoint failed:", response.status);
      return null;
    }

    const data: PollutionTiles = await response.json();
    console.log("✓ Pollution tiles loaded:", {
      redBlue: data.redBlueRatio.url.substring(0, 50) + "...",
      ndti: data.ndti.url.substring(0, 50) + "...",
    });

    return data;
  } catch (error) {
    console.warn("Failed to fetch pollution tiles:", error);
    return null;
  }
}

/**
 * Fetch water segmentation tiles (2016 vs 2026) from GEE
 * Returns null if GEE is unavailable; map falls back to static data
 */
export async function getWaterTiles(): Promise<WaterTiles | null> {
  try {
    const response = await fetch("/api/gee/water", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn("GEE water endpoint failed:", response.status);
      return null;
    }

    const data: WaterTiles = await response.json();
    console.log("✓ Water tiles loaded:", {
      baseline: data.baseline_2016.url.substring(0, 50) + "...",
      current: data.current_2026.url.substring(0, 50) + "...",
    });

    return data;
  } catch (error) {
    console.warn("Failed to fetch water tiles:", error);
    return null;
  }
}

/**
 * Fetch SAR erosion detection tile from GEE
 * Returns null if GEE is unavailable; map falls back to static data
 */
export async function getErosionTile(): Promise<ErosionTile | null> {
  try {
    const response = await fetch("/api/gee/erosion", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn("GEE erosion endpoint failed:", response.status);
      return null;
    }

    const data: ErosionTile = await response.json();
    console.log("✓ Erosion tile loaded:", {
      sar: data.sar_erosion.url.substring(0, 50) + "...",
    });

    return data;
  } catch (error) {
    console.warn("Failed to fetch erosion tile:", error);
    return null;
  }
}

async function fetchUrbanLayer(
  endpoint: "/api/gee/uhi" | "/api/gee/waterlogging" | "/api/gee/air-quality" | "/api/gee/green-canopy",
): Promise<UrbanLayerPayload | null> {
  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn(`Urban layer endpoint failed (${endpoint}):`, response.status);
      return null;
    }

    return (await response.json()) as UrbanLayerPayload;
  } catch (error) {
    console.warn(`Failed to fetch urban layer (${endpoint}):`, error);
    return null;
  }
}

export async function getUhiLayer() {
  return fetchUrbanLayer("/api/gee/uhi");
}

export async function getWaterloggingLayer() {
  return fetchUrbanLayer("/api/gee/waterlogging");
}

export async function getAirQualityLayer() {
  return fetchUrbanLayer("/api/gee/air-quality");
}

export async function getGreenCanopyLayer() {
  return fetchUrbanLayer("/api/gee/green-canopy");
}
