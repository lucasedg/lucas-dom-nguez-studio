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
 * The light of the intro, in seconds from the moment the page is ready. Everything is soft and
 * continuous, like real light: the same aurora ribbons as the page background, with their halo.
 * 0          black
 * 0 → 2.3    aurora ribbons pour in from every edge, curling towards the centre. They have a head
 *            and a tail: the light gathers into a glowing circle until the last of it arrives
 * 2.15 → 2.65 the glow condenses: its edge sharpens while it bends into the square of the symbol
 * 2.65 →     the real symbol, alone on black with a warm halo
 * 3.5        the symbol flies to the hero and becomes the logo of the page (see handOff)
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
const float PI = 3.1415927;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++){ v += a * noise(p); p *= 2.02; a *= 0.5; }
  return v;
}

/* One aurora ribbon, like the ones in the page background, but bent into a spiral arm:
   "along" is the distance to the centre (log scale), "across" is the angle. Its streaks and
   pulses flow inwards, so the light visibly travels to the centre. */
float arm(float ang, float lr, float seed, float t, float width){
  float center = seed
    + 0.22 * sin(lr * 2.4 + t * 0.9 + seed * 2.1)
    + 0.14 * sin(lr * 5.1 - t * 0.6 + seed)
    + 0.30 * (fbm(vec2(lr * 1.3 + seed, t * 0.25 + seed)) - 0.5);
  float d = mod(ang - center + PI, TAU) - PI;
  float body = exp(-d * d / (width * width));
  float core = exp(-d * d / (width * width * 0.06));
  float flow = fbm(vec2(d * 7.0 + seed * 3.0, lr * 2.2 + t * 1.8));
  float streaks = 0.35 + 1.15 * pow(flow, 1.4);
  float pulse = 0.75 + 0.25 * sin(lr * 7.0 + t * 3.0 + seed * 4.0);
  return body * streaks * pulse * 0.9 + core * 0.55 * pulse;
}

float sdRoundBox(vec2 p, vec2 b, float r){
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main(){
  float t = uT;
  float L = uLogo;
  /* A slow push-in that lands exactly on the symbol's size when it forms. */
  float zoom = mix(1.06, 1.0, smoothstep(0.0, 2.65, t));
  vec2 p = (gl_FragCoord.xy - uC) / uUnit * zoom;
  float r = max(length(p), 1e-4);
  float lr = log(r);
  float a = atan(p.y, p.x);

  vec3 orange = vec3(1.0, 0.357, 0.078);
  vec3 teal = vec3(0.18, 0.46, 0.62);
  vec3 ivory = vec3(0.97, 0.96, 0.95);
  vec3 warm = vec3(1.0, 0.78, 0.56);
  vec3 col = vec3(0.0);

  float Rd = L * 1.45;
  float gather = smoothstep(0.3, 2.3, t);
  float m = smoothstep(2.15, 2.65, t);

  /* 1 · Aurora arms curling in from the edges. The spiral tightens a little as time goes on. */
  float spin = 1.9 + 0.5 * smoothstep(0.0, 2.4, t);
  float ang = a + spin * lr - t * 0.55;
  float a1 = arm(ang, lr, 0.0, t, 0.42);
  float a2 = arm(ang, lr, 2.1, t * 0.9, 0.34) * 0.85;
  float a3 = arm(ang, lr, 4.2, t * 1.1, 0.26) * 0.7;
  float a4 = arm(ang * -1.0 + 0.6, lr, 1.0, t * 0.8, 0.22) * 0.35;
  vec3 aur = orange * a1 + teal * a2 + mix(ivory, orange, 0.5) * a3 + warm * a4;
  /* Where the light is: it enters softly from the edges and is absorbed into the circle. */
  /* Head: from beyond the corners to the circle. Tail: follows, faster at the end, and is
     swallowed by the circle, so when the symbol forms there is no aurora left. */
  float front = mix(1.3, Rd * 1.2, smoothstep(0.0, 1.4, t));
  float reach = smoothstep(front - 0.3, front + 0.2, r);
  float tail = mix(2.2, Rd * 0.8, pow(smoothstep(0.6, 2.3, t), 1.6));
  float ends = 1.0 - smoothstep(tail - 0.45, tail + 0.1, r);
  float absorb = smoothstep(Rd * 0.7, Rd * 2.2, r);
  float level = ends;
  /* The arms get brighter and thinner as they near the centre, like light being funnelled. */
  float funnel = 0.75 + 0.6 * exp(-r * 2.0);
  col += aur * reach * absorb * level * funnel * 0.95;

  /* 2 · The gathered light: a soft glowing circle that builds up, with a gentle inner motion. */
  float sw = t * 0.9;
  vec2 q = mat2(cos(sw), -sin(sw), sin(sw), cos(sw)) * p;
  float n = fbm(q / L * 1.3 + vec2(0.0, t * 0.2));
  float size = mix(Rd, L, m);
  float corner = mix(Rd, 0.0, m);
  float sd = sdRoundBox(p, vec2(size), corner);
  /* The edge starts very soft (a glow) and sharpens into the symbol's crisp square. */
  float feather = mix(Rd * 0.55, 0.0015, m);
  float shape = 1.0 - smoothstep(-feather * 0.4, feather, sd);
  float charge = gather * gather;
  vec3 inner = mix(warm, ivory, 0.45 + 0.25 * n) * (0.8 + 0.2 * n);
  col += inner * shape * charge * 1.6;
  /* Its halo, which also warms the arms that feed it. */
  col += mix(orange, warm, 0.3) * exp(-max(sd, 0.0) / (L * 0.9)) * charge * 0.55;

  /* 3 · A soft swell of light at the moment it becomes the symbol. */
  float swell = exp(-pow((t - 2.42) / 0.3, 2.0));
  col += warm * exp(-r / (L * 2.5)) * swell * 0.7;

  /* 4 · Afterwards: a warm halo behind the symbol. */
  float after = smoothstep(2.55, 3.1, t);
  float box = sdRoundBox(p, vec2(L), 0.0);
  col += orange * exp(-max(box, 0.0) / (L * 0.7)) * 0.45 * after;

  col = 1.0 - exp(-col * 1.05);
  /* The symbol's square ends in the exact brand orange, so the real symbol takes over seamlessly. */
  float crisp = 1.0 - smoothstep(-0.0015, 0.0015, sd);
  col = mix(col, orange, crisp * smoothstep(2.3, 2.65, t));
  float vignette = 1.0 - smoothstep(0.6, 1.5, length((gl_FragCoord.xy - uC) / uUnit));
  col *= mix(0.8, 1.0, vignette);
  col += vec3(0.0196);
  col += (hash(gl_FragCoord.xy + fract(t) * 17.0) - 0.5) * 0.012;
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
const HANDOFF_AT = 3500;

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
