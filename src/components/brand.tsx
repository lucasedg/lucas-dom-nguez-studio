import { useEffect, useRef, useState } from "react";

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
 * Runs while the HTML is parsed, before the first paint. First visit of the session: the full intro
 * ("ld-intro-on"). Returning visitors and reduced motion: only the loader ("ld-intro-off").
 * The timeout is a safety net: if the app never boots, the hero is released anyway.
 */
const INTRO_GATE = `(function(){var d=document.documentElement,s=false,r=false;try{r=window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}try{s=!!sessionStorage.getItem('ld-intro')}catch(e){}d.classList.add(s||r?'ld-intro-off':'ld-intro-on');setTimeout(function(){d.classList.add('ld-ready','ld-intro-go')},9000)})();`;

/*
 * The light of the intro, in seconds from the moment the page is ready:
 * 0 → 1.0   a seed of aurora light grows towards the viewer
 * 1.0       it hits the glass: flash and a shockwave of aurora curtains
 * 1.6 → 2.95 the light is pulled back to the centre, swirling
 * 3.0 →     it condenses into the symbol and stays behind it as a soft halo
 */
const INTRO_VERT = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const INTRO_FRAG = `
precision highp float;
uniform vec2 uC;
uniform float uUnit;
uniform float uT;
uniform float uLogo;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++){ v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}
/* Aurora curtains around a centre: sampled on a circle so there is no seam at the back. */
float curtain(float ang, float rad, float t, float freq){
  vec2 c = vec2(cos(ang), sin(ang)) * freq;
  return fbm(c + vec2(rad * 1.3 - t * 0.35, rad * 0.5 + t * 0.22));
}

void main(){
  vec2 p = (gl_FragCoord.xy - uC) / uUnit;
  float r = length(p);
  float a = atan(p.y, p.x);
  float t = uT;

  vec3 hot = vec3(1.0, 0.86, 0.72);
  vec3 orange = vec3(1.0, 0.36, 0.08);
  vec3 amber = vec3(1.0, 0.58, 0.22);
  vec3 cool = vec3(0.24, 0.52, 0.80);
  vec3 col = vec3(0.0);

  /* 1 · The seed: a halo of light coming at the viewer (on-screen size ∝ 1/z). */
  if (t < 1.3){
    float u = clamp(t, 0.0, 1.0);
    float R = 0.12 * 0.0556 / (1.0 - 0.9444 * u);
    float d = r / R;
    float on = 1.0 - smoothstep(1.0, 1.3, t);
    float flame = pow(curtain(a + t * 0.8, d * 0.25, t * 2.0, 3.0), 2.4) * exp(-max(d - 0.4, 0.0) * 1.2) * 2.6;
    col += on * (hot * exp(-d * d * 2.4) * 1.5
      + orange * (exp(-d * 0.9) * 0.45 + flame)
      + cool * flame * 0.35 * smoothstep(0.9, 2.6, d));
  }

  /* 2 · Impact: a flash and a shockwave of aurora curtains leaving the screen. */
  if (t > 1.0 && t < 2.6){
    float k = t - 1.0;
    col += (hot * 0.8 + orange * 0.6) * exp(-k * 9.0) * exp(-r * 4.0) * 2.4;
    float ws = clamp(k / 1.45, 0.0, 1.0);
    float Rw = 0.12 + (1.0 - pow(1.0 - ws, 3.0)) * 1.7;
    float fade = 1.0 - smoothstep(0.6, 1.0, ws);
    /* The curtains ripple: their angle bends with the distance, like auroras folding. */
    float bend = a + 0.18 * sin(r * 7.0 - t * 4.0) + 0.1 * sin(a * 3.0 + t);
    float fold = curtain(bend, r * 0.3, t * 1.4, 2.6);
    float behind = Rw - r;
    float width = 0.05 + 0.32 * ws;
    float body = smoothstep(-0.015, 0.02, behind) * exp(-max(behind, 0.0) / width);
    float crest = exp(-pow(behind / (0.012 + 0.02 * ws), 2.0));
    float ribbons = smoothstep(0.32, 0.72, fold);
    float rays = pow(curtain(bend, r * 0.15 - t * 0.5, t, 7.0), 2.0) * 1.6;
    vec3 c = mix(hot, amber, smoothstep(0.0, 0.05, behind));
    c = mix(c, orange, smoothstep(0.04, 0.16, behind));
    c = mix(c, cool, smoothstep(0.14, 0.42, behind) * 0.8);
    col += fade * (body * ribbons * rays * c * 1.8 + crest * ribbons * hot * 1.2);
  }

  /* 3 · The light comes back, swirling, and gathers in the centre. */
  if (t > 1.55 && t < 3.4){
    float ic = clamp((t - 1.6) / 1.35, 0.0, 1.0);
    float Rc = 1.25 * pow(1.0 - ic, 1.6);
    float sw = a + 1.4 * ic / (r + 0.2) + 0.15 * sin(r * 9.0 + t * 5.0);
    float fold = smoothstep(0.3, 0.75, curtain(sw, r * 0.3, t * 1.5, 2.8));
    float rays = pow(curtain(sw, r * 0.6 + t * 1.2, t, 6.0), 2.0) * 1.6;
    float ahead = r - Rc;
    float body = smoothstep(-0.01, 0.02, ahead) * exp(-max(ahead, 0.0) / (0.06 + 0.3 * (1.0 - ic)));
    float edge = exp(-pow(ahead / 0.02, 2.0));
    float on = smoothstep(0.0, 0.15, ic) * (1.0 - smoothstep(0.88, 1.0, ic));
    vec3 c = mix(orange, cool, smoothstep(0.08, 0.45, ahead) * 0.8);
    c = mix(amber, c, smoothstep(0.0, 0.06, ahead));
    col += on * fold * (body * rays * c * 1.8 + edge * hot);
  }

  /* 4 · It condenses into the symbol and stays behind it, breathing. */
  if (t > 2.8){
    float g = smoothstep(2.8, 3.1, t) * (1.0 - smoothstep(3.1, 3.6, t));
    col += hot * exp(-r * r * 70.0) * g * 2.4;
    float L = uLogo;
    float sq = max(abs(p.x), abs(p.y));
    float settle = smoothstep(3.0, 3.6, t);
    float breathe = 0.85 + 0.15 * sin(t * 2.2);
    col += orange * exp(-max(sq - L, 0.0) * 8.0) * 0.5 * settle * breathe;
    float wisp = pow(curtain(a + t * 0.18, r * 0.3, t * 0.6, 4.0), 3.0) * exp(-max(r - L, 0.0) * 3.2) * 1.4;
    col += mix(cool, orange, smoothstep(L * 3.0, L, r)) * wisp * settle;
  }

  col = 1.0 - exp(-col * 1.15);
  col += vec3(0.0196);
  col += (hash(gl_FragCoord.xy + t) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`;

