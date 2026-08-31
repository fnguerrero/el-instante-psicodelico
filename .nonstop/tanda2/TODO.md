# TODO — Duermevela, tanda 2 (el rediseño)

Estados: `[ ]` pendiente · `[~]` en curso · `[x]` hecho y verificado · `[!]` bloqueado

## Andamiaje

- [x] Adaptar `pruebaPartida()` al recorrido encadenado: que devuelva la secuencia de figuras y los indicios juntados · verif: correrlo y que devuelva 8 pasos con sus figuras
- [x] Hook `simularMuchas(n)` que corra n partidas y reporte variedad de recorridos y si la cama se coló antes del final · verif: 50 partidas, 0 camas tempranas
- [x] Hook para forzar acierto/error del instante sin depender del reloj del navegador · verif: forzar acierto suma indicio, forzar error no

## El guion nuevo

- [x] Reescribir `guion.js`: LUGARES con llegada, indicio y revela para las 14 figuras · verif: `auditar()` sin faltantes
- [x] Frases de accion para las 14 cartas, y El Mundo deja de llevar a la cama · verif: ninguna carta apunta a `cama`
- [x] Textos de regreso: que dice Bel cuando vuelve a un lugar donde ya estuvo · verif: forzar un recorrido con repeticion y ver que cambia el texto
- [x] Lugar de arranque que no delate el sueno · verif: la primera pantalla no menciona cama, dormir ni despertar
- [x] Finales por cantidad de indicios · verif: forzar cada rama y ver textos distintos

## El hilo del juego

- [x] Reescribir el hilo de `juego.js`: pasos encadenados en vez de lista de escenas · verif: partida completa de 8 pasos
- [x] La cama prohibida hasta el paso 8 y forzada en el 8 · verif: 50 partidas sin cama temprana y con cama final
- [x] Contador de indicios visible y su efecto en el final · verif: partidas con 0 y con muchos indicios dan finales distintos
- [x] El instante entrega el indicio solo si se acierta · verif: hook de acierto forzado

## Ajuste y cierre

- [x] Revisar dificultad del instante y dejarla anotada · verif: ventana medida en ms
- [x] Responsive: que el anillo del instante caiga bien en vertical · verif: medicion a 390x840
- [x] Build final y verificacion de los 8 criterios · verif: lista de SPEC.md
- [x] `INFORME.md` de la tanda 2 con desvios · verif: existe y cubre todo
