/* El sonido.

   Todo sintetizado: osciladores, ruido filtrado y una reverb hecha con un
   impulso generado por código. Cero archivos, igual que el dibujo.

   Arranca en silencio a propósito. Los navegadores no dejan sonar nada hasta
   que hay un gesto del usuario, y además un juego que se abre haciendo ruido
   sin avisar es hostil. Hay un botón para prenderlo. */
var Audio2 = (function () {
  'use strict';

  var ac = null;
  var maestro = null, aReverb = null, seco = null;
  var encendido = false;
  var colchon = null;

  /* La escala. Todo el juego suena sobre un La menor con la sexta, que da
     esa cosa suspendida de no terminar de resolver nunca. */
  var BASE = 55;                                    // La1
  var GRADOS = [0, 3, 5, 7, 10, 12, 15, 17, 19, 22, 24];

  function nota(grado, octava) {
    var g = GRADOS[((grado % GRADOS.length) + GRADOS.length) % GRADOS.length];
    return BASE * Math.pow(2, (g + (octava || 0) * 12) / 12);
  }

  /* Un impulso de reverb generado a mano: ruido que decae. Sale más barato que
     traer un archivo y para una sala imaginaria alcanza de sobra. */
  function impulso(segundos, caida) {
    var n = Math.floor(ac.sampleRate * segundos);
    var buf = ac.createBuffer(2, n, ac.sampleRate);
    for (var c = 0; c < 2; c++) {
      var d = buf.getChannelData(c);
      for (var i = 0; i < n; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, caida);
      }
    }
    return buf;
  }

  function ruido(segundos) {
    var n = Math.floor(ac.sampleRate * segundos);
    var buf = ac.createBuffer(1, n, ac.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  /* Arranca el contexto. Tiene que llamarse desde un gesto del usuario. */
  function prender() {
    if (ac) {
      if (ac.state === 'suspended') ac.resume();
      encendido = true;
      if (maestro) maestro.gain.setTargetAtTime(volumen, ac.currentTime, .4);
      return true;
    }
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return false;
    ac = new Ctor();

    maestro = ac.createGain();
    maestro.gain.value = 0;
    maestro.connect(ac.destination);

    var rev = ac.createConvolver();
    rev.buffer = impulso(3.6, 2.6);
    aReverb = ac.createGain();
    aReverb.gain.value = .55;
    aReverb.connect(rev);
    rev.connect(maestro);

    seco = ac.createGain();
    seco.gain.value = .85;
    seco.connect(maestro);

    encendido = true;
    maestro.gain.setTargetAtTime(volumen, ac.currentTime, .8);
    arrancarColchon();
    return true;
  }

  /* Volumen general, de 0 a 1. El mute es un caso de esto, no algo aparte. */
  var volumen = .9;
  function ponerVolumen(v) {
    volumen = Math.max(0, Math.min(1, v));
    if (ac && encendido) maestro.gain.setTargetAtTime(volumen, ac.currentTime, .12);
    return volumen;
  }
  function volumenActual() { return volumen; }

  function apagar() {
    if (!ac) return;
    encendido = false;
    maestro.gain.setTargetAtTime(0, ac.currentTime, .3);
  }

  /* Baja el colchon despacio y corta su reloj. Se usa al terminar la partida:
     el ambiente no tiene que seguir sonando debajo del final. */
  function dormirColchon(segundos) {
    if (!colchon || !ac) return;
    var t0 = ac.currentTime;
    colchon.voces.forEach(function (v) {
      v.g.gain.cancelScheduledValues(t0);
      v.g.gain.setTargetAtTime(0, t0, (segundos || 3) / 3);
    });
    if (colchon.reloj) { clearInterval(colchon.reloj); colchon.reloj = null; }
  }

  function alternar() {
    if (!ac || !encendido) { prender(); return true; }
    apagar();
    return false;
  }

  function activo() { return !!(ac && encendido && ac.state === 'running'); }

  /* Los navegadores suspenden el contexto cuando la pestana pasa a segundo
     plano y no siempre lo retoman solos: al volver, el juego quedaba mudo. */
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && ac && encendido && ac.state === 'suspended') {
        ac.resume();
      }
    });
  }

  /* Conecta una fuente a la mezcla, con su porción de reverb. */
  function enchufar(nodo, envio) {
    nodo.connect(seco);
    var e = ac.createGain();
    e.gain.value = envio === undefined ? .5 : envio;
    nodo.connect(e);
    e.connect(aReverb);
  }

  /* ---------- el colchón ---------- */

  /* Dos voces muy graves que laten una contra la otra, y cada tanto una nota
     suelta arriba. Es lo que hace que el silencio no sea silencio. */
  function arrancarColchon() {
    if (colchon) return;
    colchon = { voces: [], reloj: null };

    [[0, -1], [4, -1], [7, 0]].forEach(function (par, i) {
      var o = ac.createOscillator();
      o.type = 'sine';
      o.frequency.value = nota(par[0], par[1]);
      // Un desafine mínimo entre voces: sin esto suena a sintetizador barato.
      o.detune.value = (i - 1) * 6;

      var g = ac.createGain();
      g.gain.value = 0;
      g.gain.setTargetAtTime(.055 - i * .012, ac.currentTime, 3);

      // Latido lento, distinto para cada voz.
      var lfo = ac.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = .05 + i * .017;
      var prof = ac.createGain();
      prof.gain.value = .022;
      lfo.connect(prof); prof.connect(g.gain);
      lfo.start();

      var filtro = ac.createBiquadFilter();
      filtro.type = 'lowpass';
      filtro.frequency.value = 420;
      filtro.Q.value = .6;

      o.connect(g); g.connect(filtro);
      enchufar(filtro, .6);
      o.start();
      colchon.voces.push({ o: o, g: g, lfo: lfo, filtro: filtro });
    });

    // Aire: ruido rosa muy filtrado, apenas audible.
    var f = ac.createBufferSource();
    f.buffer = ruido(4);
    f.loop = true;
    var fl = ac.createBiquadFilter();
    fl.type = 'lowpass'; fl.frequency.value = 260;
    var fg = ac.createGain(); fg.gain.value = .012;
    f.connect(fl); fl.connect(fg);
    enchufar(fg, .4);
    f.start();
    colchon.aire = f;

    // Una nota suelta cada tanto, para que el ambiente respire.
    colchon.reloj = setInterval(function () {
      if (!activo()) return;
      if (Math.random() < .55) gota(4 + Math.floor(Math.random() * 5), 1);
    }, 4200);
  }

  /* Cada lugar tiene su color: mueve la afinacion del colchon y la apertura
     del filtro. Es sutil a proposito — se nota al cambiar de lugar, no
     escuchando uno solo. */
  var COLORES = {
    montania: { grados: [0, 3, 7], filtro: 380, brillo: -4 },
    platillo: { grados: [0, 5, 10], filtro: 620, brillo: 8 },
    calesita: { grados: [0, 4, 7], filtro: 520, brillo: 3 },
    laguna:   { grados: [0, 3, 10], filtro: 300, brillo: -8 },
    faro:     { grados: [0, 4, 9], filtro: 560, brillo: 5 },
    casa:     { grados: [0, 4, 7], filtro: 460, brillo: 2 },
    arbol:    { grados: [0, 5, 9], filtro: 430, brillo: 0 },
    reloj:    { grados: [0, 3, 6], filtro: 350, brillo: -6 },
    luna:     { grados: [0, 5, 12], filtro: 660, brillo: 6 },
    puerta:   { grados: [0, 4, 10], filtro: 500, brillo: 1 },
    ruina:    { grados: [0, 1, 6], filtro: 260, brillo: -10 },
    bandada:  { grados: [0, 7, 12], filtro: 700, brillo: 7 },
    barca:    { grados: [0, 5, 7], filtro: 420, brillo: -2 },
    cama:     { grados: [0, 4, 7], filtro: 340, brillo: -3 }
  };

  /* Reafina el colchon al llegar a un lugar. Sin esto los ocho pasos suenan
     exactamente igual y el sonido deja de contar nada. */
  function colorDe(clave) {
    if (!activo() || !colchon) return;
    var c = COLORES[clave] || COLORES.casa;
    var t0 = ac.currentTime;
    colchon.voces.forEach(function (v, i) {
      var g = c.grados[i % c.grados.length];
      var oct = i === 2 ? 0 : -1;
      v.o.frequency.setTargetAtTime(nota(g, oct), t0, 1.6);
      v.o.detune.setTargetAtTime((i - 1) * 6 + c.brillo, t0, 1.6);
      if (v.filtro) v.filtro.frequency.setTargetAtTime(c.filtro, t0, 1.6);
    });
  }

  /* Cuanto pesa el colchon. Arranca en dos voces apenas audibles y termina en
     un acorde completo: la partida se escucha ir hacia algun lado, en vez de
     sonar igual del primer paso al ultimo. */
  var tensionAudio = 0;

  function tensar(nivel) {
    tensionAudio = Math.max(0, Math.min(1, nivel));
    if (!activo() || !colchon) return;
    var t0 = ac.currentTime;
    colchon.voces.forEach(function (v, i) {
      // La voz aguda es la que mas crece: es la que se nota.
      var base = .055 - i * .012;
      var suma = tensionAudio * (i === 2 ? .055 : .022);
      v.g.gain.cancelScheduledValues(t0);
      v.g.gain.setTargetAtTime(base + suma, t0, 2.2);
      if (v.filtro) {
        v.filtro.frequency.setTargetAtTime(
          v.filtro.frequency.value * (1 + tensionAudio * .55), t0, 2.2);
      }
    });
    // Y una cuarta voz que solo aparece pasada la mitad.
    if (tensionAudio > .5 && !colchon.cuarta) agregarCuarta();
  }

  /* La voz de mas: entra sola cuando la partida ya avanzo, dos octavas arriba,
     como un armonico que estaba y recien ahora se escucha. */
  function agregarCuarta() {
    if (!ac || !colchon || colchon.cuarta) return;
    var o = ac.createOscillator();
    o.type = 'sine';
    o.frequency.value = nota(7, 1);
    o.detune.value = 4;
    var g = ac.createGain();
    g.gain.value = 0;
    g.gain.setTargetAtTime(.026, ac.currentTime, 4);
    var lfo = ac.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = .038;
    var prof = ac.createGain();
    prof.gain.value = .014;
    lfo.connect(prof); prof.connect(g.gain);
    lfo.start();
    var fl = ac.createBiquadFilter();
    fl.type = 'lowpass'; fl.frequency.value = 900; fl.Q.value = .7;
    o.connect(g); g.connect(fl);
    enchufar(fl, .75);
    o.start();
    colchon.cuarta = { o: o, g: g, lfo: lfo, filtro: fl };
    colchon.voces.push(colchon.cuarta);
  }

  /* ---------- sonidos sueltos ---------- */

  /* Una nota corta, tipo campana. El ladrillo de casi todo lo demás. */
  /* Cuantas notas pueden estar sonando a la vez. Sin tope, jugar rapido apila
     decenas de osciladores y la mezcla se satura hasta distorsionar. */
  var TOPE_VOCES = 14;
  var vivas = 0;

  function gota(grado, octava, volumen, duracion) {
    if (!activo()) return;
    if (vivas >= TOPE_VOCES) return;
    vivas++;
    var t0 = ac.currentTime;
    var dur = duracion || 2.6;
    var o = ac.createOscillator();
    o.type = 'sine';
    o.frequency.value = nota(grado, octava === undefined ? 1 : octava);
    var g = ac.createGain();
    var v = (volumen === undefined ? .10 : volumen);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(v, t0 + .012);
    g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    // Un armónico arriba le da el brillo de campana.
    var o2 = ac.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = o.frequency.value * 2.02;
    var g2 = ac.createGain();
    g2.gain.setValueAtTime(0, t0);
    g2.gain.linearRampToValueAtTime(v * .3, t0 + .01);
    g2.gain.exponentialRampToValueAtTime(.0001, t0 + dur * .5);
    o.connect(g); o2.connect(g2);
    enchufar(g, .7); enchufar(g2, .7);
    o.start(t0); o2.start(t0);
    o.stop(t0 + dur + .1); o2.stop(t0 + dur + .1);
    o.onended = function () {
      vivas = Math.max(0, vivas - 1);
      // Soltar los nodos: sin esto el grafo crece toda la partida.
      try { g.disconnect(); g2.disconnect(); } catch (e) {}
    };
  }

  /* El roce de una carta al pasarle por encima. */
  function roce() {
    if (!activo()) return;
    var t0 = ac.currentTime;
    var f = ac.createBufferSource();
    f.buffer = ruido(.25);
    var fl = ac.createBiquadFilter();
    fl.type = 'bandpass';
    fl.frequency.setValueAtTime(1800, t0);
    fl.frequency.exponentialRampToValueAtTime(3400, t0 + .14);
    fl.Q.value = 1.4;
    var g = ac.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(.05, t0 + .02);
    g.gain.exponentialRampToValueAtTime(.0001, t0 + .18);
    f.connect(fl); fl.connect(g);
    enchufar(g, .3);
    f.start(t0); f.stop(t0 + .3);
  }

  /* La carta al jugarse: un golpe corto y seco, más su nota. */
  function golpe(grado) {
    if (!activo()) return;
    var t0 = ac.currentTime;
    var f = ac.createBufferSource();
    f.buffer = ruido(.3);
    var fl = ac.createBiquadFilter();
    fl.type = 'lowpass';
    fl.frequency.setValueAtTime(2600, t0);
    fl.frequency.exponentialRampToValueAtTime(240, t0 + .18);
    var g = ac.createGain();
    g.gain.setValueAtTime(.12, t0);
    g.gain.exponentialRampToValueAtTime(.0001, t0 + .26);
    f.connect(fl); fl.connect(g);
    enchufar(g, .35);
    f.start(t0); f.stop(t0 + .4);
    gota(grado === undefined ? 0 : grado, 1, .09, 3.2);
  }

  /* Un tic corto. Se usa para marcar el paso del anillo: cuanto mas cerca de
     la marca, mas agudo. Es la unica pista sonora del instante. */
  function tic(cercania) {
    if (!activo()) return;
    var t0 = ac.currentTime;
    var o = ac.createOscillator();
    o.type = 'triangle';
    o.frequency.value = 700 + cercania * 900;
    var g = ac.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(.025 + cercania * .05, t0 + .004);
    g.gain.exponentialRampToValueAtTime(.0001, t0 + .09);
    o.connect(g);
    enchufar(g, .2);
    o.start(t0); o.stop(t0 + .12);
  }

  /* ---------- la transformación ---------- */

  /* El sonido de la mutación tiene que durar lo mismo que el vuelo de las
     piezas: un barrido que sube mientras se desarma y una resolución cuando
     aterriza. El caracter lo pone el tono de la carta. */
  function transformar(tono, semilla) {
    if (!activo()) return;
    var t0 = ac.currentTime;
    var dur = 2.4;
    var luz = tono !== 'sombra';

    // Barrido: ruido pasado por un filtro que se abre.
    var f = ac.createBufferSource();
    f.buffer = ruido(3);
    var fl = ac.createBiquadFilter();
    fl.type = 'bandpass';
    fl.Q.value = 3.2;
    fl.frequency.setValueAtTime(luz ? 320 : 900, t0);
    fl.frequency.exponentialRampToValueAtTime(luz ? 4200 : 180, t0 + dur * .62);
    fl.frequency.exponentialRampToValueAtTime(luz ? 900 : 420, t0 + dur);
    var g = ac.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(.07, t0 + .3);
    g.gain.setValueAtTime(.07, t0 + dur * .55);
    g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    f.connect(fl); fl.connect(g);
    enchufar(g, .8);
    f.start(t0); f.stop(t0 + dur + .2);

    // Las piezas volando: notas sueltas repartidas en el tiempo.
    var cuantas = 7;
    for (var i = 0; i < cuantas; i++) {
      var cuando = (i / cuantas) * dur * .7;
      var grado = luz ? (2 + i) : (9 - i);
      (function (gr, cu) {
        setTimeout(function () {
          gota(gr, luz ? 2 : 1, .045, 1.8);
        }, cu * 1000);
      })(grado, cuando);
    }

    // La resolución, cuando la figura nueva ya está.
    setTimeout(function () {
      if (!activo()) return;
      gota(0, 1, .10, 3.4);
      gota(luz ? 4 : 3, 1, .07, 3.0);
      gota(luz ? 7 : 6, 2, .05, 2.6);
    }, dur * .78 * 1000);
  }

  /* El acierto: un acorde que sube. El error: una nota sola que cae. Antes los
     dos eran gotas y se confundian. */
  function acierto() {
    if (!activo()) return;
    [0, 4, 7, 11].forEach(function (gr, i) {
      setTimeout(function () { gota(gr, i > 1 ? 2 : 1, .085 - i * .012, 2.6); }, i * 70);
    });
  }
  function fallo() {
    if (!activo()) return;
    var t0 = ac.currentTime;
    var o = ac.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(nota(3, 0), t0);
    o.frequency.exponentialRampToValueAtTime(nota(0, -1), t0 + .55);
    var g = ac.createGain();
    g.gain.setValueAtTime(.09, t0);
    g.gain.exponentialRampToValueAtTime(.0001, t0 + .7);
    o.connect(g);
    enchufar(g, .5);
    o.start(t0); o.stop(t0 + .8);
  }

  /* Al entrar a una escena: dos notas que abren. */
  function entrada() {
    if (!activo()) return;
    gota(0, 0, .09, 3.4);
    setTimeout(function () { gota(4, 1, .06, 2.8); }, 420);
  }

  /* El volteo de la carta final: un roce de papel y su acorde. */
  function volteo() {
    if (!activo()) return;
    var t0 = ac.currentTime;
    var f = ac.createBufferSource();
    f.buffer = ruido(.6);
    var fl = ac.createBiquadFilter();
    fl.type = 'bandpass';
    fl.frequency.setValueAtTime(900, t0);
    fl.frequency.exponentialRampToValueAtTime(2600, t0 + .45);
    fl.Q.value = .9;
    var g = ac.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(.06, t0 + .12);
    g.gain.exponentialRampToValueAtTime(.0001, t0 + .6);
    f.connect(fl); fl.connect(g);
    enchufar(g, .5);
    f.start(t0); f.stop(t0 + .8);
    [0, 7, 12, 16].forEach(function (gr, i) {
      setTimeout(function () { gota(gr, i > 1 ? 2 : 1, .10 - i * .015, 6); }, 380 + i * 420);
    });
  }

  /* El cierre: un acorde largo que se apaga. */
  function final() {
    if (!activo()) return;
    [0, 4, 7, 11].forEach(function (gr, i) {
      setTimeout(function () { gota(gr, i > 1 ? 1 : 0, .085, 6.5); }, i * 620);
    });
  }

  /* Cuántas fuentes hay sonando. Sirve para verificar sin escuchar. */
  function estado() {
    return {
      existe: !!ac,
      encendido: encendido,
      estadoCtx: ac ? ac.state : 'sin contexto',
      volumen: maestro ? Math.round(maestro.gain.value * 100) / 100 : 0,
      colchon: !!colchon,
      voces: colchon ? colchon.voces.length : 0
    };
  }

  /* --- que no siga sonando con la pestaña de fondo ---
     El colchón vive en un setInterval y el AudioContext no se entera de que
     nadie está mirando: una pestaña olvidada seguía sonando sola, sin forma
     de saber de dónde salía. */
  function dormir() {
    if (ac && ac.state === 'running') {
      try { ac.suspend(); } catch (e) { /* nada */ }
    }
  }

  function despertar() {
    if (ac && ac.state === 'suspended' && encendido) {
      try { ac.resume(); } catch (e) { /* nada */ }
    }
  }

  /* Al cerrar la pestaña: cortar de raíz, sin dejar osciladores ni timers. */
  function cerrar() {
    if (colchon && colchon.reloj) { clearInterval(colchon.reloj); colchon.reloj = null; }
    colchon = null;
    encendido = false;
    if (ac) {
      try { ac.close(); } catch (e) { /* nada */ }
      ac = null;
      maestro = null;
    }
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) dormir(); else despertar();
    });
    window.addEventListener('blur', dormir);
    window.addEventListener('focus', despertar);
    window.addEventListener('pagehide', cerrar);
    window.addEventListener('beforeunload', cerrar);

