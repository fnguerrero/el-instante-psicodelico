/* El guion.

   El instante no tiene escenas: tiene lugares, y el lugar es la figura que
   estás mirando. Jugás una carta, la figura se transforma, y esa cosa nueva es
   donde estás ahora. El recorrido se ramifica solo y dos partidas no se
   parecen.

   Cada lugar esconde algo. Se ve únicamente si le acertás al instante, ese
   momento en que las piezas volando se alinean. Los indicios que juntes son lo
   que decide si Bel entiende algo al despertar o se levanta sin saber.

   TODO ESTÁ EN PRIMERA PERSONA. No es un narrador contando lo que le pasa a
   Bel: es Bel contándolo mientras pasa. Cualquier texto que se agregue acá
   tiene que estar en su voz — en cuanto uno solo se escapa a la tercera, se
   nota y rompe el resto.

   Nada dice que está soñando hasta el final. Esa es la otra regla que ordena
   todo lo de abajo: la cama no aparece hasta la última pantalla, y ningún
   lugar la nombra antes. */
var Guion = (function () {
  'use strict';

  var PASOS = 8;

  /* ============ las cartas ============

     figura    a qué convierte el lugar donde estás
     revela    si es true, saca lo que ese lugar esconde (lo pone el lugar)
     accion    lo que hizo la carta, en su voz
     tono      'luz' | 'sombra' — cómo reacciona Bel y cómo suena
     astro     la correspondencia tradicional del arcano

     Los catorce son arcanos mayores reales, con su numeral y su significado.
     Ninguna carta lleva a la cama: es la única figura reservada, y se reserva
     para el último paso. */
  var CARTAS = [
    /* La carta del don. En el tarot, La Sacerdotisa es el arcano del
       conocimiento oculto: lo que se sabe sin poder explicar cómo. Es la que
       corresponde a revelar lo que un lugar esconde. */
    { clave: 'sacerdotisa', num: 'II', nombre: 'La Sacerdotisa', glifo: '☽',
      revela: true, tono: 'luz', color: '170,205,255',
      astro: '☽', astroNombre: 'la Luna',
      lectura: 'Lo que sabés sin saber cómo.',
      accion: 'Lo miré hasta que se rindió.' },

    { clave: 'torre', num: 'XVI', nombre: 'La Torre', glifo: '⚡',
      figura: 'ruina', tono: 'sombra', color: '255,150,120',
      astro: '♂', astroNombre: 'Marte',
      lectura: 'Lo mal armado se cae.',
      accion: 'Se vino abajo sin que lo tocara.' },

    { clave: 'luna', num: 'XVIII', nombre: 'La Luna', glifo: '☾',
      figura: 'luna', tono: 'sombra', color: '220,215,255',
      astro: '♓', astroNombre: 'Piscis',
      lectura: 'Nada es lo que parece.',
      accion: 'Se puso enorme y todo lo demás me quedó chiquito.' },

    { clave: 'sol', num: 'XIX', nombre: 'El Sol', glifo: '☀',
      figura: 'casa', tono: 'luz', color: '255,205,130',
      astro: '☉', astroNombre: 'el Sol',
      lectura: 'Todo queda a la vista.',
      accion: 'Se encendió, como si alguien me estuviera esperando.' },

    { clave: 'muerte', num: 'XIII', nombre: 'La Muerte', glifo: '⚱',
      figura: 'arbol', tono: 'sombra', color: '160,220,170',
      astro: '♏', astroNombre: 'Escorpio',
      lectura: 'Termina algo y arranca otra cosa.',
      accion: 'Se murió, y en el mismo lugar me creció otra cosa.' },

    { clave: 'loco', num: '0', nombre: 'El Loco', glifo: '✧',
      figura: 'bandada', tono: 'luz', color: '255,220,160',
      astro: '♅', astroNombre: 'Urano',
      lectura: 'Salir sin saber a dónde.',
      accion: 'Se soltó en pedazos y los pedazos se me fueron volando.' },

    { clave: 'enamorados', num: 'VI', nombre: 'Los Enamorados', glifo: '☍',
      figura: 'puerta', tono: 'luz', color: '230,190,220',
      astro: '♊', astroNombre: 'Géminis',
      lectura: 'Elegir deja cosas afuera.',
      accion: 'Se me abrió una salida donde no había pared.' },

    { clave: 'mundo', num: 'XXI', nombre: 'El Mundo', glifo: '◎',
      figura: 'calesita', tono: 'luz', color: '200,190,240',
      astro: '♄', astroNombre: 'Saturno',
      lectura: 'La vuelta entera, por fin completa.',
      accion: 'Dio la vuelta entera y volvió al principio.' },

    { clave: 'rueda', num: 'X', nombre: 'La Rueda', glifo: '☸',
      figura: 'calesita', tono: 'luz', color: '255,190,150',
      astro: '♃', astroNombre: 'Júpiter',
      lectura: 'Lo que sube, baja, y vuelve a subir.',
      accion: 'Se puso a girar y no paró más.' },

    { clave: 'ermitano', num: 'IX', nombre: 'El Ermitaño', glifo: '⚹',
      figura: 'faro', tono: 'luz', color: '255,232,170',
      astro: '♍', astroNombre: 'Virgo',
      lectura: 'Buscar solo, con la propia luz.',
      accion: 'Quedó una sola luz, prendida por las dudas.' },

    { clave: 'estrella', num: 'XVII', nombre: 'La Estrella', glifo: '✶',
      figura: 'laguna', tono: 'luz', color: '150,175,230',
      astro: '♒', astroNombre: 'Acuario',
      lectura: 'Después del derrumbe, el agua limpia.',
      accion: 'Se me hizo agua y quedó todo quieto.' },

    { clave: 'templanza', num: 'XIV', nombre: 'La Templanza', glifo: '⚗',
      figura: 'barca', tono: 'luz', color: '170,215,215',
      astro: '♐', astroNombre: 'Sagitario',
      lectura: 'Pasar de un lado al otro, sin apuro.',
      accion: 'Se volvió algo que sirve para cruzar.' },

    { clave: 'colgado', num: 'XII', nombre: 'El Colgado', glifo: '⚯',
      figura: 'reloj', tono: 'sombra', color: '200,180,150',
      astro: '♆', astroNombre: 'Neptuno',
      lectura: 'Quedarse quieto y mirar al revés.',
      accion: 'Se frenó todo y quedó marcando una hora.' },

    { clave: 'emperatriz', num: 'III', nombre: 'La Emperatriz', glifo: '✿',
      figura: 'arbol', tono: 'luz', color: '190,225,160',
      astro: '♀', astroNombre: 'Venus',
      lectura: 'Lo que cuidaste, crece.',
      accion: 'Le brotó encima algo vivo y se lo llevó puesto.' }
  ];

  function carta(clave) {
    for (var i = 0; i < CARTAS.length; i++) {
      if (CARTAS[i].clave === clave) return CARTAS[i];
    }
    return null;
  }

  /* ============ los lugares ============

     llegada  lo que pienso al aparecer acá
     vuelta   lo que pienso si ya había estado antes
     esconde  lo que veo si le acierto al instante — un pedazo de la verdad
     revela   en qué lo convierte La Sacerdotisa: lo que ese lugar era

     Todo en mi voz. Ningún texto de acá nombra la cama, ni dormir, ni
     despertarse: eso es del final. */
  var LUGARES = {
    montania: {
      nombre: 'La montaña rusa',
      llegada: 'La montaña rusa de la feria a la que me llevaban. Está entera, ' +
               'y eso no puede ser: la desarmaron cuando yo tenía nueve.',
      vuelta: 'Otra vez la montaña rusa. Está igual que hace un rato, ' +
              'y hace un rato ya estaba mal.',
      esconde: 'Las vías no terminan en ningún lado. Suben, bajan, y en la punta ' +
               'se cortan en el aire, como si nadie se hubiera tomado el trabajo ' +
               'de imaginarles un final.',
      revela: 'platillo'
    },
    platillo: {
      nombre: 'El platillo',
      llegada: 'Una cosa enorme, quieta en el aire, con una luz que baja al ' +
               'piso. No hace ruido, y nada que pese tanto se queda quieto sin ' +
               'hacer ruido.',
      vuelta: 'Volvió el platillo. Está en el mismo lugar exacto del aire, ' +
              'ni un centímetro corrido.',
      esconde: 'Adentro de la cúpula no hay nadie, y sin embargo me está ' +
               'esperando. Me doy cuenta de que espera que yo le preste ' +
               'atención. Acá todo espera eso.',
      revela: 'luna'
    },
    calesita: {
      nombre: 'La calesita',
      llegada: 'Gira despacio, con la música baja. No hay un solo chico arriba ' +
               'y va a la velocidad de cuando está llena.',
      vuelta: 'La calesita otra vez, con los mismos caballitos en el mismo ' +
              'orden. Ninguno se movió de lugar.',
      esconde: 'La música no sale de la calesita: me llega de todos lados a la ' +
               'vez, igual de fuerte lejos que cerca. Me tapo un oído y la sigo ' +
               'escuchando igual.',
      revela: 'reloj'
    },
    laguna: {
      nombre: 'El agua',
      llegada: 'Un agua quieta con una luz adentro. Arriba no hay nada que ' +
               'pueda estar haciendo esa luz.',
      vuelta: 'El agua de nuevo. El reflejo sigue ahí, todavía sin nada arriba ' +
              'que lo explique.',
      esconde: 'Me asomo y el agua no me copia. Devuelve la orilla, la luz, ' +
               'todo — menos a mí. Me quedo un rato mirando el lugar donde ' +
               'tendría que estar mi cara.',
      revela: 'barca'
    },
    faro: {
      nombre: 'El faro',
      llegada: 'Un faro prendido, dando vueltas, sin mar alrededor. Le está ' +
               'avisando algo a gente que no veo.',
      vuelta: 'El faro otra vez. Sigue barriendo el campo vacío, con la misma ' +
              'paciencia.',
      esconde: 'El haz me busca. Da la vuelta entera y siempre frena un segundo ' +
               'de más cuando me pasa por encima. No está alumbrando el campo: ' +
               'me está alumbrando a mí.',
      revela: 'bandada'
    },
    casa: {
      nombre: 'La casa',
      llegada: 'La casa donde crecí, con las dos ventanas prendidas. Hay ' +
               'alguien adentro y no tiene ningún apuro.',
      vuelta: 'La casa de nuevo. Las luces siguen prendidas. Nadie las apagó en ' +
              'todo este tiempo.',
      esconde: 'Las ventanas están prendidas pero adentro no hay lámparas. La ' +
               'luz no sale de ningún artefacto: la casa está iluminada de la ' +
               'manera en que uno se acuerda de las casas.',
      revela: 'arbol'
    },
    arbol: {
      nombre: 'El árbol',
      llegada: 'Un árbol grande, solo, con las puntas de las ramas encendidas. ' +
               'Los árboles no hacen eso.',
      vuelta: 'El mismo árbol. Le crecieron ramas desde la última vez, y la ' +
              'última vez fue hace un minuto.',
      esconde: 'No tiene sombra. Busco la sombra en el piso y no está, y ahí me ' +
               'doy cuenta de que la mía tampoco.',
      revela: 'casa'
    },
    reloj: {
      nombre: 'El reloj',
      llegada: 'Un reloj enorme. La aguja de los minutos va para adelante y la ' +
               'de los segundos va para atrás, y las dos me parecen tener razón.',
      vuelta: 'El reloj otra vez. Marca una hora distinta de la de recién, y ' +
              'ninguna de las dos es la de verdad.',
      esconde: 'Intento leer la hora y no puedo. Los números están, los veo ' +
               'perfecto, pero no significan nada. Como cuando mirás una palabra ' +
               'tanto rato que deja de ser una palabra.',
      revela: 'luna'
    },
    luna: {
      nombre: 'La luna',
      llegada: 'La luna, bajísima, ocupando medio cielo. La puedo mirar de ' +
               'frente sin que moleste, y eso también está mal.',
      vuelta: 'La luna de nuevo, todavía más cerca. Cada vez que vuelve está un ' +
              'poco más cerca.',
      esconde: 'Los cráteres se mueven. Despacio, pero se mueven, y se acomodan ' +
               'como se acomoda una cara que está por decir algo.',
      revela: 'faro'
    },
    puerta: {
      nombre: 'La puerta',
      llegada: 'Una puerta parada sola, sin pared, con luz atrás. Veo el campo ' +
               'de los dos lados y aun así hay luz atrás.',
      vuelta: 'La puerta otra vez. La luz de atrás sigue prendida, y del otro ' +
              'lado sigue sin haber un otro lado.',
      esconde: 'La abro y del otro lado está el mismo campo. La cierro, la ' +
               'vuelvo a abrir, y ahora hay una habitación. Cambió porque yo ' +
               'esperaba que cambiara.',
      revela: 'casa'
    },
    ruina: {
      nombre: 'Lo que quedó',
      llegada: 'Escombros, polvo todavía en el aire. Se cayó algo grande y no ' +
               'escuché nada.',
      vuelta: 'Otra vez los escombros. El polvo sigue sin bajar. Hace rato que ' +
              'sigue sin bajar.',
      esconde: 'Levanto un pedazo y abajo no hay tierra: hay más pedazos, y ' +
               'abajo más. Esto no se cayó de ningún lado. Lo armaron ya roto.',
      revela: 'arbol'
    },
    bandada: {
      nombre: 'Los pájaros',
      llegada: 'Un montón de pájaros cruzando, todos para el mismo lado. No se ' +
               'acaban nunca: hace rato que cruzan y siguen viniendo.',
      vuelta: 'Los pájaros otra vez, cruzando para el mismo lado. Puede que ' +
              'sean los mismos dando la vuelta.',
      esconde: 'Ninguno bate las alas al mismo tiempo que otro, salvo cuando los ' +
               'miro. Cuando los miro, se sincronizan. Cuando aflojo, se ' +
               'desordenan otra vez.',
      revela: 'laguna'
    },
    barca: {
      nombre: 'La barca',
      llegada: 'Una barca con la vela puesta, meciéndose. No hay agua abajo: se ' +
               'mece igual.',
      vuelta: 'La barca otra vez, meciéndose sobre nada. Ya ni me llama la ' +
              'atención.',
      esconde: 'Está atada, y la soga se pierde en el aire sin llegar a ningún ' +
               'lado. La sigo con la vista y en algún punto la soga simplemente ' +
               'deja de existir.',
      revela: 'laguna'
    },
    cama: {
      nombre: 'La cama',
      llegada: 'Mi cama. La mía, con mis sábanas, en el medio de todo esto.',
      vuelta: 'Mi cama, otra vez.',
      esconde: 'Estoy yo adentro, durmiendo.',
      revela: 'puerta'
    }
  };

  /* El lugar donde arranca. Algo raro pero terrestre: nada que delate de
     entrada que esto no está pasando. */
  var ARRANQUE = 'montania';

  function lugar(clave) { return LUGARES[clave]; }

  /* Qué figura sale de jugar esta carta acá. */
  function destino(claveCarta, claveLugar) {
    var c = carta(claveCarta);
    if (!c) return null;
    if (c.revela) {
      var l = LUGARES[claveLugar];
      return l ? l.revela : null;
    }
    return c.figura;
  }

  /* ============ el final ============

     El despertar, también en su voz. Lo que entiende depende de cuánto llegó a
     ver: no es un puntaje, es cuánto pudo atar. */
  function final(indicios, recorrido) {
    var n = indicios.length;

    if (n === 0) {
      return {
        titulo: 'Me desperté',
        partes: [
          'Abrí los ojos a las cuatro y monedas. Mi cuarto, mi techo, la ' +
          'persiana con la misma raya de luz de siempre.',
          'Del sueño no me quedó nada. Un campo, cosas grandes, la sensación de ' +
          'haber estado por entender algo y no haber llegado.',
          'Me di vuelta y seguí durmiendo. A veces pasa: una estuvo ahí y no vio ' +
          'nada.'
        ]
      };
    }
    if (n <= 2) {
      return {
        titulo: 'Me quedó algo',
        partes: [
          'Abrí los ojos a las cuatro y monedas, con la cabeza en una cosa ' +
          'suelta que había visto y no sabía dónde poner.',
          'No me acordaba del sueño entero. Me acordaba de un detalle, nítido, ' +
          'de esos que quedan cuando todo lo demás se borra.',
          'Me pasa seguido, despierta: retengo la única cosa que no cerraba de ' +
          'una escena que a todos los demás les pareció normal.'
        ]
      };
    }
    if (n <= 4) {
      return {
        titulo: 'Até unos cabos',
        partes: [
          'Abrí los ojos a las cuatro y monedas y me quedé quieta, juntando las ' +
          'piezas antes de que se me fueran.',
          'Nada de lo que había visto encajaba, y todas las cosas que no ' +
          'encajaban fallaban de la misma manera: se acomodaban cuando yo las ' +
          'miraba. El agua que no me copiaba. La luz sin lámpara.',
          'Ahí entendí lo primero: había estado durmiendo. Todo eso lo armé yo, ' +
          'con lo puesto.'
        ]
      };
    }
    return {
      titulo: 'Entendí',
      partes: [
        'Abrí los ojos a las cuatro y monedas, con esa claridad rara de cuando ' +
        'el sueño te deja algo en la mano.',
        'Había estado durmiendo, y eso era lo de menos. Lo importante era cómo ' +
        'me di cuenta: cada cosa de ese lugar estaba esperando que yo la mirara ' +
        'para terminar de existir. El árbol sin sombra. El haz que me seguía. ' +
        'Los pájaros que se ordenaban cuando les prestaba atención.',
        'No entendí el sueño: entendí que el sueño lo hice yo. Y que mirar una ' +
        'cosa hasta que muestra lo que es no es algo que me pasa. Es algo que ' +
        'hago, y lo vengo haciendo despierta desde siempre, sin ponerle nombre.'
      ]
    };
  }

  /* ============ la carta que es de ella ============

     El arcano XXII no existe en ninguna baraja y no se reparte nunca. Se da
     vuelta al final, una sola vez, y es el único momento en que alguien le
     habla a Bel en lugar de que hable ella. Por eso va en segunda persona: es
     la carta dirigiéndose a quien acaba de jugar.

     Cuál de las cuatro toca depende de cuánto llegó a ver. Es la misma figura
     en cuatro grados. */
  function cartaDeElla(indicios) {
    var n = indicios.length;

    if (n >= 6) {
      return {
        clave: 'astrologa', num: 'XXII', nombre: 'La Astróloga',
        lectura: 'Mirar hasta que la cosa se rinde.',
        astro: '☽', astroNombre: 'la Luna',
        parrafos: [
          'Encontraste ' + n + ' cosas que no cerraban, de ocho. Casi todas.',
          'Eso no es suerte ni puntería. Es que mirás distinto: te quedás en una ' +
          'cosa hasta que la cosa se rinde y te muestra lo que es. Toda la noche ' +
          'estuviste haciendo eso, y a esta altura ya sabés que no lo hacés solo ' +
          'cuando dormís.',
          'Lo hacés cuando alguien se sienta enfrente tuyo y te pide que le leas ' +
          'algo. Lo hacés cuando escuchás a alguien contar un problema y ves, ' +
          'antes que la persona, dónde está el nudo. No lo aprendiste en ningún ' +
          'lado. Lo trajiste puesto.',
          'Seguí. Hay gente esperando que le mires las cosas.'
        ]
      };
    }
    if (n >= 3) {
      return {
        clave: 'testigo', num: 'XXII', nombre: 'La Testigo',
        lectura: 'Quedarse el segundo de más.',
        astro: '☽', astroNombre: 'la Luna',
        parrafos: [
          'Encontraste ' + n + ' cosas que no cerraban, de ocho. Algunas se te ' +
          'pasaron.',
          'Está bien que se pasen. Nadie mira todo, y las que viste no las viste ' +
          'de casualidad: las viste porque te quedaste el segundo de más que la ' +
          'mayoría no se queda.',
          'Ese segundo de más es todo el asunto. Es lo que hacés cuando alguien ' +
          'te cuenta algo y vos ves lo que no dijo. No es magia y no hace falta ' +
          'que lo sea.',
          'Seguí. Hay gente esperando que le mires las cosas.'
        ]
      };
    }
    if (n >= 1) {
      return {
        clave: 'despierta', num: 'XXII', nombre: 'La Que Se Despierta',
        lectura: 'Con una alcanza para saber que se puede.',
        astro: '☽', astroNombre: 'la Luna',
        parrafos: [
          'Encontraste ' + n + (n === 1 ? ' cosa que no cerraba' : ' cosas que no cerraban') +
          ', de ocho. Se te fue casi todo.',
          'Pasa cuando uno mira sin mirar, que es como andamos la mayor parte del ' +
          'tiempo. Igual algo viste, y esa cosa te la llevás.',
          'Con una alcanza para saber que se puede. Lo demás es acordarse de ' +
          'frenar, que es lo difícil.',
          'Seguí. Hay gente esperando que le mires las cosas.'
        ]
      };
    }
    return {
      clave: 'durmiente', num: 'XXII', nombre: 'La Durmiente',
      lectura: 'Pasar al lado y seguir de largo.',
      astro: '☽', astroNombre: 'la Luna',
      parrafos: [
        'No encontraste ninguna. Ocho veces algo estuvo a punto de mostrarse y ' +
        'ocho veces se cerró antes.',
        'No es un reproche: así se atraviesa casi todo. Uno pasa al lado de las ' +
        'cosas raras y sigue de largo porque tiene cosas que hacer.',
        'Pero fijate que igual llegaste hasta acá, y que todo lo que viste esta ' +
        'noche lo pusiste vos. Eso solo ya es bastante más de lo que hace la ' +
        'mayoría con los ojos abiertos.',
        'Volvé a intentarlo. Las cosas siguen ahí, esperando que alguien las mire.'
      ]
    };
  }

  /* ============ la carta, la de papel ============

     Lo único del juego que no es del sueño. El arcano XXII habla de lo que hizo
     el jugador; esto lo escribe Nico y va directo a Bel.

     Es un borrador: la idea es que Nico lo reescriba con sus palabras. Está
     armado para que se pueda cambiar entero sin tocar nada más — un array de
     párrafos y la firma. */
  var CARTA_PARA_BEL = {
    parrafos: [
      'Bel:',
      'Te hice un juego. Te vas a dar cuenta enseguida de que no soy ' +
      'programador de juegos, pero me pareció que era la forma más linda de ' +
      'decirte algo que en persona me sale peor.',
      'Todo el juego se trata de una sola cosa: mirar algo hasta que muestra lo ' +
      'que es. Lo puse ahí porque es lo que te vi hacer siempre. Te sentás ' +
      'enfrente de alguien, escuchás un rato, y ves lo que la persona todavía no ' +
      'se animó a decir. No lo estudiaste en ningún lado. Lo tenés.',
      'Y como en el juego, casi nadie se queda el segundo de más que hace falta ' +
      'para que las cosas se rindan. Vos sí.',
      'Ojalá te guste. Y si algo no funciona, avisame que lo arreglo.'
    ],
    firma: 'Nico'
  };

  return {
    PASOS: PASOS, ARRANQUE: ARRANQUE,
    CARTAS: CARTAS, LUGARES: LUGARES, CARTA_PARA_BEL: CARTA_PARA_BEL,
    carta: carta, lugar: lugar, destino: destino,
    final: final, cartaDeElla: cartaDeElla
  };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = Guion; }
