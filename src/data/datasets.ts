// Merged from demo_swapnil's datasets.ts with enhancements

export interface Dataset {
  id: string;
  name: string;
  provider: string;
  resolution: string;
  temporalCoverage: string;
  bands: string[];
  applications: string[];
  geeCollection?: string;
  description: string;
}

export interface SpectralIndex {
  name: string;
  formula: string;
  threshold: number;
  description: string;
  application: string;
}

export interface ResearchReference {
  title: string;
  authors: string[];
  journal: string;
  year: number;
  doi?: string;
  url?: string;
}

export interface GEECodeSnippet {
  title: string;
  description: string;
  code: string;
  application: string;
}

export const datasets: Dataset[] = [
  {
    id: "sentinel2",
    name: "Sentinel-2 L2A",
    provider: "ESA Copernicus",
    resolution: "10m (RGB, NIR), 20m (SWIR)",
    temporalCoverage: "2015-Present",
    bands: [
      "B2 (Blue)",
      "B3 (Green)",
      "B4 (Red)",
      "B8 (NIR)",
      "B11 (SWIR1)",
      "B12 (SWIR2)",
    ],
    applications: [
      "Water quality monitoring",
      "NDTI calculation",
      "Turbidity mapping",
      "Encroachment detection",
    ],
    geeCollection: "COPERNICUS/S2_SR_HARMONIZED",
    description:
      "Primary dataset for optical analysis of water bodies and land cover change detection. 5-day revisit time enables frequent monitoring.",
  },
  {
    id: "sentinel1",
    name: "Sentinel-1 SAR",
    provider: "ESA Copernicus",
    resolution: "10m (IW mode)",
    temporalCoverage: "2014-Present",
    bands: ["VV", "VH"],
    applications: [
      "All-weather monitoring",
      "Erosion detection",
      "Water body delineation",
      "Surface roughness",
    ],
    geeCollection: "COPERNICUS/S1_GRD",
    description:
      "SAR imagery for all-weather monitoring. Critical for cloud-prone Bangladesh. Coherence analysis reveals bank instability.",
  },
  {
    id: "jrc-gsw",
    name: "JRC Global Surface Water",
    provider: "EC Joint Research Centre",
    resolution: "30m",
    temporalCoverage: "1984-2021",
    bands: [
      "occurrence",
      "change_abs",
      "change_norm",
      "seasonality",
      "recurrence",
    ],
    applications: [
      "Long-term water occurrence",
      "Seasonal patterns",
      "Historical change analysis",
    ],
    geeCollection: "JRC/GSW1_4/GlobalSurfaceWater",
    description:
      "Historical water occurrence mapped from 38 years of Landsat imagery. Essential for tracking river shrinkage over decades.",
  },
  {
    id: "landsat8",
    name: "Landsat 8/9 Collection 2 L2",
    provider: "USGS/NASA",
    resolution: "30m (Optical), 100m (Thermal)",
    temporalCoverage: "2013-Present (L8), 2021-Present (L9)",
    bands: ["SR_B2-SR_B7 (Surface Reflectance)", "ST_B10 (Thermal)"],
    applications: [
      "Urban heat island monitoring",
      "Land surface temperature (LST)",
      "Thermal anomaly detection in dense neighborhoods",
    ],
    geeCollection: "LANDSAT/LC08/C02/T1_L2",
    description:
      "Thermal-enabled archive for UHI and long-term thermal trend analysis. Pair with LC09 collection for denser temporal coverage.",
  },
  {
    id: "dem",
    name: "ALOS AW3D30 DEM",
    provider: "JAXA",
    resolution: "30m",
    temporalCoverage: "Static terrain model",
    bands: ["DSM"],
    applications: [
      "Urban sink identification",
      "Flood susceptibility screening",
      "Drainage and low-slope analysis",
    ],
    geeCollection: "JAXA/ALOS/AW3D30/V4_1",
    description:
      "High-quality 30m digital surface model used to identify low-lying zones likely to hold monsoon runoff.",
  },
  {
    id: "sentinel5p",
    name: "Sentinel-5P Atmospheric Chemistry",
    provider: "ESA Copernicus",
    resolution: "Coarse (strategic urban scale)",
    temporalCoverage: "2018-Present",
    bands: [
      "NO2_column_number_density",
      "SO2_column_number_density",
      "CO_column_number_density",
    ],
    applications: [
      "Ward-level pollution burden screening",
      "NO2/SO2/CO trend monitoring",
      "Urban mobility policy evidence",
    ],
    geeCollection: "COPERNICUS/S5P/OFFL/L3_NO2 (+ SO2/CO collections)",
    description:
      "Atmospheric composition data for strategic urban burden mapping. Suitable for policy targeting, not street-level diagnostics.",
  },
];

