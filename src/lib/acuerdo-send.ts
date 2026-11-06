import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, getRequestIP, getRequestUrl } from "@tanstack/react-start/server";
import { z } from "zod";

import { ACUERDO_SITE, TERMS_DATE, TERMS_PDF, TERMS_VERSION, madridTimestamp } from "@/lib/acuerdo";
import { LEGAL_OWNER } from "@/lib/legal";

/**
 * Sends the two agreement emails through Resend from the site's own server:
 * the client's copy (with the terms PDF attached) and Lucas's proof record.
 *
 * Environment (Vercel → Settings → Environment Variables):
 * - RESEND_API_KEY  required in production; without it, local dev runs a dry run.
 * - ACUERDO_FROM    optional sender, default "Lucas Domínguez Studio <estudio@lucasdominguezstudio.es>".
 * - ACUERDO_NOTIFY  optional inbox for the proof record, default LEGAL_OWNER.email.
 */

const schema = z.object({
  nombre: z.string().trim().min(2).max(120),
  negocio: z.string().trim().min(1).max(160),
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
});

export type AcuerdoInput = z.infer<typeof schema>;
export type AcuerdoResult =
  { ok: true; when: string; dryRun?: boolean } | { ok: false; reason: "config" | "send" };

const esc = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );

function rows(items: [string, string][]) {
  return items
    .map(
      ([k, v]) => `<tr>
  <td style="padding:10px 0;border-bottom:1px solid #ebe5da;font:600 11px/1.4 Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#7a7067;width:38%;vertical-align:top">${esc(k)}</td>
  <td style="padding:10px 0;border-bottom:1px solid #ebe5da;font:15px/1.5 Arial,sans-serif;color:#16130f;vertical-align:top">${esc(v)}</td>
</tr>`,
    )
    .join("");
}

function layout(title: string, intro: string, body: string) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#f8f5ef">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ef"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td style="padding:0 0 24px;font:600 11px/1 Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#16130f">Lucas Domínguez Studio</td></tr>
<tr><td style="background:#fffdf9;border:1px solid #ebe5da;border-radius:14px;padding:36px 32px">
<p style="margin:0 0 12px;font:600 11px/1 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#8b4d33">${esc(intro)}</p>
<h1 style="margin:0 0 20px;font:400 34px/1.1 Georgia,'Times New Roman',serif;color:#16130f">${title}</h1>
${body}
</td></tr>
<tr><td style="padding:24px 4px 0;font:12px/1.6 Arial,sans-serif;color:#7a7067">${esc(LEGAL_OWNER.brand)} · ${esc(LEGAL_OWNER.location)}<br>${esc(LEGAL_OWNER.phone)} · ${esc(LEGAL_OWNER.email)}</td></tr>
</table></td></tr></table></body></html>`;
}

function clientEmail(d: AcuerdoInput, when: string) {
  const first = d.nombre.split(" ")[0] ?? d.nombre;
  const pdf = `${ACUERDO_SITE}${TERMS_PDF}`;
  const html = layout(
    `Gracias, <em style="color:#b87555">${esc(first)}</em>.`,
    "Acuerdo firmado",
    `<p style="margin:0 0 24px;font:16px/1.6 Arial,sans-serif;color:#4a433c">Este correo es tu copia de lo que aceptaste. Te adjunto las condiciones en PDF. Guárdalo: es tu justificante.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px">${rows(
      [
        ["Negocio", d.negocio],
        ["Presupuesto", d.presupuesto],
        ["Condiciones", `Versión ${TERMS_VERSION}, del ${TERMS_DATE}`],
        ["Firmado", `${when} (hora de España)`],
        ["Firma", d.firma],
      ],
    )}</table>
