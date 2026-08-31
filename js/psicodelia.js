/* Psicodelia — el pipeline.

   No es un filtro encima del juego: escala con la tension que el juego ya
   llevaba, asi que el primer lugar se ve casi sobrio y para el octavo el mundo
   es otra cosa. Esa progresion es lo unico que cuenta algo; un efecto que esta
   siempre al mango no dice nada.

   ESTRUCTURA. Cada efecto es una capa que declara tres cosas: en que momento
   del cuadro corre (fase), a partir de que tension aparece (umbral), y cuanto
   sale (costo). El pipeline las corre en orden y mide lo que tardan de verdad;
   si el cuadro se pasa del presupuesto, apaga las caras de atras para adelante
   hasta entrar. Sin eso, cincuenta efectos sobre el mismo canvas terminan en
   una presentacion de diapositivas en la primera maquina lenta.

   Las fases son tres:
     'cielo'  despues de pintar el cielo y antes de las figuras. Lo que va aca
              tine el fondo sin llevarse el color de las figuras.
     'post'   sobre el cuadro terminado, deformandolo.
     'sobre'  encima de todo, sin deformar: particulas, destellos, viñeta.

   DOS REGLAS QUE NO SE NEGOCIAN, y que estan puestas como codigo y no como
   buena intencion:

   1. Nada de estroboscopio. Ningun efecto de pantalla completa puede cambiar
      mas rapido que TOPE_HZ. Es la unica forma en que un juego lindo manda a
      alguien al hospital.
   2. Con prefers-reduced-motion queda unicamente el color, quieto. Cero
      movimiento, cero particulas, cero pulsos. */

