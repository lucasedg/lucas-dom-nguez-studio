import { createFileRoute } from "@tanstack/react-router";

import { handleAcuerdo } from "@/lib/acuerdo-mail";

/*
 * Same endpoint as worker/index.ts, for `npm run dev` and the Vercel copy of the site.
 * On lucasdominguezstudio.es (Cloudflare, static files) the Worker answers /api/acuerdo instead.
 */
export const Route = createFileRoute("/api/acuerdo")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const origin = request.headers.get("Origin");
        if (origin && origin !== url.origin) {
          return Response.json({ ok: false, reason: "origin" }, { status: 403 });
        }
        const input: unknown = await request.json().catch(() => null);
        const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
        const result = await handleAcuerdo(input, {
          env: {
            RESEND_API_KEY: process.env["RESEND_API_KEY"],
            ACUERDO_FROM: process.env["ACUERDO_FROM"],
            ACUERDO_NOTIFY: process.env["ACUERDO_NOTIFY"],
          },
          ip: forwarded || request.headers.get("x-real-ip") || "desconocida",
          agent: request.headers.get("user-agent") ?? "desconocido",
          origin: url.origin,
          allowDryRun: process.env["NODE_ENV"] !== "production",
        });
        const status = result.ok ? 200 : result.reason === "invalid" ? 400 : 500;
        return Response.json(result, { status, headers: { "Cache-Control": "no-store" } });
      },
    },
  },
});
