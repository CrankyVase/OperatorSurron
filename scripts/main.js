/* ============================================================================
   OPERATOR SURRON — site runtime
   ========================================================================== */

import { CHANNEL, STATS, GARAGE, KIT, BRANDS, PACKAGES, ENQUIRY_TYPES } from "../data/site.js";
import { VIDEOS, SHORTS } from "../data/channel.js";
import { GALLERY } from "../data/gallery.js";
import { PREVIEW } from "../data/preview.js";

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const esc = (s) => String(s ?? "").replace(/[&<>"']/g,
  (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ── nav ──────────────────────────────────────────────────────────────────── */
const nav = $("#nav");
const onScrollNav = () => nav.classList.toggle("stuck", scrollY > 60);
addEventListener("scroll", onScrollNav, { passive: true });
onScrollNav();

const burger = $("#burger"), drawer = $("#drawer");
const setDrawer = (open) => {
  drawer.hidden = !open;
  burger.setAttribute("aria-expanded", String(open));
  document.body.style.overflow = open ? "hidden" : "";
};
burger.addEventListener("click", () => setDrawer(drawer.hidden));
drawer.addEventListener("click", (e) => { if (e.target.tagName === "A") setDrawer(false); });

/* ── stats ────────────────────────────────────────────────────────────────── */
{
  const order = ["subs", "views", "videos", "best"];
  $("#statsGrid").innerHTML = order.map((k) => {
    const s = STATS[k];
    const m = s.display.match(/^([\d.,]+)([A-Z]?)$/) || [null, s.display, ""];
    return `<div class="stat rv">
      <b data-count="${s.value}" data-display="${esc(s.display)}">${esc(m[1])}<i>${esc(m[2])}</i></b>
      <span>${esc(s.label)}</span></div>`;
  }).join("");
}

/* ── garage ───────────────────────────────────────────────────────────────── */
$("#garageGrid").innerHTML = GARAGE.map((b) => `
  <article class="bike rv">
    <div class="bike__img">
      <span class="bike__tag">${esc(b.status)}</span>
      <img src="${esc(b.thumb)}" alt="${esc(b.name)} — ${esc(b.model)}" loading="lazy">
    </div>
    <div class="bike__body">
      <h3 class="bike__name">${esc(b.name)}</h3>
      <p class="bike__model">${esc(b.model)}</p>
      <p class="bike__blurb">${esc(b.blurb)}</p>
      <ul class="bike__specs">
        ${b.specs.map(([k, v]) => `<li><span>${esc(k)}</span><b>${esc(v)}</b></li>`).join("")}
      </ul>
      ${b.video ? `<button class="bike__link" data-video="${esc(b.video)}"
        data-cur="PLAY" data-title="${esc(b.name)}">Watch the build &rarr;</button>` : ""}
    </div>
  </article>`).join("");

/* ── videos + filters ─────────────────────────────────────────────────────── */
const CATS = [
  ["all", "All"], ["build", "Builds"], ["review", "Reviews"],
  ["ride", "Rides"], ["howto", "How-To"],
];
{
  const counts = VIDEOS.reduce((a, v) => (a[v.category] = (a[v.category] || 0) + 1, a), {});
  $("#filters").innerHTML = CATS
    .filter(([k]) => k === "all" || counts[k])
    .map(([k, label], i) => `<button class="filt" role="tab" data-cat="${k}"
        aria-selected="${i === 0}">${esc(label)}<em>${k === "all" ? VIDEOS.length : counts[k]}</em></button>`)
    .join("");

  $("#vidGrid").innerHTML = VIDEOS.map((v, i) => `
    <button class="vid rv${i === 0 ? " vid--feat" : ""}" data-cat="${esc(v.category)}"
            data-video="${esc(v.id)}" data-cur="PLAY" data-title="${esc(v.title)}">
      <span class="vid__shot">
        <img src="${esc(v.thumb)}" alt="" loading="lazy">
        <span class="vid__cat">${esc(v.category.toUpperCase())}</span>
        ${v.duration ? `<span class="vid__dur">${esc(v.duration)}</span>` : ""}
        <span class="vid__play"><i>▶</i></span>
      </span>
      <span class="vid__meta">
        <span class="vid__t">${esc(v.title)}</span>
        <span class="vid__sub">${esc(v.views || "")}${v.published ? " · " + esc(v.published) : ""}</span>
      </span>
    </button>`).join("");

  $("#filters").addEventListener("click", (e) => {
    const btn = e.target.closest(".filt");
    if (!btn) return;
    $$(".filt").forEach((b) => b.setAttribute("aria-selected", String(b === btn)));
    const cat = btn.dataset.cat;
    $$(".vid").forEach((v) => {
      v.classList.toggle("is-hidden", cat !== "all" && v.dataset.cat !== cat);
    });
  });

  /* hover previews — cycle three real in-video frames under the pointer,
     like YouTube's own preview, but served from this repo */
  if (!REDUCED) {
    $$(".vid").forEach((card) => {
      const frames = PREVIEW[card.dataset.video];
      if (!frames?.length) return;
      const img = card.querySelector(".vid__shot img");
      const home = img.src;
      let timer = null, i = -1;
      card.addEventListener("pointerenter", () => {
        frames.forEach((f) => { (new Image()).src = f; });   // warm the cache
        timer = setInterval(() => {
          i = (i + 1) % frames.length;
          img.src = frames[i];
        }, 600);
      });
      card.addEventListener("pointerleave", () => {
        clearInterval(timer); timer = null; i = -1;
        img.src = home;
      });
    });
  }
}

/* ── shorts rail ──────────────────────────────────────────────────────────── */
$("#shortsRail").innerHTML = SHORTS.slice(0, 24).map((s) => `
  <button class="short" data-video="${esc(s.id)}" data-short="1" data-cur="PLAY"
          data-title="${esc(s.title || "Short")}">
    <span class="short__shot">
      <img src="${esc(s.thumb)}" alt="" loading="lazy">
      ${s.views ? `<span class="short__v">${esc(s.views)}</span>` : ""}
    </span>
    <span class="short__t">${esc(s.title || "")}</span>
  </button>`).join("");

/* ── gallery ──────────────────────────────────────────────────────────────── */
$("#galGrid").innerHTML = GALLERY.map((g, i) => `
  <button class="gal__i" data-img="${esc(g.src)}" data-i="${i}" data-cur="VIEW"
          aria-label="Open still ${i + 1} of ${GALLERY.length}">
    <img src="${esc(g.src)}" alt="Operator Surron's purple Sur-Ron, still ${i + 1}"
         width="${g.w}" height="${g.h}" loading="lazy" decoding="async">
  </button>`).join("");

/* ── kit ──────────────────────────────────────────────────────────────────── */
$("#kitGrid").innerHTML = KIT.map((k) => {
  const inner = `
    <span class="kitc__g">${esc(k.group)}</span>
    <p class="kitc__n">${esc(k.name)}</p>
    <p class="kitc__d">${esc(k.detail)}</p>
    ${k.link ? '<span class="kitc__a">↗</span>' : ""}`;
  return k.link
    ? `<a class="kitc rv" href="${esc(k.link)}" target="_blank" rel="noopener">${inner}</a>`
    : `<div class="kitc rv">${inner}</div>`;
}).join("");

/* ── partner: media kit, brands, packages ─────────────────────────────────── */
{
  const rows = [
    ["1.36", "M", "Views to date"],
    ["223", "", "Videos published"],
    ["4.81", "K", "Subscribers"],
    ["65", "K", "Best single video"],
    ["17", "mo", "Channel age"],
  ];
  $("#mediaKit").innerHTML = rows.map(([n, suf, lab]) =>
    `<div class="rv"><b>${esc(n)}<i>${esc(suf)}</i></b><span>${esc(lab)}</span></div>`).join("");

  const brands = BRANDS.map((b) => `<span>${esc(b)}</span>`).join("");
  $("#brandTrack").innerHTML = brands + brands;

  $("#packGrid").innerHTML = PACKAGES.map((p) => `
    <article class="pack rv">
      ${p.flag ? `<span class="pack__flag">${esc(p.flag)}</span>` : ""}
      <p class="pack__code">${esc(p.code)}</p>
      <h3 class="pack__n">${esc(p.name)}</h3>
      <p class="pack__l">${esc(p.lede)}</p>
      <ul class="pack__i">${p.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
    </article>`).join("");

  $("#enquiryType").innerHTML = ENQUIRY_TYPES
    .map((t) => `<option value="${esc(t)}">${esc(t)}</option>`).join("");
}

/* ── sponsor form → mailto ────────────────────────────────────────────────── */
{
  const form = $("#sponsorForm"), note = $("#formNote");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const missing = ["brand", "name", "email", "message"].filter((k) => !String(d[k] || "").trim());
    if (missing.length) {
      note.textContent = "Fill in brand, name, email and details first.";
      note.classList.add("err");
      form.querySelector(`[name="${missing[0]}"]`)?.focus();
      return;
    }
    note.classList.remove("err");

    const subject = `Sponsorship: ${d.brand} x Operator Surron (${d.type})`;
    const body = [
      `Brand / Company: ${d.brand}`,
      `Contact: ${d.name}`,
      `Email: ${d.email}`,
      `Interested in: ${d.type}`,
      d.budget ? `Product / Budget: ${d.budget}` : null,
      "",
      "Details:",
      d.message,
      "",
      "sent from operatorsurron.com",
    ].filter((l) => l !== null).join("\n");

    location.href = `mailto:${CHANNEL.email}?subject=${encodeURIComponent(subject)}`
                  + `&body=${encodeURIComponent(body)}`;
    note.textContent = "Opening your email app… if nothing happens, copy the address above.";
  });

  const copy = $("#copyMail");
  copy.addEventListener("click", async () => {
    const mail = copy.dataset.mail;
    try {
      await navigator.clipboard.writeText(mail);
    } catch {
      const t = document.createElement("textarea");
      t.value = mail; document.body.appendChild(t); t.select();
      document.execCommand("copy"); t.remove();
    }
    copy.classList.add("ok");
    copy.querySelector("span").textContent = "Copied";
    setTimeout(() => {
      copy.classList.remove("ok");
      copy.querySelector("span").textContent = "Copy address";
    }, 1800);
  });
}

/* ── lightbox (video + image) ─────────────────────────────────────────────── */
{
  const lb = $("#lightbox"), frame = $("#lbFrame"), cap = $("#lbCap");
  const prev = $("#lbPrev"), next = $("#lbNext");
  let lastFocus = null;
  let galIdx = -1;                       // ≥0 while a gallery still is open

  const close = () => {
    lb.hidden = true;
    frame.innerHTML = "";
    galIdx = -1;
    document.body.style.overflow = "";
    lastFocus?.focus();
  };
  const open = (html, caption, isImage) => {
    lastFocus = document.activeElement;
    frame.innerHTML = html;
    frame.style.aspectRatio = isImage ? "auto" : "16/9";
    frame.style.background = isImage ? "transparent" : "#000";
    frame.style.border = isImage ? "0" : "";
    cap.textContent = caption || "";
    prev.hidden = next.hidden = !isImage;
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    $("#lbClose").focus();
  };

  const openStill = (i) => {
    galIdx = (i + GALLERY.length) % GALLERY.length;
    open(`<img class="lb__img" src="${esc(GALLERY[galIdx].src)}" alt="Purple Sur-Ron still">`,
      `${galIdx + 1} / ${GALLERY.length}`, true);
  };
  const step = (d) => { if (galIdx >= 0) openStill(galIdx + d); };

  document.addEventListener("click", (e) => {
    const vid = e.target.closest("[data-video]");
    if (vid) {
      const id = vid.dataset.video;
      open(`<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0"
        title="${esc(vid.dataset.title || "Video")}" allow="accelerometer; autoplay; clipboard-write;
        encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>`,
        vid.dataset.title, false);
      return;
    }
    const img = e.target.closest("[data-img]");
    if (img) openStill(Number(img.dataset.i));
  });

  $("#lbClose").addEventListener("click", close);
  prev.addEventListener("click", () => step(-1));
  next.addEventListener("click", () => step(1));
  lb.addEventListener("click", (e) => {
    if (e.target.closest("button")) return;          // arrows + close handle themselves
    if (e.target === lb || e.target.closest(".lb__stage") === null) close();
  });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !lb.hidden) close();
    if (e.key === "Escape" && !drawer.hidden) setDrawer(false);
    if (!lb.hidden && galIdx >= 0) {
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    }
  });
}

