import { z } from "zod";

import {
  ACUERDO_SITE,
  DESISTIR_PATH,
  MODEL_FORM,
  TERMS_DATE,
  TERMS_PDF,
  TERMS_VERSION,
  WITHDRAWAL_DAYS,
  madridTimestamp,
  withdrawalDeadline,
} from "./acuerdo";
import { LEGAL_OWNER } from "./legal";

/**
 * Agreement emails, shared by the Cloudflare Worker (production, worker/index.ts) and the
 * local /api/acuerdo route (dev and the Vercel copy). Pure fetch + zod: no Node or framework APIs,
 * so it runs unchanged in a Worker.
 *
 * Sends through Resend: Lucas's proof record first, then the client's copy with the terms PDF.
 *
 * Environment (Cloudflare → Workers → lucas-dom-nguez-studio → Settings → Variables and Secrets):
 * - RESEND_API_KEY  secret, required in production; without it, local dev runs a dry run.
 * - ACUERDO_FROM    optional sender, default "Lucas Domínguez Studio <estudio@lucasdominguezstudio.es>".
 * - ACUERDO_NOTIFY  optional inbox for the proof record, default LEGAL_OWNER.email.
 */

export type AcuerdoEnv = {
  RESEND_API_KEY?: string | undefined;
  ACUERDO_FROM?: string | undefined;
  ACUERDO_NOTIFY?: string | undefined;
};

export type AcuerdoContext = {
  env: AcuerdoEnv;
  ip: string;
  agent: string;
  /** Origin the PDF is fetched from to attach it. */
  origin: string;
  /** Allow a dry run (no emails) when the key is missing. Never true in production. */
  allowDryRun: boolean;
};

const schema = z
  .object({
    nombre: z.string().trim().min(2).max(120),
    /** Business or consumer: consumers get the withdrawal information and function. */
    tipo: z.enum(["empresa", "particular"]),
    /** Consumer only: asked to start before the withdrawal period ends. */
    inicioAnticipado: z.boolean(),
    negocio: z.string().trim().max(160),
    nif: z.string().trim().min(8).max(20),
    domicilio: z.string().trim().max(200),
    email: z.string().trim().email().max(254),
    telefono: z.string().trim().max(30),
    presupuesto: z.string().trim().min(1).max(60),
    firma: z.string().trim().min(2).max(120),
    novedades: z.boolean(),
    apartadosLeidos: z.number().int().min(0).max(100),
    pagina: z.string().max(500),
    /** Honeypot: real people never fill it. */
    website: z.string().max(200),
  })
  .refine((d) => d.tipo === "particular" || d.negocio.length > 0, { path: ["negocio"] });

export type AcuerdoInput = z.infer<typeof schema>;
export type AcuerdoResult =
  | { ok: true; when: string; dryRun?: boolean }
  | { ok: false; reason: "config" | "send" | "invalid" };

const esc = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );

function rows(items: [string, string][]) {
  return items
    .map(
      ([k, v]) => `<tr>
  <td style="padding:10px 0;border-bottom:1px solid #ebe5da;font:600 11px/1.4 Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#62676e;width:38%;vertical-align:top">${esc(k)}</td>
  <td style="padding:10px 0;border-bottom:1px solid #ebe5da;font:15px/1.5 Arial,sans-serif;color:#1d1d1d;vertical-align:top">${esc(v)}</td>
</tr>`,
    )
    .join("");
}

function layout(title: string, intro: string, body: string) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#f7f5f2">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f2"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td style="padding:0 0 24px;font:600 11px/1 Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#1d1d1d">Lucas Domínguez Studio</td></tr>
<tr><td style="background:#fbfaf8;border:1px solid #ebe5da;border-radius:14px;padding:36px 32px">
<p style="margin:0 0 12px;font:600 11px/1 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#c2410c">${esc(intro)}</p>
<h1 style="margin:0 0 20px;font:400 40px/1 'Bebas Neue',Impact,'Arial Narrow',sans-serif;letter-spacing:.01em;text-transform:uppercase;color:#1d1d1d">${title}</h1>
${body}
</td></tr>
<tr><td style="padding:24px 4px 0;font:12px/1.6 Arial,sans-serif;color:#62676e">${esc(LEGAL_OWNER.brand)} · ${esc(LEGAL_OWNER.location)}<br>${esc(LEGAL_OWNER.phone)} · ${esc(LEGAL_OWNER.email)}</td></tr>
</table></td></tr></table></body></html>`;
}

const whoLabel = (d: AcuerdoInput) => (d.tipo === "particular" ? d.negocio || d.nombre : d.negocio);

const startLabel = (d: AcuerdoInput, deadline: string) =>
  d.inicioAnticipado
    ? "Pidió empezar antes de que terminen los 14 días"
    : `Empezar después del ${deadline}, salvo que lo pida`;

/** Withdrawal block for consumers: deadline, the function on the web and the model form. */
function withdrawalHtml(deadline: string, early: boolean) {
  const link = `${ACUERDO_SITE}${DESISTIR_PATH}`;
  const form = MODEL_FORM.map((line) => (line ? esc(line) : "&nbsp;")).join("<br>");
  return `<div style="margin:0 0 28px;padding:20px 22px;background:#f2eee8;border-radius:12px">