export const spectralIndices: SpectralIndex[] = [
  {
    name: "MNDWI",
    formula: "(Green - SWIR) / (Green + SWIR)",
    threshold: 0.0,
    description:
      "Modified Normalized Difference Water Index - Delineates water bodies with high accuracy",
    application: "Water body detection and extent mapping",
  },
  {
    name: "NDTI",
    formula: "(Red - Green) / (Red + Green)",
    threshold: 0.3,
    description:
      "Normalized Difference Turbidity Index - Detects suspended sediments and turbidity levels",
    application: "Water quality and pollution hotspot identification",
  },
  {
    name: "NDWI",
    formula: "(Green - NIR) / (Green + NIR)",
    threshold: 0.0,
    description:
      "Normalized Difference Water Index - Classic water detection index",
    application: "Water vs land classification",
  },
  {
    name: "FAI",
    formula: "NIR - (Red + (SWIR - Red) * (833 - 665) / (1610 - 665))",
    threshold: -0.004,
    description:
      "Floating Algae Index - Detects algal blooms and organic matter",
    application: "Eutrophication and organic pollution monitoring",
  },
  {
    name: "Red/Blue Ratio",
    formula: "Red / Blue",
    threshold: 3.0,
    description:
      "High values indicate presence of red dyes typical of textile effluent",
    application: "Textile dye discharge detection",
  },
  {
    name: "NDVI",
    formula: "(NIR - Red) / (NIR + Red)",
    threshold: 0.45,
    description:
      "Normalized Difference Vegetation Index for tree canopy condition and green-space quality",
    application: "Ward-level green score and canopy trend monitoring",
  },
  {
    name: "LST",
    formula: "ST_B10 * 0.00341802 + 149.0 - 273.15",
    threshold: 35.0,
    description:
      "Land Surface Temperature derived from Landsat Collection 2 thermal scaling",
    application: "Urban heat island hotspot mapping",
  },
];

export const researchReferences: ResearchReference[] = [
  {
    title: "Detecting industrial pollution in rivers using Sentinel-2 imagery",
    authors: ["Rahman, M.", "Hussain, K.", "Akter, S."],
    journal: "Remote Sensing of Environment",
    year: 2023,
    doi: "10.1016/j.rse.2023.113456",
  },
  {
    title:
      "River encroachment monitoring in Bangladesh using multi-temporal satellite data",
    authors: ["Islam, M.S.", "Hossain, A.K.M.", "Roy, D."],
    journal: "International Journal of Applied Earth Observation",
    year: 2024,
    doi: "10.1016/j.jag.2024.102789",
  },
  {
    title: "SAR-based riverbank erosion assessment in deltaic environments",
    authors: ["Khan, R.", "Ahmed, N.", "Begum, F."],
    journal: "Geomorphology",
    year: 2022,
    doi: "10.1016/j.geomorph.2022.108234",
  },
];

