import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Download,
  LoaderCircle,
  MessageCircle,
  PenLine,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";

import {
  ACUERDO_PRIVACY,
  ACUERDO_SITE,
  TERMS,
  TERMS_DATE,
  TERMS_PDF,
  TERMS_VERSION,
  type TermsBlock,
  type TermsItem,
} from "@/lib/acuerdo";
import { BrandLogo, BrandSymbol } from "@/components/brand";
import { sendAcuerdo } from "@/lib/acuerdo-send";
import { LEGAL_OWNER as O } from "@/lib/legal";

type Search = { ref?: string | undefined };

export const Route = createFileRoute("/acuerdo")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    ref:
      typeof search["ref"] === "string" && search["ref"].trim()
        ? search["ref"].trim().slice(0, 60)
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Condiciones de trabajo · Lucas Domínguez Studio" },
      {
        name: "description",
        content:
          "Lee las condiciones, completa tus datos y acepta. Recibes una copia en tu correo.",
      },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { name: "googlebot", content: "noindex, nofollow, noarchive" },
      { name: "theme-color", content: "#F8F5EF" },
      { property: "og:title", content: "Condiciones de trabajo · Lucas Domínguez Studio" },
      { property: "og:description", content: "Léelas, acéptalas y recibe una copia en tu correo." },
      { property: "og:image", content: `${ACUERDO_SITE}/og-image.jpg` },
    ],
  }),
  component: Acuerdo,
});

/* ------------------------------------------------------------------ data */

const STEPS = [
  { title: "Lee", sub: "Las condiciones" },
  { title: "Tus datos", sub: "Para la factura y tu copia" },
  { title: "Firma", sub: "Revisa, firma y acepta" },
] as const;

type FieldName = "nombre" | "negocio" | "nif" | "domicilio" | "email" | "telefono" | "presupuesto";
type Data = Record<FieldName, string>;
type Checks = { condiciones: boolean; privacidad: boolean; novedades: boolean };

const FIELDS: {
  name: FieldName;
  label: string;
  hint?: string;
  required?: boolean;
  wide?: boolean;
  type?: string;
  autoComplete?: string;
  inputMode?: "email" | "tel" | "text";
}[] = [
  { name: "nombre", label: "Nombre y apellidos", required: true, wide: true, autoComplete: "name" },
  {
    name: "negocio",
    label: "Negocio o razón social",
    required: true,
    autoComplete: "organization",
  },
  { name: "nif", label: "NIF, NIE o CIF", required: true, hint: "Ejemplo: 12345678Z o B12345678" },
  {
    name: "email",
    label: "Correo",
    required: true,
    type: "email",
    autoComplete: "email",
    inputMode: "email",
    hint: "Aquí te llega tu copia",
  },
  {
    name: "telefono",
    label: "Teléfono",
    type: "tel",
    autoComplete: "tel",
    inputMode: "tel",
    hint: "Opcional",
  },
  {
    name: "domicilio",
    label: "Domicilio fiscal",
    wide: true,
    autoComplete: "street-address",
    hint: "Opcional · para la factura",
  },
  {
    name: "presupuesto",
    label: "Referencia del presupuesto",
    required: true,
    wide: true,
    hint: "La que aparece en tu presupuesto",
  },
];

const DNI_LETTERS = "TRWAGMYFPDXBNJZSQVHLCKE";
function validTaxId(raw: string) {
  const v = raw.toUpperCase().replace(/[\s.-]/g, "");
  if (/^\d{8}[A-Z]$/.test(v)) return DNI_LETTERS[Number(v.slice(0, 8)) % 23] === v[8];
  if (/^[XYZ]\d{7}[A-Z]$/.test(v)) {
    const n = Number(String("XYZ".indexOf(v.charAt(0))) + v.slice(1, 8));
    return DNI_LETTERS[n % 23] === v[8];
  }
  return /^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/.test(v);
}

function fieldError(name: FieldName, value: string) {
  const v = value.trim();
  const field = FIELDS.find((f) => f.name === name);
  if (field?.required && !v) return "Este dato es necesario.";
  if (name === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v))
    return "Revisa el correo: falta algo.";
  if (name === "nif" && v && !validTaxId(v)) return "Este NIF, NIE o CIF no parece correcto.";
  if (name === "telefono" && v && v.replace(/\D/g, "").length < 9) return "Revisa el teléfono.";
  return "";
}

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim().toLowerCase();