<p style="margin:0 0 10px;font:600 11px/1 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#c2410c">Tu derecho a desistir</p>
<p style="margin:0 0 12px;font:15px/1.6 Arial,sans-serif;color:#1d1d1d">Como particular, puedes desistir sin dar motivos y sin coste hasta el <strong>${esc(deadline)}</strong> (${WITHDRAWAL_DAYS} días naturales). Te devuelvo lo pagado en un máximo de 14 días.${
    early
      ? " Me pediste empezar antes: si desistes, pagarás solo la parte ya hecha, y si el trabajo se termina del todo en ese plazo ya no podrás desistir."
      : " No empezaré el trabajo hasta que pase ese plazo, salvo que me pidas empezar antes."
  }</p>
<p style="margin:0 0 14px;font:15px/1.6 Arial,sans-serif;color:#1d1d1d">Para hacerlo, usa <a href="${link}" style="color:#c2410c">Desistir del contrato</a>, responde a este correo o envíame este formulario:</p>
<p style="margin:0;font:13px/1.6 Arial,sans-serif;color:#3f4247">${form}</p>
</div>`;
}

function withdrawalText(deadline: string, early: boolean) {
  return [
    "TU DERECHO A DESISTIR",
    `Como particular, puedes desistir sin dar motivos y sin coste hasta el ${deadline} (${WITHDRAWAL_DAYS} días naturales). Te devuelvo lo pagado en un máximo de 14 días.`,
    early
      ? "Me pediste empezar antes: si desistes, pagarás solo la parte ya hecha, y si el trabajo se termina del todo en ese plazo ya no podrás desistir."
      : "No empezaré el trabajo hasta que pase ese plazo, salvo que me pidas empezar antes.",
    `Para hacerlo: ${ACUERDO_SITE}${DESISTIR_PATH}, responde a este correo o envíame este formulario:`,
    "",
    ...MODEL_FORM,
    "",
  ];
}

function clientEmail(d: AcuerdoInput, when: string, deadline: string) {
  const first = d.nombre.split(" ")[0] ?? d.nombre;
  const pdf = `${ACUERDO_SITE}${TERMS_PDF}`;
  const consumer = d.tipo === "particular";
  const html = layout(
    `Gracias, <em style="color:#ff5b14">${esc(first)}</em>.`,
    "Acuerdo firmado",
    `<p style="margin:0 0 24px;font:16px/1.6 Arial,sans-serif;color:#3f4247">Este correo es tu copia de lo que aceptaste. Te adjunto las condiciones en PDF. Guárdalo: es tu justificante.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px">${rows(
      [
        consumer ? ["Contratas como", "Particular"] : ["Negocio", d.negocio],
        ["Presupuesto", d.presupuesto],
        ["Condiciones", `Versión ${TERMS_VERSION}, del ${TERMS_DATE}`],
        ["Firmado", `${when} (hora de España)`],
        ["Firma", d.firma],
      ],
    )}</table>
