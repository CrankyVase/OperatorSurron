#!/usr/bin/env python3
"""Score every harvested frame by how much of the signature violet Sur-Ron
paint it contains, so the good bike shots float to the top.

Violet frame paint sits around hue 255-285 deg with real saturation and
mid-to-high value. Grey/black bikes and night skies score ~0.
"""
import os, json, sys
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "frames")


def score(path):
    try:
        im = Image.open(path).convert("RGB")
    except Exception:
        return None
    w, h = im.size
    im = im.resize((160, int(160 * h / w)), Image.BILINEAR)
    a = np.asarray(im).astype(np.float32) / 255.0
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx, mn = a.max(-1), a.min(-1)
    d = mx - mn
    v = mx
    s = np.where(mx > 0, d / np.maximum(mx, 1e-6), 0)

    hue = np.zeros_like(mx)
    nz = d > 1e-6
    idx = (mx == r) & nz
    hue[idx] = ((g[idx] - b[idx]) / d[idx]) % 6
    idx = (mx == g) & nz
    hue[idx] = ((b[idx] - r[idx]) / d[idx]) + 2
    idx = (mx == b) & nz
    hue[idx] = ((r[idx] - g[idx]) / d[idx]) + 4
    hue *= 60

    violet = (hue > 248) & (hue < 292) & (s > 0.22) & (v > 0.22)
    # Acid-yellow accents (fork guards / brand colour) as a secondary signal.
    acid = (hue > 55) & (hue < 78) & (s > 0.45) & (v > 0.55)
    return float(violet.mean()), float(acid.mean()), im.size


def main():
    rows = []
    for f in sorted(os.listdir(SRC)):
        if not f.endswith(".jpg"):
            continue
        r = score(os.path.join(SRC, f))
        if not r:
            continue
        vio, acid, size = r
        rows.append({"file": f, "violet": round(vio, 5),
                     "acid": round(acid, 5), "w": size[0]})
    rows.sort(key=lambda x: -x["violet"])
    json.dump(rows, open(os.path.join(ROOT, "data", "raw", "frame_scores.json"), "w"), indent=1)

    print(f"{'FILE':46} {'VIOLET%':>8} {'ACID%':>7}")
    for r in rows[:45]:
        print(f"{r['file']:46} {r['violet']*100:8.2f} {r['acid']*100:7.2f}")
    strong = [r for r in rows if r["violet"] > 0.012]
    print(f"\nframes with meaningful violet: {len(strong)} / {len(rows)}")


if __name__ == "__main__":
    main()