export const geeCodeSnippets: GEECodeSnippet[] = [
  {
    title: "Water Mask Generation",
    description: "Generate water mask using MNDWI from Sentinel-2",
    application: "River extent delineation",
    code: "// Sentinel-2 Water Mask using MNDWI\nvar s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')\n  .filterBounds(geometry)\n  .filterDate('2024-01-01', '2024-12-31')\n  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))\n  .median();\n\nvar mndwi = s2.normalizedDifference(['B3', 'B11']).rename('MNDWI');\nvar waterMask = mndwi.gt(0);\n\nMap.addLayer(waterMask, {palette: ['white', 'blue']}, 'Water Mask');",
  },
  {
    title: "NDTI Pollution Mapping",
    description: "Calculate NDTI for pollution hotspot detection",
    application: "Water quality assessment",
    code: "// NDTI Calculation for Pollution Mapping\nvar s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')\n  .filterBounds(geometry)\n  .filterDate('2024-01-01', '2024-03-31')\n  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))\n  .median();\n\nvar ndti = s2.normalizedDifference(['B4', 'B3']).rename('NDTI');\n\n// Mask water areas\nvar mndwi = s2.normalizedDifference(['B3', 'B11']);\nvar waterMask = mndwi.gt(0);\nvar ndtiWater = ndti.updateMask(waterMask);\n\nMap.addLayer(ndtiWater, {min: -0.3, max: 0.8, palette: ['blue', 'green', 'yellow', 'red']}, 'NDTI');",
  },
  {
    title: "SAR Erosion Detection",
    description: "Use Sentinel-1 coherence for erosion monitoring",
    application: "Bank stability assessment",
    code: "// Sentinel-1 SAR for Erosion Detection\nvar s1 = ee.ImageCollection('COPERNICUS/S1_GRD')\n  .filterBounds(geometry)\n  .filter(ee.Filter.eq('instrumentMode', 'IW'))\n  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))\n  .select('VV');\n\nvar before = s1.filterDate('2024-01-01', '2024-02-28').mean();\nvar after = s1.filterDate('2024-10-01', '2024-12-31').mean();\n\nvar change = after.subtract(before);\n\nMap.addLayer(change, {min: -5, max: 5, palette: ['red', 'white', 'blue']}, 'SAR Change');",
  },
  {
    title: "Historical River Change",
    description: "Analyze 10-year river extent changes using JRC GSW",
    application: "Long-term trend analysis",
    code: "// JRC Global Surface Water - Historical Change Analysis\nvar gsw = ee.Image('JRC/GSW1_4/GlobalSurfaceWater');\nvar occurrence = gsw.select('occurrence');\nvar change = gsw.select('change_abs');\n\n// Rivers that have decreased in extent\nvar decreasing = change.lt(-10);\n\nMap.addLayer(occurrence, {min: 0, max: 100, palette: ['white', 'cyan', 'blue']}, 'Water Occurrence');\nMap.addLayer(decreasing, {palette: ['white', 'red']}, 'Decreasing Water');",
  },
];

export const alerts = [
  {
    id: "A001",
    type: "critical",
    title: "Severe Pollution Detected",
    location: "Buriganga - Hazaribagh",
    timestamp: "2026-03-10T08:30:00Z",
    description:
      "NDTI reading 0.91 from tannery cluster. Chromium contamination suspected.",
    hotspotId: "HS-002",
  },
  {
    id: "A002",
    type: "warning",
    title: "Encroachment Activity",
    location: "Turag - Aminbazar",
    timestamp: "2026-03-09T14:15:00Z",
    description:
      "New construction detected within 50m of riverbank. 83% probability of encroachment.",
    segmentId: "ENC-002",
  },
  {
    id: "A003",
    type: "critical",
    title: "Accelerated Erosion",
    location: "Shitalakshya - Demra",
    timestamp: "2026-03-08T11:45:00Z",
    description:
      "SAR coherence dropped to 0.38. Bank retreat accelerating - 15.8m/year.",
    corridorId: "E003",
  },
  {
    id: "A004",
    type: "info",
    title: "New Satellite Pass",
    location: "All Monitored Rivers",
    timestamp: "2026-03-10T10:00:00Z",
    description:
      "Sentinel-2 imagery acquired. Processing and analysis in progress.",
  },
  {
    id: "A005",
    type: "warning",
    title: "Thermal Anomaly",
    location: "Turag - Tongi",
    timestamp: "2026-03-07T16:20:00Z",
    description:
      "Water temperature +10°C above baseline. Power plant cooling discharge detected.",
    hotspotId: "HS-004",
  },
  {
    id: "A006",
    type: "success",
    title: "Compliance Improved",
    location: "Buriganga - Lalbagh",
    timestamp: "2026-03-06T09:00:00Z",
    description:
      "Textile factory cluster showing 25% reduction in NDTI readings after enforcement action.",
  },
  {
    id: "A007",
    type: "critical",
    title: "Critical Dye Discharge",
    location: "Balu - Demra",
    timestamp: "2026-03-08T07:00:00Z",
    description:
      "Red/Blue ratio 4.1 detected. River visibly colored. Immediate action required.",
    hotspotId: "HS-008",
  },
];
