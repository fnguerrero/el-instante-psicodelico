# El instante — tanda 3: las 100 mejoras

> Tandas 1 y 2 archivadas en `.nonstop/tanda1/` y `.nonstop/tanda2/`.
> La bitácora es continua desde #0.

## Objetivo

Nico pidió cien mejoras: pulido general de todo. El juego ya funciona de punta a
punta (8 pasos, recorrido ramificado, indicios, naipes de Marsella, carta final
para Bel). Esta tanda no agrega mecánicas: levanta el piso de calidad en todo lo
que se toca — claridad, bugs, presentación, sonido, textos, accesibilidad,
rendimiento.

## Alcance

**Entra:** las 100 mejoras numeradas del TODO, agrupadas por tema.

**No entra:** mecánicas nuevas, más lugares o cartas, cambiar el género del
juego, publicar o commitear.

## Supuestos

1. **Se agrupan varias mejoras por iteración.** 100 mejoras no entran en 40
   iteraciones de a una; van de a 2 o 3 por tema afín, verificadas juntas.
2. **Ninguna mejora puede romper lo que anda.** Después de cada grupo se corre
   la batería (auditar, verificarDibujo, verificarBases, una partida completa).
3. **Prioridad cuando algo no entra:** claridad y bugs primero, presentación y
   textos después, rendimiento último. Es el orden en que el jugador los nota.
4. **Accesibilidad sin dependencias**: foco visible, roles ARIA, contraste y
   `prefers-reduced-motion`. Nada de librerías.
5. **El juego se llama `El segundo de más`** desde el 30/08/2026, y la carpeta
   es `ElSegundoDeMas`. El título sale del final del juego — «te quedaste el
   segundo de más que la mayoría no se queda» — así que nombra la mecánica y a
   la vez lo que el juego le dice a Bel de ella. Ojo con una confusión fácil:
   adentro del código, `Instante` sigue siendo el módulo de la mecánica del
   momento justo, y eso NO se renombra. Los nombres anteriores (Duermevela,
   El instante) quedan en los informes viejos: son el registro de cuando el
   proyecto se llamaba así.

## Criterios de aceptación

1. Al menos 85 de las 100 mejoras cerradas y marcadas.
2. Partida completa sin errores en consola, con la batería en verde.
3. Ningún desborde ni colisión de layout en 390x760, 1395x920 y 1532x783.
4. Toda mejora marcada `[x]` tiene su verificación registrada en la bitácora.
5. `dist/el-instante.html` se abre solo y juega completo.
6. Cero regresiones: los criterios de la tanda 2 siguen pasando (cama solo al
   final, La Muerte fuera de la primera mano, recorridos variados, 4 finales).

## Presupuesto

40 iteraciones.
