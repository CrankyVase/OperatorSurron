/* ============================================================================
   FX — the interaction layer.

   Custom cursor, magnetic buttons, rolling odometer digits, velocity-reactive
   type strips, scrollspy, hero parallax. Every piece degrades to nothing:
   coarse pointer, reduced motion or a failed import all leave a page that
   still reads and works.
   ========================================================================== */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;

export function initFX({ reduced = false } = {}) {
  initOdometers(reduced);
  initSpy();
  initDragRails();
  if (reduced) return;                    // everything below is pure motion
  initCursor();
  initMagnets();
  initStrips();
  initHeroParallax();
}

/* ── drag-to-scroll rails (shorts + story) ───────────────────────────────── */
function initDragRails() {
  ["#shortsRail", "#storyRail"].forEach((sel) => {
    const rail = $(sel);
    if (!rail) return;
    let down = false, startX = 0, startL = 0, moved = 0;

    rail.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse") return;         // touch scrolls natively
      down = true; moved = 0;
      startX = e.clientX; startL = rail.scrollLeft;
      rail.style.scrollSnapType = "none";            // snap fights the drag
    });
    addEventListener("pointermove", (e) => {
      if (!down) return;
      const d = e.clientX - startX;
      moved = Math.max(moved, Math.abs(d));
      if (moved > 4) rail.scrollLeft = startL - d;
    }, { passive: true });
    addEventListener("pointerup", () => {
      if (!down) return;
      down = false;
      rail.style.scrollSnapType = "";
    });
    // a drag must not fire the card underneath it as a click
    rail.addEventListener("click", (e) => {
      if (moved > 8) { e.preventDefault(); e.stopPropagation(); }
    }, true);
  });
}

/* ── odometer — every big number rolls like hardware ─────────────────────── */
/* Builds one vertical 0-9 rail per digit; non-digits stay put. The rail
   slides to its target with a per-column stagger, so "1.36M" arrives like a
   meter catching up rather than text being swapped. */

const shapeOf = (str) => str.replace(/\d/g, "#");

export function odo(el, str, { roll = true } = {}) {
  if (el.dataset.odoShape !== shapeOf(str)) build(el, str);
  el.dataset.odoTarget = str;
  if (roll) odoRoll(el);
}

function build(el, str) {
  el.classList.add("odo");
  el.dataset.odoShape = shapeOf(str);
  let d = 0;
  el.innerHTML = [...str].map((ch) => {
    if (/\d/.test(ch)) {
      const delay = `${d++ * 90}ms`;
      return `<span class="odo__w"><span class="odo__r" style="--d:0;transition-delay:${delay}">`
           + "0123456789".split("").map((n) => `<i>${n}</i>`).join("")
           + `</span></span>`;
    }
    const suf = /[A-Za-z]/.test(ch);
    return `<span class="odo__c${suf ? " odo__suf" : ""}">${ch}</span>`;
  }).join("");
}

function odoRoll(el) {
  const target = el.dataset.odoTarget || "";
  const rails = $$(".odo__r", el);
  const digits = target.match(/\d/g) || [];
  rails.forEach((r, i) => r.style.setProperty("--d", digits[i] ?? "0"));
}

function initOdometers(reduced) {
  // Targets read from the markup itself, so a failed script changes nothing.
  const els = $$(".stat b, .hud__row b, .kitnum b");
  els.forEach((el) => odo(el, el.textContent.trim(), { roll: false }));
  if (reduced) { els.forEach((el) => odoRoll(el)); return; }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      odoRoll(en.target);
      io.unobserve(en.target);
    });
  }, { threshold: 0.5 });
  els.forEach((el) => io.observe(el));
}

/* ── cursor — dot + lagging ring, difference blend ───────────────────────── */
function initCursor() {
  if (!matchMedia("(pointer:fine)").matches) return;

  const el = document.createElement("div");
  el.className = "cur";
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = `<i class="cur__dot"></i>
    <span class="cur__ring"><span class="cur__c"><b class="cur__lab"></b></span></span>`;
  document.body.appendChild(el);
  document.documentElement.classList.add("has-cur");

  const dot = $(".cur__dot", el), ring = $(".cur__ring", el), lab = $(".cur__lab", el);
  let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, seen = false;

  const setState = (t) => {
    const media = t?.closest?.("[data-cur]");
    const field = t?.closest?.("input, textarea, select");
    const act = t?.closest?.("a, button, [role='tab'], label, summary");
    el.classList.toggle("media", !!media);
    el.classList.toggle("act", !media && !!act);
    el.classList.toggle("off", !!field);
    if (media) lab.textContent = media.dataset.cur;
  };

  addEventListener("pointermove", (e) => {
    x = e.clientX; y = e.clientY;
    if (!seen) { seen = true; rx = x; ry = y; el.classList.add("on"); }
    setState(e.target);
  }, { passive: true });

  // scrolling moves the page under a stationary pointer — re-resolve what's
  // beneath it so a "PLAY" ring can't outlive the thumbnail it was born on
  let scrollTick = false;
  addEventListener("scroll", () => {
    if (!seen || scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(() => {
      scrollTick = false;
      setState(document.elementFromPoint(x, y));
    });
  }, { passive: true });

  addEventListener("pointerdown", () => el.classList.add("press"));
  addEventListener("pointerup", () => el.classList.remove("press"));
  document.documentElement.addEventListener("pointerleave", () => el.classList.remove("on"));
  document.documentElement.addEventListener("pointerenter", () => { if (seen) el.classList.add("on"); });

  const tick = () => {
    requestAnimationFrame(tick);
    rx = lerp(rx, x, 0.16); ry = lerp(ry, y, 0.16);
    dot.style.transform = `translate3d(${x}px,${y}px,0)`;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
  };
  tick();
}

/* ── magnetic buttons ────────────────────────────────────────────────────── */
function initMagnets() {
  if (!matchMedia("(pointer:fine)").matches) return;
  $$(".btn").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      const dx = (e.clientX - r.x - r.width / 2) / r.width;
      const dy = (e.clientY - r.y - r.height / 2) / r.height;
      b.classList.add("is-mag");
      b.style.translate = `${dx * 12}px ${dy * 8}px`;
    });
    b.addEventListener("pointerleave", () => {
      b.classList.remove("is-mag");
      b.style.translate = "";
    });
  });
}

