/* Capas de color y luz.

   El principio que ordena todo el bloque: el color sale del lugar, no de un
   arcoiris generico. Cada lugar tiene su color en el guion, y de ahi se saca el
   tono raiz de la rueda. Asi la laguna se va para el azul y la calesita para el
   naranja, en vez de que los catorce lugares reciban exactamente el mismo
   tratamiento — que es la diferencia entre un mundo que se desarma y un filtro
   pegado encima. */

(function () {
  'use strict';
  var P = Psicodelia;

  function tonoDe(rgb) {
    var p = (rgb || '200,200,255').split(',');
    var r = +p[0] / 255, g = +p[1] / 255, b = +p[2] / 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    if (d < .0001) return 220;
    var h;
    if (mx === r) h = ((g - b) / d) % 6;
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    return ((h * 60) + 360) % 360;
  }
  P.tonoDe = tonoDe;

  /* Plasma: un campo de color que se mueve, hecho con tres gradientes radiales
     que orbitan a velocidades distintas. Tres y no uno porque con uno solo se
     lee como una mancha que se desplaza; con tres, los cruces arman formas que
     no se repiten nunca igual. */
  P.capa('plasma', { fase: 'cielo', umbral: .18 }, function (ctx) {
    var cx = ctx.cx, W = ctx.W, H = ctx.H;
    var raiz = tonoDe(ctx.escena.color);
    cx.save();
    cx.globalCompositeOperation = 'lighter';
    cx.globalAlpha = Math.min(.30, .05 + ctx.n * .18);
    for (var i = 0; i < 3; i++) {
      var v = .11 + i * .07;
      var px = W * (.5 + Math.cos(ctx.t * v + i * 2.1) * .38);
      var py = H * (.42 + Math.sin(ctx.t * v * 1.31 + i * 1.7) * .30);
      var rad = Math.max(W, H) * (.30 + i * .07);
      var g = cx.createRadialGradient(px, py, 0, px, py, rad);
      var tono = (raiz + i * 92 + ctx.t * 9) % 360;
      g.addColorStop(0, 'hsla(' + tono + ',92%,58%,.55)');
      g.addColorStop(1, 'hsla(' + tono + ',92%,50%,0)');
      cx.fillStyle = g;
      cx.fillRect(0, 0, W, H);
    }
    cx.restore();
  });

  /* Un abanico de rayos que gira detras de la figura. Va en la fase del cielo
     para quedar atras: adelante taparia la silueta, que es lo unico que el
     jugador necesita leer bien para saber donde esta. */
  P.capa('rayos', { fase: 'cielo', umbral: .35 }, function (ctx) {
    var cx = ctx.cx, e = ctx.escena;
    var raiz = tonoDe(e.color);
    var rad = Math.max(ctx.W, ctx.H) * .78;
    cx.save();
    cx.translate(e.fx, e.fy);
    cx.globalCompositeOperation = 'lighter';
    /* Los rayos se apagan a medida que se alejan y son finos.

       La primera version los tenia gruesos, opacos y llegando a los bordes: el
       cuadro entero se volvia un abanico y la figura del lugar quedaba como un
       recorte oscuro en el medio. Si no se distingue que hay delante, no se
       puede jugar. El recorte a .12 de alpha y el apagado hacia afuera dejan el
       giro visible sin comerse la silueta. */
    cx.globalAlpha = Math.min(.12, (ctx.n - .35) * .16);
    for (var i = 0; i < 14; i++) {
      var a = ctx.t * .14 + i * (6.2832 / 14);
      var tono = (raiz + i * 26) % 360;
      var g = cx.createRadialGradient(0, 0, e.E * .8, 0, 0, rad);
      g.addColorStop(0, 'hsla(' + tono + ',95%,62%,.55)');
      g.addColorStop(.55, 'hsla(' + tono + ',95%,58%,.18)');
      g.addColorStop(1, 'hsla(' + tono + ',95%,55%,0)');
      cx.fillStyle = g;
      cx.beginPath();
      cx.moveTo(0, 0);
      cx.lineTo(Math.cos(a - .055) * rad, Math.sin(a - .055) * rad);
      cx.lineTo(Math.cos(a + .055) * rad, Math.sin(a + .055) * rad);
      cx.closePath();
      cx.fill();
    }
    cx.restore();
  });

  /* Contraluz: una franja de color pegada a la linea del piso. Le da al
     horizonte un borde que el juego sobrio no tiene, y separa suelo de cielo
     sin dibujar una linea dura. */
  P.capa('contraluz', { fase: 'cielo', umbral: .22, movimiento: false }, function (ctx) {
    var cx = ctx.cx, e = ctx.escena;
    var alto = ctx.H * .10;
    var tono = (tonoDe(e.color) + 160) % 360;
    var g = cx.createLinearGradient(0, e.piso - alto, 0, e.piso + alto * .3);
    g.addColorStop(0, 'hsla(' + tono + ',95%,60%,0)');
    g.addColorStop(.75, 'hsla(' + tono + ',95%,62%,' + Math.min(.42, ctx.n * .34).toFixed(3) + ')');
    g.addColorStop(1, 'hsla(' + tono + ',95%,55%,0)');
    cx.save();
    cx.globalCompositeOperation = 'lighter';
    cx.fillStyle = g;
    cx.fillRect(0, e.piso - alto, ctx.W, alto * 1.3);
    cx.restore();
  });

  /* Aura de la figura: dos anillos de color que laten alrededor de lo que haya
     delante. Van con 'lighter', asi que suman luz en vez de tapar. */
  P.capa('aura', { fase: 'sobre', umbral: .20 }, function (ctx) {
    var cx = ctx.cx, e = ctx.escena;
    var raiz = tonoDe(e.color);
    var late = ctx.pulso(ctx.t, 1.4, .82, 1.12);
    cx.save();
    cx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < 2; i++) {
      var r = e.E * (1.35 + i * .55) * late;
      var g = cx.createRadialGradient(e.fx, e.fy, r * .55, e.fx, e.fy, r);
      var tono = (raiz + 40 + i * 130 + ctx.t * 14) % 360;
      g.addColorStop(0, 'hsla(' + tono + ',95%,62%,0)');
      g.addColorStop(.72, 'hsla(' + tono + ',95%,62%,' + (.05 + ctx.n * .10).toFixed(3) + ')');
      g.addColorStop(1, 'hsla(' + tono + ',95%,62%,0)');
      cx.fillStyle = g;
      cx.beginPath(); cx.arc(e.fx, e.fy, r, 0, 6.2832); cx.fill();
    }
    cx.restore();
  });

  /* Halo de Bel: mas chico y mas lento que el de la figura. Ella es el ancla
     del cuadro — si la envuelve el mismo remolino que al resto, el ojo se queda
     sin donde apoyarse y la pantalla entera se vuelve ruido. */
  P.capa('halobel', { fase: 'sobre', umbral: .30 }, function (ctx) {
    var cx = ctx.cx, e = ctx.escena;
    var bx = e.belX * ctx.W, by = e.piso - ctx.H * .055;
    var r = ctx.H * .10 * ctx.pulso(ctx.t, .9, .9, 1.1);
    var g = cx.createRadialGradient(bx, by, 0, bx, by, r);
    var tono = (ctx.t * 26) % 360;
    g.addColorStop(0, 'hsla(' + tono + ',95%,70%,' + (.05 + ctx.n * .09).toFixed(3) + ')');
    g.addColorStop(1, 'hsla(' + tono + ',95%,70%,0)');
    cx.save();
    cx.globalCompositeOperation = 'lighter';
    cx.fillStyle = g;
    cx.beginPath(); cx.arc(bx, by, r, 0, 6.2832); cx.fill();
    cx.restore();
  });

  /* El suelo devuelve el complementario del cielo. En el juego sobrio el piso
     es casi negro; aca es donde el color se acuesta. */
  P.capa('suelo', { fase: 'sobre', umbral: .25, movimiento: false }, function (ctx) {
    var cx = ctx.cx, e = ctx.escena;
    var alto = ctx.H - e.piso;
    if (alto <= 2) return;
    var tono = (tonoDe(e.color) + 180) % 360;
    var g = cx.createLinearGradient(0, e.piso, 0, ctx.H);
    g.addColorStop(0, 'hsla(' + tono + ',90%,55%,' + Math.min(.30, ctx.n * .22).toFixed(3) + ')');
    g.addColorStop(1, 'hsla(' + ((tono + 60) % 360) + ',90%,45%,0)');
    cx.save();
    cx.globalCompositeOperation = 'lighter';
    cx.fillStyle = g;
    cx.fillRect(0, e.piso, ctx.W, alto);
    cx.restore();
  });

  /* La viñeta deja de ser negra y pasa a ser de color. Oscurecer los bordes con
     negro apaga la imagen; hacerlo con un tono profundo cierra el cuadro sin
     matar la saturacion que se acaba de subir. */
  P.capa('vinieta', { fase: 'sobre', umbral: .15, movimiento: false }, function (ctx) {
    var cx = ctx.cx, W = ctx.W, H = ctx.H;
    var tono = (tonoDe(ctx.escena.color) + 210) % 360;
    var g = cx.createRadialGradient(W * .5, H * .48, Math.min(W, H) * .30,
                                    W * .5, H * .48, Math.max(W, H) * .78);
    g.addColorStop(0, 'hsla(' + tono + ',70%,20%,0)');
    g.addColorStop(1, 'hsla(' + tono + ',85%,16%,' + Math.min(.62, .18 + ctx.n * .34).toFixed(3) + ')');
    cx.save();
    cx.fillStyle = g;
    cx.fillRect(0, 0, W, H);
    cx.restore();
  });

  /* Acertar prende un anillo de arcoiris que se abre desde la figura. Dura 700
     ms y es la unica recompensa visual fuerte del juego: si acertar no se
     siente, la mecanica no engancha con nada. */
  P.capa('destelloAcierto', { fase: 'sobre' }, function (ctx) {
    var dt = ctx.desde('acierto');
    if (dt > .7 || dt < 0) return;
    var k = dt / .7;
    var cx = ctx.cx, e = ctx.escena;
    var r = e.E * (.6 + k * 2.6);
    cx.save();
    cx.globalCompositeOperation = 'lighter';
    cx.globalAlpha = (1 - k) * .55;
    cx.lineWidth = Math.max(2, e.E * .10 * (1 - k));
    for (var i = 0; i < 6; i++) {
      cx.strokeStyle = 'hsl(' + ((i * 60 + ctx.t * 40) % 360) + ',95%,62%)';
      cx.beginPath();
      cx.arc(e.fx, e.fy, r + i * cx.lineWidth * .55, i * 1.04, i * 1.04 + 1.02);
      cx.stroke();
    }
    cx.restore();
  });

  /* En el climax se invierte el color de una franja que barre la pantalla.
     Barre en vez de parpadear a proposito: invertir todo de golpe seria
     exactamente el destello de pantalla completa que la guarda prohibe. */
  P.capa('inversion', { fase: 'sobre', umbral: .5 }, function (ctx) {
    if (ctx.climax <= .02) return;
    var cx = ctx.cx, H = ctx.H;
    var alto = H * .16;
    var y = ((ctx.t * .35) % 1.4 - .2) * H;
    cx.save();
    cx.globalCompositeOperation = 'difference';
    cx.globalAlpha = ctx.climax * .5;
    var g = cx.createLinearGradient(0, y, 0, y + alto);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(.5, 'rgba(255,255,255,1)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    cx.fillStyle = g;
    cx.fillRect(0, y, ctx.W, alto);
    cx.restore();
  });


  /* Luz base sobre la figura.

     Sin umbral y sin depender de la tension: es la unica capa que existe para
     que se VEA, no para que se deforme. El juego original era oscuro a
     proposito, pero era oscuro con contraste; al meterle color encima, las
     figuras de linea fina (la montaña rusa, la bandada, el arbol) se perdian
     contra el fondo y quedaba una pantalla negra con textos flotando.

     Ilumina un ovalo alrededor de lo que haya delante, con el color del lugar,
     bastante abierto para que no se lea como un foco de teatro. */
  P.capa('luzbase', { fase: 'cielo', movimiento: false }, function (ctx) {
    var cx = ctx.cx, e = ctx.escena;
    var tono = tonoDe(e.color);
    var rx = Math.max(e.E * 2.6, ctx.W * .30);
    var ry = Math.max(e.E * 2.0, ctx.H * .40);
    var g = cx.createRadialGradient(e.fx, e.fy, 0, e.fx, e.fy, 1);
    // Gradiente circular estirado a ovalo con la transformacion, que es mas
    // barato que dibujar un radial elipsoide a mano.
    cx.save();
    cx.translate(e.fx, e.fy);
    cx.scale(rx / ry, 1);
    cx.translate(-e.fx, -e.fy);
    var g2 = cx.createRadialGradient(e.fx, e.fy, ry * .10, e.fx, e.fy, ry);
    g2.addColorStop(0, 'hsla(' + tono + ',70%,62%,.30)');
    g2.addColorStop(.45, 'hsla(' + tono + ',72%,55%,.15)');
    g2.addColorStop(1, 'hsla(' + tono + ',75%,50%,0)');
    cx.globalCompositeOperation = 'lighter';
    cx.fillStyle = g2;
    cx.beginPath(); cx.arc(e.fx, e.fy, ry, 0, 6.2832); cx.fill();
    cx.restore();
  });

})();
