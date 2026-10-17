import { useCallback, useEffect, useRef, useState } from "react";

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

/* Intro timeline (seconds), mirrored from the HyperFrames composition videos/ld-intro-motion. */
const INTRO_IMPACT = 1.1;

function startHexWave(intro: HTMLElement, box: HTMLElement, slot: HTMLElement) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return () => {};
  let W = 0;
  let H = 0;
  let origin = { x: 0, y: 0 };
  let cell = 6;

  const resize = () => {
    const rect = box.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = canvas.width = Math.max(1, Math.round(rect.width * dpr));
    H = canvas.height = Math.max(1, Math.round(rect.height * dpr));
    /* The wave starts exactly where the ball hits: the centre of the (untransformed) mark slot. */
    const m = slot.getBoundingClientRect();
    origin = {
      x: (m.left + m.width / 2 - rect.left) * dpr,
      y: (m.top + m.height / 2 - rect.top) * dpr,
    };
    cell = Math.max(12 * dpr, Math.min(W, H) / 38);
  };
  box.appendChild(canvas);
  resize();
  window.addEventListener("resize", resize);

  /* The canvas follows the CSS timeline, so it stays in sync even if JS loads late. */
  const clock = intro
    .getAnimations?.()
    .find((a) => (a as CSSAnimation).animationName === "ld-intro-out");
  const t0 = performance.now();
  let frame = 0;
  const draw = () => {
    const current = clock?.currentTime;
    const t = typeof current === "number" ? current / 1000 : (performance.now() - t0) / 1000;
    drawHexWave(ctx, W, H, t, { impact: INTRO_IMPACT, cx: origin.x, cy: origin.y, cell });
    if (t < 3.4) frame = requestAnimationFrame(draw);
  };
  frame = requestAnimationFrame(draw);
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", resize);
  };
}

/*
 * Entrance (seen from above): the orange ball falls from the centre, hits the floor
 * and releases a shockwave of hexagons; when the wave has left the screen, everything is
 * black and the ball becomes the logo. Built and proofed in HyperFrames first.
 */
export function BrandIntro() {
  const [visible, setVisible] = useState(true);
  const introRef = useRef<HTMLDivElement>(null);
  const waveRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);

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
    const wave = waveRef.current;
    const slot = slotRef.current;
    const stopWave = intro && wave && slot ? startHexWave(intro, wave, slot) : () => {};
    const onEnd = (event: AnimationEvent) => {
      if (event.target === intro && event.animationName === "ld-intro-out") finish();
    };
    intro?.addEventListener("animationend", onEnd);
    const safety = window.setTimeout(finish, 8000);
    return () => {
      stopWave();
      intro?.removeEventListener("animationend", onEnd);
      window.clearTimeout(safety);
    };
  }, [finish]);

  if (!visible) return null;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: INTRO_GATE }} />
      <div className="ld-intro" ref={introRef}>
        <div className="ld-intro-wave" ref={waveRef} aria-hidden="true" />
        <div className="ld-intro-world" aria-hidden="true">
          <div className="ld-intro-core">
            <div className="ld-intro-slot" ref={slotRef}>
              <div className="ld-intro-approach">
                <div className="ld-intro-body">
                  <div className="ld-intro-ball">
                    <span className="ld-intro-ball-shade" />
                  </div>
                  <svg viewBox="-60 -60 320 320">
                    <polygon className="ld-intro-l1" points={L1} />
                    <polygon className="ld-intro-l2" points={L2} />
                  </svg>
                </div>
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
