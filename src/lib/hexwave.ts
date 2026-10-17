/*
 * LD hex shockwave, shared with the HyperFrames intro composition
 * (videos/ld-intro-motion/assets/hexwave.js). A pure function of time:
 * the same t always draws the same frame, with no randomness.
 */
const SQRT3 = Math.sqrt(3);

export type HexWaveOptions = {
  /** Second at which the ball hits the glass. */
  impact?: number;
  /** Wave origin in canvas px (defaults to the centre). */
  cx?: number;
  cy?: number;
  /** Hexagon radius in canvas px (defaults to a size that scales with the viewport). */
  cell?: number;
};

function hash(i: number, j: number) {
  let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function clamp01(x: number) {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}
function smooth(a: number, b: number, x: number) {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
}
function hexPath(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.moveTo(x + r * 0.8660254, y - r * 0.5);
  ctx.lineTo(x + r * 0.8660254, y + r * 0.5);
  ctx.lineTo(x, y + r);
  ctx.lineTo(x - r * 0.8660254, y + r * 0.5);
  ctx.lineTo(x - r * 0.8660254, y - r * 0.5);
  ctx.lineTo(x, y - r);
  ctx.closePath();
}
/* Hot near the front, brand orange (#FF5B14) in the body. */
function glow(I: number) {
  const hot = smooth(0.7, 1, I);
  const g = Math.round(91 + (176 - 91) * hot);
  const b = Math.round(20 + (122 - 20) * hot);
  return `rgba(255,${g},${b},${Math.min(1, I * 1.15).toFixed(3)})`;
}

export function drawHexWave(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
  opts: HexWaveOptions = {},
) {
  const impact = opts.impact ?? 1.1;
  const cx = opts.cx ?? W / 2;
  const cy = opts.cy ?? H / 2;
  const R = opts.cell ?? Math.max(5, Math.min(W, H) / 120);

  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#050505";
  ctx.fillRect(0, 0, W, H);

  const k = t - impact;
  if (k < 0) return;

  const maxR = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) + R * 6;
  const fronts: { F: number; band: number; amp: number }[] = [];
  for (const wv of [
    { k, dur: 1.75, amp: 1 },
    { k: k - 0.24, dur: 1.85, amp: 0.5 },
  ]) {
    if (wv.k <= 0) continue;
    const p = clamp01(wv.k / wv.dur);
    const amp = wv.amp * (1 - 0.25 * p) * (1 - smooth(0.72, 1, p));
    if (amp > 0) {
      fronts.push({
        F: maxR * 1.08 * (1 - Math.pow(1 - p, 2.6)),
        band: R * 5 + R * 20 * p,
        amp,
      });
    }
  }

  /* Impact flash. */
  if (k < 0.45) {
    const fl = Math.pow(1 - k / 0.45, 2);
    const g0 = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.7);
    g0.addColorStop(0, `rgba(255,190,140,${(0.55 * fl).toFixed(3)})`);
    g0.addColorStop(0.35, `rgba(255,91,20,${(0.22 * fl).toFixed(3)})`);
    g0.addColorStop(1, "rgba(255,91,20,0)");
    ctx.fillStyle = g0;
    ctx.fillRect(0, 0, W, H);
  }
  if (!fronts.length) return;

  /* Soft bloom under the cells, riding each front. */
  ctx.globalCompositeOperation = "lighter";
  for (const fr of fronts) {
    const g1 = ctx.createRadialGradient(
      cx,
      cy,
      Math.max(0, fr.F - fr.band * 1.4),
      cx,
      cy,
      fr.F + R * 4,
    );
    g1.addColorStop(0, "rgba(255,91,20,0)");
    g1.addColorStop(0.82, `rgba(255,91,20,${(0.16 * fr.amp).toFixed(3)})`);
    g1.addColorStop(1, "rgba(255,91,20,0)");
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.globalCompositeOperation = "source-over";

  const hw = SQRT3 * R;
  const vh = 1.5 * R;
  const rows = Math.ceil(H / vh) + 2;
  const cols = Math.ceil(W / hw) + 2;
  const outer = fronts[0].F + R * 3;

  for (let j = -1; j < rows; j++) {
    const y0 = j * vh;
    const off = j & 1 ? hw / 2 : 0;
    for (let i = -1; i < cols; i++) {
      const x0 = i * hw + off;
      const dx = x0 - cx;
      const dy = y0 - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > outer) continue;

      let I = 0;
      for (const fq of fronts) {
        const delta = fq.F - d;
        if (delta < -R * 3 || delta > fq.band * 3) continue;
        const v =
          fq.amp * smooth(-R * 3, 0, delta) * Math.exp(-Math.max(0, delta) / (fq.band * 0.34));
        if (v > I) I = v;
      }
      if (I < 0.012) continue;

      const n = hash(i, j);
      I = Math.min(1, I * (0.72 + 0.56 * n));

      /* Cells lift outward at the front, like a ripple under glass. */
      const push = I * R * 0.7;
      const x = x0 + (d > 0 ? dx / d : 0) * push;
      const y = y0 + (d > 0 ? dy / d : 0) * push;

      /* Orange between the cells: a glowing hex, then the dark cell inset on top. */
      ctx.beginPath();
      hexPath(ctx, x, y, R * 1.02);
      ctx.fillStyle = glow(I);
      ctx.fill();

      /* The cell melts into the black as the glow fades, so no edge is left behind. */
      const m = smooth(0, 0.35, I);
      ctx.beginPath();
      hexPath(ctx, x, y, R * (1 - 0.42 * Math.pow(I, 0.75)));
      ctx.fillStyle = `rgb(${Math.round(5 + (20 + 18 * n) * m)},${Math.round(
        5 + (12 + 10 * n) * m,
      )},${Math.round(5 + 5 * m)})`;
      ctx.fill();
    }
  }
}
