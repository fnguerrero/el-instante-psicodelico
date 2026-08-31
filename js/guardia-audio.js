/* guardia-audio.js — red de seguridad para los juegos empaquetados.

   Los HTML autocontenidos (dist/, mockups) traen el audio adentro y no comparten
   el js/audio.js que se arregló módulo por módulo. En vez de parchear cada
   bundle, este guardián se mete antes que todo y envuelve el constructor de
   AudioContext: lleva registro de los contextos que el juego crea y los suspende
   cuando corresponde, sin saber nada de cómo funciona el juego por dentro.

   Tres motivos para callarse, de más suave a más definitivo:
     · pestaña oculta o ventana sin foco
     · señal de silencio de otra pestaña del mismo origen
     · tres minutos sin tocar una tecla (la única que no depende de nada) */
(function () {
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC || typeof Proxy === 'undefined') return;

  var vivos = [];
  var vigilado = new Proxy(AC, {
    construct: function (destino, args) {
      var ctx = Reflect.construct(destino, args);
      vivos.push(ctx);
      return ctx;
    }
  });
  window.AudioContext = vigilado;
  if (window.webkitAudioContext) window.webkitAudioContext = vigilado;

  function callar() {
    vivos.forEach(function (c) {
      try { if (c.state === 'running') c.suspend(); } catch (e) { }
    });
  }

  function despertar() {
    vivos.forEach(function (c) {
      try { if (c.state === 'suspended') c.resume(); } catch (e) { }
    });
  }

  function cerrar() {
    vivos.forEach(function (c) { try { c.close(); } catch (e) { } });
    vivos = [];
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) callar();
  });
  window.addEventListener('blur', callar);
  window.addEventListener('pagehide', cerrar);

  window.addEventListener('storage', function (e) {
    if (e.key === 'juegos.silencio') cerrar();
  });

  // Sin actividad no hay nadie escuchando: a los tres minutos se corta solo
  var ESPERA = 3 * 60 * 1000;
  var reloj = null;
  var dormido = false;

  function porInactividad() {
    dormido = true;
    callar();
  }

  function reiniciar() {
    if (dormido) { dormido = false; despertar(); }
    if (reloj) clearTimeout(reloj);
    reloj = setTimeout(porInactividad, ESPERA);
  }

  ['keydown', 'pointerdown', 'touchstart', 'wheel'].forEach(function (ev) {
    window.addEventListener(ev, reiniciar, { passive: true });
  });
  reiniciar();
})();
