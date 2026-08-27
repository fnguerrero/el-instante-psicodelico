# Informe — Duermevela

## Qué se construyó

Un juego de tarot onírico como regalo para Bel. Bel se duerme y sueña; en el
sueño las cosas muestran lo que son cuando ella las mira con la carta justa.
Jugás un arcano y la escena se transforma delante tuyo: las piezas de lo que
había se despegan, vuelan brillando, y se rearman en otra cosa.

El motor de transformación y cuatro escenas ya existían al empezar este
trabajo. Esta tanda completó las tres cosas que faltaban: **sonido**, **ocho
escenas** y **Bel adentro del sueño** en vez de espectadora de costado.

### Cómo correrlo

- **Para jugar:** abrir `dist/duermevela.html`. Es un archivo único, se abre
  solo, sin servidor ni instalación. Anda igual en celular.
- **Para desarrollar:** `py -3 tools/servidor.py 8139` y entrar a
  `http://localhost:8139/index.html`.
- **Para empaquetar:** `py -3 tools/build.py index.html dist/duermevela.html`.

### Cómo se juega

Mazo de 14 arcanos. En cada escena te reparte 3 y jugás una: esa carta
transforma lo que tenés delante. **La carta se gasta y no vuelve**, así que la
mano de la escena ocho es la que dejaron tus decisiones anteriores. Con 8
escenas y 14 cartas sobran 6: eso mantiene la elección viva hasta el final y
hace que dos partidas no sean iguales.

La Estrella es la carta del don: la única sin figura propia. Revela lo que esa
escena era en realidad, distinto en cada una.

## Verificación

Contra los 8 criterios de aceptación de SPEC.md, corridos sobre el bundle:

| # | Criterio | Resultado |
|---|---|---|
| 1 | Partida completa sin errores | 6 partidas al azar: 8/8 escenas, cierre, 0 errores, 0 cartas repetidas |
| 2 | Escenas con figura de entrada y revelada existentes | 8 escenas, 0 figuras faltantes |
| 3 | Toda carta produce transformación en toda escena | 14 × 8 = 112 combinaciones, 0 sin figura |
| 4 | Ningún texto `undefined` | 112 combinaciones, 0 textos faltantes |
| 5 | Audio audible al jugar y silenciable | Sin contexto antes del gesto; `running` con 3 voces después; 24 osciladores al transformar; silencia (0.58 → 0.12) y vuelve |
| 6 | Terrestres apoyan, aéreas vuelan | 14 figuras: 10 apoyan exacto (764 = 764), 4 despegadas, 0 mal |
| 7 | Táctil y responsive a 390×840 | Toque juega la carta (mazo 14 → 13) con `preventDefault`; 0 elementos fuera de pantalla, sin scroll horizontal, sin colisiones |
| 8 | Bundle autocontenido | 0 scripts sin incrustar, 0 referencias externas salvo Google Fonts |

El andamiaje que hizo posible verificar todo esto son tres hooks que se
construyeron primero, antes de tocar el contenido: `pruebaPartida()` juega una
partida entera a ritmo ×60 y reporta el recorrido; `auditar()` recorre las 112
combinaciones sin dibujar; `verificarBases()` mide las 14 figuras contra el
piso. Sin ellos la verificación se habría degradado a "lo miré y parecía andar".

## Decisiones tomadas por criterio propio

1. **Ocho escenas, no más.** Con la transformación de ~2,5 s más la lectura da
   entre 12 y 15 minutos, que es la duración que se había pedido para el juego.
2. **Mazo de 14.** Que sobren 6 cartas es lo que hace que elegir siga pesando
   en la última escena.
3. **El sonido arranca apagado, con botón.** Los navegadores lo bloquean hasta
   que hay un gesto, y un juego que se abre sonando sin aviso es hostil.
4. **La madre aparece solo como presencia amable** — luz prendida en las
   ventanas, alguien que espera sin apuro. Nunca nombrada, nunca asociada a
   pérdida. Es un pedido explícito y se respetó al pie.
5. **Bel no es controlable.** Se resolvió "meterla adentro" con tres cosas:
   camina hacia la figura al entrar, la mira (la cabeza gira sobre el cuello), y
   la transformación la empuja y la ilumina. Hacerla controlable habría
   convertido un juego de cartas en otra cosa.
6. **Todo sintetizado.** El audio son osciladores y ruido filtrado, con una
   reverb hecha de un impulso generado en código. Cero archivos, igual que el
   dibujo. Es lo que permite que el juego sea un HTML suelto.

## Desvíos respecto de la SPEC

Hubo tres, todos por trabajo que apareció en el camino:

1. **Se agregaron dos hooks que no estaban planeados.** `instante()` ganó
   control del reloj (`t`) y del estado de Bel (`empuje`, `asombro`), y se
   sumó `verificarBases()`. Motivo: varias figuras se mueven con el tiempo (el
   haz del faro barre, las agujas giran) y sin fijar el reloj no había forma de
   capturar el instante que importaba; y el criterio 6 no era verificable a ojo
   sobre 14 figuras.

2. **La composición se rehizo para pantalla vertical**, que no estaba en el
   TODO. En celular el ancho es lo escaso: con la fórmula de escritorio la
   figura quedaba diminuta y dos tercios de la pantalla eran cielo vacío. En
   vertical el piso sube, la figura se mide contra el ancho y se corre a la
   derecha para dejarle sitio a Bel.

3. **Bel se agrandó y su tamaño pasó a depender de la pantalla.** Estaba fija
   en 176 px, que sobre una pantalla alta la dejaba del tamaño de un ícono —
   justamente el problema que este trabajo venía a resolver. Ahora mide una
   fracción de la altura.

## Bugs encontrados y corregidos

Tres reales, todos destapados por el andamiaje y no por mirar la pantalla:

- **Una carta gastada se podía volver a jugar.** La clase `.fuera` bloquea el
  mouse, pero eso es CSS: no frena un click programático. Se agregó la guarda
  real contra el mazo en `jugar()`.
- **El haz del faro no se veía.** El gradiente terminaba en
  `alcance·sin(ang·.35)`, prácticamente el origen, así que el haz nacía y moría
  en el mismo punto. Reescrito a tres capas concéntricas.
- **El fogonazo de la carta lavaba la escena entera.** Radio de pantalla
  completa con alpha .24; la montaña rusa perdía su color durante la mutación.
  Concentrado en la figura.

Hubo además **una falsa alarma que vale anotar**: las cartas parecían quedarse
clavadas a mitad de la animación de entrada. La causa no era el CSS ni el
timing — las transiciones CSS no avanzan mientras el panel del navegador está
oculto, igual que `requestAnimationFrame`. El primer "arreglo" (forzar reflow)
partía de una hipótesis falsa y llegó a empeorar la medición. La verificación
de layout ahora anula la transición y mide el estado final.

## Bloqueados

Ninguno. Los 27 ítems del TODO quedaron cerrados.

## Números

- **20 iteraciones** sobre un presupuesto de 40.
- 8 escenas · 14 cartas · 14 figuras con pintor propio · 6 ramas de cierre.
- 112 combinaciones carta × escena, todas con texto propio o declarado.
- `dist/duermevela.html`: 167 KB, un solo archivo.

## Lo que queda para otra vez

No son pendientes de este trabajo, son ideas que aparecieron:

- Los caballitos de la calesita se leen a la distancia pero de cerca son
  siluetas toscas.
- El haz del faro todavía deja ver el escalón entre sus tres capas.
- Las cartas invertidas del tarot no se usan: cada arcano tiene una sola
  lectura. Sería la forma natural de duplicar el contenido sin agregar figuras.