const pad = (n: number) => String(n).padStart(2, "0");

/* --------------------------------------------------------------- helpers */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

function Items({ items }: { items: TermsItem[] }) {
  return (
    <ul className="ac-list">
      {items.map((item) => (
        <li key={item.text}>
          {item.lead ? <strong>{item.lead} </strong> : null}
          {item.text}
        </li>
      ))}
    </ul>
  );
}

function Block({ block }: { block: TermsBlock }) {
  return typeof block === "string" ? <p>{block}</p> : <Items items={block} />;
}

/* ------------------------------------------------------------------ page */

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "error" }
  | { kind: "sent"; name: string; email: string; when: string };

function Acuerdo() {
  const { ref } = Route.useSearch();
  const reduced = usePrefersReducedMotion();
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [read, setRead] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(TERMS[0]?.id ?? null);
  const [data, setData] = useState<Data>({
    nombre: "",
    negocio: "",
    nif: "",
    domicilio: "",
    email: "",
    telefono: "",
    presupuesto: ref ?? "",
  });
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [checks, setChecks] = useState<Checks>({
    condiciones: false,
    privacidad: false,
    novedades: false,
  });
  const [firma, setFirma] = useState("");
  const [tried, setTried] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const top = useRef<HTMLDivElement>(null);
  const honey = useRef<HTMLInputElement>(null);

  const errors = useMemo(
    () =>
      Object.fromEntries(FIELDS.map((f) => [f.name, fieldError(f.name, data[f.name])])) as Record<
        FieldName,
        string
      >,
    [data],
  );
  const dataValid = FIELDS.every((f) => !errors[f.name]);
  const firmaOk = firma.trim().length > 0 && normalize(firma) === normalize(data.nombre);
  const today = useMemo(
    () =>
      new Intl.DateTimeFormat("es-ES", { dateStyle: "long", timeZone: "Europe/Madrid" }).format(
        new Date(),
      ),
    [],
  );

  const scrollToTop = () => {
    const el = top.current;
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top: Math.max(0, y), behavior: reduced ? "auto" : "smooth" });
  };

  const goTo = (next: number) => {
    if (next === 2 && !dataValid) {
      setStep(1);
      setMaxStep((m) => Math.max(m, 1));
      setTouched(Object.fromEntries(FIELDS.map((f) => [f.name, true])));
      const first = FIELDS.find((f) => errors[f.name]);
      window.setTimeout(() => document.getElementById(`ac-${first?.name}`)?.focus(), 80);
      return;
    }
    setStep(next);
    setMaxStep((m) => Math.max(m, next));
    window.requestAnimationFrame(scrollToTop);
  };

  const markRead = (id: string) => {
    setRead((list) => (list.includes(id) ? list : [...list, id]));
    const index = TERMS.findIndex((t) => t.id === id);
    const next = TERMS[index + 1];
    setOpen(next ? next.id : null);
    if (next) {
      window.setTimeout(() => {
        document
          .getElementById(`ac-term-${next.id}`)
          ?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "nearest" });
      }, 420);
    }
  };

  async function submit() {
    setTried(true);
    if (!dataValid) return goTo(1);
    if (!checks.condiciones || !checks.privacidad || !firmaOk) {
      const target = !checks.condiciones
        ? "ac-check-condiciones"
        : !checks.privacidad
          ? "ac-check-privacidad"
          : "ac-firma";
      document.getElementById(target)?.focus();
      return;
    }
    setStatus({ kind: "sending" });
    try {
      // Never leave the visitor waiting on a spinner: give up after 25 seconds.
      const timeout = new Promise<never>((_, reject) =>
        window.setTimeout(() => reject(new Error("timeout")), 25000),
      );
      const result = await Promise.race([
        sendAcuerdo({
          data: {
            nombre: data.nombre.trim(),
            negocio: data.negocio.trim(),
            nif: data.nif.trim().toUpperCase(),
            domicilio: data.domicilio.trim(),
            email: data.email.trim(),
            telefono: data.telefono.trim(),
            presupuesto: data.presupuesto.trim(),
            firma: firma.trim(),
            novedades: checks.novedades,
            apartadosLeidos: read.length,
            pagina: window.location.href.slice(0, 500),
            website: honey.current?.value ?? "",
          },
        }),
        timeout,
      ]);
      if (!result.ok) throw new Error(result.reason);
      setStatus({
        kind: "sent",
        name: data.nombre.trim().split(" ")[0] ?? "",
        email: data.email.trim(),
        when: result.when,
      });
      window.requestAnimationFrame(() =>
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }),
      );
    } catch {
      setStatus({ kind: "error" });
    }
  }

  const progress =
    status.kind === "sent" ? 1 : (step + (step === 0 ? read.length / TERMS.length : 0.5)) / 3;

  return (
    <div className="ac-page">
      <header className="ac-top">
        <a href="/" className="ac-brand" aria-label="Lucas Domínguez Studio, ir a la web">
          <BrandLogo />
        </a>
        <p className="ac-top-step" aria-live="polite">
          {status.kind === "sent" ? (
            "Acuerdo firmado"
          ) : (
            <>
              <span>Paso {step + 1} de 3</span> · {STEPS[step]?.title}
            </>
          )}
        </p>
        <a href={TERMS_PDF} download className="ac-top-pdf">
          <Download aria-hidden="true" />
          <span>PDF</span>
        </a>
        <span
          className="ac-top-bar"
          style={{ transform: `scaleX(${progress})` }}
          aria-hidden="true"
        />
      </header>

      {status.kind === "sent" ? (
        <Done status={status} />
      ) : (
        <>
          <section className="ac-hero">
            <div className="ac-hero-copy">
              <p className="ac-eyebrow">
                Para clientes
                {data.presupuesto ? <> · Presupuesto {data.presupuesto}</> : null}
              </p>
              <h1 className="ac-h1">
                Antes de empezar, <em>lo dejamos claro.</em>
              </h1>
              <p className="ac-lead">
                Tres pasos y unos cinco minutos. Lees cómo trabajamos, completas tus datos y firmas.
                Al terminar te llega una copia a tu correo.
              </p>
            </div>
            <BrandSymbol className="ac-hero-orbit" />
          </section>

          <div className="ac-layout" ref={top}>
            <aside className="ac-rail" aria-label="Pasos">
              <ol className="ac-rail-steps">
                {STEPS.map((s, i) => {
                  const state =
                    i === step ? "current" : i < Math.max(step, maxStep) ? "done" : "todo";
                  const reachable = i <= maxStep || i === step + 1;
                  return (
                    <li key={s.title} data-state={state}>
                      <button
                        type="button"
                        onClick={() => goTo(i)}
                        disabled={!reachable || i === step}
                        aria-current={i === step ? "step" : undefined}
                      >
                        <span className="ac-rail-dot">
                          {state === "done" ? <Check aria-hidden="true" /> : i + 1}
                        </span>
                        <span className="ac-rail-text">
                          <strong>{s.title}</strong>
                          <small>
                            {i === 0 ? `${read.length} de ${TERMS.length} leídos` : s.sub}
                          </small>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
              <dl className="ac-rail-card">
                <div>
                  <dt>Documento</dt>
                  <dd>Condiciones generales</dd>
                </div>
                <div>
                  <dt>Versión</dt>
                  <dd>
                    {TERMS_VERSION} · {TERMS_DATE}
                  </dd>
                </div>
                {data.presupuesto ? (
                  <div>
                    <dt>Presupuesto</dt>
                    <dd>{data.presupuesto}</dd>
                  </div>
                ) : null}
              </dl>
              <a
                className="ac-help"
                href={`https://wa.me/34622688942?text=${encodeURIComponent("Hola Lucas, tengo una duda sobre las condiciones.")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle aria-hidden="true" />
                <span>
                  <strong>¿Alguna duda?</strong>
                  <small>Escríbeme por WhatsApp</small>
                </span>
              </a>
            </aside>

            <main className="ac-main">
              <div key={step} className="ac-step">
                {step === 0 ? (
                  <StepRead
                    read={read}
                    open={open}
                    setOpen={setOpen}
                    markRead={markRead}
                    onMarkAll={() => {
                      setRead(TERMS.map((t) => t.id));
                      setOpen(null);
                    }}
                  />
                ) : null}
                {step === 1 ? (
                  <StepData
                    data={data}
                    setData={setData}
                    errors={errors}
                    touched={touched}
                    setTouched={setTouched}
                    locked={Boolean(ref)}
                  />
                ) : null}
                {step === 2 ? (
                  <StepSign
                    data={data}
                    checks={checks}
                    setChecks={setChecks}
                    firma={firma}
                    setFirma={setFirma}
                    firmaOk={firmaOk}
                    tried={tried}
                    today={today}
                    onEdit={() => goTo(1)}
                    error={status.kind === "error"}
                  />
                ) : null}
              </div>

              <div className="ac-actions">
                {step > 0 ? (
                  <button
                    type="button"
                    className="ac-btn ac-btn-ghost"
                    onClick={() => goTo(step - 1)}
                    disabled={status.kind === "sending"}
                  >
                    <ArrowLeft aria-hidden="true" />
                    <span>Atrás</span>
                  </button>
                ) : (
                  <span className="ac-actions-note">
                    <strong>{read.length}</strong>/{TERMS.length} leídos
                  </span>
                )}
                {step < 2 ? (
                  <button
                    type="button"
                    className="ac-btn ac-btn-primary"
                    onClick={() => goTo(step + 1)}
                  >
                    <span>{step === 0 ? "Seguir a mis datos" : "Seguir a la firma"}</span>
                    <ArrowRight aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="ac-btn ac-btn-primary"
                    onClick={submit}
                    disabled={status.kind === "sending"}
                  >
                    {status.kind === "sending" ? (
                      <>
                        <span>Enviando…</span>
                        <LoaderCircle className="ac-spin" aria-hidden="true" />
                      </>
                    ) : (
                      <>
                        <span>Acepto y firmo</span>
                        <PenLine aria-hidden="true" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </main>
          </div>
        </>
      )}

      <footer className="ac-footer">
        <p>
          {O.brand} · {O.location}
        </p>
        <nav aria-label="Información legal">
          <a href="/privacidad">Privacidad</a>
          <a href="/aviso-legal">Aviso legal</a>
          <a href="/">Web del estudio</a>
        </nav>
      </footer>

      <input
        ref={honey}
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="ac-honey"
      />
      <PrintVersion />
    </div>
  );
}

/* ---------------------------------------------------------------- step 1 */

function StepRead({
  read,
  open,
  setOpen,
  markRead,
  onMarkAll,
}: {
  read: string[];
  open: string | null;
  setOpen: (id: string | null) => void;
  markRead: (id: string) => void;
  onMarkAll: () => void;
}) {
  return (
    <section aria-labelledby="ac-step1">
      <StepHead n={1} id="ac-step1" title="Cómo vamos a trabajar">
        Cada apartado tiene un resumen. Ábrelo para leer el detalle y pulsa «Entendido» para pasar
        al siguiente.
      </StepHead>
      <div className="ac-read-tools">
        <div className="ac-read-meter" aria-hidden="true">
          <span style={{ transform: `scaleX(${read.length / TERMS.length})` }} />
        </div>
        <span className="ac-read-count">
          <strong>{read.length}</strong> de {TERMS.length}
        </span>
        <button type="button" onClick={onMarkAll} className="ac-textbtn">
          Ya lo leí todo
        </button>
      </div>
      <ol className="ac-terms">
        {TERMS.map((term, index) => {
          const isOpen = open === term.id;
          const isRead = read.includes(term.id);
          return (
            <li
              key={term.id}
              id={`ac-term-${term.id}`}
              className="ac-term"
              style={{ "--i": index } as CSSProperties}
              data-open={isOpen}
              data-read={isRead}
            >
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`ac-body-${term.id}`}
                  onClick={() => setOpen(isOpen ? null : term.id)}
                >
                  <span className="ac-term-n">{pad(index + 1)}</span>
                  <span className="ac-term-head">
                    <span className="ac-term-title">{term.title}</span>
                    <span className="ac-term-short">{term.short}</span>
                  </span>
                  <span className="ac-term-state">
                    {isRead ? <Check aria-label="Leído" /> : <ChevronDown aria-hidden="true" />}
                  </span>
                </button>
              </h3>
              <div className="ac-term-body" id={`ac-body-${term.id}`} inert={!isOpen}>
                <div className="ac-term-inner">
                  <div className="ac-prose">
                    {term.body.map((block, i) => (
                      <Block key={i} block={block} />
                    ))}
                  </div>
                  <button
                    type="button"
                    className="ac-btn ac-btn-soft"
                    onClick={() => markRead(term.id)}
                  >
                    <Check aria-hidden="true" />
                    <span>Entendido</span>
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ---------------------------------------------------------------- step 2 */

function StepData({
  data,
  setData,
  errors,
  touched,
  setTouched,
  locked,
}: {
  data: Data;
  setData: (fn: (d: Data) => Data) => void;
  errors: Record<FieldName, string>;
  touched: Partial<Record<FieldName, boolean>>;
  setTouched: (
    fn: (t: Partial<Record<FieldName, boolean>>) => Partial<Record<FieldName, boolean>>,
  ) => void;
  locked: boolean;
}) {
  return (
    <section aria-labelledby="ac-step2">
      <StepHead n={2} id="ac-step2" title="Tus datos">
        Los uso solo para este encargo y para la factura. Los marcados con * son necesarios.
      </StepHead>
      <div className="ac-fields">
        {FIELDS.map((f) => {
          const value = data[f.name];
          const error = touched[f.name] ? errors[f.name] : "";
          const ok = Boolean(value.trim()) && !errors[f.name];
          const readOnly = f.name === "presupuesto" && locked;
          return (
            <div
              key={f.name}
              className={`ac-field${f.wide ? " is-wide" : ""}`}
              data-error={Boolean(error)}
              data-ok={ok}
            >
              <input
                id={`ac-${f.name}`}
                name={f.name}
                type={f.type ?? "text"}
                value={value}
                placeholder=" "
                autoComplete={f.autoComplete}
                inputMode={f.inputMode}
                readOnly={readOnly}
                required={f.required}
                aria-invalid={Boolean(error)}
                aria-describedby={`ac-${f.name}-msg`}
                spellCheck={f.name === "nif" || f.name === "email" ? false : undefined}
                autoCapitalize={f.name === "nif" ? "characters" : undefined}
                maxLength={f.name === "domicilio" ? 200 : 160}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => ({ ...d, [f.name]: v }));
                }}
                onBlur={() => setTouched((t) => ({ ...t, [f.name]: true }))}
              />
              <label htmlFor={`ac-${f.name}`}>
                {f.label}
                {f.required ? " *" : ""}
              </label>
              <span className="ac-field-ok" aria-hidden="true">
                <Check />
              </span>
              <p id={`ac-${f.name}-msg`} className="ac-field-msg">
                {error || (readOnly ? "Viene de tu enlace" : f.hint) || " "}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- step 3 */

function StepSign({
  data,
  checks,
  setChecks,
  firma,
  setFirma,
  firmaOk,
  tried,
  today,
  onEdit,
  error,
}: {
  data: Data;
  checks: Checks;
  setChecks: (fn: (c: Checks) => Checks) => void;
  firma: string;
  setFirma: (v: string) => void;
  firmaOk: boolean;
  tried: boolean;
  today: string;
  onEdit: () => void;
  error: boolean;
}) {
  const firmaError = (tried || firma.trim().length > 3) && !firmaOk;
  const rows: [string, string][] = [
    ["Nombre", data.nombre],
    ["Negocio", data.negocio],
    ["NIF / CIF", data.nif.toUpperCase()],
    ["Correo", data.email],
    ["Presupuesto", data.presupuesto],
    ["Condiciones", `Versión ${TERMS_VERSION} · ${TERMS_DATE}`],
  ];
  const box = (key: keyof Checks, children: ReactNode, required = true) => (
    <label className="ac-check" data-missing={required && tried && !checks[key]}>
      <input
        id={`ac-check-${key}`}
        type="checkbox"
        checked={checks[key]}
        onChange={(e) => {
          const v = e.target.checked;
          setChecks((c) => ({ ...c, [key]: v }));
        }}
      />
      <span className="ac-check-box" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      <span className="ac-check-text">{children}</span>
    </label>
  );

  return (
    <section aria-labelledby="ac-step3">
      <StepHead n={3} id="ac-step3" title="Revisa y firma">
        Comprueba que todo está bien. Al aceptar, te llega una copia a{" "}
        <strong>{data.email || "tu correo"}</strong>.
      </StepHead>

      <div className="ac-summary">
        <dl>
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <button type="button" className="ac-textbtn" onClick={onEdit}>
          Corregir datos
        </button>
      </div>

      <fieldset className="ac-checks">
        <legend className="ac-label">Aceptación</legend>
        {box(
          "condiciones",
          <>
            He leído y acepto las condiciones generales (versión {TERMS_VERSION}) y el presupuesto{" "}
            {data.presupuesto}. *
          </>,
        )}
        {box(
          "privacidad",
          <>
            He leído la{" "}
            <a href="/privacidad" target="_blank" rel="noopener">
              política de privacidad
            </a>{" "}
            y acepto que se traten mis datos para este encargo. *
          </>,
        )}
        {box(
          "novedades",
          <>Quiero recibir novedades del estudio de vez en cuando. Opcional.</>,
          false,
        )}
      </fieldset>

      <div className="ac-sign" data-ok={firmaOk}>
        <p className="ac-label">Tu firma</p>
        <div className="ac-paper" aria-hidden="true">
          <span className={`ac-paper-name${firma ? "" : " is-empty"}`}>
            {firma || "Tu nombre aquí"}
          </span>
          <span className="ac-paper-line" />
          <span className="ac-paper-meta">
            <span>{data.nombre || "Nombre y apellidos"}</span>
            <span>{today}</span>
          </span>
        </div>
        <div className="ac-field is-wide" data-error={firmaError} data-ok={firmaOk}>
          <input
            id="ac-firma"
            value={firma}
            placeholder=" "
            autoComplete="off"
            maxLength={120}
            aria-invalid={firmaError}
            aria-describedby="ac-firma-msg"
            onChange={(e) => setFirma(e.target.value)}
          />
          <label htmlFor="ac-firma">Escribe tu nombre completo para firmar *</label>
          <span className="ac-field-ok" aria-hidden="true">
            <Check />
          </span>
          <p id="ac-firma-msg" className="ac-field-msg">
            {firmaError
              ? `Escríbelo igual que en tus datos: ${data.nombre}`
              : "Vale como tu firma de este acuerdo."}
          </p>
        </div>
      </div>

      <details className="ac-privacy">
        <summary>
          <span>Tus datos, en corto</span>
          <ChevronDown aria-hidden="true" />
        </summary>
        <Items items={ACUERDO_PRIVACY} />
      </details>

      {error ? (
        <p className="ac-alert" role="alert">
          No se pudo enviar. Revisa tu conexión y vuelve a intentarlo, o escríbeme a{" "}
          <a href={`mailto:${O.email}?subject=${encodeURIComponent("Aceptación de condiciones")}`}>
            {O.email}
          </a>
          .
        </p>
      ) : null}
    </section>
  );
}

function StepHead({
  n,
  id,
  title,
  children,
}: {
  n: number;
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <header className="ac-step-head">
      <p className="ac-label">Paso {n} de 3</p>
      <h2 id={id} className="ac-h2">
        {title}
      </h2>
      <p className="ac-step-intro">{children}</p>
    </header>
  );
}

/* ------------------------------------------------------------------ done */

function Done({ status }: { status: Extract<Status, { kind: "sent" }> }) {
  return (
    <section className="ac-done" aria-live="polite">
      <div className="ac-done-mark" aria-hidden="true">
        <svg viewBox="0 0 120 120">
          <circle className="ac-done-ring" cx="60" cy="60" r="54" />
          <path className="ac-done-check" d="M38 62l15 15 30-32" />
        </svg>
      </div>
      <p className="ac-eyebrow">Acuerdo firmado</p>
      <h1 className="ac-h1">
        Gracias, <em>{status.name}.</em>
      </h1>
      <p className="ac-lead">
        Aceptaste las condiciones (versión {TERMS_VERSION}) el {status.when}. Tu copia va de camino
        a <strong>{status.email}</strong>. Si no la ves en unos minutos, mira en spam o promociones.
      </p>
      <div className="ac-done-actions">
        <a href={TERMS_PDF} download className="ac-btn ac-btn-primary">
          <span>Descargar PDF</span>
          <Download aria-hidden="true" />
        </a>
        <a href="/" className="ac-btn ac-btn-ghost">
          <span>Ver la web del estudio</span>
          <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- print */

function PrintVersion() {
  return (
    <div className="ac-print" aria-hidden="true">
      <p className="ac-print-brand">Lucas Domínguez Studio</p>
      <h1>Condiciones generales de contratación</h1>
      <p className="ac-print-meta">
        Versión {TERMS_VERSION} · {TERMS_DATE} · Se aplican junto con el presupuesto aceptado.
      </p>
      {TERMS.map((term, index) => (
        <section key={term.id}>
          <h2>
            <span>{pad(index + 1)}</span> {term.title}
          </h2>
          {term.body.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </section>
      ))}
      <p className="ac-print-foot">
        {O.name} · {O.brand} · NIE {O.taxId} · {O.email} · {O.phone}
      </p>
    </div>
  );
}
