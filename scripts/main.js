/* ============================================================================
   OPERATOR SURRON — site runtime
   ========================================================================== */

import { CHANNEL, STATS, GARAGE, KIT, BRANDS, PACKAGES, ENQUIRY_TYPES } from "../data/site.js";
import { VIDEOS, SHORTS } from "../data/channel.js";
import { GALLERY } from "../data/gallery.js";

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const esc = (s) => String(s ?? "").replace(/[&<>"']/g,
  (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ── boot ─────────────────────────────────────────────────────────────────── */
const boot = $("#boot");
const dismissBoot = () => boot.classList.add("done");
if (REDUCED) dismissBoot();
else addEventListener("load", () => setTimeout(dismissBoot, 1500));
setTimeout(dismissBoot, 3200); // hard failsafe

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

/* ── ticker ───────────────────────────────────────────────────────────────── */
{
  const bits = [
    "72V PACK", "19,000W PEAK", "223 VIDEOS", "1.36M VIEWS",
    "SUR-RON LIGHT BEE X", "$10,000 BUILD", "EBMX 9000", "NO FACE",
    "BUILDS · REVIEWS · RIDES", "SPONSORS WELCOME",
  ];
  const half = bits.map((b) => `<span>${esc(b)}</span>`).join("");
  $("#tickerTrack").innerHTML = half + half; // duplicated for a seamless -50% loop
}

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
        data-title="${esc(b.name)}">Watch the build &rarr;</button>` : ""}
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

  $("#vidGrid").innerHTML = VIDEOS.map((v) => `
    <button class="vid rv" data-cat="${esc(v.category)}" data-video="${esc(v.id)}"
            data-title="${esc(v.title)}">
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
}

/* ── shorts rail ──────────────────────────────────────────────────────────── */
$("#shortsRail").innerHTML = SHORTS.slice(0, 24).map((s) => `
  <button class="short" data-video="${esc(s.id)}" data-short="1"
          data-title="${esc(s.title || "Short")}">
    <span class="short__shot">
      <img src="${esc(s.thumb)}" alt="" loading="lazy">
      ${s.views ? `<span class="short__v">${esc(s.views)}</span>` : ""}
    </span>
    <span class="short__t">${esc(s.title || "")}</span>
  </button>`).join("");

/* ── gallery ──────────────────────────────────────────────────────────────── */
$("#galGrid").innerHTML = GALLERY.map((g, i) => `
  <button class="gal__i" data-img="${esc(g.src)}" data-i="${i}"
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

    const subject = `Sponsorship — ${d.brand} × Operator Surron (${d.type})`;
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
      "— sent from operatorsurron.com",
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
  let lastFocus = null;

  const close = () => {
    lb.hidden = true;
    frame.innerHTML = "";
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
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    $("#lbClose").focus();
  };

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
    if (img) {
      const i = Number(img.dataset.i);
      open(`<img class="lb__img" src="${esc(img.dataset.img)}" alt="Purple Sur-Ron still">`,
        `Still ${i + 1} of ${GALLERY.length} — pulled from the channel`, true);
    }
  });

  $("#lbClose").addEventListener("click", close);
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target.closest(".lb__stage") === null) close(); });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !lb.hidden) close();
    if (e.key === "Escape" && !drawer.hidden) setDrawer(false);
  });
}

/* ── reveal + count-up ────────────────────────────────────────────────────── */
{
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      io.unobserve(en.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  $$(".rv").forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 8, 7) * 55}ms`;
    io.observe(el);
  });

  const fmt = (n) => n.toLocaleString("en-US");
  const countUp = (el) => {
    const target = Number(el.dataset.count);
    const display = el.dataset.display;
    const suffix = el.dataset.suffix || "";
    const dur = REDUCED ? 0 : 1400;
    const t0 = performance.now();
    const tick = (now) => {
      const p = dur ? clamp((now - t0) / dur) : 1;
      const eased = 1 - Math.pow(1 - p, 3);
      if (display) {
        const m = display.match(/^([\d.,]+)([A-Z]?)$/);
        const end = parseFloat(m[1].replace(/,/g, ""));
        const dec = (m[1].split(".")[1] || "").length;
        el.innerHTML = `${(end * eased).toFixed(dec)}<i>${m[2]}</i>`;
      } else {
        el.textContent = fmt(Math.round(target * eased)) + suffix;
      }
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const cio = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      countUp(en.target);
      cio.unobserve(en.target);
    });
  }, { threshold: 0.4 });
  $$("[data-count]").forEach((el) => cio.observe(el));
}

/* ── year ─────────────────────────────────────────────────────────────────── */
$("#yr").textContent = new Date().getFullYear();

/* ══ THE RIG — scroll-driven 3D bike ═══════════════════════════════════════ */
initRig();

