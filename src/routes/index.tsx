import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import lucasPortrait from "@/assets/lucas-editorial-placeholder.jpg";
import almaRosaImage from "@/assets/project-alma-rosa-placeholder.jpg";
import bubaImage from "@/assets/project-buba-placeholder.jpg";
import codigoPerroImage from "@/assets/project-codigo-perro-placeholder.jpg";
import florecerImage from "@/assets/project-florecer-placeholder.jpg";
import vairoImage from "@/assets/project-vairo-placeholder.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lucas Domínguez Studio — Branding y diseño digital en Málaga" },
      {
        name: "description",
        content:
          "Estudio creativo independiente de Málaga. Branding, identidad visual, dirección creativa, UX/UI y diseño web.",
      },
      { property: "og:title", content: "Lucas Domínguez Studio — Marcas que se hacen ver" },
      {
        property: "og:description",
        content: "Transformamos ideas en marcas y experiencias digitales que se reconocen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudioPage,
});

const services = [
  ["01", "Branding", "Estrategia, posicionamiento y una idea de marca capaz de sostenerlo todo."],
  ["02", "Identidad visual", "Sistemas visuales reconocibles, flexibles y hechos para durar."],
  ["03", "Diseño & comunicación", "Lenguajes gráficos que mantienen la marca viva en cada punto de contacto."],
  ["04", "Digital", "Experiencias web y UX/UI donde concepto, claridad y ritmo trabajan juntos."],
  ["05", "Dirección creativa", "Una mirada coherente para alinear imagen, contenido y presencia."],
] as const;

const transformations = [
  ["Una idea", "una identidad"],
  ["Un logotipo", "un sistema de marca"],
  ["Un negocio", "una presencia"],
  ["Una presencia", "una experiencia digital"],
  ["Una marca", "una experiencia coherente"],
] as const;

const projects = [
  { name: "Buba", type: "Branding · Fashion", image: bubaImage, width: 1600, height: 1200, shape: "landscape" },
  { name: "Hotel Alma Rosa", type: "Identidad · Hospitality", image: almaRosaImage, width: 1200, height: 1504, shape: "portrait" },
  { name: "Código Perro", type: "Digital · Social", image: codigoPerroImage, width: 1600, height: 1200, shape: "landscape" },
  { name: "Florecer", type: "Dirección creativa · Sportswear", image: florecerImage, width: 1200, height: 1500, shape: "portrait" },
  { name: "Vairo", type: "UX/UI · Web", image: vairoImage, width: 1600, height: 1200, shape: "wide" },
] as const;

