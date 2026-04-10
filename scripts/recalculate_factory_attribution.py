#!/usr/bin/env python3
"""
Recalculate factory attribution probabilities using the same Bayesian model
as the backend, but with sigmoid compression to avoid 95%+ crowding.

The compressed score reflects "risk of being a significant polluter source"
on a 15-72% range — more honest than 9-95%.
"""

import json
import math
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "src" / "data"


def haversine(lat1, lng1, lat2, lng2) -> float:
    R = 6_371_000
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
    return R * 2 * math.asin(math.sqrt(a))


INDUSTRY_PROFILE = {
    "textile":       {"ndti": 0.6, "cdom": 0.3, "rb": 0.9},
    "tannery":       {"ndti": 0.9, "cdom": 0.9, "rb": 0.4},
    "dyeing":        {"ndti": 0.5, "cdom": 0.4, "rb": 0.95},
    "garment":       {"ndti": 0.4, "cdom": 0.3, "rb": 0.7},
    "chemical":      {"ndti": 0.7, "cdom": 0.5, "rb": 0.3},
    "pharmaceutical":{"ndti": 0.5, "cdom": 0.6, "rb": 0.2},
    "food":          {"ndti": 0.6, "cdom": 0.8, "rb": 0.2},
    "paper":         {"ndti": 0.7, "cdom": 0.7, "rb": 0.3},
    "unknown":       {"ndti": 0.5, "cdom": 0.5, "rb": 0.5},
}


def sigmoid_compress(x: float) -> float:
    """Map 0-1 probability to 0.15-0.72 range (realistic uncertainty floor/ceiling)."""
    # Sigmoid centered at 0.5, compress output to [0.15, 0.72]
    s = 1 / (1 + math.exp(-4 * (x - 0.5)))
    return 0.15 + s * 0.57   # maps sigmoid output [~0, ~1] → [0.15, 0.72]


def bayesian_score(factory_lat, factory_lng, industry_type,
                   hotspot_lat, hotspot_lng) -> float:
    dist = haversine(factory_lat, factory_lng, hotspot_lat, hotspot_lng)
    if dist < 1:
        dist = 1
    distance_prior = 1.0 / (dist / 100) ** 2
    p = INDUSTRY_PROFILE.get(industry_type, INDUSTRY_PROFILE["unknown"])
    spectral_likelihood = (p["ndti"] + p["cdom"] + p["rb"]) / 3
    return spectral_likelihood * distance_prior


def main():
    factories_data  = json.loads((DATA_DIR / "factories.json").read_text())
    hotspots_data   = json.loads((DATA_DIR / "pollution-hotspots.json").read_text())

    factories = factories_data["factories"]
    hotspots  = hotspots_data["hotspots"]

    # For each factory, find its nearest hotspot and compute Bayesian score
    for f in factories:
        nearest_hs = min(
            hotspots,
            key=lambda h: haversine(f["lat"], f["lng"], h["lat"], h["lng"])
        )
        raw = bayesian_score(
            f["lat"], f["lng"],
            f.get("industry_type", "unknown"),
            nearest_hs["lat"], nearest_hs["lng"],
        )

        # Normalize by sum over all factories near this hotspot (within 3km)
        nearby = [
            factory for factory in factories
            if haversine(factory["lat"], factory["lng"], nearest_hs["lat"], nearest_hs["lng"]) < 3000
        ]
        total = sum(
            bayesian_score(nf["lat"], nf["lng"], nf.get("industry_type", "unknown"),
                           nearest_hs["lat"], nearest_hs["lng"])
            for nf in nearby
        ) or 1

        # Add regularization background (5% of max raw)
        max_raw = max(
            bayesian_score(nf["lat"], nf["lng"], nf.get("industry_type", "unknown"),
                           nearest_hs["lat"], nearest_hs["lng"])
            for nf in nearby
        ) if nearby else 1
        background = 0.05 * max_raw
        normalized = (raw + background) / (total + background * len(nearby))

        # Sigmoid compression to 15-72% range
        compressed_pct = round(sigmoid_compress(normalized) * 100)
        f["attribution"] = compressed_pct

    factories_data["factories"] = factories
    (DATA_DIR / "factories.json").write_text(
        json.dumps(factories_data, indent=2, ensure_ascii=False)
    )

    attributions = [f["attribution"] for f in factories]
    print(f"✓ Updated {len(factories)} factory attribution scores")
    print(f"  Range: {min(attributions)}% – {max(attributions)}%")
    print(f"  Mean:  {sum(attributions)/len(attributions):.1f}%")


if __name__ == "__main__":
    main()
