import type { ReactNode } from "react";

import { LEGAL_UPDATED } from "@/lib/legal";

const legalLinks = [
  ["Aviso legal", "/aviso-legal"],
  ["Privacidad", "/privacidad"],
  ["Cookies", "/cookies"],
] as const;

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-studio-ink/15 pt-8">
      <h2 className="font-serif text-3xl leading-tight text-studio-ink">{title}</h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-studio-ink/80 [&_a]:underline [&_a]:underline-offset-4 [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-studio-ink">
        {children}
      </div>
    </section>
  );
}

export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-studio-ivory text-studio-ink">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-6 sm:px-8">
        <a
          href="/"
          className="text-[11px] font-semibold uppercase leading-tight tracking-[0.16em] sm:text-xs"
        >
          Lucas Domínguez
          <br />
          Studio
        </a>
        <a
          href="/"
          className="text-[11px] uppercase tracking-[0.14em] underline-offset-4 hover:underline"
        >
          Volver a la web
        </a>
      </header>
      <main className="mx-auto max-w-3xl px-5 pb-20 pt-10 sm:px-8 sm:pt-16">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-studio-gold">
          Información legal
        </p>
        <h1 className="mt-4 font-serif text-5xl leading-none sm:text-6xl">{title}</h1>
        <div className="mt-6 max-w-2xl text-base leading-relaxed text-studio-ink/75">{intro}</div>
        <p className="mt-3 text-xs text-studio-ink/50">Última actualización: {LEGAL_UPDATED}</p>
        <div className="mt-12 space-y-10">{children}</div>
      </main>
      <footer className="border-t border-studio-ink/15">
        <nav
          aria-label="Información legal"
          className="mx-auto flex max-w-3xl flex-wrap gap-x-6 gap-y-2 px-5 py-8 text-[10px] uppercase tracking-[0.14em] text-studio-ink/60 sm:px-8"
        >
          {legalLinks.map(([label, href]) => (
            <a key={href} href={href} className="hover:text-studio-ink">
              {label}
            </a>
          ))}
        </nav>
      </footer>
    </div>
  );
}
