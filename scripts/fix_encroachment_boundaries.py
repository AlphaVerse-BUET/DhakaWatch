#!/usr/bin/env python3
"""
Regenerate encroachment boundary_2016 and boundary_2026 coordinate arrays
so they trace actual river bank positions rather than floating on land.

Approach:
  For each segment, find the local river centerline near the marker,
  compute the perpendicular bank direction, and offset both boundary
  lines by the correct distance (half the respective river width).

  boundary_2016 = right bank in 2016 (width_2016/2 m offset from center)
  boundary_2026 = right bank in 2026 (width_2026/2 m offset — narrower)

Both lines trace real river geometry. The gap between them shows encroachment.
"""

import json
import math
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "src" / "data"

DEG_PER_METER_LAT = 1 / 111_000          # ~constant
def deg_per_meter_lng(lat_deg: float) -> float:
    return 1 / (111_000 * math.cos(math.radians(lat_deg)))


def find_local_centerline(river_coords: list, marker_lat: float, marker_lng: float,
                           window: float = 0.025) -> list:
    """Return centerline points within `window` degrees of marker."""
    return [c for c in river_coords
            if abs(c[1] - marker_lat) < window and abs(c[0] - marker_lng) < window]


def tangent_at_point(coords: list, idx: int) -> tuple:
    """Unit tangent vector (dlng, dlat) at coords[idx]."""
    if len(coords) < 2:
        return (1.0, 0.0)
    if idx == 0:
        p0, p1 = coords[0], coords[1]
    elif idx >= len(coords) - 1:
        p0, p1 = coords[-2], coords[-1]
    else:
        p0, p1 = coords[idx - 1], coords[idx + 1]
    dlng = p1[0] - p0[0]
    dlat = p1[1] - p0[1]
    mag = math.hypot(dlng, dlat)
    if mag < 1e-12:
        return (1.0, 0.0)
    return (dlng / mag, dlat / mag)


def offset_coord(lng: float, lat: float, tangent: tuple,
                 offset_m: float, side: str = "right") -> list:
    """
    Offset a point perpendicular to `tangent` by `offset_m` meters.
    side="right" → right-hand side of travel direction (east for N→S river).
    side="left"  → left-hand side.
    """
    tx, ty = tangent          # (dlng, dlat)
    # Perpendicular (right): rotate tangent 90° clockwise → (ty, -tx)
    px, py = ty, -tx
    if side == "left":
        px, py = -ty, tx

    off_lng = offset_m * deg_per_meter_lng(lat)
    off_lat = offset_m * DEG_PER_METER_LAT
    return [round(lng + px * off_lng, 7), round(lat + py * off_lat, 7)]


def generate_boundary(local_cl: list, width_m: float, side: str = "right",
                      n_pts: int = 10) -> list:
    """
    Generate n_pts bank positions along the local centerline,
    each offset perpendicular by width_m/2.
    """
    # Subsample centerline to n_pts
    step = max(1, len(local_cl) // n_pts)
    sampled = local_cl[::step][:n_pts]
    if len(sampled) < 2:
        sampled = local_cl[:n_pts] if len(local_cl) >= 2 else local_cl

    offset_m = width_m / 2
    result = []
    for i, c in enumerate(sampled):
        tan = tangent_at_point(sampled, i)
        result.append(offset_coord(c[0], c[1], tan, offset_m, side=side))
    return result


def main():
    rivers_data = json.loads((DATA_DIR / "rivers.json").read_text())
    enc_data    = json.loads((DATA_DIR / "encroachment.json").read_text())

    # Build river coordinate lookup: river_id → [[lng, lat], ...]
    river_coords = {}
    for feat in rivers_data["features"]:
        rid = feat["properties"]["id"]
        river_coords[rid] = feat["geometry"]["coordinates"]

    # River ID mapping from segment river name to rivers.json id
    name_to_id = {
        "Buriganga":    "buriganga",
        "Turag":        "turag",
        "Balu":         "balu",
        "Shitalakshya": "shitalakshya",
        "Dhaleshwari":  "dhaleshwari",
    }

    for seg in enc_data["segments"]:
        river_name = seg["river"]
        rid = name_to_id.get(river_name)
        if not rid or rid not in river_coords:
            print(f"  SKIP {seg['id']}: no river coords for '{river_name}'")
            continue

        coords = river_coords[rid]
        marker_lat = seg["lat"]
        marker_lng = seg["lng"]

        local_cl = find_local_centerline(coords, marker_lat, marker_lng, window=0.025)
        if len(local_cl) < 2:
            # Widen search window
            local_cl = find_local_centerline(coords, marker_lat, marker_lng, window=0.05)
        if len(local_cl) < 2:
            print(f"  WARN {seg['id']}: fewer than 2 local centerline points — skipping")
            continue

        w2016 = seg.get("width_2016_m", seg.get("width_2016", 200))
        w2026 = seg.get("width_2026_m", seg.get("width_2026", 150))

        # Use right bank (encroachment measured on one consistent side)
        seg["boundary_2016"] = generate_boundary(local_cl, w2016, side="right", n_pts=10)
        seg["boundary_2026"] = generate_boundary(local_cl, w2026, side="right", n_pts=10)

        print(f"  ✓ {seg['id']} ({river_name}): boundary_2016={len(seg['boundary_2016'])} pts "
              f"[{w2016}m → {w2026}m, offset {w2016/2:.0f}m → {w2026/2:.0f}m]")

    (DATA_DIR / "encroachment.json").write_text(
        json.dumps(enc_data, indent=2, ensure_ascii=False)
    )
    print("✓ encroachment.json updated")


if __name__ == "__main__":
    main()
