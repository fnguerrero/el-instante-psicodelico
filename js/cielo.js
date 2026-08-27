/* Lo que pasa en el cielo mientras Bel camina.

   Es fondo, no espectáculo: aparece cada tanto, tarda en cruzar, y si la
   jugadora estaba mirando el piso se lo pierde. Esa es la idea — que quien
   mire arriba sea recompensada, no que la escena le grite.

   Nunca hay dos cosas a la vez, y entre una y otra pasan como mínimo veinte
   segundos. */
var Cielo = (function () {
  'use strict';

  var TIPOS = ['fugaz', 'viajera', 'formacion', 'pulso', 'sombra', 'satelite'];

  function crear() {
    return {
      evento: null,
      // La primera aparición llega temprano, para que se note que esto existe.
      espera: 6 + Math.random() * 8,
      vistos: {}
    };
  }

  /* Elige el próximo evento. Las más llamativas salen menos seguido. */
  function elegir(c) {
    var r = Math.random();
    var tipo;
    if (r < .30) tipo = 'fugaz';
    else if (r < .52) tipo = 'satelite';
    else if (r < .70) tipo = 'viajera';
    else if (r < .84) tipo = 'pulso';
    else if (r < .95) tipo = 'formacion';
    else tipo = 'sombra';

    var haciaLaDerecha = Math.random() < .5;
    c.evento = {
      tipo: tipo,
      t: 0,
      dur: tipo === 'fugaz' ? 1.1
         : tipo === 'satelite' ? 14
         : tipo === 'viajera' ? 9
         : tipo === 'pulso' ? 4.5
         : tipo === 'formacion' ? 8
         : 11,                                   // sombra
      dir: haciaLaDerecha ? 1 : -1,
      x0: haciaLaDerecha ? -.12 : 1.12,
      y0: .06 + Math.random() * .30,
      inclina: (Math.random() - .5) * .16,
      semilla: Math.random() * 6.28
    };
    c.vistos[tipo] = (c.vistos[tipo] || 0) + 1;
  }

  function actualizar(c, dt) {
    if (c.evento) {
      c.evento.t += dt;
      if (c.evento.t >= c.evento.dur) {
        c.evento = null;
        c.espera = 20 + Math.random() * 34;
      }
      return;
    }
    c.espera -= dt;
    if (c.espera <= 0) elegir(c);
  }

  /* Curva de aparición y desvanecimiento: entra y sale sin cortes. */
  function sobre(u, subida, bajada) {
    if (u < subida) return u / subida;
    if (u > 1 - bajada) return (1 - u) / bajada;
    return 1;
  }

  function punto(cx, x, y, r, col, alfa) {
    cx.save();
    cx.globalCompositeOperation = 'lighter';
    var g = cx.createRadialGradient(x, y, 0, x, y, r * 7);
    g.addColorStop(0, 'rgba(' + col + ',' + (alfa * .5) + ')');
    g.addColorStop(.4, 'rgba(' + col + ',' + (alfa * .14) + ')');
    g.addColorStop(1, 'rgba(' + col + ',0)');
    cx.fillStyle = g;
    cx.beginPath(); cx.arc(x, y, r * 7, 0, 6.2832); cx.fill();
    cx.fillStyle = 'rgba(255,252,244,' + alfa + ')';
    cx.beginPath(); cx.arc(x, y, r, 0, 6.2832); cx.fill();
    cx.restore();
  }

  function dibujar(cx, c, W, H, t) {
    var e = c.evento;
    if (!e) return;
    var u = e.t / e.dur;

    if (e.tipo === 'fugaz') {
      // Rápida, con estela. Dura poco más de un segundo.
      var a = sobre(u, .12, .40);
      var fx = W * (e.x0 + e.dir * u * 1.24);
      var fy = H * (e.y0 + u * .16);
      var largo = W * .085;
      cx.save();
      cx.globalCompositeOperation = 'lighter';
      var g = cx.createLinearGradient(fx, fy, fx - e.dir * largo, fy - H * .022);
      g.addColorStop(0, 'rgba(255,250,235,' + (.75 * a) + ')');
      g.addColorStop(1, 'rgba(255,250,235,0)');
      cx.strokeStyle = g;
      cx.lineWidth = 2.2;
      cx.lineCap = 'round';
      cx.beginPath();
      cx.moveTo(fx, fy);
      cx.lineTo(fx - e.dir * largo, fy - H * .022);
      cx.stroke();
      cx.restore();
      punto(cx, fx, fy, 1.6, '255,250,235', .85 * a);

    } else if (e.tipo === 'satelite') {
      // Un puntito parejo que cruza despacio, como un satélite de verdad.
      var a2 = sobre(u, .10, .18);
      var sx = W * (e.x0 + e.dir * u * 1.24);
      var sy = H * (e.y0 + u * e.inclina);
      punto(cx, sx, sy, 1.3, '226,232,255', .55 * a2);

    } else if (e.tipo === 'viajera') {
      // Una luz sola que cruza, cambia de color y se apaga de golpe.
      var a3 = sobre(u, .14, .10);
      var vx = W * (e.x0 + e.dir * u * 1.24);
      var vy = H * (e.y0 + Math.sin(u * 3.1 + e.semilla) * .035);
      var col = u < .5 ? '255,214,150' : '170,225,255';
      // Se apaga y se enciende, sin ritmo fijo.
      var late = .55 + .45 * Math.sin(e.t * 3.2 + e.semilla);
      punto(cx, vx, vy, 2.0, col, .70 * a3 * late);

    } else if (e.tipo === 'formacion') {
      // Tres luces que se mueven juntas, guardando la distancia.
      var a4 = sobre(u, .16, .16);
      var bx = W * (e.x0 + e.dir * u * 1.20);
      var by = H * (e.y0 + Math.sin(u * 2.4 + e.semilla) * .02);
      var sep = W * .028;
      var giro = e.t * .25 + e.semilla;
      for (var i = 0; i < 3; i++) {
        var ang = giro + i * 2.094;
        punto(cx,
          bx + Math.cos(ang) * sep * e.dir,
          by + Math.sin(ang) * sep * .38,
          1.7, '200,235,255', .58 * a4);
      }

    } else if (e.tipo === 'pulso') {
      // Un resplandor que crece y se va, sin nada adentro.
      var a5 = sobre(u, .30, .45);
      var px = W * (.20 + e.semilla * .09);
      var py = H * e.y0;
      var r = H * (.02 + u * .10);
      cx.save();
      cx.globalCompositeOperation = 'lighter';
      var pg = cx.createRadialGradient(px, py, 0, px, py, r);
      pg.addColorStop(0, 'rgba(190,225,255,' + (.16 * a5) + ')');
      pg.addColorStop(.5, 'rgba(160,200,255,' + (.05 * a5) + ')');
      pg.addColorStop(1, 'rgba(160,200,255,0)');
      cx.fillStyle = pg;
      cx.beginPath(); cx.arc(px, py, r, 0, 6.2832); cx.fill();
      cx.restore();

    } else if (e.tipo === 'sombra') {
      // Algo oscuro que pasa por delante de las estrellas y las tapa. No se ve:
      // se nota porque falta cielo.
      var a6 = sobre(u, .22, .22);
      var ox = W * (e.x0 + e.dir * u * 1.24);
      var oy = H * e.y0;
      var an = W * .14, al = H * .045;
      cx.save();
      cx.globalAlpha = .82 * a6;
      cx.fillStyle = '#080b14';
      cx.beginPath();
      cx.ellipse(ox, oy, an, al, e.inclina, 0, 6.2832);
      cx.fill();
      // Un borde apenas más claro, para que no sea un agujero plano.
      cx.globalAlpha = .10 * a6;
      cx.strokeStyle = '#3d4a68';
      cx.lineWidth = 1.5;
      cx.stroke();
      cx.restore();
    }
  }

  /* Para el debug: forzar un evento concreto. */
  function forzar(c, tipo) {
    elegir(c);
    c.evento.tipo = tipo;
    c.evento.t = 0;
    c.evento.dur = tipo === 'fugaz' ? 1.1
      : tipo === 'satelite' ? 14
      : tipo === 'viajera' ? 9
      : tipo === 'pulso' ? 4.5
      : tipo === 'formacion' ? 8 : 11;
  }

  return { crear: crear, actualizar: actualizar, dibujar: dibujar, forzar: forzar, TIPOS: TIPOS };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = Cielo; }
