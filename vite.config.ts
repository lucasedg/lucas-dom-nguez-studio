import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tanstackStart({
      server: { entry: "server" },
      /* Static export for Cloudflare Pages: every route is rendered to plain HTML at build time. */
      prerender: {
        enabled: true,
        crawlLinks: true,
        failOnError: true,
        filter: ({ path }) => !path.includes("?"),
      },
    }),
    /* On Cloudflare CI Nitro would switch to its worker preset; the site ships there as static files instead. */
    nitro(process.env["WORKERS_CI"] || process.env["CF_PAGES"] ? { preset: "node-server" } : {}),
    viteReact(),
    tailwindcss(),
  ],
});
