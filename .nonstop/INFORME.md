# INFORME — tanda 4: 50 modificaciones psicodélicas

## Qué se construyó

"El instante psicodélico" dejó de ser el juego original con un filtro encima.
Ahora tiene **17 capas de efecto** organizadas en un pipeline propio, y todas
escalan con la misma tensión que el juego ya llevaba: el primer lugar se ve casi
sobrio y para el octavo el mundo es otra cosa. Esa progresión es lo único que
cuenta algo — un efecto que está siempre al mango no dice nada.

### Cómo correrlo

```
py -3 tools/servidor.py 8144
```

y abrir `http://localhost:8144/index.html`. O directamente
`dist/el-instante-psicodelico.html`, que es un archivo suelto sin servidor.

El botón junto al de sonido cicla la intensidad: **◔ suave · ◐ normal · ● extremo**.

### Las capas

**Color y luz** — tinte del cielo con mezcla `color` (se lleva el tono y respeta
las luces), plasma de tres gradientes que orbitan, rayos girando detrás de la
figura, contraluz en el horizonte, aura de la figura, halo de Bel, suelo con el
complementario, viñeta de color en vez de negra, anillo arcoíris al acertar,
inversión que barre en el clímax.

**Deformación** — dos pasadas, filas para el eje X y columnas para el Y, con
onda, remolino alrededor de la figura, barril, rotación, respiración y temblor
sumados en el mismo desplazamiento. Aparte: separación de canales rojo/cian,
caleidoscopio durante la transformación, ondas concéntricas al cambiar de lugar,
glitch por bloques y espejo intermitente.

**Partículas** — un solo sistema con arreglo fijo y reciclado: polvo del aire,
chispas al acertar, caída al fallar, anillo al cambiar de lugar, rastro de Bel y
lluvia en el clímax.

**Audio** — analizador colgado en paralelo del maestro para que la imagen lata
con la música, drone sub-grave que sube con la tensión y shimmer que solo
aparece en el clímax.

**Interfaz** — halo de color en las cartas, nácar animado en la carta final,
título y marcador con el degradado corriendo dentro de las letras, portada que
respira, y el control de intensidad.

## Verificación

| Criterio | Resultado |
|---|---|
| 1 · 50 modificaciones implementadas | 51 de 53 ítems `[x]`, ninguno bloqueado |
| 2 · `verificarBases` / `verificarDibujo` / `auditar` | los tres en `ok: true` |
| 3 · 14 figuras a intensidad extrema | 14/14 sin excepciones, 0 capas caídas por error |
| 4 · post-proceso bajo 6 ms | **0,54 ms** a normal, 0,79 a extremo, sobre 30 cuadros |
| 5 · reduced-motion sin movimiento | 13 de 17 capas se apagan; las 4 que quedan dan el mismo cuadro en t=3 y t=400 |
| 6 · nada por encima de 3 Hz | pedir 60 Hz devuelve 3,1 |
| 7 · el juego arranca y termina | partida completa: 8 pasos, cierre alcanzado, cama solo al final |
| 8 · cero errores en consola | 0 en la partida completa |

Cuadro completo con las 17 capas: **1,03 ms** sobre los 16,7 disponibles para 60
por segundo.

## Decisiones tomadas por criterio propio

**El color sale del lugar, no de un arcoíris genérico.** Cada lugar tiene su
color en el guion y de ahí se saca el tono raíz de la rueda, así la laguna se va
al azul y la calesita al naranja. Verificado: cuatro lugares dan cuatro tonos
distintos (60, 221, 265, 234) donde antes daban el mismo.

**Todas las deformaciones geométricas viven en una sola capa.** Encadenar capas
que deforman obliga a copiar el cuadro entero entre cada dos, y esas copias
cuestan más que todos los efectos juntos. En una pasada se lee una vez y se
escribe una vez, con los efectos sumados en el desplazamiento de cada tira.

**El tinte va después del cielo y antes de las figuras.** Al final, la calesita
roja y la casa amarilla terminaban del mismo color que el fondo y el lugar
dejaba de reconocerse.

**Reconocible gana a flashero, y costó aplicarlo.** La primera versión de los
rayos dejaba la laguna como un trapecio oscuro en medio de un abanico. Es el
supuesto 2 de la SPEC roto por mí mismo. Rayos más finos, con tope de opacidad y
apagándose hacia afuera.

**Dos reglas puestas como código y no como buena intención**: el tope de 3 Hz
vive en una sola función por la que pasan todos los pulsos de pantalla completa,
en vez de confiar en que cada capa se porte bien; y una capa que tira excepción
se apaga sola en vez de llevarse el cuadro puesto.

## Desvíos de la SPEC

**El ítem 25 (barril) cambió de forma.** Iba a ser una capa aparte; terminó
metido en el ancho de destino del mismo `drawImage` de la deformación, o sea
gratis y sin pasada extra.

**El ítem 41 (naipes iridiscentes) se hace por CSS y no por canvas.** Las
láminas se pintan una vez y se guardan como imagen: animarlas obligaría a
redibujar tres cartas enteras por cuadro. El compositor lo hace gratis. La carta
del final sí va por canvas, porque es una sola pantalla y ahí el gasto se paga.

**El ítem 52 (miniaturas del portfolio) se hizo a medias, a propósito.** Se
generaron las tres capturas del look final, pero **no se tocó `Portfolio/`**: esa
entrada es de la versión original, que está en medio de una discusión de nombres
y la lleva otra sesión. Meterle mano desde acá era exactamente lo que la regla de
"una carpeta, un dueño" busca evitar.

**No se agregaron ítems bloqueados.** Ninguno quedó en `[!]`.

## Lo que la verificación encontró y no se habría visto de otra forma

1. **El acierto emitía 26 chispas y sobrevivía una.** El reciclado elegía por
   vida restante absoluta, y como las chispas viven medio segundo contra los
   cinco del polvo, cada chispa nueva pisaba a la anterior. Ahora recicla por
   proporción de vida y nunca reusa una nacida en el mismo cuadro.
2. **`Audio.nivelGrave` en vez de `Audio2.nivelGrave`.** El módulo se llama
   `Audio2` justamente porque `Audio` es el constructor nativo del navegador.
   Escrito mal no fallaba: no hacía nada, que es peor porque parece andar.
3. **El presupuesto apagaba las capas que más dibujan.** El canvas encola
   comandos y de a ratos una capa paga el vaciado de todo lo anterior: `deformar`
   medía 96 ms cuando su costo real es 0,23. Ahora se descartan 20 muestras de
   calentamiento y los picos de más de 10× el promedio.
4. **El repintado de la carta final quedaba vivo para siempre.** Es un
   `setInterval`, no un timeout de la partida, y `frenarRelojes()` no lo
   alcanzaba.

**Cuatro veces la verificación falló y el error estaba en la prueba, no en el
código**: medir el total de partículas cuando el sistema está en su tope (las
ráfagas reciclan, el total no puede subir); registrar un evento y después saltar
el reloj cuatro segundos; contar cruces de la onda en los dos sentidos sumando
el borde del intervalo; y comparar el cuadro entero para juzgar reduced-motion
cuando el humo de la casa se anima por su cuenta. En los cuatro casos se revisó
la prueba antes de tocar el código. Dos veces más, un test se **salteó solo** y
daba verde sin haber probado nada: el de audio sin gesto del usuario y el de las
figuras con un nombre de módulo que no existía.

## Iteraciones

15 de un presupuesto de 40.
