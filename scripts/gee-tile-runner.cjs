const fs = require("fs");
const path = require("path");
const { loadEnvConfig } = require("@next/env");
const ee = require("@google/earthengine");

const DHAKA_BBOX = {
  south: 23.65,
  west: 90.3,
  north: 23.9,
  east: 90.55,
};

const DEFAULT_WARD_GEOJSON = {
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

let initialized = false;

function jsonOut(payload, exitCode) {
  const text = JSON.stringify(payload);
  if (exitCode === 0) {
    process.stdout.write(text);
  } else {
    process.stderr.write(text);
  }
  process.exit(exitCode);
}

function normalizePrivateKey(privateKey) {
  return privateKey.includes("\\n")
    ? privateKey.replace(/\\n/g, "\n")
    : privateKey;
}

function serviceAccountCandidates(envJsonPath) {
  const projectRoot = path.resolve(__dirname, "..");
  const candidates = [];

  if (envJsonPath) {
    candidates.push(
      path.isAbsolute(envJsonPath)
        ? envJsonPath
        : path.resolve(projectRoot, envJsonPath),
    );
  }

  candidates.push(
    path.resolve(projectRoot, "aquascaping-468411-a8c219a7697b.json"),
  );

  return [...new Set(candidates)];
}

function wardGeoJsonCandidates() {
  const projectRoot = path.resolve(__dirname, "..");
  return [
    path.resolve(projectRoot, "data", "dhaka_wards.geojson"),
    path.resolve(process.cwd(), "prototype", "data", "dhaka_wards.geojson"),
    path.resolve(process.cwd(), "data", "dhaka_wards.geojson"),
  ];
}

function loadWardGeoJson() {
  for (const candidatePath of wardGeoJsonCandidates()) {
    try {
      const parsed = JSON.parse(fs.readFileSync(candidatePath, "utf8"));
      if (parsed?.type === "FeatureCollection" && Array.isArray(parsed.features)) {
        return parsed;
      }
    } catch {
      continue;
    }
  }

  return DEFAULT_WARD_GEOJSON;
}

function wardFeatureCollection() {
  return ee.FeatureCollection(loadWardGeoJson());
}

function loadServiceAccount() {
  const envEmail = process.env.GEE_SERVICE_ACCOUNT_EMAIL;
  const envPrivateKey = process.env.GEE_PRIVATE_KEY;
  const envProjectId = process.env.GEE_PROJECT_ID || "aquascaping-468411";

  if (envEmail && envPrivateKey) {
    return {
      client_email: envEmail,
      private_key: normalizePrivateKey(envPrivateKey),
      project_id: envProjectId,
    };
  }

  for (const candidatePath of serviceAccountCandidates(process.env.GEE_SERVICE_ACCOUNT_JSON)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(candidatePath, "utf8"));
      if (parsed.client_email && parsed.private_key) {
        return {
          client_email: parsed.client_email,
          private_key: normalizePrivateKey(parsed.private_key),
          project_id: parsed.project_id || envProjectId,
        };
      }
    } catch {
      continue;
    }
  }

  throw new Error("GEE credentials not found");
}

function initializeEarthEngine() {
  if (initialized) {
    return Promise.resolve();
  }

  const serviceAccount = loadServiceAccount();

  return new Promise((resolve, reject) => {
    ee.data.authenticateViaPrivateKey(
      {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key,
      },
      () => {
        ee.initialize(
          null,
          null,
          () => {
            initialized = true;
            resolve();
          },
          (error) => {
            reject(error instanceof Error ? error : new Error(String(error)));
          },
          null,
          serviceAccount.project_id,
        );
      },
      (error) => {
        reject(error instanceof Error ? error : new Error(String(error)));
      },
    );
  });
}

