/* Las capas de deformacion.

   Cada una se registra con Psicodelia.capa(nombre, opciones, correr). El
   pipeline decide cuando corren, las mide y apaga las caras si el cuadro no
   entra en presupuesto. Aca solo esta el que de cada efecto.

   POR QUE TODAS LAS DEFORMACIONES GEOMETRICAS VIVEN EN UNA SOLA CAPA. Encadenar
   capas que deforman obliga a copiar el cuadro entero entre cada dos, y tres
   copias de una pantalla por cuadro cuestan mas que todos los efectos juntos.
   En una sola pasada se lee el cuadro una vez y se escribe una vez, con todas
   las deformaciones sumadas en el desplazamiento de cada tira: agregar un
   efecto nuevo es sumar un termino, no otra pasada. */

(function () {
  'use strict';

  var P = Psicodelia;

  // Copia el cuadro actual a un lienzo auxiliar y devuelve su canvas.
  function copiar(ctx, clave) {
    var l = P.lienzo(clave, ctx.W, ctx.H);
    l.cx.setTransform(1, 0, 0, 1, 0, 0);
    l.cx.globalCompositeOperation = 'source-over';
    l.cx.globalAlpha = 1;
    l.cx.clearRect(0, 0, ctx.W, ctx.H);
    l.cx.drawImage(ctx.cv, 0, 0);
    return l.cv;
  }

  /* ============================================================
     FASE CIELO — tine el fondo antes de que se dibujen las figuras
     ============================================================ */

  /* El tinte va con la mezcla 'color': reemplaza el tono y respeta la
     luminosidad, asi que el cielo cambia de color pero las estrellas siguen
     siendo puntos claros y el degrade conserva fondo y horizonte.

     Cinco topes y no dos: con dos, el gradiente cruza el medio de la rueda de
     color y sale un lavado marron. Saltando de a 68 grados quedan bandas que
     se leen como bandas. */
  P.capa('tinte', { fase: 'cielo', movimiento: false }, function (ctx) {
    var giro = P.quieto ? 40 : (ctx.t * 11) % 360;
    var g = ctx.cx.createLinearGradient(0, 0, ctx.W * .85, ctx.H);
    for (var i = 0; i <= 4; i++) {
      g.addColorStop(i / 4, 'hsl(' + ((giro + i * 68) % 360) + ',88%,58%)');
    }
    ctx.cx.save();
    ctx.cx.globalCompositeOperation = 'color';
    ctx.cx.globalAlpha = Math.min(.62, .16 + ctx.n * .38);
    ctx.cx.fillStyle = g;
    ctx.cx.fillRect(0, 0, ctx.W, ctx.H);
    ctx.cx.restore();
  });

  /* ============================================================
     FASE POST — deforma el cuadro terminado
     ============================================================ */

  /* Todas las deformaciones geometricas, en dos pasadas.

     La primera corta el cuadro en filas y corre cada una en horizontal; la
     segunda lo corta en columnas y corre cada una en vertical. Hacen falta las
     dos porque una tira horizontal solo se puede mover en X: con una sola
     pasada, el mundo ondula como una bandera y nunca como agua.

     El corrimiento de cada tira es la SUMA de todos los efectos activos:
     onda, remolino alrededor de la figura, y barril hacia los bordes. */
  P.capa('deformar', { fase: 'post', caro: true }, function (ctx) {
    var cx = ctx.cx, W = ctx.W, H = ctx.H, n = ctx.n, t = ctx.t, e = ctx.escena;
    var fuente = copiar(ctx, 'copia');

    cx.save();
    cx.setTransform(1, 0, 0, 1, 0, 0);
    cx.clearRect(0, 0, W, H);

    // Respiracion: el cuadro entero se agranda y se achica muy de a poco.
    var resp = 1 + Math.sin(t * .62) * .016 * n + ctx.audio * .012 * n;
    // Rotacion: apenas medio grado, pero alcanza para que nada este a plomo.
    var giro = Math.sin(t * .23) * .009 * n;
    cx.translate(W / 2, H / 2);
    cx.scale(resp, resp);
    cx.rotate(giro);
    cx.translate(-W / 2, -H / 2);

    // Temblor: solo en el climax.
    if (ctx.climax > .01) {
      var amp = ctx.climax * n * 3.2;
      cx.translate(Math.sin(t * 17.3) * amp, Math.cos(t * 14.1) * amp);
    }

    var filas = Math.max(1, Math.round(6 + n * 46));
    var altoF = H / filas;
    var ondaH = n * n * 13;
    var remolino = n * n * 22;

    for (var i = 0; i < filas; i++) {
      var y = i * altoF;
      var cyRel = (y + altoF / 2 - e.fy) / H;        // distancia a la figura
      // Onda de siempre.
      var dx = Math.sin(t * 1.15 + i * .34) * ondaH;
      // Remolino: cuanto mas cerca de la figura, mas se arrastra de costado.
      dx += Math.exp(-cyRel * cyRel * 9) * Math.sin(t * .8) * remolino;
      /* Barril: las filas lejos del centro se ensanchan un poco, asi que las
         verticales dejan de ser verticales y el cuadro se abomba como visto a
         traves de un vidrio grueso. Se hace con el ancho de destino del mismo
         drawImage, o sea gratis: no agrega una pasada. */
      var vCentro = (y + altoF / 2) / H - .5;
      var esc = 1 + vCentro * vCentro * n * .085;
      var anchoDest = W * esc;
      /* +1 de alto: sin eso quedan lineas de fondo entre tira y tira, porque el
         alto de tira casi nunca da entero. */
      cx.drawImage(fuente, 0, y, W, altoF + 1,
                   dx - (anchoDest - W) / 2, y, anchoDest, altoF + 1);
    }
    cx.restore();

    // Segunda pasada: columnas, para que la deformacion tenga las dos
    // direcciones. Solo pasado cierto grado, porque cuesta otra pantalla.
    if (n > .45) {
      var fuente2 = copiar(ctx, 'copiaV');
      cx.save();
      cx.setTransform(1, 0, 0, 1, 0, 0);
      cx.clearRect(0, 0, W, H);
      var cols = Math.max(1, Math.round(8 + n * 30));
      var anchoC = W / cols;
      var ondaV = (n - .45) * 16;
      for (var j = 0; j < cols; j++) {
        var x = j * anchoC;
        var dy = Math.cos(t * .93 + j * .41) * ondaV;
        cx.drawImage(fuente2, x, 0, anchoC + 1, H, x, dy, anchoC + 1, H);
      }
      cx.restore();
    }
  });

  /* Separa el rojo del cian y los corre para lados opuestos.

     Se hace con dos copias tenidas: multiplicar por rojo puro deja solo el
     canal rojo, multiplicar por cian deja verde y azul. Sumadas de nuevo con
     'lighter' reconstruyen la imagen, pero corridas dejan los bordes en
     colores. Es el efecto que mas "psicodelico" lee de todos. */
  P.capa('canales', { fase: 'post', umbral: .30, caro: true }, function (ctx) {
    var cx = ctx.cx, W = ctx.W, H = ctx.H;
    var k = Math.min(1, (ctx.n - .30) / .70);
    var d = 1 + k * 7 + ctx.audio * 3;
    var alfa = .16 + k * .30;

    var fuente = copiar(ctx, 'canalFuente');
    var R = P.lienzo('rojo', W, H), C = P.lienzo('cian', W, H);

    R.cx.globalCompositeOperation = 'source-over';
    R.cx.clearRect(0, 0, W, H);
    R.cx.drawImage(fuente, 0, 0);
    R.cx.globalCompositeOperation = 'multiply';
    R.cx.fillStyle = '#f00';
    R.cx.fillRect(0, 0, W, H);

    C.cx.globalCompositeOperation = 'source-over';
    C.cx.clearRect(0, 0, W, H);
    C.cx.drawImage(fuente, 0, 0);
    C.cx.globalCompositeOperation = 'multiply';
    C.cx.fillStyle = '#0ff';
    C.cx.fillRect(0, 0, W, H);

    cx.save();
    cx.setTransform(1, 0, 0, 1, 0, 0);
    cx.globalCompositeOperation = 'lighter';
    cx.globalAlpha = alfa;
    cx.drawImage(R.cv, -d, 0);
    cx.drawImage(C.cv, d, 0);
    cx.restore();
  });

  /* Caleidoscopio, solo mientras el lugar se esta transformando.

     Es el efecto mas fuerte de todos y por eso esta atado al unico momento en
     que el mundo ya esta roto de todas formas: las piezas estan en el aire y
     todavia no son nada. Encendido todo el tiempo, no se podria jugar. */
  P.capa('caleidoscopio', { fase: 'post', umbral: .45, caro: true }, function (ctx) {
    var u = ctx.escena.u;
    if (u >= 1 || u <= 0) return;
    // Fuerza en campana: cero al empezar y al terminar, maximo en el medio.
    var fuerza = Math.sin(u * Math.PI) * Math.min(1, (ctx.n - .45) / .55);
    if (fuerza < .02) return;

    var cx = ctx.cx, W = ctx.W, H = ctx.H, e = ctx.escena;
    var fuente = copiar(ctx, 'calFuente');
    cx.save();
    cx.setTransform(1, 0, 0, 1, 0, 0);
    cx.globalAlpha = fuerza * .55;
    var hojas = 6;
    for (var i = 1; i < hojas; i++) {
      cx.save();
      cx.translate(e.fx, e.fy);
      cx.rotate(i * (6.2832 / hojas) + ctx.t * .12);
      if (i % 2) cx.scale(-1, 1);
      cx.translate(-e.fx, -e.fy);
      cx.drawImage(fuente, 0, 0);
      cx.restore();
    }
    cx.restore();
  });

  /* Anillos que se abren desde la figura cuando el lugar termina de cambiar.
     Van deformando en vez de pintando: es el aire moviendose, no una onda
     dibujada encima. */
  P.capa('ondas', { fase: 'post', umbral: .25 }, function (ctx) {
    var dt = ctx.desde('lugar');
    if (dt > 1.2 || dt < 0) return;
    var cx = ctx.cx, W = ctx.W, H = ctx.H, e = ctx.escena;
    var fuente = copiar(ctx, 'ondaFuente');
    var k = dt / 1.2;
    var radio = Math.max(W, H) * k * .8;
    var grosor = Math.max(W, H) * .10;
    var amp = (1 - k) * 16 * ctx.n;

    cx.save();
    cx.setTransform(1, 0, 0, 1, 0, 0);
    // Solo se redibuja el anillo, no la pantalla entera: mucho mas barato y el
    // resto del cuadro ya esta bien donde esta.
    var pasos = 22;
    for (var i = 0; i < pasos; i++) {
      var r = radio - grosor / 2 + (grosor * i / pasos);
      if (r <= 1) continue;
      var d = Math.sin(i / pasos * Math.PI) * amp;
      var esc = (r + d) / r;
      cx.save();
      cx.beginPath();
      cx.arc(e.fx, e.fy, r, 0, 6.2832);
      cx.arc(e.fx, e.fy, Math.max(0, r - grosor / pasos - 1), 0, 6.2832, true);
      cx.clip();
      cx.translate(e.fx, e.fy);
      cx.scale(esc, esc);
      cx.translate(-e.fx, -e.fy);
      cx.drawImage(fuente, 0, 0);
      cx.restore();
    }
    cx.restore();
  });

  /* Glitch por bloques: cada tanto, unas bandas se corren de golpe. Es el unico
     efecto que no es continuo — aparece, dura tres cuadros y se va.

     La irregularidad sale de una funcion del tiempo y no de Math.random: asi el
     mismo instante se ve igual si se vuelve a dibujar, que es lo que permite
     capturarlo para verificarlo. */
  P.capa('glitch', { fase: 'post', umbral: .40 }, function (ctx) {
    var ciclo = 3.7;
    var fase = (ctx.t % ciclo) / ciclo;
    if (fase > .06) return;
    var cx = ctx.cx, W = ctx.W, H = ctx.H;
    var fuente = copiar(ctx, 'glitchFuente');
    var semilla = Math.floor(ctx.t / ciclo) * 7919;
    var azar = function (i) {
      var x = Math.sin(semilla + i * 127.1) * 43758.5453;
      return x - Math.floor(x);
    };
    cx.save();
    cx.setTransform(1, 0, 0, 1, 0, 0);
    for (var i = 0; i < 5; i++) {
      var y = azar(i) * H;
      var alto = 6 + azar(i + 50) * H * .07;
      var dx = (azar(i + 100) - .5) * W * .22 * ctx.n;
      cx.clearRect(0, y, W, alto);
      cx.drawImage(fuente, 0, y, W, alto, dx, y, W, alto);
    }
    cx.restore();
  });

  /* Espejo: la mitad derecha se refleja sobre la izquierda, de a ratos y
     entrando y saliendo con una rampa. Sin la rampa aparece de golpe y se lee
     como un error de dibujo en vez de como un efecto. */
  P.capa('espejo', { fase: 'post', umbral: .55, caro: true }, function (ctx) {
    var ciclo = 11, fase = (ctx.t % ciclo) / ciclo;
    if (fase > .18) return;
    var fuerza = Math.sin(fase / .18 * Math.PI) * Math.min(1, (ctx.n - .55) / .45);
    if (fuerza < .02) return;
    var cx = ctx.cx, W = ctx.W, H = ctx.H;
    var fuente = copiar(ctx, 'espejoFuente');
    cx.save();
    cx.setTransform(1, 0, 0, 1, 0, 0);
    cx.globalAlpha = fuerza * .7;
    cx.translate(W, 0);
    cx.scale(-1, 1);
    cx.drawImage(fuente, 0, 0);
    cx.restore();
  });

})();
