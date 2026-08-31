/* El instante.

   Mientras las piezas vuelan hay un momento en que la cosa se deja ver. Dura
   poco y hay que acertarle: un anillo se contrae sobre la figura y cuando toca
   la marca, ese es el momento.

   Le acertás y ves lo que la cosa esconde. Errás y la transformación sigue
   igual — no perdés el turno, perdés lo que había abajo. Esa es toda la
   apuesta: no se juega contra un reloj, se juega contra la distracción. */
var Instante = (function () {
  'use strict';

  // Dentro de la mutación (u de 0 a 1), cuándo empieza y termina el anillo.
  var ENTRA = .18;
  var CIERRA = .70;
  // Qué tan cerca del centro hay que pegarle. En fracción del recorrido.
  var CLAVADO = .070;   // justo
  var BIEN    = .160;   // vale

  /* La ventana se agranda cuando alguien viene errando. El juego no es de
     puntería: la puntería es la excusa para que mirar tenga peso, y castigar a
     quien no la tiene solo lo deja afuera. Vuelve a lo normal al acertar. */
  var holgura = 0;
  var MAX_HOLGURA = .12;
  function aflojar()  { holgura = Math.min(MAX_HOLGURA, holgura + .045); return holgura; }
  function apretar()  { holgura = 0; }
  function holguraActual() { return holgura; }

  function crear() {
    return {
      activo: false,
      u: 0,             // progreso de la mutación, lo pone el juego
      resuelto: false,
      resultado: null,  // 'clavado' | 'bien' | 'tarde' | 'pronto' | 'nada'
      destello: 0,      // brillo del acierto
      fallo: 0,         // sacudida del error
      // Dónde cae el anillo en pantalla; lo fija el juego al arrancar.
      x: 0, y: 0, radio: 120
    };
  }

  function arrancar(i, x, y, radio) {
    i.activo = true;
    i.resuelto = false;
    i.resultado = null;
    i.destello = 0;
    i.fallo = 0;
    i.x = x; i.y = y; i.radio = radio;
  }

  /* Progreso del anillo: 0 cuando aparece, 1 cuando llega a la marca.
     Pasado el momento sigue creciendo por encima de 1 — si saturara en 1,
     esperar de mas contaria como acierto y no habria nada que acertar. */
  function avance(i) {
    if (i.u <= ENTRA) return 0;
    return (i.u - ENTRA) / (CIERRA - ENTRA);
  }

  /* Para dibujar hace falta el valor recortado: el anillo no sigue de largo. */
  function avanceVisible(i) { return Math.min(1, avance(i)); }

  /* Se llama en cada cuadro con el progreso de la mutación. */
  function actualizar(i, u, dt) {
    i.u = u;
    if (i.destello > 0) i.destello = Math.max(0, i.destello - dt * 1.6);
    if (i.fallo > 0) i.fallo = Math.max(0, i.fallo - dt * 2.4);
    // Si pasó de largo sin que nadie toque, se perdió.
    // El margen de expiracion cubre toda la ventana de acierto tardio: si
    // caducara antes, adelantarse valdria mas que atrasarse y no seria parejo.
    if (i.activo && !i.resuelto &&
        u > CIERRA + (BIEN + holgura) * (CIERRA - ENTRA) + .01) {
      i.resuelto = true;
      i.resultado = 'tarde';
      i.fallo = 1;
    }
    if (i.activo && u >= 1) i.activo = false;
  }

  /* El jugador tocó. Devuelve el resultado, o null si no había nada que tocar. */
  function tocar(i) {
    if (!i.activo || i.resuelto) return null;
    var f = avance(i);
    var lejos = Math.abs(1 - f);
    i.resuelto = true;
    if (f < .12) {
      // Tocó apenas apareció: eso no es mirar, es apurarse.
      i.resultado = 'pronto';
      i.fallo = 1;
    } else if (lejos <= CLAVADO + holgura * .5) {
      i.resultado = 'clavado';
      i.destello = 1;
    } else if (lejos <= BIEN + holgura) {
      i.resultado = 'bien';
      i.destello = .7;
    } else {
      i.resultado = f < 1 ? 'pronto' : 'tarde';
      i.fallo = 1;
    }
    return i.resultado;
  }

  function acerto(i) {
    return i.resultado === 'clavado' || i.resultado === 'bien';
  }

  /* ---------- dibujo ---------- */

  function dibujar(cx, i, t) {
    if (!i.activo && i.destello <= 0 && i.fallo <= 0) return;
    var f = avanceVisible(i);

    cx.save();
    cx.globalCompositeOperation = 'lighter';

    // La marca: el anillo fijo al que hay que llegar.
    if (i.activo && !i.resuelto) {
      var pulso = .55 + .45 * Math.sin(t * 5);
      cx.strokeStyle = 'rgba(236,206,140,' + (.34 + .2 * pulso) + ')';
      cx.lineWidth = 2.4;
      cx.beginPath();
      cx.arc(i.x, i.y, i.radio, 0, 6.2832);
      cx.stroke();
      // Cuatro muescas, para que el ojo encuentre el borde sin buscar.
      for (var m = 0; m < 4; m++) {
        var a = m / 4 * 6.2832 + Math.PI / 4;
        cx.beginPath();
        cx.moveTo(i.x + Math.cos(a) * (i.radio - 9), i.y + Math.sin(a) * (i.radio - 9));
        cx.lineTo(i.x + Math.cos(a) * (i.radio + 9), i.y + Math.sin(a) * (i.radio + 9));
        cx.stroke();
      }

      // El anillo que se cierra.
      var r = i.radio * (2.9 - 1.9 * f);
      var cerca = 1 - Math.min(1, Math.abs(1 - f) / .3);
      cx.strokeStyle = 'rgba(' + (cerca > .6 ? '255,240,200' : '190,205,255') +
                       ',' + (.5 + .5 * cerca) + ')';
      cx.lineWidth = 2 + 3 * cerca;
      cx.beginPath();
      cx.arc(i.x, i.y, r, 0, 6.2832);
      cx.stroke();

      // Cuando está por coincidir, se enciende.
      if (cerca > .55) {
        var g = cx.createRadialGradient(i.x, i.y, i.radio * .5, i.x, i.y, i.radio * 1.5);
        g.addColorStop(0, 'rgba(255,235,180,0)');
        g.addColorStop(.7, 'rgba(255,230,170,' + (.16 * cerca) + ')');
        g.addColorStop(1, 'rgba(255,225,160,0)');
        cx.fillStyle = g;
        cx.beginPath(); cx.arc(i.x, i.y, i.radio * 1.5, 0, 6.2832); cx.fill();
      }
    }

    // Acierto: un anillo que se abre y se apaga.
    if (i.destello > 0) {
      var q = i.destello;
      var rr = i.radio * (1 + (1 - q) * 1.5);
      cx.strokeStyle = 'rgba(255,242,205,' + (q * q * .85) + ')';
      cx.lineWidth = 2 + 7 * q;
      cx.beginPath(); cx.arc(i.x, i.y, rr, 0, 6.2832); cx.stroke();
      var g2 = cx.createRadialGradient(i.x, i.y, 0, i.x, i.y, i.radio * 2.2);
      g2.addColorStop(0, 'rgba(255,240,200,' + (.30 * q) + ')');
      g2.addColorStop(1, 'rgba(255,235,190,0)');
      cx.fillStyle = g2;
      cx.beginPath(); cx.arc(i.x, i.y, i.radio * 2.2, 0, 6.2832); cx.fill();
    }

    // Error: el anillo se quiebra y se cae.
    if (i.fallo > 0) {
      var p = i.fallo;
      cx.strokeStyle = 'rgba(190,130,120,' + (p * .5) + ')';
      cx.lineWidth = 2;
      for (var k = 0; k < 5; k++) {
        var a0 = k / 5 * 6.2832 + (1 - p) * .6;
        cx.beginPath();
        cx.arc(i.x, i.y + (1 - p) * 26, i.radio * (1 + (1 - p) * .18),
               a0, a0 + .75);
        cx.stroke();
      }
    }
    cx.restore();
  }

  return {
    crear: crear, arrancar: arrancar, actualizar: actualizar, tocar: tocar,
    dibujar: dibujar,
    acerto: acerto, avance: avance, avanceVisible: avanceVisible,
    aflojar: aflojar, apretar: apretar, holguraActual: holguraActual,
    ENTRA: ENTRA, CIERRA: CIERRA, CLAVADO: CLAVADO, BIEN: BIEN
  };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = Instante; }
