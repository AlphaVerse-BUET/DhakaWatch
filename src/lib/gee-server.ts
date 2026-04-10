import "server-only";

import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

type TileResult = { url: string; description: string; palette?: string };
type WardSignal = { wardId: string; wardName: string; rawValue: number };
type UrbanLayerResult = {
  tiles: Record<string, TileResult>;
  summary: {
    layer: "uhi" | "flood" | "air" | "green";
    period: string;
    datasets: string[];
    confidence: string;
    notes: string;
  };
  wardSignals: WardSignal[];
};

type RunnerSuccess<T> = {
  ok: true;
  data: T;
};

type RunnerFailure = {
  ok: false;
  error: string;
};

const execFileAsync = promisify(execFile);

let lastError: string | null = null;

async function resolveRunnerScriptPath() {
  const candidates = [
    path.resolve(process.cwd(), "scripts", "gee-tile-runner.cjs"),
    path.resolve(process.cwd(), "prototype", "scripts", "gee-tile-runner.cjs"),
  ];

  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      continue;
    }
  }

  return null;
}

function parseRunnerPayload<T>(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as RunnerSuccess<T> | RunnerFailure;
  } catch {
    return null;
  }
}

async function runGeeTask<T>(...args: string[]) {
  const scriptPath = await resolveRunnerScriptPath();
  if (!scriptPath) {
    lastError = "GEE runner script not found";
    return null;
  }

  try {
    const { stdout, stderr } = await execFileAsync(
      process.execPath,
      [scriptPath, ...args],
      {
        cwd: process.cwd(),
        env: process.env,
        timeout: 180_000,
        maxBuffer: 1024 * 1024,
      },
    );

    const payload = parseRunnerPayload<T>(stdout) ?? parseRunnerPayload<T>(stderr);
    if (!payload) {
      lastError = "Unexpected GEE runner response";
      return null;
    }

    if (!payload.ok) {
      lastError = payload.error;
      return null;
    }

    lastError = null;
    return payload.data;
  } catch (error: any) {
    const payload =
      parseRunnerPayload<T>(error?.stdout) ?? parseRunnerPayload<T>(error?.stderr);

    if (payload) {
      if (payload.ok) {
        lastError = null;
        return payload.data;
      }

      lastError = payload.error;
      return null;
    }

    lastError =
      typeof error?.message === "string"
        ? error.message
        : "Earth Engine subprocess failed";
    return null;
  }
}

export function getGeeLastError() {
  return lastError;
}

export async function createPollutionTiles(): Promise<{
  redBlueRatio: TileResult;
  ndti: TileResult;
  cdom: TileResult;
} | null> {
  return runGeeTask<{
    redBlueRatio: TileResult;
    ndti: TileResult;
    cdom: TileResult;
  }>("pollution");
}

export async function getPollutionTileUrl() {
  const tiles = await createPollutionTiles();
  return tiles?.redBlueRatio.url ?? null;
}

export async function createWaterTiles(): Promise<{
  baseline_2016: TileResult & { year: number };
  current_2026: TileResult & { year: number };
} | null> {
  return runGeeTask<{
    baseline_2016: TileResult & { year: number };
    current_2026: TileResult & { year: number };
  }>("water-pair");
}

export async function getWaterSegmentationTileUrl(year: number) {
  const tile = await runGeeTask<TileResult & { year: number }>(
    "water",
    String(year),
  );
  return tile?.url ?? null;
}

export async function createErosionTile(): Promise<{
  sar_erosion: TileResult & { interpretation: string; methodology: string };
} | null> {
  return runGeeTask<{
    sar_erosion: TileResult & { interpretation: string; methodology: string };
  }>("erosion");
}

export async function getSarErosionTileUrl() {
  const tile = await createErosionTile();
  return tile?.sar_erosion.url ?? null;
}

export async function createUhiIntelligence(): Promise<UrbanLayerResult | null> {
  return runGeeTask<UrbanLayerResult>("uhi");
}

export async function createWaterloggingIntelligence(): Promise<UrbanLayerResult | null> {
  return runGeeTask<UrbanLayerResult>("waterlogging");
}

export async function createAirQualityIntelligence(): Promise<UrbanLayerResult | null> {
  return runGeeTask<UrbanLayerResult>("air-quality");
}

export async function createGreenCanopyIntelligence(): Promise<UrbanLayerResult | null> {
  return runGeeTask<UrbanLayerResult>("green-canopy");
}
