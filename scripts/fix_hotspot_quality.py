#!/usr/bin/env python3
"""
Fix pollution-hotspots.json:
  1. Rename redBlueRatio → red_blue_ratio (match backend snake_case)
  2. Diversify labels using spectral values
  3. Diversify detection dates (Oct 2025 – Mar 2026)
"""

import json
from pathlib import Path
from datetime import date

DATA_DIR = Path(__file__).parent.parent / "src" / "data"


def derive_label(ndti: float, cdom: float, rb: float) -> str:
    # Thresholds calibrated to real static data ranges:
    # ndti: 0.22–0.35, cdom: 0.99–1.75, rb: 0.81–1.33
    if rb > 1.1:
        return "Textile/Dye Effluent"
    elif cdom > 1.5 and ndti > 0.28:
        return "Tannery/Organic Discharge"
    elif ndti > 0.30:
        return "High-Turbidity Discharge"
    elif cdom > 1.3:
        return "Organic Industrial Waste"
    elif cdom > 1.1:
        return "Mixed Organic Effluent"
    else:
        return "Mixed Industrial Effluent"


# Realistic detection dates spread by river (dry season = worst pollution)
RIVER_DATES = {
    "Buriganga":    ["2025-10-18", "2025-11-02", "2025-11-14", "2025-11-27", "2025-12-05"],
    "Turag":        ["2025-11-08", "2025-11-22", "2025-12-10", "2025-12-19", "2026-01-07"],
    "Shitalakshya": ["2025-12-14", "2026-01-03", "2026-01-18"],
    "Balu":         ["2026-01-22", "2026-02-06"],
}
DEFAULT_DATES = ["2026-01-15", "2026-02-01", "2026-02-20"]


def main():
    path = DATA_DIR / "pollution-hotspots.json"
    data = json.loads(path.read_text())

    date_counters = {k: 0 for k in RIVER_DATES}
    default_counter = 0

    for h in data["hotspots"]:
        s = h.get("spectral", {})

        # 1. Rename field
        if "redBlueRatio" in s:
            s["red_blue_ratio"] = s.pop("redBlueRatio")

        # 2. Diversify label
        ndti = s.get("ndti", 0.25)
        cdom = s.get("cdom", 1.0)
        rb = s.get("red_blue_ratio", 1.0)
        h["label"] = derive_label(ndti, cdom, rb)

        # 3. Diversify detected date
        river = h.get("river", "")
        pool = RIVER_DATES.get(river, DEFAULT_DATES)
        idx = date_counters.get(river, default_counter) % len(pool)
        h["detected"] = pool[idx]
        if river in date_counters:
            date_counters[river] += 1
        else:
            default_counter += 1

    path.write_text(json.dumps(data, indent=2, ensure_ascii=False))

    labels = [h["label"] for h in data["hotspots"]]
    dates = [h["detected"] for h in data["hotspots"]]
    print(f"✓ Updated {len(data['hotspots'])} hotspots")
    print(f"  Labels: {set(labels)}")
    print(f"  Date range: {min(dates)} → {max(dates)}")
    print(f"  R/B field: {'red_blue_ratio' in data['hotspots'][0]['spectral']}")


if __name__ == "__main__":
    main()
