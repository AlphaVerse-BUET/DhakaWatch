import { ROAD_FLOOD_CORRIDORS } from "@/data/road-flood-corridors";
import { DHAKA_WARDS } from "@/data/dhaka-ward-boundaries";

export type AnalyticsLayer = "uhi" | "flood" | "air" | "green";

export type WardSignal = {
  wardId: string;
  wardName: string;
  rawValue: number;
};

export type WardScoreRecord = WardSignal & {
  normalizedScore: number;
  rank: number;
  riskLevel: "critical" | "high" | "moderate" | "low";
};

export type RoadRiskRecord = {
  roadId: string;
  roadName: string;
  wardId: string;
  wardName: string;
  center: { lat: number; lng: number };
  floodRisk: number;
  passability: "impassable" | "slow" | "watch" | "open";
  expectedWaterDepthCm: number;
};

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function toRiskLevel(score: number): WardScoreRecord["riskLevel"] {
  if (score >= 0.8) return "critical";
  if (score >= 0.62) return "high";
  if (score >= 0.4) return "moderate";
  return "low";
}

export function mergeSignalsWithWardCatalog(signals: WardSignal[]) {
  const signalMap = new Map(
    signals.map((signal) => [signal.wardId, signal] as const),
  );

  return DHAKA_WARDS.map((ward) => {
    const signal = signalMap.get(ward.wardId);
    return {
      wardId: ward.wardId,
      wardName: ward.wardName,
      rawValue: Number((signal?.rawValue ?? 0).toFixed(6)),
    } satisfies WardSignal;
  });
}

export function normalizeWardSignals(
  layer: AnalyticsLayer,
  rawSignals: WardSignal[],
): WardScoreRecord[] {
  const signals = mergeSignalsWithWardCatalog(rawSignals);

  const values = signals.map((item) => item.rawValue);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;

  const higherIsWorse = layer !== "green";

  const normalized: WardScoreRecord[] = signals.map((signal) => {
    const ratio = span > 0 ? (signal.rawValue - min) / span : 0.5;
    const normalizedScore = higherIsWorse ? ratio : 1 - ratio;

    return {
      ...signal,
      normalizedScore: Number(clamp01(normalizedScore).toFixed(4)),
      rank: 0,
      riskLevel: "low",
    };
  });

  normalized
    .sort((left, right) => right.normalizedScore - left.normalizedScore)
    .forEach((record, index) => {
      record.rank = index + 1;
      record.riskLevel = toRiskLevel(record.normalizedScore);
    });

  return normalized;
}

function passabilityFromRisk(risk: number): RoadRiskRecord["passability"] {
  if (risk >= 0.8) return "impassable";
  if (risk >= 0.62) return "slow";
  if (risk >= 0.45) return "watch";
  return "open";
}

export function buildRoadFloodRiskRecords(
  floodWardScores: WardScoreRecord[],
): RoadRiskRecord[] {
  const wardRisk = new Map(
    floodWardScores.map((score) => [score.wardId, score.normalizedScore] as const),
  );

  return ROAD_FLOOD_CORRIDORS.map((road) => {
    const wardBaseRisk = wardRisk.get(road.wardId) ?? 0.4;
    const blended = clamp01(
      wardBaseRisk * 0.62 +
        road.slopePenalty * 0.2 +
        road.drainagePenalty * 0.18,
    );

    return {
      roadId: road.id,
      roadName: road.name,
      wardId: road.wardId,
      wardName: road.wardName,
      center: road.center,
      floodRisk: Number(blended.toFixed(4)),
      passability: passabilityFromRisk(blended),
      expectedWaterDepthCm: road.expectedWaterDepthCm,
    } satisfies RoadRiskRecord;
  }).sort((left, right) => right.floodRisk - left.floodRisk);
}
