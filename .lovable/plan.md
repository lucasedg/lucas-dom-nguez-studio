# LUCAS DOMÍNGUEZ STUDIO — sitio editorial

## Objetivo
Construir una web completa, en español, para un estudio creativo premium de Málaga. La experiencia será editorial, cinematográfica y humana, con negro y marfil como base y champagne únicamente como acento.

## Experiencia y contenido
- Crear una portada a pantalla completa con el manifiesto principal, dos enlaces claros y una entrada tipográfica contenida.
- Presentar el estudio y a Lucas con un retrato editorial temporal en blanco y negro, claramente estructurado para sustituirse más adelante.
- Convertir “Qué transformamos” en una secuencia visual guiada por el scroll, mostrando cada transición de idea a resultado.
- Mostrar los cinco servicios como una lista editorial interactiva, no como tarjetas.
- Construir una selección inmersiva de cinco proyectos con imágenes temporales de alta calidad y composiciones alternas.
- Añadir el proceso con una línea de progreso dorada sutil, seguido de la llamada final y un pie minimalista.
- Incluir navegación compacta y menú móvil intencional.

## Movimiento y adaptación
- Usar revelados por recorte, aparición de texto, parallax sutil y escalas suaves activadas al entrar en pantalla.
- Respetar `prefers-reduced-motion` y evitar animaciones innecesarias.
- Reorganizar tipografía, navegación, proyectos y secuencias para móvil, no solo reducir su tamaño.
- Optimizar imágenes y cargar de forma diferida los recursos fuera de la primera pantalla.

## Implementación
- Mantener todo el contenido público en `/`, con navegación interna por tratarse de una única historia continua.
- Definir colores y tipografías como tokens globales; cargar Cormorant Garamond y Manrope desde la cabecera.
- Crear componentes pequeños para navegación, revelados, servicios, proyectos y proceso.
- Mantener un único catálogo de datos de proyectos para que las imágenes temporales puedan sustituirse sin rediseñar la página.
- Añadir metadatos propios del estudio, accesibilidad semántica y un favicon tipográfico sencillo.
- Verificar el resultado en escritorio y móvil, además del estado de compilación y errores visibles.
