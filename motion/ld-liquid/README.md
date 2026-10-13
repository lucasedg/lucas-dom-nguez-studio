# LD — metal líquido

Secuencia original de 7 segundos, 24 fps y 720 × 926 px. La superficie pasa de una gota dorada al contorno del archivo `src/assets/ld-transparent.png`, con iluminación de estudio y material metálico que termina en plata. Es una transformación procedural de superficies, no una simulación física de fluidos.

## Reproducir

1. En un entorno Python, instalar `numpy scipy scikit-image pillow imageio-ffmpeg`.
2. Ejecutar `python motion/ld-liquid/build_geometry.py`.
3. Ejecutar `/Applications/Blender.app/Contents/MacOS/Blender --background --python motion/ld-liquid/render.py`.
4. Ejecutar `python motion/ld-liquid/encode.py`.

La geometría y los fotogramas intermedios se guardan en `/tmp/ld-liquid-meshes` y `/tmp/ld-liquid-frames`. El MP4 final se guarda en `public/media/ld-liquid.mp4`. `ld-liquid.blend` conserva la cámara, iluminación, material y la malla del último fotograma; los scripts reconstruyen la secuencia completa.

La web reproduce el vídeo sin sonido, permite omitirlo y respeta movimiento reducido. Al terminar, hace un fundido al archivo original del logo y calcula su posición en la portada para realizar la transición. Los originales de producción no se envían a Vercel.
