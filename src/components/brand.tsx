import { useCallback, useEffect, useRef, useState } from "react";

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

const WAVE_VS = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
/* Procedural recreation of the pleated orange wave, raised by the ball's impacts. */
const WAVE_FS = [
  "precision highp float;uniform vec2 res;uniform float t,y0,W;",
  "float ripS(float adx,float k,float s){if(k<=0.)return 0.;float fr=k*.9;return s*.03*exp(-1.8*k)*sin(adx*24.-k*14.)*smoothstep(fr,fr-.12,adx)*smoothstep(0.,.07,adx);}",
  "float ripR(float r,float k,float s){if(k<=0.)return 0.;return s*exp(-1.3*k)*sin(r*18.-k*12.)*smoothstep(k*.9,k*.9-.2,r);}",
  "void main(){vec2 p=vec2(gl_FragCoord.x,res.y-gl_FragCoord.y)/res.y;float cx=.5*res.x/res.y;float dx=p.x-cx,adx=abs(dx);",
  "float k1=t-.96;float grow=k1>0.?1.-exp(-3.*k1)*cos(7.*k1):0.;",
  "float drop=.46*grow*pow(1.-exp(-dx*dx/(W*W)),1.45);",
  "float rip=ripS(adx,k1,1.)+ripS(adx,t-1.51,.55)+ripS(adx,t-1.95,.3)+ripS(adx,t-2.24,.15);",
  "float yTop=y0+drop+rip;float v=p.y-yTop;float d0=length(vec2(dx,(p.y-y0)*2.2));",
  "float R=max(k1,0.)*1.5;float reveal=k1>0.?smoothstep(R,R-.3,d0):0.;",
  "float flash=k1>0.?exp(-abs(d0-R)*22.)*exp(-2.2*k1):0.;",
  "vec3 col=vec3(.02);",
  "if(v<0.){col+=vec3(1.,.36,.08)*exp(-d0*7.)*exp(-4.*max(k1,0.))*step(0.,k1)*.5;col+=vec3(1.,.5,.2)*flash*.25;}",
  "else{float depth=max(p.y-y0,0.);float u=dx/(W*(.3+2.*depth));",
  "float r=d0;float wv=ripR(r,k1,1.)+ripR(r,t-1.51,.55)+ripR(r,t-1.95,.3)+ripR(r,t-2.24,.15);",
  "u+=.07*wv+(.09*sin(depth*4.+dx*1.3+t*.7)+.25*depth)*grow;",
  "float f=fract(u*5.5);float nx=f*2.-1.;float nz=sqrt(max(1.-nx*nx,0.));vec3 n=normalize(vec3(nx*.95,-.3,nz));vec3 l=normalize(vec3(-.55,-.55,.65));float diff=max(dot(n,l),0.);float spec=pow(max(dot(reflect(-l,n),vec3(0.,0.,1.)),0.),22.);float crease=smoothstep(0.,.1,f)*smoothstep(1.,.86,f);",
  "vec2 L1=vec2(cx-W*.9,y0+.2);float h1=exp(-length(p-L1)*3.);vec2 L2=vec2(cx+W*.45,y0+.28);float h2=exp(-length(p-L2)*2.6);",
  "float fall=clamp(1.25-depth*.8,.2,1.);",
  "vec3 base=vec3(.3,.035,0.)*.35+vec3(1.,.31,.05)*diff*1.15;",
  "col=base*crease*(.45+1.2*h1*vec3(1.,.45,.3)+1.*h2*vec3(1.,.8,.5))*fall;",
  "col+=vec3(1.,.6,.3)*spec*.55*crease*(.4+h2+h1*.5)*fall;",
  "col+=vec3(1.,.48,.18)*exp(-v*110.)*.45;col*=.35+.65*smoothstep(0.,.02,v);",
  "col*=.35+.65*smoothstep(1.2,.5,p.y);",
  "col=col*reveal+vec3(1.,.55,.25)*flash*.6+vec3(.02)*(1.-reveal);}",
  "gl_FragColor=vec4(col,1.);}",
].join("\n");

function startWave(intro: HTMLElement, box: HTMLElement, mark: HTMLElement) {
  const canvas = document.createElement("canvas");
  let gl: WebGLRenderingContext | null = null;
  try {
    gl = canvas.getContext("webgl", { antialias: false, alpha: false });
  } catch {
    gl = null;
  }
  if (!gl) return () => {};
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
  };
  const vs = compile(gl.VERTEX_SHADER, WAVE_VS);
  const fs = compile(gl.FRAGMENT_SHADER, WAVE_FS);
  const program = gl.createProgram();
  if (!vs || !fs || !program) return () => {};
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return () => {};
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "p");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const uRes = gl.getUniformLocation(program, "res");
  const uT = gl.getUniformLocation(program, "t");
  const uY0 = gl.getUniformLocation(program, "y0");
  const uW = gl.getUniformLocation(program, "W");

  const resize = () => {
    if (!gl) return;
    const rect = box.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    const m = mark.getBoundingClientRect();
    gl.uniform1f(uY0, (m.bottom - rect.top) / rect.height);
    const aspect = rect.width / rect.height;
    gl.uniform1f(uW, 0.36 * Math.min(Math.max(aspect, 0.42), 1.7) * (aspect > 1 ? 0.8 : 1));
  };
  box.appendChild(canvas);
  box.classList.add("has-gl");
  resize();
  window.addEventListener("resize", resize);

  /* The shader follows the CSS timeline so both stay in sync even if JS loads late. */
  const timeline = intro
    .getAnimations?.()
    .find((a) => (a as CSSAnimation).animationName === "ld-intro-out");
  const t0 = performance.now();
  let frame = 0;
  const draw = () => {
    if (!gl) return;
    const current = timeline?.currentTime;
    const t = typeof current === "number" ? current / 1000 : (performance.now() - t0) / 1000;
    gl.uniform1f(uT, t);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    frame = requestAnimationFrame(draw);
  };
  frame = requestAnimationFrame(draw);
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", resize);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  };
}

/* Entrance: an orange ball drops, raises the pleated wave, bounces and becomes the logo. */
export function BrandIntro() {
  const [visible, setVisible] = useState(true);
  const introRef = useRef<HTMLDivElement>(null);
  const waveRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);

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
    const mark = markRef.current;
    const stopWave = intro && wave && mark ? startWave(intro, wave, mark) : () => {};
    const onEnd = (event: AnimationEvent) => {
      if (event.target === intro && event.animationName === "ld-intro-out") finish();
    };
    intro?.addEventListener("animationend", onEnd);
    const safety = window.setTimeout(finish, 7500);
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
        <div className="ld-intro-core" aria-hidden="true">
          <div className="ld-intro-mark" ref={markRef}>
            <span className="ld-intro-splash" />
            <span className="ld-intro-splash ld-intro-splash-2" />
            <span className="ld-intro-shadow" />
            <div className="ld-intro-ball-y">
              <div className="ld-intro-ball" />
            </div>
            <svg viewBox="-60 -60 320 320">
              <polygon className="ld-intro-l1" points={L1} />
              <polygon className="ld-intro-l2" points={L2} />
            </svg>
          </div>
          <div className="ld-intro-name">
            Lucas Dominguez
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
