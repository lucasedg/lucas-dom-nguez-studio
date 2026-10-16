import { createFileRoute } from "@tanstack/react-router";

import { LegalPage, LegalSection } from "@/components/legal-page";
import { LEGAL_OWNER as O, legalHead } from "@/lib/legal";

export const Route = createFileRoute("/cookies")({
  head: () =>
    legalHead(
      "Política de cookies",
      "Información sobre el uso de cookies en la web de Lucas Domínguez Studio.",
      "/cookies",
    ),
  component: Cookies,
});

function Cookies() {
  return (
    <LegalPage
      title="Política de cookies"
      intro="Corta y sencilla: esta web no usa cookies de analítica, publicidad ni seguimiento. Por eso no verás ningún aviso pidiéndote que las aceptes."
    >
      <LegalSection title="Qué son las cookies">
        <p>
          Las cookies son pequeños archivos que algunas webs guardan en tu navegador para recordar
          información sobre tu visita, como tus preferencias o tu actividad.
        </p>
      </LegalSection>

      <LegalSection title="Qué cookies usa esta web">
        <p>
          Ninguna. {O.brand} no instala cookies propias ni de terceros con fines analíticos,
          publicitarios o de personalización. Las fuentes tipográficas y las imágenes se sirven
          desde el propio servidor de la web, sin conectar con servicios externos de seguimiento.
        </p>
      </LegalSection>

      <LegalSection title="Servicios externos enlazados">
        <p>
          Si pulsas los enlaces a WhatsApp o Instagram, o envías el formulario de contacto, pasarás
          a servicios de terceros (Meta o FormSubmit) que pueden usar sus propias cookies. Puedes
          consultar sus políticas en sus respectivas webs.
        </p>
      </LegalSection>

      <LegalSection title="Cambios en esta política">
        <p>
          Si en el futuro la web incorpora cookies que requieran tu consentimiento, esta página se
          actualizará y se te pedirá permiso antes de instalarlas. Para cualquier duda, escribe a{" "}
          <a href={`mailto:${O.email}`}>{O.email}</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
