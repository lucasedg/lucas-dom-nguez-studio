import { useEffect, useRef } from "react";

/*
 * Mobile scroll companion. The header symbol melts into the orange ball from the intro,
 * which then travels a winding route through the page: down one margin, across under a
 * section, down the other margin… It leaves a long tapering trail that grows with scroll
 * speed, like a drop being pulled. Drawn in one canvas, only while something moves.
 */
const MOBILE = "(max-width: 767px)";
// Elements the route crosses under, alternating sides (top to bottom of the page).
const CROSSINGS = [
  ".hero-mark",
  ".brand-intro",
  ".section-title",
  ".project-card-caption",
  ".motion-showcase h2",
  ".creative-plan",
  ".service-guide-help",
  ".about-title",
  ".about-copy",
  ".process-step",
  ".cta-title",
  ".contact-card",
].join(",");
const BALL = 13;
const MARGIN = 24;

type Route = { x: Float32Array; y: Float32Array; s: Float32Array; n: number; docH: number };

function buildRoute(W: number, start: { x: number; y: number }): Route {
  const sy = window.scrollY;
  const bottoms: number[] = [];
  document.querySelectorAll<HTMLElement>(CROSSINGS).forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.height > 0 && r.width > 0) bottoms.push(r.bottom + sy + 18);
  });
  bottoms.sort((a, b) => a - b);
  const rows: number[] = [];
  for (const b of bottoms) if (b - (rows.at(-1) ?? start.y) > 150) rows.push(b);

  // Control points: logo → down the left → across → down the right → across …
  const left = MARGIN;
  const right = W - MARGIN;
  const pts: [number, number][] = [[start.x, start.y]];
  let side = left;
  pts.push([left, start.y + 60]);
  for (const y of rows) {
    const next = side === left ? right : left;
    pts.push([side, y - 60], [(side + next) / 2, y], [next, y + 60]);
    side = next;
  }
  const docH = document.documentElement.scrollHeight;
  pts.push([side, docH]);

  // Catmull-Rom → dense polyline with cumulative length.
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[Math.min(pts.length - 1, i + 2)]!;
    const steps = Math.max(6, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 6));
    for (let k = 0; k < steps; k++) {
      const t = k / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 *
        (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      xs.push(Math.min(W - MARGIN, Math.max(MARGIN, f(p0[0], p1[0], p2[0], p3[0]))));
      ys.push(f(p0[1], p1[1], p2[1], p3[1]));
    }
  }
  xs.push(pts.at(-1)![0]);
  ys.push(pts.at(-1)![1]);
  const n = xs.length;
  const s = new Float32Array(n);
  for (let i = 1; i < n; i++)
    s[i] = s[i - 1]! + Math.hypot(xs[i]! - xs[i - 1]!, ys[i]! - ys[i - 1]!);
  return { x: Float32Array.from(xs), y: Float32Array.from(ys), s, n, docH };
}

/* Point on the route at arc length `len` (binary search + lerp). */
function at(route: Route, len: number): [number, number] {
  const { s, x, y, n } = route;
  if (len <= 0) return [x[0]!, y[0]!];
  if (len >= s[n - 1]!) return [x[n - 1]!, y[n - 1]!];
  let lo = 0;
  let hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (s[mid]! < len) lo = mid;
    else hi = mid;
  }
  const t = (len - s[lo]!) / (s[hi]! - s[lo]! || 1);
  return [x[lo]! + (x[hi]! - x[lo]!) * t, y[lo]! + (y[hi]! - y[lo]!) * t];
}

/* Arc length where the route first reaches document height `docY`. */
function lengthAtY(route: Route, docY: number): number {
  const { s, y, n } = route;
  let best = 0;
  for (let i = 0; i < n; i++) {
    if (y[i]! >= docY) {
      const prev = Math.max(0, i - 1);
      const t = (docY - y[prev]!) / (y[i]! - y[prev]! || 1);
      return s[prev]! + (s[i]! - s[prev]!) * Math.min(1, Math.max(0, t));
    }
    best = s[i]!;
  }
  return best;
}

