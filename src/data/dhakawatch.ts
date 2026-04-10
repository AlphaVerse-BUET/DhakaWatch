import {
  Activity,
  Brain,
  Droplets,
  Globe2,
  MapPinned,
  ShieldAlert,
  Sparkles,
  Trees,
  Waves,
} from "lucide-react";
import type { Alert } from "@/components/AlertsPanel";

export const dhakaPulseCards = [
  {
    title: "Current AQI",
    value: "168",
    subtitle: "Unhealthy for sensitive groups",
    icon: Activity,
    color: "red" as const,
    change: { value: 6, isPositive: false },
  },
  {
    title: "Urban Heat Gap",
    value: "+3.8°C",
    subtitle: "Old Dhaka vs. Ramna green belt",
    icon: Sparkles,
    color: "orange" as const,
    change: { value: 3, isPositive: false },
  },
  {
    title: "Waterlogging Risk",
    value: "High",
    subtitle: "Drainage bottlenecks detected in pilot wards",
    icon: Droplets,
    color: "blue" as const,
    change: { value: 11, isPositive: false },
  },
  {
    title: "Canals & Lakes Monitored",
    value: "26",
    subtitle: "Hatirjheel, Banani Lake, and major khals",
    icon: Waves,
    color: "teal" as const,
  },
];

export const dhakaCityLayers = [
  {
    title: "Heat Layer",
    description:
      "Pinpoints urban heat islands across dense wards and construction-heavy corridors.",
    icon: Sparkles,
    accent: "from-orange-500/20 to-red-500/10",
  },
  {
    title: "Blue-Green Layer",
    description:
      "Tracks NDVI, canal health, and vegetation buffers around drainage networks.",
    icon: Trees,
    accent: "from-teal-500/20 to-blue-500/10",
  },
  {
    title: "Flood Layer",
    description:
      "Highlights low-lying roads and sinks likely to submerge after short rain bursts.",
    icon: ShieldAlert,
    accent: "from-blue-500/20 to-cyan-500/10",
  },
];

export const dhakaAlerts: Alert[] = [
  {
    id: "DW-001",
    type: "critical",
    title: "Drainage blockage detected",
    location: "Dhanmondi 27, Ward 15",
    time: "12 min ago",
    description:
      "Citizen photo and rainfall routing model point to a high submergence risk within the next 30 minutes.",
  },
  {
    id: "DW-002",
    type: "warning",
    title: "Canal narrowing observed",
    location: "Ramchandrapur Khal corridor",
    time: "31 min ago",
    description:
      "Before/after imagery suggests a measurable reduction in water surface area near new construction.",
  },
  {
    id: "DW-003",
    type: "info",
    title: "Cool corridor performing well",
    location: "Ramna green belt",
    time: "1 hour ago",
    description:
      "Vegetation retention and lower surface temperatures remain above the city baseline.",
  },
  {
    id: "DW-004",
    type: "success",
    title: "Citizen report triaged",
    location: "Banani Lake edge",
    time: "2 hours ago",
    description:
      "Uploaded evidence was classified as solid waste and routed into the daily mayor briefing queue.",
  },
];

export const tokyoComparison = [
  {
    label: "Green space per resident",
    dhaka: "Lower",
    tokyo: "3x higher",
    note: "DhakaWatch uses this gap to justify ward-level cooling interventions.",
    icon: Trees,
  },
  {
    label: "Flood response signal",
    dhaka: "Predictive",
    tokyo: "Highly engineered",
    note: "The demo frames Dhaka as a digital twin challenge with direct urban operations.",
    icon: MapPinned,
  },
  {
    label: "Citizen reporting",
    dhaka: "Bangla-first",
    tokyo: "Multilingual ops",
    note: "Reports are summarized into one daily action brief for planners.",
    icon: Globe2,
  },
  {
    label: "AI assistant",
    dhaka: "DhakaWatch Copilot",
    tokyo: "Urban analytics",
    note: "Gemini stays server-side and powers image classification plus route-aware guidance.",
    icon: Brain,
  },
];
