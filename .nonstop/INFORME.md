# INFORME — tanda 5: 20 mejoras a la app

## Qué se construyó

Veinte mejoras elegidas por lo que un jugador real sufre. El hecho que ordenó
las prioridades: la tanda anterior terminó con ocho criterios en verde y el
juego se veía negro en pantalla.

### Cómo correrlo

```
py -3 tools/servidor.py 8144
```

o `dist/el-instante-psicodelico.html`, que es un archivo suelto sin servidor.

**Teclas**: `1` `2` `3` juegan la carta, la barra espaciadora acierta el
instante, `R` reinicia. El botón junto al de sonido cicla la intensidad.

## Verificación

| Criterio | Resultado |
|---|---|
| 1 · 20 mejoras implementadas | 21 de 21 ítems, ninguno bloqueado |
| 2 · Partida completa con el bucle real | 200 de 200 cuadros a mano; partida de 8 pasos con cierre |
| 3 · Visibilidad en los 13 lugares | ok · peor 72,4 · promedio 79,6 |
| 4 · Layout sin desbordes | ok en 1280x800, 1600x500, 1224x522, 1366x768, 375x812 y 320x568 |
| 5 · Una excepción no deja cuadro negro | sigue dibujando tras el error |
| 6 · La partida sobrevive a una recarga | repuso paso 5, faro y 3 indicios |
| 7 · Bases, dibujo, auditoría y consola | los tres en verde, 0 errores |
| 8 · Bajo 16,7 ms por cuadro | **1,435 ms** |
| 9 · El link compartido muestra algo | description, og, twitter, theme-color y manifest |

## Decisiones tomadas solo

**La mejora número uno fue poder verificar.** El juego pide sus cuadros por
`pedirCuadro()` en vez de llamar a `requestAnimationFrame` directo. Parece un
rodeo y es lo que permite probarlo: con el panel oculto rAF entrega **cero**
cuadros — medido en la misma corrida — así que ninguna prueba podía ejecutar el
bucle real. Ese es exactamente el agujero por el que se coló el juego negro.

**Una partida a medias se guarda pero nunca se restaura sola.** Al volver
aparecen las dos opciones: quien quiere empezar de nuevo no tiene que pelear
contra un guardado. Una partida terminada se olvida; una de más de una semana ya
no se ofrece.

**El botón de entrar es sticky en vez de comprimir el texto.** A 320x568 la
portada no entra. Comprimir hasta que entre da tres reglas ilegibles; dejarlo
scrollear sin más deja a alguien mirando una pantalla sin saber que hay un botón
abajo.

**El auto-degradado no guarda el nivel.** Bajar la intensidad porque la máquina
no da no puede pisar lo que la persona eligió.

## Desvíos de la SPEC

**El ítem 03 cambió de forma.** Iba a ser una auditoría que recorriera seis
tamaños sola; una página no puede redimensionarse a sí misma, así que
`verificarLayout()` comprueba reglas válidas en cualquier tamaño y se corre
desde afuera en cada uno.

**El criterio de la portada cambió a mitad de camino.** Empezó como "no hay
desborde" y terminó como "el botón de entrar está a la vista", que es lo que
importa de verdad. El desborde con scroll es aceptable; la salida escondida no.

**El ítem 20 se resolvió en el bundle, no en el código.** Los comentarios son la
mitad del valor del proyecto y se quedan en el fuente; lo que viaja en el
archivo suelto no los necesita. 378 KB a 296, un 22% menos.

**Ningún ítem quedó bloqueado.**

## Lo que la verificación encontró

1. **`correrCuadros` se salteaba la envoltura del bucle**, así que la pausa no
   se activaba. El arreglo fue del código: si el gancho salta la envoltura, no
   está corriendo el bucle real.
2. **La guarda del build detectó el renombre del bucle** y se negó a emitir un
   bundle roto.
3. **Dos verificaciones dieron rojo por el entorno**: el panel colapsado dejaba
   la ventana en 0x0, el canvas no dibujaba y los 13 lugares devolvían el brillo
   del fondo. Ahora devuelven `ok:null` con el motivo. Un rojo por el entorno
   manda a arreglar código que estaba bien.

## Iteraciones

14 de un presupuesto de 30.
