import { useEffect, useRef } from "react";

/*
 * Mobile scroll companion: the header symbol melts into the orange ball from the intro,
 * which then travels down the screen with the page. The faster you scroll, the more it
 * stretches into a drop with a pointed tail; it gives a small pulse each time it passes a
 * main title. Pure transform/path updates, only while something is moving.
 */
const MOBILE = "(max-width: 767px)";
const TITLES = ".section-title, .about-title, .cta-title, .motion-showcase h2";
const MORPH = 220; // px of scroll over which the logo becomes the ball

export function ScrollDrop() {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const shineRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const path = pathRef.current;
    const shine = shineRef.current;
    if (!svg || !path || !shine) return;
    const mq = window.matchMedia(MOBILE);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const page = document.querySelector(".studio-page");

    let raf = 0;
    let y = 0;
    let vy = 0;
    let pulse = 0;
    let lastBallY = 0;
    let started = false;
    let symbol: HTMLElement | null = null;

    const enabled = () =>
      mq.matches && !reduce.matches && page?.getAttribute("data-graphics-paused") !== "true";

    const hide = () => {
      svg.style.opacity = "0";
      if (symbol) symbol.style.opacity = "";
    };

    const frame = () => {
      raf = 0;
      if (!enabled()) return hide();
      const W = window.innerWidth;
      const H = window.innerHeight;
      const scroll = window.scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - H);
      const progress = Math.min(1, scroll / max);

      // Track: down the right margin, top to bottom of the screen as the page advances.
      const trackX = W - 11;
      const trackY = H * (0.16 + 0.62 * progress);

      symbol ??= document.querySelector<HTMLElement>(".brand-logo .brand-symbol");
      const m = Math.min(1, scroll / MORPH);
      const ease = m * m * (3 - 2 * m);
      let cx = trackX;
      let targetY = trackY;
      let r = 9;
      if (symbol && m < 1) {
        const rect = symbol.getBoundingClientRect();
        const sx = rect.left + rect.width / 2;
        const sy = rect.top + rect.height / 2;
        cx = sx + (trackX - sx) * ease;
        targetY = sy + (trackY - sy) * ease;
        r = rect.width / 2 + (9 - rect.width / 2) * ease;
        symbol.style.opacity = String(Math.max(0, 1 - m * 3));
      } else if (symbol) {
        symbol.style.opacity = "0";
      }

      if (!started) {
        y = targetY;
        started = true;
      }
      // Soft spring: a little lag and overshoot so it feels liquid, not glued.
      const k = m < 1 ? 0.5 : 0.16;
      const damping = m < 1 ? 0.5 : 0.74;
      vy = (vy + (targetY - y) * k) * damping;
      y += vy;

      // Pulse when the ball crosses a main title.
      document.querySelectorAll<HTMLElement>(TITLES).forEach((title) => {
        const t = title.getBoundingClientRect().top + 12;
        if ((lastBallY - t) * (y - t) < 0) pulse = 1;
      });
      lastBallY = y;
      pulse *= 0.9;

      const speed = Math.abs(vy);
      const tail = Math.min(90, speed * 2.4); // stretch length in px
      const dir = vy >= 0 ? 1 : -1; // moving down → tail points up
      const head = r * (1 + 0.35 * pulse) * (1 - Math.min(0.18, tail / 400));

      // Teardrop: round head, two curves meeting at a sharp tip behind the motion.
      const tipY = y - dir * (head + tail);
      const d =
        tail < 0.6
          ? `M ${cx - head} ${y} a ${head} ${head} 0 1 0 ${head * 2} 0 a ${head} ${head} 0 1 0 ${-head * 2} 0 Z`
          : [
              `M ${cx - head} ${y}`,
              `A ${head} ${head} 0 0 ${dir > 0 ? 0 : 1} ${cx + head} ${y}`,
              `C ${cx + head} ${y - dir * tail * 0.45} ${cx + head * 0.18} ${tipY + dir * tail * 0.25} ${cx} ${tipY}`,
              `C ${cx - head * 0.18} ${tipY + dir * tail * 0.25} ${cx - head} ${y - dir * tail * 0.45} ${cx - head} ${y}`,
              "Z",
            ].join(" ");
      path.setAttribute("d", d);
      shine.setAttribute("cx", String(cx - head * 0.32));
      shine.setAttribute("cy", String(y - head * 0.34));
      shine.setAttribute("r", String(head * 0.32));
      svg.style.opacity = String(Math.min(1, m * 4));

      if (Math.abs(targetY - y) > 0.3 || speed > 0.05 || pulse > 0.02 || m < 1) {
        raf = requestAnimationFrame(frame);
      }
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    kick();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    mq.addEventListener("change", kick);
    const observer = page ? new MutationObserver(kick) : null;
    observer?.observe(page as Element, {
      attributes: true,
      attributeFilter: ["data-graphics-paused"],
    });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      mq.removeEventListener("change", kick);
      observer?.disconnect();
      if (symbol) symbol.style.opacity = "";
    };
  }, []);

  return (
    <svg ref={svgRef} className="scroll-drop" aria-hidden="true">
      <path ref={pathRef} className="scroll-drop-body" />
      <circle ref={shineRef} className="scroll-drop-shine" />
    </svg>
  );
}
