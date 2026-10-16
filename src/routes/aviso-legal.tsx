import { createFileRoute } from "@tanstack/react-router";

import { LegalPage, LegalSection } from "@/components/legal-page";
import { LEGAL_OWNER as O, legalHead } from "@/lib/legal";

export const Route = createFileRoute("/aviso-legal")({
  head: () =>
    legalHead(
      "Aviso legal",
      "Datos del titular y condiciones de uso de la web de Lucas Domínguez Studio.",
      "/aviso-legal",
    ),
  component: AvisoLegal,
});

function AvisoLegal() {
  return (
    <LegalPage
      title="Aviso legal"
      intro="En cumplimiento de la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), estos son los datos de quien está detrás de esta web."
    >
      <LegalSection title="Titular de la web">
        <ul>
          <li>
            <strong>Titular:</strong> {O.name}, que actúa con el nombre comercial {O.brand}.
          </li>
          <li>
            <strong>NIE:</strong> {O.taxId}
          </li>
          <li>
            <strong>Domicilio:</strong> {O.location}
          </li>
          <li>
            <strong>Correo electrónico:</strong> <a href={`mailto:${O.email}`}>{O.email}</a>
          </li>
          <li>
            <strong>Teléfono / WhatsApp:</strong> {O.phone}
          </li>
          <li>
            <strong>Actividad:</strong> diseño gráfico, identidad de marca y comunicación visual.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Objeto y uso de la web">
        <p>
          Esta web presenta los servicios de diseño de {O.brand}, muestra proyectos realizados y
          ofrece vías de contacto para solicitar información o presupuesto. Al navegar por ella
          aceptas usarla de forma lícita y no realizar acciones que puedan dañarla o impedir su
          funcionamiento.
        </p>
        <p>
          Los precios que aparecen en la sección de servicios son orientativos, no incluyen IVA y no
          constituyen una oferta vinculante. Cada encargo se concreta por escrito antes de comenzar,
          con sus piezas, plazos y presupuesto.
        </p>
      </LegalSection>

      <LegalSection title="Propiedad intelectual">
        <p>
          Los diseños, textos, imágenes, logotipos y demás contenidos de esta web pertenecen a{" "}
          {O.name} o a sus respectivos clientes, y se muestran como parte del portfolio. No está
          permitido reproducirlos, distribuirlos ni modificarlos sin autorización expresa.
        </p>
        <p>
          Las marcas de los proyectos mostrados pertenecen a sus titulares. Su presencia en esta web
          no implica ninguna cesión de derechos.
        </p>
      </LegalSection>

      <LegalSection title="Enlaces externos">
        <p>
          La web incluye enlaces a servicios de terceros, como WhatsApp o Instagram. Al utilizarlos
          sales de esta web y se aplican las condiciones y políticas de privacidad de esos
          servicios, de las que {O.brand} no es responsable.
        </p>
      </LegalSection>

      <LegalSection title="Responsabilidad">
        <p>
          Se procura que la información de la web sea correcta y esté actualizada, pero no se
          garantiza la ausencia de errores ni la disponibilidad continua del sitio. {O.brand} no se
          hace responsable de los daños derivados de un uso indebido de la web.
        </p>
      </LegalSection>

      <LegalSection title="Legislación aplicable">
        <p>
          Este aviso legal se rige por la legislación española. Para cualquier controversia, las
          partes se someten a los juzgados y tribunales que correspondan conforme a la ley. Si eres
          consumidor, podrás acudir a los de tu domicilio.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
