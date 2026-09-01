# TODO — tanda 4: 50 modificaciones psicodélicas

Estados: `[ ]` pendiente · `[~]` en curso · `[x]` hecho y verificado · `[!]` bloqueado

## Andamiaje (primero, para poder verificar sin manos)

- [x] 00 · Ganchos de prueba: `psico(nivel)`, `psicoEstado()`, `psicoCosto()` y captura con filtro aplicado · verif: los tres responden y devuelven datos coherentes

## Bloque A — pipeline y control (1-6)

- [x] 01 · Pipeline de capas con presupuesto de tiempo y apagado automático · verif: `psicoCosto()` reporta ms por capa
- [x] 02 · Tres niveles de intensidad (suave/normal/extremo) en localStorage · verif: cambiar nivel altera `psicoEstado().nivel` y sobrevive recarga
- [x] 03 · Guarda anti-estroboscopio: ningún pulso de pantalla completa sobre 3 Hz · verif: medir frecuencia máxima de los pulsos declarados
- [x] 04 · Auto-degradado: si el cuadro se pasa de 6 ms, apagar capas caras · verif: forzar presupuesto bajo y ver capas apagadas
- [x] 05 · Revisión de reduced-motion sobre todas las capas nuevas · verif: con el flag activo, cero capas de movimiento
- [x] 06 · Control de intensidad visible en pantalla · verif: el control existe, cambia el nivel y se lee

## Bloque B — color y luz (7-18)

- [x] 07 · Paleta propia por lugar, no un tinte único · verif: capturar 4 lugares y comprobar tonos distintos
- [x] 08 · Plasma de fondo (campo de color que se mueve) · verif: captura + dos cuadros distintos
- [x] 09 · Aura cromática alrededor de la figura · verif: captura muestra halo de color
- [x] 10 · Estrellas que cambian de color · verif: captura del cielo con estrellas de colores
- [x] 11 · Halo iridiscente en Bel · verif: captura recortada de Bel
- [x] 12 · Suelo con reflejo de color invertido · verif: captura de la franja del piso
- [x] 13 · Viñeta de color en vez de negra · verif: medir color en las esquinas
- [x] 14 · Destello arcoíris al acertar el instante · verif: forzar acierto y capturar
- [x] 15 · Gradiente radial rotante detrás de la figura · verif: dos capturas con ángulos distintos
- [x] 16 · Curva de color: subir saturación sin quemar luces · verif: medir que no haya canal saturado en 255
- [x] 17 · Contraluz de color en el horizonte · verif: captura de la línea del piso
- [x] 18 · Inversión parcial de color en el clímax · verif: captura con climax=1

## Bloque C — deformación (19-30)

- [x] 19 · Ondulación también vertical · verif: captura con líneas rectas deformadas en los dos ejes
- [x] 20 · Remolino centrado en la figura · verif: captura muestra torsión
- [x] 21 · Respiración de zoom ligada a la tensión · verif: dos capturas con escala distinta
- [x] 22 · Caleidoscopio en la transformación · verif: captura durante la mutación
- [x] 23 · Ondas concéntricas al jugar una carta · verif: captura en el momento del juego
- [x] 24 · Rotación leve del cuadro entero · verif: medir inclinación de la línea del piso
- [x] 25 · Barril / ojo de pez suave · verif: captura con bordes curvados
- [x] 26 · Corte en tiras verticales además de horizontales · verif: captura con desplazamiento en columnas
- [x] 27 · Desplazamiento por bloques tipo glitch, ocasional · verif: forzar el evento y capturar
- [x] 28 · Temblor en el clímax · verif: dos capturas seguidas con offset distinto
- [x] 29 · Espejo simétrico intermitente · verif: captura con simetría
- [x] 30 · Estiramiento cromático en los bordes · verif: captura de una esquina

## Bloque D — rastro y partículas (31-40)

- [x] 31 · Sistema de partículas propio, con tope y reciclado · verif: contar partículas vivas y que no crezca sin límite
- [x] 32 · Polvo flotante ambiente · verif: captura con motas
- [x] 33 · Chispas al acertar · verif: forzar acierto y contar partículas nuevas
- [x] 34 · Rastro de color detrás de Bel al caminar · verif: captura con Bel en movimiento
- [x] 35 · Trazo de las piezas durante la mutación · verif: captura a mitad de transformación
- [x] 36 · Anillos expansivos al cambiar de lugar · verif: captura al completar la mutación
- [x] 37 · Lluvia de puntos en el clímax · verif: captura con climax alto
- [x] 38 · Estela multicolor por figura, con el color del lugar · verif: capturas de dos lugares distintos
- [x] 39 · Partículas que reaccionan al acierto y al fallo distinto · verif: forzar los dos y comparar
- [x] 40 · Presupuesto de partículas por nivel de intensidad · verif: el tope cambia con el nivel

## Bloque E — naipes, UI y pantallas (41-46)

- [x] 41 · Naipes con brillo iridiscente en el borde · verif: captura de una carta
- [x] 42 · Dorso del naipe animado · verif: dos capturas del dorso distintas
- [x] 43 · Marcador de indicios con color que muta · verif: captura del marcador
- [x] 44 · Portada psicodélica · verif: captura de la portada
- [x] 45 · Cierre y carta final con tratamiento propio · verif: captura del final
- [x] 46 · Aura en la carta bajo el cursor · verif: forzar hover y capturar

## Bloque F — audio reactivo (47-50)

- [x] 47 · Analizador de audio conectado al pipeline · verif: `psicoEstado().audio` devuelve nivel entre 0 y 1
- [x] 48 · Pulso visual con los graves · verif: correlacionar nivel de audio con escala del cuadro
- [x] 49 · Drone que sube con la tensión · verif: el oscilador existe y su ganancia sigue a la tensión
- [x] 50 · Shimmer en el clímax · verif: la voz suena solo con climax alto

## Cierre

- [x] 51 · Verificación final contra los criterios de la SPEC · verif: los 8 criterios en verde
- [x] 52 · Capturas del look final (26/45/65 KB). NO se tocó Portfolio/: esa entrada es de la versión original y la lleva otra sesión · verif: 3 imágenes bajo 100 KB

## Post-cierre — lo que se rompió y se arregló

- [x] 53 · El juego se veía negro en pantalla · verif: brillo medio de escena > 40 y > 5% claro en los 13 lugares con tensión 0
