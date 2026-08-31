# TODO — Duermevela

Estados: `[ ]` pendiente · `[~]` en curso · `[x]` hecho y verificado · `[!]` bloqueado

## Andamiaje de verificación

- [x] Hook `window.pruebaPartida()` que juegue una partida entera acelerada y
      devuelva el recorrido, los errores y si llegó al cierre · verif: correrlo
      y que devuelva 8 escenas y cierre true
- [x] Hook `window.auditar()` que recorra todas las combinaciones carta/escena
      sin dibujar y reporte figuras faltantes y textos `undefined` · verif:
      correrlo y que devuelva 0 faltantes

## Figuras nuevas (para sostener 8 escenas)

- [x] Figura + pintor: calesita · verif: captura, apoya en el suelo
- [x] Figura + pintor: faro · verif: captura, apoya y el haz gira
- [x] Figura + pintor: laguna (espejo de agua) · verif: captura, refleja
- [x] Figura + pintor: barca · verif: captura, flota sobre la laguna
- [x] Figura + pintor: reloj · verif: captura, las agujas se mueven
- [x] Registrar bases de apoyo de las figuras nuevas · verif: captura de cada
      una mostrando contacto o vuelo correcto

## Mazo

- [x] Ampliar el mazo a 14 cartas con figura y lectura propias · verif:
      `auditar()` sin faltantes
- [x] Repartir sin repetir a lo largo de la partida y que la mano nunca quede
      vacía en la escena 8 · verif: `pruebaPartida()` 20 veces sin mano vacía

## Escenas

- [x] Escribir las 4 escenas nuevas con entrada y dichos por carta · verif:
      `auditar()` sin textos undefined
- [x] Reordenar el arco narrativo de las 8 escenas para que el descubrimiento
      del don progrese · verif: lectura completa del guion de corrido
- [x] Ampliar los cierres para cubrir los caminos nuevos · verif: forzar cada
      rama de cierre y ver que devuelve texto propio

## Bel adentro del sueño

- [x] Bel camina hacia la figura al entrar y se detiene a distancia de mirada ·
      verif: captura al inicio y al final del acercamiento
- [x] La cabeza de Bel sigue a la figura (mira lo que está pasando) · verif:
      captura con figura a izquierda y a derecha
- [x] La transformación la afecta: viento, luz que la baña, retroceso · verif:
      captura en el pico de la mutación
- [x] Bel reacciona distinto según el tono de la carta · verif: captura con
      carta de luz y con carta de sombra

## Sonido

- [x] Módulo `audio.js` con contexto, reverb y maestro silenciable · verif:
      nodos activos y `state === 'running'` tras el gesto
- [x] Colchón ambiente que evoluciona · verif: audible 10 s sin cortes
- [x] Sonido de transformación ligado al vuelo de las piezas · verif: se
      dispara al jugar y dura lo que la mutación
- [x] Sonido propio por tipo de carta · verif: cada carta produce nodos
      distintos
- [x] Interacción de cartas: hover y juego · verif: audible al pasar y clickear
- [x] Botón de silencio en pantalla, y arranca apagado · verif: click apaga y
      prende

## Presentación

- [x] Táctil: las cartas responden a touch sin retardo de 300 ms · verif:
      evento touch dispara la jugada
- [x] Responsive a 390×840: nada cortado, sin scroll horizontal · verif:
      resize_window y captura
- [x] Portada y cierre con el mismo cuidado tipográfico que el resto · verif:
      captura de las dos

## Cierre

- [x] Build final y verificación de los 8 criterios de aceptación · verif:
      correr la lista completa de SPEC.md
- [x] `INFORME.md` con desvíos y resultados · verif: existe y cubre todo
