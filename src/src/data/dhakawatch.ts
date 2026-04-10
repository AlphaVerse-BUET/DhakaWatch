import {
  Droplets,
  Factory,
  LandPlot,
  Mountain,
  Waves,
} from "lucide-react";
import type { Alert } from "@/components/AlertsPanel";

export const dhakaPulseCards = [
  {
    title: "Buriganga NDTI Index",
    value: "0.31",
    subtitle: "Moderate-high turbidity — tannery discharge risk",
    icon: Droplets,
    color: "red" as const,
  },
  {
    title: "Active Encroachment Sites",
    value: "12",
    subtitle: "Confirmed illegal land-fill boundaries detected",
    icon: LandPlot,
    color: "orange" as const,
  },
  {
    title: "Erosion Risk Corridors",
    value: "5",
    subtitle: "High-risk SAR-confirmed bank retreat zones",
    icon: Mountain,
    color: "yellow" as const,
  },
  {
    title: "Rivers Monitored",
    value: "6",
    subtitle: "Buriganga, Turag, Shitalakshya, Balu, Dhaleshwari, Jamuna",
    icon: Waves,
    color: "teal" as const,
  },
];

export const dhakaCityLayers = [
  {
    title: "Pollution Layer",
    description:
      "NDTI, CDOM and Red/Blue ratio fingerprinting identifies industrial discharge hotspots at 10m resolution.",
    icon: Factory,
    accent: "from-red-500/20 to-orange-500/10",
  },
  {
    title: "Encroachment Layer",
    description:
      "MNDWI temporal differencing compares 2016 vs 2026 water boundaries to detect illegal land filling.",
    icon: LandPlot,
    accent: "from-purple-500/20 to-pink-500/10",
  },
  {
    title: "Erosion Layer",
    description:
      "Sentinel-1 SAR coherence analysis detects riverbank retreat from pre/post-monsoon radar backscatter.",
    icon: Mountain,
    accent: "from-orange-500/20 to-yellow-500/10",
  },
];

export const dhakaAlerts: Alert[] = [
  {
    id: "NW-001",
    type: "critical",
    title: "High NDTI detected in Buriganga",
    location: "Hazaribagh industrial zone",
    time: "12 min ago",
    description:
      "Tannery discharge spectral signature confirmed via NDTI > 0.35 and elevated CDOM in latest Sentinel-2 pass.",
  },
  {
    id: "NW-002",
    type: "warning",
    title: "Encroachment boundary shift",
    location: "Turag river — Tongi sector",
    time: "31 min ago",
    description:
      "MNDWI temporal differencing shows 8m narrowing of water boundary compared to 2016 baseline.",
  },
  {
    id: "NW-003",
    type: "info",
    title: "Erosion monitoring update",
    location: "Jamuna corridor, Sirajganj",
    time: "1 hour ago",
    description:
      "SAR coherence analysis shows moderate bank retreat; no immediate structural risk flagged.",
  },
  {
    id: "NW-004",
    type: "success",
    title: "Citizen evidence validated",
    location: "Buriganga, Kamrangirchar",
    time: "2 hours ago",
    description:
      "Photo evidence classified as solid waste discharge by Gemini Vision and routed to enforcement queue.",
  },
];
