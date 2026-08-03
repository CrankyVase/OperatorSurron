/*
 * bike3d.js — Procedural Sur-Ron Light Bee X (the purple one).
 *
 * A fully procedural Three.js model of a specific Sur-Ron Light Bee X,
 * built from the owner's video frames (assets/frames/*): glossy purple
 * cast-alloy trellis frame with the signature triangular battery bay,
 * black 72V pack slab, mid-drive motor, black USD forks, knobby tyres
 * on spoked rims, long flat MX seat, angled rear coil-over and a round
 * LED headlight over a dark number plate. No textures, no loaders —
 * geometry only. Forward is +X, up is +Y, ground is y = 0, and the
 * group origin sits at ground level at the midpoint of the wheelbase.
 */

import * as THREE from '../assets/vendor/three.module.min.js';

export const PAINT = {
  purple: 0x8E6BC4,   // matte purple frame albedo (the real bike's paint)
  black: 0x141318,    // black anodised parts
  rubber: 0x0D0D10,   // tyre rubber
  alloy: 0x2A2A31,    // rim / hub alloy
  chrome: 0xC9CDD6,   // chrome / fork stanchion / bars
  carbon: 0x101014,   // carbon fibre panels / battery box
  accent: 0xFFFFFF,   // small white detail accents only
};

// ---- master geometry numbers (metres) --------------------------------------
const WHEELBASE = 1.255;
const FRONT_AXLE = { x: WHEELBASE / 2, y: 0.24 };   // front OD 0.48
const REAR_AXLE = { x: -WHEELBASE / 2, y: 0.23 };   // rear OD 0.46
const RAKE = 0.371;                                  // steering axis lean (rad)
const SDIR = { x: -Math.sin(RAKE), y: Math.cos(RAKE) }; // axle -> crown

// point on the steering axis, t metres up from the front axle
function steer(t) {
  return { x: FRONT_AXLE.x + SDIR.x * t, y: FRONT_AXLE.y + SDIR.y * t };
}

function makeMaterials(colors) {
  return {
    purple: new THREE.MeshStandardMaterial({ color: colors.purple, roughness: 0.55, metalness: 0.15 }),
    black: new THREE.MeshStandardMaterial({ color: colors.black, roughness: 0.45, metalness: 0.6 }),
    plastic: new THREE.MeshStandardMaterial({ color: colors.black, roughness: 0.72, metalness: 0.08, side: THREE.DoubleSide }),
    rubber: new THREE.MeshStandardMaterial({ color: colors.rubber, roughness: 0.95, metalness: 0.0, side: THREE.DoubleSide }),
    alloy: new THREE.MeshStandardMaterial({ color: colors.alloy, roughness: 0.35, metalness: 0.85 }),
    chrome: new THREE.MeshStandardMaterial({ color: colors.chrome, roughness: 0.12, metalness: 1.0 }),
    carbon: new THREE.MeshStandardMaterial({ color: colors.carbon, roughness: 0.30, metalness: 0.5, side: THREE.DoubleSide }),
    accent: new THREE.MeshStandardMaterial({ color: colors.accent, roughness: 0.35, metalness: 0.05 }),
    lens: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xf2f4fa, emissiveIntensity: 2.2, roughness: 0.2, metalness: 0.0 }),
  };
}

// add mesh helper
function M(parent, geometry, material, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

function part(root, parts, key, label, explode) {
  const g = new THREE.Group();
  g.name = key;
  g.userData.label = label;
  g.userData.explode = new THREE.Vector3(explode[0], explode[1], explode[2]);
  root.add(g);
  parts[key] = g;
  return g;
}

// ---- wheels ----------------------------------------------------------------

// knobby tyre as a lathe of a squared-off superellipse cross-section
function tyreGeometry(Rc, rh, rw) {
  const pts = [];
  const N = 26;
  const f = (c) => Math.sign(c) * Math.pow(Math.abs(c), 0.7);
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    pts.push(new THREE.Vector2(Rc + rh * f(Math.cos(a)), rw * f(Math.sin(a))));
  }
  const geo = new THREE.LatheGeometry(pts, 44);
  geo.rotateX(Math.PI / 2); // axis -> z
  return geo;
}