<a href="${pdf}" style="display:inline-block;background:#16130f;color:#f8f5ef;text-decoration:none;font:600 15px/1 Arial,sans-serif;padding:16px 28px;border-radius:999px">Descargar condiciones (PDF)</a>
<p style="margin:28px 0 0;font:14px/1.6 Arial,sans-serif;color:#7a7067">Si algún dato no es correcto, responde a este correo y lo corrijo. Puedes ver cómo trato tus datos en <a href="${ACUERDO_SITE}/privacidad" style="color:#8b4d33">mi política de privacidad</a>.</p>`,
  );
  const text = [
    `Hola, ${first}:`,
    "",
    `Este correo es tu copia de la aceptación de las condiciones de trabajo de ${LEGAL_OWNER.brand}.`,
    "",
    `· Negocio: ${d.negocio}`,
    `· Presupuesto: ${d.presupuesto}`,
    `· Condiciones: versión ${TERMS_VERSION}, del ${TERMS_DATE}`,
    `· Firmado: ${when} (hora de España)`,
    `· Firma: ${d.firma}`,
    "",
    `Condiciones en PDF: ${pdf}`,
    `Política de privacidad: ${ACUERDO_SITE}/privacidad`,
    "",
    "Si algún dato no es correcto, responde a este correo y lo corrijo.",
    "",
    `Lucas · ${LEGAL_OWNER.brand}`,
  ].join("\n");
  return { html, text };
}

function proofEmail(d: AcuerdoInput, when: string, utc: string, ip: string, agent: string) {
  const data: [string, string][] = [
    ["Nombre", d.nombre],
    ["Negocio", d.negocio],
    ["NIF / CIF", d.nif.toUpperCase()],
    ["Domicilio fiscal", d.domicilio || "—"],
    ["Correo", d.email],
    ["Teléfono", d.telefono || "—"],
    ["Presupuesto", d.presupuesto],
    ["Novedades", d.novedades ? "Sí, acepta recibirlas" : "No"],
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
    esc(d.negocio),
    `Nuevo acuerdo firmado · ${d.presupuesto}`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px">${rows(data)}</table>
<p style="margin:0 0 4px;font:600 11px/1 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#8b4d33">Justificante</p>
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

async function termsAttachment() {
  try {
    const origin = new URL(getRequestUrl().toString()).origin;
    const response = await fetch(`${origin}${TERMS_PDF}`);
    if (!response.ok) return [];
    const content = Buffer.from(await response.arrayBuffer()).toString("base64");
    return [{ filename: `Condiciones-Lucas-Dominguez-Studio-v${TERMS_VERSION}.pdf`, content }];
  } catch {
    return [];
  }
}

export const sendAcuerdo = createServerFn({ method: "POST" })
  .validator((input: unknown) => schema.parse(input))
  .handler(async ({ data }): Promise<AcuerdoResult> => {
    const now = new Date();
    const when = madridTimestamp(now);
    if (data.website) return { ok: true, when };

    const ip = getRequestIP({ xForwardedFor: true }) ?? "desconocida";
    const agent = getRequestHeader("user-agent")?.slice(0, 300) ?? "desconocido";
    const key = process.env["RESEND_API_KEY"];
    const from =
      process.env["ACUERDO_FROM"] || "Lucas Domínguez Studio <estudio@lucasdominguezstudio.es>";
    const notify = process.env["ACUERDO_NOTIFY"] || LEGAL_OWNER.email;
    const client = clientEmail(data, when);
    const proof = proofEmail(data, when, now.toISOString(), ip, agent);

    if (!key) {
      if (process.env["NODE_ENV"] === "production") {
        console.error("[acuerdo] RESEND_API_KEY is not set; emails were not sent.");
        return { ok: false, reason: "config" };
      }
      console.info("[acuerdo] Dry run (no RESEND_API_KEY):", {
        to: data.email,
        notify,
        subject: `Acuerdo firmado · ${data.negocio} · ${data.presupuesto}`,
        ip,
      });
      return { ok: true, when, dryRun: true };
    }

    try {
      // Proof first: if this fails, the client is told to retry and nothing half-done reaches them.
      await resend(key, {
        from,
        to: [notify],
        reply_to: data.email,
        subject: `Acuerdo firmado · ${data.negocio} · ${data.presupuesto}`,
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
        attachments: await termsAttachment(),
      });
      return { ok: true, when };
    } catch (error) {
      console.error("[acuerdo] Email sending failed:", error);
      return { ok: false, reason: "send" };
    }
  });
