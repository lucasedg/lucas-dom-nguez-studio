# Intro LD · composición HyperFrames

Fuente de la intro de la web (bola → onda de micro hexágonos → logo).

- `index.html`: composición (6,4 s, 1920×1080, 30 fps).
- `assets/hexwave.js` y `assets/ballmotion.js`: la onda hexagonal y la física de la bola. Son la misma lógica que usa la web en `src/lib/hexwave.ts` y `src/lib/ballmotion.ts`; si cambias una, cambia la otra.
- La web reproduce la misma línea de tiempo con CSS en `src/styles.css` (bloque "Entrance intro") y `BrandIntro` en `src/components/brand.tsx`.

Vista previa y render: `npx hyperframes preview` / `npx hyperframes render . -o renders/intro.mp4`.
