import { useEffect, useRef } from "react";

/*
 * Aurora · one continuous background for the whole page (rebranding 2026).
 * A single fixed WebGL canvas paints the page background itself: carbón where the section is
 * dark, blanco roto where it is light (with soft transitions), and over both, curtains of light
 * in the brand palette plus a field of fine particles. Sections are transparent, so the light
 * flows through the whole page without seams. The flow follows the scroll with inertia, down and
 * up, and keeps breathing slowly at rest. No pointer input. Reduced motion draws one still frame.
 */

/** Sections painted in blanco roto; everything else is carbón. */
const LIGHT_SECTIONS: string[] = [];
const MAX_LIGHT = 6;

const VERT = `
attribute vec2 p;
void main(){ gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uScroll;
uniform float uPage;
uniform float uScale;
uniform vec2 uLight[${MAX_LIGHT}];
uniform float uIntro;   // 0 → 1 during the opening; 1 = normal page background
uniform vec2 uCenter;   // where the opening swirls: the hero logo, in canvas pixels

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++){ v += a * noise(p); p *= 2.02; a *= 0.5; }
  return v;
}

// One vertical ribbon of light: it runs top to bottom, sways sideways, and its streaks flow
// along it. Scroll pushes the flow and the sway, so the movement is clearly visible.
float ribbon(vec2 p, float seed, float t, float s, float base, float width){
  float y = p.y;
  float center = base
    + 0.10 * sin(y * 2.4 + t * 0.55 + s * 1.6 + seed * 2.1)
    + 0.07 * sin(y * 5.1 - t * 0.35 - s * 0.9 + seed)
    + 0.10 * (fbm(vec2(y * 1.3 - s * 0.6 + seed, t * 0.12 + seed)) - 0.5);
  float d = p.x - center;
  float body = exp(-d * d / (width * width));
  float core = exp(-d * d / (width * width * 0.06));
  // Streaks along the ribbon that travel with time and with the scroll.
  float flow = fbm(vec2(d * 18.0 + seed * 3.0, y * 2.2 - t * 0.9 - s * 2.4));
  float streaks = 0.35 + 1.15 * pow(flow, 1.4);
  // Light pulses that run down the ribbon.
  float pulse = 0.75 + 0.25 * sin(y * 7.0 + t * 1.6 + s * 4.0 + seed * 4.0);
  return (body * streaks * pulse) * 0.9 + core * 0.55 * pulse;
}

void main(){
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / uRes;
  float aspect = uRes.x / uRes.y;
  float t = uTime;
  float s = uScroll;

  // Opening: the same aurora is born at the logo, swirls outwards, curls back into the logo,
  // then lets go and settles into the page background. All phases blend, nothing jumps.
  float m = min(uRes.x, uRes.y);
  vec2 v = (frag - uCenter) / m;
  float r = length(v);
  float pOut = smoothstep(0.0, 0.42, uIntro);
  float pIn = smoothstep(0.38, 0.74, uIntro);
  float pRel = smoothstep(0.70, 1.0, uIntro);
  float hold = 1.0 - pRel;
  float twist = hold * (1.6 + 3.2 * pIn) * exp(-r * 1.1) + hold * uIntro * 2.4;
  float cs = cos(twist), sn = sin(twist);
  vec2 vr = vec2(cs * v.x - sn * v.y, sn * v.x + cs * v.y);
  vr *= 1.0 + hold * pIn * 1.8;
  vec2 src = uCenter + vr * m;
  vec2 q = vec2(src.x / uRes.x * aspect, src.y / uRes.y);
  float reach = mix(mix(0.05, 1.7, pOut), 0.2, pIn * hold);
  reach = mix(reach, 4.0, pRel);
  float introMask = mix(smoothstep(reach, reach * 0.3, r), 1.0, pRel);
  float introCore = exp(-r * r * 30.0) * pIn * hold;

  // How "light" this pixel's section is (rects arrive in canvas pixels, y from the bottom).
  float feather = 90.0 * uScale;
  float L = 0.0;
  for (int i = 0; i < ${MAX_LIGHT}; i++){
    vec2 r = uLight[i];
    if (r.y > r.x) {
      float inside = smoothstep(r.x - feather, r.x + feather, frag.y) * (1.0 - smoothstep(r.y - feather, r.y + feather, frag.y));
      L = max(L, inside);
    }
  }

  vec3 dark = vec3(0.082, 0.082, 0.082);
  vec3 light = vec3(0.969, 0.961, 0.949);
  vec3 orange = vec3(1.0, 0.357, 0.078);
  vec3 teal = vec3(0.18, 0.46, 0.62);
  vec3 ivory = vec3(0.97, 0.96, 0.95);

  float cool = 0.5 + 0.5 * sin(uPage * 6.2831 - 1.2);
  vec3 c1 = mix(orange, teal, cool * 0.6);
  vec3 c2 = mix(teal, orange, 0.35 + 0.3 * sin(s * 0.4));
  vec3 c3 = mix(ivory, orange, 0.5);

  float w = aspect;
  float a1 = ribbon(q, 0.0, t, s, w * 0.26, 0.11 * max(w, 0.6));
  float a2 = ribbon(q, 1.7, t * 0.85, s * 0.8, w * 0.70, 0.09 * max(w, 0.6)) * 0.85;
  float a3 = ribbon(q, 3.4, t * 1.15, s * 1.2, w * 0.48, 0.06 * max(w, 0.6)) * 0.65;
  vec3 glow = (c1 * a1 + c2 * a2 + c3 * a3) * introMask * (1.0 + hold * 0.35) + orange * introCore;

  // Dark zones: the light adds up. Light zones: it tints the paper, clearly but readable.
  vec3 onDark = dark + glow * 0.85;
  vec3 tint = clamp(glow, 0.0, 1.0);
  vec3 onLight = light * (1.0 - 0.32 * tint) + tint * 0.14;
  vec3 col = mix(onDark, onLight, L);

  // Particles: a sparse field with parallax on scroll, twinkling slowly.
  vec2 g = vec2(uv.x * aspect, uv.y) * 42.0 + vec2(0.0, s * 14.0 + t * 1.1);
  vec2 cell = floor(g);
  vec2 f = fract(g) - 0.5;
  float h = hash(cell);
  if (h > 0.85) {
    vec2 off = vec2(hash(cell + 3.1), hash(cell + 7.7)) - 0.5;
    float dist = length(f - off * 0.6);
    float tw = 0.5 + 0.5 * sin(t * (0.8 + h * 2.0) + h * 40.0);
    float pd = smoothstep(0.12, 0.0, dist) * tw * mix(introMask, 1.0, pRel);
    vec3 pcDark = mix(ivory, orange, step(0.93, h));
    col = mix(col, mix(pcDark, orange, L), pd * mix(0.85, 0.35, L));
  }

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
}

export function AuroraBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;
    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    if (!(vs && fs && prog)) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uScroll = gl.getUniformLocation(prog, "uScroll");
    const uPage = gl.getUniformLocation(prog, "uPage");
    const uScale = gl.getUniformLocation(prog, "uScale");
    const uLight = gl.getUniformLocation(prog, "uLight");
    const uIntro = gl.getUniformLocation(prog, "uIntro");
    const uCenter = gl.getUniformLocation(prog, "uCenter");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 767px)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // The light is soft, so it can render below the screen's resolution without showing.
    const scale = dpr * (small ? 0.42 : 0.6);
    const lights = LIGHT_SECTIONS.map((sel) => document.querySelector(sel)).filter(
      (el): el is Element => Boolean(el),
    );
    const rects = new Float32Array(MAX_LIGHT * 2);

    const pageTarget = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return max > 0 ? window.scrollY / max : 0;
    };
    let sTarget = window.scrollY / window.innerHeight;
    let sCur = sTarget;
    let pTarget = pageTarget();
    let pCur = pTarget;
    let time = 30;
    let last = 0;
    let raf = 0;
    let height = 1;
    // The shader can also play a swirl opening (uIntro < 1); it is switched off for now and the
    // page keeps its original intro.
    const intro = 1;
    const heroMark = document.querySelector(".hero-mark");

    const resize = () => {
      const w = Math.max(1, Math.round(window.innerWidth * scale));
      height = Math.max(1, Math.round(window.innerHeight * scale));
      canvas.width = w;
      canvas.height = height;
      gl.viewport(0, 0, w, height);
      gl.uniform2f(uRes, w, height);
      gl.uniform1f(uScale, scale);
    };
    const updateLights = () => {
      rects.fill(0);
      lights.slice(0, MAX_LIGHT).forEach((el, i) => {
        const r = el.getBoundingClientRect();
        // Canvas y grows upwards: convert the section's top/bottom to bottom-up pixels.
        rects[i * 2] = height - r.bottom * scale;
        rects[i * 2 + 1] = height - r.top * scale;
      });
      gl.uniform2fv(uLight, rects);
    };
    const draw = () => {
      updateLights();
      gl.uniform1f(uTime, time);
      gl.uniform1f(uScroll, sCur);
      gl.uniform1f(uPage, pCur);
      gl.uniform1f(uIntro, intro);
      const r = heroMark?.getBoundingClientRect();
      const cx = r && r.width > 0 ? r.left + r.width / 2 : window.innerWidth / 2;
      const cy = r && r.width > 0 ? r.top + r.height / 2 : window.innerHeight * 0.4;
      gl.uniform2f(uCenter, cx * scale, height - cy * scale);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const loop = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      time += dt;
      // Inertia: the light glides after the scroll instead of jumping with it.
      sCur += (sTarget - sCur) * 0.06;
      pCur += (pTarget - pCur) * 0.06;
      draw();
      raf = requestAnimationFrame(loop);
    };
    const onScroll = () => {
      sTarget = window.scrollY / window.innerHeight;
      pTarget = pageTarget();
      if (reduced) draw();
    };
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf && !reduced) {
        last = 0;
        raf = requestAnimationFrame(loop);
      }
    };
    const onResize = () => {
      resize();
      draw();
    };

    resize();
    draw();
    document.documentElement.classList.add("aurora-on");
    canvas.classList.add("is-on");
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    if (!reduced) {
      document.addEventListener("visibilitychange", onVisibility);
      raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      document.documentElement.classList.remove("aurora-on");
    };
  }, []);

  return <canvas ref={ref} className="aurora-bg" aria-hidden="true" />;
}
