import { useCallback, useEffect, useRef, useState } from "react";

import { BALL_TIMES, ballAt } from "@/lib/ballmotion";
import { drawHexWave } from "@/lib/hexwave";

/*
 * Lucas Dominguez Studio · rebranding 2026.
 * Symbol geometry is fixed by the brand manual (viewBox -60 -60 320 320):
 * never redraw or distort it, only move the two pieces as a whole.
 */
const L1 = "0,56 40,56 40,160 144,160 144,200 0,200";
const L2 = "56,0 200,0 200,144 160,144 160,40 56,40";

export function BrandSymbol({
  className = "",
  badge = true,
  title,
}: {
  className?: string;
  badge?: boolean;
  title?: string;
}) {
  return (
    <svg
      className={`brand-symbol ${className}`}
      viewBox="-60 -60 320 320"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {badge && <rect className="brand-symbol-badge" x="-60" y="-60" width="320" height="320" />}
      <polygon className="brand-symbol-l1" points={L1} />
      <polygon className="brand-symbol-l2" points={L2} />
    </svg>
  );
}

export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`brand-logo ${className}`}>
      <BrandSymbol className="brand-logo-symbol" />
      <span className="brand-logo-words">
        <span className="brand-logo-name">Lucas Dominguez</span>
        <span className="brand-logo-studio">Studio</span>
      </span>
    </span>
  );
}

/* Hero artwork: the framing symbol assembles itself and keeps "framing" in a slow loop. */
export function HeroBrandMark() {
  return (
    <div className="hero-mark" data-motion>
      <span className="hero-mark-crop hero-mark-crop-a" aria-hidden="true" />
      <span className="hero-mark-crop hero-mark-crop-b" aria-hidden="true" />
      <div className="hero-mark-float">
        <BrandSymbol className="hero-mark-symbol" title="Símbolo de Lucas Dominguez Studio" />
        <span className="hero-mark-tag hero-mark-tag-a">Brand designer</span>
        <span className="hero-mark-tag hero-mark-tag-b">Málaga</span>
      </div>
    </div>
  );
}

/* Motion section artwork: the full logo lockup animated on a loop. */
export function LogoMotion() {
  return (
    <div className="logo-motion-card" aria-hidden="true">
      <BrandSymbol className="logo-motion-symbol" badge={false} />
      <span className="logo-motion-words">
        <span>Lucas</span>
        <span>Dominguez</span>
        <small>Studio</small>
      </span>
    </div>
  );
}

/*
 * Runs while the HTML is parsed, before the first paint, so returning visitors
 * (same session) and people who prefer reduced motion never see a flash of the intro.
 */
const INTRO_GATE = `(function(){var d=document.documentElement,s=false,r=false;try{r=window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}try{s=!!sessionStorage.getItem('ld-intro')}catch(e){}d.classList.add(s||r?'ld-intro-off':'ld-intro-on')})();`;

/* Intro timeline, mirrored from the HyperFrames composition motion/ld-intro-hyperframes. */
const FLOOR_TILT = 36; // degrees the floor leans away from the camera

type IntroParts = {
  intro: HTMLElement;
  floor: HTMLElement;
  slot: HTMLElement;
  mark: HTMLElement;
  shadow: HTMLElement;
  ghosts: HTMLElement[];
};

function ballTransform(b: { x: number; y: number; s: number; sx: number; sy: number }) {
  return `translate(${b.x.toFixed(2)}px,${b.y.toFixed(2)}px) scale(${(b.s * b.sx).toFixed(4)},${(
    b.s * b.sy
  ).toFixed(4)})`;
}

/*
 * Drives the ball, its speed echoes, the floor shadow and the hexagon floor from one
 * clock: the intro's own CSS animation, so CSS and canvas stay in sync even if JS loads late.
 */
