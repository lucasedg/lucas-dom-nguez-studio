# Lucas Domínguez Studio

Web editorial de un estudio creativo independiente en Málaga. React 19, TanStack Start, Vite, TypeScript y Tailwind CSS 4, con renderizado en servidor.

## Desarrollo

El repositorio conserva `bun.lock` como único archivo de bloqueo. Para instalar versiones reproducibles, utiliza `bun install --frozen-lockfile`. Con las dependencias instaladas:

```sh
npm run dev
npm run lint
npm run build
```

## Publicación en Vercel

Web pública: https://lucas-dominguez-studio.vercel.app/

Proyecto: `lucas-dominguez-studio`, equipo `lucas-projects-b5321fbd`. La primera publicación se realizó mediante Vercel Drop con una copia del código local el 3 de octubre de 2026. No está conectada a despliegues automáticos desde GitHub; los cambios locales requieren un nuevo despliegue.

El plugin `nitro()` de Vite prepara el renderizado en servidor para Vercel y detecta ese entorno automáticamente. Se puede verificar el paquete de despliegue localmente con:

```sh
NITRO_PRESET=vercel npm run build
```

El resultado queda en `.vercel/output`. Para publicar la versión local actual, utiliza la CLI de Vercel desde una sesión autenticada. Para despliegues desde GitHub, primero deben subirse los cambios locales al repositorio y después importarlo en Vercel como TanStack Start. Mantén `bun.lock` y la instalación reproducible con `bun install --frozen-lockfile`.

## Contenido del sitio

- `src/routes/index.tsx`: página, servicios, contacto y catálogo `projects`. Sustituye las imágenes y sus dimensiones en el catálogo para actualizar el portfolio.
- `src/assets/`: imágenes locales temporales, incluido el retrato.
- `src/styles.css`: colores, tipografía, responsive y movimiento.
- `src/routes/__root.tsx`: documento y fuentes.

El contacto prepara un correo dirigido a `hola@lucasdominguez.studio` en la aplicación del visitante. No utiliza un servicio de envío. Verifica esa dirección antes de publicar.

Las transiciones ligadas al scroll utilizan CSS cuando el navegador lo admite, con presentación estática como alternativa. Se respeta la preferencia de movimiento reducido. La navegación se mantiene en una sola página mediante anclas y los proyectos se amplían en un diálogo accesible.
