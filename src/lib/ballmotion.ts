/*
 * LD intro ball physics, shared with the HyperFrames composition
 * (motion/ld-intro-hyperframes/assets/ballmotion.js). A pure function of time:
 * positions are px relative to the floor contact point.
 */
export const BALL_TIMES = {
  spawn: 0.15, // a tiny ball pops out of the black screen
  launch: 0.5, // it crouches and jumps
  apex: 1.2, // top of the throw, closest to the camera
  impact: 1.92, // hits the floor
  bounceA: 2.1,
  bounceB: 2.5, // small second hop
  shrinkA: 2.65,
  shrinkB: 3.35, // settles to logo size
};
const T = BALL_TIMES;
const K = 0.3; // perspective: size = 1 / (1 - K * height)
const DIST = 0.6; // camera distance: the whole scene reads smaller, as seen from further away

export type BallState = {
  x: number;
  y: number;
  s: number;
  sx: number;
  sy: number;
  o: number;
  speed: number;
  shadow: { scale: number; dx: number; dy: number; blur: number; o: number };
  light: { amount: number; radiusK: number };
};

function clamp01(x: number) {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}
function smooth(a: number, b: number, x: number) {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
}
function backOut(u: number) {
  const c1 = 1.9;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);
}

/* Height above the floor (0..1), normalised speed (0..1) and progress through the throw. */
function flight(t: number) {
  if (t < T.launch) return { h: 0, v: 0, air: 0 };
  if (t < T.apex) {
    const u = (t - T.launch) / (T.apex - T.launch);
    return { h: 1 - (1 - u) * (1 - u), v: 1 - u, air: u * 0.5 };
  }
  if (t < T.impact) {
    const w = (t - T.apex) / (T.impact - T.apex);
    return { h: 1 - w * w, v: w, air: 0.5 + w * 0.5 };
  }
  if (t > T.bounceA && t < T.bounceB) {
    const b = (t - T.bounceA) / (T.bounceB - T.bounceA);
    return { h: 0.13 * 4 * b * (1 - b), v: Math.abs(1 - 2 * b) * 0.36, air: 0 };
  }
  return { h: 0, v: 0, air: 0 };
}

export function ballAt(t: number, rise: number, width: number): BallState {
  const f = flight(t);
  const o = smooth(T.spawn, T.spawn + 0.08, t);
  /* Tiny at first; it only reaches full size as it climbs towards the camera. */
  const pop = t < T.spawn ? 0 : t < T.spawn + 0.3 ? backOut((t - T.spawn) / 0.3) : 1;
  const grow = t < T.launch ? 0 : smooth(T.launch, T.apex - 0.15, t);
  const spawn = Math.max(0.02, 0.22 * pop + 0.78 * grow);

  const s = (spawn / (1 - K * f.h)) * DIST;
  const x = -Math.sin(Math.PI * f.air) * width * 0.014;
  const y = -f.h * rise;

  /* Stretch along the travel axis with speed; round at the apex. */
  const st = Math.pow(f.v, 1.6);
  let sx = 1 - 0.1 * st;
  let sy = 1 + 0.24 * st;

  /* Anticipation: a quick crouch before the jump. */
  if (t >= T.launch - 0.12 && t < T.launch) {
    const cr = Math.sin((Math.PI * (t - (T.launch - 0.12))) / 0.12);
    sx = 1 + 0.22 * cr;
    sy = 1 - 0.2 * cr;
  }
  /* Impact: squash wide, rebound tall, then the small hop. */
  if (t >= T.impact && t < T.bounceA) {
    const p = (t - T.impact) / (T.bounceA - T.impact);
    const e = p < 0.55 ? Math.sin(Math.PI * Math.min(1, p / 0.55)) : 0;
    const r = p >= 0.55 ? Math.sin((Math.PI * (p - 0.55)) / 0.45) : 0;
    sx = 1 + 0.34 * e - 0.08 * r;
    sy = 1 - 0.3 * e + 0.12 * r;
  }
  if (t >= T.bounceB && t < T.bounceB + 0.14) {
    const q = Math.sin((Math.PI * (t - T.bounceB)) / 0.14);
    sx = 1 + 0.1 * q;
    sy = 1 - 0.09 * q;
  }

  /* Already at logo size from the landing on (the camera is far enough). */

  /* Pure black until the hit: floor light and shadow only exist once it lands. */
  const ground = 1 - smooth(T.impact + 0.25, T.impact + 0.75, t);
  return {
    x,
    y,
    s,
    sx,
    sy,
    o,
    speed: f.v,
    shadow: {
      scale: DIST * (0.9 + 1.1 * f.h),
      dx: DIST * (18 + 70 * f.h),
      dy: DIST * (10 + 40 * f.h),
      blur: 4 + 20 * f.h,
      o: t < T.impact ? 0 : o * ground * 0.8,
    },
    light: { amount: t < T.impact ? 0 : ground, radiusK: DIST * (1.4 + 1.6 * f.h) },
  };
}
