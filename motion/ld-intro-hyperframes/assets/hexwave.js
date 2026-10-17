/*
 * LD hex shockwave — a pure function of time, so it is seek-safe in HyperFrames
 * and reusable as-is on the website. Same t → same pixels. No randomness.
 *
 *   LDHexWave.draw(ctx, width, height, t, { impact, cx, cy, cell })
 *     t       seconds on the intro timeline
 *     impact  second at which the ball hits the glass (wave origin time)
 *     cx, cy  wave origin in px (default: centre)
 *     cell    hexagon radius in px (default: scales with the viewport)
 */
(function (root) {
  var SQRT3 = Math.sqrt(3);
  var ORANGE = [255, 91, 20];

  function hash(i, j) {
    var h = (Math.imul(i, 374761393) + Math.imul(j, 668265263)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  }
  function clamp01(x) {
    return x < 0 ? 0 : x > 1 ? 1 : x;
  }
  function smooth(a, b, x) {
    var u = clamp01((x - a) / (b - a));
    return u * u * (3 - 2 * u);
  }
  function hexPath(ctx, x, y, r) {
    ctx.moveTo(x + r * 0.8660254, y - r * 0.5);
    ctx.lineTo(x + r * 0.8660254, y + r * 0.5);
    ctx.lineTo(x, y + r);
    ctx.lineTo(x - r * 0.8660254, y + r * 0.5);
    ctx.lineTo(x - r * 0.8660254, y - r * 0.5);
    ctx.lineTo(x, y - r);
    ctx.closePath();
  }
  /* Hot near the front, brand orange in the body, ember at the tail. */
  function glow(I) {
    var hot = smooth(0.7, 1, I);
    var r = 255;
    var g = Math.round(ORANGE[1] + (176 - ORANGE[1]) * hot);
    var b = Math.round(ORANGE[2] + (122 - ORANGE[2]) * hot);
    var a = Math.min(1, I * 1.15);
    return "rgba(" + r + "," + g + "," + b + "," + a.toFixed(3) + ")";
  }

  function draw(ctx, W, H, t, opts) {
    opts = opts || {};
    var impact = opts.impact == null ? 1.1 : opts.impact;
    var cx = opts.cx == null ? W / 2 : opts.cx;
    var cy = opts.cy == null ? H / 2 : opts.cy;
    var R = opts.cell || Math.max(14, Math.min(W, H) / 38);

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, W, H);

    var k = t - impact;
    /* Before the hit: the falling ball lights the floor below it, more and tighter as it nears. */
    var fall = k < 0 ? clamp01((t - (impact - 0.95)) / 0.95) : 1;
    var floorLight = k < 0 ? fall * fall : Math.max(0, 1 - k / 0.5);
    var floorRad = Math.min(W, H) * (0.42 - 0.2 * fall);
    if (k < 0 && fall <= 0) return;

    var maxR = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) + R * 6;
    /* Two rings: the main shockwave and a softer echo. */
    var waves = [
      { k: k, dur: 1.75, amp: 1 },
      { k: k - 0.24, dur: 1.85, amp: 0.5 },
    ];
    var fronts = [];
    for (var w = 0; w < waves.length; w++) {
      var wv = waves[w];
      if (wv.k <= 0) continue;
      var p = clamp01(wv.k / wv.dur);
      var F = maxR * 1.08 * (1 - Math.pow(1 - p, 2.6));
      var band = maxR * (0.05 + 0.16 * p);
      var amp = wv.amp * (1 - 0.25 * p) * (1 - smooth(0.72, 1, p));
      if (amp > 0) fronts.push({ F: F, band: band, amp: amp });
    }

    /* Impact flash. */
    if (k >= 0 && k < 0.45) {
      var fl = Math.pow(1 - k / 0.45, 2);
      var g0 = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.55);
      g0.addColorStop(0, "rgba(255,190,140," + (0.5 * fl).toFixed(3) + ")");
      g0.addColorStop(0.4, "rgba(255,91,20," + (0.18 * fl).toFixed(3) + ")");
      g0.addColorStop(1, "rgba(255,91,20,0)");
      ctx.fillStyle = g0;
      ctx.fillRect(0, 0, W, H);
    }
    if (floorLight > 0) {
      var g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, floorRad * 1.3);
      g2.addColorStop(0, "rgba(255,91,20," + (0.28 * floorLight).toFixed(3) + ")");
      g2.addColorStop(1, "rgba(255,91,20,0)");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);
    }
    if (!fronts.length && floorLight <= 0) return;

    /* Soft bloom under the cells, riding each front. */
    ctx.globalCompositeOperation = "lighter";
    for (var f = 0; f < fronts.length; f++) {
      var fr = fronts[f];
      var inner = Math.max(0, fr.F - fr.band * 1.4);
      var g1 = ctx.createRadialGradient(cx, cy, inner, cx, cy, fr.F + R * 4);
      g1.addColorStop(0, "rgba(255,91,20,0)");
      g1.addColorStop(0.82, "rgba(255,91,20," + (0.16 * fr.amp).toFixed(3) + ")");
      g1.addColorStop(1, "rgba(255,91,20,0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.globalCompositeOperation = "source-over";

    var hw = SQRT3 * R;
    var vh = 1.5 * R;
    var rows = Math.ceil(H / vh) + 2;
    var cols = Math.ceil(W / hw) + 2;
    var outer = Math.max(fronts.length ? fronts[0].F + R * 3 : 0, floorLight > 0 ? floorRad * 1.6 : 0);

    for (var j = -1; j < rows; j++) {
      var y0 = j * vh;
      var off = j & 1 ? hw / 2 : 0;
      for (var i = -1; i < cols; i++) {
        var x0 = i * hw + off;
        var dx = x0 - cx;
        var dy = y0 - cy;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d > outer) continue;

        var I = 0;
        for (var q = 0; q < fronts.length; q++) {
          var fq = fronts[q];
          var delta = fq.F - d;
          if (delta < -R * 3 || delta > fq.band * 3) continue;
          var lead = smooth(-R * 3, 0, delta);
          var tail = Math.exp(-Math.max(0, delta) / (fq.band * 0.34));
          var v = fq.amp * lead * tail;
          if (v > I) I = v;
        }
        if (floorLight > 0) {
          var fl2 = 0.42 * floorLight * Math.exp(-(d * d) / (floorRad * floorRad));
          if (fl2 > I) I = fl2;
        }
        if (I < 0.012) continue;

        var n = hash(i, j);
        I *= 0.72 + 0.56 * n;
        if (I > 1) I = 1;

        /* Cells lift outward at the front, like a ripple under glass. */
        var push = I * R * 0.3;
        var ux = d > 0 ? dx / d : 0;
        var uy = d > 0 ? dy / d : 0;
        var x = x0 + ux * push;
        var y = y0 + uy * push;

        /* Orange between the cells: a glowing hex, then the dark cell inset on top. */
        ctx.beginPath();
        hexPath(ctx, x, y, R * 0.99);
        ctx.fillStyle = glow(I);
        ctx.fill();

        /* The cell melts into the black as the glow fades, so no edge is left behind. */
        var s = 0.9 - 0.16 * Math.pow(I, 0.75);
        var m = smooth(0, 0.35, I);
        var cr = Math.round(5 + (20 + 18 * n) * m);
        var cg = Math.round(5 + (12 + 10 * n) * m);
        var cb = Math.round(5 + 5 * m);
        ctx.beginPath();
        hexPath(ctx, x, y, R * s);
        ctx.fillStyle = "rgba(" + cr + "," + cg + "," + cb + "," + smooth(0, 0.25, I).toFixed(3) + ")";
        ctx.fill();
      }
    }
  }

  root.LDHexWave = { draw: draw };
})(typeof window !== "undefined" ? window : globalThis);
