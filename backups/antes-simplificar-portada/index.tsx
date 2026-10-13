import { Content as DialogContent } from "@radix-ui/react-dialog";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Menu, MoveRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import studioLogo from "@/assets/ld-transparent.png";
import lucasPortrait from "@/assets/lucas-sobre-mi.png";
import almaRosaImage from "@/assets/project-alma-rosa-placeholder.jpg";
import bubaCover from "@/assets/buba/cover.jpg";
import bubaNoSleep from "@/assets/buba/no-sleep.png";
import bubaImage from "@/assets/buba/core.jpg";
import bubaLogo from "@/assets/buba/logo.png";
import bubaManual from "@/assets/buba/manual.jpg";
import bubaLimited from "@/assets/buba/limited.jpg";
import bubaStatement from "@/assets/buba/statement.jpg";
import bubaTank from "@/assets/buba/tirantes.jpg";
import bubaSocialCover from "@/assets/buba/social-portada.jpg";
import bubaSocialPhone from "@/assets/buba/social-movil.jpg";
import bubaSocialShirts from "@/assets/buba/social-prendas.jpg";
import bubaSocialCampaign from "@/assets/buba/social-campana.jpg";
import codigoPerroImage from "@/assets/project-codigo-perro-placeholder.jpg";
import florecerImage from "@/assets/project-florecer-placeholder.jpg";
import vairoImage from "@/assets/project-vairo-placeholder.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lucas Domínguez Studio — Diseño de imagen de marca en Málaga" },
      {
        name: "description",
        content:
          "Soy Lucas Domínguez, diseñador gráfico en Málaga. En mi agencia diseño la imagen de tu marca: estrategia, identidad visual y comunicación.",
      },
      { property: "og:title", content: "Lucas Domínguez Studio — Marcas que se hacen ver" },
      {
        property: "og:description",
        content: "Diseño la imagen de tu marca para que tenga una identidad propia y reconocible.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudioPage,
});