async function initRig() {
  const section = $("#rig");
  const canvas = $("#rigCanvas");
  const fallback = $("#rigFallback");

  let THREE, bike;
  try {
    THREE = await import("../assets/vendor/three.module.min.js");
    bike = await import("./bike3d.js");
    if (typeof bike.createSurRon !== "function") throw new Error("createSurRon missing");
  } catch (err) {
    console.warn("[rig] 3D unavailable:", err);
    canvas.hidden = true;
    fallback.hidden = false;
    $("#rigHint").hidden = true;
    section.style.height = "100svh";
    return;
  }

  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: true, alpha: true, powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = false;
  if ("outputColorSpace" in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
  if ("toneMapping" in renderer) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  bike.addStudioLights?.(scene);

  const { group, parts } = bike.createSurRon();
  scene.add(group);

  // Ground shadow-ish disc so the bike doesn't float in a void.
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(1.9, 48).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.55 })
  );
  disc.position.y = 0.002;
  scene.add(disc);

  const resize = () => {
    const w = canvas.clientWidth || innerWidth;
    const h = canvas.clientHeight || innerHeight;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  addEventListener("resize", resize);
  resize();

  // Cache each part's rest position so the exploded view can lerp from it.
  const rest = new Map();
  Object.values(parts).forEach((p) => {
    if (p?.isObject3D) rest.set(p, p.position.clone());
  });

  /* Choreography ---------------------------------------------------------- */
  const COPY = [
    { at: 0.00, title: "THE <em>PURPLE ONE</em>", copy: "Sur-Ron Light Bee X. Built from the frame up, painted the colour everyone recognises before they know the name." },
    { at: 0.32, title: "EVERY <em>PART</em>", copy: "Ten grand of it. Trellis frame, 72V pack, EBMX 9000 controller, mid-drive motor — chosen one piece at a time." },
    { at: 0.64, title: "19,000 <em>WATTS</em>", copy: "Bolted back together and de-restricted. Enough power to loop it if you're careless with the throttle." },
    { at: 0.86, title: "READY WHEN <em>YOU ARE</em>", copy: "This is the bike behind 223 videos and 1.36 million views." },
  ];
  const specRows = $$(".rig__specrow");
  const titleEl = $("#rigTitle"), copyEl = $("#rigCopy");
  const progEl = $("#rigProg"), hintEl = $("#rigHint");
  let copyIdx = -1;

  const setCopy = (i) => {
    if (i === copyIdx) return;
    copyIdx = i;
    titleEl.classList.add("swap"); copyEl.classList.add("swap");
    setTimeout(() => {
      titleEl.innerHTML = COPY[i].title;
      copyEl.textContent = COPY[i].copy;
      titleEl.classList.remove("swap"); copyEl.classList.remove("swap");
    }, REDUCED ? 0 : 220);
  };
  setCopy(0);

  let progress = 0, visible = false;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
  io.observe(section);

  const readScroll = () => {
    const r = section.getBoundingClientRect();
    const total = r.height - innerHeight;
    progress = total > 0 ? clamp(-r.top / total) : 0;
  };
  addEventListener("scroll", readScroll, { passive: true });
  readScroll();

  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => t * t * (3 - 2 * t);
  // Maps p from [a,b] onto [0,1], clamped.
  const seg = (p, a, b) => clamp((p - a) / (b - a));

  let shown = 0;              // eased progress actually rendered
  let spin = 0;               // accumulated wheel rotation

  const frameLoop = () => {
    requestAnimationFrame(frameLoop);
    if (!visible) return;

    shown = REDUCED ? progress : lerp(shown, progress, 0.09);
    const p = shown;

    // ── camera orbit ────────────────────────────────────────────────────
    // front three-quarter → side → low hero → raised orbit
    const az = lerp(-0.55, Math.PI * 1.75, smooth(p));
    const radius = lerp(3.35, 2.55, smooth(seg(p, 0, 0.7)))
                 + Math.sin(p * Math.PI) * 0.35;
    const height = lerp(0.85, 1.25, smooth(seg(p, 0.55, 1)))
                 - Math.sin(seg(p, 0, 0.5) * Math.PI) * 0.35;
    camera.position.set(Math.cos(az) * radius, Math.max(0.18, height), Math.sin(az) * radius);
    camera.lookAt(0, 0.52, 0);

    // ── exploded view (phase B) ─────────────────────────────────────────
    const ex = Math.sin(seg(p, 0.28, 0.66) * Math.PI); // 0 → 1 → 0
    rest.forEach((home, part) => {
      const dir = part.userData?.explode;
      if (!dir) return;
      part.position.set(
        home.x + dir.x * ex,
        home.y + dir.y * ex,
        home.z + dir.z * ex
      );
    });

    // ── wheels roll while the camera sweeps ─────────────────────────────
    if (!REDUCED) {
      spin += 0.012 + (1 - ex) * 0.03;
      if (parts.frontWheel) parts.frontWheel.rotation.z = -spin;
      if (parts.rearWheel) parts.rearWheel.rotation.z = -spin;
    }

    // ── UI ──────────────────────────────────────────────────────────────
    progEl.style.height = `${p * 100}%`;
    hintEl.classList.toggle("gone", p > 0.04);
    specRows.forEach((row, i) => {
      row.classList.toggle("on", p > 0.30 + i * 0.055);
    });
    let idx = 0;
    for (let i = 0; i < COPY.length; i++) if (p >= COPY[i].at) idx = i;
    setCopy(idx);

    renderer.render(scene, camera);
  };
  frameLoop();
}
