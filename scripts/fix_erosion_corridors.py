#!/usr/bin/env python3
"""
Realign erosion corridor polylines to follow actual river banks.

For each corridor (except E001 Sirajganj/Jamuna which is already correct):
  1. Find river centerline points within the corridor bounding box
  2. Replace coordinates with consecutive bank-offset points along the real centerline
  3. Offset ~30-50m from centerline onto the bank being eroded

E001 (Sirajganj, Jamuna river at [89.705, 24.46]) — DO NOT TOUCH, correct location.
"""

import json
import math
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "src" / "data"

DEG_PER_METER_LAT = 1 / 111_000
def deg_per_meter_lng(lat_deg: float) -> float:
    return 1 / (111_000 * math.cos(math.radians(lat_deg)))


def find_centerline_in_bbox(river_coords: list, min_lat: float, max_lat: float,
                             min_lng: float, max_lng: float) -> list:
    return [c for c in river_coords
            if min_lat <= c[1] <= max_lat and min_lng <= c[0] <= max_lng]


def tangent_at(coords: list, idx: int) -> tuple:
    if len(coords) < 2:
        return (1.0, 0.0)
    if idx == 0:
        p0, p1 = coords[0], coords[1]
    elif idx >= len(coords) - 1:
        p0, p1 = coords[-2], coords[-1]
    else:
        p0, p1 = coords[idx - 1], coords[idx + 1]
    dlng, dlat = p1[0] - p0[0], p1[1] - p0[1]
    mag = math.hypot(dlng, dlat)
    return (dlng / mag, dlat / mag) if mag > 1e-12 else (1.0, 0.0)


def offset_bank(lng: float, lat: float, tangent: tuple, offset_m: float) -> list:
    """Offset right-bank from centerline by offset_m meters."""
    tx, ty = tangent
    px, py = ty, -tx   # right-perpendicular
    return [
        round(lng + px * offset_m * deg_per_meter_lng(lat), 7),
        round(lat + py * offset_m * DEG_PER_METER_LAT, 7),
    ]


def build_corridor(cl: list, offset_m: float, n_pts: int = 10) -> list:
    """Build n_pts bank-offset points along the centerline segment."""
    if len(cl) < 2:
        return cl
    step = max(1, (len(cl) - 1) // (n_pts - 1))
    sampled = []
    for i in range(0, len(cl), step):
        sampled.append(cl[i])
        if len(sampled) >= n_pts:
            break
    if len(sampled) < n_pts and cl[-1] not in sampled:
        sampled.append(cl[-1])

    result = []
    for i, c in enumerate(sampled):
        tan = tangent_at(sampled, i)
        result.append(offset_bank(c[0], c[1], tan, offset_m))
    return result


def main():
    rivers_data = json.loads((DATA_DIR / "rivers.json").read_text())
    ero_data    = json.loads((DATA_DIR / "erosion-corridors.json").read_text())

    river_coords = {
        feat["properties"]["id"]: feat["geometry"]["coordinates"]
        for feat in rivers_data["features"]
    }

    name_to_id = {
        "Buriganga":    "buriganga",
        "Turag":        "turag",
        "Balu":         "balu",
        "Shitalakshya": "shitalakshya",
        "Dhaleshwari":  "dhaleshwari",
        "Jamuna":       None,   # not in rivers.json — leave E001 unchanged
    }

    for corridor in ero_data["corridors"]:
        cid = corridor["id"]
        river_name = corridor.get("river", "")
        rid = name_to_id.get(river_name)

        if rid is None:
            # E001 Sirajganj/Jamuna — already in correct location
            print(f"  SKIP {cid} ({river_name}): no river in static data — preserving original")
            continue

        if rid not in river_coords:
            print(f"  SKIP {cid}: river '{rid}' not found")
            continue

        coords = river_coords[rid]
        existing = corridor["coordinates"]

        # Determine search bbox from existing coordinates + 0.05° padding
        lats = [c[1] for c in existing]
        lngs = [c[0] for c in existing]
        min_lat, max_lat = min(lats) - 0.03, max(lats) + 0.03
        min_lng, max_lng = min(lngs) - 0.03, max(lngs) + 0.03

        local_cl = find_centerline_in_bbox(coords, min_lat, max_lat, min_lng, max_lng)

        if len(local_cl) < 2:
            # Expand bbox
            local_cl = find_centerline_in_bbox(
                coords, min_lat - 0.05, max_lat + 0.05, min_lng - 0.05, max_lng + 0.05
            )

        if len(local_cl) < 2:
            print(f"  WARN {cid}: not enough local centerline pts — skipping")
            continue

        # Erosion bank offset: ~40m from centerline (erosion strip width)
        new_coords = build_corridor(local_cl, offset_m=40, n_pts=10)
        corridor["coordinates"] = new_coords

        print(f"  ✓ {cid} ({river_name}): {len(existing)} pts → {len(new_coords)} pts "
              f"(bank-aligned, 40m offset)")

    (DATA_DIR / "erosion-corridors.json").write_text(
        json.dumps(ero_data, indent=2, ensure_ascii=False)
    )
    print("✓ erosion-corridors.json updated")


if __name__ == "__main__":
    main()
