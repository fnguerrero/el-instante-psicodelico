/* Psicodelia.

   No es un filtro pegado encima: engancha con la tension que el juego ya lleva
   — cuanto mas descubierto esta que el mundo no cierra, mas se va el mundo. En
   el primer lugar casi no se nota; para el octavo el aire ondula, los colores
   se separan de los objetos y todo deja rastro.

   Que hace, todo escalado por lo mismo:

   1. Estela      el fondo se repinta translucido, asi lo del cuadro anterior no
                  se borra del todo y lo que se mueve deja rastro.
   2. Tinte       bandas de color que corren sobre el cielo con la mezcla
                  'color': se llevan el tono y respetan las luces y las sombras,
                  asi que el cielo cambia de color sin aplanarse.
   3. Canales     el rojo y el cian se separan del dibujo y se corren para lados
                  opuestos. Es lo que da los bordes de colores, y es el efecto
                  que mas "psicodelico" lee de todos.
   4. Ondulacion  la imagen se corta en tiras horizontales y cada una se corre
                  con un seno.
   5. Respiracion todo el cuadro se agranda y se achica muy de a poco, como si
                  la escena estuviera respirando.

   Cada uno tiene que poder valer cero, porque con reduced-motion queda
   unicamente el tinte, quieto: alguien que pidio que las cosas no se muevan no
   deberia recibir el piso ondulando ni la pantalla respirando.

   El costo esta acotado a proposito: los canvas auxiliares se crean una vez y
   los efectos caros (canales, ondulacion) no arrancan hasta pasado un umbral,
   asi que la mayor parte de la partida se paga poco. */

