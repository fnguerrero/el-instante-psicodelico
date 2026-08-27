/* Los 22 Arcanos Mayores.
   Cada uno tiene su lectura tradicional, un efecto cuando se juega en un
   encuentro, y una lectura invertida distinta. No son adorno: el efecto de
   cada carta sale de lo que la carta significa. */
var Arcanos = (function () {
  'use strict';

  /* clave    identificador interno
     num      numeral romano, como se imprime
     nombre   como lo dice la gente
     glifo    simbolo que se dibuja en la carta
     recto    que hace jugada al derecho
     invertido que hace jugada al reves
     tono     'luz' | 'sombra' | 'ambos' — tiñe la escena al jugarla
     verbo    accion corta para el boton */
  var CARTAS = [
    {
      clave: 'loco', num: '0', nombre: 'El Loco', glifo: '✧', tono: 'luz',
      lectura: 'Empezar sin saber. El salto antes de mirar.',
      recto: { verbo: 'Avanzar sin mirar', efecto: 'salto',
        texto: 'Bel hace lo único que no estaba previsto: sigue caminando.' },
      invertido: { verbo: 'Frenar en seco', efecto: 'freno',
        texto: 'Se queda quieta justo antes del borde.' }
    },
    {
      clave: 'mago', num: 'I', nombre: 'El Mago', glifo: '⚚', tono: 'luz',
      lectura: 'Tener las herramientas y saber usarlas.',
      recto: { verbo: 'Usar lo que tenés', efecto: 'usar',
        texto: 'Bel junta lo que trae encima y lo hace servir para otra cosa.' },
      invertido: { verbo: 'Improvisar', efecto: 'trampa',
        texto: 'No tiene con qué. Igual hace el gesto, y por un rato alcanza.' }
    },
    {
      clave: 'sacerdotisa', num: 'II', nombre: 'La Sacerdotisa', glifo: '☾', tono: 'luz',
      lectura: 'Saber sin que te lo digan. Lo que está detrás del velo.',
      recto: { verbo: 'Escuchar', efecto: 'ver',
        texto: 'Bel se queda callada el tiempo suficiente como para entender.' },
      invertido: { verbo: 'Desconfiar', efecto: 'ocultar',
        texto: 'Lo que sabe se lo guarda, y eso también es una forma de defensa.' }
    },
    {
      clave: 'emperatriz', num: 'III', nombre: 'La Emperatriz', glifo: '♀', tono: 'luz',
      lectura: 'Lo que crece, lo que abunda, lo que cuida.',
      recto: { verbo: 'Cuidar', efecto: 'curar',
        texto: 'Bel se ocupa de algo que no era suyo, y algo se destraba.' },
      invertido: { verbo: 'Soltar', efecto: 'soltar',
        texto: 'Deja de sostener lo que ya no se sostiene solo.' }
    },
    {
      clave: 'emperador', num: 'IV', nombre: 'El Emperador', glifo: '♃', tono: 'ambos',
      lectura: 'La ley, el límite, lo que no se discute.',
      recto: { verbo: 'Poner el límite', efecto: 'limite',
        texto: 'Bel dice que no de una manera que no admite respuesta.' },
      invertido: { verbo: 'Desobedecer', efecto: 'romper',
        texto: 'Hace exactamente lo que la feria le prohibió.' }
    },
    {
      clave: 'sumo', num: 'V', nombre: 'El Sumo Sacerdote', glifo: '⛨', tono: 'luz',
      lectura: 'Lo que se aprende de otro. La tradición.',
      recto: { verbo: 'Hacer lo enseñado', efecto: 'rito',
        texto: 'Bel repite un gesto que aprendió hace años sin saber para qué.' },
      invertido: { verbo: 'Hacerlo a tu modo', efecto: 'herejia',
        texto: 'Cambia el rito a mitad de camino. Funciona igual, o casi.' }
    },
    {
      clave: 'enamorados', num: 'VI', nombre: 'Los Enamorados', glifo: '⚭', tono: 'ambos',
      lectura: 'Elegir. Y por elegir, perder lo otro.',
      recto: { verbo: 'Elegir', efecto: 'elegir',
        texto: 'Bel elige, y al elegir deja algo del otro lado.' },
      invertido: { verbo: 'No elegir', efecto: 'dudar',
        texto: 'Se queda con las dos cosas un rato más, y las dos se enfrían.' }
    },
    {
      clave: 'carro', num: 'VII', nombre: 'El Carro', glifo: '⛊', tono: 'luz',
      lectura: 'Avanzar con fuerza y en una dirección.',
      recto: { verbo: 'Embestir', efecto: 'embestir',
        texto: 'Bel no rodea: atraviesa.' },
      invertido: { verbo: 'Perder el rumbo', efecto: 'derrapar',
        texto: 'Va rápido, pero no exactamente hacia donde quería.' }
    },
    {
      clave: 'justicia', num: 'VIII', nombre: 'La Justicia', glifo: '⚖', tono: 'ambos',
      lectura: 'La cuenta exacta. Lo que corresponde.',
      recto: { verbo: 'Cobrar lo justo', efecto: 'balanza',
        texto: 'Bel pone las cosas en su lugar, sin agregar ni perdonar.' },
      invertido: { verbo: 'Dejar pasar', efecto: 'perdonar',
        texto: 'Podría cobrarla. No la cobra.' }
    },
    {
      clave: 'ermitano', num: 'IX', nombre: 'El Ermitaño', glifo: '✦', tono: 'luz',
      lectura: 'Retirarse con la propia luz. Buscar solo.',
      recto: { verbo: 'Cerrarse', efecto: 'refugio',
        texto: 'Bel se hace chiquita alrededor de su propia luz, y lo deja pasar de largo.' },
      invertido: { verbo: 'Aislarse de más', efecto: 'encierro',
        texto: 'Se cierra tanto que tampoco entra lo que la ayudaba.' }
    },
    {
      clave: 'rueda', num: 'X', nombre: 'La Rueda de la Fortuna', glifo: '⊛', tono: 'ambos',
      lectura: 'Lo que gira. Lo que no depende de vos.',
      recto: { verbo: 'Dejar que gire', efecto: 'azar',
        texto: 'Bel suelta las manos y deja que la vuelta la lleve.' },
      invertido: { verbo: 'Trabar la rueda', efecto: 'trabar',
        texto: 'Mete el pie. La rueda se queja y para.' }
    },
    {
      clave: 'fuerza', num: 'XI', nombre: 'La Fuerza', glifo: '∞', tono: 'luz',
      lectura: 'Dominar sin violencia. La mano en la boca del animal.',
      recto: { verbo: 'Amansar', efecto: 'amansar',
        texto: 'Bel no le pega. Le pone la mano encima hasta que se calma.' },
      invertido: { verbo: 'Forzar', efecto: 'forzar',
        texto: 'Usa la fuerza que sí tiene, y le cuesta más de lo que pensaba.' }
    },
    {
      clave: 'colgado', num: 'XII', nombre: 'El Colgado', glifo: '⊥', tono: 'ambos',
      lectura: 'Ver todo del revés. Quedarse quieto a propósito.',
      recto: { verbo: 'Darlo vuelta', efecto: 'invertir',
        texto: 'Bel mira la escena al revés y recién ahí entiende qué está pasando.' },
      invertido: { verbo: 'Quedarse colgada', efecto: 'suspender',
        texto: 'No hace nada, y el no hacer nada dura demasiado.' }
    },
    {
      clave: 'muerte', num: 'XIII', nombre: 'La Muerte', glifo: '⚰', tono: 'sombra',
      lectura: 'Lo que termina para que empiece otra cosa. Nunca es literal.',
      recto: { verbo: 'Terminarlo', efecto: 'terminar',
        texto: 'Bel cierra algo que venía arrastrando, y el aire cambia.' },
      invertido: { verbo: 'Estirarlo', efecto: 'estirar',
        texto: 'Le da una vuelta más a algo que ya estaba terminado.' }
    },
    {
      clave: 'templanza', num: 'XIV', nombre: 'La Templanza', glifo: '⚱', tono: 'luz',
      lectura: 'Mezclar en la medida justa. Bajar un cambio.',
      recto: { verbo: 'Templar', efecto: 'templar',
        texto: 'Bel afloja el ritmo hasta que las cosas se acomodan solas.' },
      invertido: { verbo: 'Acelerar', efecto: 'acelerar',
        texto: 'Va más rápido de lo que la situación aguanta.' }
    },
    {
      clave: 'diablo', num: 'XV', nombre: 'El Diablo', glifo: '⛧', tono: 'sombra',
      lectura: 'Lo que te ata y te gusta. La cadena floja.',
      recto: { verbo: 'Aceptar el trato', efecto: 'pacto',
        texto: 'Bel dice que sí a algo que sabe que después va a pagar.' },
      invertido: { verbo: 'Cortar la cadena', efecto: 'cortar',
        texto: 'Se saca de encima algo que llevaba tanto tiempo que ya no lo sentía.' }
    },
    {
      clave: 'torre', num: 'XVI', nombre: 'La Torre', glifo: '△', tono: 'sombra',
      lectura: 'El derrumbe que no se pide pero que hacía falta.',
      recto: { verbo: 'Romper todo', efecto: 'derrumbe',
        texto: 'Bel rompe. No con elegancia: rompe.' },
      invertido: { verbo: 'Aguantar el techo', efecto: 'apuntalar',
        texto: 'Sostiene con el hombro algo que se está viniendo abajo igual.' }
    },
    {
      clave: 'estrella', num: 'XVII', nombre: 'La Estrella', glifo: '✷', tono: 'luz',
      lectura: 'La esperanza después del derrumbe. El agua limpia.',
      recto: { verbo: 'Confiar', efecto: 'esperanza',
        texto: 'Bel se permite pensar que esto puede salir bien.' },
      invertido: { verbo: 'Perder la fe', efecto: 'desanimo',
        texto: 'Sigue caminando, pero ya sin esperar nada.' }
    },
    {
      clave: 'luna', num: 'XVIII', nombre: 'La Luna', glifo: '☽', tono: 'sombra',
      lectura: 'Lo que se ve mal de noche. El engaño y el sueño.',
      recto: { verbo: 'Entrar en el sueño', efecto: 'sueno',
        texto: 'Bel deja de distinguir lo que pasa de lo que sueña, y avanza igual.' },
      invertido: { verbo: 'Despertarse', efecto: 'despertar',
        texto: 'Se sacude la cabeza y la feria vuelve a tener bordes.' }
    },
    {
      clave: 'sol', num: 'XIX', nombre: 'El Sol', glifo: '☉', tono: 'luz',
      lectura: 'Lo que se ve claro. Alegría sin doblez.',
      recto: { verbo: 'Alumbrar', efecto: 'alumbrar',
        texto: 'Todo queda a la vista, y lo que estaba a oscuras no aguanta la luz.' },
      invertido: { verbo: 'Encandilar', efecto: 'encandilar',
        texto: 'Hay tanta luz que tampoco se ve nada.' }
    },
    {
      clave: 'juicio', num: 'XX', nombre: 'El Juicio', glifo: '♆', tono: 'ambos',
      lectura: 'El llamado. Lo que estaba dormido se levanta.',
      recto: { verbo: 'Llamar por su nombre', efecto: 'llamar',
        texto: 'Bel dice el nombre en voz alta, y lo que se llama tiene que contestar.' },
      invertido: { verbo: 'No contestar', efecto: 'callar',
        texto: 'La llaman a ella. Se hace la que no escucha.' }
    },
    {
      clave: 'mundo', num: 'XXI', nombre: 'El Mundo', glifo: '◎', tono: 'luz',
      lectura: 'Cerrar la vuelta. Estar entera.',
      recto: { verbo: 'Cerrar la vuelta', efecto: 'cerrar',
        texto: 'Bel termina algo que había empezado hace mucho más que esta noche.' },
      invertido: { verbo: 'Dejarlo abierto', efecto: 'abierto',
        texto: 'Le falta poco y decide que le falte.' }
    }
  ];

  var PORCLAVE = {};
  CARTAS.forEach(function (c, i) { c.indice = i; PORCLAVE[c.clave] = c; });

  function get(clave) { return PORCLAVE[clave] || null; }

  // Cara de la carta según esté al derecho o invertida.
  function cara(carta) {
    return carta.invertida ? carta.arcano.invertido : carta.arcano.recto;
  }

  /* Una carta en juego: el arcano más su orientación. La orientación importa
     tanto como la carta, igual que en una tirada de verdad. */
  function instancia(clave, invertida) {
    var a = get(clave);
    if (!a) return null;
    return {
      arcano: a, clave: clave, invertida: !!invertida,
      get nombre() { return a.nombre; },
      get glifo() { return a.glifo; },
      get num() { return a.num; }
    };
  }

  function todas() { return CARTAS.slice(); }
  function claves() { return CARTAS.map(function (c) { return c.clave; }); }

  return {
    CARTAS: CARTAS, get: get, cara: cara,
    instancia: instancia, todas: todas, claves: claves
  };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = Arcanos; }