function addKnobs(wheel, mats, R, rw, count) {
  const geo = new THREE.BoxGeometry(0.03, 0.024, 0.034);
  const rows = [
    { r: R - 0.013, z: 0, tilt: 0, n: count, phase: 0 },
    { r: R - 0.021, z: rw * 0.82, tilt: 0.62, n: count - 4, phase: 0.5 },
    { r: R - 0.021, z: -rw * 0.82, tilt: -0.62, n: count - 4, phase: 0.5 },
  ];
  const total = rows.reduce((s, r) => s + r.n, 0);
  const inst = new THREE.InstancedMesh(geo, mats.rubber, total);
  const dummy = new THREE.Object3D();
  let i = 0;
  for (const row of rows) {
    for (let k = 0; k < row.n; k++) {
      const a = ((k + row.phase) / row.n) * Math.PI * 2;
      dummy.position.set(Math.cos(a) * row.r, Math.sin(a) * row.r, row.z);
      dummy.rotation.set(0, 0, a - Math.PI / 2);
      dummy.rotateX(row.tilt);
      dummy.updateMatrix();
      inst.setMatrixAt(i++, dummy.matrix);
    }
  }
  inst.castShadow = true;
  wheel.add(inst);
  return inst;
}

function addSpokes(wheel, mats, hubR, hubZ, rimR, n) {
  const geo = new THREE.CylinderGeometry(0.0023, 0.0023, 1, 5, 1);
  const inst = new THREE.InstancedMesh(geo, mats.black, n);
  const dummy = new THREE.Object3D();
  const A = new THREE.Vector3();
  const B = new THREE.Vector3();
  const dir = new THREE.Vector3();
  const Y = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const side = i % 2 ? 1 : -1;
    const cross = (i % 4 < 2 ? 1 : -1) * 0.30;
    A.set(Math.cos(a) * hubR, Math.sin(a) * hubR, side * hubZ);
    B.set(Math.cos(a + cross) * rimR, Math.sin(a + cross) * rimR, side * 0.005);
    dir.subVectors(B, A);
    const len = dir.length();
    dummy.position.copy(A).add(B).multiplyScalar(0.5);
    dummy.quaternion.setFromUnitVectors(Y, dir.normalize());
    dummy.scale.set(1, len, 1);
    dummy.updateMatrix();
    inst.setMatrixAt(i, dummy.matrix);
  }
  inst.castShadow = true;
  wheel.add(inst);
  return inst;
}

function buildWheel(mats, { Rc, rh, rw, rimR, hubLen, knobs }) {
  const w = new THREE.Group(); // local origin = axle centre, spins about z
  M(w, tyreGeometry(Rc, rh, rw), mats.rubber);
  addKnobs(w, mats, Rc + rh, rw, knobs);
  M(w, new THREE.TorusGeometry(rimR, 0.013, 8, 30), mats.alloy);
  M(w, new THREE.CylinderGeometry(0.045, 0.045, hubLen, 18), mats.alloy, 0, 0, 0, Math.PI / 2, 0, 0);
  addSpokes(w, mats, 0.045, hubLen * 0.4, rimR - 0.008, 28);
  return w;
}

// ---- chain -----------------------------------------------------------------

