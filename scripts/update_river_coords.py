#!/usr/bin/env python3
"""
Fetches real river geometries from OSM API and updates all static JSON data files
so that river lines align with actual waterways on satellite basemap.

Rivers updated:
  Buriganga    → OSM way 829191016
  Turag        → OSM ways 24226201 + 610179607 (combined north + south sections)
  Balu         → OSM way 31159486
  Shitalakshya → OSM way 30670081
  Dhaleshwari  → OSM way 929186912
"""

import json
import time
import urllib.request
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "src" / "data"

# ── OSM fetch ──────────────────────────────────────────────────────────────

def fetch_way(way_id: int) -> list:
    """Return [[lng, lat], ...] for an OSM way, ordered along the way."""
    url = f"https://api.openstreetmap.org/api/0.6/way/{way_id}/full.json"
    req = urllib.request.Request(url, headers={"User-Agent": "NodiWatch-updater/1.0"})
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


def subsample(coords: list, n: int = 40) -> list:
    """Pick n evenly-spaced points from coords."""
    if len(coords) <= n:
        return coords
    step = (len(coords) - 1) / (n - 1)
    return [coords[round(i * step)] for i in range(n)]


# ── Snap helper ─────────────────────────────────────────────────────────────

def nearest_on_river(lat: float, lng: float, river_coords: list) -> tuple:
    """river_coords = [[lng, lat], ...]. Returns (lat, lng) of nearest point."""
    best_d, best = float("inf"), (lat, lng)
    for c in river_coords:
        d = (lat - c[1]) ** 2 + (lng - c[0]) ** 2
        if d < best_d:
            best_d, best = d, (c[1], c[0])
    return best


# ── Main ────────────────────────────────────────────────────────────────────

def main():
    print("Fetching real river geometries from OSM API…")

    river_ways = {
        "Buriganga":    [829191016],
        "Turag":        [24226201, 610179607],   # north + south sections
        "Balu":         [31159486],
        "Shitalakshya": [30670081],
        "Dhaleshwari":  [929186912],
    }

    river_coords: dict[str, list] = {}

    for name, way_ids in river_ways.items():
        all_coords = []
        for wid in way_ids:
            print(f"  {name} way {wid} … ", end="", flush=True)
            try:
                c = fetch_way(wid)
                all_coords.extend(c)
                print(f"{len(c)} pts")
            except Exception as e:
                print(f"FAILED ({e})")
            time.sleep(0.3)   # be polite to OSM API

        if all_coords:
            river_coords[name] = subsample(all_coords, 40)
            print(f"  → {name}: using {len(river_coords[name])} pts after subsampling")
        else:
            print(f"  ✗ {name}: no data fetched — keeping original coordinates")

    # ── 1. Update rivers.json ───────────────────────────────────────────────
    rivers_path = DATA_DIR / "rivers.json"
    rivers = json.loads(rivers_path.read_text())

    name_map = {
        "buriganga":    "Buriganga",
        "turag":        "Turag",
        "balu":         "Balu",
        "shitalakshya": "Shitalakshya",
        "dhaleshwari":  "Dhaleshwari",
    }

    updated_rivers = 0
    for feature in rivers["features"]:
        rid = feature["properties"]["id"]
        river_name = name_map.get(rid)
        if river_name and river_name in river_coords:
            feature["geometry"]["coordinates"] = river_coords[river_name]
            updated_rivers += 1
            print(f"  rivers.json: updated {rid} ({len(river_coords[river_name])} pts)")

    rivers_path.write_text(json.dumps(rivers, indent=2, ensure_ascii=False))
    print(f"✓ rivers.json updated ({updated_rivers} rivers)")

    # ── 2. Update pollution-hotspots.json ────────────────────────────────────
    ph_path = DATA_DIR / "pollution-hotspots.json"
    ph = json.loads(ph_path.read_text())

    snapped_hotspots = 0
    for hotspot in ph["hotspots"]:
        river_name = hotspot.get("river", "")
        if river_name in river_coords:
            new_lat, new_lng = nearest_on_river(hotspot["lat"], hotspot["lng"], river_coords[river_name])
            hotspot["lat"] = round(new_lat, 7)
            hotspot["lng"] = round(new_lng, 7)
            snapped_hotspots += 1

    ph_path.write_text(json.dumps(ph, indent=2, ensure_ascii=False))
    print(f"✓ pollution-hotspots.json updated ({snapped_hotspots} hotspots snapped)")

    # ── 3. Update encroachment.json ──────────────────────────────────────────
    enc_path = DATA_DIR / "encroachment.json"
    enc = json.loads(enc_path.read_text())

    snapped_enc = 0
    for seg in enc["segments"]:
        river_name = seg.get("river", "")
        if river_name in river_coords:
            new_lat, new_lng = nearest_on_river(seg["lat"], seg["lng"], river_coords[river_name])
            seg["lat"] = round(new_lat, 7)
            seg["lng"] = round(new_lng, 7)
            snapped_enc += 1

    enc_path.write_text(json.dumps(enc, indent=2, ensure_ascii=False))
    print(f"✓ encroachment.json updated ({snapped_enc} segments snapped)")

    # ── 4. Update erosion-corridors.json ─────────────────────────────────────
    ero_path = DATA_DIR / "erosion-corridors.json"
    ero = json.loads(ero_path.read_text())

    snapped_ero = 0
    for corridor in ero["corridors"]:
        river_name = corridor.get("river", "")
        if river_name in river_coords and corridor.get("coordinates"):
            first = corridor["coordinates"][0]
            # first is [lng, lat]
            new_lat, new_lng = nearest_on_river(first[1], first[0], river_coords[river_name])
            # Shift the entire corridor by the offset
            dlat = new_lat - first[1]
            dlng = new_lng - first[0]
            corridor["coordinates"] = [
                [round(c[0] + dlng, 7), round(c[1] + dlat, 7)]
                for c in corridor["coordinates"]
            ]
            snapped_ero += 1

    ero_path.write_text(json.dumps(ero, indent=2, ensure_ascii=False))
    print(f"✓ erosion-corridors.json updated ({snapped_ero} corridors shifted)")

    print("\nDone. Run `npm run build` to verify, then `npm run dev` to visually check.")



if __name__ == "__main__":
    main()
