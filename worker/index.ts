/**
 * Cloudflare Worker in front of the static site.
 * Only /api/* reaches this code (see run_worker_first in wrangler.jsonc); every other
 * request is answered straight from the prerendered files in .output/public.
 */
import { handleAcuerdo, type AcuerdoEnv } from "../src/lib/acuerdo-mail";

type Env = AcuerdoEnv & {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/acuerdo") {
      if (request.method !== "POST") return json({ ok: false, reason: "method" }, 405);
      const origin = request.headers.get("Origin");
      if (origin && origin !== url.origin) return json({ ok: false, reason: "origin" }, 403);
      const input: unknown = await request.json().catch(() => null);
      const result = await handleAcuerdo(input, {
        env,
        ip: request.headers.get("CF-Connecting-IP") ?? "desconocida",
        agent: request.headers.get("User-Agent") ?? "desconocido",
        origin: url.origin,
        allowDryRun: false,
      });
      return json(result, result.ok ? 200 : result.reason === "invalid" ? 400 : 500);
    }

    if (url.pathname.startsWith("/api/")) return json({ ok: false, reason: "not_found" }, 404);
    return env.ASSETS.fetch(request);
  },
};
