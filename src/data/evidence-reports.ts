/**
 * NodiWatch Evidence Reports Data
 * =================================
 * Mock evidence reports submitted by citizens for demonstration.
 */

export interface EvidenceReport {
  id: string;
  type: "pollution" | "encroachment" | "erosion";
  title: string;
  description: string;
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  submittedBy: string;
  submittedAt: string;
  status: "pending" | "verified" | "investigating" | "resolved";
  severity: "low" | "medium" | "high" | "critical";
  confidence: number;
  imageUrl: string;
  aiAnalysis: {
    summary: string;
    detectedIssues: string[];
    recommendations: string[];
    spectralIndicators?: string;
    pollutionType?: string;
    encroachmentType?: string;
    erosionType?: string;
  };
  validations: number;
  nearbyFactories?: Array<{
    name: string;
    type: string;
    distance: number;
    attribution: number;
  }>;
}

export const evidenceReports: EvidenceReport[] = [
  {
    id: "EVD-2026-001",
    type: "pollution",
    title: "Industrial Effluent Discharge - Hazaribagh",
    description:
      "Observed heavy discoloration of water near tannery cluster. Strong chemical smell detected. Water appears dark purple/brown with visible foam.",
    location: {
      name: "Hazaribagh, Dhaka",
      lat: 23.737,
      lng: 90.358,
    },
    submittedBy: "Anonymous Citizen",
    submittedAt: "2026-03-10T14:30:00Z",
    status: "verified",
    severity: "critical",
    confidence: 0.94,
    imageUrl: "/assets/pollution_comparison.png",
    aiAnalysis: {
      summary:
        "High-confidence detection of industrial pollution from tannery operations. Spectral analysis indicates presence of chromium-based tanning chemicals and organic waste. NDTI index significantly elevated (0.85+) indicating severe turbidity.",
      detectedIssues: [
        "Severe water discoloration (purple/brown pigmentation)",
        "Elevated turbidity levels detected via NDTI analysis",
        "Presence of industrial foam indicating chemical discharge",
        "Thermal anomaly suggesting recent hot effluent release",
        "CDOM index elevated (organic pollutant signature)",
      ],
      recommendations: [
        "Immediate inspection by DoE officials recommended",
        "Water sampling for heavy metal analysis (chromium, lead)",
        "Identify discharge pipes within 500m radius",
        "Issue warning notices to nearby tannery operations",
        "Consider temporary discharge ban pending investigation",
      ],
      spectralIndicators: "NDTI: 0.87, CDOM: 0.72, Red/Blue ratio: 2.3",
      pollutionType: "tannery",
    },
    validations: 12,
    nearbyFactories: [
      {
        name: "Bengal Leather Works",
        type: "Tannery",
        distance: 120,
        attribution: 45,
      },
      {
        name: "Dhaka Tanning Industries",
        type: "Tannery",
        distance: 280,
        attribution: 32,
      },
      {
        name: "Star Chemical Ltd",
        type: "Chemical",
        distance: 450,
        attribution: 15,
      },
    ],
  },
  {
    id: "EVD-2026-002",
    type: "encroachment",
    title: "Illegal Land Filling - Turag River",
    description:
      "Large-scale land filling operation observed. Multiple trucks dumping soil/debris. Significant river narrowing compared to last month.",
    location: {
      name: "Turag River, Tongi",
      lat: 23.892,
      lng: 90.402,
    },
    submittedBy: "Environmental Watch Group",
    submittedAt: "2026-03-08T09:15:00Z",
    status: "investigating",
    severity: "high",
    confidence: 0.88,
    imageUrl: "/assets/encroachment_comparison.png",
    aiAnalysis: {
      summary:
        "Confirmed illegal land filling activity. Satellite comparison shows 60% reduction in river width at this location since 2016. Active construction detected. MNDWI analysis indicates permanent loss of water extent.",
      detectedIssues: [
        "Active land filling operation detected",
        "River width reduced from ~300m to ~120m (60% loss)",
        "Construction equipment visible in imagery",
        "Vegetation removal along natural bank",
        "Altered drainage patterns affecting upstream flow",
      ],
      recommendations: [
        "Coordinate with NRCC for immediate field verification",
        "Document baseline river boundary from 2016 JRC data",
        "Identify land ownership through DC office records",
        "Consider filing case under River Protection Act",
        "Install monitoring camera for evidence collection",
      ],
      encroachmentType: "commercial",
    },
    validations: 8,
  },
  {
    id: "EVD-2026-003",
    type: "erosion",
    title: "Riverbank Collapse - Jamuna River",
    description:
      "Severe bank collapse observed after recent flooding. Multiple homes at risk. Visible cracks extending 50+ meters inland.",
    location: {
      name: "Sirajganj, Jamuna",
      lat: 24.455,
      lng: 89.725,
    },
    submittedBy: "Local Union Parishad",
    submittedAt: "2026-03-05T16:45:00Z",
    status: "verified",
    severity: "critical",
    confidence: 0.91,
    imageUrl: "/assets/erosion_comparison.png",
    aiAnalysis: {
      summary:
        "Critical erosion zone identified with active bank collapse. SAR coherence analysis shows 45m retreat in past 12 months. 125 households at immediate risk within 100m buffer zone. Emergency intervention required.",
      detectedIssues: [
        "Active bank collapse with 45m annual retreat rate",
        "Tension cracks visible extending 50m inland",
        "Undermining of bank toe detected via SAR",
        "125 structures within high-risk buffer zone",
        "Sediment plume indicates ongoing erosion",
      ],
      recommendations: [
        "Immediate evacuation advisory for at-risk households",
        "Emergency sandbagging of vulnerable sections",
        "Coordinate with BWDB for geo-bag installation",
        "Establish monitoring transects for velocity tracking",
        "Initiate relocation program for affected families",
      ],
      erosionType: "bank_collapse",
    },
    validations: 23,
  },
  {
    id: "EVD-2026-004",
    type: "pollution",
    title: "Textile Dye Discharge - Shitalakshya",
    description:
      "Bright blue/purple water observed downstream of textile zone. Multiple discharge pipes visible. Fish kill reported by local fishermen.",
    location: {
      name: "Narayanganj, Shitalakshya",
      lat: 23.625,
      lng: 90.519,
    },
    submittedBy: "Fisher Community Association",
    submittedAt: "2026-03-02T11:20:00Z",
    status: "pending",
    severity: "high",
    confidence: 0.82,
    imageUrl: "/assets/polluted_river.png",
    aiAnalysis: {
      summary:
        "Textile dyeing pollution detected with characteristic blue-purple spectral signature. Multiple discharge points identified. Downstream plume extends approximately 2.5km. Significant impact on aquatic ecosystem.",
      detectedIssues: [
        "Distinctive textile dye coloration (indigo/reactive dyes)",
        "Multiple visible discharge pipes",
        "Pollution plume extending 2.5km downstream",
        "Reported fish mortality",
        "Elevated dissolved solids detected via turbidity index",
      ],
      recommendations: [
        "Water quality sampling at multiple points",
        "Trace discharge pipes to source factories",
        "Document fish kill with photographic evidence",
        "Coordinate with DoE for compliance inspection",
        "Consider effluent treatment requirement enforcement",
      ],
      spectralIndicators: "Blue band anomaly, NDTI: 0.65, Thermal: +3°C",
      pollutionType: "textile",
    },
    validations: 5,
    nearbyFactories: [
      {
        name: "Apex Dyeing Ltd",
        type: "Textile",
        distance: 85,
        attribution: 52,
      },
      {
        name: "Rainbow Garments",
        type: "Textile",
        distance: 210,
        attribution: 28,
      },
      {
        name: "Eastern Textiles",
        type: "Textile",
        distance: 340,
        attribution: 12,
      },
    ],
  },
  {
    id: "EVD-2026-005",
    type: "encroachment",
    title: "Residential Construction - Buriganga",
    description:
      "New residential buildings observed within river boundary. Appears to be multi-story development. No visible permits displayed.",
    location: {
      name: "Kamrangirchar, Dhaka",
      lat: 23.717,
      lng: 90.383,
    },
    submittedBy: "Anonymous Citizen",
    submittedAt: "2026-02-28T08:30:00Z",
    status: "resolved",
    severity: "medium",
    confidence: 0.76,
    imageUrl: "/assets/dashboard_mockup.png",
    aiAnalysis: {
      summary:
        "Unauthorized residential construction detected within demarcated river boundary. Building footprint extends approximately 15m into historical flood zone. Pattern consistent with incremental encroachment typical of this area.",
      detectedIssues: [
        "Multi-story construction within river boundary",
        "Building extends 15m into flood zone",
        "No visible construction permits",
        "Altered drainage affecting neighboring areas",
        "Pattern consistent with organized land grabbing",
      ],
      recommendations: [
        "Cross-reference with RAJUK approved building plans",
        "Check land deed against river boundary survey",
        "Document construction timeline via satellite archive",
        "Coordinate with local police for site inspection",
        "Consider demolition order if unauthorized",
      ],
      encroachmentType: "residential",
    },
    validations: 3,
  },
];

