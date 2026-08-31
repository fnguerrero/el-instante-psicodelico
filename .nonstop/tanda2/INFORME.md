# Informe — Duermevela, tanda 2 (el rediseño)

> El informe de la tanda 1 (sonido, 8 escenas, Bel adentro) está en
> `.nonstop/tanda1/INFORME.md`.

## Qué se construyó

Nico probó el juego y dijo tres cosas: que las letras no se leían, que era
aburrido, y que poner una cama en la primera pantalla arruinaba la revelación
de que Bel estaba soñando. Las tres eran correctas.

Esta tanda las resolvió con un rediseño estructural, no con parches.

### 1. El lugar es la figura

Se eliminó la lista fija de escenas. Ahora estás en un lugar, jugás una carta,
el lugar se transforma en lo que la carta trae, y **esa cosa nueva es donde
estás**. El recorrido se ramifica solo: en 86 partidas simuladas no se repitió
ninguno.

Eso es lo que ataca el "es aburrido": antes elegir una carta cambiaba el dibujo
y el texto y nada más. Ahora elegir decide dónde vas a estar.

### 2. Los indicios

Cada uno de los 14 lugares esconde algo, y lo que esconde siempre falla de la
misma manera: la cosa se acomoda cuando Bel la mira. El agua que no la copia. El
árbol sin sombra. El haz del faro que frena un segundo de más al pasarle por
encima. Los pájaros que se sincronizan solo mientras los mira.

Se ven únicamente si le acertás al **instante**: mientras las piezas vuelan, un
anillo se contrae sobre la figura y hay que tocar cuando toca la marca. Errás y
la cosa se transforma igual, pero eso que escondía deja de existir.

Cuántos juntes decide el final: con ninguno se despierta sin nada, con muchos
entiende que el sueño lo hizo ella.

### 3. La cama al final

El sueño arranca en la montaña rusa de la feria de su infancia, que está entera
y no debería. La cama está prohibida por código hasta el paso 8, y ningún texto
anterior menciona cama, dormir, despertar ni sueño.

### Cómo correrlo

- **Para jugar:** abrir `dist/duermevela.html`. Un archivo, sin servidor.
- **Para desarrollar:** `py -3 tools/servidor.py 8139`, entrar a
  `http://localhost:8139/index.html`.
- **Para empaquetar:** `py -3 tools/build.py index.html dist/duermevela.html`.

## Verificación

| # | Criterio | Resultado |
|---|---|---|
| 1 | Partida de 8 pasos sin errores | 86 partidas simuladas, 0 sin cierre, 0 con errores |
| 2 | La cama nunca antes del paso 8 | 86 partidas, **0 camas tempranas** |
| 3 | 14 lugares y 14 cartas completos | 0 faltantes; las 196 combinaciones carta × lugar dan figura válida |
| 4 | El recorrido varía | 86 partidas, **86 recorridos distintos** (el criterio pedía 12 de 20) |
| 5 | Acertar suma indicio, errar no | 7,13 indicios promedio mirando siempre · **0** sin mirar nunca · 3,8 alternando |
| 6 | El final cambia según indicios | 4 ramas, todas alcanzables, títulos y textos distintos |
| 7 | 390×840 sin nada cortado | 0 elementos fuera, sin scroll horizontal, sin colisiones; el anillo entra completo |
| 8 | Bundle autocontenido | 0 scripts sin incrustar, 0 referencias externas salvo Google Fonts |

## Bugs encontrados y corregidos

Dos reales, y el segundo es el más grave de todo el proyecto:

**`llegar()` no limpiaba el estado de la transformación.** Si una mutación no
terminaba por lo que fuera, `J.u` quedaba en 0 y el juego se trababa para
siempre, porque nadie más lo devolvía a 1. Se destapó cuando la partida
simulada se quedó clavada en el paso 2.

**`Instante.dibujar` nunca estuvo en el `return` del módulo.** El juego le
tiraba una excepción a Nico en cada frame desde que se enganchó el instante. No
lo detectó ninguna prueba, y el motivo importa: con la pestaña oculta
`requestAnimationFrame` da **0 frames** (medido), así que las partidas
simuladas corren enteras sin dibujar una sola vez. Todo el andamiaje probaba la
lógica y nada probaba el dibujo.

El agujero se tapó con `verificarDibujo()`, que fuerza un cuadro de las 14
figuras y de 5 etapas de mutación con el instante activo, y con guardas nuevas
en el build.

## Decisiones tomadas por criterio propio

1. **Los textos se componen en vez de escribirse uno por uno.** Con 14 lugares y
   recorrido libre habría 196 combinaciones. En su lugar cada lugar tiene su
   llegada, su texto de regreso y su indicio, y cada carta su frase de acción:
   42 textos que cubren las 196 situaciones.
2. **El Mundo perdió la cama** y pasó a llevar a la calesita. Era la única carta
   que apuntaba a la cama y habría roto la regla del final. "Todo vuelve al
   lugar del que salió" sigue funcionando con una calesita.
3. **Volver a un lugar es legal y dice otra cosa.** Es un sueño: que se repita
   un lugar es verosímil, y da lugar a un texto propio ("los mismos caballitos
   en el mismo orden, ninguno se movió").
4. **Errar el instante no cuesta el turno**, solo el indicio. El juego sigue
   siendo contemplativo: la puntería agrega tensión, no castigo.
5. **La ventana del instante quedó en 400 ms** (175 ms para clavarla), simétrica
   hacia adelante y hacia atrás. Es un número y se ajusta en una línea si a Nico
   le resulta incómodo — no pude medirlo yo, ver más abajo.

## Desvíos respecto de la SPEC

Dos:

1. **Se agregaron dos hooks no planeados**: `verificarDibujo()` y
   `forzarMirada()`. El primero por el bug de `Instante.dibujar`, que dejó claro
   que verificar solo la lógica no alcanza. El segundo porque el resultado del
   instante depende del reloj del navegador y con la pestaña oculta no avanza:
   sin poder forzarlo, el criterio 5 no era verificable.

2. **El radio del anillo pasó a calcularse contra el espacio disponible.** No
   estaba en el TODO. En vertical el anillo nacía a 1 px del borde derecho.

## Lo que no pude verificar

**Si 400 ms es una ventana cómoda.** El panel del navegador de esta sesión no
compone frames, así que la lógica del instante quedó verificada entera pero el
timing real —lo único que decide si la mecánica se siente bien— solo lo puede
juzgar alguien jugando. Es un número en `js/instante.js` (`CLAVADO` y `BIEN`) y
se cambia en una línea.

## Bloqueados

Ninguno. Los 16 ítems del TODO quedaron cerrados.

## Números

- **32 iteraciones** en total sobre el proyecto (11 de esta tanda), presupuesto 40.
- 14 lugares · 14 cartas · 196 combinaciones · 4 finales.
- 86 partidas simuladas, 86 recorridos distintos.
- `dist/duermevela.html`: 170 KB, un solo archivo.
