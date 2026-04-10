#!/usr/bin/env python3
"""
fix_all_v3.py — Comprehensive NodiWatch data fix for hackathon demo.

Fixes:
 1. Encroachment boundaries: consecutive OSM slice (not sorted-by-lat zigzag)
 2. Rivers.json: add missing Turag Aminbazar section, more Balu density
 3. Erosion corridors: E004/E005 identical → fix; E002 sparse → extend
 4. Pollution hotspot duplicates: spread along real river points
 5. Attribution probabilities: cap at realistic levels (max ~35%)
"""
import json, math, urllib.request
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "src" / "data"

# ── Geometry helpers ──────────────────────────────────────────────────────────

def hav(lat1, lng1, lat2, lng2):
    R = 6_371_000
    dl = math.radians(lat2 - lat1); dg = math.radians(lng2 - lng1)
    a = math.sin(dl/2)**2 + math.cos(math.radians(lat1))*math.cos(math.radians(lat2))*math.sin(dg/2)**2
    return R * 2 * math.asin(math.sqrt(a))

def tangent(coords, i):
    n = len(coords)
    p0 = coords[max(0, i-1)]; p1 = coords[min(n-1, i+1)]
    dlng = p1[0]-p0[0]; dlat = p1[1]-p0[1]
    mag = math.hypot(dlng, dlat)
    return (dlng/mag, dlat/mag) if mag > 1e-12 else (1.0, 0.0)

def bank_pt(lng, lat, tx, ty, offset_m, side):
    # right perpendicular: rotate CW → (ty, -tx)
    px, py = (ty, -tx) if side == "right" else (-ty, tx)
    mpl = 111_000 * math.cos(math.radians(lat))
    return [round(lng + offset_m*px/mpl, 7), round(lat + offset_m*py/111_000, 7)]

def make_bank(coords, offset_m, side="right"):
    return [bank_pt(c[0], c[1], *tangent(coords, i), offset_m, side)
            for i, c in enumerate(coords)]

def nearest_idx(coords, lat, lng):
    return min(range(len(coords)), key=lambda i: hav(coords[i][1], coords[i][0], lat, lng))

def local_slice(coords, lat, lng, n=24):
    """Return n consecutive points in original way-order centred on nearest point."""
    best = nearest_idx(coords, lat, lng)
    half = n // 2
    start = max(0, best - half)
    end   = min(len(coords), start + n)
    start = max(0, end - n)
    return coords[start:end]

# ── OSM fetcher ───────────────────────────────────────────────────────────────