function startIntroLight(box: HTMLElement, slot: HTMLElement) {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
  if (!gl) return null;
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, INTRO_VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, INTRO_FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  const uC = gl.getUniformLocation(prog, "uC");
  const uUnit = gl.getUniformLocation(prog, "uUnit");
  const uT = gl.getUniformLocation(prog, "uT");
  const uLogo = gl.getUniformLocation(prog, "uLogo");

  const small = window.matchMedia("(max-width: 767px)").matches;
  const resize = () => {
    const rect = box.getBoundingClientRect();
    /* Soft light: it renders below the screen's resolution without showing. */
    const scale = Math.min(window.devicePixelRatio || 1, 2) * (small ? 0.5 : 0.6);
    canvas.width = Math.max(1, Math.round(rect.width * scale));
    canvas.height = Math.max(1, Math.round(rect.height * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
    const unit = Math.min(canvas.width, canvas.height);
    const m = slot.getBoundingClientRect();
    gl.uniform2f(
      uC,
      (m.left + m.width / 2 - rect.left) * scale,
      canvas.height - (m.top + m.height / 2 - rect.top) * scale,
    );
    gl.uniform1f(uUnit, unit);
    gl.uniform1f(uLogo, ((m.width / 2) * scale) / unit);
  };
  box.appendChild(canvas);
  resize();
  window.addEventListener("resize", resize);

  const t0 = performance.now();
  let frame = 0;
  /* Dev only: window.__ldIntroSeek(seconds) freezes the light and the CSS on one frame. */
  let seek: number | null = null;
  const draw = () => {
    const t = seek ?? (performance.now() - t0) / 1000;
    gl.uniform1f(uT, t);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (t < 6 || seek !== null) frame = requestAnimationFrame(draw);
  };
  if (import.meta.env.DEV) {
    (window as unknown as { __ldIntroSeek?: (s: number) => void }).__ldIntroSeek = (s) => {
      seek = s;
      box.parentElement?.getAnimations({ subtree: true }).forEach((anim) => {
        anim.pause();
        anim.currentTime = s * 1000;
      });
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    };
    const frozen = new URLSearchParams(window.location.search).get("ld-seek");
    if (frozen !== null)
      window.setTimeout(
        () =>
          (window as unknown as { __ldIntroSeek: (s: number) => void }).__ldIntroSeek(
            Number(frozen),
          ),
        50,
      );
  }
  frame = requestAnimationFrame(draw);
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", resize);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };
}

/* Resolves when fonts and the first images are in, or after `cap` ms, whichever comes first. */
function whenReady(cap: number) {
  const loaded =
    document.readyState === "complete"
      ? Promise.resolve()
      : new Promise<void>((resolve) =>
          window.addEventListener("load", () => resolve(), { once: true }),
        );
  const fonts = document.fonts ? document.fonts.ready.then(() => undefined) : Promise.resolve();
  return Promise.race([
    Promise.all([loaded, fonts]),
    new Promise<void>((resolve) => window.setTimeout(resolve, cap)),
  ]);
}

const INTRO_ENDS = new Set(["ld-intro-out", "ld-intro-skip", "ld-intro-fallback", "ld-loader-out"]);

/*
 * Loader + entrance. While the page loads, a small seed of aurora light breathes in the centre.
 * First visit of the session: when everything is ready, the seed comes at the viewer, hits the
 * glass in a shockwave of aurora light, and the light returns to the centre to become the logo.
 * Returning visitors only see the loader, which fades out as soon as the page is ready.
 */
export function BrandIntro() {
  const [visible, setVisible] = useState(true);
  const introRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const intro = introRef.current;
    if (!intro) return;
    const full = root.classList.contains("ld-intro-on");
    let stopLight: (() => void) | null = null;
    let cancelled = false;

    const finish = () => {
      root.classList.add("ld-ready", "ld-intro-go");
      setVisible(false);
    };
    const onEnd = (event: AnimationEvent) => {
      if (event.target === intro && INTRO_ENDS.has(event.animationName)) finish();
    };
    intro.addEventListener("animationend", onEnd);

    whenReady(full ? 3500 : 2500).then(() => {
      if (cancelled) return;
      if (!full) {
        root.classList.add("ld-ready");
        intro.classList.add("is-leaving");
        window.setTimeout(finish, 900);
        return;
      }
      try {
        sessionStorage.setItem("ld-intro", "1");
      } catch {
        /* Private mode: the intro simply plays again next time. */
      }
      if (lightRef.current && slotRef.current) {
        stopLight = startIntroLight(lightRef.current, slotRef.current);
      }
      if (!stopLight) intro.classList.add("no-light");
      intro.classList.add("is-playing");
      root.classList.add("ld-intro-go");
    });

    const frozen =
      import.meta.env.DEV && new URLSearchParams(window.location.search).has("ld-seek");
    const safety = frozen ? 0 : window.setTimeout(finish, 14000);
    return () => {
      cancelled = true;
      stopLight?.();
      intro.removeEventListener("animationend", onEnd);
      window.clearTimeout(safety);
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: INTRO_GATE }} />
      <div className="ld-intro" ref={introRef} role="status" aria-label="Cargando">
        <div className="ld-intro-light" ref={lightRef} aria-hidden="true" />
        <div className="ld-intro-core" aria-hidden="true">
          <div className="ld-intro-slot" ref={slotRef}>
            <span className="ld-intro-seed" />
            <svg className="ld-intro-mark" viewBox="-60 -60 320 320">
              <rect className="ld-intro-badge" x="-60" y="-60" width="320" height="320" />
              <polygon className="ld-intro-l1" points={L1} />
              <polygon className="ld-intro-l2" points={L2} />
            </svg>
          </div>
          <div className="ld-intro-name">
            <span>Lucas Dominguez</span>
            <small>Studio</small>
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
