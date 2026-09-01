# SPEC — tanda 5: 20 mejoras a la app

## Objetivo

Veinte mejoras concretas, elegidas por lo que un jugador real sufre y no por lo
que queda lindo en una lista. La tanda anterior terminó con los ocho criterios
en verde y el juego se veía negro en pantalla: ese hecho ordena las
prioridades de esta.

## Alcance

**Entra**: la infraestructura de verificación (poder correr el juego de verdad),
la robustez ante fallos, el comportamiento en pantallas raras, lo que hace falta
para compartir el link, la comodidad de juego y el rendimiento en equipos
flojos.

**No entra**: el guion, los arcanos, la mecánica ni el aspecto psicodélico — eso
quedó cerrado en la tanda 4. Tampoco se toca `ElInstante-original` ni
`ElInstante-v3`, que son de otras sesiones.

## Stack y decisiones

Sin cambios: HTML + JS + Canvas 2D, cero dependencias, cero archivos externos.

## Supuestos

Decisiones tomadas solo, sin preguntar:

1. **La mejora número uno es poder verificar.** El bug del juego negro pasó
   porque ninguna prueba corría el bucle real: con el panel oculto
   `requestAnimationFrame` da cero cuadros. Hasta que eso no se pueda probar,
   cualquier otra mejora se apoya en el aire.
2. **Una partida a medias se guarda y se ofrece seguir.** Bel va a jugar esto
   en el celular; que una llamada entrante le borre siete pasos es el peor
   final posible. Se guarda, y al volver se le pregunta si sigue o empieza de
   nuevo — nunca se restaura sin avisar.
3. **La imagen para compartir se genera del propio juego**, no se dibuja aparte:
   si el link se comparte, tiene que mostrar lo que la persona va a ver.
4. **Nada de dependencias nuevas ni archivos externos.** El juego sigue siendo
   un archivo suelto que anda sin servidor.
5. **Ninguna mejora puede bajar el brillo por debajo del criterio 9 de la tanda
   anterior** ni subir el cuadro por encima de los 16,7 ms.

## Criterios de aceptación

1. Las 20 mejoras implementadas y anotadas en la bitácora.
2. Se puede correr una partida completa **con el bucle real** en una prueba
   automática, sin depender de `requestAnimationFrame`.
3. La batería incluye el chequeo de visibilidad y lo pasa en los 13 lugares.
4. El layout entra sin desbordes en seis tamaños, medidos redimensionando de
   verdad, incluidos 320×568 y 1600×500.
5. Una excepción en cualquier capa o en el bucle deja un aviso legible en
   pantalla, nunca un cuadro negro mudo.
6. La partida en curso sobrevive a una recarga y se ofrece continuarla.
7. `verificarBases` / `verificarDibujo` / `auditar` en verde y cero errores de
   consola en una partida completa.
8. El cuadro completo se mantiene bajo 16,7 ms a intensidad normal.
9. El link compartido muestra título, descripción e imagen.

## Presupuesto

30 iteraciones.