/* ── reveal ───────────────────────────────────────────────────────────────── */
{
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      io.unobserve(en.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  $$(".sect__head, .filters, .brands, .contact").forEach((el) => el.classList.add("rv"));
  $$(".rv").forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 8, 7) * 55}ms`;
    io.observe(el);
  });
}

/* ── year ─────────────────────────────────────────────────────────────────── */
$("#yr").textContent = new Date().getFullYear();

/* ══ FX — cursor, odometers, kinetic strips, scrollspy ═════════════════════ */
let FX = null;
import("./fx.js")
  .then((m) => { FX = m; m.initFX({ reduced: REDUCED }); })
  .catch((e) => console.warn("[fx] unavailable:", e));

/* ══ THE RIG — real photography + blueprint overlay ════════════════════════ */
import("./rig.js")
  .then((m) => m.initRig({ reduced: REDUCED }))
  .catch((e) => console.warn("[rig] unavailable:", e));

/* ══ LIVE CHANNEL STATS ════════════════════════════════════════════════════ */
import("./live.js")
  .then((m) => m.initLive({ onUpdate: applyLiveStats }))
  .catch((e) => console.warn("[live] unavailable:", e));

/**
 * Re-render the stat tiles from a fresh reading, animating anything that grew.
 * `deltas` maps a stat key to how much it moved since the last poll.
 */
function applyLiveStats(next, deltas) {
  const map = { subs: 0, views: 1, videos: 2 };
  Object.entries(map).forEach(([key, i]) => {
    if (next[key] == null) return;
    const tile = $$(".stat")[i];
    if (!tile) return;
    const b = tile.querySelector("b");
    const disp = compact(next[key]);
    b.dataset.count = String(next[key]);
    b.dataset.display = disp;
    if (FX) FX.odo(b, disp);          // digits roll to the new reading
    else {
      const m = disp.match(/^([\d.,]+)([A-Z]?)$/);
      b.innerHTML = `${m[1]}<i>${m[2] || ""}</i>`;
    }

    const grew = deltas?.[key] > 0;
    if (!grew) return;
    tile.classList.remove("bump");
    void tile.offsetWidth;            // restart the animation
    tile.classList.add("bump");
    let chip = tile.querySelector(".stat__delta");
    if (!chip) {
      chip = document.createElement("span");
      chip.className = "stat__delta";
      tile.appendChild(chip);
    }
    chip.textContent = `+${deltas[key].toLocaleString("en-US")}`;
    chip.classList.remove("on");
    void chip.offsetWidth;
    chip.classList.add("on");
  });

  const live = $("#statsLive");
  if (live) {
    live.dataset.state = "on";
    live.querySelector("span").textContent = "Live";
  }
}

/** 1357836 -> "1.36M", 4810 -> "4.81K" */
function compact(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(2).replace(/\.?0+$/, "") + "K";
  return String(n);
}