function chainMesh(mats, c1, r1, c2, r2, z) {
  const dx = c2.x - c1.x, dy = c2.y - c1.y;
  const L = Math.hypot(dx, dy);
  const th0 = Math.atan2(dy, dx);
  const phi = Math.acos((r1 - r2) / L);
  const psA = th0 + phi;
  const psB = th0 - phi;
  const pts = [];
  const push = (cx, cy, r, ps) => pts.push(new THREE.Vector3(cx + r * Math.cos(ps), cy + r * Math.sin(ps), z));
  // wrap the rear sprocket (clockwise, psA -> psB)
  for (let i = 0; i <= 28; i++) push(c2.x, c2.y, r2, psA - (i / 28) * (2 * phi));
  // top run to the front sprocket
  for (let i = 1; i < 6; i++) {
    const t = i / 6;
    pts.push(new THREE.Vector3(
      (c2.x + r2 * Math.cos(psB)) * (1 - t) + (c1.x + r1 * Math.cos(psB)) * t,
      (c2.y + r2 * Math.sin(psB)) * (1 - t) + (c1.y + r1 * Math.sin(psB)) * t, z));
  }
  // wrap the front sprocket
  for (let i = 0; i <= 20; i++) push(c1.x, c1.y, r1, psB - (i / 20) * (2 * Math.PI - 2 * phi));
  // bottom run back
  for (let i = 1; i < 6; i++) {
    const t = i / 6;
    pts.push(new THREE.Vector3(
      (c1.x + r1 * Math.cos(psA)) * (1 - t) + (c2.x + r2 * Math.cos(psA)) * t,
      (c1.y + r1 * Math.sin(psA)) * (1 - t) + (c2.y + r2 * Math.sin(psA)) * t, z));
  }
  const curve = new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.1);
  const geo = new THREE.TubeGeometry(curve, 150, 0.0085, 6, true);
  const m = new THREE.Mesh(geo, mats.alloy);
  m.castShadow = true;
  return m;
}

// ---- main factory ----------------------------------------------------------

