import { LEGAL_OWNER } from "@/lib/legal";

/**
 * Private client agreement (/acuerdo). The page is unlisted: it is not linked from the site,
 * not in the sitemap and carries noindex. Bump TERMS_VERSION and regenerate the PDF in
 * public/documentos whenever the wording below changes, so every acceptance points to the
 * exact text the client read.
 */
export const TERMS_VERSION = "1.0";
export const TERMS_DATE = "5 de noviembre de 2026";
export const TERMS_PDF = "/documentos/condiciones-generales-v1-0.pdf";
export const ACUERDO_PATH = "/acuerdo";
/** Public domain used in the links the client receives by email. */
export const ACUERDO_SITE = "https://lucasdominguezstudio.es";

export type TermsItem = { lead?: string; text: string };
export type TermsBlock = string | TermsItem[];
export type TermsSection = { id: string; title: string; short: string; body: TermsBlock[] };

export const TERMS: TermsSection[] = [
  {
    id: "quien",
    title: "Quién soy y para qué sirven",
    short: "Quién trabaja contigo y para qué sirve este documento.",
    body: [
      `Soy ${LEGAL_OWNER.name}, diseñador de imagen de marca, y trabajo como ${LEGAL_OWNER.brand} desde ${LEGAL_OWNER.location}. NIE ${LEGAL_OWNER.taxId}. Contacto: ${LEGAL_OWNER.email} · ${LEGAL_OWNER.phone}.`,
      "Estas condiciones explican cómo trabajamos juntos: cómo se contrata, cómo se paga, qué recibes y qué pasa si algo cambia. Se aplican a todos mis servicios de diseño (marca, piezas gráficas, contenido, web y asesoría) junto con el presupuesto que hayas aceptado.",
    ],
  },
  {
    id: "contratar",
    title: "Cómo se contrata",
    short: "Aceptas aquí con la referencia de tu presupuesto. Lo firmado manda.",
    body: [
      [
        {
          lead: "Presupuesto.",
          text: "Te envío un presupuesto con lo que incluye, el precio, la forma de pago y el plazo. Tiene una referencia que indicas al aceptar.",
        },
        {
          lead: "Aceptación.",
          text: "El encargo queda contratado cuando aceptas estas condiciones en esta página indicando esa referencia, o cuando firmas el presupuesto o el contrato.",
        },
        {
          lead: "Orden.",
          text: "Si algo del presupuesto o de un acuerdo firmado no coincide con estas condiciones, manda lo firmado para ese encargo.",
        },
        {
          lead: "Condiciones especiales.",
          text: "Descuentos, formas de pago distintas o cualquier excepción solo valen si constan por escrito.",
        },
      ],
    ],
  },
  {
    id: "pagos",
    title: "Precio y pagos",
    short: "Proyecto: 50 % al empezar y 50 % a la entrega. Mensual: del 1 al 5, sin permanencia.",
    body: [
      [
        {
          lead: "Precio.",
          text: "El que figura en el presupuesto aceptado, con los impuestos que correspondan.",
        },
        {
          lead: "Proyectos.",
          text: "Se pagan en dos partes, 50 % al empezar y 50 % a la entrega, salvo que el presupuesto diga otra cosa. El trabajo empieza al recibir el primer pago.",
        },
        {
          lead: "Servicio mensual.",
          text: "Se paga por adelantado, del 1 al 5 de cada mes. No tiene permanencia.",
        },
        {
          lead: "Forma de pago.",
          text: "Transferencia bancaria o efectivo. Todo pago en efectivo se entrega con recibo firmado.",
        },
        {
          lead: "Retrasos.",
          text: "Con más de 7 días de retraso puedo pausar el trabajo hasta que se regularice. Con más de 30 días puedo terminar el encargo y reclamar lo pendiente.",
        },
        {
          lead: "Trabajo extra.",
          text: "Lo que no esté en el presupuesto se presupuesta por escrito antes de hacerlo.",
        },
      ],
    ],
  },
  {
    id: "plazos",
    title: "Plazos",
    short: "El plazo empieza con el primer pago y avanza al ritmo de tus respuestas.",
    body: [
      "El plazo de cada encargo es el del presupuesto y empieza con el primer pago. Depende de que me llegue a tiempo el material, los accesos y tus aprobaciones: si una respuesta se retrasa, el plazo se amplía el mismo tiempo.",
    ],
  },
  {
    id: "cambios",
    title: "Cambios y aprobaciones",
    short: "Cada pieza incluye dos rondas de cambios.",
    body: [
      "Cada pieza incluye dos rondas de cambios. Los cambios adicionales, o los que modifiquen algo ya aprobado, se presupuestan aparte. Una pieza queda aprobada cuando me lo dices por escrito (correo o WhatsApp) o cuando la publicas o la usas.",
    ],
  },
  {
    id: "material",
    title: "Tu material",
    short: "Tú aportas el material y tienes permiso para usarlo.",
    body: [
      [
        {
          text: "Me facilitas las fotos, vídeos, textos, logos y datos que necesite el trabajo, y garantizas que tienes derecho a usarlos.",
        },
        {
          text: "Si en ese material aparecen otras personas, garantizas que tienes su autorización de imagen.",
        },
        {
          text: "Eres responsable de lo que dicen tus mensajes, sobre todo de cualquier afirmación sobre salud, tratamientos o resultados. Puedo negarme a preparar contenido que considere engañoso o contrario a la ley.",
        },
      ],
    ],
  },
  {
    id: "entrega",
    title: "Entrega y propiedad intelectual",
    short: "Pagado el total, los diseños finales son tuyos.",
    body: [
      [
        {
          lead: "Qué recibes.",
          text: "Lo indicado en el presupuesto: por ejemplo, presentación final, manual de marca y archivos finales en los formatos de uso. Se entregan por enlace de descarga.",
        },
        {
          lead: "Cuándo.",
          text: "Puedes ver los diseños durante el trabajo para aprobarlos. Los archivos finales y editables se entregan cuando el encargo está pagado del todo.",
        },
        {
          lead: "Tus derechos.",
          text: "Una vez pagado el total, te cedo en exclusiva los derechos de explotación de los diseños finales aprobados (reproducción, distribución, comunicación pública y transformación), en cualquier soporte y formato, para todo el mundo y por el máximo plazo que permite la ley.",
        },
        {
          lead: "Lo que no se cede.",
          text: "Las propuestas y bocetos no elegidos, y mis métodos, plantillas internas y herramientas. Conservo la autoría del trabajo, como marca la ley.",
        },
        {
          lead: "Recursos de terceros.",
          text: "Tipografías, imágenes de bancos y otros recursos se usan según su licencia. Si alguno es de pago, te aviso antes y lo pagas tú.",
        },
        {
          lead: "Portfolio.",
          text: "Solo muestro tu proyecto en mi web o redes si me das permiso por escrito.",
        },
        {
          lead: "Copias.",
          text: "Guardo una copia de tus archivos 12 meses después de la entrega para poder reenviártelos. Te recomiendo guardar la tuya.",
        },
      ],
    ],
  },
  {
    id: "accesos",
    title: "Cuentas, accesos y colaboradores",
    short: "Tus cuentas siguen siendo tuyas. Accesos con roles, sin compartir contraseñas.",
    body: [
      "Tus cuentas de redes, tu web y tus plataformas son tuyas. Si necesito acceso, mejor con roles (por ejemplo, Meta Business Suite) que con contraseñas compartidas. Al terminar, retiras los accesos y dejo de usarlos.",
      "Si contratas publicar y contestar en redes, puedo trabajar con una community manager a la que coordino y de cuyo trabajo respondo. Cuando eso supone tratar datos de tus clientes, firmamos el encargo de tratamiento que exige el RGPD.",
    ],
  },
  {
    id: "confidencialidad",
    title: "Confidencialidad",
    short: "Lo que sepamos del negocio del otro queda entre los dos.",
    body: [
      "Los dos guardamos en secreto la información no pública que conozcamos por este trabajo (precios, clientes, estrategia y datos del negocio) durante el encargo y dos años después.",
    ],
  },
  {
    id: "baja",
    title: "Duración, baja y cancelación",
    short: "El mensual se da de baja avisando 15 días antes.",
    body: [
      [
        {
          lead: "Proyectos.",
          text: "Si cancelas una vez empezado, el primer pago no se devuelve y se paga el trabajo hecho hasta ese día. Si cancelo yo sin causa, te devuelvo lo cobrado por la parte no hecha.",
        },
        {
          lead: "Servicio mensual.",
          text: "Cualquiera de los dos puede darlo de baja avisando 15 días antes del siguiente pago. Las piezas no usadas en un mes no pasan al siguiente ni se devuelven.",
        },
      ],
    ],
  },
  {
    id: "responsabilidad",
    title: "Resultados y responsabilidad",
    short: "Trabajo profesional y transparente; no se prometen ventas ni seguidores.",
    body: [
      "Me comprometo a hacer un trabajo profesional y a mantenerte informado. No puedo garantizar resultados comerciales, como un número de clientes, ventas o seguidores. Mi responsabilidad por un encargo se limita a lo cobrado por él en los tres meses anteriores al hecho que la cause, salvo dolo o culpa grave.",
      "Ninguno de los dos responde de retrasos por causas fuera de su control, como enfermedad o caídas de plataformas. Avisamos en cuanto lo sepamos y reprogramamos.",
    ],
  },
  {
    id: "consumidores",
    title: "Si contratas como particular",
    short: "Si contratas como particular, tienes 14 días para desistir.",
    body: [
      "Estas condiciones están pensadas para negocios y profesionales. Si contratas como consumidor, mantienes todos los derechos que te da la ley, incluido desistir en 14 días naturales desde la aceptación sin dar motivos. Si me pides empezar antes de que pase ese plazo, pagarás la parte del trabajo ya hecha si después desistes.",
    ],
  },
  {
    id: "ley",
    title: "Comunicaciones, cambios y ley aplicable",
    short: "Ley española y juzgados de Málaga.",
    body: [
      "Nos comunicamos por correo o WhatsApp, de lunes a viernes. Si actualizo estas condiciones, la nueva versión solo se aplica a encargos que se acepten después; la que aceptaste sigue valiendo para tu encargo.",
      "Se rigen por la ley española. Ante cualquier desacuerdo intentaremos primero llegar a un acuerdo; si no, los juzgados de Málaga, salvo que contrates como consumidor, en cuyo caso serán los de tu domicilio.",
    ],
  },
];

