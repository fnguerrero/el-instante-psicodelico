# TODO — tanda 5: 20 mejoras a la app

Estados: `[ ]` pendiente · `[~]` en curso · `[x]` hecho y verificado · `[!]` bloqueado

## Bloque A — poder verificar de verdad (1-3)

- [x] 01 · Reloj inyectable: correr el bucle real sin depender de rAF · verif: una partida completa con el bucle real, contando cuadros
- [x] 02 · Chequeo de visibilidad dentro de la batería · verif: `verificarLuz()` da ok en los 13 lugares y falla si se baja el brillo a propósito
- [x] 03 · Auditoría de layout en 6 tamaños como prueba permanente · verif: `verificarLayout()` recorre los tamaños y reporta desbordes

## Bloque B — que no se rompa (4-7)

- [x] 04 · Red de seguridad: una excepción en el bucle muestra un aviso legible, no un cuadro negro · verif: romper una capa a propósito y ver el aviso
- [x] 05 · Pausar el render con la pestaña oculta · verif: `document.hidden` simulado deja de dibujar
- [x] 06 · Guardar la partida en curso · verif: guardar, recargar y que el estado vuelva
- [x] 07 · Ofrecer continuar al volver, sin restaurar solo · verif: aparece el aviso con las dos opciones

## Bloque C — pantallas raras (8-11)

- [x] 08 · Pantallas muy angostas (320px) · verif: sin desborde horizontal a 320x568
- [x] 09 · Pantallas bajas: revisar marcador, avisos y cartas · verif: nada se pisa a 1600x500
- [x] 10 · Respetar `prefers-contrast: more` · verif: con el flag, los textos suben de contraste
- [x] 11 · Área táctil mínima de 44px en todo lo accionable · verif: medir los rectángulos de los controles

## Bloque D — compartir el link (12-15)

- [x] 12 · meta description y título social · verif: las etiquetas están y tienen contenido
- [x] 13 · Open Graph y Twitter card · verif: og:title, og:description, og:image presentes
- [x] 14 · theme-color y manifest para instalar · verif: manifest válido embebido, sin archivo externo
- [x] 15 · Imagen de compartir generada del propio juego · verif: la imagen existe, pesa menos de 200 KB y se ve la escena

## Bloque E — comodidad de juego (16-18)

- [x] 16 · Teclas 1/2/3 para elegir carta · verif: disparar la tecla juega la carta correspondiente
- [x] 17 · Reiniciar sin recargar · verif: el control existe y deja el juego en el paso 0
- [x] 18 · Ritmo de lectura ajustable y recordado · verif: cambia el tiempo de los textos y sobrevive recarga

## Bloque F — rendimiento (19-20)

- [x] 19 · Adaptar la carga a equipos flojos · verif: con un presupuesto bajo forzado, baja solo el nivel
- [x] 20 · Bajar el peso del archivo suelto · verif: el dist pesa menos que ahora y sigue funcionando

## Cierre

- [x] 21 · Verificación final contra los 9 criterios de la SPEC · verif: los 9 en verde
