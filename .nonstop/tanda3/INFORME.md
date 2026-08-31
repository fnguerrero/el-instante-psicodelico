# Informe — El instante, tanda 3: las 100 mejoras

> Tandas 1 y 2 en `.nonstop/tanda1/` y `.nonstop/tanda2/`. Bitácora continua.

## Qué se hizo

Nico pidió cien mejoras de pulido general. Se cerraron **las 100**, agrupadas en
32 lotes por tema y verificadas por lote. No se agregó ninguna mecánica: la
tanda levantó el piso de todo lo que ya existía.

**Cómo probarlo:** abrir `dist/el-instante.html`. Un archivo, sin servidor.

## Las 100, por grupo

**Bugs y robustez (1-14).** Todos los temporizadores pasan por un registro
cancelable — sin eso, reiniciar dejaba vivos los de la partida anterior y el
juego avanzaba dos veces por paso. Guard contra doble click. El toque ya no
atraviesa el cierre ni la carta final. El teclado no roba Enter cuando el foco
está en un control. Tope de 14 voces de audio con liberación real de nodos (el
grafo crecía toda la partida). El contexto de audio se retoma al volver a la
pestaña. DPR limitado en pantallas enormes; los naipes no se repintan si el
hueco no cambió.

**Claridad (15-28).** Es lo que Nico venía marcando tres veces. El objetivo
vivía en el código y no en la pantalla: ahora hay un marcador permanente
("Lo que no cierra", una bolita por paso), una guía de una sola vez pegada al
anillo en la primera jugada, avisos que dicen qué hacer y qué se ganó o perdió,
y un cierre que **lista lo que encontró**. Además la ventana del instante se
agranda tras tres fallos seguidos y lo dice: el juego no es de puntería, la
puntería es la excusa para que mirar tenga peso.

**Presentación (29-50).** Reflejo de la figura en el piso, niebla baja, sombra
bajo Bel, vineteado, halo por figura con su color, golpe de luz al completar la
mutación. La carta jugada sale hacia la figura y las otras dos caen. Pila del
mazo restante al costado — sin eso no había forma de saber que las cartas se
gastan, que es de lo que trata elegir. Título que respira, cierre que entra por
párrafos, resplandor detrás de la carta final.

**Naipes (51-64).** Grano de papel con semilla estable por carta, manchas,
desgaste del filete y registro imperfecto — un fantasma corrido, como una
impresión de tacos donde cada plancha caía un pelo desplazada. El Loco ganó un
perro reconocible y un hatillo de tela; El Mundo, guirnalda de hojas y cuatro
vivientes con silueta propia; La Rueda, criaturas que suben y bajan. Numeral y
cartela con relieve. Dorso con orla.

**Escena (65-76).** Durmientes y un vagón parado en la montaña rusa; sendero de
piedras en la casa; juncos a los costados de la laguna; rocas al pie del faro;
ventanas en la cúpula del platillo; mesa de luz con velador junto a la cama;
péndulo con vaivén propio en el reloj.

**Sonido (77-87).** Cada uno de los 14 lugares reafina el colchón al llegar, con
sus grados y su filtro. Tic del anillo que se agudiza al acercarse a la marca —
permite acertar sin mirar la pantalla. Acierto como acorde ascendente y error
como nota que cae, que antes eran dos gotas casi iguales. Roce de papel en el
volteo de la carta final. Control de volumen que aparece al acercarse al botón.

**Textos (88-94).** Auditoría automática de los 42 textos: largos, arranques
repetidos y muletillas. Encontró un texto con tres "que" apilados y el más largo
del platillo; los dos reescritos.

**Accesibilidad (95-100).** Foco visible sobre cualquier fondo, roles ARIA con
live regions, canvas oculto al lector de pantalla, partida completa solo con
teclado. `prefers-reduced-motion` **acorta** las transiciones en vez de
anularlas: lo que comunica algo tiene que seguir viéndose; lo que se apaga es lo
decorativo.

## Verificación