function mapUrlFromImage(image, visParams, label) {
  try {
    const mapId = image.getMapId(visParams);
    if (mapId?.tile_fetcher?.url_format) {
      return mapId.tile_fetcher.url_format;
    }

    if (mapId?.urlFormat) {
      return mapId.urlFormat;
    }

    if (mapId?.mapid && typeof mapId.formatTileUrl === "function") {
      return mapId.formatTileUrl("{x}", "{y}", "{z}");
    }
  } catch (error) {
    throw new Error(
      `${label} map rendering failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  throw new Error(`${label} map rendering failed`);
}

function evaluateEeObject(obj) {
  return new Promise((resolve, reject) => {
    try {
      obj.getInfo((value, error) => {
        if (error) {
          reject(
            new Error(
              typeof error === "string" ? error : JSON.stringify(error),
            ),
          );
          return;
        }
        resolve(value);
      });
    } catch (error) {
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

async function buildWardSignals(image, scale) {
  const stats = image
    .rename("metric")
    .reduceRegions({
      collection: wardFeatureCollection(),
      reducer: ee.Reducer.mean(),
      scale,
      bestEffort: true,
    });

  const info = await evaluateEeObject(stats);
  const features = Array.isArray(info?.features) ? info.features : [];

  return features.map((feature) => ({
    wardId: String(feature?.properties?.ward_id ?? "unknown"),
    wardName: String(feature?.properties?.ward_name ?? "Unknown Ward"),
    rawValue: Number(feature?.properties?.mean ?? 0),
  }));
}

async function safeWardSignals(image, scale) {
  try {
    return await buildWardSignals(image, scale);
  } catch {
    return [];
  }
}

function dhakaAoi() {
  return ee.Geometry.Rectangle([
    DHAKA_BBOX.west,
    DHAKA_BBOX.south,
    DHAKA_BBOX.east,
    DHAKA_BBOX.north,
  ]);
}

function dhakaCenter() {
  return ee.Geometry.Point([90.4125, 23.8103]);
}

function createPollutionTiles() {
  const aoi = dhakaAoi();
  const point = dhakaCenter();
  const s2 = ee
    .ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
    .filterBounds(point)
    .filterDate("2023-11-01", "2024-03-31")
    .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20));

  const image = s2.median().clip(aoi);
  const mndwi = image.normalizedDifference(["B3", "B11"]);
  const waterMask = mndwi.gt(0.0);
  const waterOnlyImage = image.updateMask(waterMask);

  const redBlueRatio = waterOnlyImage
    .select("B4")
    .divide(waterOnlyImage.select("B2").add(1e-6));
  const ndti = waterOnlyImage.normalizedDifference(["B4", "B3"]);
  const cdom = waterOnlyImage
    .select("B3")
    .multiply(waterOnlyImage.select("B4"))
    .divide(waterOnlyImage.select("B2").add(1e-6));

  return {
    redBlueRatio: {
      url: mapUrlFromImage(
        redBlueRatio,
        {
          min: 0.7,
          max: 1.4,
          palette: ["blue", "purple", "red"],
          format: "png",
        },
        "Pollution red/blue ratio",
      ),
      description: "Red/Blue ratio for textile dye detection",
      palette: "blue -> purple -> red",
    },
    ndti: {
      url: mapUrlFromImage(
        ndti,
        {
          min: -0.3,
          max: 0.8,
          palette: ["blue", "green", "yellow", "red"],
          format: "png",
        },
        "Pollution NDTI",
      ),
      description: "NDTI turbidity proxy",
      palette: "blue -> green -> yellow -> red",
    },
    cdom: {
      url: mapUrlFromImage(
        cdom,
        {
          min: 0.2,
          max: 2.2,
          palette: ["navy", "purple", "orange", "red"],
          format: "png",
        },
        "Pollution CDOM",
      ),
      description: "CDOM organic load proxy",
      palette: "navy -> purple -> orange -> red",
    },
  };
}

function createWaterTile(year) {
  const point = dhakaCenter();
  const startDate = `${year - 1}-11-01`;
  const endDate = `${year}-03-31`;
  const s2 = ee
    .ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
    .filterBounds(point)
    .filterDate(startDate, endDate)
    .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20));

  const image = s2.median().clip(dhakaAoi());
  const mndwi = image.normalizedDifference(["B3", "B11"]);
  const waterMask = mndwi.gt(0).selfMask();
  const palette = year === 2016 ? "#3b82f6" : "#ef4444";

  return {
    url: mapUrlFromImage(
      waterMask,
      {
        min: 0,
        max: 1,
        palette: [palette],
        format: "png",
      },
      `Water mask ${year}`,
    ),
    year,
    description: year === 2016 ? "MNDWI baseline water mask" : "MNDWI current water mask",
    palette: year === 2016 ? "blue" : "red",
  };
}

function createWaterTiles() {
  return {
    baseline_2016: createWaterTile(2016),
    current_2026: createWaterTile(2026),
  };
}

function createErosionTile() {
  const aoi = dhakaAoi();
  const s2 = ee
    .ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
    .filterBounds(aoi)
    .filterDate("2024-11-01", "2025-03-31")
    .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20));

  const opticalImage = s2.median();
  const waterMask = opticalImage.normalizedDifference(["B3", "B11"]).gt(0.0);

  const s1Pre = ee
    .ImageCollection("COPERNICUS/S1_GRD")
    .filterBounds(aoi)
    .filterDate("2025-03-01", "2025-05-31")
    .filter(ee.Filter.eq("instrumentMode", "IW"))
    .filter(ee.Filter.listContains("transmitterReceiverPolarisation", "VV"))
    .filter(ee.Filter.eq("orbitProperties_pass", "ASCENDING"))
    .select("VV");

  const s1Post = ee
    .ImageCollection("COPERNICUS/S1_GRD")
    .filterBounds(aoi)
    .filterDate("2024-10-01", "2024-12-31")
    .filter(ee.Filter.eq("instrumentMode", "IW"))
    .filter(ee.Filter.listContains("transmitterReceiverPolarisation", "VV"))
    .filter(ee.Filter.eq("orbitProperties_pass", "ASCENDING"))
    .select("VV");

  const sarPreFiltered = s1Pre.median().focal_median(1, "circle", "pixels");
  const sarPostFiltered = s1Post.median().focal_median(1, "circle", "pixels");
  const sarChange = sarPostFiltered.subtract(sarPreFiltered).updateMask(waterMask);
  const erosionIndex = sarChange.updateMask(sarChange.lt(-2));

  return {
    sar_erosion: {
      url: mapUrlFromImage(
        erosionIndex,
        {
          min: -6,
          max: 0,
          palette: ["red", "yellow", "green"],
          format: "png",
        },
        "SAR erosion",
      ),
      description: "Sentinel-1 SAR erosion detection",
      interpretation: "Green=stable, Yellow=moderate, Red=critical",
      methodology: "VV polarization median composite",
    },
  };
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function recentWindow(days) {
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  };
}

async function createUhiIntelligence() {
  const aoi = dhakaAoi();
  const point = dhakaCenter();
  const { startDate, endDate } = recentWindow(365);

  const l8 = ee
    .ImageCollection("LANDSAT/LC08/C02/T1_L2")
    .filterBounds(point)
    .filterDate(startDate, endDate)
    .filter(ee.Filter.lt("CLOUD_COVER", 30));

  const l9 = ee
    .ImageCollection("LANDSAT/LC09/C02/T1_L2")
    .filterBounds(point)
    .filterDate(startDate, endDate)
    .filter(ee.Filter.lt("CLOUD_COVER", 30));

  const merged = l8.merge(l9);
  const thermalKelvin = merged.select("ST_B10").median().clip(aoi);
  const lstCelsius = thermalKelvin
    .multiply(0.00341802)
    .add(149.0)
    .subtract(273.15)
    .rename("lst_celsius");

  const ndvi = merged
    .map((image) =>
      image.normalizedDifference(["SR_B5", "SR_B4"]).rename("ndvi"),
    )
    .median()
    .clip(aoi)
    .rename("ndvi");

  const heatRisk = lstCelsius
    .subtract(ndvi.multiply(8))
    .rename("heat_risk");

  const wardSignals = await safeWardSignals(heatRisk, 60);

  return {
    tiles: {
      lst_celsius: {
        url: mapUrlFromImage(
          lstCelsius,
          {
            min: 24,
            max: 44,
            palette: ["#1d4ed8", "#22c55e", "#f59e0b", "#ef4444"],
            format: "png",
          },
          "UHI LST",
        ),
        description: "Land surface temperature (Celsius)",
        palette: "blue -> green -> orange -> red",
      },
      heat_risk: {
        url: mapUrlFromImage(
          heatRisk,
          {
            min: 20,
            max: 42,
            palette: ["#fde68a", "#f59e0b", "#f97316", "#dc2626"],
            format: "png",
          },
          "UHI heat risk",
        ),
        description: "Composite heat risk using LST and vegetation cooling deficit",
        palette: "yellow -> amber -> orange -> red",
      },
      ndvi_context: {
        url: mapUrlFromImage(
          ndvi,
          {
            min: 0,
            max: 0.7,
            palette: ["#7f1d1d", "#f97316", "#84cc16", "#166534"],
            format: "png",
          },
          "UHI NDVI context",
        ),
        description: "Vegetation cooling context (NDVI)",
        palette: "brown -> orange -> lime -> green",
      },
    },
    summary: {
      layer: "uhi",
      period: `${startDate} to ${endDate}`,
      datasets: ["LANDSAT/LC08/C02/T1_L2", "LANDSAT/LC09/C02/T1_L2"],
      confidence: "medium",
      notes: "Heat risk combines LST with low-greenness penalty for urban canopy deficit.",
    },
    wardSignals,
  };
}

async function createWaterloggingIntelligence() {
  const aoi = dhakaAoi();
  const point = dhakaCenter();
  const dem = ee.Image("JAXA/ALOS/AW3D30/V4_1").select("DSM").clip(aoi);
  const slope = ee.Terrain.slope(dem).rename("slope");
  const lowElevation = dem.lt(8).rename("low_elevation");
  const lowSlope = slope.lt(2).rename("low_slope");
  const sinkSusceptibility = lowElevation.and(lowSlope).selfMask().rename("sink");

  const monsoonStart = "2025-06-01";
  const monsoonEnd = "2025-10-31";
  const sentinel1 = ee
    .ImageCollection("COPERNICUS/S1_GRD")
    .filterBounds(point)
    .filterDate(monsoonStart, monsoonEnd)
    .filter(ee.Filter.eq("instrumentMode", "IW"))
    .filter(ee.Filter.listContains("transmitterReceiverPolarisation", "VV"))
    .select("VV");

  const vvMonsoon = sentinel1.median().clip(aoi).rename("vv_monsoon");
  const monsoonWater = vvMonsoon.lt(-16).selfMask().rename("water_mask");
  const accumulation = monsoonWater
    .unmask(0)
    .multiply(sinkSusceptibility.unmask(0))
    .rename("accumulation")
    .selfMask();

  const wardSignals = await safeWardSignals(accumulation.unmask(0), 30);

  return {
    tiles: {
      sink_susceptibility: {
        url: mapUrlFromImage(
          sinkSusceptibility,
          {
            min: 0,
            max: 1,
            palette: ["#0f172a", "#0891b2"],
            format: "png",
          },
          "Flood sink susceptibility",
        ),
        description: "Low-lying and flat terrain likely to hold stormwater",
        palette: "dark navy -> cyan",
      },
      monsoon_water: {
        url: mapUrlFromImage(
          monsoonWater,
          {
            min: 0,
            max: 1,
            palette: ["#1d4ed8"],
            format: "png",
          },
          "Monsoon water mask",
        ),
        description: "Sentinel-1 monsoon accumulation mask",
        palette: "blue",
      },
      waterlogging_risk: {
        url: mapUrlFromImage(
          accumulation,
          {
            min: 0,
            max: 1,
            palette: ["#fef3c7", "#f59e0b", "#ea580c", "#b91c1c"],
            format: "png",
          },
          "Waterlogging risk",
        ),
        description: "Combined sink susceptibility and monsoon water evidence",
        palette: "sand -> amber -> orange -> red",
      },
    },
    summary: {
      layer: "flood",
      period: `${monsoonStart} to ${monsoonEnd}`,
      datasets: ["JAXA/ALOS/AW3D30/V4_1", "COPERNICUS/S1_GRD"],
      confidence: "medium-high",
      notes: "Flood risk is susceptibility + monsoon accumulation; no rainfall nowcast in v1.",
    },
    wardSignals,
  };
}

async function createAirQualityIntelligence() {
  const aoi = dhakaAoi();
  const point = dhakaCenter();
  const { startDate, endDate } = recentWindow(90);

  const no2 = ee
    .ImageCollection("COPERNICUS/S5P/OFFL/L3_NO2")
    .filterBounds(point)
    .filterDate(startDate, endDate)
    .select("NO2_column_number_density")
    .mean()
    .clip(aoi)
    .rename("no2");

  const so2 = ee
    .ImageCollection("COPERNICUS/S5P/OFFL/L3_SO2")
    .filterBounds(point)
    .filterDate(startDate, endDate)
    .select("SO2_column_number_density")
    .mean()
    .clip(aoi)
    .rename("so2");

  const co = ee
    .ImageCollection("COPERNICUS/S5P/OFFL/L3_CO")
    .filterBounds(point)
    .filterDate(startDate, endDate)
    .select("CO_column_number_density")
    .mean()
    .clip(aoi)
    .rename("co");

  const burdenIndex = no2
    .multiply(1e5)
    .multiply(0.5)
    .add(so2.multiply(1e5).multiply(0.3))
    .add(co.multiply(1e3).multiply(0.2))
    .rename("air_burden");

  const wardSignals = await safeWardSignals(burdenIndex, 500);

  return {
    tiles: {
      no2: {
        url: mapUrlFromImage(
          no2,
          {
            min: 0,
            max: 0.0002,
            palette: ["#dbeafe", "#93c5fd", "#3b82f6", "#1d4ed8"],
            format: "png",
          },
          "NO2",
        ),
        description: "Nitrogen dioxide column density",
        palette: "light blue -> dark blue",
      },
      so2: {
        url: mapUrlFromImage(
          so2,
          {
            min: 0,
            max: 0.0004,
            palette: ["#fef9c3", "#fde047", "#f59e0b", "#b45309"],
            format: "png",
          },
          "SO2",
        ),
        description: "Sulfur dioxide column density",
        palette: "light yellow -> amber -> brown",
      },
      co: {
        url: mapUrlFromImage(
          co,
          {
            min: 0.02,
            max: 0.08,
            palette: ["#ecfccb", "#84cc16", "#15803d", "#14532d"],
            format: "png",
          },
          "CO",
        ),
        description: "Carbon monoxide column density",
        palette: "pale green -> dark green",
      },
      burden_index: {
        url: mapUrlFromImage(
          burdenIndex,
          {
            min: 2,
            max: 16,
            palette: ["#e0f2fe", "#7dd3fc", "#0ea5e9", "#dc2626"],
            format: "png",
          },
          "Air burden index",
        ),
        description: "Weighted burden index from NO2, SO2 and CO",
        palette: "cyan -> blue -> red",
      },
    },
    summary: {
      layer: "air",
      period: `${startDate} to ${endDate}`,
      datasets: [
        "COPERNICUS/S5P/OFFL/L3_NO2",
        "COPERNICUS/S5P/OFFL/L3_SO2",
        "COPERNICUS/S5P/OFFL/L3_CO",
      ],
      confidence: "coarse",
      notes:
        "Sentinel-5P is coarse resolution; use ward burden as strategic signal, not street-level enforcement.",
    },
    wardSignals,
  };
}

async function createGreenCanopyIntelligence() {
  const aoi = dhakaAoi();
  const point = dhakaCenter();
  const { endDate } = recentWindow(0);
  const currentYear = Number.parseInt(endDate.slice(0, 4), 10);
  const currentStart = `${currentYear - 1}-01-01`;
  const currentEnd = `${currentYear - 1}-12-31`;
  const baselineStart = `${currentYear - 6}-01-01`;
  const baselineEnd = `${currentYear - 6}-12-31`;

  const currentCollection = ee
    .ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
    .filterBounds(point)
    .filterDate(currentStart, currentEnd)
    .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 25));

  const baselineCollection = ee
    .ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
    .filterBounds(point)
    .filterDate(baselineStart, baselineEnd)
    .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 25));

  const ndviCurrent = currentCollection
    .median()
    .normalizedDifference(["B8", "B4"])
    .rename("ndvi_current")
    .clip(aoi);

  const ndviBaseline = baselineCollection
    .median()
    .normalizedDifference(["B8", "B4"])
    .rename("ndvi_baseline")
    .clip(aoi);

  const ndviChange = ndviCurrent.subtract(ndviBaseline).rename("ndvi_change");
  const canopyMask = ndviCurrent.gt(0.45).selfMask().rename("canopy_mask");
  const wardSignals = await safeWardSignals(ndviCurrent, 20);

  return {
    tiles: {
      ndvi_current: {
        url: mapUrlFromImage(
          ndviCurrent,
          {
            min: 0,
            max: 0.8,
            palette: ["#7f1d1d", "#f97316", "#84cc16", "#166534"],
            format: "png",
          },
          "Current NDVI",
        ),
        description: "Current-year NDVI composite",
        palette: "brown -> orange -> lime -> deep green",
      },
      ndvi_change: {
        url: mapUrlFromImage(
          ndviChange,
          {
            min: -0.3,
            max: 0.3,
            palette: ["#b91c1c", "#f97316", "#f8fafc", "#22c55e", "#15803d"],
            format: "png",
          },
          "NDVI change",
        ),
        description: "Five-year NDVI delta (gain/loss)",
        palette: "red (loss) -> white -> green (gain)",
      },
      canopy_mask: {
        url: mapUrlFromImage(
          canopyMask,
          {
            min: 0,
            max: 1,
            palette: ["#16a34a"],
            format: "png",
          },
          "Tree canopy mask",
        ),
        description: "High-canopy mask (NDVI > 0.45)",
        palette: "green",
      },
    },
    summary: {
      layer: "green",
      period: `${baselineStart} to ${currentEnd}`,
      datasets: ["COPERNICUS/S2_SR_HARMONIZED"],
      confidence: "high",
      notes: "Green score uses NDVI current condition plus 5-year NDVI trend context.",
    },
    wardSignals,
  };
}

async function main() {
  loadEnvConfig(path.resolve(__dirname, ".."));
  await initializeEarthEngine();

  const command = process.argv[2];
  if (!command) {
    throw new Error("Missing GEE command");
  }

  if (command === "pollution") {
    jsonOut({ ok: true, data: createPollutionTiles() }, 0);
  }

  if (command === "water") {
    const year = Number.parseInt(process.argv[3] || "2026", 10);
    if (!Number.isFinite(year) || year < 2016 || year > 2026) {
      throw new Error("Invalid water year");
    }
    jsonOut({ ok: true, data: createWaterTile(year) }, 0);
  }

  if (command === "water-pair") {
    jsonOut({ ok: true, data: createWaterTiles() }, 0);
  }

  if (command === "erosion") {
    jsonOut({ ok: true, data: createErosionTile() }, 0);
  }

  if (command === "uhi") {
    jsonOut({ ok: true, data: await createUhiIntelligence() }, 0);
  }

  if (command === "waterlogging") {
    jsonOut({ ok: true, data: await createWaterloggingIntelligence() }, 0);
  }

  if (command === "air-quality") {
    jsonOut({ ok: true, data: await createAirQualityIntelligence() }, 0);
  }

  if (command === "green-canopy") {
    jsonOut({ ok: true, data: await createGreenCanopyIntelligence() }, 0);
  }

  throw new Error(`Unknown GEE command: ${command}`);
}

main().catch((error) => {
  jsonOut(
    {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    },
    1,
  );
});