export function ScrollDrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const mq = window.matchMedia(MOBILE);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const page = document.querySelector(".studio-page");

    let raf = 0;
    let route: Route | null = null;
    let routeW = 0;
    let pos = -1; // current arc length of the ball
    let vel = 0;
    let symbol: HTMLElement | null = null;
    let origin = { x: 0, y: 0, size: 26 };
    let dpr = 1;

    const enabled = () =>
      mq.matches && !reduce.matches && page?.getAttribute("data-graphics-paused") !== "true";

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
    };

    const frame = () => {
      raf = 0;
      if (!enabled()) {
        canvas.style.opacity = "0";
        if (symbol) symbol.style.opacity = "";
        return;
      }
      const W = window.innerWidth;
      const H = window.innerHeight;
      const sy = window.scrollY;
      if (canvas.width !== Math.round(W * dpr)) resize();

      symbol ??= document.querySelector<HTMLElement>(".brand-logo .brand-symbol");
      if (symbol && sy < 5) {
        const r = symbol.getBoundingClientRect();
        origin = { x: r.left + r.width / 2, y: r.top + sy + r.height / 2, size: r.width };
      }
      const docH = document.documentElement.scrollHeight;
      if (!route || routeW !== W || Math.abs(route.docH - docH) > 40) {
        route = buildRoute(W, origin);
        routeW = W;
      }

      // Where the ball should be: from the logo, easing into a line 45 % down the screen.
      const m = Math.min(1, sy / 280);
      const anchor = (origin.y - 0) / H + (0.45 - origin.y / H) * (m * m * (3 - 2 * m));
      const target = lengthAtY(route, sy + anchor * H);
      if (pos < 0) pos = target;
      // Soft spring along the route: lag and a touch of overshoot, like liquid.
      vel = (vel + (target - pos) * 0.12) * 0.78;
      pos += vel;

      const speed = Math.abs(vel);
      const grow = Math.min(1, m * 5);
      if (symbol) symbol.style.opacity = String(1 - grow);
      canvas.style.opacity = "1";

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const r = (origin.size / 2) * (1 - grow) + BALL * grow;
      const [hx, hy] = at(route, pos);
      const headY = hy - sy;

      // Trail: tapering, fading stroke behind the ball along the route.
      const trail = 70 + Math.min(520, speed * 9);
      const dir = vel >= 0 ? -1 : 1; // behind the motion
      const seg = 22;
      ctx.lineCap = "round";
      for (let i = seg; i > 0; i--) {
        const a = at(route, pos + (dir * (trail * i)) / seg);
        const b = at(route, pos + (dir * (trail * (i - 1))) / seg);
        const k = 1 - i / seg; // 0 at the tip, 1 at the ball
        ctx.strokeStyle = `rgba(255, 91, 20, ${(0.08 + 0.75 * k * k) * grow})`;
        ctx.lineWidth = Math.max(0.8, r * 1.9 * k * k);
        ctx.beginPath();
        ctx.moveTo(a[0], a[1] - sy);
        ctx.lineTo(b[0], b[1] - sy);
        ctx.stroke();
      }

      // Ball, slightly stretched along the motion when fast.
      const ahead = at(route, pos + (vel >= 0 ? 1 : -1) * 4);
      const angle = Math.atan2(ahead[1] - hy, ahead[0] - hx);
      const stretch = 1 + Math.min(0.45, speed / 40);
      ctx.save();
      ctx.translate(hx, headY);
      ctx.rotate(angle);
      ctx.scale(stretch, 1 / Math.sqrt(stretch));
      ctx.shadowColor = "rgba(255, 91, 20, 0.45)";
      ctx.shadowBlur = 14;
      ctx.fillStyle = "#ff5b14";
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255, 226, 205, 0.55)";
      ctx.beginPath();
      ctx.arc(hx - r * 0.32, headY - r * 0.34, r * 0.3, 0, Math.PI * 2);
      ctx.fill();

      if (Math.abs(target - pos) > 0.3 || speed > 0.05 || m < 1) {
        raf = requestAnimationFrame(frame);
      }
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const relayout = () => {
      route = null;
      kick();
    };
    resize();
    kick();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", relayout);
    window.addEventListener("load", relayout);
    mq.addEventListener("change", relayout);
    const observer = page ? new MutationObserver(kick) : null;
    observer?.observe(page as Element, {
      attributes: true,
      attributeFilter: ["data-graphics-paused"],
    });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", relayout);
      window.removeEventListener("load", relayout);
      mq.removeEventListener("change", relayout);
      observer?.disconnect();
      if (symbol) symbol.style.opacity = "";
    };
  }, []);

  return <canvas ref={canvasRef} className="scroll-drop" aria-hidden="true" />;
}