/** Short privacy notice shown next to the form (full text lives at /privacidad). */
export const ACUERDO_PRIVACY: TermsItem[] = [
  {
    lead: "Responsable.",
    text: `${LEGAL_OWNER.name} (${LEGAL_OWNER.brand}), ${LEGAL_OWNER.email}.`,
  },
  {
    lead: "Para qué.",
    text: "Registrar que aceptas estas condiciones, enviarte una copia a tu correo, gestionar el encargo y facturarlo.",
  },
  {
    lead: "Base legal.",
    text: "La ejecución del contrato y el cumplimiento de obligaciones fiscales. Las novedades del estudio, solo si marcas la casilla opcional.",
  },
  {
    lead: "Quién interviene.",
    text: "Resend envía los correos desde mi web, Vercel la aloja y Google (Gmail) es mi correo. No vendo ni cedo tus datos.",
  },
  {
    lead: "Justificante.",
    text: "Al firmar se guardan la fecha y la hora, la versión de las condiciones, tu dirección IP y tu navegador.",
  },
  {
    lead: "Cuánto tiempo.",
    text: "Mientras dure el encargo y después lo que exija la ley (en general, hasta 6 años).",
  },
  {
    lead: "Tus derechos.",
    text: `Acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a ${LEGAL_OWNER.email}. Puedes reclamar ante la AEPD (aepd.es).`,
  },
];

export function madridTimestamp(date = new Date()) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "long",
    timeStyle: "medium",
    timeZone: "Europe/Madrid",
  }).format(date);
}
