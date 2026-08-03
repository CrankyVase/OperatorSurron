#!/usr/bin/env python3
"""Harvest every real video frame YouTube exposes for the channel.

YouTube stores 4 stills per video: maxresdefault (the uploaded thumbnail) plus
maxres1/2/3, which are frames auto-sampled from ~25/50/75% through the video.
Same for Shorts (oar* / hq720 variants). That's the highest-resolution real
footage obtainable without downloading the source video.

Output: assets/frames/<videoId>_<slot>.jpg
"""
import json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "data", "raw")
OUT = os.path.join(ROOT, "assets", "frames")
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36"

# Ordered best-first; we keep every variant that returns real bytes.
LONG_SLOTS = ["maxresdefault", "maxres1", "maxres2", "maxres3",
              "sddefault", "sd1", "sd2", "sd3"]
SHORT_SLOTS = ["oardefault", "oar1", "oar2", "oar3",
               "frame0", "hq720", "maxresdefault", "hqdefault"]


def get(url):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        data = urllib.request.urlopen(req, timeout=25).read()
        # YouTube serves a tiny grey placeholder for missing slots.
        return data if len(data) > 6000 else None
    except Exception:
        return None


def fetch(job):
    vid, slot, kind = job
    path = os.path.join(OUT, f"{vid}_{slot}.jpg")
    if os.path.exists(path) and os.path.getsize(path) > 6000:
        return path
    data = get(f"https://i.ytimg.com/vi/{vid}/{slot}.jpg")
    if not data:
        return None
    open(path, "wb").write(data)
    return path


def main():
    os.makedirs(OUT, exist_ok=True)
    videos = json.load(open(os.path.join(RAW, "videos.json")))
    shorts = json.load(open(os.path.join(RAW, "shorts.json")))

    jobs = [(v["id"], s, "long") for v in videos for s in LONG_SLOTS]
    jobs += [(s["id"], sl, "short") for s in shorts for sl in SHORT_SLOTS]

    with ThreadPoolExecutor(max_workers=16) as ex:
        got = [p for p in ex.map(fetch, jobs) if p]

    print(f"harvested {len(got)} frames from {len(videos)} videos + {len(shorts)} shorts")
    total = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT))
    print(f"total size: {total/1e6:.1f} MB")


if __name__ == "__main__":
    main()
