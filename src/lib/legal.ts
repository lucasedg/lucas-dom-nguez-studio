export const LEGAL_OWNER = {
  name: "Lucas Emanuel Domínguez Guridi",
  brand: "Lucas Domínguez Studio",
  taxId: "Z1324973V",
  location: "Arroyo de la Miel, Benalmádena (Málaga), España",
  email: "lucase.dominguezguridi@gmail.com",
  phone: "+34 622 688 942",
  site: "https://lucasdominguezstudio.es",
};

export const LEGAL_UPDATED = "16 de octubre de 2026";

export function legalHead(title: string, description: string, path: string) {
  return {
    meta: [
      { title: `${title} · Lucas Domínguez Studio` },
      { name: "description", content: description },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: `${LEGAL_OWNER.site}${path}` }],
  };
}
