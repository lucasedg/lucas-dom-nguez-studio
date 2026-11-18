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
const INTRO_GATE = `(function(){var d=document.documentElement,s=false,r=false;try{r=window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}try{s=!!sessionStorage.getItem('ld-intro')}catch(e){}d.classList.add(s||r?'ld-intro-off':'ld-intro-on');window.__ldGate=setTimeout(function(){d.classList.add('ld-ready','ld-intro-go','ld-handed')},9000)})();`;

/*
 * The light of the intro, in seconds from the moment the page is ready. It plays like a shot,
 * not like a UI animation: motion streaks, a slow push-in, a lens flare and colour fringes.
 * 0 → 2.0    points of light pour in from every edge, spiralling towards the centre, and slowly
 *            fill a circle of light, like something charging up
 * 1.95 → 2.45 the full circle bends, organically, into the square of the symbol (with a flare)
 * 2.45 →     the real symbol takes over; the light stays behind it as a soft halo
 * 3.1        the symbol flies to the hero and becomes the logo of the page (see handOff)
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

const float TAU = 6.2831853;
const float LANES = 30.0;
const float TWIST = 2.6;

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

/* Points of light on a log-spiral grid: each one keeps its lane while the phase pulls it in,
   so it turns faster and gets smaller as it nears the centre. Stretched along the lane: streaks. */
float vortex(vec2 p, float phase){
  float r = max(length(p), 1e-4);
  float lr = log(r);
  float a = atan(p.y, p.x);
  vec2 g = vec2((a + TWIST * lr) / TAU * LANES, lr * 3.4 + phase);
  vec2 id = floor(g);
  vec2 f = fract(g);
  float acc = 0.0;
  for (int j = -1; j <= 1; j++){
    for (int i = -1; i <= 1; i++){
      vec2 c = id + vec2(float(i), float(j));
      c.x = mod(c.x, LANES);
      float h = hash(c);
      if (h < 0.64) continue;
      vec2 o = vec2(hash(c + 3.1), hash(c + 7.7)) * 0.8 + 0.1;
      vec2 d = vec2(float(i), float(j)) + o - f;
      /* Back to screen units: along the lane is the motion, across it the size of the point. */
      float dlr = d.y / 3.4;
      float da = d.x * TAU / LANES - TWIST * dlr;
      vec2 ds = r * vec2(dlr, da);
      float w = 0.0035 + 0.006 * r;
      vec2 dir = normalize(vec2(1.0, -TWIST));
      float along = dot(ds, dir) / (w * 5.0);
      float across = dot(ds, vec2(-dir.y, dir.x)) / w;
      acc += (0.6 + 1.2 * hash(c + 1.3)) * exp(-(along * along + across * across));
    }
  }
  return acc;
}

