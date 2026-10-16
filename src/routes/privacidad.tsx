import { createFileRoute } from "@tanstack/react-router";

import { LegalPage, LegalSection } from "@/components/legal-page";
import { LEGAL_OWNER as O, legalHead } from "@/lib/legal";

export const Route = createFileRoute("/privacidad")({
  head: () =>
    legalHead(
      "Política de privacidad",
      "Cómo trata Lucas Domínguez Studio los datos personales que recibe a través de su web.",
      "/privacidad",
    ),
  component: Privacidad,
});

function Privacidad() {
  return (
    <LegalPage
      title="Política de privacidad"
      intro="Aquí te explico qué datos recojo cuando me escribes, para qué los uso y qué derechos tienes, conforme al Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD)."
    >
      <LegalSection title="Responsable del tratamiento">
        <ul>
          <li>
            <strong>Responsable:</strong> {O.name} ({O.brand})
          </li>
          <li>
            <strong>NIE:</strong> {O.taxId}
          </li>
          <li>
            <strong>Domicilio:</strong> {O.location}
          </li>
          <li>
            <strong>Contacto:</strong> <a href={`mailto:${O.email}`}>{O.email}</a>
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Qué datos recojo">
        <p>
          Solo los que tú me facilitas en el formulario de contacto o al escribirme directamente: tu
          nombre, tu correo electrónico, el mensaje y, si quieres añadirlos, el tipo de negocio y lo
          que quieres conseguir. No pidas ni envíes datos especialmente sensibles: no los necesito
          para responderte.
        </p>
        <p>
          Esta web no usa herramientas de analítica ni publicidad, y no crea perfiles de las
          personas que la visitan.
        </p>
      </LegalSection>

      <LegalSection title="Para qué los uso y con qué base legal">
        <ul>
          <li>
            <strong>Responder a tu mensaje y preparar un presupuesto.</strong> La base legal es tu
            consentimiento al enviar el formulario y la aplicación de medidas precontractuales a
            petición tuya.
          </li>
          <li>
            <strong>Gestionar el encargo si llegamos a trabajar juntos</strong>, incluida la
            facturación. La base legal es la ejecución del contrato y el cumplimiento de
            obligaciones legales.
          </li>
        </ul>
        <p>No usaré tus datos para enviarte publicidad sin tu permiso.</p>
      </LegalSection>

      <LegalSection title="Cuánto tiempo los guardo">
        <p>
          Si no llegamos a trabajar juntos, conservo tus mensajes un máximo de un año y después los
          elimino. Si hay encargo, conservo los datos mientras dure la relación y, después, el
          tiempo que exijan las obligaciones fiscales y legales.
        </p>
      </LegalSection>

      <LegalSection title="Quién más interviene">
        <p>
          No vendo ni cedo tus datos a nadie. Para que la web funcione intervienen estos
          proveedores, que solo tratan los datos necesarios para prestar su servicio:
        </p>
        <ul>
          <li>
            <strong>FormSubmit</strong> (formsubmit.co): recibe el formulario y lo reenvía a mi
            correo.
          </li>
          <li>
            <strong>Google</strong> (Gmail): es el servicio de correo donde recibo y respondo los
            mensajes.
          </li>
          <li>
            <strong>Vercel Inc.</strong>: aloja la web y, como cualquier servidor, registra datos
            técnicos de la conexión, como la dirección IP, por motivos de seguridad.
          </li>
        </ul>
        <p>
          Algunos de estos proveedores pueden tratar datos fuera del Espacio Económico Europeo. En
          esos casos lo hacen con las garantías que prevé el RGPD, como el Marco de Privacidad de
          Datos UE-EE. UU. o las cláusulas contractuales tipo de la Comisión Europea.
        </p>
        <p>
          Si me escribes por WhatsApp o Instagram, esa conversación se rige además por la política
          de privacidad de Meta.
        </p>
      </LegalSection>

      <LegalSection title="Tus derechos">
        <p>
          Puedes pedirme en cualquier momento acceder a tus datos, rectificarlos, suprimirlos,
          oponerte a su tratamiento, limitarlo o solicitar su portabilidad. También puedes retirar
          tu consentimiento. Basta con escribir a <a href={`mailto:${O.email}`}>{O.email}</a>{" "}
          indicando qué derecho quieres ejercer.
        </p>
        <p>
          Si consideras que no he tratado bien tus datos, puedes presentar una reclamación ante la
          Agencia Española de Protección de Datos (
          <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">
            aepd.es
          </a>
          ).
        </p>
      </LegalSection>
    </LegalPage>
  );
}
