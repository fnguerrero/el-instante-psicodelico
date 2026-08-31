# Duermevela — completar el juego

## Objetivo

Duermevela es un regalo para Bel, astróloga. Es un sueño en el que las cosas
muestran lo que son cuando ella las mira con la carta justa: jugás un arcano y
la escena se transforma delante tuyo, las piezas de lo que había vuelan y se
rearman en otra cosa. El motor de transformación y cuatro escenas ya están y
funcionan. Falta terminarlo: sonido, llegar a ocho escenas, y meter a Bel
adentro del sueño en vez de dejarla mirando de costado.

## Alcance

**Entra:**
- Sonido y música sintetizados con Web Audio (sin archivos externos).
- Ocho escenas encadenadas, con figuras nuevas para sostenerlas.
- Mazo ampliado, para que elegir siga pesando en la escena ocho.
- Bel adentro de la escena: se acerca, reacciona a lo que pasa, la
  transformación la afecta.
- Soporte táctil y responsive: Bel lo va a abrir en el celular.
- Un solo archivo HTML autocontenido como entregable.

**No entra:**
- Imágenes, fuentes locales o audio en archivos: todo se dibuja o se sintetiza.
- Backend, guardado en servidor, cuentas.
- Carta natal real ni cálculo astronómico (eso fue otro proyecto).
- Publicar o deployar nada.

## Stack y decisiones

- HTML + JS + Canvas 2D, sin dependencias, igual que lo ya construido.
- Web Audio API con osciladores y ruido filtrado. Nada de samples.
- Módulos sueltos en `js/`, empaquetados por `tools/build.py` a un HTML único.
- Servidor de desarrollo propio (`tools/servidor.py`, puerto 8139) que recibe
  capturas del canvas por POST, porque el panel del navegador no compone
  cuadros de forma confiable en esta sesión.

## Supuestos

Decisiones tomadas por criterio propio, sin consultar:

1. **Ocho escenas, no más.** Con la transformación de ~2,5 s más la lectura,
   ocho escenas dan entre 12 y 15 minutos, que es la duración que Nico pidió
   cuando planteó el juego por primera vez.
2. **Mazo de 14 cartas.** Con 8 escenas se gastan 8; que sobren 6 es lo que
   mantiene la elección viva hasta la última escena y da rejugabilidad.
3. **La Estrella sigue siendo la carta del don** y no se duplica esa función en
   ninguna carta nueva: es el eje temático del juego.
4. **El sonido arranca apagado con un botón visible para prenderlo.** Los
   navegadores bloquean el audio hasta que hay un gesto, y un juego que se
   abre sonando sin aviso es hostil.
5. **La madre aparece solo como presencia amable** — luz prendida, alguien que
   espera sin apuro. Nunca nombrada, nunca asociada a pérdida. Pedido explícito
   de Nico en la conversación: "la madre es intocable y es un ángel para Bel".
6. **Bel adentro del sueño** se resuelve con tres cosas: camina hacia la figura
   al entrar a la escena, la mira (la cabeza sigue el objeto), y la
   transformación la empuja o la ilumina. No se hace un personaje controlable:
   el juego es de cartas, no de plataformas.
7. **Sin modo horror.** Decidido con Nico: misterio y maravilla.

## Criterios de aceptación

Verificables, no opinables:

1. Una partida completa recorre las 8 escenas y llega al cierre sin errores en
   consola.
2. Las 8 escenas tienen figura de entrada y figura revelada, y las dos existen
   en el catálogo de figuras y tienen pintor propio.
3. Toda carta del mazo produce una transformación en cualquier escena: ninguna
   combinación carta/escena deja la pantalla sin figura.
4. Toda combinación carta/escena tiene texto propio o cae en el texto `otra`
   declarado; ninguna muestra `undefined`.
5. El audio produce sonido audible (nodos activos verificables) al jugar una
   carta, y se puede silenciar.
6. Cada figura terrestre apoya en el suelo y cada figura aérea no lo toca,
   verificado por captura.
7. El juego responde a touch y se ve completo a 390×840 (celular) sin scroll
   horizontal ni elementos cortados.
8. `dist/duermevela.html` se abre solo, sin servidor, y juega completo.

## Presupuesto

40 iteraciones.