/* ---- señal de silencio entre pestañas ----
   localStorage avisa a las demás pestañas del mismo origen cuando cambia. Una
   página cualquiera de fnguerrero.github.io puede escribir esta marca y todos
   los juegos abiertos se callan solos, sin tener que silenciar el navegador
   entero desde Windows (que también apagaba YouTube). */
(function () {
  function porSenal(e) {
    if (e.key !== 'juegos.silencio') return;
    if (typeof Audio2 !== 'undefined') Audio2.cerrar();
  }
  window.addEventListener('storage', porSenal);

/* ---- auto-silencio por inactividad ----
   La última red, y la única que no depende de nada externo: ni de que la pestaña
   se oculte, ni del origen, ni de que llegue una señal. Tres minutos sin tocar
   una tecla y el juego se calla; vuelve solo al primer toque. Es lo que evita
   que una pestaña olvidada quede sonando toda la tarde. */
(function () {
  var ESPERA = 3 * 60 * 1000;
  var reloj = null;
  var dormido = false;

  function callar() {
    dormido = true;
    if (typeof Audio2 !== 'undefined') Audio2.cerrar();
  }

  function reanudar() {
    if (!dormido) return;
    dormido = false;
    if (typeof Audio2 !== 'undefined') Audio2.despertar();
  }

  function reiniciar() {
    reanudar();
    if (reloj) clearTimeout(reloj);
    reloj = setTimeout(callar, ESPERA);
  }

  ['keydown', 'pointerdown', 'touchstart', 'wheel'].forEach(function (ev) {
    window.addEventListener(ev, reiniciar, { passive: true });
  });
  reiniciar();
})();


  // Si la marca ya estaba puesta al abrir, no se arranca sonando
  try {
    var marca = parseInt(window.localStorage.getItem('juegos.silencio'), 10);
    if (marca && Date.now() - marca < 4000) { if (typeof Audio2 !== 'undefined') Audio2.cerrar(); }
  } catch (err) { /* localStorage puede fallar en file:// */ }
})();

  }

  return {
    prender: prender, apagar: apagar, alternar: alternar, activo: activo,
    gota: gota, roce: roce, golpe: golpe, transformar: transformar,
    dormirColchon: dormirColchon, voces: function () { return vivas; },
    colorDe: colorDe, tic: tic, acierto: acierto, fallo: fallo, volteo: volteo,
    tensar: tensar, tensionAudio: function () { return tensionAudio; },
    ponerVolumen: ponerVolumen, volumenActual: volumenActual,
    entrada: entrada, final: final, estado: estado,
    dormir: dormir, despertar: despertar, cerrar: cerrar
  };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = Audio2; }