float sdRoundBox(vec2 p, vec2 b, float r){
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main(){
  float t = uT;
  float L = uLogo;
  /* A slow push-in that lands exactly on the symbol's size when it forms. */
  float zoom = mix(1.07, 1.0, smoothstep(0.0, 2.45, t));
  vec2 p = (gl_FragCoord.xy - uC) / uUnit * zoom;
  float r = length(p);
  float a = atan(p.y, p.x);

  vec3 hot = vec3(1.0, 0.88, 0.74);
  vec3 orange = vec3(1.0, 0.36, 0.08);
  vec3 cool = vec3(0.30, 0.55, 0.85);
  vec3 col = vec3(0.0);

  float Rd = L * 1.42;
  float fill = smoothstep(0.2, 2.0, t);
  float m = smoothstep(1.95, 2.45, t);

  /* The shape: a circle of light that bends into the square of the symbol. */
  float sw = t * 1.2;
  vec2 q = mat2(cos(sw), -sin(sw), sin(sw), cos(sw)) * p;
  float n = fbm(q / L * 1.4 + vec2(t * 0.3, -t * 0.2));
  float size = mix(Rd, L, m);
  float corner = mix(Rd, 0.0, m);
  float sd = sdRoundBox(p, vec2(size), corner) + sin(m * 3.14159) * 0.02 * (n - 0.5) * L / 0.11;
  float inside = 1.0 - smoothstep(-0.002, 0.003, sd);

  /* 1 · Points of light spiralling in from the edges, with colour fringes. */
  float front = mix(0.5, Rd, smoothstep(0.0, 1.4, t));
  float phase = 2.0 * t + 1.6 * t * t;
  float stream = smoothstep(front - 0.05, front + 0.25, r) * (1.0 - smoothstep(2.0, 2.6, t));
  stream *= smoothstep(Rd * 0.95, Rd * 1.5, r);
  if (stream > 0.001){
    float vr = vortex(p * 1.004, phase);
    float vg = vortex(p, phase);
    float vb = vortex(p * 0.996, phase);
    float tint = hash(floor(vec2(a * 3.0, r * 8.0)));
    vec3 pc = vec3(vr * 1.3, vg * 0.8, vb * 0.5);
    pc = mix(pc, vec3(vr * 0.5, vg * 0.75, vb * 1.2), step(0.82, tint));
    col += pc * stream * 2.2;
  }
  /* The air around the circle warms up as the light gathers. */
  col += orange * exp(-max(r - Rd, 0.0) * 9.0) * fill * 0.35 * (1.0 - m * 0.5);

  /* 2 · The circle charges up: it fills with light from the centre, unevenly, like a liquid. */
  float level = r / Rd * 0.7 + n * 0.55;
  float lit = 1.0 - smoothstep(fill * 1.35 - 0.22, fill * 1.35 + 0.04, level);
  lit = max(lit, m);
  vec3 charge = mix(vec3(1.0, 0.55, 0.22), hot, smoothstep(0.3, 0.75, n * 0.6 + fill * 0.45 + (1.0 - r / Rd) * 0.3));
  col += charge * lit * inside * (0.85 + 0.35 * n) * 1.7;
  /* A loading arc runs around the rim, clockwise from the top. */
  float around = fract(0.25 - a / TAU);
  float arc = step(around, fill) * (1.0 - m);
  float rim = exp(-pow((r - Rd) / 0.005, 2.0));
  col += hot * rim * arc * (0.45 + 1.6 * exp(-max(fill - around, 0.0) * 30.0));

  /* 3 · The moment it becomes the symbol: a burst and an anamorphic flare. */
  float flare = exp(-pow((t - 2.18) / 0.16, 2.0));
  col += hot * exp(-r * 7.0) * flare * 1.3;
  col += mix(cool, hot, 0.35) * exp(-abs(p.y) * 120.0) * exp(-abs(p.x) * 1.8) * flare * 1.6;

  /* 4 · Afterwards: a soft halo behind the symbol and a few slow points still orbiting. */
  float after = smoothstep(2.3, 2.9, t);
  if (after > 0.0){
    float box = sdRoundBox(p, vec2(L), 0.0);
    col += orange * exp(-max(box, 0.0) * 11.0) * 0.55 * after;
    col += vec3(1.0, 0.6, 0.35) * vortex(p, 2.0 * t + 9.0) * 0.35 * after * smoothstep(L * 1.4, L * 3.0, r);
  }

  col = 1.0 - exp(-col * 1.1);
  /* The symbol's square ends in the exact brand orange, so the real symbol takes over seamlessly. */
  col = mix(col, vec3(1.0, 0.357, 0.078), inside * smoothstep(2.15, 2.45, t));
  float vignette = 1.0 - smoothstep(0.55, 1.4, length((gl_FragCoord.xy - uC) / uUnit));
  col *= mix(0.75, 1.0, vignette);
  col += vec3(0.0196);
  col += (hash(gl_FragCoord.xy + fract(t) * 17.0) - 0.5) * 0.02;
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

/* Seconds after the start when the formed symbol flies to its place in the hero. */
const HANDOFF_AT = 3100;

/*
 * The symbol formed by the light becomes the hero symbol: it flies and scales onto it while the
 * black and the light fade away, and the hero symbol takes over on the very same pixels.
 * If the hero symbol is not on screen (the page was reloaded lower down), the curtain just opens.
 */
function handOff(intro: HTMLElement, finish: () => void) {
  const slot = intro.querySelector<HTMLElement>(".ld-intro-slot");
  const target = document.querySelector<SVGElement>(".hero-mark-symbol");
  const from = slot?.getBoundingClientRect();
  const to = target?.getBoundingClientRect();
  const onScreen = to && to.width > 0 && to.bottom > 0 && to.top < window.innerHeight;
  if (!slot || !from || !to || !onScreen || !slot.animate) {
    intro.classList.add("is-skipping");
    return;
  }
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const scale = to.width / from.width;
  intro.classList.add("is-handoff");
  const flight = slot.animate(
    [{ transform: "none" }, { transform: `translate(${dx}px, ${dy}px) scale(${scale})` }],
    { duration: 1150, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" },
  );
  flight.onfinish = finish;
}

const INTRO_ENDS = new Set([
  "ld-intro-skip",
  "ld-intro-fallback",
  "ld-intro-late",
  "ld-loader-out",
]);

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
    /* The app is running: from here on it decides when the intro ends, not the gate's safety net. */
    window.clearTimeout((window as unknown as { __ldGate?: number }).__ldGate);
    const full = root.classList.contains("ld-intro-on");
    let stopLight: (() => void) | null = null;
    let cancelled = false;

    const finish = () => {
      root.classList.add("ld-ready", "ld-intro-go", "ld-handed");
      setVisible(false);
    };
    const onEnd = (event: AnimationEvent) => {
      if (event.target === intro && INTRO_ENDS.has(event.animationName)) finish();
    };
    intro.addEventListener("animationend", onEnd);

    const frozen =
      import.meta.env.DEV && new URLSearchParams(window.location.search).has("ld-seek");
    let handoffTimer = 0;
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
      if (!frozen) handoffTimer = window.setTimeout(() => handOff(intro, finish), HANDOFF_AT);
    });

    const safety = frozen ? 0 : window.setTimeout(finish, 14000);
    return () => {
      cancelled = true;
      stopLight?.();
      intro.removeEventListener("animationend", onEnd);
      window.clearTimeout(safety);
      window.clearTimeout(handoffTimer);
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
