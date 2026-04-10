#!/usr/bin/env python3
"""
Fix encroachment.json:
  1. Correct marker positions for ENC-001 (Sadarghat) and ENC-002 (Aminbazar)
     using confirmed OSM river centerline positions
  2. Regenerate boundary_2016 and boundary_2026 for ENC-001, ENC-002, ENC-003
     from dense OSM way data with proper perpendicular bank offsets
  3. Fix severity: ENC-002 → "high", ENC-003 → "moderate"
  4. Update statistics.total_critical accordingly

Confirmed OSM data:
  Buriganga way 829191016: 95 pts, Sadarghat area at lat 23.707-23.710, lng 90.381-90.401
  Turag way 1072292567: 151 pts, Aminbazar area at lat 23.785-23.880, lng 90.336-90.351
  Balu way 31159486: 275 pts, Demra area at lat 23.73-23.80, lng 90.46-90.50
"""

import json
import math
import urllib.request
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "src" / "data"


def fetch_way(way_id: int) -> list:
    """Return [[lng, lat], ...] from OSM API."""
    url = f"https://api.openstreetmap.org/api/0.6/way/{way_id}/full.json"
    req = urllib.request.Request(url, headers={"User-Agent": "NodiWatch-v2/1.0"})
    with urllib.request.urlopen(req, timeout=20) as r:
        d = json.load(r)
    nodes = {n["id"]: (n["lat"], n["lon"]) for n in d["elements"] if n["type"] == "node"}
    coords = []
    for el in d["elements"]:
        if el["type"] == "way":
            for nid in el["nodes"]:
                if nid in nodes:
                    lat, lng = nodes[nid]
                    coords.append([lng, lat])
    return coords


def haversine_m(lat1, lng1, lat2, lng2) -> float:
    R = 6_371_000
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
    return R * 2 * math.asin(math.sqrt(a))


def local_centerline(coords: list, marker_lat: float, marker_lng: float,
                     window_deg: float = 0.012) -> list:
    """Return coords within window degrees of marker, sorted by distance."""
    nearby = [c for c in coords
              if abs(c[1] - marker_lat) < window_deg and abs(c[0] - marker_lng) < window_deg]
    nearby.sort(key=lambda c: haversine_m(c[1], c[0], marker_lat, marker_lng))
    return nearby


def tangent_unit(coords: list, idx: int) -> tuple:
    """Unit tangent vector (dlng, dlat) along the polyline at index idx."""
    n = len(coords)
    if n < 2:
        return (1.0, 0.0)
    if idx == 0:
        p0, p1 = coords[0], coords[1]
    elif idx >= n - 1:
        p0, p1 = coords[-2], coords[-1]
    else:
        p0, p1 = coords[idx - 1], coords[idx + 1]
    dlng = p1[0] - p0[0]
    dlat = p1[1] - p0[1]
    mag = math.hypot(dlng, dlat)
    return (dlng / mag, dlat / mag) if mag > 1e-12 else (1.0, 0.0)


def bank_offset(lng: float, lat: float, tangent: tuple,
                offset_m: float, side: str = "right") -> list:
    """
    Offset a centerline point perpendicular by offset_m meters.
    side="right" → right-hand side of travel direction.
    """
    tx, ty = tangent
    # Right-perpendicular: rotate CW → (ty, -tx)
    px, py = (ty, -tx) if side == "right" else (-ty, tx)

    meters_per_deg_lng = 111_000 * math.cos(math.radians(lat))
    meters_per_deg_lat = 111_000

    off_lng = offset_m * px / meters_per_deg_lng
    off_lat = offset_m * py / meters_per_deg_lat
    return [round(lng + off_lng, 7), round(lat + off_lat, 7)]


def generate_boundaries(local_cl: list, width_2016: float, width_2026: float,
                        n_pts: int = 18) -> tuple:
    """
    Generate (boundary_2016, boundary_2026) as right-bank offsets.
    Selects n_pts evenly spaced from local_cl (already sorted by distance).
    """
    # Sort by lat to get ordered path (river direction)
    ordered = sorted(local_cl, key=lambda c: c[1])

    # Subsample to n_pts
    if len(ordered) > n_pts:
        step = len(ordered) / n_pts
        sampled = [ordered[int(i * step)] for i in range(n_pts)]
    else:
        sampled = ordered

    b2016, b2026 = [], []
    for i, c in enumerate(sampled):
        tan = tangent_unit(sampled, i)
        b2016.append(bank_offset(c[0], c[1], tan, width_2016 / 2, side="right"))
        b2026.append(bank_offset(c[0], c[1], tan, width_2026 / 2, side="right"))

    return b2016, b2026


