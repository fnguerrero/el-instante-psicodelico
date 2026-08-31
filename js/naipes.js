/* Los naipes.

   Cada arcano dibujado como una carta de verdad, en el espíritu del Tarot de
   Marsella: fondo crema, filete doble, numeral romano arriba, la ilustración
   con su iconografía propia, y el nombre en una cartela abajo.

   La paleta es la de Marsella y es corta a propósito — cinco tintas planas, sin
   degradés ni sombras. Esas barajas se imprimían con tacos de madera y una
   plancha por color; imitar ese límite es lo que hace que se lean como naipes y
   no como íconos de aplicación. */
var Naipes = (function () {
  'use strict';

  var CREMA   = '#efe3c8';
  var CREMA2  = '#e4d5b4';
  var TINTA   = '#2b241d';
  var ROJO    = '#b2382f';
  var AZUL    = '#2f5a90';
  var ORO     = '#d9a53c';
  var CARNE   = '#f0c9a0';
  var VERDE   = '#5b7a4a';

  /* ---------- primitivas ---------- */

  /* Generador con semilla: la textura de una carta tiene que ser siempre la
     misma, o cada repintado la cambia y la carta "hierve". */
  function sembrado(n) {
    var v = n >>> 0;
    return function () { v = (v * 1664525 + 1013904223) >>> 0; return v / 4294967296; };
  }

  /* Grano del papel. Son puntos sueltos, no un patron: lo que hace que el
     fondo deje de leerse como un rectangulo de color plano. */
  function papel(cx, An, Al, semilla) {
    var rnd = sembrado(semilla || 5);
    cx.save();
    for (var i = 0; i < Math.round(An * Al * .02); i++) {
      var x = rnd() * An, y = rnd() * Al;
      var v = rnd();
      cx.fillStyle = v > .5 ? 'rgba(120,100,70,.055)' : 'rgba(255,250,235,.06)';
      cx.fillRect(x, y, 1, 1);
    }
    // Manchas de humedad muy tenues, tres por carta.
    for (var m = 0; m < 3; m++) {
      var mx = rnd() * An, my = rnd() * Al, mr = An * (.10 + rnd() * .16);
      var g = cx.createRadialGradient(mx, my, 0, mx, my, mr);
      g.addColorStop(0, 'rgba(150,124,80,.055)');
      g.addColorStop(1, 'rgba(150,124,80,0)');
      cx.fillStyle = g;
      cx.beginPath(); cx.arc(mx, my, mr, 0, 6.2832); cx.fill();
    }
    cx.restore();
  }

  /* Registro imperfecto: en una impresion de tacos, cada plancha de color caia
     un pelo corrida. Se imita desplazando la ilustracion un poco y dejando un
     fantasma de otro color debajo. */
  function desfasado(cx, dx, dy, alfa, pintar) {
    cx.save();
    cx.globalAlpha = alfa;
    cx.translate(dx, dy);
    pintar();
    cx.restore();
  }

  function trazo(cx, color, ancho) {
    cx.strokeStyle = color;
    cx.lineWidth = ancho;
    cx.lineJoin = 'round';
    cx.lineCap = 'round';
  }

  /* Una cabeza con su pelo. Casi todos los arcanos llevan al menos una. */
  function cabeza(cx, x, y, r, pelo) {
    cx.fillStyle = CARNE;
    cx.beginPath(); cx.arc(x, y, r, 0, 6.2832); cx.fill();
    trazo(cx, TINTA, r * .16); cx.stroke();
    if (pelo !== false) {
      cx.fillStyle = pelo || TINTA;
      cx.beginPath();
      cx.arc(x, y, r, Math.PI * 1.08, Math.PI * 1.92);
      cx.closePath(); cx.fill();
    }
    // Dos ojos y nada más: a este tamaño una cara detallada se vuelve una mancha.
    cx.fillStyle = TINTA;
    cx.beginPath(); cx.arc(x - r * .34, y + r * .06, r * .11, 0, 6.2832); cx.fill();
    cx.beginPath(); cx.arc(x + r * .34, y + r * .06, r * .11, 0, 6.2832); cx.fill();
  }

  /* Un cuerpo con túnica: dos colores, como se imprimían. */
  function tunica(cx, x, y, an, al, c1, c2) {
    cx.fillStyle = c1;
    cx.beginPath();
    cx.moveTo(x - an * .38, y);
    cx.lineTo(x + an * .38, y);
    cx.lineTo(x + an * .62, y + al);
    cx.lineTo(x - an * .62, y + al);
    cx.closePath(); cx.fill();
    if (c2) {
      cx.fillStyle = c2;
      cx.beginPath();
      cx.moveTo(x, y);
      cx.lineTo(x + an * .38, y);
      cx.lineTo(x + an * .62, y + al);
      cx.lineTo(x, y + al);
      cx.closePath(); cx.fill();
    }
    trazo(cx, TINTA, an * .05);
    cx.beginPath();
    cx.moveTo(x - an * .38, y);
    cx.lineTo(x + an * .38, y);
    cx.lineTo(x + an * .62, y + al);
    cx.lineTo(x - an * .62, y + al);
    cx.closePath(); cx.stroke();
  }

  function estrellaFig(cx, x, y, r, puntas, color) {
    cx.fillStyle = color || ORO;
    cx.beginPath();
    for (var i = 0; i < puntas * 2; i++) {
      var a = (i / (puntas * 2)) * 6.2832 - Math.PI / 2;
      var rr = (i % 2 === 0) ? r : r * .42;
      var px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
      if (i === 0) cx.moveTo(px, py); else cx.lineTo(px, py);
    }
    cx.closePath(); cx.fill();
    trazo(cx, TINTA, r * .12); cx.stroke();
  }

  /* ---------- los arcanos ----------
     Cada uno recibe el rectángulo útil de la ilustración: centro y radio. */

  var ARCANOS = {

    loco: function (cx, cxx, cyy, R) {
      // Camina hacia la derecha, con el hatillo al hombro y el perro atras.
      var px = cxx - R * .02;

      // El perro primero: va detras de las piernas.
      cx.save();
      cx.translate(cxx - R * .60, cyy + R * .52);
      cx.fillStyle = CREMA2;
      // Cuerpo.
      cx.beginPath();
      cx.moveTo(-R * .20, R * .16);
      cx.quadraticCurveTo(-R * .22, -R * .12, R * .02, -R * .13);
      cx.quadraticCurveTo(R * .19, -R * .14, R * .21, R * .16);
      cx.closePath(); cx.fill();
      trazo(cx, TINTA, R * .045); cx.stroke();
      // Cuello y cabeza, mirando para arriba al Loco.
      cx.beginPath();
      cx.moveTo(R * .10, -R * .08);
      cx.lineTo(R * .20, -R * .32);
      cx.lineTo(R * .33, -R * .27);
      cx.lineTo(R * .21, -R * .02);
      cx.closePath(); cx.fill();
      cx.stroke();
      // Oreja y hocico.
      cx.beginPath();
      cx.moveTo(R * .21, -R * .30);
      cx.lineTo(R * .17, -R * .42);
      cx.lineTo(R * .29, -R * .34);
      cx.closePath(); cx.fill();
      cx.stroke();
      cx.fillStyle = TINTA;
      cx.beginPath(); cx.arc(R * .27, -R * .25, R * .028, 0, 6.2832); cx.fill();
      // Patas y cola.
      trazo(cx, TINTA, R * .042);
      cx.beginPath();
      cx.moveTo(-R * .12, R * .16); cx.lineTo(-R * .14, R * .34);
      cx.moveTo(R * .11, R * .16); cx.lineTo(R * .13, R * .34);
      cx.moveTo(-R * .20, R * .10); cx.lineTo(-R * .36, -R * .06);
      cx.stroke();
      cx.restore();

      cabeza(cx, px, cyy - R * .58, R * .18);
      tunica(cx, px, cyy - R * .38, R * .60, R * .80, ORO, ROJO);
      // Piernas en paso largo.
      trazo(cx, TINTA, R * .10);
      cx.beginPath();
      cx.moveTo(px - R * .16, cyy + R * .42); cx.lineTo(px - R * .38, cyy + R * .80);
      cx.moveTo(px + R * .10, cyy + R * .42); cx.lineTo(px + R * .32, cyy + R * .78);
      cx.stroke();
      // El baston con el hatillo al hombro.
      trazo(cx, '#7a5a38', R * .055);
      cx.beginPath();
      cx.moveTo(px + R * .20, cyy - R * .26); cx.lineTo(px + R * .62, cyy - R * .84);
      cx.stroke();
      // El hatillo: una tela atada, no una bola.
      cx.fillStyle = ROJO;
      cx.beginPath();
      cx.moveTo(px + R * .56, cyy - R * .80);
      cx.quadraticCurveTo(px + R * .52, cyy - R * .60, px + R * .70, cyy - R * .58);
      cx.quadraticCurveTo(px + R * .88, cyy - R * .60, px + R * .82, cyy - R * .82);
      cx.quadraticCurveTo(px + R * .70, cyy - R * .90, px + R * .56, cyy - R * .80);
      cx.closePath(); cx.fill();
      trazo(cx, TINTA, R * .045); cx.stroke();
      // El nudo.
      trazo(cx, TINTA, R * .04);
      cx.beginPath();
      cx.moveTo(px + R * .62, cyy - R * .84); cx.lineTo(px + R * .74, cyy - R * .88);
      cx.stroke();
      // La mano que lo sostiene.
      trazo(cx, CARNE, R * .07);
      cx.beginPath();
      cx.moveTo(px + R * .18, cyy - R * .30); cx.lineTo(px + R * .30, cyy - R * .42);
      cx.stroke();
    },

    sacerdotisa: function (cx, cxx, cyy, R) {
      // Sentada entre dos columnas, con el libro.
      cx.fillStyle = CREMA2;
      cx.fillRect(cxx - R * .92, cyy - R * .78, R * .20, R * 1.56);
      cx.fillRect(cxx + R * .72, cyy - R * .78, R * .20, R * 1.56);
      trazo(cx, TINTA, R * .05);
      cx.strokeRect(cxx - R * .92, cyy - R * .78, R * .20, R * 1.56);
      cx.strokeRect(cxx + R * .72, cyy - R * .78, R * .20, R * 1.56);
      tunica(cx, cxx, cyy - R * .28, R * .66, R * .96, AZUL, '#26497a');
      cabeza(cx, cxx, cyy - R * .50, R * .19);
      // Tiara de tres cuerpos.
      cx.fillStyle = ORO;
      cx.beginPath();
      cx.moveTo(cxx - R * .22, cyy - R * .66);
      cx.lineTo(cxx + R * .22, cyy - R * .66);
      cx.lineTo(cxx + R * .14, cyy - R * .82);
      cx.lineTo(cxx, cyy - R * .70);
      cx.lineTo(cxx - R * .14, cyy - R * .82);
      cx.closePath(); cx.fill();
      trazo(cx, TINTA, R * .05); cx.stroke();
      // El libro abierto sobre la falda.
      cx.fillStyle = CREMA;
      cx.fillRect(cxx - R * .26, cyy + R * .16, R * .52, R * .30);
      trazo(cx, TINTA, R * .05);
      cx.strokeRect(cxx - R * .26, cyy + R * .16, R * .52, R * .30);
      cx.beginPath();
      cx.moveTo(cxx, cyy + R * .16); cx.lineTo(cxx, cyy + R * .46);
      cx.stroke();
    },

    emperatriz: function (cx, cxx, cyy, R) {
      tunica(cx, cxx, cyy - R * .24, R * .70, R * .98, ROJO, '#8e2b24');
      cabeza(cx, cxx, cyy - R * .48, R * .19);
      // Corona.
      cx.fillStyle = ORO;
      cx.beginPath();
      cx.moveTo(cxx - R * .24, cyy - R * .64);
      cx.lineTo(cxx + R * .24, cyy - R * .64);
      cx.lineTo(cxx + R * .18, cyy - R * .86);
      cx.lineTo(cxx + R * .06, cyy - R * .72);
      cx.lineTo(cxx - R * .06, cyy - R * .86);
      cx.lineTo(cxx - R * .18, cyy - R * .72);
      cx.closePath(); cx.fill();
      trazo(cx, TINTA, R * .05); cx.stroke();
      // Cetro y escudo.
      trazo(cx, TINTA, R * .07);
      cx.beginPath();
      cx.moveTo(cxx + R * .48, cyy + R * .34); cx.lineTo(cxx + R * .48, cyy - R * .52);
      cx.stroke();
      estrellaFig(cx, cxx + R * .48, cyy - R * .62, R * .14, 4);
      cx.fillStyle = ORO;
      cx.beginPath();
      cx.moveTo(cxx - R * .50, cyy + R * .06);
      cx.lineTo(cxx - R * .22, cyy + R * .06);
      cx.lineTo(cxx - R * .36, cyy + R * .44);
      cx.closePath(); cx.fill();
      trazo(cx, TINTA, R * .05); cx.stroke();
    },

    enamorados: function (cx, cxx, cyy, R) {
      // Dos figuras y arriba la que decide.
      tunica(cx, cxx - R * .38, cyy - R * .10, R * .44, R * .74, AZUL);
      cabeza(cx, cxx - R * .38, cyy - R * .30, R * .16);
      tunica(cx, cxx + R * .38, cyy - R * .10, R * .44, R * .74, ROJO);
      cabeza(cx, cxx + R * .38, cyy - R * .30, R * .16, '#7a4a2a');
      // Las manos que se tocan.
      trazo(cx, CARNE, R * .09);
      cx.beginPath();
      cx.moveTo(cxx - R * .22, cyy + R * .10); cx.lineTo(cxx + R * .22, cyy + R * .10);
      cx.stroke();
      // Arriba, el sol con la flecha.
      cx.fillStyle = ORO;
      cx.beginPath(); cx.arc(cxx, cyy - R * .74, R * .17, 0, 6.2832); cx.fill();
      trazo(cx, TINTA, R * .05); cx.stroke();
      trazo(cx, ORO, R * .045);
      for (var i = 0; i < 8; i++) {
        var a = i / 8 * 6.2832;
        cx.beginPath();
        cx.moveTo(cxx + Math.cos(a) * R * .22, cyy - R * .74 + Math.sin(a) * R * .22);
        cx.lineTo(cxx + Math.cos(a) * R * .32, cyy - R * .74 + Math.sin(a) * R * .32);
        cx.stroke();
      }
    },

    ermitano: function (cx, cxx, cyy, R) {
      // Encapuchado, con el farol tapado a medias y el bastón.
      cx.fillStyle = AZUL;
      cx.beginPath();
      cx.moveTo(cxx - R * .12, cyy - R * .74);
      cx.quadraticCurveTo(cxx + R * .34, cyy - R * .72, cxx + R * .40, cyy - R * .30);
      cx.lineTo(cxx + R * .56, cyy + R * .80);
      cx.lineTo(cxx - R * .52, cyy + R * .80);
      cx.quadraticCurveTo(cxx - R * .46, cyy - R * .40, cxx - R * .12, cyy - R * .74);
      cx.closePath(); cx.fill();
      trazo(cx, TINTA, R * .055); cx.stroke();
      // Lo poco de cara que deja ver la capucha.
      cx.fillStyle = CARNE;
      cx.beginPath();
      cx.ellipse(cxx + R * .04, cyy - R * .40, R * .13, R * .17, .1, 0, 6.2832);
      cx.fill();
      trazo(cx, TINTA, R * .05); cx.stroke();
      // Barba.
      cx.fillStyle = CREMA;
      cx.beginPath();
      cx.moveTo(cxx - R * .08, cyy - R * .30);
      cx.quadraticCurveTo(cxx + R * .06, cyy + R * .06, cxx + R * .16, cyy - R * .28);
      cx.closePath(); cx.fill();
      trazo(cx, TINTA, R * .04); cx.stroke();
      // Bastón.
      trazo(cx, TINTA, R * .07);
      cx.beginPath();
      cx.moveTo(cxx - R * .66, cyy - R * .60); cx.lineTo(cxx - R * .58, cyy + R * .82);
      cx.stroke();
      // El farol.
      cx.fillStyle = ORO;
      cx.beginPath();
      cx.arc(cxx + R * .60, cyy - R * .46, R * .20, 0, 6.2832);
      cx.fill();
      trazo(cx, TINTA, R * .055); cx.stroke();
      estrellaFig(cx, cxx + R * .60, cyy - R * .46, R * .11, 6, CREMA);
    },

    rueda: function (cx, cxx, cyy, R) {
      cx.fillStyle = CREMA2;
      cx.beginPath(); cx.arc(cxx, cyy, R * .68, 0, 6.2832); cx.fill();
      trazo(cx, TINTA, R * .07); cx.stroke();
      cx.beginPath(); cx.arc(cxx, cyy, R * .44, 0, 6.2832); cx.stroke();
      cx.fillStyle = ORO;
      cx.beginPath(); cx.arc(cxx, cyy, R * .13, 0, 6.2832); cx.fill();
      trazo(cx, TINTA, R * .05); cx.stroke();
      // Ocho radios.
      trazo(cx, TINTA, R * .05);
      for (var i = 0; i < 8; i++) {
        var a = i / 8 * 6.2832 + .19;
        cx.beginPath();
        cx.moveTo(cxx + Math.cos(a) * R * .13, cyy + Math.sin(a) * R * .13);
        cx.lineTo(cxx + Math.cos(a) * R * .68, cyy + Math.sin(a) * R * .68);
        cx.stroke();
      }
      /* El que sube y el que baja. Con la cabeza para arriba o para abajo se
         entiende cual es cual; dos circulos de colores no decian nada. */
      [[.80, -.34, ROJO, -1], [-.80, .34, AZUL, 1]].forEach(function (v) {
        var vx = cxx + R * v[0], vy = cyy + R * v[1], lado = v[3];
        cx.save();
        cx.translate(vx, vy);
        cx.scale(1, lado);
        cx.fillStyle = v[2];
        cx.beginPath();
        cx.moveTo(-R * .10, R * .20);
        cx.lineTo(R * .10, R * .20);
        cx.lineTo(R * .07, -R * .06);
        cx.lineTo(-R * .07, -R * .06);
        cx.closePath(); cx.fill();
        trazo(cx, TINTA, R * .04); cx.stroke();
        cx.fillStyle = CARNE;
        cx.beginPath(); cx.arc(0, -R * .15, R * .095, 0, 6.2832); cx.fill();
        cx.stroke();
        cx.restore();
      });
      // La manivela, que es lo que la hace girar.
      trazo(cx, TINTA, R * .06);
      cx.beginPath();
      cx.moveTo(cxx, cyy - R * .84); cx.lineTo(cxx, cyy - R * .68);
      cx.stroke();
    },

    colgado: function (cx, cxx, cyy, R) {
      // La horca en T y la figura cabeza abajo, con una pierna cruzada.
      trazo(cx, '#7a5a38', R * .09);
      cx.beginPath();
      cx.moveTo(cxx - R * .76, cyy - R * .78); cx.lineTo(cxx + R * .76, cyy - R * .78);
      cx.moveTo(cxx - R * .70, cyy - R * .86); cx.lineTo(cxx - R * .70, cyy + R * .86);
      cx.moveTo(cxx + R * .70, cyy - R * .86); cx.lineTo(cxx + R * .70, cyy + R * .86);
      cx.stroke();
      // La soga.
      trazo(cx, TINTA, R * .05);
      cx.beginPath();
      cx.moveTo(cxx, cyy - R * .78); cx.lineTo(cxx, cyy - R * .52);
      cx.stroke();
      // Cuerpo invertido.
      cx.save();
      cx.translate(cxx, cyy + R * .10);
      cx.scale(1, -1);
      tunica(cx, 0, -R * .20, R * .52, R * .62, AZUL, '#26497a');
      cx.restore();
      cabeza(cx, cxx, cyy + R * .46, R * .18);
      // Piernas: una recta atada, la otra cruzada por detrás.
      trazo(cx, TINTA, R * .09);
      cx.beginPath();
      cx.moveTo(cxx - R * .10, cyy - R * .30); cx.lineTo(cxx, cyy - R * .52);
      cx.moveTo(cxx + R * .10, cyy - R * .30); cx.lineTo(cxx + R * .32, cyy - R * .16);
      cx.lineTo(cxx + R * .06, cyy - R * .04);
      cx.stroke();
    },

    muerte: function (cx, cxx, cyy, R) {
      /* En Marsella es el arcano sin nombre, y se dibuja segando un campo del
         que vuelven a salir manos: no es el final, es lo que deja sitio. */
      // Guadaña.
      trazo(cx, '#7a5a38', R * .07);
      cx.beginPath();
      cx.moveTo(cxx + R * .52, cyy + R * .76); cx.lineTo(cxx + R * .18, cyy - R * .78);
      cx.stroke();
      trazo(cx, '#9aa2ad', R * .09);
      cx.beginPath();
      cx.moveTo(cxx + R * .18, cyy - R * .78);
      cx.quadraticCurveTo(cxx - R * .52, cyy - R * .82, cxx - R * .72, cyy - R * .34);
      cx.stroke();
      /* El esqueleto, de pie sobre el campo segado. Los huesos van con
         contorno: en crema sobre fondo crema desaparecian. */
      var ex = cxx - R * .18;
      function hueso(x1, y1, x2, y2, gr) {
        trazo(cx, TINTA, gr * 1.7);
        cx.beginPath(); cx.moveTo(x1, y1); cx.lineTo(x2, y2); cx.stroke();
        trazo(cx, CREMA, gr);
        cx.beginPath(); cx.moveTo(x1, y1); cx.lineTo(x2, y2); cx.stroke();
      }
      // Piernas primero, que son lo que lo apoya.
      hueso(ex, cyy + R * .22, ex - R * .16, cyy + R * .60, R * .075);
      hueso(ex, cyy + R * .22, ex + R * .14, cyy + R * .60, R * .075);
      // Columna y costillar.
      hueso(ex, cyy - R * .22, ex, cyy + R * .24, R * .085);
      for (var i = 0; i < 3; i++) {
        var y = cyy - R * .12 + i * R * .13;
        hueso(ex - R * .15, y, ex + R * .15, y, R * .045);
      }
      // Brazos: uno sostiene el mango.
      hueso(ex, cyy - R * .16, ex + R * .30, cyy - R * .04, R * .055);
      hueso(ex, cyy - R * .16, ex - R * .24, cyy + R * .10, R * .055);
      // Craneo.
      cx.fillStyle = CREMA;
      cx.beginPath();
      cx.ellipse(ex, cyy - R * .40, R * .16, R * .19, 0, 0, 6.2832);
      cx.fill();
      trazo(cx, TINTA, R * .05); cx.stroke();
      cx.fillStyle = TINTA;
      cx.beginPath(); cx.arc(ex - R * .06, cyy - R * .42, R * .05, 0, 6.2832); cx.fill();
      cx.beginPath(); cx.arc(ex + R * .06, cyy - R * .42, R * .05, 0, 6.2832); cx.fill();
      trazo(cx, TINTA, R * .035);
      cx.beginPath();
      cx.moveTo(ex - R * .07, cyy - R * .27); cx.lineTo(ex + R * .07, cyy - R * .27);
      cx.stroke();
      // Del suelo segado vuelven a salir manos.
      cx.fillStyle = VERDE;
      cx.fillRect(cxx - R * .92, cyy + R * .58, R * 1.84, R * .26);
      trazo(cx, CARNE, R * .07);
      cx.beginPath();
      cx.moveTo(cxx - R * .60, cyy + R * .58); cx.lineTo(cxx - R * .64, cyy + R * .32);
      cx.moveTo(cxx + R * .46, cyy + R * .58); cx.lineTo(cxx + R * .52, cyy + R * .36);
      cx.stroke();
    },

    templanza: function (cx, cxx, cyy, R) {
      // Figura alada pasando el agua de una jarra a la otra.
      tunica(cx, cxx, cyy - R * .18, R * .62, R * .92, CREMA, CREMA2);
      cabeza(cx, cxx, cyy - R * .42, R * .18);
      // Alas.
      cx.fillStyle = ROJO;
      cx.beginPath();
      cx.moveTo(cxx - R * .30, cyy - R * .24);
      cx.quadraticCurveTo(cxx - R * .86, cyy - R * .52, cxx - R * .78, cyy + R * .10);
      cx.quadraticCurveTo(cxx - R * .52, cyy - R * .06, cxx - R * .30, cyy - R * .04);
      cx.closePath(); cx.fill();
      trazo(cx, TINTA, R * .05); cx.stroke();
      cx.fillStyle = AZUL;
      cx.beginPath();
      cx.moveTo(cxx + R * .30, cyy - R * .24);
      cx.quadraticCurveTo(cxx + R * .86, cyy - R * .52, cxx + R * .78, cyy + R * .10);
      cx.quadraticCurveTo(cxx + R * .52, cyy - R * .06, cxx + R * .30, cyy - R * .04);
      cx.closePath(); cx.fill();
      cx.stroke();
      // Las dos jarras y el hilo de agua que las une.
      cx.fillStyle = ORO;
      cx.beginPath();
      cx.ellipse(cxx - R * .34, cyy + R * .06, R * .13, R * .17, .35, 0, 6.2832);
      cx.fill();
      trazo(cx, TINTA, R * .05); cx.stroke();
      cx.beginPath();
      cx.ellipse(cxx + R * .34, cyy + R * .34, R * .13, R * .17, -.25, 0, 6.2832);
      cx.fill();
      cx.stroke();
      trazo(cx, AZUL, R * .05);
      cx.beginPath();
      cx.moveTo(cxx - R * .26, cyy + R * .14);
      cx.quadraticCurveTo(cxx, cyy + R * .34, cxx + R * .26, cyy + R * .28);
      cx.stroke();
    },

    torre: function (cx, cxx, cyy, R) {
      // La torre y el rayo que le vuela la corona.
      cx.fillStyle = CREMA2;
      cx.beginPath();
      cx.moveTo(cxx - R * .34, cyy + R * .84);
      cx.lineTo(cxx - R * .28, cyy - R * .40);
      cx.lineTo(cxx + R * .28, cyy - R * .40);
      cx.lineTo(cxx + R * .34, cyy + R * .84);
      cx.closePath(); cx.fill();
      trazo(cx, TINTA, R * .055); cx.stroke();
      // Hiladas de ladrillo.
      trazo(cx, TINTA, R * .035);
      for (var i = 1; i < 5; i++) {
        var y = cyy - R * .40 + i * R * .25;
        cx.beginPath();
        cx.moveTo(cxx - R * .30 - i * R * .012, y);
        cx.lineTo(cxx + R * .30 + i * R * .012, y);
        cx.stroke();
      }
      // Ventanas.
      cx.fillStyle = AZUL;
      cx.fillRect(cxx - R * .09, cyy - R * .18, R * .18, R * .22);
      cx.fillRect(cxx - R * .09, cyy + R * .28, R * .18, R * .22);
      // La corona que sale volando.
      cx.fillStyle = ORO;
      cx.save();
      cx.translate(cxx + R * .06, cyy - R * .62);
      cx.rotate(.28);
      cx.beginPath();
      cx.moveTo(-R * .34, 0); cx.lineTo(R * .34, 0);
      cx.lineTo(R * .26, -R * .20); cx.lineTo(R * .10, -R * .06);
      cx.lineTo(-R * .10, -R * .20); cx.lineTo(-R * .26, -R * .06);
      cx.closePath(); cx.fill();
      trazo(cx, TINTA, R * .05); cx.stroke();
      cx.restore();
      // El rayo.
      cx.fillStyle = ORO;
      cx.beginPath();
      cx.moveTo(cxx - R * .78, cyy - R * .92);
      cx.lineTo(cxx - R * .30, cyy - R * .66);
      cx.lineTo(cxx - R * .46, cyy - R * .58);
      cx.lineTo(cxx - R * .16, cyy - R * .40);
      cx.lineTo(cxx - R * .62, cyy - R * .56);
      cx.lineTo(cxx - R * .46, cyy - R * .64);
      cx.closePath(); cx.fill();
      trazo(cx, TINTA, R * .045); cx.stroke();
    },

    estrella: function (cx, cxx, cyy, R) {
      // La grande arriba y las chicas alrededor.
      estrellaFig(cx, cxx, cyy - R * .66, R * .28, 8, ORO);
      estrellaFig(cx, cxx - R * .58, cyy - R * .50, R * .12, 8, AZUL);
      estrellaFig(cx, cxx + R * .58, cyy - R * .50, R * .12, 8, ROJO);
      estrellaFig(cx, cxx - R * .80, cyy - R * .12, R * .09, 8, ORO);
      estrellaFig(cx, cxx + R * .80, cyy - R * .12, R * .09, 8, AZUL);

      // El agua, primero: la figura se apoya en la orilla.
      cx.fillStyle = AZUL;
      cx.globalAlpha = .45;
      cx.fillRect(cxx - R * .92, cyy + R * .62, R * 1.84, R * .24);
      cx.globalAlpha = 1;
      trazo(cx, TINTA, R * .04);
      cx.beginPath();
      cx.moveTo(cxx - R * .92, cyy + R * .62); cx.lineTo(cxx + R * .92, cyy + R * .62);
      cx.stroke();

      // Arrodillada de perfil, vertiendo. El cuerpo es un solo trazo grueso:
      // a este tamano una anatomia detallada se convierte en un borron.
      cabeza(cx, cxx + R * .10, cyy - R * .16, R * .14, '#7a4a2a');
      trazo(cx, CARNE, R * .17);
      cx.beginPath();
      cx.moveTo(cxx + R * .10, cyy - R * .02);
      cx.lineTo(cxx + R * .04, cyy + R * .34);
      cx.stroke();
      // La pierna doblada, apoyada.
      trazo(cx, CARNE, R * .13);
      cx.beginPath();
      cx.moveTo(cxx + R * .04, cyy + R * .34);
      cx.lineTo(cxx + R * .34, cyy + R * .50);
      cx.lineTo(cxx + R * .06, cyy + R * .60);
      cx.stroke();
      // El brazo que sostiene la jarra.
      trazo(cx, CARNE, R * .09);
      cx.beginPath();
      cx.moveTo(cxx + R * .06, cyy + R * .04);
      cx.lineTo(cxx - R * .28, cyy + R * .16);
      cx.stroke();

      // La jarra y el hilo de agua que cae al rio.
      cx.fillStyle = ORO;
      cx.beginPath();
      cx.ellipse(cxx - R * .40, cyy + R * .18, R * .13, R * .16, .55, 0, 6.2832);
      cx.fill();
      trazo(cx, TINTA, R * .045); cx.stroke();
      trazo(cx, AZUL, R * .055);
      cx.beginPath();
      cx.moveTo(cxx - R * .44, cyy + R * .32);
      cx.quadraticCurveTo(cxx - R * .50, cyy + R * .50, cxx - R * .46, cyy + R * .64);
      cx.stroke();
    },

    luna: function (cx, cxx, cyy, R) {
      // Luna de perfil con cara, dos torres, dos perros y el cangrejo.
      cx.fillStyle = CREMA;
      cx.beginPath(); cx.arc(cxx, cyy - R * .52, R * .30, 0, 6.2832); cx.fill();
      trazo(cx, TINTA, R * .055); cx.stroke();
      // La cara de perfil dentro del disco.
      cx.fillStyle = TINTA;
      cx.beginPath(); cx.arc(cxx - R * .10, cyy - R * .58, R * .045, 0, 6.2832); cx.fill();
      trazo(cx, TINTA, R * .04);
      cx.beginPath();
      cx.arc(cxx - R * .06, cyy - R * .42, R * .10, -.3, .9);
      cx.stroke();
      // Gotas que caen.
      cx.fillStyle = ORO;
      [-.44, -.16, .16, .44].forEach(function (dx, i) {
        cx.beginPath();
        cx.arc(cxx + R * dx, cyy - R * (.14 - (i % 2) * .08), R * .05, 0, 6.2832);
        cx.fill();
      });
      // Las dos torres.
      [-.74, .74].forEach(function (dx) {
        cx.fillStyle = CREMA2;
        cx.beginPath();
        cx.moveTo(cxx + R * dx - R * .13, cyy + R * .52);
        cx.lineTo(cxx + R * dx - R * .11, cyy - R * .18);
        cx.lineTo(cxx + R * dx + R * .11, cyy - R * .18);
        cx.lineTo(cxx + R * dx + R * .13, cyy + R * .52);
        cx.closePath(); cx.fill();
        trazo(cx, TINTA, R * .05); cx.stroke();
        cx.fillStyle = AZUL;
        cx.fillRect(cxx + R * dx - R * .05, cyy + R * .02, R * .10, R * .14);
      });
      // Los dos que aúllan, de perfil y con el hocico levantado.
      [[-.36, 1], [.36, -1]].forEach(function (par) {
        var dx = par[0], lado = par[1];
        cx.save();
        cx.translate(cxx + R * dx, cyy + R * .40);
        cx.scale(lado, 1);
        cx.fillStyle = CREMA2;
        // Lomo y ancas.
        cx.beginPath();
        cx.moveTo(-R * .16, R * .18);
        cx.quadraticCurveTo(-R * .18, -R * .06, R * .02, -R * .08);
        cx.quadraticCurveTo(R * .16, -R * .10, R * .17, R * .18);
        cx.closePath(); cx.fill();
        trazo(cx, TINTA, R * .045); cx.stroke();
        // Cuello y cabeza levantada.
        cx.fillStyle = CREMA2;
        cx.beginPath();
        cx.moveTo(R * .06, -R * .06);
        cx.lineTo(R * .16, -R * .30);
        cx.lineTo(R * .28, -R * .26);
        cx.lineTo(R * .16, -R * .02);
        cx.closePath(); cx.fill();
        cx.stroke();
        // Oreja y patas.
        cx.beginPath();
        cx.moveTo(R * .17, -R * .28);
        cx.lineTo(R * .13, -R * .40);
        cx.lineTo(R * .24, -R * .32);
        cx.closePath(); cx.fill();
        cx.stroke();
        trazo(cx, TINTA, R * .045);
        cx.beginPath();
        cx.moveTo(-R * .10, R * .18); cx.lineTo(-R * .11, R * .34);
        cx.moveTo(R * .10, R * .18); cx.lineTo(R * .11, R * .34);
        cx.stroke();
        cx.restore();
      });
      // El agua y el cangrejo.
      cx.fillStyle = AZUL;
      cx.globalAlpha = .55;
      cx.fillRect(cxx - R * .92, cyy + R * .58, R * 1.84, R * .28);
      cx.globalAlpha = 1;
      cx.fillStyle = ROJO;
      cx.beginPath();
      cx.ellipse(cxx, cyy + R * .72, R * .16, R * .11, 0, 0, 6.2832);
      cx.fill();
      trazo(cx, TINTA, R * .04); cx.stroke();
    },

    sol: function (cx, cxx, cyy, R) {
      // El sol con cara, y los dos abajo contra el muro.
      cx.fillStyle = ORO;
      cx.beginPath(); cx.arc(cxx, cyy - R * .44, R * .30, 0, 6.2832); cx.fill();
      trazo(cx, TINTA, R * .055); cx.stroke();
      cx.fillStyle = TINTA;
      cx.beginPath(); cx.arc(cxx - R * .11, cyy - R * .50, R * .04, 0, 6.2832); cx.fill();
      cx.beginPath(); cx.arc(cxx + R * .11, cyy - R * .50, R * .04, 0, 6.2832); cx.fill();
      trazo(cx, TINTA, R * .04);
      cx.beginPath(); cx.arc(cxx, cyy - R * .40, R * .12, .3, Math.PI - .3); cx.stroke();
      // Rayos: rectos y ondulados, alternados.
      trazo(cx, ORO, R * .05);
      for (var i = 0; i < 16; i++) {
        var a = i / 16 * 6.2832;
        var l = (i % 2 === 0) ? .50 : .42;
        cx.beginPath();
        cx.moveTo(cxx + Math.cos(a) * R * .33, cyy - R * .44 + Math.sin(a) * R * .33);
        cx.lineTo(cxx + Math.cos(a) * R * l, cyy - R * .44 + Math.sin(a) * R * l);
        cx.stroke();
      }
      // El muro.
      cx.fillStyle = CREMA2;
      cx.fillRect(cxx - R * .92, cyy + R * .34, R * 1.84, R * .22);
      trazo(cx, TINTA, R * .045);
      cx.strokeRect(cxx - R * .92, cyy + R * .34, R * 1.84, R * .22);
      // Los dos chicos.
      [-.30, .30].forEach(function (dx, i) {
        cabeza(cx, cxx + R * dx, cyy + R * .10, R * .13, i ? '#7a4a2a' : TINTA);
        cx.fillStyle = CARNE;
        cx.beginPath();
        cx.moveTo(cxx + R * dx - R * .13, cyy + R * .22);
        cx.lineTo(cxx + R * dx + R * .13, cyy + R * .22);
        cx.lineTo(cxx + R * dx + R * .10, cyy + R * .36);
        cx.lineTo(cxx + R * dx - R * .10, cyy + R * .36);
        cx.closePath(); cx.fill();
        trazo(cx, TINTA, R * .045); cx.stroke();
      });
    },

    /* Los cuatro arcanos del final. Ninguno esta en el mazo: se da vuelta uno
       solo, al terminar, y cual toca depende de cuanto llego a ver.

       Es la misma figura en cuatro grados. De dormida a despierta, con las
       estrellas pasando de apagadas a estar en su mano: la progresion se lee
       sin necesidad de comparar dos cartas. */

    /* Cero pruebas: paso de largo. */
    durmiente: function (cx, cxx, cyy, R) {
      /* La luna, sola y grande. En crema sobre fondo crema quedaba un aro
         vacio: lleva su propio gris para que se lea como cuerpo. */
      var gl = cx.createRadialGradient(cxx + R * .42, cyy - R * .68, R * .04,
                                       cxx + R * .48, cyy - R * .62, R * .22);
      gl.addColorStop(0, '#fbf7ec');
      gl.addColorStop(.7, '#ddd3bd');
      gl.addColorStop(1, '#b8ad95');
      cx.fillStyle = gl;
      cx.beginPath(); cx.arc(cxx + R * .48, cyy - R * .62, R * .22, 0, 6.2832); cx.fill();
      trazo(cx, TINTA, R * .05); cx.stroke();
      // Un par de mares, para que no sea un disco liso.
      cx.fillStyle = 'rgba(150,142,124,.30)';
      cx.beginPath(); cx.arc(cxx + R * .42, cyy - R * .68, R * .055, 0, 6.2832); cx.fill();
      cx.beginPath(); cx.arc(cxx + R * .56, cyy - R * .56, R * .04, 0, 6.2832); cx.fill();
      // Estrellas apagadas: contorno sin relleno.
      [[-.62,-.58,.09],[-.28,-.76,.07],[.05,-.60,.065]].forEach(function (e) {
        cx.fillStyle = 'rgba(217,165,60,.16)';
        cx.beginPath();
        for (var i = 0; i < 16; i++) {
          var a = i / 16 * 6.2832 - Math.PI / 2;
          var rr = (i % 2 === 0) ? R * e[2] : R * e[2] * .42;
          var px = cxx + R * e[0] + Math.cos(a) * rr;
          var py = cyy + R * e[1] + Math.sin(a) * rr;
          if (i === 0) cx.moveTo(px, py); else cx.lineTo(px, py);
        }
        cx.closePath(); cx.fill();
        trazo(cx, 'rgba(43,36,29,.4)', R * .022); cx.stroke();
      });
      // Ella, acostada de perfil.
      cx.fillStyle = AZUL;
      cx.beginPath();
      cx.moveTo(cxx - R * .74, cyy + R * .46);
      cx.quadraticCurveTo(cxx - R * .30, cyy + R * .12, cxx + R * .18, cyy + R * .22);
      cx.quadraticCurveTo(cxx + R * .62, cyy + R * .30, cxx + R * .70, cyy + R * .48);
      cx.lineTo(cxx - R * .74, cyy + R * .48);
      cx.closePath(); cx.fill();
      trazo(cx, TINTA, R * .05); cx.stroke();
      cabeza(cx, cxx - R * .52, cyy + R * .20, R * .16, '#3a2418');
      // Los ojos cerrados: dos rayas en vez de dos puntos.
      cx.fillStyle = CREMA;
      cx.beginPath();
      cx.arc(cxx - R * .52, cyy + R * .20, R * .155, -.2, Math.PI + .2);
      cx.fill();
      // Los parpados: dos arcos hacia abajo, que es como se lee un ojo cerrado.
      trazo(cx, TINTA, R * .03);
      cx.beginPath();
      cx.arc(cxx - R * .575, cyy + R * .20, R * .045, .25, Math.PI - .25);
      cx.stroke();
      cx.beginPath();
      cx.arc(cxx - R * .445, cyy + R * .20, R * .045, .25, Math.PI - .25);
      cx.stroke();
    },

    /* Una o dos: algo vio. */
    despierta: function (cx, cxx, cyy, R) {
      // Una sola estrella encendida, arriba.
      estrellaFig(cx, cxx, cyy - R * .70, R * .19, 8, ORO);
      [[-.66,-.50,.09],[.66,-.50,.09]].forEach(function (e) {
        cx.fillStyle = 'rgba(217,165,60,.20)';
        cx.beginPath(); cx.arc(cxx + R * e[0], cyy + R * e[1], R * e[2] * .5, 0, 6.2832);
        cx.fill();
      });
      tunica(cx, cxx, cyy - R * .08, R * .58, R * .86, AZUL, '#26497a');
      cabeza(cx, cxx, cyy - R * .32, R * .17, '#3a2418');
      // Las manos vacias, abiertas.
      trazo(cx, CARNE, R * .07);
      cx.beginPath();
      cx.moveTo(cxx - R * .22, cyy + R * .10); cx.lineTo(cxx - R * .34, cyy + R * .30);
      cx.moveTo(cxx + R * .22, cyy + R * .10); cx.lineTo(cxx + R * .34, cyy + R * .30);
      cx.stroke();
      cx.fillStyle = CARNE;
      cx.beginPath(); cx.arc(cxx - R * .36, cyy + R * .34, R * .055, 0, 6.2832); cx.fill();
      trazo(cx, TINTA, R * .03); cx.stroke();
      cx.beginPath(); cx.arc(cxx + R * .36, cyy + R * .34, R * .055, 0, 6.2832); cx.fill();
      cx.stroke();
    },

    /* Tres a cinco: ato unos cabos. */
    testigo: function (cx, cxx, cyy, R) {
      cx.fillStyle = '#2f5a90';
      cx.globalAlpha = .13;
      cx.beginPath();
      cx.ellipse(cxx, cyy - R * .16, R * .86, R * .74, 0, 0, 6.2832);
      cx.fill();
      cx.globalAlpha = 1;
      estrellaFig(cx, cxx, cyy - R * .70, R * .22, 8, ORO);
      [[-.60,-.52,.10],[.60,-.52,.10],[-.76,-.06,.075]].forEach(function (e) {
        estrellaFig(cx, cxx + R * e[0], cyy + R * e[1], R * e[2], 8, ORO);
      });
      [[.76,-.06,.075]].forEach(function (e) {
        cx.fillStyle = 'rgba(217,165,60,.22)';
        cx.beginPath(); cx.arc(cxx + R * e[0], cyy + R * e[1], R * e[2] * .6, 0, 6.2832);
        cx.fill();
      });
      tunica(cx, cxx, cyy - R * .08, R * .60, R * .88, AZUL, '#26497a');
      cabeza(cx, cxx, cyy - R * .32, R * .17, '#3a2418');
      // Una estrella ya en la mano.
      trazo(cx, CARNE, R * .07);
      cx.beginPath();
      cx.moveTo(cxx - R * .24, cyy + R * .08); cx.lineTo(cxx - R * .12, cyy + R * .30);
      cx.moveTo(cxx + R * .24, cyy + R * .08); cx.lineTo(cxx + R * .12, cyy + R * .30);
      cx.stroke();
      estrellaFig(cx, cxx, cyy + R * .34, R * .10, 8, ORO);
    },

    /* Seis o mas: entendio. */
    astrologa: function (cx, cxx, cyy, R) {
      // El cielo de fondo, con sus estrellas.
      cx.fillStyle = '#2f5a90';
      cx.globalAlpha = .18;
      cx.beginPath();
      cx.ellipse(cxx, cyy - R * .18, R * .92, R * .80, 0, 0, 6.2832);
      cx.fill();
      cx.globalAlpha = 1;
      [[-.66,-.62,.10],[.62,-.56,.09],[-.30,-.82,.07],[.34,-.84,.075],
       [.80,-.16,.065],[-.82,-.14,.06]].forEach(function (e) {
        estrellaFig(cx, cxx + R * e[0], cyy + R * e[1], R * e[2], 8, ORO);
      });

      // Ella, de frente, con la vista arriba.
      tunica(cx, cxx, cyy - R * .10, R * .60, R * .88, AZUL, '#26497a');
      cabeza(cx, cxx, cyy - R * .34, R * .18, '#3a2418');
      // El pelo largo, que es lo primero que se le ve.
      cx.fillStyle = '#3a2418';
      cx.beginPath();
      cx.moveTo(cxx - R * .19, cyy - R * .40);
      cx.quadraticCurveTo(cxx - R * .30, cyy - R * .02, cxx - R * .24, cyy + R * .26);
      cx.lineTo(cxx - R * .13, cyy + R * .24);
      cx.quadraticCurveTo(cxx - R * .17, cyy - R * .06, cxx - R * .12, cyy - R * .34);
      cx.closePath(); cx.fill();
      cx.beginPath();
      cx.moveTo(cxx + R * .19, cyy - R * .40);
      cx.quadraticCurveTo(cxx + R * .30, cyy - R * .02, cxx + R * .24, cyy + R * .26);
      cx.lineTo(cxx + R * .13, cyy + R * .24);
      cx.quadraticCurveTo(cxx + R * .17, cyy - R * .06, cxx + R * .12, cyy - R * .34);
      cx.closePath(); cx.fill();

      // Las manos, sosteniendo una carta abierta.
      cx.fillStyle = CREMA;
      cx.save();
      cx.translate(cxx, cyy + R * .34);
      cx.rotate(-.06);
      cx.fillRect(-R * .17, -R * .13, R * .34, R * .30);
      trazo(cx, TINTA, R * .05);
      cx.strokeRect(-R * .17, -R * .13, R * .34, R * .30);
      cx.restore();
      estrellaFig(cx, cxx, cyy + R * .34, R * .085, 8, ORO);
      trazo(cx, CARNE, R * .075);
      cx.beginPath();
      cx.moveTo(cxx - R * .30, cyy + R * .30); cx.lineTo(cxx - R * .17, cyy + R * .36);
      cx.moveTo(cxx + R * .30, cyy + R * .30); cx.lineTo(cxx + R * .17, cyy + R * .36);
      cx.stroke();

      // La estrella grande sobre la cabeza: la suya.
      estrellaFig(cx, cxx, cyy - R * .74, R * .21, 8, ORO);
    },

    mundo: function (cx, cxx, cyy, R) {
      /* La guirnalda ovalada, la figura adentro y los cuatro vivientes. La
         guirnalda es una hilera de hojas, no un ovalo: es lo que la hace leer
         como corona vegetal. */
      var A = R * .48, B = R * .70;
      cx.save();
      for (var h = 0; h < 26; h++) {
        var ang = h / 26 * 6.2832;
        var hx = cxx + Math.cos(ang) * A, hy = cyy + Math.sin(ang) * B;
        cx.save();
        cx.translate(hx, hy);
        cx.rotate(ang + Math.PI / 2);
        cx.fillStyle = (h % 2) ? VERDE : '#4a6b3c';
        cx.beginPath();
        cx.ellipse(0, 0, R * .085, R * .036, 0, 0, 6.2832);
        cx.fill();
        trazo(cx, TINTA, R * .018); cx.stroke();
        cx.restore();
      }
      cx.restore();
      // Las cuatro ataduras de la corona.
      [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach(function (ang) {
        cx.fillStyle = ROJO;
        cx.beginPath();
        cx.arc(cxx + Math.cos(ang) * A, cyy + Math.sin(ang) * B, R * .045, 0, 6.2832);
        cx.fill();
        trazo(cx, TINTA, R * .025); cx.stroke();
      });

      // La figura del centro, con la banda cruzada.
      cabeza(cx, cxx, cyy - R * .30, R * .14, '#7a4a2a');
      cx.fillStyle = CARNE;
      cx.beginPath();
      cx.moveTo(cxx - R * .11, cyy - R * .17);
      cx.lineTo(cxx + R * .11, cyy - R * .17);
      cx.lineTo(cxx + R * .15, cyy + R * .32);
      cx.lineTo(cxx - R * .15, cyy + R * .32);
      cx.closePath(); cx.fill();
      trazo(cx, TINTA, R * .045); cx.stroke();
      cx.fillStyle = ROJO;
      cx.beginPath();
      cx.moveTo(cxx - R * .12, cyy - R * .12);
      cx.lineTo(cxx + R * .13, cyy + R * .14);
      cx.lineTo(cxx + R * .06, cyy + R * .20);
      cx.lineTo(cxx - R * .14, cyy - R * .04);
      cx.closePath(); cx.fill();
      // Una pierna cruzada y los brazos abiertos con las varas.
      trazo(cx, CARNE, R * .065);
      cx.beginPath();
      cx.moveTo(cxx - R * .07, cyy + R * .32); cx.lineTo(cxx - R * .09, cyy + R * .54);
      cx.moveTo(cxx + R * .07, cyy + R * .32); cx.lineTo(cxx + R * .21, cyy + R * .46);
      cx.moveTo(cxx - R * .10, cyy - R * .10); cx.lineTo(cxx - R * .27, cyy - R * .24);
      cx.moveTo(cxx + R * .10, cyy - R * .10); cx.lineTo(cxx + R * .27, cyy - R * .24);
      cx.stroke();

      /* Los cuatro vivientes: cada uno con su silueta, no cuatro circulos de
         colores distintos. */
      var vivos = [
        [-.82, -.80, ORO,    'alas'],
        [ .82, -.80, CREMA2, 'aguila'],
        [-.82,  .80, ROJO,   'leon'],
        [ .82,  .80, AZUL,   'toro']
      ];
      vivos.forEach(function (v) {
        var vx = cxx + R * v[0], vy = cyy + R * v[1], r = R * .155;
        cx.fillStyle = v[2];
        cx.beginPath(); cx.arc(vx, vy, r, 0, 6.2832); cx.fill();
        trazo(cx, TINTA, R * .04); cx.stroke();
        cx.fillStyle = TINTA;
        if (v[3] === 'aguila' || v[3] === 'alas') {
          // Pico o alas: dos triangulos.
          cx.beginPath();
          cx.moveTo(vx - r * .5, vy); cx.lineTo(vx, vy - r * .45);
          cx.lineTo(vx + r * .5, vy); cx.lineTo(vx, vy + r * .2);
          cx.closePath(); cx.fill();
        } else {
          // Cuernos o melena: dos puntas arriba.
          cx.beginPath();
          cx.moveTo(vx - r * .55, vy + r * .1); cx.lineTo(vx - r * .3, vy - r * .55);
          cx.lineTo(vx - r * .05, vy + r * .1);
          cx.moveTo(vx + r * .05, vy + r * .1); cx.lineTo(vx + r * .3, vy - r * .55);
          cx.lineTo(vx + r * .55, vy + r * .1);
          cx.fill();
        }
      });
    }
  };

  /* El dorso: el mismo papel, con una trama y una estrella al centro. */
  function dorso(cx, An, Al) {
    cx.fillStyle = '#26497a';
    cx.fillRect(0, 0, An, Al);
    var m = Math.max(3, An * .035);
    cx.fillStyle = CREMA;
    cx.fillRect(m, m, An - m * 2, Al - m * 2);
    cx.fillStyle = '#2f5a90';
    cx.fillRect(m * 1.9, m * 1.9, An - m * 3.8, Al - m * 3.8);
    // Trama de rombos.
    cx.save();
    cx.beginPath();
    cx.rect(m * 1.9, m * 1.9, An - m * 3.8, Al - m * 3.8);
    cx.clip();
    trazo(cx, 'rgba(239,227,200,.22)', Math.max(.7, An * .006));
    var paso = An * .12;
    for (var i = -Al; i < An + Al; i += paso) {
      cx.beginPath(); cx.moveTo(i, 0); cx.lineTo(i + Al, Al); cx.stroke();
      cx.beginPath(); cx.moveTo(i, Al); cx.lineTo(i + Al, 0); cx.stroke();
    }
    cx.restore();
    // Una orla de puntos alrededor de la estrella.
    for (var o = 0; o < 12; o++) {
      var ao = o / 12 * 6.2832;
      cx.fillStyle = 'rgba(239,227,200,.45)';
      cx.beginPath();
      cx.arc(An / 2 + Math.cos(ao) * An * .30,
             Al / 2 + Math.sin(ao) * An * .30, An * .015, 0, 6.2832);
      cx.fill();
    }
    estrellaFig(cx, An / 2, Al / 2, An * .17, 8, ORO);
    // Cuatro remates en las esquinas del panel.
    [[.16,.11],[.84,.11],[.16,.89],[.84,.89]].forEach(function (e) {
      estrellaFig(cx, An * e[0], Al * e[1], An * .035, 4, 'rgba(239,227,200,.6)');
    });
    papel(cx, An, Al, 91);
    trazo(cx, TINTA, Math.max(1.2, An * .012));
    cx.strokeRect(m, m, An - m * 2, Al - m * 2);
  }

  /* ---------- el naipe entero ---------- */

  /* Numeral romano, nombre y lectura los trae la carta del guion. La lectura
     va impresa en la propia lamina: tenerla como un renglon aparte debajo de
     la carta obligaba a que dos cajas se midieran entre si, y eso terminaba
     desbordando o dejando un hueco muerto. */
  function dibujar(cx, clave, num, nombre, An, Al, lectura, astro) {
    // Fondo.
    cx.fillStyle = CREMA;
    cx.fillRect(0, 0, An, Al);
    // Semilla estable por carta: la misma lamina se ve siempre igual.
    var semilla = 0;
    for (var sc = 0; sc < clave.length; sc++) semilla += clave.charCodeAt(sc) * (sc + 3);
    papel(cx, An, Al, semilla);

    // Filete doble, como el borde impreso de las láminas.
    var m = Math.max(3, An * .035);
    trazo(cx, TINTA, Math.max(1.4, An * .014));
    cx.strokeRect(m, m, An - m * 2, Al - m * 2);
    trazo(cx, TINTA, Math.max(.8, An * .007));
    cx.strokeRect(m * 1.9, m * 1.9, An - m * 3.8, Al - m * 3.8);
    /* Desgaste: mordiscos de color papel sobre el filete, como una carta que
       se uso. Un borde perfecto delata que esto se dibujo con una maquina. */
    var rd = sembrado(semilla + 11);
    cx.save();
    cx.fillStyle = CREMA;
    for (var d2 = 0; d2 < 16; d2++) {
      var borde = Math.floor(rd() * 4);
      var t2 = rd();
      var px = borde === 0 ? m + t2 * (An - m * 2) : (borde === 1 ? An - m : (borde === 2 ? m + t2 * (An - m * 2) : m));
      var py = borde === 0 ? m : (borde === 1 ? m + t2 * (Al - m * 2) : (borde === 2 ? Al - m : m + t2 * (Al - m * 2)));
      cx.fillRect(px - 1, py - 1, 1 + rd() * 3, 1 + rd() * 3);
    }
    cx.restore();

    // Numeral romano arriba.
    cx.fillStyle = TINTA;
    cx.textAlign = 'center';
    cx.textBaseline = 'middle';
    cx.font = '600 ' + Math.round(An * .125) + "px 'Cormorant Garamond',Georgia,serif";
    // Un pelo de relieve: el numeral impreso hunde el papel.
    cx.fillStyle = 'rgba(255,250,235,.55)';
    cx.fillText(num, An / 2, Al * .085 + Math.max(1, An * .006));
    cx.fillStyle = TINTA;
    cx.fillText(num, An / 2, Al * .085);

    /* La correspondencia astrologica, arriba a la derecha. Cada arcano mayor
       tiene su planeta o su signo en la tradicion, y ese es el puente entre el
       tarot y la astrologia: es lo que hace que el mazo le hable a una
       astrologa y no solo a alguien que tira cartas. */
    if (astro) {
      var ga = An * .085;
      cx.font = Math.round(ga) + 'px "Segoe UI Symbol","Apple Symbols",serif';
      cx.fillStyle = 'rgba(178,56,47,.78)';
      cx.fillText(astro, An - m * 3.2, Al * .088);
    }

    // La ilustración, en el rectángulo del medio.
    var cxx = An / 2, cyy = Al * .43;
    var R = Math.min(An * .38, Al * .25);
    // El fantasma del registro corrido, debajo, y despues la lamina buena.
    if (ARCANOS[clave]) {
      desfasado(cx, An * .008, -An * .006, .16, function () {
        ARCANOS[clave](cx, cxx, cyy, R);
      });
    }
    cx.save();
    ARCANOS[clave] ? ARCANOS[clave](cx, cxx, cyy, R) : estrellaFig(cx, cxx, cyy, R * .5, 6);
    cx.restore();

    // Cartela con el nombre.
    var cy = Al * .772, ch = Al * .080;
    var gcart = cx.createLinearGradient(0, cy - ch / 2, 0, cy + ch / 2);
    gcart.addColorStop(0, '#d9c9a4');
    gcart.addColorStop(.5, CREMA2);
    gcart.addColorStop(1, '#ded0ae');
    cx.fillStyle = gcart;
    cx.fillRect(m * 1.9, cy - ch / 2, An - m * 3.8, ch);
    // Filo claro arriba y sombra abajo: la cartela se hunde en el papel.
    cx.strokeStyle = 'rgba(255,250,235,.5)';
    cx.lineWidth = 1;
    cx.beginPath();
    cx.moveTo(m * 1.9, cy - ch / 2 + .5); cx.lineTo(An - m * 1.9, cy - ch / 2 + .5);
    cx.stroke();
    trazo(cx, TINTA, Math.max(.8, An * .008));
    cx.strokeRect(m * 1.9, cy - ch / 2, An - m * 3.8, ch);

    cx.fillStyle = TINTA;
    // El nombre se achica hasta entrar: "Los Enamorados" no cabe al mismo
    // cuerpo que "El Sol", y partirlo en dos renglones rompe la cartela.
    var cuerpo = An * .105;
    var texto = nombre.toUpperCase();
    do {
      cx.font = '600 ' + Math.round(cuerpo) + "px 'Cormorant Garamond',Georgia,serif";
      cuerpo -= .6;
    } while (cx.measureText(texto).width > An - m * 5 && cuerpo > An * .045);
    cx.fillText(texto, An / 2, cy);

    // La lectura, abajo, en dos renglones como maximo.
    if (lectura) {
      cx.fillStyle = 'rgba(43,36,29,.72)';
      var cuerpo2 = An * .072;
      cx.font = 'italic 400 ' + Math.round(cuerpo2) + "px 'Cormorant Garamond',Georgia,serif";
      var ancho = An - m * 4.4;
      var palabras = lectura.split(' ');
      var lineas = [], actual = '';
      palabras.forEach(function (p) {
        var probar = actual ? actual + ' ' + p : p;
        if (cx.measureText(probar).width > ancho && actual) { lineas.push(actual); actual = p; }
        else actual = probar;
      });
      if (actual) lineas.push(actual);
      lineas = lineas.slice(0, 2);
      /* El bloque crece hacia abajo, asi que con dos renglones hay que
         arrancar mas arriba — pero no tanto como para meterse en la cartela.
         Con .868 y el cuerpo anterior, la primera linea quedaba a dos pixeles
         del borde de la cartela y se veian encimadas. */
      var y0 = Al * (lineas.length > 1 ? .855 : .880);
      lineas.forEach(function (ln, i) {
        cx.fillText(ln, An / 2, y0 + i * cuerpo2 * 1.15);
      });
    }
  }

  return { dibujar: dibujar, dorso: dorso, ARCANOS: ARCANOS };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = Naipes; }