function startIntroMotion({ intro, floor, slot, mark, shadow, ghosts }: IntroParts) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return () => {};
  let W = 0;
  let H = 0;
  let dpr = 1;
  let origin = { x: 0, y: 0 };
  let cell = 12;
  let markSize = 200;
  let rise = 200;
  let vw = 1000;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    vw = window.innerWidth;
    const vh = window.innerHeight;
    const fw = floor.offsetWidth;
    const fh = floor.offsetHeight;
    W = canvas.width = Math.max(1, Math.round(fw * dpr));
    H = canvas.height = Math.max(1, Math.round(fh * dpr));
    markSize = slot.offsetWidth;
    rise = vh * 0.213;
    /* Pivot the tilted floor around the contact point (the slot centre, untransformed). */
    const m = slot.getBoundingClientRect();
    floor.style.transform = "none";
    const flat = floor.getBoundingClientRect();
    const ox = m.left + m.width / 2 - flat.left;
    const oy = m.top + m.height / 2 - flat.top;
    floor.style.transformOrigin = `${ox}px ${oy}px`;
    floor.style.transform = `perspective(${Math.round(vh * 1.6)}px) rotateX(${FLOOR_TILT}deg)`;
    origin = { x: ox * dpr, y: oy * dpr };
    cell = Math.max(12, Math.min(vw, vh) / 36) * dpr;
  };
  floor.appendChild(canvas);
  resize();
  window.addEventListener("resize", resize);

  const clock = intro
    .getAnimations?.()
    .find((a) => (a as CSSAnimation).animationName === "ld-intro-out");
  const t0 = performance.now();
  let frame = 0;
  const draw = () => {
    const current = clock?.currentTime;
    const t = typeof current === "number" ? current / 1000 : (performance.now() - t0) / 1000;
    const b = ballAt(t, rise, vw);

    mark.style.opacity = b.o.toFixed(3);
    mark.style.transform = ballTransform(b);
    ghosts.forEach((ghost, i) => {
      const g = ballAt(Math.max(0, t - 0.028 * (i + 1)), rise, vw);
      const a = b.speed > 0.25 && t < BALL_TIMES.impact ? (0.32 / (i + 1)) * b.speed * b.o : 0;
      ghost.style.opacity = a.toFixed(3);
      ghost.style.transform = ballTransform(g);
    });
    const sh = b.shadow;
    shadow.style.opacity = sh.o.toFixed(3);
    shadow.style.filter = `blur(${sh.blur.toFixed(1)}px)`;
    shadow.style.transform = `translate(${sh.dx.toFixed(1)}px,${(sh.dy + markSize * 0.25).toFixed(
      1,
    )}px) scale(${(sh.scale * b.sx).toFixed(3)},${(sh.scale * 0.42).toFixed(3)})`;

    drawHexWave(ctx, W, H, t, {
      impact: BALL_TIMES.impact,
      cx: origin.x,
      cy: origin.y,
      cell,
      light: { amount: b.light.amount, radius: ((b.light.radiusK * markSize) / 2) * dpr },
    });
    if (t < 3.6) frame = requestAnimationFrame(draw);
  };
  frame = requestAnimationFrame(draw);
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", resize);
  };
}

/*
 * Entrance: the screen starts pure black. A tiny orange ball pops out, jumps towards
 * the camera, falls and hits the floor; only then a shockwave of hexagons crosses the
 * floor and leaves everything black again, and the ball becomes the logo.
 * Built and proofed in HyperFrames first.
 */
export function BrandIntro() {
  const [visible, setVisible] = useState(true);
  const introRef = useRef<HTMLDivElement>(null);
  const floorRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const ghostRefs = useRef<(HTMLDivElement | null)[]>([]);

  const finish = useCallback(() => {
    /* "ld-intro-on" stays on <html> so the hero entrance keeps its timing. */
    setVisible(false);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("ld-intro-on")) {
      setVisible(false);
      return;
    }
    try {
      sessionStorage.setItem("ld-intro", "1");
    } catch {
      /* Private mode: the intro simply plays again next time. */
    }
    const intro = introRef.current;
    const floor = floorRef.current;
    const slot = slotRef.current;
    const mark = markRef.current;
    const shadow = shadowRef.current;
    const ghosts = ghostRefs.current.filter((g): g is HTMLDivElement => g !== null);
    const stop =
      intro && floor && slot && mark && shadow
        ? startIntroMotion({ intro, floor, slot, mark, shadow, ghosts })
        : () => {};
    const onEnd = (event: AnimationEvent) => {
      if (event.target === intro && event.animationName === "ld-intro-out") finish();
    };
    intro?.addEventListener("animationend", onEnd);
    const safety = window.setTimeout(finish, 9000);
    return () => {
      stop();
      intro?.removeEventListener("animationend", onEnd);
      window.clearTimeout(safety);
    };
  }, [finish]);

  if (!visible) return null;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: INTRO_GATE }} />
      <div className="ld-intro" ref={introRef}>
        <div className="ld-intro-world" aria-hidden="true">
          <div className="ld-intro-floor" ref={floorRef} />
          <div className="ld-intro-core">
            <div className="ld-intro-slot" ref={slotRef}>
              <div className="ld-intro-shadow" ref={shadowRef} />
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="ld-intro-ghost"
                  ref={(el) => {
                    ghostRefs.current[i] = el;
                  }}
                />
              ))}
              <div className="ld-intro-mark" ref={markRef}>
                <div className="ld-intro-ball" />
                <span className="ld-intro-ball-shade" />
                <svg viewBox="-60 -60 320 320">
                  <polygon className="ld-intro-l1" points={L1} />
                  <polygon className="ld-intro-l2" points={L2} />
                </svg>
              </div>
            </div>
            <div className="ld-intro-name">
              <span>Lucas Dominguez</span>
              <small>Studio</small>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="ld-intro-skip"
          onClick={() => introRef.current?.classList.add("is-skipping")}
        >
          Saltar intro
        </button>
      </div>
    </>
  );
}