def fetch_way(wid):
    url = f"https://api.openstreetmap.org/api/0.6/way/{wid}/full.json"
    req = urllib.request.Request(url, headers={"User-Agent": "NodiWatch-v3/1.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
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

def subsample(coords, n):
    if len(coords) <= n:
        return coords
    step = len(coords) / n
    return [coords[int(i * step)] for i in range(n)]

# ══════════════════════════════════════════════════════════════════════════════
# 1. FETCH OSM DATA
# ══════════════════════════════════════════════════════════════════════════════
print("=== Fetching OSM way data ===")
print("  Buriganga way 829191016 ...", end=" ", flush=True)
buri_coords = fetch_way(829191016)
print(f"{len(buri_coords)} pts")

print("  Turag way 1072292567 (Aminbazar) ...", end=" ", flush=True)
turag_aminbazar = fetch_way(1072292567)
print(f"{len(turag_aminbazar)} pts")

print("  Balu way 31159486 ...", end=" ", flush=True)
balu_coords = fetch_way(31159486)
print(f"{len(balu_coords)} pts")

# ══════════════════════════════════════════════════════════════════════════════
# 2. UPDATE RIVERS.JSON — add Turag Aminbazar section
# ══════════════════════════════════════════════════════════════════════════════
print("\n=== Updating rivers.json ===")
rivers = json.loads((DATA_DIR / "rivers.json").read_text())

for feat in rivers["features"]:
    fid = feat["properties"]["id"]

    if fid == "turag":
        # Current rivers.json Turag starts at lat ~23.88 (Gabtali area).
        # Prepend the Aminbazar section (lat 23.785-23.880) from way 1072292567.
        # Way 1072292567 runs S→N; subsample to 30 pts then join.
        aminbazar_sub = subsample(turag_aminbazar, 30)
        existing = feat["geometry"]["coordinates"]
        # Avoid duplicate points at the seam
        combined = aminbazar_sub + existing
        # Remove consecutive duplicates within 20m
        clean = [combined[0]]
        for pt in combined[1:]:
            if hav(clean[-1][1], clean[-1][0], pt[1], pt[0]) > 20:
                clean.append(pt)
        feat["geometry"]["coordinates"] = clean
        print(f"  turag: {len(existing)} → {len(clean)} pts (added Aminbazar section)")

    elif fid == "balu":
        # Balu way 31159486 has 275 pts for the Demra section. Subsample to 40 and merge.
        balu_sub = subsample(balu_coords, 40)
        feat["geometry"]["coordinates"] = balu_sub
        print(f"  balu: updated to {len(balu_sub)} pts from OSM way")

    elif fid == "buriganga":
        # Buriganga way 829191016 has 95 pts; replace with dense version.
        buri_sub = subsample(buri_coords, 50)
        feat["geometry"]["coordinates"] = buri_sub
        print(f"  buriganga: updated to {len(buri_sub)} pts from OSM way")

(DATA_DIR / "rivers.json").write_text(json.dumps(rivers, indent=2, ensure_ascii=False))
print("✓ rivers.json saved")

# ══════════════════════════════════════════════════════════════════════════════
# 3. FIX ENCROACHMENT BOUNDARIES
# ══════════════════════════════════════════════════════════════════════════════
print("\n=== Fixing encroachment boundaries ===")
enc = json.loads((DATA_DIR / "encroachment.json").read_text())

# Reload rivers for ENC-004/005
rivers_reload = json.loads((DATA_DIR / "rivers.json").read_text())
river_coords_map = {f["properties"]["id"]: f["geometry"]["coordinates"]
                    for f in rivers_reload["features"]}

# Direction hints:
#   Buriganga way 829191016: flows roughly W→E at Sadarghat.  right = south bank.
#   Turag way 1072292567: flows S→N (increasing lat).  left = west bank (encroached).
#   Balu way 31159486: flows N→S (decreasing lat) at Demra.  left = east bank.
ENC_SOURCES = {
    "ENC-001": (buri_coords,      "right", 24),
    "ENC-002": (turag_aminbazar,  "left",  24),
    "ENC-003": (balu_coords,      "left",  24),
}

for seg in enc["segments"]:
    sid = seg["id"]

    if sid in ENC_SOURCES:
        coords, side, n = ENC_SOURCES[sid]
        sl = local_slice(coords, seg["lat"], seg["lng"], n)
        if len(sl) < 4:
            print(f"  WARN {sid}: only {len(sl)} pts near marker"); continue

        w16 = seg.get("width_2016", 200)
        w26 = seg.get("width_2026", 150)
        seg["boundary_2016"] = make_bank(sl, w16/2, side)
        seg["boundary_2026"] = make_bank(sl, w26/2, side)

        d16 = hav(seg["boundary_2016"][0][1], seg["boundary_2016"][0][0], sl[0][1], sl[0][0])
        d26 = hav(seg["boundary_2026"][0][1], seg["boundary_2026"][0][0], sl[0][1], sl[0][0])
        print(f"  {sid}: {len(sl)}pts | offset 2016={d16:.0f}m (exp {w16/2:.0f}m), "
              f"2026={d26:.0f}m (exp {w26/2:.0f}m)")

    elif sid == "ENC-004":
        # Shitalakshya at Narayanganj Industrial Zone.
        # rivers.json Shitalakshya is self-intersecting; use hand-crafted centerline.
        # River flows S→N at lng ~90.519, lat ~23.775–23.797.
        # right bank = east side.
        w16 = seg.get("width_2016", 395); w26 = seg.get("width_2026", 305)
        # Centerline: slight natural meander westward then east
        cl = [
            [90.5185, 23.7755], [90.5190, 23.7770], [90.5197, 23.7785],
            [90.5203, 23.7800], [90.5208, 23.7814], [90.5210, 23.7828],
            [90.5207, 23.7840], [90.5202, 23.7852], [90.5196, 23.7863],
            [90.5190, 23.7873], [90.5186, 23.7883], [90.5183, 23.7895],
        ]
        seg["boundary_2016"] = make_bank(cl, w16/2, "right")
        seg["boundary_2026"] = make_bank(cl, w26/2, "right")
        print(f"  ENC-004: manual centerline {len(cl)}pts → "
              f"offset ~{w16/2:.0f}m / ~{w26/2:.0f}m")

    elif sid == "ENC-005":
        # Dhaleshwari at Keraniganj — rivers.json dhaleshwari has clean 40-pt path here.
        dhal = river_coords_map.get("dhaleshwari", [])
        sl = local_slice(dhal, seg["lat"], seg["lng"], 18)
        if len(sl) >= 4:
            w16 = seg.get("width_2016", 490); w26 = seg.get("width_2026", 405)
            # Dhaleshwari flows NW→SE here.  right bank = NE (left = SW).
            # Encroachment is on both banks; show right (NE) side.
            seg["boundary_2016"] = make_bank(sl, w16/2, "right")
            seg["boundary_2026"] = make_bank(sl, w26/2, "right")
            print(f"  ENC-005: {len(sl)}pts from rivers.json dhaleshwari")
        else:
            print(f"  WARN ENC-005: only {len(sl)} pts from dhaleshwari")

(DATA_DIR / "encroachment.json").write_text(json.dumps(enc, indent=2, ensure_ascii=False))
print("✓ encroachment.json saved")

# ══════════════════════════════════════════════════════════════════════════════
# 4. FIX EROSION CORRIDORS
# ══════════════════════════════════════════════════════════════════════════════
print("\n=== Fixing erosion corridors ===")
ero = json.loads((DATA_DIR / "erosion-corridors.json").read_text())

for corr in ero["corridors"]:
    cid = corr["id"]

    if cid == "E002":
        # Sadarghat Buriganga — was only 4 pts; extend to 12 using buri_coords slice
        sl = local_slice(buri_coords, 23.7092, 90.3950, 12)
        corr["coordinates"] = [[round(c[0],7), round(c[1],7)] for c in sl]
        print(f"  E002: extended to {len(corr['coordinates'])}pts along Buriganga")

    elif cid == "E003":
        # Demra — was zigzagging; replace with sequential Shitalakshya bank points
        # Shitalakshya flows S→N through Narayanganj at lng ~90.505-90.515
        corr["coordinates"] = [
            [90.5062, 23.6700], [90.5070, 23.6745], [90.5080, 23.6792],
            [90.5094, 23.6838], [90.5115, 23.6895], [90.5122, 23.6955],
            [90.5115, 23.7005], [90.5098, 23.7052], [90.5078, 23.7098],
            [90.5054, 23.7145],
        ]
        print(f"  E003: rewritten to {len(corr['coordinates'])}pts along Shitalakshya")

    elif cid == "E004":
        # Gabtali Turag — use the Turag path from rivers.json (eastern section)
        # Coordinates follow Turag from Gabtali heading north
        corr["coordinates"] = [
            [90.4219, 23.8878], [90.4159, 23.8859], [90.4119, 23.8828],
            [90.4067, 23.8817], [90.4023, 23.8820], [90.3978, 23.8811],
            [90.3933, 23.8821], [90.3928, 23.8850], [90.3893, 23.8924],
            [90.3854, 23.8980],
        ]
        print(f"  E004: updated to Turag Gabtali path")

    elif cid == "E005":
        # Tongi Rail Bridge Turag — was identical to E004; fix to Tongi area (lng ~90.345-90.348)
        # Turag near Tongi rail bridge at lat ~23.895-23.915
        corr["coordinates"] = [
            [90.3499, 23.9010], [90.3488, 23.9025], [90.3475, 23.9038],
            [90.3469, 23.9052], [90.3465, 23.9068], [90.3454, 23.9082],
            [90.3445, 23.9095], [90.3449, 23.9110], [90.3460, 23.9125],
            [90.3475, 23.9145],
        ]
        print(f"  E005: fixed to Tongi Turag path (was identical to E004)")

(DATA_DIR / "erosion-corridors.json").write_text(json.dumps(ero, indent=2, ensure_ascii=False))
print("✓ erosion-corridors.json saved")

# ══════════════════════════════════════════════════════════════════════════════
# 5. FIX POLLUTION HOTSPOT DUPLICATES + PROBABILITY CAPPING
# ══════════════════════════════════════════════════════════════════════════════
print("\n=== Fixing pollution hotspots ===")
hs_data = json.loads((DATA_DIR / "pollution-hotspots.json").read_text())

# Unique positions for every hotspot — spread along real river paths.
# Sources: rivers.json points (already verified on river centrelines).
HOTSPOT_POSITIONS = {
    # Buriganga corridor — 9 hotspots
    "HS-001": (23.7093544,  90.3634179),  # rivers.json Buriganga pt
    "HS-002": (23.7070459,  90.3686857),  # rivers.json Buriganga pt
    "HS-003": (23.7137355,  90.3601670),  # rivers.json Buriganga pt (was dup of HS-002)
    "HS-004": (23.7083524,  90.3880405),  # rivers.json Buriganga pt
    "HS-005": (23.7180182,  90.3592765),  # rivers.json Buriganga pt (was dup of HS-004)
    "HS-006": (23.7100027,  90.3931260),  # rivers.json Buriganga pt
    "HS-007": (23.7091923,  90.4011404),  # rivers.json Buriganga pt
    "HS-008": (23.7236367,  90.3583431),  # rivers.json Buriganga pt (was dup of HS-007)
    "HS-009": (23.7337954,  90.3539153),  # rivers.json Buriganga pt (was dup of HS-007)
    # Turag corridor — 6 hotspots
    "HS-010": (23.8946124,  90.3487811),  # rivers.json Turag pt
    "HS-011": (23.8924489,  90.3893878),  # rivers.json Turag pt (was dup of HS-010)
    "HS-012": (23.8850340,  90.3928567),  # rivers.json Turag pt (was dup of HS-010)
    "HS-013": (23.8936107,  90.3620381),  # rivers.json Turag pt
    "HS-014": (23.8980922,  90.3854603),  # rivers.json Turag pt (was dup of HS-013)
    "HS-015": (23.8821982,  90.3933889),  # rivers.json Turag pt
    # Shitalakshya corridor — 3 hotspots
    "HS-016": (23.7962920,  90.5248749),  # rivers.json Shitalakshya pt
    "HS-017": (23.7861226,  90.5206775),  # rivers.json Shitalakshya pt
    "HS-018": (23.7770187,  90.5121259),  # rivers.json Shitalakshya pt (was dup of HS-017)
    # Balu corridor — 1 hotspot
    "HS-019": (23.8009238,  90.4822009),  # rivers.json Balu pt
}

MAX_PROB = 0.35  # cap top attribution probability at 35%

for hs in hs_data["hotspots"]:
    hid = hs["id"]

    # Fix position
    if hid in HOTSPOT_POSITIONS:
        lat, lng = HOTSPOT_POSITIONS[hid]
        if abs(hs["lat"] - lat) > 1e-5 or abs(hs["lng"] - lng) > 1e-5:
            print(f"  {hid}: pos {hs['lat']:.4f},{hs['lng']:.4f} → {lat:.4f},{lng:.4f}")
        hs["lat"] = lat
        hs["lng"] = lng

    # Cap attribution probabilities
    factories = hs.get("attributed_factories", [])
    if factories:
        max_p = max(f.get("probability", 0) for f in factories)
        if max_p > MAX_PROB:
            scale = MAX_PROB / max_p
            for f in factories:
                f["probability"] = round(f["probability"] * scale, 4)
            # Also cap distance_score inflation
            max_ds = max(f.get("distance_score", 0) for f in factories)
            if max_ds > 2.0:
                ds_scale = 2.0 / max_ds
                for f in factories:
                    f["distance_score"] = round(f["distance_score"] * ds_scale, 4)

(DATA_DIR / "pollution-hotspots.json").write_text(
    json.dumps(hs_data, indent=2, ensure_ascii=False))
print("✓ pollution-hotspots.json saved")

# ══════════════════════════════════════════════════════════════════════════════
# 6. VERIFY ENCROACHMENT OFFSETS
# ══════════════════════════════════════════════════════════════════════════════
print("\n=== Verification ===")
enc_check = json.loads((DATA_DIR / "encroachment.json").read_text())
for seg in enc_check["segments"]:
    b16 = seg.get("boundary_2016", [])
    b26 = seg.get("boundary_2026", [])
    if b16 and b26:
        # Check first-point distances
        mid_lat = sum(c[1] for c in b16[:5]) / min(5, len(b16))
        mid_lng = sum(c[0] for c in b16[:5]) / min(5, len(b16))
        print(f"  {seg['id']}: {len(b16)} boundary pts, "
              f"centroid≈({mid_lat:.4f},{mid_lng:.4f}), "
              f"marker=({seg['lat']:.4f},{seg['lng']:.4f})")

print("\nAll fixes complete.")