/* ── kinetic type strips — speed and skew follow scroll velocity ─────────── */
function initStrips() {
  const strips = $$(".strip");
  if (!strips.length) return;

  const state = strips.map((s, i) => {
    const track = $(".strip__track", s);
    const src = track.innerHTML;
    // enough copies to loop on any viewport
    let copies = 1;
    while (track.scrollWidth < innerWidth * 2 + 400 && copies < 12) {
      track.innerHTML += src; copies++;
    }
    // wrap period = one copy INCLUDING the flex gap between copies,
    // otherwise the loop seams by exactly one gap every cycle
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const period = (track.scrollWidth + gap) / copies;
    return { s, track, x: 0, w: period, copies, dir: i % 2 ? 1 : -1, vis: false };
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      const st = state.find((v) => v.s === en.target);
      if (st) st.vis = en.isIntersecting;
    });
  }, { rootMargin: "80px 0px" });
  state.forEach((st) => io.observe(st.s));
  addEventListener("resize", () => state.forEach((st) => {
    const gap = parseFloat(getComputedStyle(st.track).columnGap) || 0;
    st.w = (st.track.scrollWidth + gap) / st.copies;
  }));

  let last = scrollY, v = 0;
  const tick = () => {
    requestAnimationFrame(tick);
    const dy = scrollY - last; last = scrollY;
    v = lerp(v, clamp(dy, -90, 90), 0.09);
    const skew = clamp(v * -0.22, -10, 10);
    state.forEach((st) => {
      if (!st.vis) return;
      st.x -= (0.9 + Math.abs(v) * 0.55) * st.dir;
      const x = ((st.x % st.w) + st.w) % st.w;                 // wrap 0..w
      st.track.style.transform = `translate3d(${-x}px,0,0) skewX(${skew * st.dir}deg)`;
    });
  };
  tick();
}

/* ── scrollspy + nav progress hairline ───────────────────────────────────── */
function initSpy() {
  const nav = $("#nav");
  const links = $$(".nav__links a").filter((a) => a.hash);
  const byId = new Map(links.map((a) => [a.hash.slice(1), a]));

  if (links.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((l) => l.classList.toggle("on", l === byId.get(en.target.id)));
      });
    }, { rootMargin: "-38% 0px -58% 0px" });
    byId.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const doc = document.documentElement;
      const p = clamp(scrollY / Math.max(1, doc.scrollHeight - innerHeight), 0, 1);
      nav?.style.setProperty("--sp", p.toFixed(4));
    });
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ── hero parallax — bg, copy and hud leave at different rates ───────────── */
function initHeroParallax() {
  const bg = $(".hero__bg"), body = $(".hero__body"), hud = $(".hud");
  if (!bg) return;
  // the hud's entrance animation fills forwards, which outranks inline
  // styles — release it once it's done so scroll can drive opacity.
  // Pin the end state inline FIRST or it snaps back to the base opacity:0.
  let hudFree = false;
  hud?.addEventListener("animationend", () => {
    hud.style.opacity = "1";
    hud.style.animation = "none";
    hudFree = true;
  }, { once: true });
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = Math.min(scrollY, innerHeight);
      const f = clamp(1 - y / (innerHeight * 0.85), 0, 1);
      bg.style.transform = `translate3d(0,${(y * 0.3).toFixed(1)}px,0)`;
      if (body) {
        body.style.transform = `translate3d(0,${(y * 0.16).toFixed(1)}px,0)`;
        body.style.opacity = f.toFixed(3);
      }
      if (hud && hudFree) {
        hud.style.transform = `translate3d(0,${(y * 0.08).toFixed(1)}px,0)`;
        hud.style.opacity = f.toFixed(3);
      }
    });
  };
  addEventListener("scroll", onScroll, { passive: true });
}
