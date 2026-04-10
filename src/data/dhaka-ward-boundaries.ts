type WardFeature = {
  type: "Feature";
  properties: {
    ward_id: string;
    ward_name: string;
    zone: string;
  };
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
};

export type DhakaWardGeoJson = {
  type: "FeatureCollection";
  features: WardFeature[];
};

export type WardBoundary = {
  wardId: string;
  wardName: string;
  zone: string;
  polygon: [number, number][];
};

export const DHAKA_WARDS_GEOJSON: DhakaWardGeoJson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { ward_id: "ward_old_dhaka", ward_name: "Old Dhaka", zone: "DSCC" },
      geometry: {
        type: "Polygon",
        coordinates: [[[90.385, 23.7], [90.435, 23.7], [90.435, 23.735], [90.385, 23.735], [90.385, 23.7]]],
      },
    },
    {
      type: "Feature",
      properties: { ward_id: "ward_purbachal", ward_name: "Purbachal", zone: "DNCC" },
      geometry: {
        type: "Polygon",
        coordinates: [[[90.47, 23.82], [90.55, 23.82], [90.55, 23.87], [90.47, 23.87], [90.47, 23.82]]],
      },
    },
    {
      type: "Feature",
      properties: { ward_id: "ward_uttara", ward_name: "Uttara", zone: "DNCC" },
      geometry: {
        type: "Polygon",
        coordinates: [[[90.36, 23.86], [90.42, 23.86], [90.42, 23.905], [90.36, 23.905], [90.36, 23.86]]],
      },
    },
    {
      type: "Feature",
      properties: { ward_id: "ward_mirpur", ward_name: "Mirpur", zone: "DNCC" },
      geometry: {
        type: "Polygon",
        coordinates: [[[90.34, 23.79], [90.39, 23.79], [90.39, 23.845], [90.34, 23.845], [90.34, 23.79]]],
      },
    },
    {
      type: "Feature",
      properties: { ward_id: "ward_farmgate", ward_name: "Farmgate", zone: "DNCC" },
      geometry: {
        type: "Polygon",
        coordinates: [[[90.375, 23.74], [90.41, 23.74], [90.41, 23.775], [90.375, 23.775], [90.375, 23.74]]],
      },
    },
    {
      type: "Feature",
      properties: { ward_id: "ward_bashundhara", ward_name: "Bashundhara", zone: "DNCC" },
      geometry: {
        type: "Polygon",
        coordinates: [[[90.43, 23.805], [90.47, 23.805], [90.47, 23.84], [90.43, 23.84], [90.43, 23.805]]],
      },
    },
    {
      type: "Feature",
      properties: { ward_id: "ward_dhanmondi", ward_name: "Dhanmondi", zone: "DSCC" },
      geometry: {
        type: "Polygon",
        coordinates: [[[90.355, 23.735], [90.39, 23.735], [90.39, 23.76], [90.355, 23.76], [90.355, 23.735]]],
      },
    },
    {
      type: "Feature",
      properties: { ward_id: "ward_jatrabari", ward_name: "Jatrabari", zone: "DSCC" },
      geometry: {
        type: "Polygon",
        coordinates: [[[90.445, 23.705], [90.48, 23.705], [90.48, 23.74], [90.445, 23.74], [90.445, 23.705]]],
      },
    },
  ],
};

export const DHAKA_WARDS: WardBoundary[] = DHAKA_WARDS_GEOJSON.features.map(
  (feature) => ({
    wardId: feature.properties.ward_id,
    wardName: feature.properties.ward_name,
    zone: feature.properties.zone,
    polygon: feature.geometry.coordinates[0].map(
      ([lng, lat]) => [lng, lat] as [number, number],
    ),
  }),
);