var Psicodelia = (function () {
  'use strict';

  /* Encendida de fabrica: es el juego, no un modo. Se puede apagar igual, que
     es lo que usan las capturas y las pruebas para comparar contra el dibujo
     limpio. */
  var activo = true;
  var fuerza = 1;

  var quieto = false;
  try {
    quieto = window.matchMedia &&
             window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) { quieto = false; }

  // Tres auxiliares: la copia, el canal rojo y el cian. Se crean una sola vez.
  var lienzos = {};
  function lienzo(clave, W, H) {
    var l = lienzos[clave];
    if (!l) {
      l = lienzos[clave] = { cv: document.createElement('canvas') };
      l.cx = l.cv.getContext('2d');
    }
    if (l.cv.width !== W || l.cv.height !== H) { l.cv.width = W; l.cv.height = H; }
    return l;
  }

  /* Cuanto efecto corresponde ahora. La tension manda; la fuerza es el tope de
     quien configura. No arranca en cero del todo: un piso bajo hace que el
     primer lugar ya tenga algo raro, que es lo que engancha. */
  function grado(tension, climax) {
    if (!activo) return 0;
    var n = .12 + Math.min(1, (tension || 0) * .78 + (climax || 0) * .45) * .88;
    return Math.min(1, n) * fuerza;
  }

  /* Con cuanta opacidad repintar el fondo. 1 borra todo (lo normal); menos deja
     ver el cuadro anterior y aparece la estela. No baja de .70: mas abajo el
     rastro no termina de limpiarse nunca y la pantalla se ensucia sola. */
  function veloFondo(tension, climax) {
    var n = grado(tension, climax);
    if (n <= .001 || quieto) return 1;
    return 1 - n * .30;
  }

  /* El tinte del cielo. Va con 'color', que reemplaza el tono dejando intacta
     la luminosidad: por eso el cielo cambia de color pero las estrellas siguen
     siendo puntos claros y el degrade sigue teniendo fondo y horizonte.

     Cinco topes en vez de dos porque con dos el gradiente pasa por el medio de
     la rueda de color y sale un lavado marron; con cinco saltando de a 68
     grados quedan bandas separadas que se leen como bandas. */
  function tinte(cx, W, H, t, tension, climax) {
    var n = grado(tension, climax);
    if (n <= .001) return;
    var giro = quieto ? 40 : (t * 11) % 360;
    var g = cx.createLinearGradient(0, 0, W * .85, H);
    for (var i = 0; i <= 4; i++) {
      g.addColorStop(i / 4, 'hsl(' + ((giro + i * 68) % 360) + ',88%,58%)');
    }
    cx.save();
    cx.globalCompositeOperation = 'color';
    cx.globalAlpha = .16 + n * .40;
    cx.fillStyle = g;
    cx.fillRect(0, 0, W, H);
    cx.restore();
  }

  /* Saturacion general. El tono ya lo mueve el tinte, asi que aca solo se sube
     el volumen del color; rotar el tono ademas peleaba contra las bandas. */
  function filtroCss(t, tension, climax) {
    var n = grado(tension, climax);
    if (n <= .001) return 'none';
    return 'saturate(' + (1 + n * .60).toFixed(2) + ')';
  }

  /* Separa el rojo del cian. Se hace con dos copias tenidas: multiplicar por
     rojo puro deja solo el canal rojo, multiplicar por cian deja verde y azul.
     Sumadas de nuevo con 'lighter' y corridas para lados opuestos, reconstruyen
     la imagen con los bordes en colores. */
  function canales(cx, fuenteCv, W, H, d, alfa) {
    var R = lienzo('rojo', W, H), C = lienzo('cian', W, H);

    R.cx.globalCompositeOperation = 'source-over';
    R.cx.clearRect(0, 0, W, H);
    R.cx.drawImage(fuenteCv, 0, 0);
    R.cx.globalCompositeOperation = 'multiply';
    R.cx.fillStyle = '#f00';
    R.cx.fillRect(0, 0, W, H);

    C.cx.globalCompositeOperation = 'source-over';
    C.cx.clearRect(0, 0, W, H);
    C.cx.drawImage(fuenteCv, 0, 0);
    C.cx.globalCompositeOperation = 'multiply';
    C.cx.fillStyle = '#0ff';
    C.cx.fillRect(0, 0, W, H);

    cx.globalCompositeOperation = 'lighter';
    cx.globalAlpha = alfa;
    cx.drawImage(R.cv, -d, 0);
    cx.drawImage(C.cv, d, 0);
    cx.globalAlpha = 1;
    cx.globalCompositeOperation = 'source-over';
  }

  /* El post-proceso, sobre el cuadro ya terminado: copia lo pintado al
     auxiliar, limpia, y lo devuelve deformado. */
  function despues(cx, cv, W, H, t, tension, climax) {
    var n = grado(tension, climax);
    if (n <= .001 || quieto) return;
    if (W < 2 || H < 2) return;

    var A = lienzo('copia', W, H);
    A.cx.clearRect(0, 0, W, H);
    A.cx.drawImage(cv, 0, 0);

    cx.save();
    cx.setTransform(1, 0, 0, 1, 0, 0);
    cx.clearRect(0, 0, W, H);

    // Respiracion: apenas un 1.5% en el maximo, pero se siente.
    var resp = 1 + Math.sin(t * .62) * .015 * n;
    if (resp !== 1) {
      cx.translate(W / 2, H / 2);
      cx.scale(resp, resp);
      cx.translate(-W / 2, -H / 2);
    }

    /* Tiras: pocas cuando el efecto es leve, muchas cuando es fuerte, para no
       pagar 56 drawImage por cuadro por una onda que no se ve. */
    var tiras = Math.max(1, Math.round(6 + n * 50));
    var alto = H / tiras;
    var amplitud = n * n * 15;

    for (var i = 0; i < tiras; i++) {
      var y = i * alto;
      var dx = Math.sin(t * 1.15 + i * .34) * amplitud;
      /* +1 de alto: sin eso quedan lineas de fondo entre tira y tira, porque el
         alto casi nunca da entero. */
      cx.drawImage(A.cv, 0, y, W, alto + 1, dx, y, W, alto + 1);
    }

    // Los canales, encima. Cuestan dos copias enteras: recien pasado un tercio.
    if (n > .30) {
      var k = (n - .30) / .70;
      canales(cx, A.cv, W, H, 1 + k * 7, .16 + k * .34);
    }

    cx.restore();
  }

  function encender(f) {
    activo = true;
    if (typeof f === 'number') fuerza = Math.max(0, Math.min(1, f));
    return { activo: activo, fuerza: fuerza, quieto: quieto };
  }
  function apagar() { activo = false; return { activo: activo }; }

  return {
    encender: encender,
    apagar: apagar,
    get activo() { return activo; },
    get fuerza() { return fuerza; },
    get quieto() { return quieto; },
    grado: grado,
    veloFondo: veloFondo,
    tinte: tinte,
    filtroCss: filtroCss,
    despues: despues
  };
})();
