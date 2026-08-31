# TODO — El instante, tanda 3: las 100 mejoras

Estados: `[ ]` pendiente · `[~]` en curso · `[x]` hecho · `[!]` bloqueado
Cada linea agrupa varias mejoras numeradas y se verifica junta.

## A · Bugs y robustez (1-14)

- [x] G1 · 1 sin doble jugada por doble click · 2 el resize repinta naipes sin duplicar · 3 clearTimeout de los `luego` al reiniciar · 4 sin fugas de setInterval · verif: doble click no gasta dos cartas; 3 resizes seguidos no dejan naipes rotos
- [x] G2 · 5 tocar el instante antes de que aparezca no cuenta · 6 teclado no dispara con foco en un boton · 7 el pointerdown no atraviesa el cierre ni el final · 8 sin doble resolucion de la mirada · verif: forzar cada caso y ver el contador
- [x] G3 · 9 audio: no acumular osciladores si se juega rapido · 10 cortar el colchon al terminar · 11 el interval del colchon se limpia · 12 resume del contexto si el navegador lo suspende · verif: contar nodos tras 20 jugadas
- [x] G4 · 13 canvas: limitar DPR en pantallas enormes · 14 no repintar naipes si el tamano no cambio · verif: medir tiempo de pintarNaipes

## B · Claridad (15-28)

- [x] G5 · 15 la primera partida muestra una guia de una linea en la primera jugada · 16 el aviso del instante aparece un poco antes · 17 tooltip del marcador · 18 el marcador dice cuantas van sobre el total · verif: DOM tras empezar
- [x] G6 · 19 el cierre resume que encontro y que se perdio · 20 boton "ver de nuevo" en el final · 21 el final permite volver a jugar · 22 la portada recuerda que se juega con click o barra · verif: recorrer el cierre
- [x] G7 · 23 rotulo del lugar con el numero de paso · 24 al errar se ve que indicio se perdio (silueta) · 25 los indicios juntados se listan al final · 26 el marcador se resalta un instante al sumar · verif: capturas y DOM
- [x] G8 · 27 modo "sin puntería": si errás 3 seguidas, la ventana se agranda · 28 la dificultad se anuncia cuando cambia · verif: forzar 3 errores y medir la ventana

## C · Presentacion (29-48)

- [x] G9 · 29 transicion entre lugares con fundido · 30 el titulo del lugar entra desde arriba · 31 el relato entra con desplazamiento leve · 32 sombra bajo Bel · verif: capturas
- [x] G10 · 33 estrellas fugaces ocasionales · 34 niebla baja sobre el piso · 35 el piso refleja apenas la figura · 36 vineteado en los bordes · verif: capturas
- [x] G11 · 37 la figura tiene halo propio segun su color · 38 las piezas al volar dejan estela · 39 destello al completar la mutacion · 40 el fogonazo tine tambien el suelo · verif: capturas de la mutacion
- [x] G12 · 41 hover de carta con brillo dorado en el borde · 42 la carta jugada sale hacia la figura · 43 las otras dos se van hacia abajo · 44 el mazo restante se insinua al costado · verif: DOM y capturas
- [x] G13 · 45 portada con las cartas de fondo · 46 el titulo con un brillo lento · 47 el boton late apenas · 48 transicion de portada mas cuidada · verif: captura de portada
- [x] G14 · 49 el cierre entra por partes · 50 la carta final tiene resplandor detras · verif: DOM del final

## D · Naipes (51-62)

- [x] G15 · 51 textura de papel en la lamina · 52 el filete con desgaste leve · 53 las tintas con registro imperfecto · verif: hoja de contacto
- [x] G16 · 54 mejorar El Loco (perro) · 55 mejorar El Mundo (guirnalda) · 56 mejorar La Torre (proporcion) · verif: hoja de contacto
- [x] G17 · 57 mejorar La Rueda (criaturas) · 58 mejorar Los Enamorados (tercera figura) · 59 mejorar La Templanza (jarras) · verif: hoja de contacto
- [x] G18 · 60 numeral con mejor cuerpo · 61 cartela con relieve · 62 la lectura no se corta nunca · verif: las 15 cartas con nombres largos
- [x] G19 · 63 dorso mas rico · 64 la carta final gira con brillo al voltear · verif: captura del dorso

## E · Escena y figuras (65-76)

- [x] G20 · 65 montania: durmientes y vagon quieto · 66 casa: puerta con picaporte y sendero · 67 arbol: hojas que se mueven · verif: capturas
- [x] G21 · 68 laguna: juncos en la orilla · 69 faro: rocas en la base · 70 calesita: piso con reflejo · verif: capturas
- [x] G22 · 71 luna: mas relieve · 72 platillo: ventanas en la cupula · 73 bandada: mejor forma de ala · verif: capturas
- [x] G23 · 74 cama: mesa de luz con la lampara · 75 puerta: marco con relieve · 76 reloj: pendulo · verif: capturas

## F · Sonido (77-86)

- [x] G24 · 77 cada lugar tiene su color sonoro · 78 el colchon cambia al llegar · 79 volumen general mas parejo · verif: contar nodos por lugar
- [x] G25 · 80 el instante suena mientras el anillo se cierra · 81 tic al acercarse a la marca · 82 acierto y error mas distintos · verif: nodos por caso
- [x] G26 · 83 la carta final tiene su acorde · 84 el volteo suena · 85 fundido del colchon al terminar · 86 recordar si el sonido estaba apagado · verif: estado de audio
- [x] G27 · 87 control de volumen ademas del mute · verif: cambiar volumen y medir

## G · Textos (88-94)

- [x] G28 · 88 revisar los 14 textos de llegada · 89 revisar los 14 de vuelta · 90 revisar los 14 indicios · verif: lectura completa y largo maximo
- [x] G29 · 91 las frases de accion mas variadas · 92 los 4 finales mas afilados · 93 la carta de Bel revisada · verif: lectura
- [x] G30 · 94 ningun texto se corta en celular · verif: medicion de alturas a 390x760

## H · Accesibilidad (95-100)

- [x] G31 · 95 foco visible en todo lo clickeable · 96 roles y aria-label · 97 las cartas se juegan con Enter · verif: navegacion por teclado
- [x] G32 · 98 respeta prefers-reduced-motion · 99 contraste del texto sobre la escena · 100 el juego se puede terminar solo con teclado · verif: partida completa sin mouse

## Cierre

- [x] Verificacion final contra los 6 criterios y build
- [x] INFORME.md de la tanda 3
