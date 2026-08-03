# OPERATOR SURRON — portfolio & sponsorship site

A dark, single-page site for the YouTube channel
[@OperatorSurron](https://www.youtube.com/@OperatorSurron) — built around the
bike, the videos, and a frictionless way for brands to get in touch.

No build step. No framework. No third-party requests at runtime — the fonts,
the 3D library and every image are served from this repo.

---

## Run it

```bash
python3 -m http.server 8765
# open http://localhost:8765
```

It must be served over HTTP (not opened as a `file://` path) because the site
uses ES modules.

## Deploy it

Any static host works — the repo root *is* the site.

- **GitHub Pages** — Settings → Pages → deploy from branch, root folder.
- **Netlify / Vercel / Cloudflare Pages** — drag the folder in, or point at the
  repo. No build command, publish directory `.`.

---

## Editing the site

### `data/site.js` — **this is the file you edit**

Everything the site *says* about you lives here:

| Export | What it controls |
| --- | --- |
| `CHANNEL` | Name, handle, email, tagline |
| `STATS` | The big numbers in the stats bar |
| `GARAGE` | Your bikes — name, model, spec rows, build video |
| `KIT` | The loadout grid (**currently placeholders — see below**) |
| `BRANDS` | The scrolling brand marquee |
| `PACKAGES` | What sponsors can buy |
| `ENQUIRY_TYPES` | Options in the contact form dropdown |

> **⚠️ `KIT` needs your input.** Those entries are placeholders inferred from
> what's visible in your videos. Swap in the real helmet, goggles, cameras and
> parts — and add affiliate links in the `link` field if you have them. A card
> with an empty `link` simply isn't clickable.

### Copy in `index.html`

The About ("The Operator") section is hand-written prose — edit it directly in
`index.html`.

---

## Refreshing the YouTube data

The video grid, Shorts rail and stats are generated from a real scrape of the
channel — nothing is hand-typed.

```bash
# 1. re-scrape the channel (writes data/raw/*.json)
python3 scripts/refresh.py

# 2. rebuild data/channel.js from that scrape
python3 scripts/build_data.py

# 3. optional: pull fresh video frames and re-cut the photo gallery
python3 scripts/harvest_frames.py
python3 scripts/find_purple.py
python3 scripts/build_gallery.py
```

Then update the hard-coded figures in `data/site.js → STATS` and the
`Aug 2026` date in the footer.

### What each script does

| Script | Purpose |
| --- | --- |
| `refresh.py` | Scrapes the channel's videos + Shorts via YouTube's internal API |
| `build_data.py` | Turns the scrape into `data/channel.js`, assigns categories |
| `harvest_frames.py` | Downloads every real frame YouTube exposes (4 stills per video) |
| `find_purple.py` | Scores each frame for how much of the violet Sur-Ron paint it contains |
| `build_gallery.py` | Curates the best purple-bike shots into `assets/gallery/` |
| `fetch_fonts.py` | Re-downloads the self-hosted webfonts |

`find_purple.py` is hue-matching, so it occasionally flags something that
merely *is* purple. `build_gallery.py` has a `BLOCK_VIDEOS` set at the top —
add a video id there to banish a bad shot.

---

## The 3D bike

`scripts/bike3d.js` is a procedural Sur-Ron Light Bee X modelled in Three.js
from photo reference, in the bike's real colours. The "THE RIG" section pins it
to the screen and scrolls through an orbit, an exploded view, and a reassembly.

If the module fails to load for any reason the section degrades to a short
notice and the rest of the page is unaffected.

Three.js r160 is vendored at `assets/vendor/three.module.min.js` (MIT).

---

## Layout

```
index.html              the whole page
styles/main.css         all styling
styles/fonts.css        self-hosted @font-face (generated)
scripts/main.js         site runtime — rendering, filters, lightbox, scroll rig
scripts/bike3d.js       procedural 3D Sur-Ron
data/site.js            ← YOUR CONTENT
data/channel.js         generated from the YouTube scrape
data/gallery.js         generated image manifest
assets/thumbs/          video thumbnails
assets/shorts/          Shorts thumbnails
assets/gallery/         curated purple-bike stills
assets/brand/           avatar + banner
assets/fonts/           self-hosted woff2
assets/vendor/          Three.js
```

`assets/frames/` (68MB of raw harvested stills) is gitignored — rerun
`harvest_frames.py` to regenerate it.

---

## Notes

- Colours are sampled from the actual bike: the frame paint measures `#785E98`
  in shade and `#9479B2` lit, which is where the site's violet comes from. The
  acid yellow is the accent from the fork guards and thumbnail titles.
- The sponsor form has no backend. It composes a pre-filled `mailto:` and hands
  off to the visitor's mail app, so there's no server to run and nothing to
  disappear into a void.
- Video thumbnails and stills are the channel's own content, served locally.
- Fonts: Big Shoulders Display, Barlow, Azeret Mono — all SIL Open Font License.
