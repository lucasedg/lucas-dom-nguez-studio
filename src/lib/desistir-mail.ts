import { z } from "zod";

import { ACUERDO_SITE, madridTimestamp } from "./acuerdo";
import type { AcuerdoEnv } from "./acuerdo-mail";
import { LEGAL_OWNER } from "./legal";

/**
 * Withdrawal function (/desistir), shared by the Cloudflare Worker and the local /api/desistimiento
 * route, like acuerdo-mail.ts. Directive (EU) 2023/2673 (art. 11a of Directive 2011/83/EU) asks for:
 * a clearly labelled function, a statement with name, contract and an address for the
 * confirmation, a "confirm withdrawal" step, and an acknowledgement of receipt on a durable medium
 * (email) with the content of the statement and the date and time it was received.
 *
 * Lucas's copy goes first: if it fails, the person is asked to retry and nothing half-done reaches
 * them. Uses the same Resend settings as the agreement (RESEND_API_KEY, ACUERDO_FROM, ACUERDO_NOTIFY).
 */

export type DesistirContext = {
  env: AcuerdoEnv;
  ip: string;
  agent: string;
  allowDryRun: boolean;
};

const schema = z.object({
  nombre: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  referencia: z.string().trim().min(1).max(60),
  fechaAcuerdo: z.string().trim().max(40),
  motivo: z.string().trim().max(1000),
  /** Honeypot: real people never fill it. */
  website: z.string().max(200),
});

export type DesistirInput = z.infer<typeof schema>;
export type DesistirResult =
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
<h1 style="margin:0 0 20px;font:400 40px/1 'Bebas Neue',Impact,'Arial Narrow',sans-serif;letter-spacing:.01em;text-transform:uppercase;color:#1d1d1d">${esc(title)}</h1>
${body}
</td></tr>
<tr><td style="padding:24px 4px 0;font:12px/1.6 Arial,sans-serif;color:#62676e">${esc(LEGAL_OWNER.brand)} · ${esc(LEGAL_OWNER.location)}<br>${esc(LEGAL_OWNER.phone)} · ${esc(LEGAL_OWNER.email)}</td></tr>
</table></td></tr></table></body></html>`;
}

/** "2026-11-18" (date input) → "18/11/2026"; anything else is kept as typed. */
const spanishDate = (value: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : value;
};

function statement(d: DesistirInput, when: string): [string, string][] {
  return [
    ["Declaración", "Desisto de mi contrato de prestación de servicios."],
    ["Nombre", d.nombre],
    ["Correo", d.email],
    ["Presupuesto o contrato", d.referencia],
    ["Aceptado el", spanishDate(d.fechaAcuerdo) || "No indicado"],
    ["Comentario", d.motivo || "—"],
    ["Recibido", `${when} (hora de España)`],
  ];
}

function receiptEmail(d: DesistirInput, when: string) {
  const first = d.nombre.split(" ")[0] ?? d.nombre;
  const html = layout(
    "Desistimiento recibido",
    "Acuse de recibo",
    `<p style="margin:0 0 24px;font:16px/1.6 Arial,sans-serif;color:#3f4247">Hola, ${esc(first)}. He recibido tu desistimiento. Este correo es tu justificante: guárdalo. Te devuelvo lo que hayas pagado en un máximo de 14 días, por el mismo medio de pago y sin coste para ti. Si ya habías pedido que empezara el trabajo antes de que terminara el plazo, solo se descuenta la parte ya hecha.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px">${rows(statement(d, when))}</table>
<p style="margin:0;font:14px/1.6 Arial,sans-serif;color:#62676e">Si algo no es correcto, responde a este correo. Puedes ver cómo trato tus datos en <a href="${ACUERDO_SITE}/privacidad" style="color:#c2410c">mi política de privacidad</a>.</p>`,
  );
  const text = [
    `Hola, ${first}:`,
    "",
    "He recibido tu desistimiento. Este correo es tu justificante: guárdalo.",
    "Te devuelvo lo que hayas pagado en un máximo de 14 días, por el mismo medio de pago y sin coste para ti. Si ya habías pedido que empezara el trabajo antes de que terminara el plazo, solo se descuenta la parte ya hecha.",
    "",
    ...statement(d, when).map(([k, v]) => `· ${k}: ${v}`),
    "",
    "Si algo no es correcto, responde a este correo.",
    "",
    `Lucas · ${LEGAL_OWNER.brand}`,
  ].join("\n");
  return { html, text };
}

function noticeEmail(d: DesistirInput, when: string, utc: string, ip: string, agent: string) {
  const proof: [string, string][] = [
    ["Fecha (UTC)", utc],
    ["IP", ip],
    ["Navegador", agent],
  ];
  const html = layout(
    d.nombre,
    `Desistimiento · ${d.referencia}`,
    `<p style="margin:0 0 20px;font:15px/1.6 Arial,sans-serif;color:#3f4247">Un cliente ha desistido desde la web. Ya le llegó el acuse de recibo. Tienes 14 días para devolverle lo pagado (menos la parte hecha, si pidió empezar antes).</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px">${rows(statement(d, when))}</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows(proof)}</table>`,
  );
  const text = [...statement(d, when), ...proof].map(([k, v]) => `${k}: ${v}`).join("\n");
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

export async function handleDesistir(
  input: unknown,
  ctx: DesistirContext,
): Promise<DesistirResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "invalid" };
  const data = parsed.data;
  const now = new Date();
  const when = madridTimestamp(now);
  if (data.website) return { ok: true, when };

  const key = ctx.env.RESEND_API_KEY;
  const from = ctx.env.ACUERDO_FROM || "Lucas Domínguez Studio <estudio@lucasdominguezstudio.es>";
  const notify = ctx.env.ACUERDO_NOTIFY || LEGAL_OWNER.email;
  const receipt = receiptEmail(data, when);
  const notice = noticeEmail(data, when, now.toISOString(), ctx.ip, ctx.agent.slice(0, 300));

  if (!key) {
    if (!ctx.allowDryRun) {
      console.error("[desistir] RESEND_API_KEY is not set; emails were not sent.");
      return { ok: false, reason: "config" };
    }
    console.info("[desistir] Dry run (no RESEND_API_KEY):", {
      to: data.email,
      notify,
      subject: `Desistimiento · ${data.nombre} · ${data.referencia}`,
    });
    return { ok: true, when, dryRun: true };
  }

  try {
    await resend(key, {
      from,
      to: [notify],
      reply_to: data.email,
      subject: `Desistimiento · ${data.nombre} · ${data.referencia}`,
      html: notice.html,
      text: notice.text,
    });
    await resend(key, {
      from,
      to: [data.email],
      reply_to: LEGAL_OWNER.email,
      subject: `Desistimiento recibido · ${LEGAL_OWNER.brand}`,
      html: receipt.html,
      text: receipt.text,
    });
    return { ok: true, when };
  } catch (error) {
    console.error("[desistir] Email sending failed:", error);
    return { ok: false, reason: "send" };
  }
}
