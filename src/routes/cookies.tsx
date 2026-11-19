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
      intro="Corta y sencilla: esta web no usa cookies de analítica, publicidad ni seguimiento. Solo guarda una marca técnica en tu navegador, que no necesita tu permiso. Por eso no verás ningún aviso pidiéndote que aceptes cookies."
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

      <LegalSection title="Almacenamiento técnico">
        <p>
          La animación de entrada se muestra una sola vez por visita. Para recordarlo, la web guarda
          en tu navegador una marca llamada <code>ld-intro</code> en el almacenamiento de sesión
          (sessionStorage). No contiene datos personales, no se envía a ningún servidor ni a
          terceros y se borra sola al cerrar la pestaña o el navegador.
        </p>
        <p>
          Es un almacenamiento técnico, necesario para mostrar la web como la has pedido, por lo que
          la ley no exige pedir tu consentimiento (artículo 22.2 de la LSSI-CE). Si lo borras o tu
          navegador no lo permite, la web funciona igual: solo verás de nuevo la animación.
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
