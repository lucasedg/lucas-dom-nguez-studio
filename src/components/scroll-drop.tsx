import { useEffect, useRef } from "react";

/*
 * Mobile scroll companion, designed in HyperFrames (motion/ld-scroll-hyperframes).
 * The header symbol melts into the orange ball from the intro. Its horizontal position is a
 * pure function of where it is on the page, so it never loops or zigzags by accident:
 *   1 · one long diagonal crossing under the hero, left → right margin;
 *   2 · down the right margin, then a long crossing back just before the process section;
 *   3 · straight down the process timeline, dot by dot;
 *   4 · one last long crossing to the right, and down to the end.
 * Behind it, a stretched paint tail that grows with scroll speed and retracts at rest.
 */
const MOBILE = "(max-width: 767px)";
const BALL = 11;
const EDGE = 11; // ball centre distance from the screen edge: it rides in the gutter

type Plan = {
  docH: number;
  cross1: [number, number];
  cross2: [number, number];
  onLine: [number, number];
  lineX: number;
  cross3: [number, number];
};

function smooth(a: number, b: number, v: number) {
  const u = Math.min(1, Math.max(0, (v - a) / (b - a || 1)));
  return u * u * (3 - 2 * u);
}

function measure(): Plan {
  const sy = window.scrollY;
  const top = (el: Element | null, fallback: number) =>
    el ? el.getBoundingClientRect().top + sy : fallback;
  const bottom = (el: Element | null, fallback: number) =>
    el ? el.getBoundingClientRect().bottom + sy : fallback;
  const docH = document.documentElement.scrollHeight;

  const heroMark = document.querySelector(".hero-mark");
  const heroTop = top(heroMark, 120);
  const heroBottom = bottom(heroMark, 600);

  const section = document.querySelector(".process-section");
  const dots = Array.from(document.querySelectorAll(".process-step > span:first-child"));
  const first = dots[0]?.getBoundingClientRect();
  const last = dots.at(-1)?.getBoundingClientRect();
  const sectionTop = top(section, docH);
  const sectionBottom = bottom(section, docH);
  const firstY = first ? first.top + sy + first.height / 2 : sectionTop + 400;
  const lastY = last ? last.top + sy + last.height / 2 : firstY + 600;
  const lineX = first ? first.left + first.width / 2 : EDGE;

  return {
    docH,
    cross1: [heroTop, heroBottom + 520],
    cross2: [sectionTop - 420, sectionTop + 40],
    onLine: [firstY - 160, firstY],
    lineX,
    cross3: [lastY + 50, Math.max(lastY + 400, sectionBottom - 20)],
  };
}

function routeX(plan: Plan, W: number, y: number) {
  const left = EDGE;
  const right = W - EDGE;
  let x = left + (right - left) * smooth(plan.cross1[0], plan.cross1[1], y);
  x += (left - right) * smooth(plan.cross2[0], plan.cross2[1], y);
  x += (plan.lineX - left) * smooth(plan.onLine[0], plan.onLine[1], y);
  x += (right - plan.lineX) * smooth(plan.cross3[0], plan.cross3[1], y);
  return x;
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
    let plan: Plan | null = null;
    let y = -1; // ball position on the page (document px)
    let tailY = -1; // where the tail ends; it chases the ball and catches up at rest
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
        const rect = symbol.getBoundingClientRect();
        origin = {
          x: rect.left + rect.width / 2,
          y: rect.top + sy + rect.height / 2,
          size: rect.width,
        };
      }
      if (!plan || Math.abs(plan.docH - document.documentElement.scrollHeight) > 40) {
        plan = measure();
      }
      const route = plan;

      // Target: from the logo, easing into a line 45 % down the screen.
      const m = Math.min(1, sy / 280);
      const ease = m * m * (3 - 2 * m);
      const target = sy + origin.y + (H * 0.45 - origin.y) * ease;
      // Follows the scroll closely (no spring, no overshoot), with a light smoothing.
      if (y < 0) y = tailY = target;
      y += (target - y) * 0.45;
      tailY += (y - tailY) * 0.14;

      const grow = Math.min(1, sy / 140); // logo → ball morph progress
      // The canvas takes over from the real logo the moment the page moves.
      if (symbol) symbol.style.opacity = sy > 0 ? "0" : "";
      canvas.style.opacity = sy > 0 ? "1" : "0";

      const r = BALL;
      const xAt = (py: number) => origin.x + (routeX(route, W, py) - origin.x) * ease;
      const hx = xAt(y);
      const hy = y - sy;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // Paint tail: the same route back to the tail end, tapering to a point.
      const span = y - tailY;
      if (Math.abs(span) > 1.5 && grow > 0) {
        const seg = 26;
        ctx.lineCap = "round";
        for (let i = seg; i > 0; i--) {
          const ya = y - (span * i) / seg;
          const yb = y - (span * (i - 1)) / seg;
          const k = 1 - i / seg; // 0 at the tip, 1 at the ball
          ctx.strokeStyle = `rgba(255, 91, 20, ${(0.35 + 0.65 * k) * grow})`;
          ctx.lineWidth = Math.max(1, r * 2 * Math.pow(k, 1.4));
          ctx.beginPath();
          ctx.moveTo(xAt(ya), ya - sy);
          ctx.lineTo(xAt(yb), yb - sy);
          ctx.stroke();
        }
      }

      // Ball. Near the top it is still the logo badge: a square that rounds into the ball.
      const dir = span >= 0 ? 1 : -1;
      const angle = grow < 1 ? 0 : Math.atan2(dir * 4, xAt(y + dir * 4) - hx);
      const stretch = 1 + Math.min(0.3, Math.abs(span) / 300) * grow;
      const size = origin.size + (BALL * 2 - origin.size) * grow;
      ctx.save();
      ctx.translate(hx, hy);
      ctx.rotate(angle);
      ctx.scale(stretch, 1 / Math.sqrt(stretch));
      ctx.shadowColor = `rgba(255, 91, 20, ${0.45 * grow})`;
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#ff5b14";
      ctx.beginPath();
      ctx.roundRect(-size / 2, -size / 2, size, size, (size / 2) * grow);
      ctx.fill();
      ctx.restore();
      // The two L pieces of the badge fade out as it turns into the ball.
      if (grow < 1) {
        const u = size / 320; // badge viewBox is 320 units wide (-60…260)
        ctx.save();
        ctx.translate(hx - size / 2 + 60 * u, hy - size / 2 + 60 * u);
        ctx.scale(u, u);
        ctx.globalAlpha = 1 - Math.min(1, grow * 1.6);
        ctx.fillStyle = "#1d1d1d";
        ctx.fill(new Path2D("M0 56H40V160H144V200H0Z"));
        ctx.fill(new Path2D("M56 0H200V144H160V40H56Z"));
        ctx.restore();
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = grow;
      ctx.fillStyle = "rgba(255, 226, 205, 0.55)";
      ctx.beginPath();
      ctx.arc(hx - size * 0.16, hy - size * 0.17, size * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      if (Math.abs(target - y) > 0.3 || Math.abs(span) > 1 || m < 1) {
        raf = requestAnimationFrame(frame);
      }
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const relayout = () => {
      plan = null;
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
