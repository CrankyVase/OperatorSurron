/* ============================================================================
   THE RIG — scroll-driven product display.

   Real photography carries the reveal; a wireframe blueprint of the bike
   takes over for the teardown beat, then the photography returns. Hand-built
   3D can't out-shoot a real camera, so it isn't asked to — it does the one
   job it's genuinely better at.
   ========================================================================== */

import { HERO } from "../data/hero.js";

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const seg = (p, a, b) => clamp((p - a) / (b - a));

/* The teardown window — where the photography dissolves to blueprint. */
const TEARDOWN_IN = 0.40;
const TEARDOWN_OUT = 0.62;

const COPY = [
  { at: 0.00, title: "THE PURPLE ONE",
    copy: "A Sur-Ron Light Bee X. Powder coat over cast alloy, built up from a bare frame." },
  { at: 0.26, title: "EVERY PART",
    copy: "About $10,000 of parts. I picked each one and fitted most of them on camera." },
  { at: TEARDOWN_IN, title: "STRIPPED BACK",
    copy: "Trellis frame, 72V pack, EBMX 9000 controller, mid-drive motor." },
  { at: TEARDOWN_OUT, title: "BACK TOGETHER",
    copy: "De-restricted and back on the ground. 19,000 watts at peak." },
  { at: 0.82, title: "WHERE IT LIVES",
    copy: "Dirt tracks, back roads, and the odd conversation with police." },
];

export function initRig({ reduced = false } = {}) {
  const section = document.querySelector("#rig");
  const stage = document.querySelector("#rigStage");
  const canvas = document.querySelector("#rigCanvas");
  if (!section || !stage) return;

  /* ── photo layers ─────────────────────────────────────────────────────── */
  stage.innerHTML = HERO.map((s, i) => `
    <figure class="shot${i === 0 ? " on" : ""}" data-i="${i}">
      <img src="${s.src}" alt="${s.label} — ${s.sub}"
           loading="${i < 2 ? "eager" : "lazy"}" decoding="async">
    </figure>`).join("");
  const shots = [...stage.querySelectorAll(".shot")];
  const imgs = shots.map((s) => s.querySelector("img"));

  const labEl = document.querySelector("#rigLabel");
  const subEl = document.querySelector("#rigSub");
  const idxEl = document.querySelector("#rigIdx");
  const titleEl = document.querySelector("#rigTitle");
  const copyEl = document.querySelector("#rigCopy");
  const progEl = document.querySelector("#rigProg");
  const hintEl = document.querySelector("#rigHint");
  const specRows = [...document.querySelectorAll(".rig__specrow")];
  const phaseEls = [...document.querySelectorAll(".rig__ph")];

  let copyIdx = -1;
  const setCopy = (i) => {
    if (i === copyIdx || !titleEl) return;
    copyIdx = i;
    titleEl.classList.add("swap"); copyEl.classList.add("swap");
    setTimeout(() => {
      titleEl.innerHTML = COPY[i].title;
      copyEl.textContent = COPY[i].copy;
      titleEl.classList.remove("swap"); copyEl.classList.remove("swap");
    }, reduced ? 0 : 240);
  };
  setCopy(0);

  let shotIdx = -1;
  const setShot = (i) => {
    if (i === shotIdx) return;
    shotIdx = i;
    const s = HERO[i];
    if (labEl) labEl.textContent = s.label;
    if (subEl) subEl.textContent = s.sub;
    if (idxEl) idxEl.textContent =
      `${String(i + 1).padStart(2, "0")} / ${String(HERO.length).padStart(2, "0")}`;
  };
  setShot(0);

  /* ── blueprint overlay (optional) ─────────────────────────────────────── */
  let blueprint = null;
  if (canvas && !reduced) {
    initBlueprint(canvas).then((b) => { blueprint = b; }).catch((e) => {
      console.warn("[rig] blueprint unavailable:", e.message);
      canvas.hidden = true;
    });
  } else if (canvas) {
    canvas.hidden = true;
  }

  /* ── scroll ───────────────────────────────────────────────────────────── */
  let progress = 0, shown = 0, visible = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; },
    { threshold: 0 }).observe(section);

  const read = () => {
    const r = section.getBoundingClientRect();
    const total = r.height - innerHeight;
    progress = total > 0 ? clamp(-r.top / total) : 0;
  };
  addEventListener("scroll", read, { passive: true });
  addEventListener("resize", read);
  read();

  const tick = () => {
    requestAnimationFrame(tick);
    if (!visible) return;

    shown = reduced ? progress : lerp(shown, progress, 0.085);
    const p = shown;

    /* Photography: each shot HOLDS, then dissolves quickly into the next.
       A constant two-way crossfade just reads as a muddy double exposure. */
    const n = HERO.length;
    const pos = clamp(p, 0, 0.9999) * n;
    const cur = Math.min(n - 1, Math.floor(pos));
    const t = pos - cur;                       // 0..1 within this shot's slot
    const FADE = 0.24;                         // last quarter of a slot dissolves
    const k = t <= 1 - FADE ? 0 : smooth((t - (1 - FADE)) / FADE);

    // Blueprint takes the stage mid-scroll; photography dips out behind it.
    const bp = Math.sin(clamp(seg(p, TEARDOWN_IN, TEARDOWN_OUT)) * Math.PI);
    const photoAlpha = 1 - bp * 0.92;

    shots.forEach((el, i) => {
      let a = 0;
      if (i === cur) a = 1 - k;
      else if (i === cur + 1) a = k;
      a *= photoAlpha;
      el.style.opacity = a.toFixed(3);
      if (a > 0.002) {
        // slow push across the whole slot, so the hold never feels static
        const local = i === cur ? t : t - 1;
        const s = 1.04 + local * 0.06;
        imgs[i].style.transform =
          `scale(${s.toFixed(4)}) translate3d(0, ${(local * -1.2).toFixed(2)}%, 0)`;
      }
    });
    setShot(k > 0.5 ? Math.min(n - 1, cur + 1) : cur);

    /* blueprint */
    if (blueprint) blueprint.update(p, bp);

    /* ui */
    if (progEl) progEl.style.width = `${(p * 100).toFixed(1)}%`;
    if (hintEl) hintEl.classList.toggle("gone", p > 0.03);
    specRows.forEach((row, i) => row.classList.toggle("on", p > 0.30 + i * 0.05));

    let ci = 0;
    for (let i = 0; i < COPY.length; i++) if (p >= COPY[i].at) ci = i;
    setCopy(ci);
    phaseEls.forEach((el, i) => el.classList.toggle("on", i === ci));

    section.style.setProperty("--p", p.toFixed(4));
  };
  tick();
}

