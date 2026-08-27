/* El juego.

   Cuatro escenas en fila. En cada una te reparten tres cartas de lo que te
   queda del mazo, jugás una, y la escena se transforma en lo que esa carta
   trae. La carta se gasta.

   Eso es todo el sistema. La decisión es qué carta gastás dónde: la que no
   usás ahora la tenés después, y la que usás no vuelve nunca. */
(function () {
  'use strict';

  var cv = document.getElementById('c'), cx = cv.getContext('2d');
  var W = 0, H = 0, t = 0;

  function medir() {
    var d = Math.min(2, window.devicePixelRatio || 1);
    W = cv.clientWidth; H = cv.clientHeight;
    // Sin layout (pestaña oculta) el canvas queda en 0 y cualquier captura sale
    // vacía; con un tamaño de respaldo el juego se puede revisar igual.
    if (W < 2 || H < 2) { W = 1280; H = 760; }
    cv.width = W * d; cv.height = H * d;
    cx.setTransform(d, 0, 0, d, 0, 0);
  }
  window.addEventListener('resize', medir);
  medir();

  var elRelato = document.getElementById('relato');
  var elMano = document.getElementById('mano');
  var elRotulo = document.getElementById('rotulo');
  var elRestan = document.getElementById('restan');
  var elCierre = document.getElementById('cierre');

  var bel = Bel.crear();
  var cielo = Cielo.crear();

  /* Multiplicador de velocidad. Vale 1 jugando; una prueba automatica lo sube
     para recorrer una partida entera en segundos en vez de en minutos. */
  var RITMO = 1;
  function luego(ms, fn) { return setTimeout(fn, ms / RITMO); }

  /* ---------- estado ---------- */
  var J = {
    escena: -1,
    mazo: Guion.CARTAS.map(function (c) { return c.clave; }),
    jugadas: [],
    andando: false,
    // La escena en pantalla.
    figura: 'cama',
    color: '210,190,255',
    pares: null,
    u: 1,
    destino: null,        // { figura, color } hacia donde va
    fogonazo: 0,
    // Bel entra caminando en cada escena.
    belX: -.2,
    belMeta: .22
  };

  /* ---------- utilidades ---------- */

  function mezclarColor(a, b, u) {
    var A = a.split(',').map(Number), B = b.split(',').map(Number);
    return A.map(function (v, i) { return Math.round(v + (B[i] - v) * u); }).join(',');
  }

  function decir(texto, alTerminar) {
    elRelato.classList.remove('ver');
    luego(700, function () {
      elRelato.textContent = texto;
      elRelato.classList.add('ver');
      if (alTerminar) luego(900, alTerminar);
    });
  }

  /* Dónde apoya cada figura, en coordenadas de la propia figura (1 = su borde
     de abajo). null significa que no apoya: flota. */
  var BASES = {
    montania: 1, ruina: 1, arbol: 1, casa: .96, puerta: .90, cama: .62,
    calesita: .68, faro: 1, laguna: 1, reloj: 1,
    platillo: null, luna: null, bandada: null,
    // La barca no toca el piso: flota sobre el agua, un poco mas abajo del centro.
    barca: null
  };

  /* Donde se planta Bel en cada escena, como fraccion del ancho. Cuanto mas
     grande o mas alto es lo que mira, mas lejos se para. */
  var LEJANIA = {
    cama: .30, casa: .26, puerta: .30, calesita: .24,
    laguna: .16, faro: .22, reloj: .26, montania: .18
  };

  /* La altura a la que va la figura. Durante una transformación se interpola
     entre las dos, así una casa que se vuelve platillo despega en vez de
     saltar de golpe. */
  function alturaDe(figura, destino, u, piso, E) {
    var aire = piso - E * 1.02;
    function y(clave) {
      var b = BASES[clave];
      return (b === null || b === undefined) ? aire : piso - E * b;
    }
    var a = y(figura);
    if (!destino) return a;
    var b = y(destino.figura);
    var f = u * u * (3 - 2 * u);
    return a + (b - a) * f;
  }

  /* Baraja sin repetir. El orden importa poco, pero que sea distinto cada
     partida es lo que hace que se pueda volver a jugar. */
  function repartir(n) {
    var copia = J.mazo.slice();
    for (var i = copia.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var x = copia[i]; copia[i] = copia[j]; copia[j] = x;
    }
    return copia.slice(0, Math.min(n, copia.length));
  }

  /* ---------- el hilo del juego ---------- */

  function empezar() {
    document.getElementById('portada').classList.add('ido');
    luego(1500, siguienteEscena);
  }

  function siguienteEscena() {
    J.escena++;
    if (J.escena >= Guion.ESCENAS.length) return terminar();

    var e = Guion.ESCENAS[J.escena];
    J.figura = e.figura;
    J.color = '210,190,255';
    J.u = 1; J.destino = null; J.pares = null;
    /* Bel vuelve a entrar caminando: cada escena es un lugar nuevo. Se para
       mas cerca o mas lejos segun el tamano de lo que tiene delante — a una
       montana rusa uno no se le para al lado. */
    J.belX = -.15;
    J.belMeta = LEJANIA[e.figura] === undefined ? .26 : LEJANIA[e.figura];
    J.andando = true;

    elRotulo.textContent = e.titulo;
    elRotulo.classList.add('ver');
    elRestan.classList.add('ver');
    actualizarRestan();

    Audio2.entrada();
    decir(e.entrada, function () { mostrarMano(e); });
  }

  function actualizarRestan() {
    var n = J.mazo.length;
    elRestan.textContent = n === 1 ? 'queda 1 carta' : 'quedan ' + n + ' cartas';
  }

  function mostrarMano(e) {
    var claves = repartir(3);
    elMano.innerHTML = '';
    elMano.classList.remove('fuera');

    claves.forEach(function (clave, i) {
      var c = Guion.carta(clave);
      var el = document.createElement('button');
      el.className = 'carta';
      el.style.setProperty('--giro', ((i - (claves.length - 1) / 2) * 5) + 'deg');
      el.innerHTML =
        '<span class="glifo">' + c.glifo + '</span>' +
        '<span class="nom">' + c.nombre + '</span>' +
        '<span class="lec">' + c.lectura + '</span>';
      el.addEventListener('click', function () { jugar(c, e); });
      el.addEventListener('mouseenter', function () { Audio2.roce(); });
      // En tactil no hay hover: el roce suena al tocar, y la carta se juega
      // ahi mismo en vez de esperar a que termine el tap.
      el.addEventListener('touchstart', function (ev) {
        ev.preventDefault();
        Audio2.roce();
        jugar(c, e);
      }, { passive: false });
      elMano.appendChild(el);
      /* Entran de a una, no todas de golpe. El reflow forzado antes de poner
         la clase no es un adorno: sin el, el navegador puede no llegar a
         registrar el estado inicial y la carta se queda clavada a mitad de
         camino, con la clase puesta y el transform sin aplicar. */
      void el.offsetWidth;
      luego(90 + i * 130, function () {
        void el.offsetWidth;
        el.classList.add('entra');
      });
    });
  }

  function jugar(c, e) {
    if (J.u < 1) return;
    // Una carta gastada no se vuelve a jugar. La clase .fuera ya bloquea el
    // mouse, pero eso es CSS: esta es la guarda de verdad.
    if (J.mazo.indexOf(c.clave) === -1) return;

    // La carta se gasta: es lo único que hace que elegir tenga peso.
    J.mazo = J.mazo.filter(function (k) { return k !== c.clave; });
    J.jugadas.push(c.clave);

    // La Estrella no trae figura propia: saca la que la escena esconde.
    var destino = c.revela ? e.revela : c.figura;

    J.pares = Figuras.preparar(J.figura, destino);
    J.destino = { figura: destino, color: c.color };
    J.u = 0;
    J.fogonazo = 1;

    elMano.classList.add('fuera');
    elRelato.classList.remove('ver');
    actualizarRestan();

    // El golpe de la carta y despues el barrido de la mutacion, que dura lo
    // mismo que el vuelo de las piezas.
    Audio2.golpe(c.tono === 'sombra' ? 3 : 0);
    Audio2.transformar(c.tono);

    // Lo que pasa delante la alcanza: la onda la empuja y se echa para atras.
    // Con las cartas de sombra el golpe es mas seco.
    bel.empuje = c.tono === 'sombra' ? 1 : .62;
    bel.asombro = 1;

    var dicho = e.dichos[c.clave] || e.dichos.otra;
    // El texto entra cuando la transformación ya se ve, no antes.
    luego(2100, function () {
      decir(dicho, function () { luego(4200, siguienteEscena); });
    });
  }

  function terminar() {
    elRotulo.classList.remove('ver');
    elRelato.classList.remove('ver');
    elRestan.classList.remove('ver');
    elMano.classList.add('fuera');

    var partes = Guion.cierre(J.jugadas);
    elCierre.innerHTML = '';
    partes.forEach(function (p) {
      var el = document.createElement('p');
      el.textContent = p;
      elCierre.appendChild(el);
    });
    var firma = document.createElement('p');
    firma.className = 'firma';
    firma.textContent = 'para Bel';
    elCierre.appendChild(firma);

    var otra = document.createElement('button');
    otra.className = 'boton';
    otra.textContent = 'Volver a dormirse';
    otra.addEventListener('click', function () { location.reload(); });
    elCierre.appendChild(otra);

    Audio2.final();
    luego(1200, function () { elCierre.classList.add('ver'); });
  }

  /* ---------- dibujo ---------- */

  var anterior = performance.now();
  var sinBucle = false;

  function cuadro(ahora) {
    var dt = sinBucle ? 0 : Math.min(.05, (ahora - anterior) / 1000);
    anterior = ahora; t += dt;

    Cielo.actualizar(cielo, dt);

    // Bel entra caminando hasta su marca y ahí se queda.
    if (J.belX < J.belMeta) {
      J.belX = Math.min(J.belMeta, J.belX + dt * .13);
      J.andando = true;
    } else {
      J.andando = false;
    }
    bel.vx = J.andando ? 60 : 0;

    if (J.u < 1) {
      J.u = Math.min(1, J.u + dt * .42 * RITMO);
      if (J.u >= 1 && J.destino) {
        J.figura = J.destino.figura;
        J.color = J.destino.color;
        J.destino = null;
      }
    }
    if (J.fogonazo > 0) J.fogonazo = Math.max(0, J.fogonazo - dt * .5 * RITMO);

    // --- cielo ---
    var g = cx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#070819');
    g.addColorStop(.55, '#0d0d22');
    g.addColorStop(1, '#171130');
    cx.fillStyle = g;
    cx.fillRect(0, 0, W, H);
    Cielo.dibujar(cx, cielo, W, H, t);

    /* En vertical (celular) la pantalla es angosta y alta: si el piso se queda
       abajo del todo, queda un tercio de escena y dos tercios de cielo vacio.
       Se sube el piso y la figura se mide contra el ancho, que es lo escaso. */
    var vertical = H > W * 1.25;
    var piso = H * (vertical ? .80 : .84);

    // --- resplandor de la carta jugada ---
    if (J.fogonazo > 0) {
      var q = J.fogonazo;
      var col = J.destino ? J.destino.color : J.color;
      // Concentrado en la figura: a pantalla completa lavaba todo el cuadro
      // y la escena perdia el color propio.
      var r = cx.createRadialGradient(W * .56, H * .44, 0, W * .56, H * .44, H * .72);
      r.addColorStop(0, 'rgba(' + col + ',' + (.17 * q) + ')');
      r.addColorStop(1, 'rgba(' + col + ',0)');
      cx.fillStyle = r;
      cx.fillRect(0, 0, W, H);
    }

    // --- la figura, en tres capas ---
    var fx = W * (vertical ? .62 : .56);
    var E = vertical ? Math.min(W * .36, H * .24) : Math.min(W * .27, H * .33);
    // Las que se apoyan tienen que tocar el suelo, no flotar sobre él; las que
    // vuelan van arriba. Sin esto una casa queda colgada en el aire.
    var fy = alturaDe(J.figura, J.destino, J.u, piso, E);
    var extra = { perfil: Figuras.perfilMontania(), alPiso: piso - fy };
    var u = J.u;

    if (u >= 1) {
      Pintores.pintar(cx, J.figura, fx, fy, E, t, extra);
    } else {
      var aSale = 1 - Math.min(1, u / .26);
      var aPiezas = Math.min(1, Math.min(u / .16, (1 - u) / .18));
      var aEntra = Math.max(0, (u - .70) / .30);

      if (aSale > .01) {
        cx.save(); cx.globalAlpha = aSale;
        Pintores.pintar(cx, J.figura, fx, fy, E, t, extra);
        cx.restore();
      }
      if (aPiezas > .01 && J.pares) {
        var cc = J.destino ? mezclarColor(J.color, J.destino.color, u) : J.color;
        cx.save(); cx.globalAlpha = aPiezas;
        Figuras.dibujar(cx, J.pares, u, fx, fy, E, cc, t);
        cx.restore();
      }
      if (aEntra > .01 && J.destino) {
        cx.save(); cx.globalAlpha = aEntra;
        Pintores.pintar(cx, J.destino.figura, fx, fy, E, t, extra);
        cx.restore();
      }
    }

    // --- suelo ---
    var s = cx.createLinearGradient(0, piso, 0, H);
    s.addColorStop(0, '#0f0b1a');
    s.addColorStop(1, '#070510');
    cx.fillStyle = s;
    cx.fillRect(0, piso, W, H - piso);
    cx.strokeStyle = 'rgba(180,160,220,.13)';
    cx.lineWidth = 1;
    cx.beginPath(); cx.moveTo(0, piso + .5); cx.lineTo(W, piso + .5); cx.stroke();

    // --- Bel ---
    /* Mira lo que esta pasando: se da vuelta hacia la figura y levanta la
       cabeza segun cuan arriba este. Un platillo la hace mirar al cielo; una
       laguna la hace mirar al piso. */
    var belPantalla = W * J.belX;
    bel.mirando = (fx >= belPantalla) ? 1 : -1;
    var altura = (piso - fy) / Math.max(1, piso);
    var objetivoAlza = Math.max(0, Math.min(1, (altura - .12) * 1.9));
    // En modo captura dt es 0 y la interpolacion no avanzaria nunca: ahi se
    // asienta de una, que es el estado que interesa verificar.
    if (sinBucle) bel.alza = objetivoAlza;
    else bel.alza += (objetivoAlza - bel.alza) * (1 - Math.pow(.02, dt));

    Bel.actualizar(bel, dt, J.andando);
    // La luz de la transformacion la baña a ella tambien.
    var luzEncima = 1 + J.fogonazo * .34;
    // Su altura es una fraccion de la pantalla, no un numero fijo: con 176 px
    // sobre una pantalla alta quedaba del tamano de un icono.
    var escalaBel = (H * (vertical ? .20 : .255)) / 176;
    Bel.dibujar(cx, bel, belPantalla, piso, escalaBel, luzEncima);

    if (!sinBucle) requestAnimationFrame(cuadro);
  }
  requestAnimationFrame(cuadro);

  var elSonido = document.getElementById('sonido');
  var elSonidoIcono = document.getElementById('sonidoIcono');
  function pintarSonido() {
    var on = Audio2.activo();
    elSonido.setAttribute('aria-pressed', on ? 'true' : 'false');
    elSonidoIcono.textContent = on ? '\u266b' : '\u266a';
    elSonido.title = on ? 'Silenciar' : 'Con sonido';
  }
  elSonido.addEventListener('click', function () {
    Audio2.alternar();
    pintarSonido();
  });

  document.getElementById('empezar').addEventListener('click', function () {
    // El primer gesto del usuario es la unica oportunidad de arrancar el audio:
    // los navegadores lo bloquean hasta que hay uno.
    Audio2.prender();
    pintarSonido();
    empezar();
  });
  pintarSonido();

  /* ---------- herramientas de revisión ----------
     El panel del navegador no siempre compone cuadros, así que el juego sabe
     dibujarse a demanda y mandar la imagen al servidor de desarrollo. */
  window.capturar = function (nombre) {
    return fetch('/_captura/' + nombre + '.png',
      { method: 'POST', body: cv.toDataURL('image/png') });
  };
  window.instante = function (figura, nombre, opciones) {
    opciones = opciones || {};
    if (figura) { J.figura = figura; J.u = 1; J.destino = null; }
    if (opciones.destino) {
      J.pares = Figuras.preparar(J.figura, opciones.destino);
      J.destino = { figura: opciones.destino, color: opciones.color || '200,200,255' };
      J.u = opciones.u === undefined ? .5 : opciones.u;
      J.fogonazo = 1 - J.u;
    }
    if (opciones.belX !== undefined) J.belX = opciones.belX;
    else J.belX = J.belMeta;
    // Muchas figuras se mueven con el reloj (el haz del faro barre, las agujas
    // giran). Sin poder fijar t no hay forma de capturar el instante que importa.
    if (opciones.t !== undefined) t = opciones.t;
    // El empuje decae con el tiempo y en captura dt es 0, asi que para verlo
    // hay que poder fijarlo desde afuera.
    if (opciones.empuje !== undefined) bel.empuje = opciones.empuje;
    if (opciones.asombro !== undefined) bel.asombro = opciones.asombro;
    sinBucle = true;
    cuadro(performance.now());
    sinBucle = false;
    return nombre ? window.capturar(nombre) : Promise.resolve({ status: 200 });
  };

  /* Comprueba que cada figura quede donde tiene que quedar: las terrestres
     tocando el suelo y las que vuelan, despegadas. */
  window.verificarBases = function () {
    var piso = H * (H > W * 1.25 ? .80 : .84);
    var E = (H > W * 1.25) ? Math.min(W * .36, H * .24) : Math.min(W * .27, H * .33);
    var mal = [], detalle = {};
    Object.keys(Figuras.CATALOGO).forEach(function (k) {
      var fy = alturaDe(k, null, 1, piso, E);
      var b = BASES[k];
      var apoya = (b !== null && b !== undefined);
      var borde = apoya ? fy + E * b : fy + E;
      detalle[k] = { apoya: apoya, borde: Math.round(borde), piso: Math.round(piso) };
      if (apoya && Math.abs(borde - piso) > 1.5) mal.push(k + ' no apoya (' + Math.round(borde) + ' vs ' + Math.round(piso) + ')');
      if (!apoya && borde >= piso - 1) mal.push(k + ' deberia volar y toca el piso');
    });
    return { total: Object.keys(Figuras.CATALOGO).length, mal: mal, ok: !mal.length, detalle: detalle };
  };

  /* Juega una partida entera a velocidad acelerada y cuenta como fue.
     Es la unica forma de saber que el juego no se traba en la escena seis sin
     sentarse a jugarlo seis veces. */
  window.pruebaPartida = function (opciones) {
    opciones = opciones || {};
    var elegir = opciones.elegir || function () { return 0; };
    RITMO = opciones.ritmo || 60;
    var errores = [];
    var previo = window.onerror;
    window.onerror = function (m) { errores.push(String(m)); };

    var recorrido = [];
    return new Promise(function (resolver) {
      var vueltas = 0;
      function reiniciar() {
        J.escena = -1; J.mazo = Guion.CARTAS.map(function (c) { return c.clave; });
        J.jugadas = []; J.u = 1; J.destino = null;
        elCierre.classList.remove('ver');
        elMano.innerHTML = '';
        siguienteEscena();
      }
      reiniciar();

      var reloj = setInterval(function () {
        vueltas++;
        if (vueltas > 4000) { cerrar('agoto el tiempo'); return; }
        if (elCierre.classList.contains('ver')) { cerrar(null); return; }
        var cartas = elMano.classList.contains('fuera')
          ? [] : elMano.querySelectorAll('.carta');
        if (cartas.length && J.u >= 1) {
          var titulo = elRotulo.textContent;
          recorrido.push({
            escena: titulo,
            mano: cartas.length,
            relato: (elRelato.textContent || '').slice(0, 40)
          });
          var i = Math.min(cartas.length - 1, Math.max(0, elegir(recorrido.length - 1, cartas.length)));
          cartas[i].click();
        }
      }, 8);

      function cerrar(motivo) {
        clearInterval(reloj);
        RITMO = 1;
        window.onerror = previo;
        resolver({
          escenas: recorrido.length,
          recorrido: recorrido,
          jugadas: J.jugadas.slice(),
          cierre: elCierre.classList.contains('ver'),
          textoCierre: (elCierre.textContent || '').slice(0, 90),
          errores: errores,
          motivo: motivo
        });
      }
    });
  };

  /* Recorre todas las combinaciones carta x escena sin dibujar nada y avisa
     si alguna deja la pantalla sin figura o el relato en undefined. */
  window.auditar = function () {
    var faltanFiguras = [], faltanTextos = [], faltanPintores = [], faltanBases = [];
    Guion.ESCENAS.forEach(function (e) {
      if (!Figuras.CATALOGO[e.figura]) faltanFiguras.push(e.clave + ' figura=' + e.figura);
      if (!Figuras.CATALOGO[e.revela]) faltanFiguras.push(e.clave + ' revela=' + e.revela);
      Guion.CARTAS.forEach(function (c) {
        var destino = c.revela ? e.revela : c.figura;
        if (!destino || !Figuras.CATALOGO[destino]) {
          faltanFiguras.push(e.clave + ' x ' + c.clave + ' -> ' + destino);
        }
        var dicho = e.dichos[c.clave] || e.dichos.otra;
        if (!dicho) faltanTextos.push(e.clave + ' x ' + c.clave);
      });
    });
    Object.keys(Figuras.CATALOGO).forEach(function (k) {
      if (!Pintores.PINTORES[k] && k !== 'montania') faltanPintores.push(k);
      if (!(k in BASES)) faltanBases.push(k);
    });
    return {
      escenas: Guion.ESCENAS.length,
      cartas: Guion.CARTAS.length,
      figuras: Object.keys(Figuras.CATALOGO).length,
      faltanFiguras: faltanFiguras,
      faltanTextos: faltanTextos,
      faltanPintores: faltanPintores,
      faltanBases: faltanBases,
      ok: !faltanFiguras.length && !faltanTextos.length &&
          !faltanPintores.length && !faltanBases.length
    };
  };
})();