var Psicodelia = (function () {
  'use strict';

  var TOPE_HZ = 3;              // techo de parpadeo para pantalla completa
  var PRESUPUESTO_MS = 6;       // lo que puede salir todo el post-proceso

  var NIVELES = { suave: .55, normal: 1, extremo: 1.7 };
  var nivel = 'normal';
  try {
    var g = localStorage.getItem('psico.nivel');
    if (g && NIVELES[g]) nivel = g;
  } catch (e) {}

  var activo = true;

  var quieto = false;
  try {
    quieto = window.matchMedia &&
             window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e2) { quieto = false; }

  /* ---------------- lienzos auxiliares ----------------
     Se crean una vez y se redimensionan al vuelo. Crear un canvas por cuadro
     es la forma mas facil de que el recolector de basura arruine la fluidez. */
  var lienzos = {};
  function lienzo(clave, W, H) {
    var l = lienzos[clave];
    if (!l) {
      l = lienzos[clave] = { cv: document.createElement('canvas') };
      l.cx = l.cv.getContext('2d');
    }
    if (l.cv.width !== W || l.cv.height !== H) { l.cv.width = W; l.cv.height = H; }
    return l;
  }

  /* ---------------- el grado ----------------
     Cuanto efecto corresponde ahora mismo. La tension manda, el nivel escala.
     Arranca en .10 y no en cero: que el primer lugar ya tenga algo raro es lo
     que hace que se note que el mundo esta mal desde el principio. */
  function grado(tension, climax) {
    if (!activo) return 0;
    /* El piso es .30 y no .10.

       Con .10 el juego arrancaba tecnicamente correcto y practicamente negro:
       brillo medio de 17 sobre 255 en los trece lugares, con menos del 5% de
       pixeles claros. En un monitor eso no es "sobrio", es una pantalla
       apagada. Las capas de luz —aura, contraluz, plasma, suelo— tienen sus
       umbrales entre .18 y .25, asi que ninguna llegaba a encenderse en el
       primer lugar y la escena quedaba a oscuras esperando una tension que
       todavia no existia.

       Con .30 el primer lugar ya tiene luz propia y el recorrido hasta el
       octavo sigue siendo igual de largo: lo que cambia es de donde arranca,
       no cuanto sube. */
    var base = .30 + Math.min(1, (tension || 0) * .78 + (climax || 0) * .45) * .70;
    return Math.min(1.7, base * NIVELES[nivel]);
  }

  /* ---------------- guarda anti-estroboscopio ----------------
     Cualquier capa que quiera pulsar pantalla completa pide su valor aca. La
     funcion no deja que el ciclo suba de TOPE_HZ, sea cual sea la frecuencia
     que le pidan: en vez de confiar en que cada capa se porte bien, el limite
     esta en el unico lugar por el que pasan todas. */
  function pulso(t, hz, minimo, maximo) {
    var f = Math.min(TOPE_HZ, Math.abs(hz || 1));
    var v = (Math.sin(t * f * 6.2832) + 1) / 2;
    var lo = (minimo === undefined) ? 0 : minimo;
    var hi = (maximo === undefined) ? 1 : maximo;
    return lo + v * (hi - lo);
  }

  /* ---------------- registro de capas ---------------- */
  var CALENTAMIENTO = 20;       // muestras a descartar por capa
  var capas = [];
  var costos = {};              // promedio movil de ms por capa
  var muestras = {};
  var apagadasPorCosto = {};

  /* opciones: fase, umbral (0-1 de grado), movimiento (si es true no corre con
     reduced-motion), caro (candidata a apagarse cuando no entra en presupuesto) */
  function capa(nombre, opciones, correr) {
    capas.push({
      nombre: nombre,
      fase: opciones.fase || 'post',
      umbral: opciones.umbral || 0,
      movimiento: opciones.movimiento !== false,
      caro: !!opciones.caro,
      correr: correr
    });
  }

  function corresponde(c, n) {
    if (n <= .001) return false;
    if (n < c.umbral) return false;
    if (quieto && c.movimiento) return false;
    if (apagadasPorCosto[c.nombre]) return false;
    return true;
  }

  /* Corre las capas de una fase y mide lo que tardan. El promedio movil evita
     que un pico suelto apague una capa para siempre. */
  function correrFase(fase, ctx) {
    var total = 0;
    for (var i = 0; i < capas.length; i++) {
      var c = capas[i];
      if (c.fase !== fase || !corresponde(c, ctx.n)) continue;
      var t0 = performance.now();
      try {
        c.correr(ctx);
      } catch (e) {
        /* Una capa que revienta no puede llevarse el cuadro puesto: se anota y
           se apaga, y el juego sigue dibujando. */
        apagadasPorCosto[c.nombre] = 'error: ' + e.message;
        continue;
      }
      var ms = performance.now() - t0;
      /* Las primeras muestras de cada capa se descartan: el primer cuadro paga
         compilacion del codigo y creacion de texturas, y da valores cien veces
         mas altos que el regimen. Sin este descarte el presupuesto apagaba
         capas que en realidad salen centesimas de milisegundo. */
      muestras[c.nombre] = (muestras[c.nombre] || 0) + 1;
      if (muestras[c.nombre] > CALENTAMIENTO) {
        var previo = costos[c.nombre];
        /* Los picos sueltos tampoco cuentan. El canvas encola comandos y los
           ejecuta cuando quiere, asi que de vez en cuando una capa paga el
           vaciado de todo lo anterior y mide cien veces su costo real. Medido:
           deformar da 0,23 ms de verdad y 96 en el cuadro donde le toca pagar
           el vaciado. Sin este filtro, el presupuesto apagaba justo las capas
           que mas dibujan, que son las que se notan. */
        if (previo === undefined) costos[c.nombre] = ms;
        else if (ms < previo * 10 + 1) costos[c.nombre] = previo * .85 + ms * .15;
        total += Math.min(ms, (previo === undefined ? ms : previo * 3 + 1));
      }
    }
    return total;
  }

  /* Presupuesto: si el post-proceso se pasa, se apaga la capa cara mas lenta.
     Se revisa cada tanto y no en cada cuadro, para que un pico no encienda y
     apague capas a lo loco — el parpadeo de un efecto que va y viene molesta
     mas que el efecto mismo. */
  var gastoUltimo = 0, revisiones = 0;
  function revisarPresupuesto(gasto) {
    gastoUltimo = gastoUltimo * .9 + gasto * .1;
    if (++revisiones % 30 !== 0) return;
    if (gastoUltimo <= PRESUPUESTO_MS) {
      // Sobra presupuesto: probar de nuevo con una de las apagadas.
      if (revisiones % 600 === 0) reintentarUna();
      return;
    }
    var peor = null;
    for (var i = 0; i < capas.length; i++) {
      var c = capas[i];
      if (!c.caro || apagadasPorCosto[c.nombre]) continue;
      if (!peor || (costos[c.nombre] || 0) > (costos[peor.nombre] || 0)) peor = c;
    }
    if (peor) {
      apagadasPorCosto[peor.nombre] = 'presupuesto';
      gastoUltimo = 0;
    }
  }

  /* Cada tanto se le devuelve la oportunidad a una capa apagada por costo. Una
     maquina puede estar lenta un rato — otra pestaña, una descarga— y quedarse
     sin la mitad de los efectos para siempre por un mal minuto es peor que
     medir de nuevo y volver a apagarla si de verdad no entra. */
  function reintentarUna() {
    for (var k in apagadasPorCosto) {
      if (apagadasPorCosto[k] === 'presupuesto') {
        delete apagadasPorCosto[k];
        delete costos[k];
        muestras[k] = 0;
        return k;
      }
    }
    return null;
  }

  /* ---------------- audio reactivo ----------------
     El nivel lo empuja el modulo de audio; aca solo se guarda suavizado. Si
     nadie lo alimenta queda en cero y las capas que lo usan no hacen nada, que
     es lo correcto: el juego se tiene que poder jugar en silencio. */
  var audio = 0;
  function alimentarAudio(v) {
    if (typeof v !== 'number' || !isFinite(v)) return;
    audio = audio * .78 + Math.max(0, Math.min(1, v)) * .22;
  }

  /* ---------------- lo que pasa en la escena ----------------
     Las capas necesitan saber donde esta la figura, de que color es el lugar y
     donde cae el piso: sin eso solo pueden hacer efectos de pantalla completa,
     que son los que se notan como filtro pegado encima. El juego empuja estos
     datos una vez por cuadro. */
  var escena = { fx: 0, fy: 0, E: 1, piso: 0, color: '200,200,255',
                 lugar: '', belX: .2, belY: 0, u: 1 };
  function ponerEscena(d) {
    if (!d) return;
    for (var k in d) if (d[k] !== undefined) escena[k] = d[k];
  }

  /* ---------------- eventos ----------------
     Un acierto o un cambio de lugar duran un instante y varias capas quieren
     reaccionar. En vez de que cada una se entere por su cuenta, se anota
     cuando paso y cada capa pregunta cuanto hace. */
  var eventos = {};
  var relojEscena = 0;
  function evento(nombre) { eventos[nombre] = relojEscena; }
  function desde(nombre) {
    var t = eventos[nombre];
    return (t === undefined) ? Infinity : (relojEscena - t);
  }

  /* ---------------- API que usa el juego ---------------- */

  function veloFondo(tension, climax) {
    var n = grado(tension, climax);
    if (n <= .001 || quieto) return 1;
    return 1 - Math.min(.34, n * .30);
  }

  function armarCtx(cx, cv, W, H, t, tension, climax) {
    relojEscena = t;
    return {
      cx: cx, cv: cv, W: W, H: H, t: t,
      tension: tension || 0, climax: climax || 0,
      n: grado(tension, climax),
      nivel: nivel, audio: audio,
      escena: escena, desde: desde,
      lienzo: lienzo, pulso: pulso
    };
  }

  // Fase 'cielo': tine el fondo, antes de que se dibujen las figuras.
  function tinte(cx, W, H, t, tension, climax) {
    var ctx = armarCtx(cx, null, W, H, t, tension, climax);
    correrFase('cielo', ctx);
  }

  // Fase 'post' + 'sobre': el cuadro ya esta dibujado.
  function despues(cx, cv, W, H, t, tension, climax) {
    if (W < 2 || H < 2) return;
    var ctx = armarCtx(cx, cv, W, H, t, tension, climax);
    if (ctx.n <= .001) return;
    var gasto = correrFase('post', ctx) + correrFase('sobre', ctx);
    revisarPresupuesto(gasto);
  }

  function filtroCss(t, tension, climax) {
    var n = grado(tension, climax);
    if (n <= .001) return 'none';
    /* Saturacion sola: el tono lo mueven las capas de color, y rotarlo tambien
       aca peleaba contra ellas. */
    return 'saturate(' + (1 + Math.min(.9, n * .55)).toFixed(2) + ')';
  }

  /* ---------------- control ---------------- */
  function ponerNivel(n) {
    if (!NIVELES[n]) return { error: 'nivel invalido', validos: Object.keys(NIVELES) };
    nivel = n;
    try { localStorage.setItem('psico.nivel', n); } catch (e) {}
    // Un nivel nuevo merece otra oportunidad para las capas apagadas por costo.
    for (var k in apagadasPorCosto) {
      if (apagadasPorCosto[k] === 'presupuesto') delete apagadasPorCosto[k];
    }
    gastoUltimo = 0;
    return estado();
  }

  function estado() {
    var activas = [], apagadas = [];
    var n = grado(1, 0);
    for (var i = 0; i < capas.length; i++) {
      var c = capas[i];
      (corresponde(c, n) ? activas : apagadas).push(c.nombre);
    }
    return {
      activo: activo, nivel: nivel, escala: NIVELES[nivel], quieto: quieto,
      audio: +audio.toFixed(3), capas: capas.length,
      activas: activas, apagadas: apagadas,
      apagadasPorCosto: apagadasPorCosto,
      gasto: +gastoUltimo.toFixed(2), presupuesto: PRESUPUESTO_MS
    };
  }

  function costo() {
    var salida = {}, total = 0;
    for (var k in costos) { salida[k] = +costos[k].toFixed(3); total += costos[k]; }
    return { porCapa: salida, total: +total.toFixed(3), presupuesto: PRESUPUESTO_MS };
  }

  function encender(f) {
    activo = true;
    if (typeof f === 'string' && NIVELES[f]) ponerNivel(f);
    return estado();
  }
  function apagar() { activo = false; return { activo: activo }; }

  return {
    encender: encender, apagar: apagar,
    ponerNivel: ponerNivel, estado: estado, costo: costo,
    alimentarAudio: alimentarAudio,
    capa: capa, lienzo: lienzo, pulso: pulso, reintentarUna: reintentarUna,
    /* Solo para verificar: prefers-reduced-motion no se puede cambiar desde la
       pagina, y sin poder simularlo la promesa de "con reduced-motion no se
       mueve nada" queda sin comprobar, que es como no tenerla. */
    simularQuieto: function (v) { quieto = !!v; return quieto; },
    escena: ponerEscena, evento: evento, desde: desde,
    get activo() { return activo; },
    get nivel() { return nivel; },
    get quieto() { return quieto; },
    get TOPE_HZ() { return TOPE_HZ; },
    grado: grado, veloFondo: veloFondo, tinte: tinte,
    filtroCss: filtroCss, despues: despues
  };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = Psicodelia; }
