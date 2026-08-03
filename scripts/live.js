/* ============================================================================
   LIVE CHANNEL STATS

   Polls the YouTube Data API and reports anything that moved, so the stat
   tiles can animate when a number ticks up.

   Needs an API key — see LIVE in data/site.js. Without one this module does
   nothing at all and the site keeps the baked-in figures from the last scrape.

   Note: YouTube rounds `subscriberCount` to three significant figures, so subs
   move in visible steps. `viewCount` is exact and ticks constantly.
   ========================================================================== */

import { CHANNEL, LIVE } from "../data/site.js";

const STORE = "os:lastStats";
const ENDPOINT = "https://www.googleapis.com/youtube/v3/channels";

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(STORE) || "null");
  } catch {
    return null;
  }
}

function writeCache(v) {
  try {
    localStorage.setItem(STORE, JSON.stringify(v));
  } catch {
    /* private mode — deltas just won't survive a reload */
  }
}

async function fetchStats(signal) {
  const url = `${ENDPOINT}?part=statistics&id=${encodeURIComponent(CHANNEL.channelId)}`
            + `&key=${encodeURIComponent(LIVE.apiKey)}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`YouTube API ${res.status}`);
  const json = await res.json();
  const s = json?.items?.[0]?.statistics;
  if (!s) throw new Error("no statistics in response");
  return {
    subs: Number(s.subscriberCount),
    views: Number(s.viewCount),
    videos: Number(s.videoCount),
    at: Date.now(),
  };
}

export function initLive({ onUpdate } = {}) {
  const flag = document.querySelector("#statsLive");

  if (!LIVE?.enabled || !LIVE.apiKey) {
    if (flag) {
      flag.dataset.state = "off";
      flag.querySelector("span").textContent = "Stats from last sync";
    }
    return { stop() {} };
  }

  let prev = readCache();
  let timer = null;
  let controller = null;
  let failures = 0;

  const poll = async () => {
    controller?.abort();
    controller = new AbortController();
    try {
      const next = await fetchStats(controller.signal);
      failures = 0;

      const deltas = {};
      if (prev) {
        for (const k of ["subs", "views", "videos"]) {
          const d = next[k] - prev[k];
          if (d > 0) deltas[k] = d;
        }
      }
      prev = next;
      writeCache(next);
      onUpdate?.(next, deltas);
    } catch (err) {
      if (err.name === "AbortError") return;
      failures++;
      console.warn("[live] poll failed:", err.message);
      if (flag && failures >= 2) {
        flag.dataset.state = "off";
        flag.querySelector("span").textContent = "Stats from last sync";
      }
      // back off, but never slower than ~30 min
      if (failures >= 3) schedule(Math.min(LIVE.intervalMs * 4, 1_800_000));
    }
  };

  const schedule = (ms = LIVE.intervalMs) => {
    clearTimeout(timer);
    timer = setTimeout(run, ms);
  };
  const run = async () => {
    if (document.visibilityState === "visible") await poll();
    schedule();
  };

  // Don't burn a request behind a hidden tab; catch up when it comes back.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && prev &&
        Date.now() - prev.at > LIVE.intervalMs) {
      poll();
    }
  });

  run();
  return {
    stop() { clearTimeout(timer); controller?.abort(); },
  };
}