| Criterio | Resultado |
|---|---|
| 1 · 85 de 100 mejoras | **100 de 100** cerradas |
| 2 · Partida sin errores | Batería en verde; partida completa a cierre y carta final, 0 errores |
| 3 · Sin desbordes en 3 formatos | 390x760, 1395x920 y 1532x783: 0 elementos fuera, 0 colisiones, sin scroll horizontal |
| 4 · Verificación registrada | Los 18 asientos de bitácora (#51-#67) llevan su verificación |
| 5 · Bundle autónomo | `dist/el-instante.html`, 257 KB, se abre solo |
| 6 · Sin regresiones | La Muerte 0 de 250 repartos en la primera mano; 4 finales distintos; cama solo al final; auditar/verificarDibujo/verificarBases en verde |

## El bug que apareció en la verificación final

El cierre del juego quedaba **vacío** y el juego moría en la última pantalla.

Causa: al agregar el gesto de la carta elegida (mejora 42), usé un reemplazo de
texto que pisó **las dos** apariciones de `elMano.classList.add('fuera')` — la
de `jugar()` y la de `terminar()`, donde la variable `elCarta` no existe.
`terminar()` reventaba con `elCarta is not defined` justo después de ocultar el
marcador, así que el síntoma era "el juego llega a 8 de 8 y no pasa nada".

Arreglado, y el build ahora falla si esa referencia aparece más de una vez.

**Dos verificaciones mías estaban mal antes de encontrarlo**, y vale anotarlo:
una esperaba 2,8 s por ciclo cuando el ciclo real dura 7,6 s, y clickeaba cartas
viejas; la otra leía el resultado antes de que el cierre llegara. Las dos
"probaban" que algo fallaba sin decir qué. Reescritas para esperar a que la mano
vuelva de verdad en vez de asumir tiempos fijos.

## Tres correcciones posteriores, sobre reportes de Nico

Llegaron mientras se cerraba la tanda y se arreglaron en el momento:

1. **El aviso no se leia.** Caia encima de las cartas: texto claro sobre el
   crema del naipe. Relato y aviso pasaron a un mismo bloque apilado arriba, en
   el cielo, y el aviso gano fondo propio. Verificado a 804x910: aviso 174-206
   bajo el relato 72-155, sin pisar las cartas.

2. **"Eso ya no lo vas a ver" no se entendia.** Nico pregunto a que se referia y
   tenia razon: la frase hablaba de algo que el jugador nunca vio, asi que no se
   referia a nada. Ahora dice *"este lugar escondia algo y ya no vas a saber
   que"*, y los perdidos se cuentan y se informan en el cierre sin revelarlos.
   Verificado: fallar-acertar-fallar deja 1 indicio y 2 perdidos.

3. **Bel se teletransportaba.** En cada paso, `llegar()` la reposicionaba fuera
   de cuadro para que "entrara caminando", pero la figura se transforma delante
   de ella y no hay cambio de plano: se veia como un salto. Ahora entra una sola
   vez, al principio, y despues se acomoda caminando en la direccion que haga
   falta.

## Decisiones tomadas por criterio propio

1. **Las mejoras se agruparon de a 2-3.** Cien ítems de a uno no entran en 40
   iteraciones; se verificaron por lote afín.
2. **La dificultad afloja sola.** Tres fallos seguidos agrandan la ventana de
   399 a 699 ms y se avisa. Castigar la mala puntería dejaba afuera a quien el
   juego quiere adentro.
3. **`prefers-reduced-motion` no anula todo.** Acorta a 0,14 s y apaga solo lo
   decorativo (título que respira, botón que late). Anular las transiciones que
   comunican estado habría dejado el juego ilegible para quien las necesita.
4. **El tic del anillo es la pista principal.** Con él se puede acertar de oído,
   que es más accesible que depender de la vista fina.
5. **Semillas fijas en toda textura.** Papel, desgaste, juncos y rocas usan
   generador con semilla: sin eso, cada repintado los cambia y la imagen hierve.

## Desvíos respecto de la SPEC

Uno solo, y hacia arriba: la SPEC pedía **85 de 100** y se cerraron **las 100**.
No hubo mejoras descartadas ni bloqueadas.

## Bloqueados

Ninguno.

## Números

- **18 iteraciones** de esta tanda (#50-#67), presupuesto 40.
- 100 mejoras · 32 grupos · 1 bug serio encontrado y blindado.
- 14 lugares · 15 cartas (14 del mazo + el arcano XXII) · 14 figuras.
- `dist/el-instante.html`: 257 KB.
