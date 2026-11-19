import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, type FormEvent } from "react";

import { LegalPage, LegalSection } from "@/components/legal-page";
import { MODEL_FORM, WITHDRAWAL_DAYS } from "@/lib/acuerdo";
import type { DesistirInput, DesistirResult } from "@/lib/desistir-mail";
import { LEGAL_OWNER as O, legalHead } from "@/lib/legal";

/*
 * Withdrawal function for consumers (Directive (EU) 2023/2673, art. 11a of Directive 2011/83/EU):
 * reachable from every page footer as "Desistir del contrato", it collects the statement and ends
 * in a "Confirmar desistimiento" button. The acknowledgement of receipt is emailed by
 * src/lib/desistir-mail.ts.
 */
export const Route = createFileRoute("/desistir")({
  head: () =>
    legalHead(
      "Desistir del contrato",
      "Si contrataste como particular, desiste aquí de tu contrato con Lucas Domínguez Studio.",
      "/desistir",
    ),
  component: Desistir,
});

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; when: string; email: string }
  | { kind: "error" };

const fieldClass =
  "mt-2 w-full rounded-xl border border-studio-ink/25 bg-white/70 px-4 py-3 text-base text-studio-ink outline-none transition focus:border-studio-copper focus:ring-4 focus:ring-studio-copper/15";
const labelClass = "block text-sm font-semibold text-studio-ink";

function Desistir() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const honey = useRef<HTMLInputElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (name: string) => String(form.get(name) ?? "").trim();
    const payload: DesistirInput = {
      nombre: value("nombre"),
      email: value("email"),
      referencia: value("referencia"),
      fechaAcuerdo: value("fechaAcuerdo"),
      motivo: value("motivo"),
      website: honey.current?.value ?? "",
    };
    setStatus({ kind: "sending" });
    try {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 25000);
      const response = await fetch("/api/desistimiento", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      }).finally(() => window.clearTimeout(timer));
      const result = (await response
        .json()
        .catch(() => ({ ok: false, reason: "send" }))) as DesistirResult;
      if (!result.ok) throw new Error(result.reason);
      setStatus({ kind: "sent", when: result.when, email: payload.email });
      window.scrollTo({ top: 0 });
    } catch {
      setStatus({ kind: "error" });
    }
  }

  return (
    <LegalPage
      title="Desistir del contrato"
      intro={`Si contrataste uno de mis servicios como particular, tienes ${WITHDRAWAL_DAYS} días naturales desde que aceptaste para desistir, sin dar motivos y sin coste. Rellena estos datos y confirma: te llegará al momento un acuse de recibo por correo.`}
    >
      {status.kind === "sent" ? (
        <section
          role="status"
          className="rounded-2xl border border-studio-copper/40 bg-studio-copper/10 p-6"
        >
          <h2 className="font-serif text-3xl leading-tight">Desistimiento recibido</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-studio-ink/80">
            Lo he recibido el {status.when} (hora de España). Te envié el acuse de recibo a{" "}
            <strong>{status.email}</strong>. Te devolveré lo que hayas pagado en un máximo de 14
            días, por el mismo medio de pago.
          </p>
        </section>
      ) : (
        <LegalSection title="Tus datos">
          <form onSubmit={submit} className="grid gap-5" noValidate={false}>
            <label className={labelClass}>
              Nombre y apellidos *
              <input
                name="nombre"
                required
                minLength={2}
                maxLength={120}
                autoComplete="name"
                className={fieldClass}
              />
            </label>
            <label className={labelClass}>
              Correo *
              <input
                name="email"
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                className={fieldClass}
              />
              <span className="mt-1 block text-xs font-normal text-studio-ink/60">
                Aquí te llega el acuse de recibo.
              </span>
            </label>
            <label className={labelClass}>
              Referencia del presupuesto o del contrato *
              <input name="referencia" required maxLength={60} className={fieldClass} />
              <span className="mt-1 block text-xs font-normal text-studio-ink/60">
                La que aparece en tu presupuesto o en el correo con tu copia del acuerdo.
              </span>
            </label>
            <label className={labelClass}>
              Fecha en que aceptaste
              <input name="fechaAcuerdo" type="date" className={fieldClass} />
              <span className="mt-1 block text-xs font-normal text-studio-ink/60">Opcional.</span>
            </label>
            <label className={labelClass}>
              Comentario
              <textarea name="motivo" rows={3} maxLength={1000} className={fieldClass} />
              <span className="mt-1 block text-xs font-normal text-studio-ink/60">
                Opcional. No necesitas dar ningún motivo.
              </span>
            </label>
            <input
              ref={honey}
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[9999px] h-px w-px opacity-0"
            />
            <p className="text-sm text-studio-ink/70">
              Al pulsar el botón declaras que desistes de tu contrato de prestación de servicios con{" "}
              {O.name} ({O.brand}). Uso estos datos solo para tramitar tu desistimiento y tu
              devolución; más información en la <a href="/privacidad">política de privacidad</a>.
            </p>
            {status.kind === "error" ? (
              <p role="alert" className="text-sm font-semibold text-[#b42318]">
                No se pudo enviar. Vuelve a intentarlo o escríbeme a{" "}
                <a href={`mailto:${O.email}?subject=${encodeURIComponent("Desistimiento")}`}>
                  {O.email}
                </a>
                : también vale.
              </p>
            ) : null}
            <button
              type="submit"
              disabled={status.kind === "sending"}
              className="justify-self-start rounded-full bg-studio-ink px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-studio-ivory transition hover:bg-black disabled:opacity-60"
            >
              {status.kind === "sending" ? "Enviando…" : "Confirmar desistimiento"}
            </button>
          </form>
        </LegalSection>
      )}

      <LegalSection title="Otras formas de desistir">
        <p>
          También puedes escribirme a <a href={`mailto:${O.email}`}>{O.email}</a> o enviarme este
          formulario modelo. Basta con que me lo comuniques antes de que acaben los{" "}
          {WITHDRAWAL_DAYS} días.
        </p>
        <pre className="whitespace-pre-wrap rounded-xl bg-studio-ink/[0.04] p-5 font-sans text-sm leading-relaxed text-studio-ink/80">
          {MODEL_FORM.join("\n")}
        </pre>
      </LegalSection>

      <LegalSection title="Qué pasa después">
        <ul>
          <li>Te devuelvo todo lo pagado en un máximo de 14 días, por el mismo medio de pago.</li>
          <li>
            Si al aceptar me pediste empezar antes de que terminara el plazo, pagas solo la parte
            del trabajo hecha hasta que desistes.
          </li>
          <li>
            Si el trabajo ya se terminó del todo dentro del plazo, a petición tuya, ya no se puede
            desistir.
          </li>
          <li>
            Si contrataste como negocio o profesional, el desistimiento no se aplica: escríbeme y
            vemos la baja o la cancelación según tus condiciones.
          </li>
        </ul>
      </LegalSection>
    </LegalPage>
  );
}
