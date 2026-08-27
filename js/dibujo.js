/* Primitivas de dibujo compartidas por todas las escenas.
   Nada de imágenes: la feria entera se dibuja con canvas, así pesa poco y
   se puede animar cualquier cosa. Todas las medidas van en fracciones de la
   pantalla, para que la composición aguante cualquier tamaño. */
var Dib = (function () {
  'use strict';

  var cx = null, W = 0, H = 0, t = 0, luces = true;

  function usar(ctx, w, h, tiempo, hayLuces) {
    cx = ctx; W = w; H = h; t = tiempo;
    luces = hayLuces !== false;
  }
  var X = function (u) { return W * u; };
  var Y = function (v) { return H * v; };
  var U = function (u) { return Math.min(W, H * 1.9) * u; };

  /* --- fondo --- */

  var estrellas = [];
  function sembrar(n) {
    estrellas = [];
    n = n || Math.round(W * H / 8000);
    for (var i = 0; i < n; i++) {
      estrellas.push({
        x: Math.random() * W, y: Math.random() * H * .70,
        r: Math.random() * 1.2 + .25, f: Math.random() * 6.28,
        v: .4 + Math.random() * 1.1
      });
    }
  }

  // paleta: cada escena puede teñir su cielo
  function cielo(paleta) {
    var p = paleta || ['#070912', '#0c0f1f', '#171227', '#0a0810'];
    var g = cx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, p[0]); g.addColorStop(.42, p[1]);
    g.addColorStop(.72, p[2]); g.addColorStop(1, p[3]);
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);

    cx.save();
    for (var i = 0; i < estrellas.length; i++) {
      var e = estrellas[i];
      cx.globalAlpha = .2 + .5 * (0.5 + 0.5 * Math.sin(t * e.v + e.f));
      cx.fillStyle = '#cfd6ee';
      cx.beginPath(); cx.arc(e.x, e.y, e.r, 0, 6.2832); cx.fill();
    }
    cx.restore();
  }

  /* Luna con su fase real: iluminacion 0 (nueva) a 1 (llena).
     creciente decide de que lado queda la sombra. */
  function luna(u, v, radio, iluminacion, creciente) {
    var lx = X(u), ly = Y(v), lr = U(radio);
    var brillo = .05 + .17 * iluminacion;
    var halo = cx.createRadialGradient(lx, ly, lr * .8, lx, ly, lr * 4.2);
    halo.addColorStop(0, 'rgba(214,206,184,' + brillo + ')');
    halo.addColorStop(.4, 'rgba(214,206,184,' + (brillo * .3) + ')');
    halo.addColorStop(1, 'rgba(214,206,184,0)');
    cx.fillStyle = halo;
    cx.beginPath(); cx.arc(lx, ly, lr * 4.2, 0, 6.2832); cx.fill();

    cx.fillStyle = '#ded4bc';
    cx.beginPath(); cx.arc(lx, ly, lr, 0, 6.2832); cx.fill();
    // La sombra es otro circulo corrido: da media luna, gibosa o nueva.
    if (iluminacion < .98) {
      var corr = iluminacion * 2.05 * lr * (creciente ? -1 : 1);
      cx.save();
      cx.beginPath(); cx.arc(lx, ly, lr, 0, 6.2832); cx.clip();
      cx.fillStyle = 'rgba(12,15,31,.94)';
      cx.beginPath(); cx.arc(lx + corr, ly, lr * 1.02, 0, 6.2832); cx.fill();
      cx.restore();
    }
  }

  /* --- luz --- */

  // Bombita: punto nítido con halo corto. El desenfoque largo las volvía manchas.
  function bombita(x, y, r, col, p) {
    if (!luces) {
      cx.fillStyle = '#191522';
      cx.beginPath(); cx.arc(x, y, r * .85, 0, 6.2832); cx.fill();
      return;
    }
    cx.save(); cx.globalCompositeOperation = 'lighter';
    var g = cx.createRadialGradient(x, y, 0, x, y, r * 4.5);
    g.addColorStop(0, 'rgba(' + col + ',' + (.42 * p) + ')');
    g.addColorStop(.45, 'rgba(' + col + ',' + (.13 * p) + ')');
    g.addColorStop(1, 'rgba(' + col + ',0)');
    cx.fillStyle = g;
    cx.beginPath(); cx.arc(x, y, r * 4.5, 0, 6.2832); cx.fill();
    cx.fillStyle = 'rgba(255,242,220,' + (.95 * p) + ')';
    cx.beginPath(); cx.arc(x, y, r, 0, 6.2832); cx.fill();
    cx.restore();
  }

  // Resplandor suelto, para focos y bocas de carpa.
  function resplandor(x, y, radio, col, alfa) {
    cx.save(); cx.globalCompositeOperation = 'lighter';
    var g = cx.createRadialGradient(x, y, 0, x, y, radio);
    g.addColorStop(0, 'rgba(' + col + ',' + alfa + ')');
    g.addColorStop(.45, 'rgba(' + col + ',' + (alfa * .35) + ')');
    g.addColorStop(1, 'rgba(' + col + ',0)');
    cx.fillStyle = g;
    cx.beginPath(); cx.arc(x, y, radio, 0, 6.2832); cx.fill();
    cx.restore();
  }

  var COLORES_GUIRNALDA = ['255,196,128', '196,96,104', '150,196,176'];

  function guirnalda(u1, v1, u2, v2, caida, semilla) {
    var x1 = X(u1), y1 = Y(v1), x2 = X(u2), y2 = Y(v2);
    cx.save();
    cx.strokeStyle = 'rgba(8,6,16,.95)'; cx.lineWidth = 1.4;
    cx.beginPath(); cx.moveTo(x1, y1);
    cx.quadraticCurveTo((x1 + x2) / 2, (y1 + y2) / 2 + caida, x2, y2);
    cx.stroke();
    var N = Math.max(7, Math.round(Math.abs(x2 - x1) / 38));
    for (var i = 0; i <= N; i++) {
      var u = i / N, iu = 1 - u;
      var x = iu * iu * x1 + 2 * iu * u * ((x1 + x2) / 2) + u * u * x2;
      var y = iu * iu * y1 + 2 * iu * u * ((y1 + y2) / 2 + caida) + u * u * y2;
      if (luces && Math.sin(t * 2.2 + i * .9 + semilla) < -.78) continue;  // quemada
      var p = .5 + .5 * (0.5 + 0.5 * Math.sin(t * 2.9 + i * 1.3 + semilla));
      bombita(x, y, 1.9, COLORES_GUIRNALDA[i % 3], p);
    }
    cx.restore();
  }

  /* --- construcciones --- */

  function carpa(u, vBase, ancho, alto, encendida) {
    var x = X(u), base = Y(vBase), an = U(ancho), al = H * alto;
    cx.save();
    var cima = base - al * 1.12, hombro = base - al * .42;
    var gajos = 7;
    for (var i = 0; i < gajos; i++) {
      var u0 = i / gajos, u1 = (i + 1) / gajos;
      var x0 = x - an / 2 + an * u0, x1 = x - an / 2 + an * u1;
      cx.fillStyle = (i % 2 === 0) ? '#0b0812' : '#141021';
      cx.beginPath();
      cx.moveTo(x, cima);
      cx.lineTo(x0, hombro + Math.pow(Math.abs(u0 - .5) * 2, 2) * al * .16);
      cx.lineTo(x1, hombro + Math.pow(Math.abs(u1 - .5) * 2, 2) * al * .16);
      cx.closePath(); cx.fill();
    }
    cx.fillStyle = '#0b0812';
    cx.beginPath();
    cx.moveTo(x - an / 2, hombro + al * .16); cx.lineTo(x - an / 2, base);
    cx.lineTo(x + an / 2, base); cx.lineTo(x + an / 2, hombro + al * .16);
    cx.closePath(); cx.fill();

    if (encendida && luces) {
      var g = cx.createLinearGradient(x, hombro, x, base);
      g.addColorStop(0, 'rgba(232,163,61,.5)');
      g.addColorStop(1, 'rgba(168,50,63,.10)');
      cx.fillStyle = g;
      cx.beginPath();
      cx.moveTo(x - an * .15, base); cx.lineTo(x - an * .11, hombro + al * .08);
      cx.quadraticCurveTo(x, hombro - al * .02, x + an * .11, hombro + al * .08);
      cx.lineTo(x + an * .15, base); cx.closePath(); cx.fill();
    }
    cx.strokeStyle = '#0b0812'; cx.lineWidth = 2;
    cx.beginPath(); cx.moveTo(x, cima); cx.lineTo(x, cima - al * .16); cx.stroke();
    cx.fillStyle = luces ? '#a8323f' : '#17121f';
    var on = Math.sin(t * 2.2 + x) * 3;
    cx.beginPath();
    cx.moveTo(x, cima - al * .16); cx.lineTo(x + 13 + on, cima - al * .115);
    cx.lineTo(x, cima - al * .07); cx.closePath(); cx.fill();
    cx.restore();
  }

  function portal(u, vBase, ancho, alto, rotulo) {
    var x = X(u), base = Y(vBase), an = U(ancho), al = H * alto;
    cx.save();
    var gr = an * .062;
    cx.fillStyle = '#0b0812';
    cx.fillRect(x - an / 2, base - al, gr, al);
    cx.fillRect(x + an / 2 - gr, base - al, gr, al);
    cx.beginPath();
    cx.moveTo(x - an / 2, base - al);
    cx.quadraticCurveTo(x, base - al * 1.46, x + an / 2, base - al);
    cx.lineTo(x + an / 2, base - al * .88);
    cx.quadraticCurveTo(x, base - al * 1.30, x - an / 2, base - al * .88);
    cx.closePath(); cx.fill();

    if (luces) {
      var N = 17;
      for (var i = 0; i <= N; i++) {
        var uu = i / N, iu = 1 - uu;
        var bx = iu * iu * (x - an / 2) + 2 * iu * uu * x + uu * uu * (x + an / 2);
        var by = iu * iu * (base - al) + 2 * iu * uu * (base - al * 1.38) + uu * uu * (base - al);
        if (i === 5 && Math.sin(t * 7) < 0) continue;      // una que falla
        bombita(bx, by, 2.1, '255,206,140', .55 + .45 * Math.sin(t * 2.4 + i * .7));
      }
      if (rotulo) {
        cx.save();
        cx.globalCompositeOperation = 'lighter';
        cx.font = '600 ' + Math.round(al * .17) + "px 'Cormorant Garamond',serif";
        cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.shadowColor = 'rgba(255,168,64,.9)'; cx.shadowBlur = 26;
        cx.fillStyle = 'rgba(255,200,116,.92)';
        cx.fillText(rotulo, x, base - al * 1.08);
        if (Math.sin(t * 11) < -.2) {
          cx.shadowBlur = 0; cx.fillStyle = 'rgba(10,8,16,.85)';
          cx.fillText(rotulo.slice(0, -2) + ' ' + rotulo.slice(-1), x, base - al * 1.08);
        }
        cx.restore();
      }
      cx.save();
      cx.globalCompositeOperation = 'lighter';
      var g2 = cx.createRadialGradient(x, base, 0, x, base, an * .72);
      g2.addColorStop(0, 'rgba(255,176,84,.11)');
      g2.addColorStop(.45, 'rgba(255,166,78,.04)');
      g2.addColorStop(1, 'rgba(255,166,78,0)');
      cx.fillStyle = g2;
      cx.beginPath(); cx.ellipse(x, base + al * .05, an * .72, al * .13, 0, 0, 6.2832); cx.fill();
      cx.restore();
    }
    cx.restore();
  }

  function vueltaAlMundo(u, v, radio, giro) {
    var cxp = X(u), cyp = Y(v), R = U(radio);
    cx.save();
    cx.strokeStyle = '#080610'; cx.lineWidth = Math.max(2, R * .028);
    cx.beginPath(); cx.arc(cxp, cyp, R, 0, 6.2832); cx.stroke();
    cx.beginPath(); cx.arc(cxp, cyp, R * .92, 0, 6.2832); cx.stroke();
    var N = 16;
    for (var i = 0; i < N; i++) {
      var a = giro + i * 6.2832 / N;
      var x = cxp + Math.cos(a) * R, y = cyp + Math.sin(a) * R;
      cx.strokeStyle = '#080610'; cx.lineWidth = Math.max(1.2, R * .014);
      cx.beginPath(); cx.moveTo(cxp, cyp); cx.lineTo(x, y); cx.stroke();
      var cb = R * .07;
      cx.fillStyle = '#080610'; cx.fillRect(x - cb / 2, y, cb, cb * 1.3);
      if (Math.sin(t * 1.5 + i * 1.7) > -.55)
        bombita(x, y, Math.max(1.3, R * .014), '255,198,120', .5 + .5 * Math.sin(t * 2.6 + i));
    }
    cx.strokeStyle = '#080610'; cx.lineWidth = Math.max(2.5, R * .042);
    cx.beginPath();
    cx.moveTo(cxp - R * .42, cyp + R * 1.42); cx.lineTo(cxp, cyp);
    cx.lineTo(cxp + R * .42, cyp + R * 1.42); cx.stroke();
    cx.beginPath();
    cx.moveTo(cxp - R * .26, cyp + R * .9); cx.lineTo(cxp + R * .26, cyp + R * .9); cx.stroke();
    cx.restore();
  }

  /* Calesita: techo cónico, caballos girando en perspectiva achatada. */
  function calesita(u, vBase, ancho, alto, giro) {
    var x = X(u), base = Y(vBase), an = U(ancho), al = H * alto;
    cx.save();
    // Plataforma.
    cx.fillStyle = '#0b0812';
    cx.beginPath(); cx.ellipse(x, base, an * .5, an * .10, 0, 0, 6.2832); cx.fill();
    // Caballos y barras, ordenados por profundidad.
    var N = 8, piezas = [];
    for (var i = 0; i < N; i++) {
      var a = giro + i * 6.2832 / N;
      piezas.push({ a: a, z: Math.sin(a) });
    }
    piezas.sort(function (p, q) { return p.z - q.z; });
    piezas.forEach(function (p) {
      var px = x + Math.cos(p.a) * an * .40;
      var py = base + Math.sin(p.a) * an * .085;
      var sube = Math.sin(t * 2.2 + p.a * 2) * al * .045;
      cx.strokeStyle = '#1b1626'; cx.lineWidth = Math.max(1.5, an * .008);
      cx.beginPath(); cx.moveTo(px, py); cx.lineTo(px, py - al * .70); cx.stroke();
      // Silueta de caballo, esquemática.
      cx.fillStyle = '#0d0a15';
      var cy = py - al * .28 + sube, cw = an * .075, ch = al * .10;
      cx.beginPath();
      cx.ellipse(px, cy, cw, ch * .55, 0, 0, 6.2832); cx.fill();
      cx.beginPath();
      cx.moveTo(px + cw * .55, cy - ch * .2);
      cx.lineTo(px + cw * 1.05, cy - ch * .95);
      cx.lineTo(px + cw * .72, cy - ch * 1.0);
      cx.lineTo(px + cw * .30, cy - ch * .35);
      cx.closePath(); cx.fill();
      cx.strokeStyle = '#0d0a15'; cx.lineWidth = Math.max(1.2, an * .007);
      [-.5, -.15, .2, .55].forEach(function (o) {
        cx.beginPath();
        cx.moveTo(px + cw * o, cy + ch * .35);
        cx.lineTo(px + cw * o + cw * .12, cy + ch * .95);
        cx.stroke();
      });
    });
    // Techo cónico a gajos.
    var cima = base - al;
    for (var j = 0; j < 10; j++) {
      var a0 = j / 10 * 6.2832, a1 = (j + 1) / 10 * 6.2832;
      cx.fillStyle = (j % 2 === 0) ? '#12101d' : '#0a0812';
      cx.beginPath();
      cx.moveTo(x, cima - al * .22);
      cx.lineTo(x + Math.cos(a0) * an * .52, base - al * .74 + Math.sin(a0) * an * .105);
      cx.lineTo(x + Math.cos(a1) * an * .52, base - al * .74 + Math.sin(a1) * an * .105);
      cx.closePath(); cx.fill();
    }
    // Bombitas del borde del techo.
    for (var k = 0; k < 14; k++) {
      var ak = k / 14 * 6.2832;
      var bx = x + Math.cos(ak) * an * .52;
      var by = base - al * .74 + Math.sin(ak) * an * .105;
      if (Math.sin(ak) < -.55) continue;    // las de atrás no se ven
      bombita(bx, by, 1.9, '255,200,132', .5 + .5 * Math.sin(t * 3 + k));
    }
    cx.restore();
  }

  /* --- carteles ---
     Los nombres de las atracciones tienen que estar pintados sobre algo, no
     flotando en el aire. Cada cartel es una tabla de madera con sus vetas,
     colgada de dos cadenas de un travesaño, con luces alrededor. */

  var MADERA = ['#7a5334', '#6b4729', '#875c3a', '#5e3f26'];

  /* x, y: el punto del que cuelga (el travesaño).
     opciones: { color, luces, ancho, alto, inclina } */
  function cartel(x, y, texto, op) {
    op = op || {};
    var an = op.ancho || U(.20);
    var al = op.alto || an * .30;
    var tinte = op.color || '#7a5334';
    var pinta = op.tinta || '#f0dcb4';
    // Cuelga con un vaivén muy leve, como cualquier cartel colgado.
    var vaiven = Math.sin(t * .55 + x * .01) * .012;
    var largoCadena = op.cadena === undefined ? al * .42 : op.cadena;

    cx.save();

    // Travesaño del que cuelga.
    if (op.travesano !== false) {
      cx.fillStyle = '#2a2030';
      cx.fillRect(x - an * .60, y - 4, an * 1.20, 7);
      cx.fillStyle = '#3a2e42';
      cx.fillRect(x - an * .60, y - 4, an * 1.20, 3);
    }

    cx.translate(x, y);
    cx.rotate(vaiven);

    // Cadenas.
    cx.strokeStyle = '#4a4055';
    cx.lineWidth = Math.max(1.5, an * .012);
    [-an * .38, an * .38].forEach(function (cxi) {
      cx.beginPath();
      cx.moveTo(cxi, 0);
      cx.lineTo(cxi, largoCadena);
      cx.stroke();
      // Eslabones.
      cx.fillStyle = '#5a4e66';
      for (var i = 1; i < 4; i++) {
        cx.beginPath();
        cx.arc(cxi, largoCadena * i / 4, Math.max(1.2, an * .009), 0, 6.2832);
        cx.fill();
      }
    });

    var ty = largoCadena;

    // Canto: la tabla tiene espesor.
    cx.fillStyle = '#3e2a1a';
    tabla(cx, 0, ty + 3, an, al);

    // Cara de la tabla, con las vetas.
    cx.save();
    tabla(cx, 0, ty, an, al);
    cx.clip();
    cx.fillStyle = tinte;
    cx.fillRect(-an * .55, ty - 4, an * 1.1, al + 8);
    // Vetas: franjas horizontales apenas distintas.
    for (var v = 0; v < 7; v++) {
      cx.fillStyle = MADERA[v % MADERA.length];
      cx.globalAlpha = .22;
      var vy = ty + al * (v / 7) + Math.sin(v * 2.3 + x) * 2;
      cx.fillRect(-an * .55, vy, an * 1.1, al * .07);
    }
    cx.globalAlpha = 1;
    // Sombra interior arriba y luz abajo: le da volumen.
    var g = cx.createLinearGradient(0, ty, 0, ty + al);
    g.addColorStop(0, 'rgba(0,0,0,.30)');
    g.addColorStop(.35, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(255,210,150,.10)');
    cx.fillStyle = g;
    cx.fillRect(-an * .55, ty - 4, an * 1.1, al + 8);
    cx.restore();

    // Borde pintado.
    cx.strokeStyle = 'rgba(30,18,10,.75)';
    cx.lineWidth = Math.max(1.5, an * .010);
    tabla(cx, 0, ty, an, al);
    cx.stroke();

    // Tornillos en las esquinas.
    cx.fillStyle = '#2e2418';
    [[-an * .42, ty + al * .18], [an * .42, ty + al * .18],
     [-an * .42, ty + al * .82], [an * .42, ty + al * .82]].forEach(function (t2) {
      cx.beginPath(); cx.arc(t2[0], t2[1], Math.max(1.2, an * .011), 0, 6.2832); cx.fill();
    });

    // El nombre, pintado a mano sobre la tabla.
    var cuerpo = op.cuerpo || al * .46;
    cx.font = "600 " + Math.round(cuerpo) + "px 'Cormorant Garamond',serif";
    cx.textAlign = 'center';
    cx.textBaseline = 'middle';
    // Relieve: la pintura está gastada y deja ver la madera.
    cx.fillStyle = 'rgba(20,10,4,.55)';
    cx.fillText(texto, 1.5, ty + al * .52 + 1.5);
    cx.fillStyle = pinta;
    cx.fillText(texto, 0, ty + al * .52);

    cx.restore();

    // Bombitas del borde de arriba.
    if (op.luces !== false) {
      var N = op.nLuces || 7;
      for (var b = 0; b < N; b++) {
        var bx = x - an * .46 + an * .92 * b / (N - 1);
        var by = y + largoCadena - al * .06;
        if (Math.sin(t * 2.6 + b * 1.3 + x) < -.86) continue;
        bombita(bx, by, 2, op.colorLuz || '255,204,140',
          .5 + .5 * Math.sin(t * 2.2 + b * .8));
      }
    }
  }

  /* Contorno de la tabla, con las esquinas comidas como las de feria. */
  function tabla(cx, x, y, an, al) {
    var r = al * .16;
    cx.beginPath();
    cx.moveTo(x - an * .5 + r, y);
    cx.lineTo(x + an * .5 - r, y);
    cx.lineTo(x + an * .5, y + r);
    cx.lineTo(x + an * .5, y + al - r);
    cx.lineTo(x + an * .5 - r, y + al);
    cx.lineTo(x - an * .5 + r, y + al);
    cx.lineTo(x - an * .5, y + al - r);
    cx.lineTo(x - an * .5, y + r);
    cx.closePath();
  }

  /* Cartel clavado sobre dos patas, para el piso. */
  function carteliPie(x, piso, texto, op) {
    op = op || {};
    var an = op.ancho || U(.15);
    var al = op.alto || an * .34;
    var alto = op.altura || al * 2.2;
    cx.save();
    // Patas.
    cx.fillStyle = '#4a3524';
    cx.fillRect(x - an * .30, piso - alto, an * .07, alto);
    cx.fillRect(x + an * .23, piso - alto, an * .07, alto);
    cx.restore();
    cartel(x, piso - alto - 2, texto,
      Object.assign({ cadena: 0, travesano: false, ancho: an, alto: al }, op));
  }

  /* --- ambiente --- */

  function suelo(vHorizonte, charcos) {
    var y0 = Y(vHorizonte) - 6;
    var g = cx.createLinearGradient(0, y0, 0, H);
    g.addColorStop(0, 'rgba(7,5,13,.5)');
    g.addColorStop(.35, '#070510');
    g.addColorStop(1, '#040308');
    cx.fillStyle = g; cx.fillRect(0, y0, W, H - y0);
    if (luces && charcos) {
      cx.save(); cx.globalCompositeOperation = 'lighter';
      charcos.forEach(function (c, i) {
        var x = X(c[0]) + Math.sin(t * .45 + i * 2) * 4;
        var y = Y(vHorizonte) + H * (.055 + i * .028);
        var rx = U(.055 + c[1] * .18), ry = H * .012;
        var gg = cx.createRadialGradient(x, y, 0, x, y, rx);
        gg.addColorStop(0, 'rgba(255,178,92,' + (c[1] * .55) + ')');
        gg.addColorStop(1, 'rgba(255,178,92,0)');
        cx.fillStyle = gg;
        cx.beginPath(); cx.ellipse(x, y, rx, ry, 0, 0, 6.2832); cx.fill();
      });
      cx.restore();
    }
  }

  function niebla(v, alto, vel, alfa, tono) {
    var y = Y(v);
    cx.save(); cx.globalCompositeOperation = 'screen';
    var off = (t * vel) % (W + 400) - 200;
    for (var i = -1; i < 3; i++) {
      var x = off + i * (W * .6);
      var g = cx.createRadialGradient(x, y, 0, x, y, W * .4);
      g.addColorStop(0, 'rgba(' + tono + ',' + alfa + ')');
      g.addColorStop(1, 'rgba(' + tono + ',0)');
      cx.fillStyle = g;
      cx.beginPath(); cx.ellipse(x, y, W * .4, H * alto, 0, 0, 6.2832); cx.fill();
    }
    cx.restore();
  }

  /* --- figuras --- */

  /* Bel de espaldas. escala en fracción de alto de pantalla. */
  function bel(u, vBase, escala, contraluz) {
    var base = Y(vBase), h = H * escala, x = X(u);
    cx.save();
    cx.fillStyle = '#030408';
    cx.beginPath();
    cx.moveTo(x - h * .185, base);
    cx.quadraticCurveTo(x - h * .205, base - h * .42, x - h * .125, base - h * .60);
    cx.quadraticCurveTo(x - h * .098, base - h * .70, x, base - h * .725);
    cx.quadraticCurveTo(x + h * .098, base - h * .70, x + h * .125, base - h * .60);
    cx.quadraticCurveTo(x + h * .205, base - h * .42, x + h * .185, base);
    cx.closePath(); cx.fill();
    cx.beginPath(); cx.arc(x, base - h * .815, h * .090, 0, 6.2832); cx.fill();
    cx.beginPath();
    cx.moveTo(x - h * .088, base - h * .83);
    cx.quadraticCurveTo(x - h * .122, base - h * .70, x - h * .085, base - h * .615);
    cx.quadraticCurveTo(x - h * .052, base - h * .585, x - h * .030, base - h * .612);
    cx.quadraticCurveTo(x, base - h * .632, x + h * .030, base - h * .612);
    cx.quadraticCurveTo(x + h * .052, base - h * .585, x + h * .085, base - h * .615);
    cx.quadraticCurveTo(x + h * .122, base - h * .70, x + h * .088, base - h * .83);
    cx.closePath(); cx.fill();
    cx.save();
    cx.globalAlpha = .5; cx.fillStyle = '#000';
    cx.beginPath(); cx.ellipse(x, base + 2, h * .19, h * .026, 0, 0, 6.2832); cx.fill();
    cx.restore();
    if (luces && contraluz !== false) {
      cx.globalCompositeOperation = 'lighter';
      cx.strokeStyle = 'rgba(255,192,116,.34)'; cx.lineWidth = 1.8;
      cx.beginPath();
      cx.moveTo(x - h * .106, base - h * .60);
      cx.quadraticCurveTo(x, base - h * .705, x + h * .106, base - h * .60);
      cx.stroke();
      cx.strokeStyle = 'rgba(255,192,116,.26)'; cx.lineWidth = 1.5;
      cx.beginPath(); cx.arc(x, base - h * .815, h * .082, -2.6, -.5); cx.stroke();
    }
    cx.restore();
  }

  /* La presencia: una figura que no termina de tener forma.
     intensidad 0 a 1 la hace más definida y más cerca. */
  function presencia(u, vBase, escala, intensidad) {
    var base = Y(vBase), h = H * escala, x = X(u);
    var q = Math.max(0, Math.min(1, intensidad));
    cx.save();
    // Se dibuja como varias siluetas apenas corridas: nunca cierra en un borde.
    for (var c = 0; c < 3; c++) {
      var off = Math.sin(t * 1.3 + c * 2.1) * h * .012 * (1 + c);
      cx.globalAlpha = (c === 0 ? .85 : .28) * (.35 + .65 * q);
      cx.fillStyle = c === 0 ? '#04040a' : '#160d16';
      cx.beginPath();
      cx.moveTo(x - h * .17 + off, base);
      cx.quadraticCurveTo(x - h * .19 + off, base - h * .45, x - h * .10 + off, base - h * .64);
      cx.quadraticCurveTo(x - h * .07 + off, base - h * .74, x + off, base - h * .78);
      cx.quadraticCurveTo(x + h * .07 + off, base - h * .74, x + h * .10 + off, base - h * .64);
      cx.quadraticCurveTo(x + h * .19 + off, base - h * .45, x + h * .17 + off, base);
      cx.closePath(); cx.fill();
      cx.beginPath();
      cx.arc(x + off, base - h * .86, h * .075, 0, 6.2832); cx.fill();
    }
    cx.globalAlpha = 1;
    // Donde deberían ir los ojos no hay ojos: hay dos huecos más oscuros.
    if (q > .35) {
      cx.fillStyle = 'rgba(0,0,0,' + (.5 * q) + ')';
      cx.beginPath(); cx.ellipse(x - h * .028, base - h * .868, h * .017, h * .026, 0, 0, 6.2832); cx.fill();
      cx.beginPath(); cx.ellipse(x + h * .028, base - h * .868, h * .017, h * .026, 0, 0, 6.2832); cx.fill();
    }
    // Le come la luz alrededor.
    cx.globalCompositeOperation = 'multiply';
    var g = cx.createRadialGradient(x, base - h * .45, 0, x, base - h * .45, h * .55);
    g.addColorStop(0, 'rgba(30,26,38,' + (.55 * q) + ')');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    cx.fillStyle = g;
    cx.beginPath(); cx.arc(x, base - h * .45, h * .55, 0, 6.2832); cx.fill();
    cx.restore();
  }

  /* Poste de luz, para poblar el camino. */
  function poste(u, vBase, alto) {
    var x = X(u), base = Y(vBase), al = H * alto;
    cx.save();
    cx.strokeStyle = '#0a0812'; cx.lineWidth = Math.max(2, al * .022);
    cx.beginPath(); cx.moveTo(x, base); cx.lineTo(x, base - al); cx.stroke();
    cx.beginPath();
    cx.moveTo(x, base - al);
    cx.quadraticCurveTo(x + al * .10, base - al * 1.06, x + al * .16, base - al * .99);
    cx.stroke();
    bombita(x + al * .16, base - al * .97, Math.max(2, al * .022), '255,196,120',
      .55 + .45 * Math.sin(t * 1.7 + x));
    if (luces) resplandor(x + al * .16, base - al * .97, al * .5, '255,180,90', .10);
    cx.restore();
  }

  /* Banderines triangulares colgando de un hilo. */
  function banderines(u1, v1, u2, v2, caida) {
    var x1 = X(u1), y1 = Y(v1), x2 = X(u2), y2 = Y(v2);
    cx.save();
    cx.strokeStyle = 'rgba(8,6,16,.9)'; cx.lineWidth = 1.2;
    cx.beginPath(); cx.moveTo(x1, y1);
    cx.quadraticCurveTo((x1 + x2) / 2, (y1 + y2) / 2 + caida, x2, y2);
    cx.stroke();
    var N = Math.max(6, Math.round(Math.abs(x2 - x1) / 44));
    var cols = ['#7d2230', '#4a4a2a', '#2f3a52'];
    for (var i = 0; i < N; i++) {
      var u = (i + .5) / N, iu = 1 - u;
      var x = iu * iu * x1 + 2 * iu * u * ((x1 + x2) / 2) + u * u * x2;
      var y = iu * iu * y1 + 2 * iu * u * ((y1 + y2) / 2 + caida) + u * u * y2;
      var ond = Math.sin(t * 1.6 + i * .8) * 3;
      cx.fillStyle = luces ? cols[i % 3] : '#14111c';
      cx.globalAlpha = luces ? .55 : 1;
      cx.beginPath();
      cx.moveTo(x - 9, y); cx.lineTo(x + 9, y);
      cx.lineTo(x + ond, y + 17); cx.closePath(); cx.fill();
    }
    cx.restore();
  }

  /* Viñeta que se cierra: sube con la tensión de la escena. */
  function vineta(fuerza) {
    var g = cx.createRadialGradient(W / 2, H * .45, Math.min(W, H) * (.78 - .34 * fuerza),
      W / 2, H * .45, Math.max(W, H) * .82);
    g.addColorStop(0, 'rgba(3,4,8,0)');
    g.addColorStop(1, 'rgba(3,4,8,' + (.45 + .45 * fuerza) + ')');
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);
  }

  /* Partículas de ceniza o polvo flotando. */
  var motas = [];
  function sembrarMotas(n) {
    motas = [];
    for (var i = 0; i < (n || 40); i++) {
      motas.push({
        x: Math.random(), y: Math.random(),
        v: .004 + Math.random() * .012,
        d: Math.random() * 6.28, r: .6 + Math.random() * 1.4
      });
    }
  }
  function polvo(alfa, tono) {
    cx.save();
    cx.fillStyle = 'rgba(' + (tono || '220,200,170') + ',' + (alfa || .16) + ')';
    motas.forEach(function (m) {
      var y = (m.y - t * m.v) % 1; if (y < 0) y += 1;
      var x = m.x + Math.sin(t * .5 + m.d) * .012;
      cx.beginPath(); cx.arc(X(x), Y(y), m.r, 0, 6.2832); cx.fill();
    });
    cx.restore();
  }

  return {
    usar: usar, X: X, Y: Y, U: U,
    sembrar: sembrar, sembrarMotas: sembrarMotas,
    cielo: cielo, luna: luna,
    bombita: bombita, resplandor: resplandor, guirnalda: guirnalda,
    carpa: carpa, portal: portal, vueltaAlMundo: vueltaAlMundo, calesita: calesita,
    suelo: suelo, niebla: niebla, polvo: polvo,
    bel: bel, presencia: presencia, poste: poste, banderines: banderines,
    cartel: cartel, carteliPie: carteliPie,
    vineta: vineta
  };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = Dib; }