${consumer ? withdrawalHtml(deadline, d.inicioAnticipado) : ""}
<a href="${pdf}" style="display:inline-block;background:#ff5b14;color:#1d1d1d;text-decoration:none;font:700 15px/1 Arial,sans-serif;padding:16px 28px;border-radius:999px">Descargar condiciones (PDF)</a>
<p style="margin:28px 0 0;font:14px/1.6 Arial,sans-serif;color:#62676e">Si algún dato no es correcto, responde a este correo y lo corrijo. Puedes ver cómo trato tus datos en <a href="${ACUERDO_SITE}/privacidad" style="color:#c2410c">mi política de privacidad</a>.</p>`,
  );
  const text = [
    `Hola, ${first}:`,
    "",
    `Este correo es tu copia de la aceptación de las condiciones de trabajo de ${LEGAL_OWNER.brand}.`,
    "",
    consumer ? "· Contratas como: particular" : `· Negocio: ${d.negocio}`,
    `· Presupuesto: ${d.presupuesto}`,
    `· Condiciones: versión ${TERMS_VERSION}, del ${TERMS_DATE}`,
    `· Firmado: ${when} (hora de España)`,
    `· Firma: ${d.firma}`,
    "",
    `Condiciones en PDF: ${pdf}`,
    `Política de privacidad: ${ACUERDO_SITE}/privacidad`,
    "",
    "",
    ...(consumer ? withdrawalText(deadline, d.inicioAnticipado) : []),
    "Si algún dato no es correcto, responde a este correo y lo corrijo.",
    "",
    `Lucas · ${LEGAL_OWNER.brand}`,
  ].join("\n");
  return { html, text };
}

function proofEmail(
  d: AcuerdoInput,
  when: string,
  utc: string,
  ip: string,
  agent: string,
  deadline: string,
) {
  const consumer = d.tipo === "particular";
  const data: [string, string][] = [
    ["Nombre", d.nombre],
    ["Contrata como", consumer ? "Particular (consumidor)" : "Negocio o profesional"],
    ["Negocio", d.negocio || "—"],
    ["NIF / CIF", d.nif.toUpperCase()],
    ["Domicilio fiscal", d.domicilio || "—"],
    ["Correo", d.email],
    ["Teléfono", d.telefono || "—"],
    ["Presupuesto", d.presupuesto],
    ["Novedades", d.novedades ? "Sí, acepta recibirlas" : "No"],
    ...(consumer
      ? ([
          ["Puede desistir hasta", deadline],
          ["Inicio del trabajo", startLabel(d, deadline)],
        ] as [string, string][])
      : []),
  ];
  const proof: [string, string][] = [
    ["Condiciones", `Versión ${TERMS_VERSION} (${TERMS_DATE})`],
    ["Privacidad", "Leída y aceptada"],
    ["Firma escrita", d.firma],
    ["Apartados leídos", `${d.apartadosLeidos}`],
    ["Fecha (España)", when],
    ["Fecha (UTC)", utc],
    ["IP", ip],
    ["Navegador", agent],
    ["Página", d.pagina],
  ];
  const html = layout(
    esc(whoLabel(d)),
    `Nuevo acuerdo firmado · ${d.presupuesto}`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px">${rows(data)}</table>
<p style="margin:0 0 4px;font:600 11px/1 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#c2410c">Justificante</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows(proof)}</table>`,
  );
  const text = [...data, ...proof].map(([k, v]) => `${k}: ${v}`).join("\n");
  return { html, text };
}

async function resend(key: string, body: Record<string, unknown>) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Resend ${response.status}: ${(await response.text()).slice(0, 300)}`);
  }
}

function toBase64(bytes: Uint8Array) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

async function termsAttachment(origin: string) {
  try {
    const response = await fetch(`${origin}${TERMS_PDF}`);
    if (!response.ok) return [];
    const content = toBase64(new Uint8Array(await response.arrayBuffer()));
    return [{ filename: `Condiciones-Lucas-Dominguez-Studio-v${TERMS_VERSION}.pdf`, content }];
  } catch {
    return [];
  }
}

export async function handleAcuerdo(input: unknown, ctx: AcuerdoContext): Promise<AcuerdoResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "invalid" };
  const data = parsed.data;
  const now = new Date();
  const when = madridTimestamp(now);
  if (data.website) return { ok: true, when };

  const key = ctx.env.RESEND_API_KEY;
  const from = ctx.env.ACUERDO_FROM || "Lucas Domínguez Studio <estudio@lucasdominguezstudio.es>";
  const notify = ctx.env.ACUERDO_NOTIFY || LEGAL_OWNER.email;
  const deadline = withdrawalDeadline(now);
  const who = whoLabel(data);
  const client = clientEmail(data, when, deadline);
  const proof = proofEmail(
    data,
    when,
    now.toISOString(),
    ctx.ip,
    ctx.agent.slice(0, 300),
    deadline,
  );

  if (!key) {
    if (!ctx.allowDryRun) {
      console.error("[acuerdo] RESEND_API_KEY is not set; emails were not sent.");
      return { ok: false, reason: "config" };
    }
    console.info("[acuerdo] Dry run (no RESEND_API_KEY):", {
      to: data.email,
      notify,
      subject: `Acuerdo firmado · ${who} · ${data.presupuesto}`,
      ip: ctx.ip,
    });
    return { ok: true, when, dryRun: true };
  }

  try {
    // Proof first: if it fails, the client is asked to retry and nothing half-done reaches them.
    await resend(key, {
      from,
      to: [notify],
      reply_to: data.email,
      subject: `Acuerdo firmado · ${who} · ${data.presupuesto}`,
      html: proof.html,
      text: proof.text,
    });
    await resend(key, {
      from,
      to: [data.email],
      reply_to: LEGAL_OWNER.email,
      subject: `Tu copia del acuerdo · ${LEGAL_OWNER.brand}`,
      html: client.html,
      text: client.text,
      attachments: await termsAttachment(ctx.origin),
    });
    return { ok: true, when };
  } catch (error) {
    console.error("[acuerdo] Email sending failed:", error);
    return { ok: false, reason: "send" };
  }
}
