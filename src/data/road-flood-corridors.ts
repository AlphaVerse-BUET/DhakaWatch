export type RoadFloodCorridor = {
  id: string;
  name: string;
  wardId: string;
  wardName: string;
  center: { lat: number; lng: number };
  slopePenalty: number;
  drainagePenalty: number;
  expectedWaterDepthCm: number;
};

export const ROAD_FLOOD_CORRIDORS: RoadFloodCorridor[] = [
  {
    id: "road_progoti_shoroni",
    name: "Progoti Shoroni",
    wardId: "ward_bashundhara",
    wardName: "Bashundhara",
    center: { lat: 23.8145, lng: 90.4438 },
    slopePenalty: 0.62,
    drainagePenalty: 0.58,
    expectedWaterDepthCm: 24,
  },
  {
    id: "road_airport_road",
    name: "Airport Road (Uttara Segment)",
    wardId: "ward_uttara",
    wardName: "Uttara",
    center: { lat: 23.872, lng: 90.3998 },
    slopePenalty: 0.42,
    drainagePenalty: 0.38,
    expectedWaterDepthCm: 14,
  },
  {
    id: "road_mirpur_10",
    name: "Mirpur 10 Circle",
    wardId: "ward_mirpur",
    wardName: "Mirpur",
    center: { lat: 23.8067, lng: 90.3689 },
    slopePenalty: 0.71,
    drainagePenalty: 0.74,
    expectedWaterDepthCm: 31,
  },
  {
    id: "road_farmgate_crossing",
    name: "Farmgate Crossing",
    wardId: "ward_farmgate",
    wardName: "Farmgate",
    center: { lat: 23.7582, lng: 90.3901 },
    slopePenalty: 0.75,
    drainagePenalty: 0.83,
    expectedWaterDepthCm: 36,
  },
  {
    id: "road_shonir_akhra",
    name: "Shonir Akhra Corridor",
    wardId: "ward_jatrabari",
    wardName: "Jatrabari",
    center: { lat: 23.7098, lng: 90.4691 },
    slopePenalty: 0.84,
    drainagePenalty: 0.79,
    expectedWaterDepthCm: 44,
  },
  {
    id: "road_bangshal_chawk",
    name: "Bangshal Chowk",
    wardId: "ward_old_dhaka",
    wardName: "Old Dhaka",
    center: { lat: 23.7118, lng: 90.4078 },
    slopePenalty: 0.88,
    drainagePenalty: 0.86,
    expectedWaterDepthCm: 48,
  },
  {
    id: "road_satmasjid",
    name: "Satmasjid Road",
    wardId: "ward_dhanmondi",
    wardName: "Dhanmondi",
    center: { lat: 23.7454, lng: 90.3739 },
    slopePenalty: 0.58,
    drainagePenalty: 0.54,
    expectedWaterDepthCm: 20,
  },
  {
    id: "road_purbachal_link",
    name: "Purbachal Link Road",
    wardId: "ward_purbachal",
    wardName: "Purbachal",
    center: { lat: 23.8469, lng: 90.5093 },
    slopePenalty: 0.36,
    drainagePenalty: 0.41,
    expectedWaterDepthCm: 12,
  },
];