def main():
    enc = json.loads((DATA_DIR / "encroachment.json").read_text())

    # Fetch dense river data
    print("Fetching OSM way data...")
    print("  Buriganga (way 829191016)...", end=" ", flush=True)
    buri_coords = fetch_way(829191016)
    print(f"{len(buri_coords)} pts")

    print("  Turag (way 1072292567)...", end=" ", flush=True)
    turag_coords = fetch_way(1072292567)
    print(f"{len(turag_coords)} pts")

    print("  Balu (way 31159486)...", end=" ", flush=True)
    balu_coords = fetch_way(31159486)
    print(f"{len(balu_coords)} pts")

    # Correct marker positions (confirmed from OSM geometry)
    CORRECTED = {
        "ENC-001": {"lat": 23.7096294, "lng": 90.3917527},   # Buriganga at Sadarghat ferry terminal
        "ENC-002": {"lat": 23.8502000, "lng": 90.3389000},   # Turag near Aminbazar/Gabtali
    }

    # River data per segment
    SEG_DATA = {
        "ENC-001": {"coords": buri_coords, "river": "Buriganga"},
        "ENC-002": {"coords": turag_coords, "river": "Turag"},
        "ENC-003": {"coords": balu_coords, "river": "Balu"},
    }

    for seg in enc["segments"]:
        sid = seg["id"]
        if sid not in SEG_DATA:
            print(f"  SKIP {sid} — not in target set")
            continue

        # Apply corrected marker position if available
        if sid in CORRECTED:
            seg["lat"] = CORRECTED[sid]["lat"]
            seg["lng"] = CORRECTED[sid]["lng"]
            print(f"  {sid}: marker corrected → lat={seg['lat']}, lng={seg['lng']}")

        coords = SEG_DATA[sid]["coords"]
        marker_lat, marker_lng = seg["lat"], seg["lng"]
        w2016 = seg.get("width_2016_m", seg.get("width_2016", 200))
        w2026 = seg.get("width_2026_m", seg.get("width_2026", 150))

        # Find local centerline with adaptive window
        for window in [0.012, 0.020, 0.035]:
            local = local_centerline(coords, marker_lat, marker_lng, window_deg=window)
            if len(local) >= 8:
                break

        if len(local) < 4:
            print(f"  WARN {sid}: only {len(local)} local pts found — skipping boundary update")
            continue

        # Use closest 20 pts (most relevant section)
        local = local[:20]

        b2016, b2026 = generate_boundaries(local, w2016, w2026, n_pts=min(18, len(local)))
        seg["boundary_2016"] = b2016
        seg["boundary_2026"] = b2026

        # Verify offset distances
        if b2016:
            dist_2016 = haversine_m(b2016[0][1], b2016[0][0], local[0][1], local[0][0])
            dist_2026 = haversine_m(b2026[0][1], b2026[0][0], local[0][1], local[0][0])
            print(f"  {sid} ({SEG_DATA[sid]['river']}): {len(b2016)} pts | "
                  f"offset 2016={dist_2016:.0f}m (exp {w2016/2:.0f}m), "
                  f"2026={dist_2026:.0f}m (exp {w2026/2:.0f}m)")

    # Fix severity
    for seg in enc["segments"]:
        if seg["id"] == "ENC-002":
            seg["severity"] = "high"
            print("  ENC-002 severity: critical → high")
        elif seg["id"] == "ENC-003":
            seg["severity"] = "moderate"
            print("  ENC-003 severity: critical → moderate")

    # Update statistics
    enc["statistics"]["total_critical"] = sum(1 for s in enc["segments"] if s["severity"] == "critical")
    enc["statistics"]["total_high"] = sum(1 for s in enc["segments"] if s["severity"] == "high")
    print(f"  Statistics: critical={enc['statistics']['total_critical']}, "
          f"high={enc['statistics'].get('total_high', 0)}, "
          f"moderate={sum(1 for s in enc['segments'] if s['severity'] == 'moderate')}")

    (DATA_DIR / "encroachment.json").write_text(
        json.dumps(enc, indent=2, ensure_ascii=False)
    )
    print("✓ encroachment.json saved")


if __name__ == "__main__":
    main()