/* ── blueprint: the bike as an exploded wireframe ─────────────────────────── */
async function initBlueprint(canvas) {
  const THREE = await import("../assets/vendor/three.module.min.js");
  const { createSurRon } = await import("./bike3d.js");

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);

  const { group, parts } = createSurRon();

  // Strip the solids; keep only the edges. A wireframe doesn't have to be
  // photoreal to be convincing — it just has to be accurate.
  const lineMat = new THREE.LineBasicMaterial({
    color: 0xB893FF, transparent: true, opacity: 0.85,
  });
  const dimMat = new THREE.LineBasicMaterial({
    color: 0xFFFFFF, transparent: true, opacity: 0.28,
  });

  const wire = new THREE.Group();
  const wireParts = new Map();   // partKey -> Group of LineSegments

  Object.entries(parts).forEach(([key, part]) => {
    const holder = new THREE.Group();
    holder.position.copy(part.position);
    part.updateWorldMatrix(true, true);
    part.traverse((o) => {
      if (!o.isMesh || !o.geometry) return;
      const edges = new THREE.EdgesGeometry(o.geometry, 26);
      const ls = new THREE.LineSegments(edges, key === "frame" ? lineMat : dimMat);
      o.updateWorldMatrix(true, false);
      ls.applyMatrix4(o.matrixWorld);
      ls.position.sub(part.position);
      holder.add(ls);
    });
    holder.userData.explode = part.userData?.explode?.clone?.() || new THREE.Vector3();
    holder.userData.home = holder.position.clone();
    wireParts.set(key, holder);
    wire.add(holder);
  });
  scene.add(wire);

  // dispose the solid original — we only ever draw the edges
  group.traverse((o) => { o.geometry?.dispose?.(); });

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

  return {
    update(p, bp) {
      if (bp <= 0.004) {
        canvas.style.opacity = "0";
        return;
      }
      canvas.style.opacity = bp.toFixed(3);

      const az = lerp(-0.5, Math.PI * 1.15, smooth(p));
      const rad = lerp(3.6, 3.0, smooth(p));
      camera.position.set(Math.cos(az) * rad, lerp(1.5, 0.85, smooth(p)), Math.sin(az) * rad);
      camera.lookAt(0, 0.55, 0);

      // explode scaled well down — the earlier magnitudes threw parts off-screen
      const ex = bp * 0.42;
      wireParts.forEach((holder) => {
        const d = holder.userData.explode, home = holder.userData.home;
        holder.position.set(home.x + d.x * ex, home.y + d.y * ex, home.z + d.z * ex);
      });

      lineMat.opacity = 0.85 * bp;
      dimMat.opacity = 0.28 * bp;
      renderer.render(scene, camera);
    },
  };
}
