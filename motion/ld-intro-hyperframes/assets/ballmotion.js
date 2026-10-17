/*
 * LD ball physics for the intro, seen by a camera above the floor.
 * A pure function of time (seek-safe, deterministic), shared with the website
 * (src/lib/ballmotion.ts). Positions are px relative to the floor contact point.
 *
 *   LDBall.at(t, { rise, width })  ->  { x, y, s, sx, sy, o, h, speed, shadow, light }
 */
(function (root) {
  var T = {
    spawn: 0.15, // a tiny ball pops up out of the dark floor
    launch: 0.5, // it crouches and jumps
    apex: 1.2, // top of the throw, closest to the camera
    impact: 1.92, // hits the floor
    bounceA: 2.1,
    bounceB: 2.5, // small second hop
    shrinkA: 2.65,
    shrinkB: 3.35, // settles to logo size
  };
  var K = 0.3; // perspective: size = 1 / (1 - K * height)
  var DIST = 0.6; // camera distance: the whole scene reads smaller, as seen from further away

  function clamp01(x) {
    return x < 0 ? 0 : x > 1 ? 1 : x;
  }
  function smooth(a, b, x) {
    var u = clamp01((x - a) / (b - a));
    return u * u * (3 - 2 * u);
  }
  function backOut(u) {
    var c1 = 1.9;
    var c3 = c1 + 1;
    return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);
  }
  function inOut(u) {
    return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  }

  /* Height above the floor (0..1) and normalised speed (0..1). */
  function flight(t) {
    if (t < T.launch) return { h: 0, v: 0, air: 0 };
    if (t < T.apex) {
      var u = (t - T.launch) / (T.apex - T.launch);
      return { h: 1 - (1 - u) * (1 - u), v: 1 - u, air: u * 0.5 };
    }
    if (t < T.impact) {
      var w = (t - T.apex) / (T.impact - T.apex);
      return { h: 1 - w * w, v: w, air: 0.5 + w * 0.5 };
    }
    if (t > T.bounceA && t < T.bounceB) {
      var b = (t - T.bounceA) / (T.bounceB - T.bounceA);
      return { h: 0.13 * 4 * b * (1 - b), v: Math.abs(1 - 2 * b) * 0.36, air: 0 };
    }
    return { h: 0, v: 0, air: 0 };
  }

  function at(t, opts) {
    opts = opts || {};
    var rise = opts.rise == null ? 220 : opts.rise; // px the ball climbs on screen at the apex
    var width = opts.width == null ? 1920 : opts.width;

    var f = flight(t);
    var o = smooth(T.spawn, T.spawn + 0.08, t);
    /* Tiny at first; it only reaches full size as it climbs towards the camera. */
    var pop = t < T.spawn ? 0 : t < T.spawn + 0.3 ? backOut((t - T.spawn) / 0.3) : 1;
    var grow = t < T.launch ? 0 : smooth(T.launch, T.apex - 0.15, t);
    var spawn = Math.max(0.02, 0.22 * pop + 0.78 * grow);

    var proj = 1 / (1 - K * f.h);
    var s = spawn * proj * DIST;
    var x = -Math.sin(Math.PI * f.air) * width * 0.014;
    var y = -f.h * rise;

    /* Stretch along the travel axis with speed; round at the apex. */
    var st = Math.pow(f.v, 1.6);
    var sx = 1 - 0.1 * st;
    var sy = 1 + 0.24 * st;

    /* Anticipation: a quick crouch before the jump. */
    if (t >= T.launch - 0.12 && t < T.launch) {
      var cr = Math.sin(Math.PI * (t - (T.launch - 0.12)) / 0.12);
      sx = 1 + 0.22 * cr;
      sy = 1 - 0.2 * cr;
    }

    /* Impact: squash wide, rebound tall, then the small hop. */
    if (t >= T.impact && t < T.bounceA) {
      var p = (t - T.impact) / (T.bounceA - T.impact);
      var e = Math.sin(Math.PI * Math.min(1, p / 0.55)) * (p < 0.55 ? 1 : 0);
      var r = p >= 0.55 ? Math.sin(Math.PI * (p - 0.55) / 0.45) : 0;
      sx = 1 + 0.34 * e - 0.08 * r;
      sy = 1 - 0.3 * e + 0.12 * r;
    }
    if (t >= T.bounceB && t < T.bounceB + 0.14) {
      var q = Math.sin(Math.PI * (t - T.bounceB) / 0.14);
      sx = 1 + 0.1 * q;
      sy = 1 - 0.09 * q;
    }

    /* Settle to the logo size. */
    /* Already at logo size from the landing on (the camera is far enough). */

    /* Floor shadow (only readable on the lit floor) and the ball's light on the floor. */
    var ground = 1 - smooth(T.impact + 0.25, T.impact + 0.75, t);
    var shadowBase = {
      scale: DIST * (0.9 + 1.1 * f.h),
      dx: DIST * (18 + 70 * f.h),
      dy: DIST * (10 + 40 * f.h),
      blur: 4 + 20 * f.h,
      o: t < T.impact ? 0 : o * ground * 0.8,
    };
    var shadow = shadowBase;
    var light = {
      /* Pure black until the hit: the floor (and its hexagons) only appears with the impact. */
      amount: t < T.impact ? 0 : ground,
      radiusK: DIST * (1.4 + 1.6 * f.h), // in units of the ball's floor diameter
    };

    return { x: x, y: y, s: s, sx: sx, sy: sy, o: o, h: f.h, speed: f.v, shadow: shadow, light: light };
  }

  root.LDBall = { at: at, times: T };
})(typeof window !== "undefined" ? window : globalThis);