const projects = [
  {
    name: "Buba",
    category: "Identidad de marca",
    type: "Identidad visual · Streetwear",
    focus: ["Identidad visual", "Dirección de arte", "Presencia de marca"],
    image: bubaCover,
    width: 2161,
    height: 2701,
    shape: "landscape",
    statement: "Una actitud también puede ser un sistema de marca.",
    caseStudy: {
      intro:
        "BUBA es un proyecto de identidad para streetwear: una marca de presencia contundente, contraste y actitud nocturna. Diseñé un lenguaje que conecta el logotipo, las propuestas de prendas y su comunicación visual.",
      logo: bubaLogo,
      chapters: [
        {
          surface: "light",
          title: "Una firma que se reconoce en el detalle",
          text: "El logotipo se apoya en formas anchas y compactas. El corte geométrico interior de la A es su rasgo distintivo. El manual define sus proporciones, área de protección y versiones en positivo y negativo para mantener una identidad consistente.",
          images: [
            {
              src: bubaManual,
              width: 1536,
              height: 1024,
              caption: "Construcción del logotipo y criterios de uso.",
            },
          ],
        },
        {
          title: "Una identidad, distintas formas de vestirla",
          text: "Las propuestas exploran tres registros: Core, con aplicaciones esenciales del logotipo; Statement, con mensajes y tipografía protagonista; y Limited, con composiciones inspiradas en la noche. Estas visualizaciones presentan propuestas de aplicación de la identidad a las prendas.",
          images: [
            {
              src: bubaImage,
              width: 1402,
              height: 1122,
              caption: "Core Collection · Aplicaciones esenciales y acabados tono sobre tono.",
            },
            {
              src: bubaNoSleep,
              width: 1402,
              height: 1122,
              caption: "No Sleep Club · Aplicación de la gráfica Statement en una prenda.",
            },
            {
              src: bubaStatement,
              width: 1536,
              height: 1024,
              caption:
                "Statement Collection · Mensajes que convierten la prenda en una declaración.",
            },
            {
              src: bubaLimited,
              width: 1402,
              height: 1122,
              caption: "Limited Collection · Exploraciones gráficas Afterdark y Nightfall.",
            },
            {
              src: bubaTank,
              width: 1402,
              height: 1122,
              caption: "Aplicación en camiseta de tirantes · Logotipo, símbolo y coordenadas.",
            },
          ],
        },
        {
          title: "De la prenda a la comunicación",
          text: "El carrusel traslada la misma identidad a redes: textura, contraste y presencia del logotipo. Las piezas muestran cómo puede reconocerse BUBA tanto en el producto como en una pantalla.",
          images: [
            {
              src: bubaSocialCover,
              width: 2161,
              height: 2701,
              caption: "Portada del carrusel · La firma sobre textura textil.",
            },
            {
              src: bubaSocialPhone,
              width: 2161,
              height: 2701,
              caption: "La marca en el entorno digital.",
            },
            {
              src: bubaSocialShirts,
              width: 2161,
              height: 2701,
              caption: "Aplicaciones y acabados del logotipo.",
            },
            {
              src: bubaSocialCampaign,
              width: 2161,
              height: 2701,
              caption: "Imagen de campaña · El universo nocturno de BUBA.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "Hotel Alma Rosa",
    category: "Identidad de marca",
    type: "Identidad · Hospitality",
    focus: ["Identidad", "Atmósfera", "Experiencia de marca"],
    image: almaRosaImage,
    width: 1200,
    height: 1504,
    shape: "portrait",
    statement: "La hospitalidad empieza mucho antes de cruzar una puerta.",
  },
  {
    name: "Código Perro",
    category: "Diseño para redes",
    type: "Digital · Social",
    focus: ["Comunicación", "Contenido", "Entorno digital"],
    image: codigoPerroImage,
    width: 1600,
    height: 1200,
    shape: "landscape",
    statement: "Cuando una marca habla, cada formato cuenta.",
  },
  {
    name: "Florecer",
    category: "Dirección creativa",
    type: "Dirección creativa · Sportswear",
    focus: ["Concepto creativo", "Expresión visual", "Movimiento"],
    image: florecerImage,
    width: 1200,
    height: 1500,
    shape: "portrait",
    statement: "La energía se reconoce antes de poder explicarla.",
  },
  {
    name: "Vairo",
    category: "Diseño web",
    type: "UX/UI · Web",
    focus: ["Diseño de interfaz", "Experiencia de usuario", "Presencia web"],
    image: vairoImage,
    width: 1600,
    height: 1200,
    shape: "wide",
    statement: "Lo digital también debe sentirse como una presencia.",
  },
] as const;

const services = [
  {
    number: "01",
    name: "Crear la imagen de tu marca",
    category: "Branding e identidad visual",
    need: "Tienes un negocio o una idea, pero todavía no una imagen que lo represente.",
    explanation:
      "Defino contigo qué hace diferente a tu marca y lo convierto en una identidad visual propia.",
    includes: [
      "Concepto y dirección visual",
      "Logotipo, colores y tipografías",
      "Guía para usar tu identidad con coherencia",
    ],
    result: "Una base visual clara para presentar tu negocio y empezar a comunicar.",
  },
  {
    number: "02",
    name: "Renovar una marca que ya existe",
    category: "Rediseño de identidad",
    need: "Tu negocio ha evolucionado, pero su imagen se ha quedado atrás o cambia en cada canal.",
    explanation:
      "Reviso lo que ya tienes, identifico qué merece conservarse y actualizo lo que ya no te representa.",
    includes: [
      "Revisión de tu imagen actual",
      "Actualización del logotipo y el estilo visual",
      "Aplicación de la nueva identidad a tus piezas principales",
    ],
    result:
      "Una imagen más coherente con tu negocio actual, sin perder lo que lo hace reconocible.",
  },
  {
    number: "03",
    name: "Dar forma a lo que comunicas",
    category: "Diseño gráfico y comunicación",
    need: "Ya tienes una identidad y necesitas piezas para mostrar tus productos, servicios o una campaña.",
    explanation:
      "Diseño materiales que transmiten tu mensaje y mantienen el mismo estilo en cada formato.",
    includes: [
      "Diseño de publicaciones y plantillas para redes",
      "Presentaciones, catálogos y material impreso",
      "Piezas visuales para lanzamientos y campañas",
    ],
    result:
      "Materiales listos para comunicar tu marca de forma consistente, en digital y en papel.",
  },
  {
    number: "04",
    name: "Llevar tu marca a una web",
    category: "Diseño web y experiencia de usuario",
    need: "Necesitas una web o la que tienes no explica bien qué haces ni facilita que te contacten.",
    explanation:
      "Organizo el contenido y diseño una navegación sencilla para que tus visitantes entiendan tu propuesta.",
    includes: [
      "Estructura de páginas y contenidos",
      "Diseño visual adaptado a móvil y ordenador",
      "Recorrido claro hacia tus servicios y contacto",
    ],
    result:
      "Una web fácil de entender, alineada con tu imagen y orientada a que den el siguiente paso.",
  },
] as const;

const creativePlans = [
  {
    name: "Básico",
    price: "390 €",
    units: "6 unidades de diseño al mes",
    description: "Para mantener tus materiales visuales al día.",
    valueNote: "Una forma sencilla de empezar con diseño continuo.",
    features: [
      "Una prioridad creativa al mes",
      "Una reunión de 20 minutos",
      "Diseño para tus canales y materiales comerciales",
    ],
    cta: "Empezar con Básico",
    featured: false,
  },
  {
    name: "Pro",
    price: "690 €",
    units: "12 unidades de diseño al mes",
    description: "Para avanzar con una dirección creativa constante.",
    valueNote: "+6 unidades frente a Básico por 300 € más al mes.",
    features: [
      "Todo lo incluido en Básico, con 6 unidades más",
      "Objetivo y prioridades acordados cada mes",
      "Una reunión de 30 minutos",
      "Un resumen mensual de lo diseñado y sus próximos usos",
    ],
    cta: "Elegir Pro",
    featured: true,
  },
  {
    name: "Premium",
    price: "1.090 €",
    units: "20 unidades de diseño al mes",
    description: "Para marcas con varias necesidades de comunicación cada mes.",
    valueNote: "+8 unidades frente a Pro por 400 € más al mes.",
    features: [
      "Todo lo incluido en Pro, con 8 unidades más",
      "Dos prioridades creativas en paralelo",
      "Dos reuniones de 30 minutos",
      "Planificación de dirección visual para el trimestre",
    ],
    cta: "Consultar Premium",
    featured: false,
  },
] as const;

const designUnitExamples = [
  "1 unidad: una pieza sencilla o adaptación a otro formato",
  "3 unidades: un carrusel de hasta cinco diapositivas",
  "4 unidades: una ficha comercial de hasta dos páginas",
  "6 unidades: una presentación de hasta ocho diapositivas",
] as const;

const process = [
  ["Escucho", "Conozco tu negocio y lo que quieres conseguir con tu marca."],
  ["Defino", "Convierto esa intención en una idea y una dirección visual propias."],
  ["Diseño", "Doy forma a una identidad con carácter, claridad y coherencia."],
  ["Aplico", "Llevo esa identidad a las piezas y los canales que necesita tu marca."],
  ["Acompaño", "Te ayudo a mantener una imagen coherente mientras tu marca crece."],
] as const;

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setVisible(false);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function CinematicCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const label = labelRef.current;
    const query = window.matchMedia(
      "(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    if (!cursor || !label || !query.matches) return;

    const syncCursor = () => {
      document.body.classList.toggle("has-studio-cursor", query.matches);
      if (!query.matches) cursor.classList.remove("is-visible");
    };
    syncCursor();
    query.addEventListener("change", syncCursor);

    const updateCursor = (event: MouseEvent) => {
      if (!query.matches) return;
      const target =
        event.target instanceof Element ? event.target.closest<HTMLElement>("[data-cursor]") : null;
      cursor.style.setProperty("--cursor-x", `${event.clientX}px`);
      cursor.style.setProperty("--cursor-y", `${event.clientY}px`);
      label.textContent = target?.dataset["cursor"] ?? "EXPLORE";
      cursor.classList.toggle("is-visible", target !== null);
      cursor.classList.toggle("is-active", target !== null);
    };

    const hideCursor = () => cursor.classList.remove("is-visible");
    document.addEventListener("mousemove", updateCursor);
    document.addEventListener("mouseleave", hideCursor);

    return () => {
      query.removeEventListener("change", syncCursor);
      document.body.classList.remove("has-studio-cursor");
      document.removeEventListener("mousemove", updateCursor);
      document.removeEventListener("mouseleave", hideCursor);
    };
  }, []);

  return (
    <div ref={cursorRef} className="studio-cursor" aria-hidden="true">
      <span ref={labelRef}>EXPLORE</span>
    </div>
  );
}

function TextLink({
  href,
  children,
  light = false,
  cursor = "OPEN",
}: {
  href: string;
  children: ReactNode;
  light?: boolean;
  cursor?: string;
}) {
  return (
    <a
      href={href}
      data-cursor={cursor}
      className={`editorial-link group ${light ? "text-studio-ivory" : "text-studio-ink"}`}
    >
      <span>{children}</span>
      <ArrowUpRight
        className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </a>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);
  const links = [
    ["Sobre mí", "#estudio"],
    ["Servicios", "#servicios"],
    ["Proyectos", "#proyectos"],
    ["Contacto", "#contacto"],
  ];

  return (
    <header className="absolute inset-x-0 top-0 z-50 text-studio-ivory">
      <div className="mx-auto grid max-w-[1600px] grid-cols-[minmax(0,1fr)_auto] items-center px-5 py-6 sm:px-8 lg:px-12">
        <a
          href="#inicio"
          data-cursor="HOME"
          className="min-w-0 text-[11px] font-semibold uppercase leading-tight tracking-[0.16em] sm:text-xs"
        >
          Lucas Domínguez
          <br />
          Studio
        </a>
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Navegación principal">
          {links.map(([label, href]) => (
            <a
              key={href}
              href={href}
              data-cursor="EXPLORE"
              className="nav-link text-[11px] uppercase tracking-[0.14em]"
            >
              {label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          ref={menuButton}
          aria-controls="mobile-navigation"
          onClick={() => setOpen(!open)}
          data-cursor={open ? "CLOSE" : "OPEN"}
          className="grid h-12 w-12 place-items-center rounded-full border border-studio-ivory/15 lg:hidden"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          className="mobile-menu absolute inset-x-0 top-full border-t border-studio-ivory/15 bg-studio-black px-5 pb-8 pt-4 lg:hidden"
          aria-label="Navegación móvil"
        >
          {links.map(([label, href]) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex min-h-16 items-center justify-between border-b border-studio-ivory/15 py-4 font-serif text-3xl"
            >
              {label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}

function LogoSignature() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      const element = ref.current;
      const hero = document.getElementById("inicio");
      if (!element || !hero) return;
      const stage = hero.querySelector<HTMLElement>(".hero-stage");
      if (!stage) return;
      const animationDisabled = media.matches || window.matchMedia("(max-height: 600px)").matches;
      const progress = animationDisabled
        ? 0
        : Math.min(
            1,
            Math.max(
              0,
              -hero.getBoundingClientRect().top /
                Math.max(1, hero.offsetHeight - stage.offsetHeight),
            ),
          );
      stage.style.setProperty("--hero-copy-opacity", `${Math.max(0, 1 - progress / 0.4)}`);
      stage.style.setProperty("--hero-fade", `${1 - Math.max(0, (progress - 0.5) / 0.5)}`);
      stage.inert = progress > 0.95;
      stage.style.pointerEvents = progress >= 0.4 ? "none" : "auto";
      const copy = stage.querySelector<HTMLElement>(".brand-hero-copy");
      if (copy) copy.inert = progress >= 0.4;
      const header = stage.querySelector<HTMLElement>("header");
      if (header) header.inert = progress >= 0.4;
      element.style.setProperty("--logo-zoom", `${1 + progress * 2.6}`);
      element.style.setProperty("--logo-forward", `${progress * 200}px`);
      element.style.setProperty("--logo-turn", `${progress * -10}deg`);
      element.style.setProperty("--logo-reveal", "0%");
      element.style.setProperty("--logo-guides", "0");
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    media.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      media.removeEventListener("change", schedule);
    };
  }, []);
  return (
    <div ref={ref} className="logo-signature" aria-hidden="true">
      <div className="logo-motion">
        <div className="logo-construction-grid" />
        <img
          className="logo-draft"
          src={studioLogo}
          width={888}
          height={1142}
          alt=""
          fetchPriority="high"
        />
        <img className="logo-developed" src={studioLogo} width={888} height={1142} alt="" />
        <span className="logo-scan-line" />
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section id="inicio" className="hero-scroll-scene">
      <div className="hero-stage hero brand-hero cinema-surface">
        <LogoSignature />
        <Header />
        <div className="brand-hero-grid">
          <div className="brand-hero-copy">
            <p className="hero-kicker">Diseñador gráfico · Málaga, España</p>
            <h1 className="brand-headline">
              Diseño marcas <em>con carácter.</em>
            </h1>
            <p className="brand-intro">
              Diseño tu logo, tu identidad visual y las piezas que necesitas para presentar tu
              negocio.
            </p>
            <div className="brand-actions">
              <a href="#proyectos" className="glass-button glass-button-primary">
                Ver mis trabajos <ArrowUpRight aria-hidden="true" />
              </a>
              <a href="#contacto" className="glass-button">
                Cuéntame tu proyecto <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
        <div className="hero-disciplines" aria-label="Áreas del estudio">
          <span>Branding & estrategia</span>
          <span>Campañas & contenido</span>
          <span>Diseño web & UX/UI</span>
        </div>
      </div>
    </section>
  );
}

const dockSections = [
  ["inicio", "Inicio"],
  ["proyectos", "Proyectos"],
  ["servicios", "Servicios"],
  ["contacto", "Hablemos"],
] as const;

function StudioDock() {
  const [active, setActive] = useState("inicio");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-15% 0px -65% 0px" },
    );
    dockSections.forEach(([id]) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);
  return (
    <nav className="studio-dock" aria-label="Accesos rápidos">
      {dockSections.map(([id, label]) => (
        <a
          key={id}
          href={`#${id}`}
          onClick={(event) => {
            const section = document.getElementById(id);
            if (!section) return;
            event.preventDefault();
            window.history.replaceState(window.history.state, "", `#${id}`);
            const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            window.scrollTo({
              top: id === "inicio" ? 0 : window.scrollY + section.getBoundingClientRect().top,
              behavior: reduceMotion ? "instant" : "smooth",
            });
          }}
          aria-current={active === id ? "location" : undefined}
          className={active === id ? "is-current" : ""}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}

function Studio() {
  return (
    <section
      id="estudio"
      className="studio-section studio-section-light cinema-surface relative bg-studio-ivory px-5 pb-28 pt-24 text-studio-ink sm:px-8 sm:pb-36 lg:px-12 lg:pb-48 lg:pt-40"
    >
      <div className="section-veil section-veil-light" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1500px]">
        <Reveal>
          <p className="section-label">Sobre mí</p>
        </Reveal>
        <div className="about-composition" data-motion>
          <Reveal className="about-heading">
            <h2 className="about-title">
              Soy Lucas.
              <br />
              <em>Diseño con carácter.</em>
            </h2>
          </Reveal>
          <Reveal className="studio-portrait about-photo" delay={100}>
            <div className="portrait-motion-mark">
              <MotionGraphic variant="star" />
            </div>
            <figure className="portrait-frame">
              <img
                src={lucasPortrait}
                alt="Lucas Domínguez sentado en su estudio"
                width={594}
                height={1126}
                loading="lazy"
              />
            </figure>
          </Reveal>
          <Reveal className="about-copy" delay={160}>
            <p className="about-intro">
              Tu marca tiene una historia. Mi trabajo es darle una imagen propia.
            </p>
            <p>
              Soy Lucas Domínguez, diseñador gráfico en Málaga. En mi estudio diseño identidades de
              marca y las piezas que les dan vida.
            </p>
            <p>
              Trabajo contigo de principio a fin: escucho tu idea, defino su dirección y cuido cada
              detalle.
            </p>
            <a className="about-link" href="#contacto">
              Hablemos de tu marca <ArrowUpRight size={20} aria-hidden="true" />
            </a>
          </Reveal>
        </div>
      </div>
      <div className="section-transition section-transition-to-black" aria-hidden="true" />
    </section>
  );
}

function Services() {
  return (
    <section
      id="servicios"
      aria-labelledby="services-title"
      className="services-section cinema-surface relative overflow-hidden bg-studio-cream px-5 py-20 text-studio-ink sm:px-8 lg:px-12 lg:py-28"
    >
      <div className="services-glow" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1500px]">
        <Reveal>
          <p className="section-label">Servicios</p>
          <h2 id="services-title" className="section-title mt-8">
            ¿Qué necesita
            <br />
            <em>tu marca?</em>
          </h2>
          <p className="service-guide-intro">
            Crea tu marca, renueva su imagen o dale presencia. Elige tu punto de partida.
          </p>
        </Reveal>
        <div className="service-guide-grid">
          {services.map((service) => (
            <article
              key={service.number}
              className="service-guide-card"
              data-motion
              aria-labelledby={`service-${service.number}`}
            >
              <div className="service-motion-mark">
                <MotionGraphic variant={Number(service.number) % 2 ? "tiles" : "orbit"} />
              </div>
              <p className="service-guide-category">
                <span>{service.number}</span>
                {service.category}
              </p>
              <h3 id={`service-${service.number}`}>{service.name}</h3>
              <p className="service-guide-need">
                <strong>Es para ti si…</strong> {service.need}
              </p>
              <details className="service-details">
                <summary>Qué incluye este servicio</summary>
                <p className="service-guide-explanation">{service.explanation}</p>
                <h4>Qué puedo diseñar para ti</h4>
                <ul>
                  {service.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="service-guide-result">
                  <h4>Para qué te sirve</h4>
                  <p>{service.result}</p>
                </div>
              </details>
              <a
                href="#contacto"
                className="service-guide-link"
                aria-label={`Consultar: ${service.name}`}
              >
                Quiero hablar de esto <ArrowUpRight aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
        <section className="creative-plans" aria-labelledby="creative-plans-title">
          <div className="creative-plans-heading">
            <p className="section-label">Si tu marca necesita continuidad</p>
            <h3 id="creative-plans-title">
              Dirección creativa
              <br />
              <em>mes a mes.</em>
            </h3>
            <p>
              Tú eliges las prioridades. Yo diseño las piezas que necesita tu marca: materiales
              comerciales, campañas, presentaciones o contenido para tus canales.
            </p>
          </div>
          <div className="creative-plans-grid">
            {creativePlans.map((plan) => (
              <article
                className={`creative-plan${plan.featured ? " creative-plan-featured" : ""}`}
                key={plan.name}
                aria-label={`Plan ${plan.name}`}
              >
                {plan.featured && <p className="creative-plan-badge">Recomendado</p>}
                <h4>{plan.name}</h4>
                <p className="creative-plan-description">{plan.description}</p>
                <p className="creative-plan-price">
                  {plan.price} <span>/ mes</span>
                </p>
                <p className="creative-plan-units">{plan.units}</p>
                <p className="creative-plan-value">{plan.valueNote}</p>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <a
                  className="creative-plan-cta"
                  href={`/?plan=${encodeURIComponent(plan.name)}#contacto`}
                >
                  {plan.cta} <ArrowUpRight aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
          <details className="creative-plans-details">
            <summary>¿Qué cuenta como una unidad de diseño?</summary>
            <ul>
              {designUnitExamples.map((example) => (
                <li key={example}>{example}</li>
              ))}
            </ul>
          </details>
          <p className="creative-plans-notes">
            Planes mes a mes · Precios sin IVA · Alta inicial: 290 € cuando sea necesaria; no se
            aplica si ya hemos creado tu identidad. Las piezas se acuerdan al comenzar cada mes.
            <br />
            Incluye diseño y entrega; tú publicas y gestionas tus cuentas. Foto, vídeo, desarrollo
            web y gestión de redes se presupuestan aparte.
          </p>
        </section>
        <div className="service-guide-help">
          <div>
            <h3>¿No sabes por dónde empezar?</h3>
            <p>Cuéntame tu idea. Te ayudo a elegir el servicio que necesitas.</p>
            <p className="service-guide-scope">
              Cada proyecto se define contigo: acordamos las piezas, los plazos y el presupuesto
              antes de empezar.
            </p>
          </div>
          <a href="#contacto" className="service-guide-link">
            Cuéntame tu idea <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </div>
      <div className="section-transition section-transition-to-deep" aria-hidden="true" />
    </section>
  );
}

function ProjectExperience({ project }: { project: (typeof projects)[number] }) {
  const sourceRef = useRef<HTMLButtonElement>(null);
  const contactRequested = useRef(false);
  const [open, setOpen] = useState(false);
  const setPanelRef = useCallback((panel: HTMLDivElement | null) => {
    if (!panel || !sourceRef.current) return;
    const source = sourceRef.current.getBoundingClientRect();
    // The panel is centered; use its layout size before its entry transform.
    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    panel.style.setProperty(
      "--launch-x",
      `${source.left + source.width / 2 - window.innerWidth / 2}px`,
    );
    panel.style.setProperty(
      "--launch-y",
      `${source.top + source.height / 2 - window.innerHeight / 2}px`,
    );
    panel.style.setProperty("--launch-scale-x", `${source.width / width}`);
    panel.style.setProperty("--launch-scale-y", `${source.height / height}`);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          ref={sourceRef}
          type="button"
          aria-label={`Ver proyecto ${project.name}`}
          className={`project-media relative block w-full overflow-hidden bg-studio-deep text-left ${"caseStudy" in project ? "project-media-brand" : ""}`}
          data-cursor="VIEW PROJECT"
        >
          <img
            src={project.image}
            alt={
              "caseStudy" in project
                ? "BUBA · Logotipo blanco sobre tejido negro"
                : `Visual editorial temporal de ${project.name}`
            }
            width={project.width}
            height={project.height}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay className="project-glass-overlay" />
        <DialogContent
          ref={setPanelRef}
          onCloseAutoFocus={(event) => {
            if (!contactRequested.current) return;
            event.preventDefault();
            contactRequested.current = false;
            requestAnimationFrame(() => {
              const contact = document.getElementById("contacto");
              contact?.focus({ preventScroll: true });
              contact?.scrollIntoView({ behavior: "auto", block: "start" });
            });
          }}
          className={`project-app ${"caseStudy" in project ? "project-app-case" : ""}`}
          aria-describedby={`project-description-${project.name.replaceAll(" ", "-")}`}
        >
          <div className="project-app-bar">
            <span>LD / Proyectos</span>
            <DialogClose className="project-app-close" aria-label="Cerrar proyecto">
              <X aria-hidden="true" />
            </DialogClose>
          </div>
          <div className="project-app-scroll">
            <div className="project-app-cover">
              <img
                src={project.image}
                alt={
                  "caseStudy" in project
                    ? "BUBA · Logotipo blanco sobre tejido negro"
                    : `Visual editorial temporal de ${project.name}`
                }
                width={project.width}
                height={project.height}
              />
              <div>
                <p>{project.type}</p>
                <DialogTitle>{project.name}</DialogTitle>
              </div>
            </div>
            <div className="project-app-story">
              <span className="section-label">El universo de marca</span>
              <DialogDescription id={`project-description-${project.name.replaceAll(" ", "-")}`}>
                {project.statement}
              </DialogDescription>
              {"caseStudy" in project ? (
                <p className="project-case-intro">{project.caseStudy.intro}</p>
              ) : (
                <p className="project-material-note">
                  Exploración visual con imágenes temporales. Las piezas y el caso de proyecto
                  definitivos se incorporarán próximamente.
                </p>
              )}
              <div className="project-touchpoints">
                {project.focus.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
              {"caseStudy" in project && (
                <div className="project-case-study">
                  <div className="project-case-logo">
                    <img
                      src={project.caseStudy.logo}
                      width={767}
                      height={137}
                      alt="Logotipo oficial BUBA"
                      loading="lazy"
                    />
                  </div>
                  {project.caseStudy.chapters.map((chapter, index) => (
                    <section
                      key={chapter.title}
                      className={`project-case-chapter ${"surface" in chapter && chapter.surface === "light" ? "is-light" : ""}`}
                    >
                      <h3>{chapter.title}</h3>
                      <p>{chapter.text}</p>
                      <div
                        className={
                          index === 2 ? "project-case-gallery is-social" : "project-case-gallery"
                        }
                      >
                        {chapter.images.map((asset) => (
                          <figure key={asset.src}>
                            <a
                              href={asset.src}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`Ampliar: ${asset.caption} (abre en otra pestaña)`}
                            >
                              <img
                                src={asset.src}
                                width={asset.width}
                                height={asset.height}
                                alt={asset.caption}
                                loading="lazy"
                              />
                            </a>
                            <figcaption>
                              {asset.caption} <span>↗ Ampliar</span>
                            </figcaption>
                          </figure>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
              <DialogClose asChild>
                <a
                  className="glass-button project-contact"
                  href="#contacto"
                  onClick={() => {
                    contactRequested.current = true;
                  }}
                >
                  Hablemos de tu marca <ArrowUpRight aria-hidden="true" />
                </a>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

function Work() {
  return (
    <section
      id="proyectos"
      className="work-section cinema-surface relative overflow-hidden bg-studio-ivory px-5 py-16 text-studio-ink sm:px-8 lg:px-12 lg:py-24"
    >
      <div className="relative mx-auto max-w-[1500px]">
        <Reveal>
          <div className="motion-section-heading" data-motion>
            <h2 className="section-title">Proyectos</h2>
            <MotionGraphic variant="star" />
          </div>
        </Reveal>
        <div className="portfolio-grid">
          {projects.map((project, index) => (
            <Reveal key={project.name} className="project-reveal" delay={index % 2 === 0 ? 0 : 80}>
              <article className="project-card project-card-uniform">
                <ProjectExperience project={project} />
                <div className="project-card-caption">
                  <div>
                    <h3>{project.name}</h3>
                    <p>{project.category}</p>
                  </div>
                  <ArrowUpRight aria-hidden="true" />
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
    <section className="process-section cinema-surface relative overflow-hidden bg-studio-black px-5 py-28 text-studio-ivory sm:px-8 lg:px-12 lg:py-44">
      <div className="process-ambient" aria-hidden="true" />
      <div className="process-motion-mark" data-motion>
        <MotionGraphic variant="tiles" />
      </div>
      <div className="relative mx-auto max-w-[1500px]">
        <Reveal>
          <p className="section-label text-studio-ivory/55">Proceso</p>
          <h2 className="section-title mt-10">
            De la intención
            <br />
            <em>a la presencia.</em>
          </h2>
        </Reveal>
        <div className="process-track relative mt-20 lg:mt-28">
          <div className="process-line-base absolute bottom-0 left-[7px] top-0 w-px bg-studio-ivory/20 lg:bottom-auto lg:right-0 lg:top-[7px] lg:h-px lg:w-auto" />
          <div className="process-line absolute left-[7px] top-0 w-px bg-studio-gold lg:right-0 lg:top-[7px] lg:h-px lg:w-auto" />
          <ol className="grid gap-12 lg:grid-cols-5 lg:gap-5">
            {process.map(([step, description], index) => (
              <li key={step} className="process-step relative pl-10 lg:pl-0 lg:pt-10">
                <span className="absolute left-0 top-0 z-10 h-[15px] w-[15px] rounded-full border border-studio-gold bg-studio-black lg:left-0" />
                <span className="text-[10px] tracking-[0.16em] text-studio-gold">0{index + 1}</span>
                <p className="mt-3 font-serif text-3xl uppercase sm:text-4xl">{step}</p>
                <p className="mt-3 max-w-[15rem] text-sm leading-relaxed text-studio-ivory/58">
                  {description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="section-transition section-transition-to-gold" aria-hidden="true" />
    </section>
  );
}

function ProjectQualifier() {
  const [goal, setGoal] = useState("");
  const [business, setBusiness] = useState("");
  const [brief, setBrief] = useState("");
  useEffect(() => {
    const plan = new URLSearchParams(window.location.search).get("plan");
    if (plan && creativePlans.some((item) => item.name === plan)) {
      setGoal(`Acompañamiento mensual · ${plan}`);
      setBrief(
        `Me interesa el plan ${plan}. Me gustaría hablar sobre las necesidades de diseño de mi marca.`,
      );
    }
  }, []);
  const details = [
    goal && `Objetivo: ${goal}`,
    business && `Negocio: ${business}`,
    brief && `Idea: ${brief}`,
  ]
    .filter(Boolean)
    .join("\n");
  const mailHref = `mailto:lucase.dominguezguridi@gmail.com?subject=${encodeURIComponent("Hablemos de mi proyecto")}&body=${encodeURIComponent(details || "Hola Lucas, me gustaría hablar de un proyecto.")}`;
  const goals = [
    "Crear una marca",
    "Renovar mi identidad",
    "Mejorar mi presencia",
    "Diseñar una campaña",
    "Crear una web",
    "No estoy seguro",
  ];

  return (
    <section
      id="contacto"
      tabIndex={-1}
      className="qualifier-section cinema-surface relative overflow-hidden bg-studio-gold px-5 py-28 text-studio-black sm:px-8 lg:px-12 lg:py-40"
    >
      <div className="qualifier-shape" aria-hidden="true" />
      <div className="contact-motion-mark" data-motion>
        <MotionGraphic variant="orbit" />
      </div>
      <div className="relative mx-auto grid max-w-[1500px] gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(400px,0.7fr)] lg:gap-20">
        <Reveal>
          <p className="section-label border-studio-black/30">Hablemos</p>
          <h2 className="cta-title mt-10 uppercase">
            Toda marca
            <br />
            comienza
            <br />
            <em>con una idea.</em>
          </h2>
          <p className="mt-10 max-w-md font-serif text-2xl leading-tight sm:text-3xl">
            Cuéntame qué quieres transformar. Me encantará conocer tu proyecto.
          </p>
        </Reveal>
        <Reveal delay={100}>
          <div className="contact-channels">
            <a
              className="contact-whatsapp"
              href={`https://wa.me/34622688942?text=${encodeURIComponent(details || "Hola Lucas, me gustaría hablar de un proyecto.")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Escribir por WhatsApp <ArrowUpRight aria-hidden="true" />
            </a>
            <a
              href="https://www.instagram.com/lucasdominguez.studio/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram · @lucasdominguez.studio <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
          <form
            className="qualifier-form"
            action="https://formsubmit.co/lucase.dominguezguridi@gmail.com"
            method="POST"
          >
            <input type="hidden" name="_subject" value="Nuevo proyecto · Lucas Domínguez Studio" />
            <input type="hidden" name="Objetivo" value={goal} />
            <label className="qualifier-field">
              <span>Tu nombre</span>
              <input
                name="name"
                autoComplete="name"
                required
                maxLength={120}
                placeholder="¿Cómo te llamas?"
              />
            </label>
            <label className="qualifier-field">
              <span>Tu correo</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                placeholder="Para poder responderte"
              />
            </label>
            <label className="qualifier-field">
              <span>Cuéntame brevemente qué tienes en mente.</span>
              <textarea
                name="message"
                required
                maxLength={5000}
                value={brief}
                onChange={(event) => setBrief(event.target.value)}
                placeholder="El punto de partida, el momento en el que está tu marca o lo que te gustaría cambiar."
                rows={4}
              />
            </label>
            <details className="contact-optional">
              <summary>Añadir detalles del negocio (opcional)</summary>
              <fieldset>
                <legend>¿Qué quieres conseguir?</legend>
                <div className="qualifier-options">
                  {goals.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setGoal(option)}
                      className={goal === option ? "is-selected" : ""}
                      aria-pressed={goal === option}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="qualifier-field">
                <span>¿Qué tipo de negocio tienes?</span>
                <input
                  name="Negocio"
                  maxLength={200}
                  value={business}
                  onChange={(event) => setBusiness(event.target.value)}
                  placeholder="Por ejemplo: hotel, marca de moda, startup…"
                />
              </label>
            </details>
            <button type="submit" className="qualifier-submit">
              Enviar mensaje <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
            </button>
            <p className="text-xs leading-relaxed">
              El mensaje se envía a mi correo mediante FormSubmit. También puedes escribirme
              directamente a{" "}
              <a className="underline underline-offset-4 break-all" href={mailHref}>
                lucase.dominguezguridi@gmail.com
              </a>
              .
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

function Footer({ onReplay }: { onReplay: () => void }) {
  return (
    <footer className="bg-studio-black px-5 py-10 text-studio-ivory sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-[1500px] gap-10 border-t border-studio-ivory/20 pt-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="font-serif text-2xl uppercase">Lucas Domínguez Studio</p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-studio-ivory/50">
            Málaga, España
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-[10px] uppercase tracking-[0.14em] text-studio-ivory/65 md:justify-end">
          <span>Branding</span>
          <span>Identidad visual</span>
          <span>Dirección creativa</span>
          <span>Digital</span>
        </div>
        <p className="text-[10px] text-studio-ivory/35 md:col-span-2">
          © {new Date().getFullYear()} — Todos los derechos reservados.
        </p>
        <GraphicMotionControl />
        <button className="graphics-toggle" type="button" onClick={onReplay}>
          Volver a ver la intro
        </button>
      </div>
    </footer>
  );
}

function MotionGraphic({ variant = "orbit" }: { variant?: "orbit" | "tiles" | "star" }) {
  return (
    <svg
      className={`motion-art motion-art-${variant}`}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
    >
      {variant === "orbit" ? (
        <g className="motion-orbits">
          {[0, 45, 90, 135].map((angle) => (
            <ellipse
              key={angle}
              cx="100"
              cy="100"
              rx="82"
              ry="32"
              transform={`rotate(${angle} 100 100)`}
            />
          ))}
          <circle cx="100" cy="100" r="9" fill="currentColor" stroke="none" />
        </g>
      ) : variant === "tiles" ? (
        <g className="motion-tiles">
          {[0, 1, 2, 3].map((tile) => (
            <rect
              key={tile}
              className={`motion-tile motion-tile-${tile}`}
              x={25 + (tile % 2) * 80}
              y={25 + Math.floor(tile / 2) * 80}
              width="70"
              height="70"
              rx="12"
            />
          ))}
        </g>
      ) : (
        <g className="motion-star">
          {Array.from({ length: 12 }, (_, ray) => (
            <path
              key={ray}
              d="M100 22 L107 77 L100 92 L93 77 Z"
              fill="currentColor"
              stroke="none"
              transform={`rotate(${ray * 30} 100 100)`}
            />
          ))}
        </g>
      )}
    </svg>
  );
}

function MotionShowcase() {
  return (
    <section className="motion-showcase" data-motion aria-labelledby="motion-title">
      <div className="motion-showcase-type">
        <h2 id="motion-title">
          Identidades
          <br />
          <em>en movimiento.</em>
        </h2>
        <p>Motion graphics para dar vida a tu marca.</p>
      </div>
      <div className="motion-showcase-art">
        <MotionGraphic />
      </div>
    </section>
  );
}

function GraphicMotionControl() {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const root = document.querySelector(".studio-page");
    if (!root) return;
    root.setAttribute("data-graphics-paused", String(paused));
    return () => root.removeAttribute("data-graphics-paused");
  }, [paused]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) =>
          entry.target.setAttribute("data-motion-visible", String(entry.isIntersecting)),
        );
      },
      { rootMargin: "60px" },
    );
    document.querySelectorAll("[data-motion]").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  return (
    <button
      className="graphics-toggle"
      type="button"
      aria-pressed={paused}
      onClick={() => setPaused(!paused)}
    >
      {paused ? "Activar gráficos animados" : "Pausar gráficos animados"}
    </button>
  );
}

function BrandIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"playing" | "landing" | "leaving">("playing");
  const [reduced, setReduced] = useState(false);
  const filmRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const [landing, setLanding] = useState({ x: 0, y: 0, scale: 1 });

  const dismiss = useCallback(() => {
    setPhase((current) => (current === "playing" ? "landing" : current));
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    skipRef.current?.focus({ preventScroll: true });
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);
    if (!media.matches) void videoRef.current?.play().catch(dismiss);
    const timer = window.setTimeout(dismiss, media.matches ? 1400 : 12000);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    const onMotion = () => {
      setReduced(media.matches);
      if (media.matches) dismiss();
    };
    media.addEventListener("change", onMotion);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
      media.removeEventListener("change", onMotion);
    };
  }, [dismiss]);

  useEffect(() => {
    if (phase !== "landing") return;
    videoRef.current?.pause();
    const source = filmRef.current?.getBoundingClientRect();
    const target = document.querySelector<HTMLImageElement>(".hero-stage .logo-developed");
    const bounds = target?.getBoundingClientRect();
    // Fit the original monogram inside its object-contain box, rather than matching the box itself.
    if (!reduced && source && bounds && bounds.top >= 0 && bounds.bottom <= window.innerHeight) {
      const ratio = 1106 / 1422;
      const width = Math.min(bounds.width, bounds.height * ratio);
      setLanding({
        x: bounds.left + bounds.width / 2 - (source.left + source.width / 2),
        y: bounds.top + bounds.height / 2 - (source.top + source.height / 2),
        scale: width / source.width,
      });
    }
    const timer = window.setTimeout(() => setPhase("leaving"), reduced ? 100 : 1150);
    return () => window.clearTimeout(timer);
  }, [phase, reduced]);

  useEffect(() => {
    if (phase !== "leaving") return;
    const timer = window.setTimeout(onComplete, reduced ? 150 : 650);
    return () => window.clearTimeout(timer);
  }, [phase, reduced, onComplete]);

  return (
    <div
      className={`cinematic-intro liquid-intro is-${phase} ${reduced ? "is-reduced" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-title"
    >
      <div
        ref={filmRef}
        className="ld-film-stage"
        style={{
          transform: `translate(-50%, -50%) translate3d(${landing.x}px, ${landing.y}px, 0) scale(${landing.scale})`,
        }}
        aria-hidden="true"
      >
        {!reduced && (
          <video
            ref={videoRef}
            className="ld-liquid-film"
            src="/media/ld-liquid.mp4"
            muted
            playsInline
            preload="auto"
            onEnded={dismiss}
            onError={dismiss}
          />
        )}
        <img className="ld-film-lockup" src={studioLogo} alt="" width="1106" height="1422" />
      </div>
      <h1 id="intro-title" className="ld-film-title">
        Diseño de marcas
        <br />
        <em>con carácter.</em>
      </h1>
      <button ref={skipRef} className="intro-enter" onClick={dismiss} type="button">
        Entrar al estudio <ArrowUpRight size={18} aria-hidden="true" />
      </button>
    </div>
  );
}

function StudioPage() {
  const [introOpen, setIntroOpen] = useState(false);
  useEffect(() => {
    try {
      if (!sessionStorage.getItem("ld-liquid-intro-v1")) setIntroOpen(true);
    } catch {
      setIntroOpen(true);
    }
  }, []);
  const finishIntro = useCallback(() => {
    try {
      sessionStorage.setItem("ld-liquid-intro-v1", "true");
    } catch {
      /* Storage may be unavailable in private browsing. */
    }
    setIntroOpen(false);
    requestAnimationFrame(() =>
      document.querySelector<HTMLElement>(".studio-page")?.focus({ preventScroll: true }),
    );
  }, []);
  return (
    <>
      {introOpen && <BrandIntro onComplete={finishIntro} />}
      <main className="studio-page" inert={introOpen} tabIndex={-1}>
        <CinematicCursor />
        <Hero />
        <Work />
        <MotionShowcase />
        <Services />
        <Studio />
        <Process />
        <ProjectQualifier />
        <Footer
          onReplay={() => {
            window.scrollTo({ top: 0, behavior: "instant" });
            setIntroOpen(true);
          }}
        />
        <StudioDock />
      </main>
    </>
  );
}
