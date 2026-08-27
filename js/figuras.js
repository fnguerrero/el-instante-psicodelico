/* Figuras y transformaciones.

   Todo lo que puede mutar está hecho de piezas: segmentos con un grosor y un
   color. Transformar no es fundir una imagen en otra — es que cada pieza VUELE
   a su lugar nuevo, con su propio retardo y una curva. Las que sobran se apagan
   en el aire, las que faltan llegan desde afuera.

   Es lo que hace que se sienta un sueño y no una transición de PowerPoint. */
var Figuras = (function () {
  'use strict';

  /* Un segmento: [x1, y1, x2, y2, grosor, brillo]
     Las coordenadas van de -1 a 1, con el 0 en el centro de la figura y la y
     creciendo hacia abajo. Así la misma figura sirve a cualquier tamaño. */

  /* El perfil de la vía. Lo comparten los segmentos y el pintor, así la
     estructura que se ve dibujada es exactamente la que vuela al mutar. */
  function perfilMontania() {
    var pts = [];
    for (var i = 0; i <= 26; i++) {
      var u = i / 26;
      var h;
      if (u < .42) h = -1 + (1 - u / .42) * .06;              // subida
      else if (u < .56) { var v = (u - .42) / .14; h = -1 + v * v * 1.55; }
      else if (u < .78) { var w = (u - .56) / .22; h = .55 - Math.sin(w * Math.PI) * .95; }
      else { var z = (u - .78) / .22; h = .55 - Math.sin(z * Math.PI) * .45; }
      pts.push([-1 + u * 2, h]);
    }
    return pts;
  }

  /* --- montaña rusa: estructura de vigas y la vía --- */
  function montaniaRusa() {
    var s = [];
    var pts = perfilMontania();
    for (var k = 1; k < pts.length; k++) {
      s.push([pts[k-1][0], pts[k-1][1], pts[k][0], pts[k][1], 3, .5]);
    }
    // Columnas y cruces.
    for (var c = 0; c < pts.length; c += 3) {
      s.push([pts[c][0], pts[c][1], pts[c][0], 1, 2, .2]);
      if (c + 3 < pts.length) {
        s.push([pts[c][0], pts[c][1], pts[c+3][0], 1, 1.4, .12]);
        s.push([pts[c+3][0], pts[c+3][1], pts[c][0], 1, 1.4, .12]);
      }
    }
    return s;
  }

  /* --- platillo volador: casco, cúpula, luces --- */
  function platillo() {
    var s = [];
    // Casco: dos elipses achatadas.
    var N = 30;
    for (var i = 0; i < N; i++) {
      var a0 = i / N * 6.2832, a1 = (i + 1) / N * 6.2832;
      s.push([Math.cos(a0), Math.sin(a0) * .22 + .1,
              Math.cos(a1), Math.sin(a1) * .22 + .1, 4, .8]);
      s.push([Math.cos(a0) * .62, Math.sin(a0) * .13 - .05,
              Math.cos(a1) * .62, Math.sin(a1) * .13 - .05, 2.4, .5]);
    }
    // Cúpula.
    for (var j = 0; j <= 14; j++) {
      var b0 = Math.PI + j / 14 * Math.PI, b1 = Math.PI + (j + 1) / 14 * Math.PI;
      s.push([Math.cos(b0) * .46, Math.sin(b0) * .55 - .05,
              Math.cos(b1) * .46, Math.sin(b1) * .55 - .05, 3, 1]);
    }
    // Rayo de luz hacia abajo.
    for (var r = 0; r < 5; r++) {
      var xr = -.34 + r * .17;
      s.push([xr, .28, xr * 2.1, 1.15, 2, .9]);
    }
    // Luces del borde.
    for (var l = 0; l < 10; l++) {
      var al = l / 10 * 6.2832;
      var lx = Math.cos(al) * .82, ly = Math.sin(al) * .18 + .1;
      s.push([lx, ly, lx + .001, ly, 7, 1.4]);
    }
    return s;
  }

  /* --- la torre que se derrumba: vigas caídas y polvo --- */
  function ruina() {
    var s = [];
    var rnd = sembrado(7);
    for (var i = 0; i < 46; i++) {
      var x = -1 + rnd() * 2;
      var y = .55 + rnd() * .45;
      var ang = (rnd() - .5) * 3;
      var lar = .08 + rnd() * .22;
      s.push([x, y, x + Math.cos(ang) * lar, y + Math.sin(ang) * lar * .3,
              2 + rnd() * 2, .12 + rnd() * .2]);
    }
    // Lo que queda parado.
    for (var j = 0; j < 6; j++) {
      var xj = -.7 + j * .28;
      var hj = .4 + rnd() * .5;
      s.push([xj, 1, xj + (rnd() - .5) * .1, 1 - hj, 3, .25]);
    }
    return s;
  }

  /* --- la luna: un cuerpo enorme con sus mares --- */
  function lunaGrande() {
    var s = [];
    var N = 44;
    for (var i = 0; i < N; i++) {
      var a0 = i / N * 6.2832, a1 = (i + 1) / N * 6.2832;
      s.push([Math.cos(a0) * .82, Math.sin(a0) * .82,
              Math.cos(a1) * .82, Math.sin(a1) * .82, 4, 1.1]);
    }
    var rnd = sembrado(3);
    for (var c = 0; c < 9; c++) {
      var cx0 = (rnd() - .5) * 1.1, cy0 = (rnd() - .5) * 1.1;
      var rr = .08 + rnd() * .16;
      for (var k = 0; k < 10; k++) {
        var b0 = k / 10 * 6.2832, b1 = (k + 1) / 10 * 6.2832;
        s.push([cx0 + Math.cos(b0) * rr, cy0 + Math.sin(b0) * rr,
                cx0 + Math.cos(b1) * rr, cy0 + Math.sin(b1) * rr, 2, .35]);
      }
    }
    return s;
  }

  /* --- un árbol enorme, para cuando el sueño se pone amable --- */
  function arbol() {
    var s = [];
    function rama(x, y, ang, largo, grosor, prof) {
      if (prof <= 0 || largo < .04) return;
      var x2 = x + Math.cos(ang) * largo, y2 = y + Math.sin(ang) * largo;
      s.push([x, y, x2, y2, grosor, prof > 3 ? .2 : .5]);
      rama(x2, y2, ang - .42 - prof * .03, largo * .72, grosor * .68, prof - 1);
      rama(x2, y2, ang + .38 + prof * .02, largo * .70, grosor * .68, prof - 1);
      if (prof > 3) rama(x2, y2, ang + .04, largo * .60, grosor * .55, prof - 2);
    }
    rama(0, 1, -Math.PI / 2, .52, 7, 6);
    return s;
  }


  /* --- una cama sola en el medio de la nada --- */
  function cama() {
    var s = [];
    // Respaldo y piecera.
    for (var i = 0; i <= 7; i++) {
      var x = -.86 + i * .05;
      s.push([x, .10, x, -.42, 3, .5]);
    }
    s.push([-.90, -.44, -.52, -.44, 4, .6]);
    s.push([-.90, .10, -.52, .10, 4, .5]);
    s.push([.66, .12, .90, .12, 4, .5]);
    s.push([.66, -.10, .90, -.10, 3.4, .45]);
    for (var j = 0; j < 4; j++) {
      var xj = .68 + j * .07;
      s.push([xj, .12, xj, -.10, 2.6, .4]);
    }
    // Colchon y almohada.
    s.push([-.88, .12, .90, .12, 6, .75]);
    s.push([-.88, .30, .90, .30, 5, .5]);
    s.push([-.88, .12, -.88, .30, 4, .5]);
    s.push([.90, .12, .90, .30, 4, .5]);
    for (var k = 0; k < 9; k++) {
      var xk = -.70 + k * .19;
      s.push([xk, .12, xk + .10, .30, 1.6, .22]);
    }
    // Patas.
    [-.80, -.58, .60, .82].forEach(function (px) {
      s.push([px, .30, px, .62, 3, .35]);
    });
    return s;
  }

  /* --- una puerta parada sola, sin pared --- */
  function puerta() {
    var s = [];
    var an = .40, al = .96;
    // Marco.
    s.push([-an - .08, .70, -an - .08, -al, 5, .7]);
    s.push([an + .08, .70, an + .08, -al, 5, .7]);
    s.push([-an - .12, -al, an + .12, -al, 5.5, .8]);
    // Hoja.
    s.push([-an, .70, -an, -al + .06, 3.4, .5]);
    s.push([an, .70, an, -al + .06, 3.4, .5]);
    s.push([-an, -al + .06, an, -al + .06, 3.4, .5]);
    s.push([-an, .70, an, .70, 3.4, .5]);
    // Los dos paneles tallados.
    for (var q = 0; q < 2; q++) {
      var y0 = -al + .20 + q * .48, y1 = y0 + .34;
      s.push([-an + .11, y0, an - .11, y0, 2, .3]);
      s.push([-an + .11, y1, an - .11, y1, 2, .3]);
      s.push([-an + .11, y0, -an + .11, y1, 2, .3]);
      s.push([an - .11, y0, an - .11, y1, 2, .3]);
    }
    // Picaporte.
    s.push([an - .16, -.10, an - .16, -.10, 7, 1.2]);
    // La luz que sale por abajo.
    for (var l = 0; l < 6; l++) {
      var xl = -an + .06 + l * .13;
      s.push([xl, .70, xl, .84, 2.4, .9]);
    }
    return s;
  }

  /* --- la casa de la infancia --- */
  function casa() {
    var s = [];
    var an = .82, al = .62;
    // Cuerpo.
    s.push([-an, .96, -an, -al, 4, .5]);
    s.push([an, .96, an, -al, 4, .5]);
    s.push([-an, .96, an, .96, 4.5, .5]);
    // Techo a dos aguas.
    s.push([-an - .10, -al, 0, -al - .48, 5, .65]);
    s.push([0, -al - .48, an + .10, -al, 5, .65]);
    s.push([-an - .10, -al, an + .10, -al, 4, .5]);
    // Chimenea.
    s.push([.34, -al - .28, .34, -al - .58, 4, .45]);
    s.push([.50, -al - .20, .50, -al - .58, 4, .45]);
    s.push([.34, -al - .58, .50, -al - .58, 4, .45]);
    // Ventanas encendidas.
    [[-.46, -.16], [.30, -.16]].forEach(function (v) {
      var vx = v[0], vy = v[1];
      s.push([vx - .17, vy - .19, vx + .17, vy - .19, 3, 1.1]);
      s.push([vx - .17, vy + .19, vx + .17, vy + .19, 3, 1.1]);
      s.push([vx - .17, vy - .19, vx - .17, vy + .19, 3, 1.1]);
      s.push([vx + .17, vy - .19, vx + .17, vy + .19, 3, 1.1]);
      s.push([vx, vy - .19, vx, vy + .19, 2, .7]);
      s.push([vx - .17, vy, vx + .17, vy, 2, .7]);
    });
    // Puerta.
    s.push([-.13, .96, -.13, .34, 3.4, .6]);
    s.push([.13, .96, .13, .34, 3.4, .6]);
    s.push([-.13, .34, .13, .34, 3.4, .6]);
    return s;
  }

  /* --- una bandada: no es un objeto, es muchos --- */
  function bandada() {
    var s = [];
    var rnd = sembrado(19);
    for (var i = 0; i < 40; i++) {
      var x = (rnd() * 2 - 1) * .96;
      var y = (rnd() * 2 - 1) * .78;
      var ab = .05 + rnd() * .05;
      // Cada pajaro son dos alas en v.
      s.push([x - ab, y, x, y - ab * .55, 2.6, .55]);
      s.push([x, y - ab * .55, x + ab, y, 2.6, .55]);
    }
    return s;
  }


  /* --- la calesita --- */
  function calesita() {
    var s = [];
    // Techo conico a franjas.
    for (var i = 0; i < 16; i++) {
      var a0 = i / 16 * 6.2832;
      s.push([0, -.94, Math.cos(a0) * .92, -.52, 2.6, .5]);
    }
    for (var j = 0; j < 16; j++) {
      var b0 = j / 16 * 6.2832, b1 = (j + 1) / 16 * 6.2832;
      s.push([Math.cos(b0) * .92, Math.sin(b0) * .10 - .52,
              Math.cos(b1) * .92, Math.sin(b1) * .10 - .52, 3, .6]);
    }
    // Mastil.
    s.push([0, -.94, 0, .74, 4, .5]);
    // Barras y caballitos.
    for (var k = 0; k < 6; k++) {
      var ak = k / 6 * 6.2832;
      var x = Math.cos(ak) * .62, y = Math.sin(ak) * .07;
      s.push([x, y - .48, x, y + .40, 2.4, .45]);
      // El lomo del caballito, apenas insinuado.
      s.push([x - .10, y + .16, x + .10, y + .12, 3.4, .55]);
      s.push([x + .10, y + .12, x + .14, y + .02, 2.6, .5]);
    }
    // Plataforma.
    for (var m = 0; m < 20; m++) {
      var c0 = m / 20 * 6.2832, c1 = (m + 1) / 20 * 6.2832;
      s.push([Math.cos(c0) * .86, Math.sin(c0) * .10 + .58,
              Math.cos(c1) * .86, Math.sin(c1) * .10 + .58, 3.4, .5]);
    }
    return s;
  }

  /* --- el faro --- */
  function faro() {
    var s = [];
    // Torre que se afina hacia arriba.
    for (var i = 0; i <= 12; i++) {
      var u = i / 12;
      var an = .30 - u * .13;
      var y = 1 - u * 1.42;
      s.push([-an, y, an, y, 1.8, .18]);
      if (i > 0) {
        var anp = .30 - (i - 1) / 12 * .13;
        var yp = 1 - (i - 1) / 12 * 1.42;
        s.push([-anp, yp, -an, y, 3, .5]);
        s.push([anp, yp, an, y, 3, .5]);
      }
    }
    // Balcon y linterna.
    s.push([-.24, -.42, .24, -.42, 4, .6]);
    s.push([-.19, -.42, -.19, -.72, 3, .55]);
    s.push([.19, -.42, .19, -.72, 3, .55]);
    s.push([-.22, -.72, .22, -.72, 4, .6]);
    // Cupula.
    for (var j = 0; j <= 8; j++) {
      var b0 = Math.PI + j / 8 * Math.PI, b1 = Math.PI + (j + 1) / 8 * Math.PI;
      s.push([Math.cos(b0) * .20, Math.sin(b0) * .22 - .72,
              Math.cos(b1) * .20, Math.sin(b1) * .22 - .72, 3, .7]);
    }
    // El haz.
    for (var h = 0; h < 4; h++) {
      s.push([.20, -.57, .96, -.72 + h * .10, 2.2, 1.1]);
    }
    return s;
  }

  /* --- la laguna: una superficie, no un objeto --- */
  function laguna() {
    var s = [];
    // Lineas de agua, mas juntas al fondo.
    for (var i = 0; i < 16; i++) {
      var u = i / 15;
      var y = .30 + u * u * .70;
      var an = .30 + u * .68;
      var trozos = 2 + Math.floor(u * 4);
      for (var k = 0; k < trozos; k++) {
        var x0 = -an + (k / trozos) * an * 2;
        var x1 = x0 + (an * 2 / trozos) * .62;
        s.push([x0, y, x1, y, 2 + u * 2, .18 + u * .35]);
      }
    }
    // La orilla.
    s.push([-1, .28, 1, .28, 3, .3]);
    // El reflejo de la luna sobre el agua.
    for (var r = 0; r < 7; r++) {
      var yr = .38 + r * .09;
      var ar = .05 + r * .022;
      s.push([-ar, yr, ar, yr, 3, 1.1]);
    }
    return s;
  }

  /* --- la barca --- */
  function barca() {
    var s = [];
    // Casco.
    var N = 14;
    for (var i = 0; i < N; i++) {
      var u0 = i / N, u1 = (i + 1) / N;
      function borde(u) {
        return [-.78 + u * 1.56, .10 + Math.sin(u * Math.PI) * .30];
      }
      var a = borde(u0), b = borde(u1);
      s.push([a[0], a[1], b[0], b[1], 4, .6]);
    }
    s.push([-.78, .10, .78, .10, 4, .55]);
    // Cuadernas.
    for (var k = 1; k < 5; k++) {
      var x = -.78 + k * .312;
      var prof = Math.sin((k / 5) * Math.PI) * .28;
      s.push([x, .10, x, .10 + prof, 2, .3]);
    }
    // Mastil y vela.
    s.push([0, .10, 0, -.86, 3.4, .5]);
    s.push([0, -.84, .52, -.30, 3, .5]);
    s.push([.52, -.30, 0, -.16, 3, .5]);
    for (var v = 0; v < 4; v++) {
      var f = (v + 1) / 5;
      s.push([0, -.84 + f * .68, .52 * (1 - f * .55), -.30 + f * .16, 1.6, .22]);
    }
    // Remo apoyado.
    s.push([-.62, -.02, -.92, .46, 2.6, .4]);
    return s;
  }

  /* --- el reloj --- */
  function reloj() {
    var s = [];
    var N = 36;
    // Caja.
    for (var i = 0; i < N; i++) {
      var a0 = i / N * 6.2832, a1 = (i + 1) / N * 6.2832;
      s.push([Math.cos(a0) * .80, Math.sin(a0) * .80,
              Math.cos(a1) * .80, Math.sin(a1) * .80, 4.5, .65]);
      s.push([Math.cos(a0) * .68, Math.sin(a0) * .68,
              Math.cos(a1) * .68, Math.sin(a1) * .68, 2, .3]);
    }
    // Marcas de las horas.
    for (var h = 0; h < 12; h++) {
      var ah = h / 12 * 6.2832 - Math.PI / 2;
      var largo = (h % 3 === 0) ? .13 : .07;
      s.push([Math.cos(ah) * .62, Math.sin(ah) * .62,
              Math.cos(ah) * (.62 - largo), Math.sin(ah) * (.62 - largo),
              (h % 3 === 0) ? 3.4 : 2, .5]);
    }
    // Agujas, paradas en una hora cualquiera.
    s.push([0, 0, Math.cos(-1.1) * .34, Math.sin(-1.1) * .34, 4, .9]);
    s.push([0, 0, Math.cos(.5) * .52, Math.sin(.5) * .52, 3, .8]);
    // Pie.
    s.push([-.20, .82, .20, .82, 4, .4]);
    s.push([-.32, 1, .32, 1, 5, .45]);
    s.push([-.20, .82, -.32, 1, 3, .4]);
    s.push([.20, .82, .32, 1, 3, .4]);
    return s;
  }

  /* Generador con semilla: las figuras tienen que salir iguales siempre.
     Con Math.random, cada cuadro dibujaría una ruina distinta. */
  function sembrado(n) {
    var s = n >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  var CATALOGO = {
    montania: montaniaRusa,
    platillo: platillo,
    ruina: ruina,
    luna: lunaGrande,
    arbol: arbol,
    cama: cama,
    puerta: puerta,
    casa: casa,
    bandada: bandada,
    calesita: calesita,
    faro: faro,
    laguna: laguna,
    barca: barca,
    reloj: reloj
  };

  /* Prepara el par de figuras para transformar una en otra.
     Empareja pieza con pieza; si a una le sobran, las de más nacen o mueren
     en el centro de la otra figura. */
  function preparar(claveA, claveB) {
    var A = CATALOGO[claveA] ? CATALOGO[claveA]() : [];
    var B = CATALOGO[claveB] ? CATALOGO[claveB]() : [];
    var n = Math.max(A.length, B.length);
    var pares = [];
    for (var i = 0; i < n; i++) {
      var a = A[i % A.length] || [0, 0, 0, 0, 1, 0];
      var b = B[i % B.length] || [0, 0, 0, 0, 1, 0];
      // Si una figura tiene menos piezas, las sobrantes salen del centro.
      var naceDeCero = i >= A.length;
      var muereEnCero = i >= B.length;
      pares.push({
        a: naceDeCero ? [0, 0, 0, 0, a[4], 0] : a,
        b: muereEnCero ? [0, 0, 0, 0, b[4], 0] : b,
        // Cada pieza sale en su momento: el escalonado es lo que da el vuelo.
        retardo: (i % 7) * .045 + (i / n) * .30,
        // Y se va por un rodeo distinto, para que no viajen todas en fila.
        curva: ((i * 37) % 100) / 100 - .5
      });
    }
    return pares;
  }

  function mezclar(x, y, u) { return x + (y - x) * u; }
  function suave(u) { return u * u * (3 - 2 * u); }

  /* Dibuja la transformación. u va de 0 (figura A) a 1 (figura B). */
  function dibujar(cx, pares, u, x, y, escala, color, t) {
    cx.save();
    cx.translate(x, y);
    cx.lineCap = 'round';

    for (var i = 0; i < pares.length; i++) {
      var p = pares[i];
      // Cada pieza tiene su propia ventana de tiempo dentro de la transición.
      var local = (u - p.retardo) / (1 - p.retardo * .8);
      local = Math.max(0, Math.min(1, local));
      var f = suave(local);

      var x1 = mezclar(p.a[0], p.b[0], f) * escala;
      var y1 = mezclar(p.a[1], p.b[1], f) * escala;
      var x2 = mezclar(p.a[2], p.b[2], f) * escala;
      var y2 = mezclar(p.a[3], p.b[3], f) * escala;

      // Rodeo: en la mitad del viaje la pieza se va de la recta.
      var vuelo = Math.sin(f * Math.PI);
      var desvio = p.curva * escala * .34 * vuelo;
      y1 += desvio; y2 += desvio;
      x1 += desvio * .4; x2 += desvio * .4;

      var grosor = mezclar(p.a[4], p.b[4], f);
      var brillo = mezclar(p.a[5], p.b[5], f);
      // Mientras vuela, la pieza brilla: es lo que hace que se lea como magia.
      var enVuelo = vuelo;
      var alfa = Math.min(1, brillo + enVuelo * .8);

      cx.strokeStyle = 'rgba(' + color + ',' + alfa.toFixed(3) + ')';
      cx.lineWidth = Math.max(.6, grosor * (1 + enVuelo * .5));
      cx.beginPath();
      cx.moveTo(x1, y1);
      cx.lineTo(x2, y2);
      cx.stroke();

      // Chispa en la punta de las que están volando.
      if (enVuelo > .35) {
        cx.save();
        cx.globalCompositeOperation = 'lighter';
        var g = cx.createRadialGradient(x2, y2, 0, x2, y2, 14 * enVuelo);
        g.addColorStop(0, 'rgba(' + color + ',' + (.5 * enVuelo) + ')');
        g.addColorStop(1, 'rgba(' + color + ',0)');
        cx.fillStyle = g;
        cx.beginPath(); cx.arc(x2, y2, 14 * enVuelo, 0, 6.2832); cx.fill();
        cx.restore();
      }
    }
    cx.restore();
  }

  /* Una figura sola, sin transformar. */
  function dibujarUna(cx, clave, x, y, escala, color, t) {
    var f = CATALOGO[clave];
    if (!f) return;
    var s = f();
    cx.save();
    cx.translate(x, y);
    cx.lineCap = 'round';
    for (var i = 0; i < s.length; i++) {
      var p = s[i];
      // Un latido muy leve, para que nada esté del todo quieto en un sueño.
      var late = 1 + Math.sin(t * 1.2 + i * .3) * .012;
      cx.strokeStyle = 'rgba(' + color + ',' + Math.min(1, p[5]) + ')';
      cx.lineWidth = Math.max(.6, p[4]);
      cx.beginPath();
      cx.moveTo(p[0] * escala * late, p[1] * escala * late);
      cx.lineTo(p[2] * escala * late, p[3] * escala * late);
      cx.stroke();
    }
    cx.restore();
  }

  return {
    CATALOGO: CATALOGO, perfilMontania: perfilMontania,
    preparar: preparar, dibujar: dibujar, dibujarUna: dibujarUna
  };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = Figuras; }