// Helper function to get report by ID
export function getReportById(id: string): EvidenceReport | undefined {
  return evidenceReports.find((report) => report.id === id);
}

// Helper function to get reports by type
export function getReportsByType(
  type: "pollution" | "encroachment" | "erosion",
): EvidenceReport[] {
  return evidenceReports.filter((report) => report.type === type);
}

// Helper function to get recent reports
export function getRecentReports(count: number = 5): EvidenceReport[] {
  return [...evidenceReports]
    .sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    )
    .slice(0, count);
}

// Statistics
export const evidenceStats = {
  totalReports: evidenceReports.length,
  byType: {
    pollution: evidenceReports.filter((r) => r.type === "pollution").length,
    encroachment: evidenceReports.filter((r) => r.type === "encroachment")
      .length,
    erosion: evidenceReports.filter((r) => r.type === "erosion").length,
  },
  byStatus: {
    pending: evidenceReports.filter((r) => r.status === "pending").length,
    verified: evidenceReports.filter((r) => r.status === "verified").length,
    investigating: evidenceReports.filter((r) => r.status === "investigating")
      .length,
    resolved: evidenceReports.filter((r) => r.status === "resolved").length,
  },
  criticalAlerts: evidenceReports.filter((r) => r.severity === "critical")
    .length,
  totalValidations: evidenceReports.reduce((sum, r) => sum + r.validations, 0),
};
