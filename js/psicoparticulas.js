/* Particulas.

   Un solo sistema para todo lo que vuela: el polvo del aire, las chispas de
   acertar, el rastro de Bel, lo que sueltan las piezas al transformarse y la
   lluvia del climax. Uno solo y no cinco porque el tope tiene que ser global —
   con un tope por tipo, cinco emisores modestos suman una tormenta.

   El arreglo es de tamano fijo y las particulas se reciclan: nunca se crean ni
   se destruyen objetos durante el juego. Crear objetos por cuadro es la forma
   mas facil de que el recolector de basura meta tirones justo cuando hay mucho
   en pantalla, que es exactamente cuando se nota. */

(function () {
  'use strict';
  var P = Psicodelia;

  var TOPES = { suave: 70, normal: 150, extremo: 280 };

  var particulas = [];
  var vivas = 0;
  var tAnterior = null;

  function tope() { return TOPES[P.nivel] || TOPES.normal; }

  function asegurar(n) {
    while (particulas.length < n) {
      particulas.push({ x: 0, y: 0, vx: 0, vy: 0, vida: 0, total: 1,
                        tono: 0, r: 1, tipo: 0, gravedad: 0, nacida: -1 });
    }
  }

  /* Emitir busca un hueco: primero una muerta; si no hay, la que le queda menos
     PROPORCION de su vida, y nunca una nacida en este mismo cuadro.

     Las dos condiciones son necesarias y las dos costaron un bug. Reciclando
     por vida restante absoluta, las chispas —que viven medio segundo— eran
     siempre las candidatas frente al polvo, que vive cinco: un acierto emitia
     26 chispas y cada una pisaba a la anterior, asi que sobrevivia UNA. Por
     proporcion, una chispa recien nacida esta al 100% de su vida y no la toca
     nadie. El filtro por cuadro es el cinturon: sin el, una rafaga grande
     igual podria empezar a comerse su propia cola. */
  var cuadroActual = 0;
  function emitir(x, y, opciones) {
    asegurar(tope());
    var p = null, peor = Infinity;
    for (var i = 0; i < particulas.length && i < tope(); i++) {
      var q = particulas[i];
      if (q.vida <= 0) { p = q; break; }
      if (q.nacida === cuadroActual) continue;
      var frac = q.vida / q.total;
      if (frac < peor) { peor = frac; p = q; }
    }
    if (!p) return;
    p.nacida = cuadroActual;
    p.x = x; p.y = y;
    p.vx = opciones.vx || 0;
    p.vy = opciones.vy || 0;
    p.total = p.vida = opciones.vida || 1;
    p.tono = opciones.tono || 0;
    p.r = opciones.r || 2;
    p.tipo = opciones.tipo || 0;
    p.gravedad = opciones.gravedad || 0;
  }

  // Ruido barato y repetible: el mismo instante da el mismo resultado, que es
  // lo que permite capturar una escena y verificarla.
  function azar(s) {
    var x = Math.sin(s * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  P.capa('particulas', { fase: 'sobre', umbral: .12 }, function (ctx) {
    var cx = ctx.cx, W = ctx.W, H = ctx.H, e = ctx.escena, n = ctx.n;
    var dt = (tAnterior === null) ? .016 : Math.min(.05, Math.max(0, ctx.t - tAnterior));
    tAnterior = ctx.t;
    cuadroActual++;
    asegurar(tope());

    var raiz = P.tonoDe ? P.tonoDe(e.color) : 220;

    /* --- emisores --- */

    // Polvo del aire: continuo, poco, y mas cuanto mas descubierto.
    var cuantoPolvo = n * 1.6;
    for (var i = 0; i < cuantoPolvo; i++) {
      var s = Math.floor(ctx.t * 60) + i * 13;
      emitir(azar(s) * W, azar(s + 7) * H, {
        vx: (azar(s + 3) - .5) * 12, vy: -6 - azar(s + 11) * 12,
        vida: 2.5 + azar(s + 5) * 2.5, tono: (raiz + azar(s + 9) * 120) % 360,
        r: 1 + azar(s + 17) * 2.2, tipo: 0
      });
    }

    // Chispas de acertar: una sola vez, un puñado, y salen de la figura.
    var dtAc = ctx.desde('acierto');
    if (dtAc >= 0 && dtAc < dt * 1.5) {
      for (var j = 0; j < 26; j++) {
        var a = j / 26 * 6.2832 + azar(j) * .3;
        var vel = 90 + azar(j + 40) * 190;
        emitir(e.fx, e.fy, {
          vx: Math.cos(a) * vel, vy: Math.sin(a) * vel,
          vida: .5 + azar(j + 60) * .7, tono: (j * 14 + ctx.t * 30) % 360,
          r: 2 + azar(j + 80) * 3, tipo: 1, gravedad: 120
        });
      }
    }

    // Fallar tambien deja algo, pero cae en vez de estallar: la diferencia
    // entre las dos se tiene que ver sin leer ningun cartel.
    var dtFa = ctx.desde('fallo');
    if (dtFa >= 0 && dtFa < dt * 1.5) {
      for (var f = 0; f < 10; f++) {
        emitir(e.fx + (azar(f) - .5) * e.E, e.fy, {
          vx: (azar(f + 20) - .5) * 30, vy: 20 + azar(f + 30) * 40,
          vida: .8 + azar(f + 50) * .5, tono: (raiz + 200) % 360,
          r: 1.5 + azar(f + 70) * 2, tipo: 2, gravedad: 220
        });
      }
    }

    // Anillo al cambiar de lugar.
    var dtLu = ctx.desde('lugar');
    if (dtLu >= 0 && dtLu < dt * 1.5) {
      for (var k = 0; k < 34; k++) {
        var ak = k / 34 * 6.2832;
        emitir(e.fx, e.fy, {
          vx: Math.cos(ak) * 150, vy: Math.sin(ak) * 150 * .55,
          vida: 1.1, tono: (raiz + k * 10) % 360, r: 2.5, tipo: 1
        });
      }
    }

    // Rastro de Bel: solo mientras camina de verdad.
    if (Math.abs(e.belX - (e.belXAnterior === undefined ? e.belX : e.belXAnterior)) > .0004) {
      emitir(e.belX * W, e.piso - H * .02, {
        vx: (azar(ctx.t * 30) - .5) * 10, vy: -14,
        vida: .9, tono: (ctx.t * 40) % 360, r: 2, tipo: 0
      });
    }
    e.belXAnterior = e.belX;

    // Lluvia del climax: cae desde arriba, mucha y rapida.
    if (ctx.climax > .05) {
      var cuanta = ctx.climax * 3.5;
      for (var m = 0; m < cuanta; m++) {
        var sm = Math.floor(ctx.t * 90) + m * 29;
        emitir(azar(sm) * W, -8, {
          vx: 0, vy: 120 + azar(sm + 3) * 220, vida: 2.4,
          tono: (azar(sm + 5) * 360), r: 1.4 + azar(sm + 9) * 1.6, tipo: 3
        });
      }
    }

    /* --- mover y dibujar --- */
    cx.save();
    cx.globalCompositeOperation = 'lighter';
    vivas = 0;
    var lim = Math.min(particulas.length, tope());
    for (var q = 0; q < lim; q++) {
      var p = particulas[q];
      if (p.vida <= 0) continue;
      p.vida -= dt;
      if (p.vida <= 0) continue;
      p.vy += p.gravedad * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.x < -20 || p.x > W + 20 || p.y > H + 20) { p.vida = 0; continue; }
      vivas++;

      var k = p.vida / p.total;
      var alfa = (p.tipo === 0 ? .45 : .85) * k;
      var r = p.r * (p.tipo === 1 ? (.4 + k * .8) : 1);
      cx.fillStyle = 'hsla(' + p.tono + ',95%,' + (p.tipo === 3 ? 72 : 64) + '%,' + alfa.toFixed(3) + ')';
      cx.beginPath();
      if (p.tipo === 3) {
        // La lluvia se dibuja como raya, no como punto: una gota redonda que
        // cae rapido se lee como suciedad en la pantalla.
        cx.fillRect(p.x, p.y, Math.max(1, r * .6), r * 4);
      } else {
        cx.arc(p.x, p.y, Math.max(.5, r), 0, 6.2832);
        cx.fill();
      }
    }
    cx.restore();
  });

  /* Gancho de verificacion. El conteo POR TIPO hace falta de verdad y no es un
     lujo: con el sistema en su tope, un acierto recicla particulas en vez de
     sumarlas, asi que el total no se mueve y mirandolo solo a el parece que el
     acierto no hizo nada. Lo que cambia es la mezcla. */
  P.particulas = function () {
    var porTipo = [0, 0, 0, 0];
    for (var i = 0; i < particulas.length; i++) {
      var p = particulas[i];
      if (p.vida > 0 && porTipo[p.tipo] !== undefined) porTipo[p.tipo]++;
    }
    return { vivas: vivas, tope: tope(), reservadas: particulas.length,
             polvo: porTipo[0], chispas: porTipo[1], caida: porTipo[2], lluvia: porTipo[3] };
  };

})();