export function createSurRon(options = {}) {
  const colors = Object.assign({}, PAINT, options.paint || {});
  const mats = makeMaterials(colors);
  const group = new THREE.Group();
  group.name = 'surron-lightbee-x';
  const parts = {};

  // ---------------- frame: twin cast side plates with two cutouts ----------
  const frame = part(group, parts, 'frame', 'Trellis Frame', [0, 0.35, 0]);
  {
    const s = new THREE.Shape();
    const O = [
      [-0.20, 0.155], [-0.16, 0.132], [0.16, 0.112], [0.30, 0.158],
      [0.47, 0.715], [0.445, 0.80], [0.36, 0.965], [0.245, 0.875],
      [0.02, 0.775], [-0.22, 0.73], [-0.38, 0.70], [-0.45, 0.625],
      [-0.37, 0.562], [-0.255, 0.545], [-0.235, 0.40], [-0.247, 0.295],
      [-0.23, 0.205],
    ];
    s.moveTo(O[0][0], O[0][1]);
    for (let i = 1; i < O.length; i++) s.lineTo(O[i][0], O[i][1]);
    s.closePath();
    // main triangular battery bay (the signature cutout)
    const hA = new THREE.Path();
    hA.moveTo(0.345, 0.70);
    hA.lineTo(0.205, 0.235);
    hA.lineTo(-0.09, 0.29);
    hA.lineTo(0.03, 0.635);
    hA.closePath();
    s.holes.push(hA);
    // rear cutout where the shock lives
    const hB = new THREE.Path();
    hB.moveTo(-0.055, 0.60);
    hB.lineTo(-0.13, 0.34);
    hB.lineTo(-0.21, 0.44);
    hB.closePath();
    s.holes.push(hB);
    const plateGeo = new THREE.ExtrudeGeometry(s, {
      depth: 0.036, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004,
      bevelSegments: 1, curveSegments: 6,
    });
    M(frame, plateGeo, mats.purple, 0, 0, 0.052);
    M(frame, plateGeo, mats.purple, 0, 0, -0.088);
    // head tube along the steering axis
    const ht = steer(0.695);
    M(frame, new THREE.CylinderGeometry(0.045, 0.045, 0.14, 16), mats.purple, ht.x, ht.y, 0, 0, 0, RAKE);
    // gusset behind the head tube
    M(frame, new THREE.BoxGeometry(0.05, 0.15, 0.115), mats.purple, 0.415, 0.855, 0, 0, 0, RAKE);
    // seat rail cross plate
    M(frame, new THREE.BoxGeometry(0.42, 0.025, 0.12), mats.purple, -0.13, 0.715, 0, 0, 0, -0.05);
    // bottom skid / motor cradle
    M(frame, new THREE.BoxGeometry(0.46, 0.03, 0.14), mats.black, 0.02, 0.14, 0);
    // swingarm pivot tube
    M(frame, new THREE.CylinderGeometry(0.028, 0.028, 0.21, 12), mats.purple, -0.225, 0.26, 0, Math.PI / 2, 0, 0);
    // carbon "tank" cover sloping up the top rail toward the head tube
    M(frame, new THREE.BoxGeometry(0.30, 0.035, 0.10), mats.carbon, 0.175, 0.885, 0, 0, 0, 0.51);
  }

  // ---------------- battery: black slab leaning with the downtube ----------
  const battery = part(group, parts, 'battery', '72V Pack', [0.05, 0.3, 0.85]);
  {
    battery.position.set(0.165, 0.44, 0);
    battery.rotation.z = -0.31;
    M(battery, new THREE.BoxGeometry(0.20, 0.42, 0.11), mats.carbon);
    M(battery, new THREE.BoxGeometry(0.10, 0.022, 0.04), mats.black, 0, 0.222, 0); // carry handle
    M(battery, new THREE.BoxGeometry(0.09, 0.045, 0.004), mats.accent, 0.02, 0.06, 0.0575); // white label
    M(battery, new THREE.BoxGeometry(0.14, 0.03, 0.006), mats.black, -0.01, -0.12, 0.056); // vent detail
  }

  // ---------------- motor + controller -------------------------------------
  const motor = part(group, parts, 'motor', 'Mid-Drive Motor', [0.05, -0.5, 0.55]);
  {
    motor.position.set(-0.10, 0.22, 0);
    M(motor, new THREE.CylinderGeometry(0.09, 0.09, 0.19, 24), mats.black, 0, 0, 0, Math.PI / 2, 0, 0);
    M(motor, new THREE.CylinderGeometry(0.055, 0.055, 0.02, 18), mats.alloy, 0, 0, 0.104, Math.PI / 2, 0, 0);
    M(motor, new THREE.CylinderGeometry(0.048, 0.048, 0.014, 16), mats.alloy, 0, 0, 0.117, Math.PI / 2, 0, 0); // drive sprocket
    M(motor, new THREE.BoxGeometry(0.11, 0.12, 0.10), mats.black, 0.26, -0.05, 0); // finned controller box
  }

  // ---------------- wheels ---------------------------------------------------
  const frontWheel = part(group, parts, 'frontWheel', 'Front Wheel', [0.95, 0, 0]);
  frontWheel.position.set(FRONT_AXLE.x, FRONT_AXLE.y, 0);
  {
    const w = buildWheel(mats, { Rc: 0.1975, rh: 0.0425, rw: 0.055, rimR: 0.148, hubLen: 0.075, knobs: 24 });
    frontWheel.add(w);
    M(frontWheel, new THREE.CylinderGeometry(0.088, 0.088, 0.006, 24), mats.alloy, 0, 0, -0.072, Math.PI / 2, 0, 0); // brake disc
  }
  const rearWheel = part(group, parts, 'rearWheel', 'Rear Wheel', [-0.95, 0, 0]);
  rearWheel.position.set(REAR_AXLE.x, REAR_AXLE.y, 0);
  {
    const w = buildWheel(mats, { Rc: 0.19, rh: 0.04, rw: 0.062, rimR: 0.143, hubLen: 0.08, knobs: 22 });
    rearWheel.add(w);
    M(rearWheel, new THREE.CylinderGeometry(0.105, 0.105, 0.012, 26), mats.alloy, 0, 0, 0.115, Math.PI / 2, 0, 0); // rear sprocket
    M(rearWheel, new THREE.CylinderGeometry(0.08, 0.08, 0.006, 24), mats.alloy, 0, 0, -0.112, Math.PI / 2, 0, 0); // brake disc
  }

  // ---------------- USD forks + triple clamps -------------------------------
  const fork = part(group, parts, 'fork', 'USD Forks', [0.55, -0.35, 0]);
  {
    for (const zs of [-1, 1]) {
      const z = zs * 0.10;
      const up = steer(0.44); // fat black outers, clamped in the triples
      M(fork, new THREE.CylinderGeometry(0.031, 0.031, 0.58, 14), mats.black, up.x, up.y, z, 0, 0, RAKE);
      const lo = steer(0.10); // exposed stanchions near the axle
      M(fork, new THREE.CylinderGeometry(0.019, 0.019, 0.20, 12), mats.chrome, lo.x, lo.y, z, 0, 0, RAKE);
    }
    const c1 = steer(0.595);
    M(fork, new THREE.BoxGeometry(0.075, 0.045, 0.25), mats.black, c1.x, c1.y, 0, 0, 0, RAKE); // lower crown
    const c2 = steer(0.79);
    M(fork, new THREE.BoxGeometry(0.065, 0.04, 0.24), mats.black, c2.x, c2.y, 0, 0, 0, RAKE);  // top clamp
    M(fork, new THREE.CylinderGeometry(0.013, 0.013, 0.23, 10), mats.chrome, FRONT_AXLE.x, FRONT_AXLE.y, 0, Math.PI / 2, 0, 0); // axle
    M(fork, new THREE.BoxGeometry(0.055, 0.075, 0.03), mats.black, 0.585, 0.315, -0.095); // brake caliper
  }

  // ---------------- handlebar -----------------------------------------------
  const handlebar = part(group, parts, 'handlebar', 'MX Handlebar', [0.15, 0.9, 0]);
  {
    handlebar.position.set(0.338, 1.018, 0);
    const pts = [
      [-0.048, 0.062, -0.40], [-0.042, 0.060, -0.30], [-0.022, 0.040, -0.21],
      [0, 0.006, -0.115], [0, 0, 0], [0, 0.006, 0.115],
      [-0.022, 0.040, 0.21], [-0.042, 0.060, 0.30], [-0.048, 0.062, 0.40],
    ].map((p) => new THREE.Vector3(p[0], p[1], p[2]));
    const curve = new THREE.CatmullRomCurve3(pts);
    M(handlebar, new THREE.TubeGeometry(curve, 48, 0.0145, 10), mats.chrome);
    M(handlebar, new THREE.CylinderGeometry(0.008, 0.008, 0.34, 8), mats.chrome, -0.012, 0.03, 0, Math.PI / 2, 0, 0); // crossbar
    M(handlebar, new THREE.BoxGeometry(0.05, 0.045, 0.13), mats.plastic, -0.012, 0.032, 0); // crossbar pad
    for (const zs of [-1, 1]) {
      M(handlebar, new THREE.CylinderGeometry(0.019, 0.019, 0.115, 12), mats.rubber, -0.045, 0.061, zs * 0.345, Math.PI / 2, 0, 0); // grip
      const lever = M(handlebar, new THREE.CylinderGeometry(0.004, 0.0075, 0.15, 8), mats.black, 0.045, 0.052, zs * 0.235);
      lever.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0.9, 0.12, zs * -0.42).normalize());
      M(handlebar, new THREE.BoxGeometry(0.03, 0.045, 0.035), mats.black, 0, -0.02, zs * 0.045); // riser
    }
  }

  // ---------------- seat ----------------------------------------------------
  const seat = part(group, parts, 'seat', 'MX Seat', [-0.2, 0.95, 0]);
  {
    const s = new THREE.Shape();
    s.moveTo(0.33, 0.755);
    s.quadraticCurveTo(0.32, 0.83, 0.14, 0.845);
    s.lineTo(-0.42, 0.838);
    s.quadraticCurveTo(-0.60, 0.845, -0.71, 0.875);
    s.quadraticCurveTo(-0.715, 0.85, -0.70, 0.838);
    s.quadraticCurveTo(-0.52, 0.79, -0.30, 0.788);
    s.lineTo(0.10, 0.772);
    s.quadraticCurveTo(0.28, 0.762, 0.33, 0.755);
    s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, {
      depth: 0.17, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012,
      bevelSegments: 2, curveSegments: 8,
    });
    M(seat, geo, mats.rubber, 0, 0, -0.085);
  }

  // ---------------- swingarm ------------------------------------------------
  const swingarm = part(group, parts, 'swingarm', 'Swingarm', [-0.55, -0.35, 0]);
  {
    const s = new THREE.Shape();
    s.moveTo(-0.155, 0.315);
    s.lineTo(-0.42, 0.292);
    s.lineTo(-0.585, 0.278);
    s.quadraticCurveTo(-0.665, 0.27, -0.665, 0.232);
    s.quadraticCurveTo(-0.665, 0.196, -0.585, 0.192);
    s.lineTo(-0.30, 0.178);
    s.lineTo(-0.165, 0.172);
    s.quadraticCurveTo(-0.135, 0.24, -0.155, 0.315);
    s.closePath();
    const h = new THREE.Path(); // sculpted lightening slot
    h.moveTo(-0.49, 0.248);
    h.lineTo(-0.26, 0.268);
    h.lineTo(-0.26, 0.238);
    h.lineTo(-0.49, 0.222);
    h.closePath();
    s.holes.push(h);
    const geo = new THREE.ExtrudeGeometry(s, {
      depth: 0.026, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003,
      bevelSegments: 1, curveSegments: 6,
    });
    M(swingarm, geo, mats.purple, 0, 0, 0.075);
    M(swingarm, geo, mats.purple, 0, 0, -0.101);
    M(swingarm, new THREE.BoxGeometry(0.10, 0.05, 0.19), mats.purple, -0.30, 0.255, 0); // cross brace
    M(swingarm, new THREE.CylinderGeometry(0.012, 0.012, 0.24, 10), mats.chrome, REAR_AXLE.x, REAR_AXLE.y, 0, Math.PI / 2, 0, 0); // axle
    M(swingarm, new THREE.BoxGeometry(0.06, 0.045, 0.03), mats.black, -0.56, 0.285, -0.112); // rear caliper
  }

  // ---------------- rear monoshock -----------------------------------------
  const shock = part(group, parts, 'shock', 'Rear Monoshock', [-0.35, 0.55, 0.3]);
  {
    const top = new THREE.Vector3(-0.05, 0.60, 0);
    const bottom = new THREE.Vector3(-0.26, 0.30, 0);
    const dir = bottom.clone().sub(top).normalize();
    const sub = new THREE.Group();
    sub.position.copy(top);
    sub.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
    shock.add(sub);
    M(sub, new THREE.CylinderGeometry(0.028, 0.028, 0.20, 14), mats.black, 0, -0.115, 0);
    M(sub, new THREE.CylinderGeometry(0.011, 0.011, 0.13, 10), mats.chrome, 0, -0.30, 0);
    M(sub, new THREE.CylinderGeometry(0.021, 0.021, 0.09, 10), mats.black, 0.052, -0.05, 0); // piggyback reservoir
    M(sub, new THREE.TorusGeometry(0.047, 0.008, 6, 18), mats.accent, 0, -0.055, 0, Math.PI / 2, 0, 0); // preload ring
    // coil spring as a helical tube
    const coils = 7.5, r = 0.047, y0 = -0.07, y1 = -0.30;
    const hp = [];
    for (let i = 0; i <= 90; i++) {
      const t = i / 90;
      const a = t * coils * Math.PI * 2;
      hp.push(new THREE.Vector3(Math.cos(a) * r, y0 + (y1 - y0) * t, Math.sin(a) * r));
    }
    M(sub, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hp), 180, 0.0085, 6), mats.black);
    // linkage plates down to the swingarm
    M(shock, new THREE.BoxGeometry(0.10, 0.028, 0.012), mats.alloy, -0.285, 0.285, 0.032, 0, 0, 0.25);
    M(shock, new THREE.BoxGeometry(0.10, 0.028, 0.012), mats.alloy, -0.285, 0.285, -0.032, 0, 0, 0.25);
  }

  // ---------------- headlight + number plate --------------------------------
  const headlight = part(group, parts, 'headlight', 'LED Headlight', [0.85, 0.25, 0]);
  {
    const tilt = Math.PI / 2 - 0.12; // faces forward, nose up a touch
    M(headlight, new THREE.CylinderGeometry(0.075, 0.068, 0.06, 22), mats.black, 0.41, 0.95, 0, 0, 0, tilt);
    M(headlight, new THREE.CylinderGeometry(0.058, 0.058, 0.012, 20), mats.lens, 0.443, 0.954, 0, 0, 0, tilt);
    M(headlight, new THREE.TorusGeometry(0.062, 0.007, 8, 22), mats.black, 0.442, 0.954, 0, 0, Math.PI / 2, 0.12);
    M(headlight, new THREE.BoxGeometry(0.05, 0.03, 0.10), mats.black, 0.372, 0.943, 0); // bracket
    M(headlight, new THREE.BoxGeometry(0.012, 0.20, 0.17), mats.plastic, 0.475, 0.815, 0, 0, 0, RAKE); // number plate
    M(headlight, new THREE.BoxGeometry(0.004, 0.028, 0.11), mats.accent, 0.483, 0.818, 0, 0, 0, RAKE); // race number decal
  }

  // ---------------- fenders --------------------------------------------------
  const frontFender = part(group, parts, 'frontFender', 'Front Fender', [0.55, 0.55, 0]);
  {
    const s = new THREE.Shape();
    s.absarc(0, 0, 0.30, 0.10, 2.30, false);
    s.absarc(0, 0, 0.272, 2.30, 0.10, true);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.15, bevelEnabled: false, curveSegments: 20 });
    M(frontFender, geo, mats.carbon, FRONT_AXLE.x, 0.35, -0.075);
  }
  const rearFender = part(group, parts, 'rearFender', 'Rear Fender', [-0.65, 0.5, 0]);
  {
    const s = new THREE.Shape();
    s.moveTo(-0.36, 0.71);
    s.quadraticCurveTo(-0.64, 0.70, -0.935, 0.575);
    s.lineTo(-0.935, 0.545);
    s.quadraticCurveTo(-0.64, 0.665, -0.36, 0.675);
    s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.14, bevelEnabled: false, curveSegments: 10 });
    M(rearFender, geo, mats.carbon, 0, 0, -0.07);
    M(rearFender, new THREE.BoxGeometry(0.06, 0.02, 0.004), mats.accent, -0.80, 0.60, 0.071, 0, 0, -0.35); // white decal
  }

  // ---------------- chain ----------------------------------------------------
  const chain = part(group, parts, 'chain', 'Drive Chain', [-0.3, -0.3, 0.7]);
  chain.add(chainMesh(mats, { x: -0.10, y: 0.22 }, 0.045, { x: REAR_AXLE.x, y: REAR_AXLE.y }, 0.105, 0.117));

  // ---------------- footpegs -------------------------------------------------
  const pegs = part(group, parts, 'pegs', 'Footpegs', [0, -0.75, 0]);
  for (const zs of [-1, 1]) {
    M(pegs, new THREE.BoxGeometry(0.05, 0.05, 0.05), mats.black, -0.14, 0.235, zs * 0.10);
    M(pegs, new THREE.BoxGeometry(0.095, 0.02, 0.10), mats.alloy, -0.14, 0.235, zs * 0.175);
  }

  return { group, parts };
}

// ---- dark studio lighting ---------------------------------------------------

export function addStudioLights(scene) {
  // low violet-grey ambient bounce
  const hemisphere = new THREE.HemisphereLight(0x4a4160, 0x080709, 0.6);
  scene.add(hemisphere);

  // warm-white key, high front-right
  const key = new THREE.DirectionalLight(0xfff2e4, 2.4);
  key.position.set(2.3, 3.1, 1.7);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 10;
  key.shadow.camera.left = -2.2;
  key.shadow.camera.right = 2.2;
  key.shadow.camera.top = 2.2;
  key.shadow.camera.bottom = -2.2;
  key.shadow.bias = -0.0005;
  scene.add(key);
  scene.add(key.target);

  // violet rim from behind-left to carve the silhouette
  const rim = new THREE.DirectionalLight(0x9d7bff, 1.7);
  rim.position.set(-2.6, 1.7, -2.1);
  scene.add(rim);

  // cool-white kicker from the opposite side, low — controlled studio specular
  const kicker = new THREE.DirectionalLight(0xCFD4E0, 0.75);
  kicker.position.set(1.4, 0.5, 2.6);
  scene.add(kicker);

  return { hemisphere, key, rim, kicker };
}
