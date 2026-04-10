import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json({
    name: "NodiWatch API",
    version: "2.0.0",
    endpoints: {
      "/api/dynamic":
        "Real-time waterways + factories + hotspots for any Bangladesh bbox",
      "/api/waterways": "Real OSM river/canal geometries for a bbox",
      "/api/factories": "Real industrial facilities from OpenStreetMap",
      "/api/pollution": "Cached pollution hotspots with spectral indices",
      "/api/attribution": "Bayesian factory attribution for a hotspot",
      "/api/rivers": "Monitored river data (hardcoded Dhaka set)",
      "/api/stats": "Dashboard statistics",
      "/api/verify_satellite":
        "Real Sentinel-2 scene metadata via Planetary Computer",
      "/api/gee-pollution":
        "Live Google Earth Engine pollution tile URL (Red/Blue ratio)",
      "/api/gee-water":
        "Live Google Earth Engine water segmentation tile URL (MNDWI)",
      "/api/gee-erosion":
        "Live Google Earth Engine SAR erosion tile URL (Sentinel-1)",
      "/api/geo":
        "Frontend compatibility route with resilient waterways + overlays payload",
      "/api/geo/verify":
        "Frontend compatibility route for satellite verification",
      "/api/gee/pollution":
        "Frontend compatibility route returning pollution spectral tiles",
      "/api/gee/water":
        "Frontend compatibility route returning 2016/2026 water masks",
      "/api/gee/erosion":
        "Frontend compatibility route returning SAR erosion tiles",
      "/api/gee/uhi":
        "Urban Heat Island intelligence tiles + summary + ward signals",
      "/api/gee/waterlogging":
        "Waterlogging intelligence tiles + summary + ward signals",
      "/api/gee/air-quality":
        "Air quality burden tiles + summary + ward signals",
      "/api/gee/green-canopy":
        "Green canopy index tiles + summary + ward signals",
      "/api/analytics/ward-scores":
        "Ward-normalized risk scores for uhi|flood|air|green",
      "/api/analytics/road-flood-risk":
        "Road passability risk list derived from flood ward scores",
    },
  });
}
