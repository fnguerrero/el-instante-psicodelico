/* Los pintores.

   Las figuras de figuras.js son segmentos: sirven para el vuelo de las piezas,
   pero como dibujo son palitos. Acá está la otra mitad — cada figura pintada
   en serio, con relleno, luz y volumen.

   El juego usa las dos: mientras la carta hace efecto se ven las piezas
   volando, y cuando aterrizan aparece esto. */
var Pintores = (function () {
  'use strict';

  function sembrado(n) {
    var s = n >>> 0;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  /* Halo suave. Se usa tanto que conviene tenerlo a mano. */
  function halo(cx, x, y, r, color, fuerza) {
    var g = cx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(' + color + ',' + fuerza + ')');
    g.addColorStop(.5, 'rgba(' + color + ',' + (fuerza * .28) + ')');
    g.addColorStop(1, 'rgba(' + color + ',0)');
    cx.save();
    cx.globalCompositeOperation = 'lighter';
    cx.fillStyle = g;
    cx.beginPath(); cx.arc(x, y, r, 0, 6.2832); cx.fill();
    cx.restore();
  }

  /* ============ el platillo ============ */
  function platillo(cx, E, t, alPiso) {
    var flota = Math.sin(t * .8) * E * .04;
    /* Y se inclina, muy poco, como algo que se sostiene solo y corrige. Sin
       esto es un disco pegado al aire. */
    var ladeo = Math.sin(t * .43) * .035 + Math.sin(t * .77) * .015;
    // Si sabemos a que altura esta el suelo, el haz llega hasta ahi y deja un
    // charco de luz. Cortado en el aire se ve como un recorte pegado.
    var hastaPiso = (alPiso && alPiso > E * .4) ? alPiso - flota : E * 1.45;
    cx.save();
    cx.translate(0, flota);
    cx.rotate(ladeo);

    // El cono de luz va primero: todo lo demás se apoya encima.
    var largo = hastaPiso, boca = E * .55 + hastaPiso * .32;
    var cono = cx.createLinearGradient(0, E * .1, 0, E * .1 + largo);
    cono.addColorStop(0, 'rgba(190,225,255,.34)');
    cono.addColorStop(.45, 'rgba(160,205,255,.13)');
    cono.addColorStop(1, 'rgba(140,190,255,0)');
    cx.save();
    cx.globalCompositeOperation = 'lighter';
    cx.fillStyle = cono;
    cx.beginPath();
    cx.moveTo(-E * .28, E * .12);
    cx.lineTo(E * .28, E * .12);
    cx.lineTo(boca, E * .12 + largo);
    cx.lineTo(-boca, E * .12 + largo);
    cx.closePath(); cx.fill();

    // Motas subiendo por el haz.
    var rnd = sembrado(11);
    for (var i = 0; i < 26; i++) {
      var fase = (t * .34 + rnd()) % 1;
      var yy = E * .12 + largo * (1 - fase);
      var an = E * .28 + (boca - E * .28) * (1 - fase);
      var xx = (rnd() * 2 - 1) * an;
      var a = Math.sin(fase * Math.PI) * .5;
      cx.fillStyle = 'rgba(215,240,255,' + a.toFixed(3) + ')';
      cx.beginPath(); cx.arc(xx, yy, 1.5 + rnd() * 1.6, 0, 6.2832); cx.fill();
    }
    // Charco donde el haz toca el piso.
    if (alPiso && alPiso > E * .4) {
      var ch = cx.createRadialGradient(0, E * .12 + largo, 0, 0, E * .12 + largo, boca);
      ch.addColorStop(0, 'rgba(200,230,255,.30)');
      ch.addColorStop(.55, 'rgba(160,200,255,.10)');
      ch.addColorStop(1, 'rgba(150,190,255,0)');
      cx.fillStyle = ch;
      cx.beginPath();
      cx.ellipse(0, E * .12 + largo, boca, boca * .17, 0, 0, 6.2832);
      cx.fill();
    }
    cx.restore();

    // Resplandor de fondo.
    halo(cx, 0, 0, E * 1.5, '150,190,255', .16);

    // Cúpula: vidrio con reflejo.
    var cup = cx.createLinearGradient(-E * .3, -E * .58, E * .3, -E * .05);
    cup.addColorStop(0, 'rgba(190,225,255,.85)');
    cup.addColorStop(.5, 'rgba(120,165,225,.55)');
    cup.addColorStop(1, 'rgba(70,105,165,.5)');
    cx.fillStyle = cup;
    cx.beginPath();
    cx.ellipse(0, -E * .05, E * .46, E * .52, 0, Math.PI, 0);
    cx.closePath(); cx.fill();
    // Tres ventanas en la cupula. Sin ellas es una burbuja lisa.
    for (var vn = 0; vn < 3; vn++) {
      var av = -Math.PI * .78 + vn * Math.PI * .28;
      var wx = Math.cos(av) * E * .30, wy = Math.sin(av) * E * .30 - E * .12;
      cx.fillStyle = 'rgba(190,225,255,.55)';
      cx.beginPath();
      cx.ellipse(wx, wy, E * .055, E * .075, 0, 0, 6.2832);
      cx.fill();
      cx.strokeStyle = 'rgba(40,60,100,.5)';
      cx.lineWidth = E * .010;
      cx.stroke();
    }
    // Brillo del vidrio.
    cx.fillStyle = 'rgba(255,255,255,.30)';
    cx.beginPath();
    cx.ellipse(-E * .16, -E * .28, E * .10, E * .19, -.4, 0, 6.2832);
    cx.fill();

    // Casco: dos elipses con un degradé metálico entre ellas.
    var met = cx.createLinearGradient(0, -E * .12, 0, E * .30);
    met.addColorStop(0, '#c9d6ea');
    met.addColorStop(.34, '#8593ad');
    met.addColorStop(.62, '#4d5872');
    met.addColorStop(1, '#2b3145');
    cx.fillStyle = met;
    cx.beginPath();
    cx.ellipse(0, E * .10, E, E * .22, 0, 0, 6.2832);
    cx.fill();

    // Filo iluminado por arriba.
    cx.strokeStyle = 'rgba(225,240,255,.55)';
    cx.lineWidth = 2;
    cx.beginPath();
    cx.ellipse(0, E * .10, E, E * .22, 0, Math.PI, 0);
    cx.stroke();

    // Panza más oscura, para que el disco tenga espesor.
    var panza = cx.createLinearGradient(0, E * .10, 0, E * .34);
    panza.addColorStop(0, 'rgba(40,46,66,0)');
    panza.addColorStop(1, 'rgba(16,19,30,.9)');
    cx.fillStyle = panza;
    cx.beginPath();
    cx.ellipse(0, E * .10, E, E * .22, 0, 0, Math.PI);
    cx.fill();

    // Anillo de luces: cada una late en su momento.
    for (var l = 0; l < 14; l++) {
      var ang = l / 14 * 6.2832;
      var lx = Math.cos(ang) * E * .84, ly = Math.sin(ang) * E * .185 + E * .10;
      // Las de atrás quedan tapadas por el casco.
      var atras = Math.sin(ang) < 0;
      var pul = .45 + .55 * Math.sin(t * 2.4 - l * .55);
      var col = atras ? '120,160,220' : '255,225,170';
      halo(cx, lx, ly, E * .075 * (.7 + pul * .5), col, (atras ? .22 : .55) * pul);
      cx.fillStyle = 'rgba(255,250,235,' + ((atras ? .3 : .95) * pul).toFixed(3) + ')';
      cx.beginPath(); cx.arc(lx, ly, E * .017, 0, 6.2832); cx.fill();
    }

    cx.restore();
  }

  /* ============ la montaña rusa ============ */
  function montania(cx, E, t, perfil) {
    var pts = perfil;
    // Estructura: columnas y cruces de madera.
    cx.lineCap = 'round';
    for (var c = 0; c < pts.length; c += 3) {
      var p = pts[c];
      cx.strokeStyle = 'rgba(96,78,104,.75)';
      cx.lineWidth = E * .016;
      cx.beginPath();
      cx.moveTo(p[0] * E, p[1] * E); cx.lineTo(p[0] * E, E);
      cx.stroke();
      if (c + 3 < pts.length) {
        var q = pts[c + 3];
        cx.strokeStyle = 'rgba(78,64,88,.5)';
        cx.lineWidth = E * .009;
        cx.beginPath();
        cx.moveTo(p[0] * E, p[1] * E); cx.lineTo(q[0] * E, E);
        cx.moveTo(q[0] * E, q[1] * E); cx.lineTo(p[0] * E, E);
        cx.stroke();
      }
    }
    // La vía: dos rieles y los durmientes.
    for (var k = 1; k < pts.length; k++) {
      var a = pts[k - 1], b = pts[k];
      cx.strokeStyle = 'rgba(58,48,70,.9)';
      cx.lineWidth = E * .034;
      cx.beginPath();
      cx.moveTo(a[0] * E, a[1] * E + E * .012);
      cx.lineTo(b[0] * E, b[1] * E + E * .012);
      cx.stroke();
      cx.strokeStyle = 'rgba(212,190,240,.85)';
      cx.lineWidth = E * .011;
      cx.beginPath();
      cx.moveTo(a[0] * E, a[1] * E); cx.lineTo(b[0] * E, b[1] * E);
      cx.stroke();
    }
    // Durmientes: travesanos cortos perpendiculares a la via.
    for (var d = 0; d < pts.length - 1; d += 1) {
      var a2 = pts[d], b2 = pts[d + 1];
      var ang = Math.atan2(b2[1] - a2[1], b2[0] - a2[0]);
      var nx = -Math.sin(ang), ny = Math.cos(ang);
      cx.strokeStyle = 'rgba(70,58,84,.75)';
      cx.lineWidth = E * .009;
      cx.beginPath();
      cx.moveTo(a2[0] * E - nx * E * .022, a2[1] * E - ny * E * .022);
      cx.lineTo(a2[0] * E + nx * E * .022, a2[1] * E + ny * E * .022);
      cx.stroke();
    }

    /* El vagon recorre la via. Estaba parado en la estacion y una montana rusa
       quieta no es una montana rusa: es un andamio. */
    var avance = (t * .085) % 1;
    var iVia = Math.min(pts.length - 2, Math.floor(avance * (pts.length - 1)));
    var fVia = avance * (pts.length - 1) - iVia;
    var pa = pts[iVia], pb = pts[iVia + 1];
    var vx = (pa[0] + (pb[0] - pa[0]) * fVia) * E;
    var vy = (pa[1] + (pb[1] - pa[1]) * fVia) * E + E * .035;
    var angVia = Math.atan2((pb[1] - pa[1]) * E, (pb[0] - pa[0]) * E);
    cx.save();
    cx.translate(vx, vy);
    cx.rotate(angVia);
    cx.fillStyle = '#3a2a55';
    cx.beginPath();
    cx.moveTo(-E * .075, 0);
    cx.lineTo(E * .105, 0);
    cx.quadraticCurveTo(E * .135, E * .022, E * .112, E * .052);
    cx.lineTo(-E * .06, E * .052);
    cx.closePath(); cx.fill();
    cx.fillStyle = '#c23a48';
    cx.fillRect(-E * .075, E * .012, E * .18, E * .015);
    cx.fillStyle = '#12101c';
    cx.beginPath(); cx.arc(-E * .038, E * .056, E * .013, 0, 6.2832); cx.fill();
    cx.beginPath(); cx.arc(E * .068, E * .056, E * .013, 0, 6.2832); cx.fill();
    cx.restore();

    // Guirnalda de bombitas sobre la vía.
    for (var m = 0; m < pts.length; m += 2) {
      var pm = pts[m];
      var pul = .5 + .5 * Math.sin(t * 1.7 + m * .7);
      halo(cx, pm[0] * E, pm[1] * E - E * .03, E * .05 * pul, '255,205,130', .5 * pul);
    }
  }

  /* ============ la luna ============ */
  function luna(cx, E, t) {
    var R = E * .82;
    halo(cx, 0, 0, R * 2.3, '200,205,255', .22);
    // Cuerpo.
    var g = cx.createRadialGradient(-R * .3, -R * .35, R * .1, 0, 0, R);
    g.addColorStop(0, '#f6f2e4');
    g.addColorStop(.62, '#d8d2c4');
    g.addColorStop(1, '#a8a49c');
    cx.fillStyle = g;
    cx.beginPath(); cx.arc(0, 0, R, 0, 6.2832); cx.fill();
    // Mares y cráteres.
    var rnd = sembrado(3);
    for (var i = 0; i < 13; i++) {
      var a = rnd() * 6.2832, d = Math.pow(rnd(), .6) * R * .82;
      var cx0 = Math.cos(a) * d, cy0 = Math.sin(a) * d;
      var rr = R * (.05 + rnd() * .17);
      cx.fillStyle = 'rgba(150,146,144,' + (.16 + rnd() * .2).toFixed(3) + ')';
      cx.beginPath(); cx.arc(cx0, cy0, rr, 0, 6.2832); cx.fill();
      // Borde iluminado del cráter.
      cx.strokeStyle = 'rgba(255,252,240,.16)';
      cx.lineWidth = 1.2;
      cx.beginPath(); cx.arc(cx0 - rr * .06, cy0 - rr * .06, rr, 0, 6.2832); cx.stroke();
    }
    // Sombra del limbo.
    var s = cx.createRadialGradient(0, 0, R * .55, 0, 0, R);
    s.addColorStop(0, 'rgba(20,20,40,0)');
    s.addColorStop(1, 'rgba(20,20,45,.42)');
    cx.fillStyle = s;
    cx.beginPath(); cx.arc(0, 0, R, 0, 6.2832); cx.fill();
  }

  /* ============ la ruina ============ */
  function ruina(cx, E, t) {
    var rnd = sembrado(7);
    // Polvo que todavía no bajó.
    cx.save();
    cx.globalCompositeOperation = 'lighter';
    for (var d = 0; d < 16; d++) {
      var dx = (rnd() * 2 - 1) * E, dy = E * (.3 + rnd() * .7);
      var rr = E * (.1 + rnd() * .22);
      var sube = (Math.sin(t * .3 + d) * .5 + .5) * E * .1;
      cx.fillStyle = 'rgba(120,105,120,.05)';
      cx.beginPath(); cx.arc(dx, dy - sube, rr, 0, 6.2832); cx.fill();
    }
    cx.restore();
    // Escombros con volumen.
    for (var i = 0; i < 40; i++) {
      var x = (rnd() * 2 - 1) * E * .98;
      var y = E * (.55 + rnd() * .44);
      var ang = (rnd() - .5) * 2.4;
      var lar = E * (.06 + rnd() * .2);
      var gr = E * (.012 + rnd() * .022);
      cx.save();
      cx.translate(x, y); cx.rotate(ang);
      cx.fillStyle = 'rgba(58,48,60,.95)';
      cx.fillRect(-lar, -gr, lar * 2, gr * 2);
      cx.fillStyle = 'rgba(140,124,142,.35)';
      cx.fillRect(-lar, -gr, lar * 2, gr * .55);
      cx.restore();
    }
    // Lo que quedó parado.
    for (var j = 0; j < 6; j++) {
      var xj = -E * .72 + j * E * .29;
      var hj = E * (.35 + rnd() * .5);
      cx.strokeStyle = 'rgba(70,58,74,.9)';
      cx.lineWidth = E * .022;
      cx.lineCap = 'round';
      cx.beginPath();
      cx.moveTo(xj, E); cx.lineTo(xj + (rnd() - .5) * E * .1, E - hj);
      cx.stroke();
    }
  }

  /* ============ el árbol ============ */
  function arbol(cx, E, t) {
    var vientoT = t * .5;
    function rama(x, y, ang, largo, grosor, prof) {
      if (prof <= 0 || largo < E * .03) return;
      // Cuanto más fina la rama, más la mueve el viento.
      var mece = Math.sin(vientoT + prof * 1.4 + x * .02) * (7 - prof) * .012;
      var a = ang + mece;
      var x2 = x + Math.cos(a) * largo, y2 = y + Math.sin(a) * largo;
      cx.strokeStyle = prof > 3 ? 'rgba(62,48,44,.95)' : 'rgba(96,74,62,.85)';
      cx.lineWidth = grosor;
      cx.lineCap = 'round';
      cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x2, y2); cx.stroke();
      if (prof <= 2) {
        // Las puntas llevan luz, como si el árbol tuviera brotes encendidos.
        halo(cx, x2, y2, E * .05, '190,230,180', .3);
      }
      rama(x2, y2, a - .42 - prof * .03, largo * .72, grosor * .68, prof - 1);
      rama(x2, y2, a + .38 + prof * .02, largo * .70, grosor * .68, prof - 1);
      if (prof > 3) rama(x2, y2, a + .04, largo * .60, grosor * .55, prof - 2);
    }
    rama(0, E, -Math.PI / 2, E * .52, E * .05, 6);
  }


  /* ============ la cama ============ */
  function cama(cx, E, t) {
    var an = E * .89, al = E;
    // Sabana: la parte blanda va antes que la madera.
    var sab = cx.createLinearGradient(0, al * .10, 0, al * .32);
    sab.addColorStop(0, '#e8e2d8');
    sab.addColorStop(1, '#b3aca6');
    cx.fillStyle = sab;
    cx.beginPath();
    cx.moveTo(-an, al * .13);
    cx.quadraticCurveTo(0, al * .05, an, al * .13);
    cx.lineTo(an, al * .31);
    cx.quadraticCurveTo(0, al * .38, -an, al * .31);
    cx.closePath(); cx.fill();
    // Pliegues.
    cx.strokeStyle = 'rgba(120,112,110,.30)';
    cx.lineWidth = E * .006;
    for (var k = 0; k < 7; k++) {
      var xk = -an * .75 + k * an * .25;
      cx.beginPath();
      cx.moveTo(xk, al * .12); cx.lineTo(xk + al * .05, al * .32);
      cx.stroke();
    }
    // Almohada.
    cx.fillStyle = '#f0ebe0';
    cx.beginPath();
    cx.ellipse(-an * .68, al * .10, an * .22, al * .075, -.08, 0, 6.2832);
    cx.fill();

    // Madera: respaldo, piecera y patas.
    cx.strokeStyle = '#6d5240';
    cx.lineCap = 'round';
    cx.lineWidth = E * .028;
    cx.beginPath();
    cx.moveTo(-an * .99, al * .11); cx.lineTo(-an * .99, -al * .45);
    cx.moveTo(-an * .58, al * .11); cx.lineTo(-an * .58, -al * .45);
    cx.moveTo(-an * 1.02, -al * .45); cx.lineTo(-an * .55, -al * .45);
    cx.moveTo(an * .74, al * .13); cx.lineTo(an * .74, -al * .11);
    cx.moveTo(an * .99, al * .13); cx.lineTo(an * .99, -al * .11);
    cx.moveTo(an * .71, -al * .11); cx.lineTo(an * 1.02, -al * .11);
    cx.stroke();
    // Barrotes del respaldo.
    cx.lineWidth = E * .014;
    cx.strokeStyle = '#7d6049';
    for (var i = 1; i < 5; i++) {
      var x = -an * .99 + i * (an * .41 / 5);
      cx.beginPath(); cx.moveTo(x, al * .08); cx.lineTo(x, -al * .43); cx.stroke();
    }
    // Patas.
    cx.lineWidth = E * .026;
    cx.strokeStyle = '#5c4536';
    [-an * .92, -an * .62, an * .66, an * .93].forEach(function (px) {
      cx.beginPath(); cx.moveTo(px, al * .29); cx.lineTo(px, al * .62); cx.stroke();
    });
    // Mesa de luz con el velador: es lo que dice que esto es un cuarto.
    // Del lado derecho: a la izquierda de la cama es donde se para Bel.
    var mx = an * 1.24, my = al * .10;
    cx.fillStyle = '#6d5240';
    cx.fillRect(mx - E * .085, my, E * .17, E * .022);
    cx.strokeStyle = '#5c4536';
    cx.lineWidth = E * .018;
    cx.lineCap = 'round';
    cx.beginPath();
    cx.moveTo(mx - E * .065, my + E * .022); cx.lineTo(mx - E * .065, al * .62);
    cx.moveTo(mx + E * .065, my + E * .022); cx.lineTo(mx + E * .065, al * .62);
    cx.stroke();
    // El velador prendido.
    halo(cx, mx, my - E * .085, E * .28, '255,206,140', .55);
    cx.fillStyle = '#c8a86e';
    cx.beginPath();
    cx.moveTo(mx - E * .055, my - E * .04);
    cx.lineTo(mx + E * .055, my - E * .04);
    cx.lineTo(mx + E * .035, my - E * .12);
    cx.lineTo(mx - E * .035, my - E * .12);
    cx.closePath(); cx.fill();
    cx.strokeStyle = '#8a7048';
    cx.lineWidth = E * .010;
    cx.beginPath();
    cx.moveTo(mx, my - E * .04); cx.lineTo(mx, my);
    cx.stroke();

    halo(cx, 0, al * .2, E * 1.1, '210,200,255', .07);
  }

  /* ============ la puerta parada sola ============ */
  function puerta(cx, E, t) {
    var an = E * .40, al = E * .96;
    // Lo que se filtra por las juntas: es lo que hace que la puerta importe.
    var pul = .8 + .2 * Math.sin(t * .9);
    cx.save();
    cx.globalCompositeOperation = 'lighter';
    var luz = cx.createLinearGradient(0, E * .84, 0, E * .62);
    luz.addColorStop(0, 'rgba(255,224,160,0)');
    luz.addColorStop(1, 'rgba(255,214,140,' + (.5 * pul) + ')');
    cx.fillStyle = luz;
    cx.beginPath();
    cx.moveTo(-an, E * .70); cx.lineTo(an, E * .70);
    cx.lineTo(an * 1.9, E * .90); cx.lineTo(-an * 1.9, E * .90);
    cx.closePath(); cx.fill();
    cx.restore();
    halo(cx, 0, E * .70, E * .8, '255,208,130', .3 * pul);

    // Marco.
    cx.fillStyle = '#4a3728';
    cx.fillRect(-an - E * .12, -al, E * .10, al + E * .70);
    cx.fillRect(an + E * .02, -al, E * .10, al + E * .70);
    cx.fillRect(-an - E * .12, -al - E * .04, (an + E * .12) * 2, E * .10);
    // Hoja.
    var mad = cx.createLinearGradient(-an, 0, an, 0);
    mad.addColorStop(0, '#6b4e35');
    mad.addColorStop(.4, '#5a4029');
    mad.addColorStop(1, '#432f1f');
    cx.fillStyle = mad;
    cx.fillRect(-an, -al + E * .06, an * 2, al + E * .64);
    // Paneles hundidos.
    for (var q = 0; q < 2; q++) {
      var y0 = -al + E * .22 + q * E * .50;
      cx.strokeStyle = 'rgba(30,20,12,.6)';
      cx.lineWidth = E * .012;
      cx.strokeRect(-an + E * .11, y0, (an - E * .11) * 2, E * .34);
      cx.strokeStyle = 'rgba(150,120,88,.25)';
      cx.lineWidth = E * .006;
      cx.strokeRect(-an + E * .125, y0 + E * .012, (an - E * .125) * 2, E * .33);
    }
    // Picaporte.
    halo(cx, an - E * .15, -E * .10, E * .06, '255,220,150', .5);
    cx.fillStyle = '#d8b878';
    cx.beginPath(); cx.arc(an - E * .15, -E * .10, E * .028, 0, 6.2832); cx.fill();
  }

  /* ============ la casa ============ */
  function casa(cx, E, t) {
    var an = E * .82, al = E * .62;
    // Paredes.
    var par = cx.createLinearGradient(-an, 0, an, 0);
    par.addColorStop(0, '#4a4358');
    par.addColorStop(.5, '#3d3749');
    par.addColorStop(1, '#2e2937');
    cx.fillStyle = par;
    cx.fillRect(-an, -al, an * 2, al + E * .96);
    // Techo.
    cx.fillStyle = '#2a2334';
    cx.beginPath();
    cx.moveTo(-an - E * .12, -al);
    cx.lineTo(0, -al - E * .48);
    cx.lineTo(an + E * .12, -al);
    cx.closePath(); cx.fill();
    cx.strokeStyle = 'rgba(160,150,190,.30)';
    cx.lineWidth = E * .01;
    cx.beginPath();
    cx.moveTo(-an - E * .12, -al); cx.lineTo(0, -al - E * .48);
    cx.lineTo(an + E * .12, -al); cx.stroke();
    // Chimenea con humo.
    cx.fillStyle = '#332c40';
    cx.fillRect(E * .34, -al - E * .58, E * .16, E * .40);
    cx.save();
    cx.globalCompositeOperation = 'lighter';
    for (var h = 0; h < 7; h++) {
      var f = ((t * .18 + h / 7) % 1);
      cx.fillStyle = 'rgba(190,185,205,' + (.16 * (1 - f)) + ')';
      cx.beginPath();
      cx.arc(E * .42 + Math.sin(f * 4 + h) * E * .10,
             -al - E * .60 - f * E * .75, E * (.04 + f * .12), 0, 6.2832);
      cx.fill();
    }
    cx.restore();
    // Ventanas encendidas: el corazon del dibujo.
    [[-E * .46, -E * .16], [E * .30, -E * .16]].forEach(function (v, i) {
      var pul = .82 + .18 * Math.sin(t * 1.3 + i * 2);
      halo(cx, v[0], v[1], E * .34, '255,196,110', .5 * pul);
      var vg = cx.createLinearGradient(v[0], v[1] - E * .19, v[0], v[1] + E * .19);
      vg.addColorStop(0, 'rgba(255,222,160,' + (.95 * pul) + ')');
      vg.addColorStop(1, 'rgba(232,168,86,' + (.8 * pul) + ')');
      cx.fillStyle = vg;
      cx.fillRect(v[0] - E * .17, v[1] - E * .19, E * .34, E * .38);
      cx.strokeStyle = '#241d2c';
      cx.lineWidth = E * .018;
      cx.strokeRect(v[0] - E * .17, v[1] - E * .19, E * .34, E * .38);
      cx.lineWidth = E * .012;
      cx.beginPath();
      cx.moveTo(v[0], v[1] - E * .19); cx.lineTo(v[0], v[1] + E * .19);
      cx.moveTo(v[0] - E * .17, v[1]); cx.lineTo(v[0] + E * .17, v[1]);
      cx.stroke();
    });
    // Puerta.
    cx.fillStyle = '#241c2e';
    cx.fillRect(-E * .13, E * .34, E * .26, E * .62);
    // Marco y picaporte con un poco de relieve.
    cx.strokeStyle = 'rgba(150,132,110,.32)';
    cx.lineWidth = E * .012;
    cx.strokeRect(-E * .13, E * .34, E * .26, E * .62);
    cx.fillStyle = 'rgba(255,206,130,.85)';
    cx.beginPath(); cx.arc(E * .07, E * .62, E * .018, 0, 6.2832); cx.fill();

    // Sendero: piedras que se van agrandando hacia el frente.
    for (var sd = 0; sd < 5; sd++) {
      var f2 = sd / 4;
      cx.fillStyle = 'rgba(120,110,140,' + (.12 + f2 * .10).toFixed(3) + ')';
      cx.beginPath();
      cx.ellipse(-E * .02 - f2 * E * .10, E * (.99 + f2 * .10),
                 E * (.055 + f2 * .05), E * (.016 + f2 * .012), 0, 0, 6.2832);
      cx.fill();
    }
  }

  /* ============ la bandada ============ */
  function bandada(cx, E, t) {
    var rnd = sembrado(19);
    for (var i = 0; i < 40; i++) {
      var x0 = (rnd() * 2 - 1) * E * .96;
      var y0 = (rnd() * 2 - 1) * E * .78;
      var vel = .5 + rnd() * .7;
      // Cada uno vuela a su ritmo y cruza el cuadro.
      var x = x0 + ((t * vel * E * .3) % (E * 2.4)) - E * 1.2;
      var bat = Math.sin(t * (6 + vel * 5) + i) * .5 + .5;
      var ab = E * (.045 + rnd() * .04);
      cx.strokeStyle = 'rgba(228,222,240,' + (.4 + rnd() * .45).toFixed(2) + ')';
      cx.lineWidth = E * .008;
      cx.lineCap = 'round';
      cx.beginPath();
      cx.moveTo(x - ab, y0 + ab * .3 * bat);
      cx.quadraticCurveTo(x - ab * .3, y0 - ab * .6 * bat, x, y0 - ab * .2);
      cx.quadraticCurveTo(x + ab * .3, y0 - ab * .6 * bat, x + ab, y0 + ab * .3 * bat);
      cx.stroke();
    }
  }


  /* ============ la calesita ============ */
  function calesita(cx, E, t) {
    var giro = t * .38;
    halo(cx, 0, -E * .1, E * 1.5, '255,200,140', .13);

    // Plataforma.
    cx.fillStyle = '#3a2f46';
    cx.beginPath();
    cx.ellipse(0, E * .58, E * .86, E * .11, 0, 0, 6.2832);
    cx.fill();
    cx.strokeStyle = 'rgba(220,180,120,.45)';
    cx.lineWidth = E * .012;
    cx.stroke();

    // Mastil.
    cx.fillStyle = '#4a3c56';
    cx.fillRect(-E * .022, -E * .90, E * .044, E * 1.48);

    // Los caballitos: los de atras primero, para que los tape el mastil.
    var lista = [];
    for (var k = 0; k < 6; k++) {
      var a = giro + k / 6 * 6.2832;
      lista.push({ a: a, z: Math.sin(a) });
    }
    lista.sort(function (p, q) { return p.z - q.z; });
    lista.forEach(function (c) {
      var x = Math.cos(c.a) * E * .62;
      var esc = .78 + c.z * .22;
      // Suben y bajan, cada uno en su fase.
      var y = E * (.08 + c.z * .07) + Math.sin(t * 2.2 + c.a) * E * .07;
      cx.save();
      cx.translate(x, y);
      cx.scale(esc, esc);
      // Barra.
      cx.strokeStyle = 'rgba(226,200,150,.7)';
      cx.lineWidth = E * .016;
      cx.beginPath();
      cx.moveTo(0, -E * .56); cx.lineTo(0, E * .42);
      cx.stroke();
      // Cuerpo del caballito.
      cx.fillStyle = '#c9b08a';
      cx.beginPath();
      cx.ellipse(0, E * .10, E * .13, E * .075, -.12, 0, 6.2832);
      cx.fill();
      // Cuello y cabeza.
      cx.beginPath();
      cx.moveTo(E * .08, E * .06);
      cx.quadraticCurveTo(E * .17, E * .0, E * .16, -E * .08);
      cx.lineTo(E * .21, -E * .09);
      cx.quadraticCurveTo(E * .19, E * .02, E * .11, E * .10);
      cx.closePath(); cx.fill();
      // Patas.
      cx.strokeStyle = '#b09a76';
      cx.lineWidth = E * .016;
      cx.lineCap = 'round';
      [-.07, .05].forEach(function (px) {
        cx.beginPath();
        cx.moveTo(E * px, E * .15);
        cx.lineTo(E * (px - .02), E * .27);
        cx.stroke();
      });
      cx.restore();
    });

    // Techo conico a franjas.
    for (var i = 0; i < 16; i++) {
      var a0 = i / 16 * 6.2832 + giro * .3;
      var a1 = (i + 1) / 16 * 6.2832 + giro * .3;
      cx.fillStyle = (i % 2) ? '#8f3murky' : '#8f3a48';
      cx.fillStyle = (i % 2) ? '#a8465a' : '#efe4d2';
      cx.beginPath();
      cx.moveTo(0, -E * .94);
      cx.lineTo(Math.cos(a0) * E * .92, Math.sin(a0) * E * .11 - E * .52);
      cx.lineTo(Math.cos(a1) * E * .92, Math.sin(a1) * E * .11 - E * .52);
      cx.closePath(); cx.fill();
    }
    // Borde del techo con bombitas.
    cx.strokeStyle = 'rgba(240,220,180,.7)';
    cx.lineWidth = E * .014;
    cx.beginPath();
    cx.ellipse(0, -E * .52, E * .92, E * .11, 0, 0, 6.2832);
    cx.stroke();
    for (var b = 0; b < 12; b++) {
      var ab = b / 12 * 6.2832 + giro * .3;
      var pul = .5 + .5 * Math.sin(t * 2 + b);
      halo(cx, Math.cos(ab) * E * .92, Math.sin(ab) * E * .11 - E * .52,
           E * .05 * pul, '255,214,150', .55 * pul);
    }
    // Remate.
    cx.fillStyle = '#d8b878';
    cx.beginPath(); cx.arc(0, -E * .98, E * .035, 0, 6.2832); cx.fill();
  }

  /* ============ el faro ============ */
  function faro(cx, E, t) {
    var giro = t * .55;
    // Dos haces opuestos que barren. De cada uno solo se ve la parte que
    // apunta hacia adelante. Van en tres capas concentricas, de la mas ancha y
    // tenue a la mas fina y brillante: eso es lo que le da el borde blando.
    cx.save();
    cx.globalCompositeOperation = 'lighter';
    for (var d = 0; d < 2; d++) {
      var ang = giro + d * Math.PI;
      var frente = Math.cos(ang);
      if (frente <= .05) continue;
      var lado = Math.sin(ang);
      var dir = lado >= 0 ? 1 : -1;
      var y0 = -E * .57;
      var largo = E * 2.6;

      for (var capa = 0; capa < 3; capa++) {
        var k = 1 - capa * .34;              // 1, .66, .32
        var fuerza = (.10 + capa * .09) * frente;
        var altoFin = E * (.30 + Math.abs(lado) * .45) * k;
        var g = cx.createLinearGradient(0, y0, largo * dir, y0);
        g.addColorStop(0, 'rgba(255,244,212,' + (fuerza * 1.7).toFixed(3) + ')');
        g.addColorStop(.35, 'rgba(255,236,190,' + (fuerza * .55).toFixed(3) + ')');
        // Muere antes del borde: un haz cortado por el marco no parece luz.
        g.addColorStop(.8, 'rgba(255,232,182,' + (fuerza * .08).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(255,230,180,0)');
        cx.fillStyle = g;
        cx.beginPath();
        cx.moveTo(0, y0 - E * .07 * k);
        cx.lineTo(0, y0 + E * .07 * k);
        cx.lineTo(largo * dir, y0 + altoFin);
        cx.lineTo(largo * dir, y0 - altoFin);
        cx.closePath();
        cx.fill();
      }
    }
    cx.restore();

    // Torre a franjas, mas angosta arriba.
    var pasos = 12;
    for (var i = 0; i < pasos; i++) {
      var u0 = i / pasos, u1 = (i + 1) / pasos;
      var an0 = E * (.30 - u0 * .13), an1 = E * (.30 - u1 * .13);
      var yA = E * (1 - u0 * 1.42), yB = E * (1 - u1 * 1.42);
      cx.fillStyle = (i % 2) ? '#b8354a' : '#e6ded0';
      cx.beginPath();
      cx.moveTo(-an0, yA); cx.lineTo(an0, yA);
      cx.lineTo(an1, yB); cx.lineTo(-an1, yB);
      cx.closePath(); cx.fill();
    }
    // Sombra a los costados: sin esto la torre es un trapecio, no un cilindro.
    var som = cx.createLinearGradient(-E * .30, 0, E * .30, 0);
    som.addColorStop(0, 'rgba(10,10,26,.45)');
    som.addColorStop(.40, 'rgba(10,10,26,0)');
    som.addColorStop(1, 'rgba(10,10,26,.30)');
    cx.fillStyle = som;
    cx.beginPath();
    cx.moveTo(-E * .30, E); cx.lineTo(E * .30, E);
    cx.lineTo(E * .17, -E * .42); cx.lineTo(-E * .17, -E * .42);
    cx.closePath(); cx.fill();

    // Balcon.
    cx.fillStyle = '#2e2838';
    cx.fillRect(-E * .25, -E * .46, E * .50, E * .06);
    // Linterna.
    var lin = cx.createLinearGradient(0, -E * .72, 0, -E * .42);
    lin.addColorStop(0, 'rgba(255,248,220,.98)');
    lin.addColorStop(1, 'rgba(255,208,126,.88)');
    cx.fillStyle = lin;
    cx.fillRect(-E * .17, -E * .72, E * .34, E * .28);
    cx.strokeStyle = '#2e2838';
    cx.lineWidth = E * .016;
    cx.strokeRect(-E * .17, -E * .72, E * .34, E * .28);
    halo(cx, 0, -E * .58, E * .60, '255,232,170', .65);
    // Cupula.
    cx.fillStyle = '#2e2838';
    cx.beginPath();
    cx.ellipse(0, -E * .72, E * .20, E * .13, 0, Math.PI, 0);
    cx.closePath(); cx.fill();

    // Rocas al pie: un faro plantado en el pasto se ve pegado.
    var rndR = sembrado(31);
    for (var rk = 0; rk < 9; rk++) {
      var rx = (rndR() * 2 - 1) * E * .62;
      var ry = E * (.94 + rndR() * .07);
      var rw = E * (.07 + rndR() * .11);
      cx.fillStyle = 'rgba(46,42,58,' + (.55 + rndR() * .35).toFixed(2) + ')';
      cx.beginPath();
      cx.ellipse(rx, ry, rw, rw * (.5 + rndR() * .25), rndR() * .6, 0, 6.2832);
      cx.fill();
      cx.strokeStyle = 'rgba(150,140,180,.13)';
      cx.lineWidth = E * .006;
      cx.stroke();
    }
  }

  /* ============ la laguna ============ */
  function laguna(cx, E, t) {
    // El agua: una banda que se abre hacia el frente.
    var ag = cx.createLinearGradient(0, E * .28, 0, E);
    ag.addColorStop(0, '#151a34');
    ag.addColorStop(.5, '#1b2244');
    ag.addColorStop(1, '#242c58');
    cx.fillStyle = ag;
    cx.beginPath();
    cx.moveTo(-E * .32, E * .28); cx.lineTo(E * .32, E * .28);
    cx.lineTo(E * 1.7, E); cx.lineTo(-E * 1.7, E);
    cx.closePath(); cx.fill();

    // La orilla del fondo.
    cx.strokeStyle = 'rgba(150,140,200,.30)';
    cx.lineWidth = E * .01;
    cx.beginPath();
    cx.moveTo(-E * .32, E * .28); cx.lineTo(E * .32, E * .28);
    cx.stroke();

    // El reflejo de algo luminoso, quebrado por el oleaje.
    cx.save();
    cx.globalCompositeOperation = 'lighter';
    for (var r = 0; r < 13; r++) {
      var u = r / 12;
      var y = E * (.32 + u * u * .66);
      var an = E * (.03 + u * .13);
      var corr = Math.sin(t * 1.6 + r * .9) * E * .04 * u;
      var a = (.45 - u * .3) * (.7 + .3 * Math.sin(t * 2.4 + r));
      cx.fillStyle = 'rgba(240,240,215,' + a.toFixed(3) + ')';
      cx.beginPath();
      cx.ellipse(corr, y, an, E * .012, 0, 0, 6.2832);
      cx.fill();
    }
    cx.restore();

    // Juncos en la orilla: rompen la linea recta del agua.
    var rndJ = sembrado(23);
    for (var jn = 0; jn < 22; jn++) {
      var jx = (rndJ() * 2 - 1) * E * 1.5;
      // Solo a los costados: en el medio taparian el reflejo.
      if (Math.abs(jx) < E * .42) continue;
      var jy = E * (.34 + rndJ() * .52);
      var jalto = E * (.10 + rndJ() * .16);
      var jinc = (rndJ() - .5) * .5 + Math.sin(t * .6 + jn) * .07;
      cx.strokeStyle = 'rgba(58,74,64,' + (.35 + rndJ() * .35).toFixed(2) + ')';
      cx.lineWidth = E * .010;
      cx.lineCap = 'round';
      cx.beginPath();
      cx.moveTo(jx, jy);
      cx.quadraticCurveTo(jx + jinc * E * .06, jy - jalto * .6,
                          jx + jinc * E * .14, jy - jalto);
      cx.stroke();
    }

    // Lineas de oleaje.
    for (var i = 0; i < 15; i++) {
      var v = i / 14;
      var yy = E * (.34 + v * v * .64);
      var ancho = E * (.36 + v * 1.3);
      var trozos = 2 + Math.floor(v * 5);
      cx.strokeStyle = 'rgba(180,190,240,' + (.06 + v * .13).toFixed(3) + ')';
      cx.lineWidth = E * (.006 + v * .008);
      for (var k = 0; k < trozos; k++) {
        var paso = ancho * 2 / trozos;
        var x0 = -ancho + k * paso + Math.sin(t * 1.1 + i + k) * E * .03;
        cx.beginPath();
        cx.moveTo(x0, yy); cx.lineTo(x0 + paso * .6, yy);
        cx.stroke();
      }
    }
  }

  /* ============ la barca ============ */
  function barca(cx, E, t) {
    var mece = Math.sin(t * .7) * .045;
    cx.save();
    cx.rotate(mece);
    cx.translate(0, Math.sin(t * .9) * E * .02);

    // Vela.
    var vel = cx.createLinearGradient(0, -E * .84, E * .5, -E * .2);
    vel.addColorStop(0, 'rgba(238,230,214,.95)');
    vel.addColorStop(1, 'rgba(198,186,172,.85)');
    cx.fillStyle = vel;
    cx.beginPath();
    cx.moveTo(0, -E * .86);
    cx.quadraticCurveTo(E * .46, -E * .60, E * .52, -E * .30);
    cx.quadraticCurveTo(E * .30, -E * .20, 0, -E * .16);
    cx.closePath(); cx.fill();
    cx.strokeStyle = 'rgba(120,110,100,.35)';
    cx.lineWidth = E * .006;
    for (var v = 1; v < 4; v++) {
      var f = v / 4;
      cx.beginPath();
      cx.moveTo(0, -E * .86 + f * E * .70);
      cx.quadraticCurveTo(E * .28 * (1 - f * .4), -E * .5 + f * E * .3,
                          E * .52 * (1 - f * .55), -E * .30 + f * E * .16);
      cx.stroke();
    }
    // Mastil.
    cx.strokeStyle = '#6b5238';
    cx.lineWidth = E * .022;
    cx.lineCap = 'round';
    cx.beginPath();
    cx.moveTo(0, E * .10); cx.lineTo(0, -E * .88);
    cx.stroke();

    // Casco.
    var cas = cx.createLinearGradient(0, E * .08, 0, E * .42);
    cas.addColorStop(0, '#7a5a3c');
    cas.addColorStop(1, '#402d1e');
    cx.fillStyle = cas;
    cx.beginPath();
    cx.moveTo(-E * .80, E * .10);
    cx.quadraticCurveTo(0, E * .56, E * .80, E * .10);
    cx.quadraticCurveTo(0, E * .24, -E * .80, E * .10);
    cx.closePath(); cx.fill();
    // Filo iluminado.
    cx.strokeStyle = 'rgba(226,200,160,.5)';
    cx.lineWidth = E * .014;
    cx.beginPath();
    cx.moveTo(-E * .80, E * .10);
    cx.quadraticCurveTo(0, E * .24, E * .80, E * .10);
    cx.stroke();
    // Remo.
    cx.strokeStyle = '#6b5238';
    cx.lineWidth = E * .016;
    cx.beginPath();
    cx.moveTo(-E * .60, -E * .04); cx.lineTo(-E * .94, E * .44);
    cx.stroke();
    cx.fillStyle = '#6b5238';
    cx.beginPath();
    cx.ellipse(-E * .95, E * .47, E * .06, E * .03, .95, 0, 6.2832);
    cx.fill();
    cx.restore();

    // Lo que deja en el agua.
    cx.save();
    cx.globalCompositeOperation = 'lighter';
    cx.fillStyle = 'rgba(180,200,255,.10)';
    cx.beginPath();
    cx.ellipse(0, E * .50, E * .86, E * .07, 0, 0, 6.2832);
    cx.fill();
    cx.restore();
  }

  /* ============ el reloj ============ */
  function reloj(cx, E, t) {
    halo(cx, 0, 0, E * 1.25, '230,215,255', .1);
    // Pie.
    cx.fillStyle = '#3a3048';
    cx.beginPath();
    cx.moveTo(-E * .20, E * .80); cx.lineTo(E * .20, E * .80);
    cx.lineTo(E * .34, E); cx.lineTo(-E * .34, E);
    cx.closePath(); cx.fill();
    // Caja.
    var caja = cx.createRadialGradient(-E * .3, -E * .34, E * .06, 0, 0, E * .84);
    caja.addColorStop(0, '#6f5e46');
    caja.addColorStop(.7, '#483c2e');
    caja.addColorStop(1, '#2c241c');
    cx.fillStyle = caja;
    cx.beginPath(); cx.arc(0, 0, E * .82, 0, 6.2832); cx.fill();
    // Esfera.
    var esf = cx.createRadialGradient(-E * .18, -E * .22, E * .05, 0, 0, E * .68);
    esf.addColorStop(0, '#f4eeda');
    esf.addColorStop(1, '#d6cdb4');
    cx.fillStyle = esf;
    cx.beginPath(); cx.arc(0, 0, E * .68, 0, 6.2832); cx.fill();
    cx.strokeStyle = 'rgba(60,48,34,.55)';
    cx.lineWidth = E * .014;
    cx.stroke();

    // Marcas.
    cx.strokeStyle = '#3a3026';
    cx.lineCap = 'round';
    for (var h = 0; h < 12; h++) {
      var a = h / 12 * 6.2832 - Math.PI / 2;
      var largo = (h % 3 === 0) ? .14 : .07;
      cx.lineWidth = (h % 3 === 0) ? E * .022 : E * .012;
      cx.beginPath();
      cx.moveTo(Math.cos(a) * E * .60, Math.sin(a) * E * .60);
      cx.lineTo(Math.cos(a) * E * (.60 - largo), Math.sin(a) * E * (.60 - largo));
      cx.stroke();
    }

    // Las agujas corren, y corren mal: es un sueno.
    var min = -Math.PI / 2 + t * .42;
    var hor = -Math.PI / 2 + t * .42 / 12 + 1.1;
    cx.strokeStyle = '#2b2219';
    cx.lineWidth = E * .030;
    cx.beginPath();
    cx.moveTo(0, 0); cx.lineTo(Math.cos(hor) * E * .34, Math.sin(hor) * E * .34);
    cx.stroke();
    cx.lineWidth = E * .020;
    cx.beginPath();
    cx.moveTo(0, 0); cx.lineTo(Math.cos(min) * E * .52, Math.sin(min) * E * .52);
    cx.stroke();
    // El segundero va al reves.
    cx.strokeStyle = 'rgba(170,60,50,.9)';
    cx.lineWidth = E * .010;
    var seg = -Math.PI / 2 - t * 1.6;
    cx.beginPath();
    cx.moveTo(0, 0); cx.lineTo(Math.cos(seg) * E * .56, Math.sin(seg) * E * .56);
    cx.stroke();
    cx.fillStyle = '#2b2219';
    cx.beginPath(); cx.arc(0, 0, E * .030, 0, 6.2832); cx.fill();

    // El pendulo, colgando del pie, con su vaiven propio.
    var osc = Math.sin(t * 1.15) * .34;
    cx.save();
    cx.translate(0, E * .80);
    cx.rotate(osc);
    cx.strokeStyle = '#6f5e46';
    cx.lineWidth = E * .012;
    cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(0, E * .30); cx.stroke();
    var gp = cx.createRadialGradient(-E * .02, E * .30, E * .01, 0, E * .32, E * .075);
    gp.addColorStop(0, '#e8c473');
    gp.addColorStop(1, '#9a7a34');
    cx.fillStyle = gp;
    cx.beginPath(); cx.arc(0, E * .32, E * .068, 0, 6.2832); cx.fill();
    cx.strokeStyle = 'rgba(60,48,34,.7)';
    cx.lineWidth = E * .010;
    cx.stroke();
    cx.restore();
  }

  var PINTORES = {
    platillo: platillo, luna: luna, ruina: ruina, arbol: arbol,
    cama: cama, puerta: puerta, casa: casa, bandada: bandada,
    calesita: calesita, faro: faro, laguna: laguna, barca: barca, reloj: reloj
  };

  /* La montaña rusa necesita su perfil, que lo tiene figuras.js. */
  /* extra: { perfil, alPiso } — el perfil lo necesita la montania, la
     distancia al piso la necesita el platillo para apoyar su haz. */
  function pintar(cx, clave, x, y, E, t, extra) {
    extra = extra || {};
    cx.save();
    cx.translate(x, y);
    if (clave === 'montania') montania(cx, E, t, extra.perfil);
    else if (clave === 'platillo') platillo(cx, E, t, extra.alPiso);
    else if (PINTORES[clave]) PINTORES[clave](cx, E, t);
    cx.restore();
  }

  return { pintar: pintar, halo: halo, PINTORES: PINTORES };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = Pintores; }
