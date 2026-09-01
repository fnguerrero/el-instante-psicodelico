# SPEC — tanda 4: llevar la psicodelia al extremo

## Objetivo

Que "El instante psicodélico" merezca el nombre. Hoy tiene cinco efectos
enganchados a la tensión y se ve bien, pero es contenido: se lee como el juego
original con un filtro encima. La tanda apunta a que el mundo se vaya de verdad
— color, deformación, rastro, partículas y audio reactivo — sin perder lo que
hace que el juego funcione: que las figuras se reconozcan y que el instante se
pueda acertar.

50 modificaciones concretas.

## Alcance

**Entra**: todo lo visual y sonoro de la variante psicodélica. El pipeline de
post-proceso, la paleta, las partículas, el audio reactivo, los naipes, la
portada, el cierre, y los controles de intensidad y rendimiento.

**No entra**: cambiar el guion, los lugares, los arcanos ni la mecánica. La
ruta, los indicios, los cuatro finales y la carta a Bel quedan exactamente como
están. Tampoco entra tocar `ElInstante-original` ni `ElInstante-v3`: son de
otras sesiones.

## Stack y decisiones

Sigue igual: HTML + JS + Canvas 2D, cero dependencias, cero archivos de imagen
o audio. Todo dibujado o sintetizado en código.

Decisión estructural: `psicodelia.js` pasa de ser cinco funciones sueltas a un
**pipeline de capas** con presupuesto de tiempo. Cada efecto es una capa que
declara su costo y su umbral de tensión; el pipeline las corre en orden y apaga
las caras si el cuadro se pasa de presupuesto. Sin eso, 50 efectos encima del
mismo canvas terminan en una presentación de diapositivas.

## Supuestos

Decisiones tomadas por criterio propio, sin preguntar:

1. **La tensión sigue mandando.** Ningún efecto arranca a full: todos escalan
   con lo descubierto. El juego tiene que arrancar reconocible y terminar
   irreconocible, porque esa progresión es la única que cuenta algo.
2. **Reconocible gana a flashero.** Si un efecto hace que no se distinga qué
   figura hay delante, se baja hasta que se distinga. El juego se sigue
   jugando; si no se ve el instante, no hay juego.
3. **Intensidad configurable, con tres niveles** (suave / normal / extremo),
   guardada en localStorage. El default es normal.
4. **Con `prefers-reduced-motion` queda solo el color, quieto.** Ningún
   movimiento, ninguna partícula, ningún parpadeo. No es negociable.
5. **Nada de estroboscopio.** Ningún efecto puede producir destellos rápidos de
   pantalla completa: es la única forma en que un juego bonito manda a alguien
   al hospital. Los pulsos se limitan a 3 Hz y a cambios parciales de pantalla.
6. **Presupuesto de 6 ms por cuadro** para todo el post-proceso, sobre los 16,7
   disponibles. Lo que se pase, se apaga solo.

## Criterios de aceptación

Verificables, no opinables:

1. Las 50 modificaciones están implementadas y anotadas en la bitácora.
2. `verificarBases()`, `verificarDibujo()` y `auditar()` dan `ok: true`.
3. Las 14 figuras se dibujan sin excepciones a intensidad extrema.
4. El post-proceso completo se mantiene bajo 6 ms por cuadro a intensidad
   normal, medido sobre 30 cuadros.
5. Con `prefers-reduced-motion` no queda ningún efecto de movimiento activo.
6. Ningún efecto de pantalla completa cambia más rápido que 3 Hz.
7. El juego arranca y termina: se llega del primer lugar a la carta final.
8. Cero errores en consola en una partida completa.
9. **El juego tiene que VERSE.** Brillo medio de la franja de escena por encima
   de 40 sobre 255, y al menos 5% de píxeles claros, en los trece lugares con
   tensión 0 — o sea en el arranque, que es el caso peor.

   Este criterio se agregó DESPUÉS de romperlo. Los ocho anteriores estaban en
   verde y el juego se veía negro en pantalla: las pruebas comprobaban que cada
   capa CAMBIARA el cuadro, nunca que el cuadro fuera visible. Una batería de
   verificaciones puede estar entera en verde sobre algo que no se ve.

## Presupuesto

40 iteraciones. Las 50 modificaciones se agrupan de a 2-4 por iteración.
