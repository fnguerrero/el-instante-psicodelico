# Duermevela — tanda 2: el rediseño

> La tanda 1 (sonido, 8 escenas, Bel adentro) está cerrada y archivada en
> `.nonstop/tanda1/`. La bitácora es continua.

## Objetivo

Nico probó el juego y dijo tres cosas: que las letras no se leían, que el juego
era aburrido, y que poner una cama en la primera pantalla arruinaba la
revelación de que Bel estaba soñando. Las tres son correctas.

La legibilidad ya está arreglada. Esta tanda ataca las otras dos con un
rediseño estructural: el recorrido deja de ser una lista fija de escenas y pasa
a ser una cadena ramificada, hay un misterio que armar, y la cama no aparece
hasta la última pantalla.

## El rediseño, en tres piezas

1. **El lugar es la figura.** No hay escenas fijas. Estás en un lugar; jugás una
   carta; el lugar se transforma en lo que la carta trae; eso es tu nuevo lugar.
   El recorrido se ramifica solo, y dos partidas dejan de parecerse.

2. **Los indicios.** Cada lugar esconde algo. Se ve solo si le acertás al
   instante (la mecánica de timing que ya existe en `js/instante.js`). Los
   indicios son los pedazos de la verdad: que está soñando, y que el sueño lo
   está haciendo ella. Cuántos juntes decide el final.

3. **La cama al final.** El sueño arranca en un lugar cualquiera. La cama está
   prohibida hasta el último paso, donde aparece como revelación.

## Alcance

**Entra:**
- Reescritura de `guion.js`: de escenas fijas a lugares con llegada, indicio y
  revelación propia.
- Reescritura del hilo de `juego.js`: pasos encadenados en vez de lista.
- Finales según indicios juntados.
- Ajuste de la dificultad del instante si hace falta.

**No entra:**
- Figuras nuevas. Las 14 que hay alcanzan y sobran para un recorrido ramificado.
- Tocar el motor de transformación, los pintores, el audio ni Bel: andan.
- Publicar, deployar o commitear.

## Stack y decisiones

Igual que la tanda 1: HTML + JS + Canvas 2D, sin dependencias, empaquetado a un
HTML único por `tools/build.py`. Servidor de desarrollo en el puerto 8139.

## Supuestos

Decisiones tomadas por criterio propio:

1. **Ocho pasos por partida.** Es la misma duración que ya tenía y funcionaba;
   el problema era la falta de decisión, no el largo.
2. **Los textos se componen, no se escriben uno por uno.** Con 14 figuras y
   recorrido libre habría 196 combinaciones. En su lugar: cada figura tiene su
   texto de llegada y su indicio, cada carta su frase de acción, y lo que se lee
   es la frase de la carta seguida de la llegada del lugar. Da variedad real con
   42 textos en vez de 196.
3. **El Mundo pierde la cama.** Era la única carta que llevaba a la cama y eso
   rompería la regla de reservarla para el final. Pasa a llevar a la calesita,
   que sostiene igual su sentido ("todo vuelve al lugar del que salió").
4. **La Estrella sigue siendo la carta del don**, pero ahora revela lo que
   esconde *el lugar donde estás*, no lo que esconde una escena guionada. Cada
   figura declara su propia revelación.
5. **Volver a un lugar ya visitado es legal y dice otra cosa.** Es un sueño: que
   se repita un lugar es verosímil, y da lugar a un texto propio.
6. **Errar el instante no cuesta el turno.** Se pierde el indicio, no el paso.
   El juego sigue siendo contemplativo; la puntería agrega tensión, no castigo.

## Criterios de aceptación

1. Una partida completa recorre 8 pasos y llega al final sin errores en consola.
2. **La cama no aparece nunca antes del paso 8**, verificado sobre 50 partidas
   simuladas.
3. Las 14 figuras tienen texto de llegada, indicio y revelación; las 14 cartas
   tienen frase de acción. Cero `undefined`.
4. El recorrido varía entre partidas: 20 partidas al azar dan al menos 12
   secuencias de figuras distintas.
5. Acertar el instante suma un indicio y errar no, verificado sobre el contador.
6. El final cambia según la cantidad de indicios: las ramas devuelven textos
   distintos y todas son alcanzables.
7. Sigue andando a 390×840 sin nada cortado ni scroll horizontal.
8. `dist/duermevela.html` se abre solo y juega completo.

## Presupuesto

40 iteraciones.