const process = ["Descubrimos", "Conceptualizamos", "Diseñamos", "Aplicamos", "Evolucionamos"];

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${visible ? "is-visible" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function TextLink({ href, children, light = false }: { href: string; children: ReactNode; light?: boolean }) {
  return (
    <a href={href} className={`editorial-link group ${light ? "text-studio-ivory" : "text-studio-ink"}`}>
      <span>{children}</span>
      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
    </a>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const links = [["Estudio", "#estudio"], ["Servicios", "#servicios"], ["Proyectos", "#proyectos"], ["Contacto", "#contacto"]];
  return (
    <header className="absolute inset-x-0 top-0 z-50 text-studio-ivory">
      <div className="mx-auto grid max-w-[1600px] grid-cols-[minmax(0,1fr)_auto] items-center px-5 py-6 sm:px-8 lg:px-12">
        <a href="#inicio" className="min-w-0 text-[11px] font-semibold uppercase leading-tight tracking-[0.16em] sm:text-xs">
          Lucas Domínguez<br />Studio
        </a>
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Navegación principal">
          {links.map(([label, href]) => <a key={href} href={href} className="nav-link text-[11px] uppercase tracking-[0.14em]">{label}</a>)}
        </nav>
        <button type="button" onClick={() => setOpen(!open)} className="grid h-10 w-10 place-items-center lg:hidden" aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav className="absolute inset-x-0 top-full border-t border-studio-ivory/20 bg-studio-black px-5 py-8 lg:hidden" aria-label="Navegación móvil">
          {links.map(([label, href], index) => (
            <a key={href} href={href} onClick={() => setOpen(false)} className="flex items-center justify-between border-b border-studio-ivory/20 py-4 font-serif text-3xl">
              {label}<span className="font-sans text-xs text-studio-gold">0{index + 1}</span>
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section id="inicio" className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden bg-studio-black px-5 pb-8 pt-28 text-studio-ivory sm:px-8 sm:pb-10 lg:px-12 lg:pt-32">
      <Header />
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 items-center">
        <h1 className="hero-title w-full uppercase" aria-label="Transformamos ideas en marcas que se hacen ver">
          {[
            ["Transformamos", "left"], ["Ideas", "right"], ["En marcas", "left"], ["Que se hacen ver.", "right"],
          ].map(([line, side], index) => (
            <span key={line} className={`hero-line hero-line-${side}`} style={{ animationDelay: `${160 + index * 100}ms` }}><span>{line}</span></span>
          ))}
        </h1>
      </div>
      <div className="mx-auto grid w-full max-w-[1600px] gap-8 border-t border-studio-ivory/20 pt-6 md:grid-cols-[1fr_1fr] md:items-end">
        <p className="max-w-md text-sm leading-relaxed text-studio-ivory/70 sm:text-base">Diseñamos marcas, identidades y experiencias digitales para convertir ideas en presencias que se reconocen.</p>
        <div className="flex flex-wrap gap-x-8 gap-y-4 md:justify-end">
          <TextLink href="#proyectos" light>Ver proyectos</TextLink>
          <TextLink href="#estudio" light>Conocer el estudio</TextLink>
        </div>
      </div>
      <a href="#estudio" aria-label="Ir al estudio" className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 animate-scroll-prompt lg:block"><ArrowDown className="h-5 w-5" /></a>
    </section>
  );
}

function Studio() {
  return (
    <section id="estudio" className="bg-studio-ivory px-5 py-24 text-studio-ink sm:px-8 lg:px-12 lg:py-40">
      <div className="mx-auto max-w-[1500px]">
        <Reveal><p className="section-label">01 — El estudio</p></Reveal>
        <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-7"><h2 className="section-title">Detrás de cada marca<br /><em>hay una persona.</em></h2></Reveal>
          <Reveal className="lg:col-span-5 lg:pt-5" delay={120}>
            <p className="max-w-lg text-lg leading-relaxed text-studio-ink/70">Lucas Domínguez es el fundador y diseñador detrás del estudio. Una práctica independiente donde estrategia, sensibilidad y oficio se encuentran para construir marcas con una presencia propia.</p>
          </Reveal>
          <Reveal className="mt-4 lg:col-span-7 lg:col-start-2 lg:mt-16">
            <figure className="image-reveal aspect-[4/5] overflow-hidden bg-studio-deep">
              <img src={lucasPortrait} alt="Retrato editorial temporal para Lucas Domínguez" width={1280} height={1600} loading="lazy" className="h-full w-full object-cover grayscale transition-transform duration-1000 hover:scale-[1.02]" />
            </figure>
            <figcaption className="mt-3 flex justify-between text-[10px] uppercase tracking-[0.16em] text-studio-ink/50"><span>Retrato temporal</span><span>Málaga, ES</span></figcaption>
          </Reveal>
          <Reveal className="flex items-end lg:col-span-4 lg:pb-16" delay={160}>
            <p className="font-serif text-3xl leading-tight sm:text-4xl">No se trata solo de cómo se ve una marca. Se trata de cómo se entiende, se siente y se recuerda.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Transformations() {
  return (
    <section className="bg-studio-deep py-24 text-studio-ivory lg:py-40">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <Reveal><p className="section-label text-studio-ivory/55">02 — Qué transformamos</p></Reveal>
        <div className="mt-16 lg:mt-24">
          {transformations.map(([from, to], index) => (
            <Reveal key={from} delay={index * 40}>
              <div className="transformation-row grid gap-3 border-t border-studio-ivory/20 py-8 sm:grid-cols-[1fr_auto_1fr] sm:items-center lg:py-11">
                <p className="font-serif text-3xl uppercase sm:text-4xl lg:text-6xl">{from}</p>
                <ArrowUpRight className="h-5 w-5 rotate-45 text-studio-gold sm:rotate-0" aria-hidden="true" />
                <p className="font-serif text-3xl uppercase text-studio-ivory/45 transition-colors duration-500 sm:text-right sm:text-4xl lg:text-6xl">{to}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="servicios" className="bg-studio-cream px-5 py-24 text-studio-ink sm:px-8 lg:px-12 lg:py-40">
      <div className="mx-auto max-w-[1500px]">
        <Reveal><p className="section-label">03 — Servicios</p><h2 className="section-title mt-10">No solo hacemos<br /><em>logos.</em></h2></Reveal>
        <div className="mt-16 border-b border-studio-ink/20 lg:mt-24">
          {services.map(([number, name, description]) => (
            <Reveal key={name}>
              <div className="service-row group grid border-t border-studio-ink/20 py-6 sm:grid-cols-[70px_1fr] lg:grid-cols-[90px_minmax(0,1fr)_minmax(280px,0.7fr)_40px] lg:items-center lg:py-8">
                <span className="text-[10px] tracking-[0.16em] text-studio-gold">{number}</span>
                <h3 className="font-serif text-3xl uppercase transition-transform duration-500 group-hover:translate-x-2 sm:text-4xl lg:text-5xl">{name}</h3>
                <p className="col-start-2 mt-3 max-w-md text-sm leading-relaxed text-studio-ink/60 lg:col-start-auto lg:mt-0">{description}</p>
                <ArrowUpRight className="hidden h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 lg:block" aria-hidden="true" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Work() {
  return (
    <section id="proyectos" className="bg-studio-ivory px-5 py-24 text-studio-ink sm:px-8 lg:px-12 lg:py-40">
      <div className="mx-auto max-w-[1500px]">
        <Reveal><div className="flex items-end justify-between gap-6"><div><p className="section-label">04 — Proyectos seleccionados</p><h2 className="section-title mt-10">Trabajo<br /><em>reciente.</em></h2></div><span className="hidden text-[10px] uppercase tracking-[0.16em] text-studio-ink/50 md:block">Selección 2023—2026</span></div></Reveal>
        <div className="mt-16 grid gap-x-8 gap-y-20 lg:mt-24 lg:grid-cols-12 lg:gap-y-32">
          {projects.map((project, index) => (
            <Reveal key={project.name} className={`${index === 0 ? "lg:col-span-8" : index === 1 ? "lg:col-span-4 lg:mt-32" : index === 2 ? "lg:col-span-7 lg:col-start-6" : index === 3 ? "lg:col-span-4 lg:col-start-2" : "lg:col-span-8 lg:col-start-5"}`}>
              <article className="project group">
                <div className={`image-reveal overflow-hidden bg-studio-deep ${project.shape === "portrait" ? "aspect-[4/5]" : project.shape === "wide" ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
                  <img src={project.image} alt={`Visual editorial temporal de ${project.name}`} width={project.width} height={project.height} loading="lazy" className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.025]" />
                </div>
                <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-t border-studio-ink/20 pt-4">
                  <div className="min-w-0"><h3 className="truncate font-serif text-3xl uppercase sm:text-4xl">{project.name}</h3><p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-studio-ink/50">{project.type}</p></div>
                  <span className="text-[10px] tracking-[0.16em] text-studio-gold">0{index + 1}</span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section className="bg-studio-deep px-5 py-24 text-studio-ivory sm:px-8 lg:px-12 lg:py-40">
      <div className="mx-auto max-w-[1500px]">
        <Reveal><p className="section-label text-studio-ivory/55">05 — Proceso</p><h2 className="section-title mt-10">De la intención<br /><em>a la presencia.</em></h2></Reveal>
        <div className="relative mt-20 lg:mt-28">
          <div className="absolute bottom-0 left-[7px] top-0 w-px bg-studio-ivory/20 lg:bottom-auto lg:right-0 lg:top-[7px] lg:h-px lg:w-auto" />
          <div className="process-line absolute left-[7px] top-0 w-px bg-studio-gold lg:right-0 lg:top-[7px] lg:h-px lg:w-auto" />
          <ol className="grid gap-12 lg:grid-cols-5 lg:gap-5">
            {process.map((step, index) => (
              <li key={step} className="relative pl-10 lg:pl-0 lg:pt-10">
                <span className="absolute left-0 top-0 z-10 h-[15px] w-[15px] rounded-full border border-studio-gold bg-studio-deep lg:left-0" />
                <span className="text-[10px] tracking-[0.16em] text-studio-gold">0{index + 1}</span>
                <p className="mt-3 font-serif text-2xl uppercase sm:text-3xl">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section id="contacto" className="flex min-h-[88svh] items-center bg-studio-gold px-5 py-24 text-studio-black sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-[1500px]">
        <Reveal><p className="section-label border-studio-black/30">06 — Hablemos</p></Reveal>
        <Reveal className="mt-12"><h2 className="cta-title uppercase">Toda marca<br />comienza<br /><em>con una idea.</em></h2></Reveal>
        <Reveal className="mt-12 flex flex-col items-start justify-between gap-8 border-t border-studio-black/30 pt-6 sm:flex-row sm:items-end" delay={120}>
          <p className="font-serif text-2xl sm:text-3xl">Quizás la siguiente empiece aquí.</p>
          <a href="mailto:hola@lucasdominguez.studio" className="editorial-link border-studio-black text-studio-black">Iniciar un proyecto<ArrowUpRight className="h-4 w-4" /></a>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-studio-black px-5 py-10 text-studio-ivory sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-[1500px] gap-10 border-t border-studio-ivory/20 pt-8 md:grid-cols-[1fr_auto] md:items-end">
        <div><p className="font-serif text-2xl uppercase">Lucas Domínguez Studio</p><p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-studio-ivory/50">Málaga, Spain</p></div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-[10px] uppercase tracking-[0.14em] text-studio-ivory/65 md:justify-end"><span>Branding</span><span>Visual Identity</span><span>Creative Direction</span><span>Digital</span></div>
        <p className="text-[10px] text-studio-ivory/35 md:col-span-2">© {new Date().getFullYear()} — Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

function StudioPage() {
  return <main className="overflow-hidden"><Hero /><Studio /><Transformations /><Services /><Work /><Process /><FinalCta /><Footer /></main>;
}
