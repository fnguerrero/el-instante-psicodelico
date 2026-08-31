/* El juego.

   Ocho pasos. En cada uno estás en un lugar, te reparten tres cartas, jugás
   una, y el lugar se transforma en lo que esa carta trae: esa cosa nueva es
   donde estás ahora. Por eso el recorrido se ramifica solo — no hay una lista
   de escenas, hay una cadena.

   Mientras las piezas vuelan hay un instante para mirar. Si le acertás, ves lo
   que ese lugar escondía y te lo llevás. Los indicios que juntes son lo único
   que decide el final.

   La cama está prohibida hasta el último paso. Es la revelación y no se
   regala antes. */
(function () {
  'use strict';

  var cv = document.getElementById('c'), cx = cv.getContext('2d');
  var W = 0, H = 0, t = 0;

  function medir() {
    /* Tope de densidad. En una pantalla muy grande y densa, pintar a 2x son
       cuatro veces mas pixeles por cuadro sin diferencia visible a esa escala. */
    var d = window.devicePixelRatio || 1;
    W = cv.clientWidth; H = cv.clientHeight;
    if (W * H > 2200 * 1300) d = Math.min(d, 1.25);
    else d = Math.min(d, 2);
    // Sin layout (pestaña oculta) el canvas queda en 0 y cualquier captura sale
    // vacía; con un tamaño de respaldo el juego se puede revisar igual.
    if (W < 2 || H < 2) { W = 1280; H = 760; }
    cv.width = W * d; cv.height = H * d;
    cx.setTransform(d, 0, 0, d, 0, 0);
  }
  window.addEventListener('resize', medir);
  /* El evento resize no siempre llega: no se dispara cuando la ventana cambia
     con la pestana en segundo plano, ni en varios casos de zoom o de paneles
     embebidos. El sintoma es feo y silencioso — el canvas queda con el buffer
     de un tamano viejo y la escena se dibuja para una pantalla que ya no
     existe. Por eso el tamano se comprueba en cada cuadro: son dos lecturas
     de layout y evitan depender de que el evento llegue. */
  function revisarTamanio() {
    if (cv.clientWidth >= 2 && cv.clientHeight >= 2 &&
        (cv.clientWidth !== W || cv.clientHeight !== H)) {
      medir();
      medirMano();
      return true;
    }
    return false;
  }
  medir();

  var elRelato = document.getElementById('relato');
  var elMano = document.getElementById('mano');
  var elRotulo = document.getElementById('rotulo');
  var elRestan = document.getElementById('restan');
  var elMarcador = document.getElementById('marcador');
  var elCuentas = document.getElementById('cuentas');
  var elCierre = document.getElementById('cierre');
  var elAviso = document.getElementById('aviso');
  var elGuia = document.getElementById('guia');

  var bel = Bel.crear();
  var cielo = Cielo.crear();
  var mirada = Instante.crear();

  /* Multiplicador de velocidad. Vale 1 jugando; una prueba automática lo sube
     para recorrer una partida entera en segundos en vez de en minutos. */
  var RITMO = 1;
  /* Todos los temporizadores del juego pasan por aca y quedan anotados. Sin un
     registro, reiniciar una partida deja vivos los `setTimeout` de la anterior
     y el juego avanza dos veces por cada paso. */
  var relojes = [];
  function luego(ms, fn) {
    var id = setTimeout(function () {
      var i = relojes.indexOf(id);
      if (i !== -1) relojes.splice(i, 1);
      fn();
    }, ms / RITMO);
    relojes.push(id);
    return id;
  }
  function frenarRelojes() {
    relojes.forEach(clearTimeout);
    relojes = [];
  }

  /* ---------- estado ---------- */
  var J = {
    paso: 0,
    lugar: Guion.ARRANQUE,
    visitados: {},          // lugares por los que ya pasó
    recorrido: [],          // la cadena de figuras, en orden
    indicios: [],           // lo que llegó a ver
    perdidos: [],           // lo que estuvo ahí y no llegó a ver
    jugando: false,         // hay una jugada en curso: no aceptar otra
    guiaMostrada: false,    // la guia del instante se ve una sola vez
    errosSeguidos: 0,       // tres seguidos y la ventana se agranda
    ultimoTic: -1,          // para no repetir el tic del anillo
    esconde: null,          // lo que esconde el lugar del que se está yendo
    vioAhora: null,         // indicio recién descubierto, para contarlo
    mazo: Guion.CARTAS.map(function (c) { return c.clave; }),
    jugadas: [],
    andando: false,
    // La transformación en curso.
    color: '210,190,255',
    pares: null,
    u: 1,
    destino: null,
    fogonazo: 0,
    destello: 0,            // el golpe de luz al terminar una mutacion
    // Bel entra caminando en cada paso.
    belX: -.15,
    belMeta: .26,
    ultimaFy: 0,
    corrimientoMano: 0,     // cuanto se corre la mano para centrarla en la escena
    /* Cuanto sabe el sueno que lo estan descubriendo. Sube con cada prueba
       encontrada y tine todo: el ritmo de las figuras, el color del cielo, la
       fuerza de los halos. Es lo que hace que acertar se sienta, en vez de
       sumar un numero en una esquina. */
    tension: 0,
    tensionSuave: 0,        // la misma, alcanzada despacio
    climax: 0               // el ultimo paso: 0 a 1 mientras dura
  };

  /* ---------- utilidades ---------- */

  function mezclarColor(a, b, u) {
    var A = a.split(',').map(Number), B = b.split(',').map(Number);
    return A.map(function (v, i) { return Math.round(v + (B[i] - v) * u); }).join(',');
  }

  /* Cuanto queda un texto en pantalla antes de seguir. Va por largo, no por un
     numero fijo: los textos van de 60 a 170 caracteres y con un tiempo unico o
     el corto se eterniza o el largo no se llega a leer. Unos 52 ms por caracter
     es lectura tranquila en voz baja, mas un resto para arrancar. */
  function tiempoDeLectura(texto) {
    return Math.max(2200, Math.min(9000, 900 + texto.length * 52));
  }

  function decir(texto, alTerminar) {
    elRelato.classList.remove('ver');
    luego(700, function () {
      elRelato.textContent = texto;
      elRelato.classList.add('ver');
      if (alTerminar) luego(tiempoDeLectura(texto), alTerminar);
    });
  }

  /* Dónde apoya cada figura (1 = su borde de abajo). null = flota. */
  var BASES = {
    montania: 1, ruina: 1, arbol: 1, casa: .96, puerta: .90, cama: .62,
    calesita: .68, faro: 1, laguna: 1, reloj: 1,
    platillo: null, luna: null, bandada: null, barca: null
  };

  /* Dónde se planta Bel, como fracción del ancho: cuanto más grande es lo que
     mira, más lejos se para. */
  var LEJANIA = {
    cama: .30, casa: .26, puerta: .30, calesita: .24,
    laguna: .16, faro: .22, reloj: .26, montania: .18
  };

  /* La altura a la que va la figura. Durante una transformación interpola entre
     las dos, así una casa que se vuelve platillo despega en vez de saltar. */
  function alturaDe(figura, destino, u, piso, E) {
    var aire = piso - E * 1.02;
    function y(clave) {
      var b = BASES[clave];
      return (b === null || b === undefined) ? aire : piso - E * b;
    }
    var a = y(figura);
    if (!destino) return a;
    var b = y(destino.figura);
    var f = u * u * (3 - 2 * u);
    return a + (b - a) * f;
  }

  /* Donde empieza la mano de cartas, en pixeles desde arriba. Se cachea porque
     leer el layout en cada cuadro fuerza un reflow; se invalida cuando cambia
     el tamano o cuando se reparte. */
  var _techoMano = 0;
  function medirMano() {
    var r = elMano.getBoundingClientRect();
    // Con la mano fuera (cierre, carta final) vale su posicion de reposo.
    _techoMano = (r.height > 4) ? r.top : H * .78;
    return _techoMano;
  }
  function techoMano() {
    return _techoMano || medirMano();
  }

  /* Reparte, pero no cualquier cosa.

     Una carta que transforma el lugar en el mismo lugar no hace nada, y una
     que te devuelve a donde ya estuviste se lee como que el juego se rompio,
     no como que el sueno se repite. Asi que la mano se arma priorizando las
     que llevan a algo nuevo, y solo se relaja si no alcanzan. */
  function mezclar(a) {
    var c = a.slice();
    for (var i = c.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var x = c[i]; c[i] = c[j]; c[j] = x;
    }
    return c;
  }

  /* La Muerte no se reparte en la primera mano. El juego es un regalo para
     alguien concreto, y abrirle con esa carta es un golpe que no aporta nada:
     mas adelante, con el sueno ya en marcha, se lee distinto. */
  var NO_AL_ARRANQUE = ['muerte'];

  function repartir(n) {
    var todas = mezclar(J.mazo);
    if (J.paso === 0) {
      var guardadas = todas.filter(function (k) {
        return NO_AL_ARRANQUE.indexOf(k) !== -1;
      });
      todas = todas.filter(function (k) {
        return NO_AL_ARRANQUE.indexOf(k) === -1;
      });
      // Si por lo que sea no quedaran suficientes, vuelven al final.
      if (todas.length < n) todas = todas.concat(guardadas);
    }
    // En el ultimo paso da igual: todas llevan al mismo lado.
    if (J.paso >= Guion.PASOS - 1) return todas.slice(0, n);

    var nuevas = [], repetidas = [], inutiles = [];
    todas.forEach(function (k) {
      var d = Guion.destino(k, J.lugar);
      if (!d || d === J.lugar) inutiles.push(k);
      else if (J.visitados[d]) repetidas.push(k);
      else nuevas.push(k);
    });
    // Primero las que abren lugar nuevo; despues las repetidas; las que no
    // cambian nada, solo si no quedo otra.
    var mano = nuevas.concat(repetidas).concat(inutiles);
    return mano.slice(0, Math.min(n, mano.length));
  }

  /* ---------- el hilo ---------- */

  function empezar() {
    document.getElementById('portada').classList.add('ido');
    luego(1500, function () {
      J.recorrido.push(J.lugar);
      llegar(true);
    });
  }

  /* Bel aparece en el lugar donde está. `primera` distingue el arranque del
     sueño de los pasos siguientes. */
  function llegar(primera) {
    var l = Guion.lugar(J.lugar);
    if (!l) return terminar();

    /* Llegar a un lugar cierra cualquier transformacion en curso. No es solo
       prolijidad: si la mutacion quedara a medias, el juego se traba para
       siempre porque nadie mas vuelve a poner J.u en 1. */
    J.u = 1;
    J.destino = null;
    J.pares = null;
    J.jugando = false;
    mirada.activo = false;

    /* Bel entra caminando UNA sola vez, al principio del sueno. Despues se
       queda donde esta: la figura se transforma delante de ella, no cambia el
       lugar de plano. Hacerla salir y volver a entrar por la izquierda en cada
       paso se veia como un salto, no como un viaje. */
    /* La marca NO se fija aca. La calcula el bucle, que es el unico que sabe
       donde termino quedando la figura. Fijandola en los dos lados, llegar()
       ponia una y el cuadro siguiente la corregia: Bel caminaba hacia un punto,
       la marca se movia, y volvia — el ida y vuelta que se veia en cada carta. */
    if (primera) J.belX = -.15;

    elRotulo.textContent = l.nombre;
    elRotulo.classList.add('ver');
    elMarcador.classList.add('ver');
    actualizarRestan();
    Audio2.entrada();
    Audio2.colorDe(J.lugar);

    // Si ya estuvo acá, lo dice distinto: es un sueño, repetir es verosímil.
    var texto = (!primera && J.visitados[J.lugar]) ? l.vuelta : l.llegada;
    J.visitados[J.lugar] = true;

    decir(texto, mostrarMano);
  }

  var elResto = document.getElementById('resto');
  var elPila = document.getElementById('pila');
  var elCuantas2 = document.getElementById('cuantas2');

  /* Lo que queda del mazo, como una pilita. Sin esto no habia forma de saber
     que las cartas se gastan, que es de lo que trata elegir. */
  function pintarResto() {
    var n = J.mazo.length;
    var capas = Math.max(1, Math.min(5, Math.ceil(n / 3)));
    if (elPila.children.length !== capas) {
      elPila.innerHTML = '';
      for (var i = 0; i < capas; i++) {
        var c = document.createElement('i');
        c.style.transform = 'translate(' + (i * 1.6) + 'px,' + (-i * 1.6) + 'px)';
        c.style.opacity = (.45 + i * .13).toFixed(2);
        elPila.appendChild(c);
      }
    }
    elCuantas2.textContent = n + (n === 1 ? ' carta' : ' cartas');
    elResto.classList.toggle('ver', n > 0);
  }

  function actualizarRestan() {
    elRestan.textContent = J.indicios.length + ' de ' + Guion.PASOS +
      '  ·  paso ' + Math.min(J.paso + 1, Guion.PASOS);
    // Una bolita por paso; se encienden las que encontro.
    if (elCuentas.children.length !== Guion.PASOS) {
      elCuentas.innerHTML = '';
      for (var i = 0; i < Guion.PASOS; i++) {
        var d = document.createElement('span');
        d.className = 'cuenta';
        elCuentas.appendChild(d);
      }
    }
    for (var k = 0; k < Guion.PASOS; k++) {
      elCuentas.children[k].classList.toggle('llena', k < J.indicios.length);
    }
    pintarResto();
  }

  /* Los naipes en pantalla, para poder repintarlos si cambia el tamano. */
  var naipes = [];

  /* Pinta cada lamina a la resolucion real de su hueco. Si se dibujara a un
     tamano fijo, en pantallas densas se veria borrosa. */
  function pintarNaipes() {
    var d = Math.min(2, window.devicePixelRatio || 1);
    naipes.forEach(function (n) {
      var an = n.lienzo.clientWidth, al = n.lienzo.clientHeight;
      if (an < 2 || al < 2) { an = 126; al = 189; }
      // Repintar un naipe es caro; si el hueco no cambio, no hay nada que hacer.
      if (n.an === an && n.al === al) return;
      n.an = an; n.al = al;
      n.lienzo.width = an * d;
      n.lienzo.height = al * d;
      var c2 = n.lienzo.getContext('2d');
      c2.setTransform(d, 0, 0, d, 0, 0);
      Naipes.dibujar(c2, n.carta.clave, n.carta.num, n.carta.nombre, an, al,
                     n.carta.lectura, n.carta.astro);
    });
  }
  window.addEventListener('resize', pintarNaipes);

  function mostrarMano() {
    var claves = repartir(3);
    elMano.innerHTML = '';
    naipes = [];
    elMano.classList.remove('fuera');

    claves.forEach(function (clave, i) {
      var c = Guion.carta(clave);
      var el = document.createElement('button');
      el.className = 'carta';
      el.style.setProperty('--giro', ((i - (claves.length - 1) / 2) * 5) + 'deg');
      /* El naipe se dibuja en su propio canvas: el numeral, la lamina del
         arcano y la cartela con el nombre. La lectura queda debajo, fuera de
         la carta, porque en una lamina de verdad no hay texto explicativo. */
      var lienzo = document.createElement('canvas');
      lienzo.className = 'lamina';
      el.appendChild(lienzo);
      naipes.push({ lienzo: lienzo, carta: c });
      el.addEventListener('click', function () { jugar(c, el); });
      el.addEventListener('mouseenter', function () { Audio2.roce(); });
      // En táctil no hay hover: el roce suena al tocar y la carta se juega ahí.
      el.addEventListener('touchstart', function (ev) {
        ev.preventDefault();
        Audio2.roce();
        jugar(c, el);
      }, { passive: false });
      elMano.appendChild(el);
      luego(90 + i * 130, function () { el.classList.add('entra'); });
    });
    // Despues de insertarlas: recien ahi tienen tamano.
    pintarNaipes();
    medirMano();
  }

  function jugar(c, elCarta) {
    // Un doble click rapido llegaba a colarse entre el click y el repintado.
    if (J.jugando) return;
    if (J.u < 1) return;
    // Una carta gastada no se vuelve a jugar. La clase .fuera bloquea el mouse,
    // pero eso es CSS: esta es la guarda de verdad.
    if (J.mazo.indexOf(c.clave) === -1) return;

    J.jugando = true;
    J.mazo = J.mazo.filter(function (k) { return k !== c.clave; });
    J.jugadas.push(c.clave);
    J.paso++;

    /* A dónde lleva. En el último paso todo termina en la cama: es el
       despertar, y es la única vez que la cama puede aparecer. */
    var destino;
    if (J.paso >= Guion.PASOS) {
      destino = 'cama';
      Audio2.tensar(1);
    } else {
      destino = Guion.destino(c.clave, J.lugar);
      // Red de seguridad: nada que no sea el final puede llevar a la cama.
      if (!destino || destino === 'cama') destino = 'puerta';
    }

    J.pares = Figuras.preparar(J.lugar, destino);
    J.destino = { figura: destino, color: c.color };
    J.u = 0;
    J.fogonazo = 1;

    // La elegida sale hacia la figura; las otras dos caen.
    if (elCarta) elCarta.classList.add('elegida');
    elMano.classList.add('fuera');
    elRelato.classList.remove('ver');
    actualizarRestan();

    Audio2.golpe(c.tono === 'sombra' ? 3 : 0);
    Audio2.transformar(c.tono);

    // Lo que pasa delante la alcanza.
    bel.empuje = c.tono === 'sombra' ? 1 : .62;
    bel.asombro = 1;

    // Mientras las piezas vuelan hay un momento para mirar lo que este lugar
    // escondía. Es la última oportunidad: en un instante deja de existir.
    J.esconde = Guion.lugar(J.lugar).esconde;
    J.vioAhora = null;
    /* El anillo arranca en 2.9 veces el radio: si el radio se calcula solo
       contra la pantalla, en vertical el anillo nace pisando el borde. Se
       ajusta al espacio que hay de verdad a cada lado del centro. */
    var ix = W * (H > W * 1.25 ? .62 : .56);
    var iy = J.ultimaFy || H * .44;
    var aire = Math.min(ix, W - ix) - 14;
    var iradio = Math.max(34, Math.min(Math.min(W, H) * .13, aire / 2.9));
    Instante.arrancar(mirada, ix, iy, iradio);
    // El aviso dice que hacer, no una palabra suelta: "mira" no le indicaba
    // a nadie que habia que tocar cuando el anillo llegara a la marca.
    mostrarAviso('tocá cuando el anillo llegue a la marca', '');
    // La primera vez, ademas, una guia pegada al anillo. Solo la primera.
    if (!J.guiaMostrada) {
      J.guiaMostrada = true;
      elGuia.textContent = 'el anillo se cierra · tocá justo cuando toque el círculo';
      elGuia.classList.add('ver');
      luego(4200, function () { elGuia.classList.remove('ver'); });
    }

    // El texto entra cuando la transformación ya se ve.
    luego(2400, function () {
      // Si vio lo que el lugar escondía, eso es lo que cuenta; si no, la acción.
      var dicho = J.vioAhora || c.accion;
      J.vioAhora = null;
      decir(dicho, function () {
        // decir() ya espero lo que se tarda en leerlo; esto es el respiro.
        luego(1100, function () {
          /* Normalmente el bucle de dibujo ya lo movio, apenas termino la
             mutacion. Pero el bucle puede no correr — una pestana en segundo
             plano no recibe frames — y el estado del juego no puede depender
             de que se este dibujando. Asignar de nuevo es inocuo y garantiza
             que el paso avance igual. */
          J.lugar = destino;
          J.recorrido.push(destino);
          if (J.paso >= Guion.PASOS) terminar();
          else llegar(false);
        });
      });
    });
  }

  function terminar() {
    elRotulo.classList.remove('ver');
    elRelato.classList.remove('ver');
    elMarcador.classList.remove('ver');
    elMano.classList.add('fuera');
    ocultarAviso();

    var f = Guion.final(J.indicios, J.recorrido);
    elCierre.innerHTML = '';
    f.partes.forEach(function (p) {
      var el = document.createElement('p');
      el.textContent = p;
      elCierre.appendChild(el);
    });
    /* Lo que llego a ver, escrito. El cierre hablaba de "lo que viste" sin
       mostrarlo nunca, asi que no habia forma de saber que se habia perdido. */
    var caja = document.createElement('div');
    caja.className = 'hallazgos';
    var titu = document.createElement('p');
    titu.className = 'titu';
    titu.textContent = 'Encontraste ' + J.indicios.length + ' de ' + Guion.PASOS;
    caja.appendChild(titu);
    if (J.indicios.length) {
      var ul = document.createElement('ul');
      J.indicios.forEach(function (ind) {
        var li = document.createElement('li');
        // Solo la primera oracion: el listado es un recordatorio, no el texto.
        li.textContent = ind.split('. ')[0] + '.';
        ul.appendChild(li);
      });
      caja.appendChild(ul);
    } else {
      var nada = document.createElement('p');
      nada.className = 'nada';
      nada.textContent = 'Nada. Ocho veces algo estuvo a punto de mostrarse.';
      caja.appendChild(nada);
    }
    /* Y lo que se perdio, contado pero no revelado: saber que habia algo es
       parte de lo que el juego quiere dejar. */
    if (J.perdidos.length) {
      var pp = document.createElement('p');
      pp.className = 'perdido';
      pp.textContent = J.perdidos.length === 1
        ? 'Otro lugar escondía algo y no llegaste a verlo.'
        : 'Otros ' + J.perdidos.length + ' lugares escondían algo y no llegaste a verlo.';
      caja.appendChild(pp);
    }
    elCierre.appendChild(caja);

    var firma = document.createElement('p');
    firma.className = 'firma';
    firma.textContent = 'para Bel';
    elCierre.appendChild(firma);

    var seguir = document.createElement('button');
    seguir.className = 'boton';
    seguir.textContent = 'Hay una carta más';
    seguir.addEventListener('click', function () {
      elCierre.classList.remove('ver');
      luego(900, mostrarCartaFinal);
    });
    elCierre.appendChild(seguir);

    Audio2.final();
    Audio2.dormirColchon(5);
    luego(1200, function () { elCierre.classList.add('ver'); });
  }

  /* La carta que es de ella. No se reparte: se da vuelta una sola vez, al
     final, y es lo unico del juego que le habla a Bel y no a quien juega. */
  function mostrarCartaFinal() {
    var f = Guion.cartaDeElla(J.indicios);
    var caja = document.getElementById('final');
    var frente = document.getElementById('finalFrente');
    var dorso = document.getElementById('finalDorso');

    var d = Math.min(2, window.devicePixelRatio || 1);
    function medirLienzo(el) {
      var an = el.clientWidth || 230, al = el.clientHeight || 345;
      el.width = an * d; el.height = al * d;
      var c2 = el.getContext('2d');
      c2.setTransform(d, 0, 0, d, 0, 0);
      return { c2: c2, an: an, al: al };
    }

    var texto = document.getElementById('finalTexto');
    texto.innerHTML = '';
    var quien = document.createElement('p');
    quien.className = 'paraquien';
    quien.textContent = 'Arcano XXII · para Bel';
    texto.appendChild(quien);
    f.parrafos.forEach(function (p, i) {
      var el = document.createElement('p');
      if (i === f.parrafos.length - 1) el.className = 'cierraTodo';
      el.textContent = p;
      texto.appendChild(el);
    });

    caja.classList.add('ver');
    // Pintar despues de que la caja tenga tamano.
    luego(60, function () {
      var A = medirLienzo(frente), B = medirLienzo(dorso);
      Naipes.dibujar(A.c2, f.clave, f.num, f.nombre, A.an, A.al, f.lectura, f.astro);
      Naipes.dorso(B.c2, B.an, B.al);
      // Y recien ahi darla vuelta.
      luego(700, function () {
        caja.classList.add('dada');
        // Recien cuando termino de darse vuelta aparece la salida.
        luego(2400, function () {
          if (document.getElementById('haciaSobre')) return;
          var seguir = document.createElement('button');
          seguir.className = 'boton';
          seguir.id = 'haciaSobre';
          seguir.textContent = 'Y una carta de verdad';
          seguir.addEventListener('click', function () {
            caja.classList.remove('ver');
            luego(1100, mostrarSobre);
          });
          texto.appendChild(seguir);
        });
        Audio2.gota(0, 1, .11, 4.2);
        luego(500, function () { Audio2.gota(4, 1, .08, 3.8); });
        luego(1100, function () { Audio2.gota(7, 2, .06, 3.4); });
      });
    });
  }

  /* El sobre. Aparece despues del arcano y es lo unico del juego que no
     pertenece al sueno: es una carta de papel, de Nico para Bel. */
  function mostrarSobre() {
    var caja = document.getElementById('sobre');
    caja.classList.add('ver');
    Audio2.gota(0, 0, .09, 5);
    luego(700, function () { Audio2.gota(4, 1, .06, 4.4); });
  }

  function abrirCarta() {
    var elSobre = document.getElementById('sobre');
    var elCarta = document.getElementById('cartaEscrita');
    var hoja = document.getElementById('hoja');
    if (!hoja.children.length) {
      var c = Guion.CARTA_PARA_BEL;
      c.parrafos.forEach(function (t2) {
        var p2 = document.createElement('p');
        p2.textContent = t2;
        hoja.appendChild(p2);
      });
      var f = document.createElement('p');
      f.className = 'firma';
      f.textContent = c.firma;
      hoja.appendChild(f);
    }
    elSobre.classList.remove('ver');
    Audio2.volteo();
    luego(900, function () { elCarta.classList.add('ver'); });
  }

  var btnAbrir = document.getElementById('abrirSobre');
  if (btnAbrir) btnAbrir.addEventListener('click', abrirCarta);
  var btnCerrar = document.getElementById('cerrarCarta');
  if (btnCerrar) btnCerrar.addEventListener('click', function () { location.reload(); });

  /* ---------- el instante ---------- */

  function mostrarAviso(texto, clase) {
    if (!elAviso) return;
    elAviso.textContent = texto;
    elAviso.className = clase + ' ver';
  }
  function ocultarAviso() {
    if (elAviso) elAviso.className = '';
  }

  function resolverMirada() {
    var r = mirada.resultado;
    if (Instante.acerto(mirada)) {
      // Lo que vio es el indicio de ESE lugar, y no se junta dos veces.
      if (J.esconde && J.indicios.indexOf(J.esconde) === -1) {
        J.indicios.push(J.esconde);
        J.vioAhora = J.esconde;
        J.tension = Math.min(1, J.indicios.length / (Guion.PASOS - 1));
        Audio2.tensar(J.tension);
        var iP = J.perdidos.indexOf(J.esconde);
        if (iP !== -1) J.perdidos.splice(iP, 1);
        // Que el marcador se mueva: si no, sumar un indicio no se siente.
        elMarcador.classList.remove('suma');
        void elMarcador.offsetWidth;
        elMarcador.classList.add('suma');
      }
      Instante.apretar();
      J.errosSeguidos = 0;
      mostrarAviso('encontraste algo que no cierra', 'bien');
      Audio2.acierto();
    } else {
      J.errosSeguidos = (J.errosSeguidos || 0) + 1;
      /* Decir QUE se perdio. "Eso ya no lo vas a ver" hablaba de una cosa que
         el jugador nunca llego a ver, asi que no se referia a nada. */
      var textoFallo = (r === 'pronto' ? 'tocaste muy pronto' : 'se te pasó') +
                       ' — este lugar escondía algo y ya no vas a saber qué';
      // Se anota como perdido: al final se muestra cuantos fueron.
      if (J.esconde && J.indicios.indexOf(J.esconde) === -1 &&
          J.perdidos.indexOf(J.esconde) === -1) {
        J.perdidos.push(J.esconde);
      }
      // A la tercera seguida el juego afloja, y lo dice: que se note que es a
      // proposito y no que de golpe se volvio facil.
      if (J.errosSeguidos >= 3) {
        Instante.aflojar();
        J.errosSeguidos = 0;
        textoFallo += '  ·  te doy un poco más de tiempo';
      }
      mostrarAviso(textoFallo, 'mal');
      Audio2.fallo();
    }
    actualizarRestan();
    luego(2600, ocultarAviso);
  }

  /* Con cualquier pantalla de cierre abierta no hay nada que mirar. */
  function algunaCapaAbierta() {
    return ['final', 'sobre', 'cartaEscrita'].some(function (id) {
      var el = document.getElementById(id);
      return el && el.classList.contains('ver');
    });
  }

  function tocarInstante() {
    // Sin instante abierto no hay nada que tocar, y uno resuelto no se toca dos
    // veces: las dos guardas juntas evitan contar un indicio de mas.
    if (!mirada.activo || mirada.resuelto) return;
    Instante.tocar(mirada);
    resolverMirada();
  }
  window.addEventListener('pointerdown', function (ev) {
    /* Las cartas y los botones tienen lo suyo: acá solo el resto de la
       pantalla. El target no siempre es un elemento — puede ser el propio
       window o el document — y ahí closest no existe. */
    var el = ev.target;
    if (el && typeof el.closest === 'function' &&
        el.closest('.carta,.boton,.sonido')) return;
    // Con el cierre o la carta final en pantalla no hay nada que mirar.
    if (elCierre.classList.contains('ver')) return;
    if (algunaCapaAbierta()) return;
    tocarInstante();
  });
  window.addEventListener('keydown', function (ev) {
    if (ev.code !== 'Space' && ev.code !== 'Enter') return;
    /* Con el foco en una carta o un boton, Enter y la barra le pertenecen a ese
       control: robarselos rompe la navegacion por teclado. */
    var f = document.activeElement;
    if (f && f !== document.body && typeof f.closest === 'function' &&
        f.closest('.carta,.boton,.sonido')) return;
    if (elCierre.classList.contains('ver')) return;
    if (algunaCapaAbierta()) return;
    ev.preventDefault();
    tocarInstante();
  });

  /* ---------- dibujo ---------- */

  var anterior = performance.now();
  var sinBucle = false;

  function cuadro(ahora) {
    var dt = sinBucle ? 0 : Math.min(.05, (ahora - anterior) / 1000);
    anterior = ahora; t += dt;

    // Si la ventana cambio de tamano, reajustar antes de dibujar nada.
    if (!sinBucle && revisarTamanio()) pintarNaipes();

    Cielo.actualizar(cielo, dt);

    /* Camina hasta su marca en la direccion que sea: al cambiar la figura la
       marca se corre, y Bel se acomoda unos pasos en vez de saltar. */
    var falta = J.belMeta - J.belX;
    if (Math.abs(falta) > .004) {
      var paso2 = Math.min(Math.abs(falta), dt * .13);
      J.belX += paso2 * (falta > 0 ? 1 : -1);
      J.andando = true;
      bel.vx = falta > 0 ? 60 : -60;
    } else {
      J.andando = false;
      bel.vx = 0;
    }

    if (J.u < 1) {
      J.u = Math.min(1, J.u + dt * .42 * RITMO);
      if (J.u >= 1 && J.destino) {
        J.destello = 1;
        /* Apenas termina la mutacion, el lugar pasa a ser el destino. Antes
           esto esperaba al callback que avanza de paso — cinco segundos mas
           tarde — y en el medio se volvia a dibujar la figura vieja: se veia
           luna, faro, luna otra vez, y recien despues faro. */
        J.lugar = J.destino.figura;
        J.color = J.destino.color;
        J.destino = null;
      }
    }
    if (J.fogonazo > 0) J.fogonazo = Math.max(0, J.fogonazo - dt * .5 * RITMO);
    if (J.destello > 0) J.destello = Math.max(0, J.destello - dt * 1.5 * RITMO);

    // La tension llega despacio: un salto seco se leeria como un parpadeo.
    J.tensionSuave += (J.tension - J.tensionSuave) * (1 - Math.pow(.35, dt));
    // Y el ultimo paso tiene su propia cuenta, que sube sola.
    if (J.paso >= Guion.PASOS) J.climax = Math.min(1, J.climax + dt * .30);

    // El instante corre con la mutación, no con su propio reloj.
    var antesResuelto = mirada.resuelto;
    Instante.actualizar(mirada, J.u, dt * RITMO);
    if (!antesResuelto && mirada.resuelto) resolverMirada();

    /* El tic del anillo: cuatro golpes que se aceleran y se agudizan al
       acercarse a la marca. Es lo que permite acertar sin mirar la pantalla. */
    if (mirada.activo && !mirada.resuelto && !sinBucle) {
      var av = Instante.avanceVisible(mirada);
      var paso = Math.floor(av * 4);
      if (paso !== J.ultimoTic && paso >= 0 && paso <= 4) {
        J.ultimoTic = paso;
        Audio2.tic(av);
      }
    } else if (!mirada.activo) {
      J.ultimoTic = -1;
    }

    /* En el ultimo paso la camara se acerca. Es lo unico del juego que rompe el
       encuadre fijo, y por eso se siente que llego el final. */
    var acerca = 1 + J.climax * .12;
    if (J.climax > 0) {
      cx.save();
      cx.translate(W / 2, H * .46);
      cx.scale(acerca, acerca);
      cx.translate(-W / 2, -H * .46);
    }

    // --- cielo ---
    /* El cielo se va cargando: arranca casi negro y termina con el violeta
       subido, como si el lugar entero estuviera despierto. */
    var q3 = J.tensionSuave, cl = J.climax;
    var g = cx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgb(' + Math.round(7 + q3 * 9 + cl * 6) + ',' +
                              Math.round(8 + q3 * 4) + ',' +
                              Math.round(25 + q3 * 20 + cl * 14) + ')');
    g.addColorStop(.55, 'rgb(' + Math.round(13 + q3 * 14 + cl * 8) + ',' +
                                Math.round(13 + q3 * 6) + ',' +
                                Math.round(34 + q3 * 28 + cl * 18) + ')');
    g.addColorStop(1, 'rgb(' + Math.round(23 + q3 * 22 + cl * 14) + ',' +
                              Math.round(17 + q3 * 8) + ',' +
                              Math.round(48 + q3 * 34 + cl * 22) + ')');
    cx.fillStyle = g;
    cx.fillRect(0, 0, W, H);
    Cielo.dibujar(cx, cielo, W, H, t);

    /* En vertical la pantalla es angosta y alta: si el piso se queda abajo del
       todo, queda un tercio de escena y dos tercios de cielo vacío. */
    /* Donde cae la linea del suelo.

       No sale de un porcentaje fijo ni de umbrales de aspecto: sale de donde
       estan las cartas de verdad. Con un porcentaje, en cuanto la pantalla es
       ancha y baja la escena y la mano se pelean el mismo espacio y las cartas
       terminan tapando un tercio de la figura — y cualquier umbral que uno
       elija deja casos afuera. Midiendo la mano, la escena siempre vive arriba
       de ella y las cartas ocupan la franja del suelo, que es donde tiene
       sentido que esten: apoyadas adelante. */
    var vertical = H > W * 1.25;
    var piso = Math.min(H * (vertical ? .80 : .84), techoMano() + H * .05);

    // --- resplandor de la carta jugada ---
    if (J.fogonazo > 0) {
      var q = J.fogonazo;
      var col = J.destino ? J.destino.color : J.color;
      var r = cx.createRadialGradient(W * .56, H * .44, 0, W * .56, H * .44, H * .72);
      r.addColorStop(0, 'rgba(' + col + ',' + (.17 * q) + ')');
      r.addColorStop(1, 'rgba(' + col + ',0)');
      cx.fillStyle = r;
      cx.fillRect(0, 0, W, H);
    }

    // --- la figura, en tres capas ---
    var fx = W * (vertical ? .62 : .56);
    /* El tamaño no sale solo de la pantalla: sale del hueco que queda entre el
       texto y el piso. Midiendo contra la altura total, una pantalla ancha y
       baja hace crecer la figura hasta meterse atras del relato — que es
       exactamente lo que pasaba. Una figura terrestre ocupa 2E de alto, asi
       que E no puede pasar de la mitad de ese hueco. */
    var techoEscena = H * (vertical ? .27 : .29);
    var cabe = (piso - techoEscena) / 2;
    /* El minimo no es cosmetico: si la mano se mide antes de que el layout
       asiente, el hueco da negativo, E se va abajo de cero y el primer
       createRadialGradient tira IndexSizeError y no se dibuja nada. */
    var E = Math.max(W * .08, Math.min(vertical ? W * .36 : W * .27, cabe));
    var fy = alturaDe(J.lugar, J.destino, J.u, piso, E);
    /* Las figuras se mueven mas rapido cuanto mas descubierto esta el sueno.
       No es un efecto encima: es la misma animacion, acelerada, y por eso se
       lee como que el lugar se puso nervioso y no como un filtro. */
    var tt = t * (1 + J.tensionSuave * .85 + J.climax * .6);
    var extra = { perfil: Figuras.perfilMontania(), alPiso: piso - fy,
                  tension: J.tensionSuave };
    var u = J.u;

    // Halo propio: cada figura tine el aire que la rodea con su color.
    cx.save();
    cx.globalCompositeOperation = 'lighter';
    var gh = cx.createRadialGradient(fx, fy, E * .2, fx, fy, E * (1.9 + J.tensionSuave * .5));
    gh.addColorStop(0, 'rgba(' + J.color + ',' + (.055 + J.tensionSuave * .075 + J.climax * .06).toFixed(3) + ')');
    gh.addColorStop(1, 'rgba(' + J.color + ',0)');
    cx.fillStyle = gh;
    cx.beginPath(); cx.arc(fx, fy, E * 1.9, 0, 6.2832); cx.fill();
    cx.restore();

    if (u >= 1) {
      Pintores.pintar(cx, J.lugar, fx, fy, E, tt, extra);
    } else {
      var aSale = 1 - Math.min(1, u / .26);
      var aPiezas = Math.min(1, Math.min(u / .16, (1 - u) / .18));
      var aEntra = Math.max(0, (u - .70) / .30);

      if (aSale > .01) {
        cx.save(); cx.globalAlpha = aSale;
        Pintores.pintar(cx, J.lugar, fx, fy, E, tt, extra);
        cx.restore();
      }
      if (aPiezas > .01 && J.pares) {
        var cc = J.destino ? mezclarColor(J.color, J.destino.color, u) : J.color;
        cx.save(); cx.globalAlpha = aPiezas;
        Figuras.dibujar(cx, J.pares, u, fx, fy, E, cc, t);
        cx.restore();
      }
      if (aEntra > .01 && J.destino) {
        cx.save(); cx.globalAlpha = aEntra;
        Pintores.pintar(cx, J.destino.figura, fx, fy, E, tt, extra);
        cx.restore();
      }
    }

    // Golpe de luz en el momento en que la cosa nueva termina de aparecer.
    if (J.destello > 0) {
      var q2 = J.destello * J.destello;
      cx.save();
      cx.globalCompositeOperation = 'lighter';
      var gd = cx.createRadialGradient(fx, fy, 0, fx, fy, E * 2.4);
      gd.addColorStop(0, 'rgba(255,250,235,' + (.26 * q2) + ')');
      gd.addColorStop(.45, 'rgba(' + J.color + ',' + (.14 * q2) + ')');
      gd.addColorStop(1, 'rgba(255,250,235,0)');
      cx.fillStyle = gd;
      cx.beginPath(); cx.arc(fx, fy, E * 2.4, 0, 6.2832); cx.fill();
      cx.restore();
    }

    // El instante va sobre la figura: es lo que hay que mirar.
    J.ultimaFy = fy;
    Instante.dibujar(cx, mirada, t);

    // --- suelo ---
    /* El suelo no arranca con un color propio: arranca transparente y se va
       oscureciendo. Con un color opaco el brillo saltaba de golpe en la linea
       del horizonte y el cuadro se partia en dos mitades. */
    var s = cx.createLinearGradient(0, piso, 0, H);
    s.addColorStop(0, 'rgba(7,5,16,0)');
    s.addColorStop(.22, 'rgba(7,5,16,.34)');
    s.addColorStop(.60, 'rgba(6,4,14,.72)');
    s.addColorStop(1, 'rgba(4,3,11,.92)');
    cx.fillStyle = s;
    cx.fillRect(0, piso, W, H - piso);

    /* El reflejo de la figura sobre el piso: la misma figura espejada, muy
       tenue y desdibujada. Es lo que hace que el suelo deje de ser una franja
       negra y pase a ser un lugar. */
    if (u >= 1) {
      cx.save();
      cx.beginPath(); cx.rect(0, piso, W, H - piso); cx.clip();
      cx.globalAlpha = .10;
      cx.translate(0, piso * 2);
      cx.scale(1, -1);
      cx.filter = 'blur(2px)';
      Pintores.pintar(cx, J.lugar, fx, fy, E, t, extra);
      cx.filter = 'none';
      cx.restore();
    }

    // Niebla baja: dos bandas lentas que se cruzan sobre la linea del piso.
    cx.save();
    cx.globalCompositeOperation = 'lighter';
    for (var nb = 0; nb < 2; nb++) {
      var desliz = ((t * (.008 + nb * .005)) % 1) * W * 2 - W * .5;
      var gn = cx.createLinearGradient(0, piso - E * .16, 0, piso + E * .10);
      gn.addColorStop(0, 'rgba(150,150,200,0)');
      gn.addColorStop(.5, 'rgba(150,150,200,' + (.030 - nb * .010) + ')');
      gn.addColorStop(1, 'rgba(150,150,200,0)');
      cx.fillStyle = gn;
      cx.beginPath();
      cx.ellipse(desliz, piso - E * .03, W * .75, E * .13, 0, 0, 6.2832);
      cx.fill();
    }
    cx.restore();

    /* La linea del horizonte no es una linea: es una banda que se enciende en
       el medio y se apaga a los costados. Un trazo de un pixel de lado a lado
       corta el cuadro en dos mitades y se lee como el borde de un recuadro,
       no como el suelo de un lugar. */
    var gh2 = cx.createLinearGradient(0, 0, W, 0);
    gh2.addColorStop(0, 'rgba(180,160,220,0)');
    gh2.addColorStop(.28, 'rgba(180,160,220,.10)');
    gh2.addColorStop(.55, 'rgba(190,172,230,.16)');
    gh2.addColorStop(.82, 'rgba(180,160,220,.08)');
    gh2.addColorStop(1, 'rgba(180,160,220,0)');
    cx.fillStyle = gh2;
    cx.fillRect(0, piso, W, 1.2);

    /* Y la penumbra de donde salen las cartas. Sin esto la mano aparece
       recortada contra el suelo: se ve donde termina el dibujo y empieza el
       HTML. Con la penumbra, las cartas emergen de la sombra. */
    var techoCartas = techoMano();
    var gp2 = cx.createLinearGradient(0, techoCartas - H * .13, 0, H);
    gp2.addColorStop(0, 'rgba(4,3,10,0)');
    gp2.addColorStop(.45, 'rgba(4,3,10,.30)');
    gp2.addColorStop(1, 'rgba(4,3,10,.72)');
    cx.fillStyle = gp2;
    cx.fillRect(0, techoCartas - H * .13, W, H - techoCartas + H * .13);

    // --- Bel ---
    /* Donde se planta Bel: siempre entre el borde izquierdo del cuadro y el de
       la figura, mas cerca de la figura cuanto mas grande sea lo que mira.
       Medida contra la figura sola le queda encima; contra el ancho de la
       pantalla sola, en la otra punta. */
    var lejania = LEJANIA[J.lugar] === undefined ? .26 : LEJANIA[J.lugar];
    var bordeFigura = fx - E;
    var metaCalculada = Math.max(
      W * lejania * .62,                    // nunca pegada al borde
      Math.min(bordeFigura * .55, bordeFigura - E * .30)
    ) / W;
    if (Math.abs(J.belMeta - metaCalculada) > .004) J.belMeta = metaCalculada;
    var belPantalla = W * J.belX;
    // Siempre de cara a lo que esta mirando, camine hacia donde camine.
    bel.mirando = (fx >= belPantalla) ? 1 : -1;
    var altura = (piso - fy) / Math.max(1, piso);
    var objetivoAlza = Math.max(0, Math.min(1, (altura - .12) * 1.9));
    // En modo captura dt es 0 y la interpolación no avanzaría nunca.
    if (sinBucle) bel.alza = objetivoAlza;
    else bel.alza += (objetivoAlza - bel.alza) * (1 - Math.pow(.02, dt));

    // Sombra bajo Bel: sin esto flota sobre la linea del piso.
    var altoBel = H * (vertical ? .20 : .255);
    cx.save();
    var gs = cx.createRadialGradient(belPantalla, piso, 0,
                                     belPantalla, piso, altoBel * .30);
    gs.addColorStop(0, 'rgba(0,0,0,.42)');
    gs.addColorStop(1, 'rgba(0,0,0,0)');
    cx.fillStyle = gs;
    cx.beginPath();
    cx.ellipse(belPantalla, piso, altoBel * .30, altoBel * .045, 0, 0, 6.2832);
    cx.fill();
    cx.restore();

    /* Las cartas se alinean con el centro de la escena, no con el de la
       pantalla. Bel esta a la izquierda de la figura, asi que el conjunto queda
       corrido: centrar la mano en W/2 la deja visiblemente desfasada respecto
       de lo que se esta mirando.

       Va aca y no antes porque necesita `belPantalla` ya calculada: mas arriba
       vale undefined, el centro da NaN, y la comparacion contra NaN siempre es
       falsa — el centrado no se aplicaba nunca y no habia error que lo delatara.

       Se escribe solo cuando cambia de verdad: tocar el style en cada cuadro
       obliga al navegador a recalcular el layout sesenta veces por segundo. */
    /* Con la MARCA de Bel, no con donde esta parada ahora: mientras entra
       caminando su posicion cambia cuadro a cuadro y la mano se deslizaba con
       ella. Y el corrimiento se aplica a medias — centrar del todo contra la
       escena deja las cartas visiblemente corridas de la pantalla, que es lo
       primero que ve el ojo. */
    var centroEscena = (J.belMeta * W + fx + E) / 2;
    var corrimiento = Math.round((centroEscena - W / 2) * .5);
    if (isFinite(corrimiento) && Math.abs(corrimiento - J.corrimientoMano) > 1) {
      J.corrimientoMano = corrimiento;
      elMano.style.transform = 'translateX(' + corrimiento + 'px)';
    }

    Bel.actualizar(bel, dt, J.andando);
    var luzEncima = 1 + J.fogonazo * .34;
    var escalaBel = (H * (vertical ? .20 : .255)) / 176;
    Bel.dibujar(cx, bel, belPantalla, piso, escalaBel, luzEncima);

    if (J.climax > 0) cx.restore();

    /* Vineteado: oscurece las esquinas y empuja la vista al centro. Va al
       final, sobre todo lo demas, incluido Bel. */
    var vin = cx.createRadialGradient(W * .5, H * .48, Math.min(W, H) * .30,
                                      W * .5, H * .48, Math.max(W, H) * .78);
    vin.addColorStop(0, 'rgba(0,0,0,0)');
    vin.addColorStop(1, 'rgba(0,0,0,.42)');
    cx.fillStyle = vin;
    cx.fillRect(0, 0, W, H);

    /* Y los bordes de arriba y abajo se apagan. Es lo que hace que el cuadro
       no termine en un canto: la imagen se disuelve en vez de cortarse. */
    var gArr = cx.createLinearGradient(0, 0, 0, H * .16);
    gArr.addColorStop(0, 'rgba(3,3,9,.62)');
    gArr.addColorStop(1, 'rgba(3,3,9,0)');
    cx.fillStyle = gArr;
    cx.fillRect(0, 0, W, H * .16);

    var gAba = cx.createLinearGradient(0, H * .84, 0, H);
    gAba.addColorStop(0, 'rgba(3,3,9,0)');
    gAba.addColorStop(1, 'rgba(3,3,9,.55)');
    cx.fillStyle = gAba;
    cx.fillRect(0, H * .84, W, H * .16);

    if (!sinBucle) requestAnimationFrame(cuadro);
  }
  requestAnimationFrame(cuadro);

  /* ---------- sonido ---------- */

  var elSonido = document.getElementById('sonido');
  var elSonidoIcono = document.getElementById('sonidoIcono');
  function pintarSonido() {
    var on = Audio2.activo();
    elSonido.setAttribute('aria-pressed', on ? 'true' : 'false');
    elSonidoIcono.textContent = on ? '♫' : '♪';
    elSonido.title = on ? 'Silenciar' : 'Con sonido';
  }
  elSonido.addEventListener('click', function () {
    Audio2.alternar();
    pintarSonido();
  });

  var elVol = document.getElementById('vol');
  elVol.addEventListener('input', function () {
    var v = elVol.value / 100;
    // Mover el volumen desde cero tambien prende el sonido: si no, el control
    // parece roto.
    if (v > 0 && !Audio2.activo()) { Audio2.prender(); pintarSonido(); }
    Audio2.ponerVolumen(v);
  });
  document.getElementById('empezar').addEventListener('click', function () {
    // El primer gesto del usuario es la única oportunidad de arrancar el audio.
    Audio2.prender();
    pintarSonido();
    empezar();
  });
  pintarSonido();

  /* ---------- herramientas de revisión ---------- */

  window.capturar = function (nombre) {
    return fetch('/_captura/' + nombre + '.png',
      { method: 'POST', body: cv.toDataURL('image/png') });
  };

  window.instante = function (figura, nombre, opciones) {
    opciones = opciones || {};
    if (figura) { J.lugar = figura; J.u = 1; J.destino = null; }
    if (opciones.destino) {
      J.pares = Figuras.preparar(J.lugar, opciones.destino);
      J.destino = { figura: opciones.destino, color: opciones.color || '200,200,255' };
      J.u = opciones.u === undefined ? .5 : opciones.u;
      J.fogonazo = 1 - J.u;
    }
    /* Con dt=0 el destello y el fallo del instante no decaen nunca y quedan
       pintados encima de la captura. Se limpian salvo que se pidan. */
    if (!opciones.conInstante) {
      mirada.activo = false; mirada.destello = 0; mirada.fallo = 0;
    }
    J.belX = (opciones.belX !== undefined) ? opciones.belX : J.belMeta;
    if (opciones.t !== undefined) t = opciones.t;
    if (opciones.tension !== undefined) {
      J.tension = J.tensionSuave = opciones.tension;
    }
    if (opciones.climax !== undefined) J.climax = opciones.climax;
    if (opciones.empuje !== undefined) bel.empuje = opciones.empuje;
    if (opciones.asombro !== undefined) bel.asombro = opciones.asombro;
    // El modo captura tambien reajusta: si no, una captura tras un resize sale
    // con el tamano viejo y parece un bug del dibujo.
    if (revisarTamanio()) pintarNaipes();
    sinBucle = true;
    cuadro(performance.now());
    sinBucle = false;
    return nombre ? window.capturar(nombre) : Promise.resolve({ status: 200 });
  };

  /* Devuelve la mano que se repartiria en un paso dado, sin jugar nada. Es la
     unica forma de comprobar el reparto sin depender de los tiempos. */
  window.manoDe = function (paso, lugar) {
    var pasoAntes = J.paso, lugarAntes = J.lugar, vistosAntes = J.visitados;
    J.paso = paso === undefined ? 0 : paso;
    J.lugar = lugar || Guion.ARRANQUE;
    J.visitados = {};
    var m = repartir(3);
    J.paso = pasoAntes; J.lugar = lugarAntes; J.visitados = vistosAntes;
    return m;
  };

  /* Estado interno, para poder verificar sin adivinar por captura. */
  window.estadoJuego = function () {
    return {
      paso: J.paso, lugar: J.lugar, belX: +J.belX.toFixed(4),
      belMeta: +J.belMeta.toFixed(4), andando: J.andando,
      indicios: J.indicios.length, perdidos: J.perdidos.length,
      u: +J.u.toFixed(3), jugando: J.jugando
    };
  };

  /* Comprueba que cada figura quede donde tiene que quedar. */
  window.verificarBases = function () {
    var vertical = H > W * 1.25;
    var piso = Math.min(H * (vertical ? .80 : .84), techoMano() + H * .05);
    var E = Math.max(W * .08, Math.min(vertical ? W * .36 : W * .27,
                     (piso - H * (vertical ? .27 : .29)) / 2));
    var mal = [];
    Object.keys(Figuras.CATALOGO).forEach(function (k) {
      var fy = alturaDe(k, null, 1, piso, E);
      var b = BASES[k];
      var apoya = (b !== null && b !== undefined);
      var borde = apoya ? fy + E * b : fy + E;
      if (apoya && Math.abs(borde - piso) > 1.5) mal.push(k + ' no apoya');
      if (!apoya && borde >= piso - 1) mal.push(k + ' deberia volar y toca el piso');
    });
    return { total: Object.keys(Figuras.CATALOGO).length, mal: mal, ok: !mal.length };
  };

  /* Fuerza el resultado del instante sin depender del reloj del navegador: con
     la pestaña oculta la mutación no avanza y no habría forma de probarlo. */
  window.forzarMirada = function (acierta) {
    if (!mirada.activo || mirada.resuelto) return 'no habia instante activo';
    mirada.resuelto = true;
    mirada.resultado = acierta ? 'clavado' : 'tarde';
    if (acierta) mirada.destello = 1; else mirada.fallo = 1;
    resolverMirada();
    return mirada.resultado;
  };

  /* Juega una partida entera a velocidad acelerada. `mirar` decide si acierta
     el instante en cada paso: puede ser un booleano o una función. */
  var pruebaEnCurso = null;

  window.pruebaPartida = function (opciones) {
    opciones = opciones || {};
    /* Si quedo una prueba anterior dando vueltas — el tool que la lanzo corto
       antes de que terminara, por ejemplo — hay que matarla: dos pruebas a la
       vez se pisan el RITMO y la segunda corre a velocidad normal. */
    if (pruebaEnCurso) { clearInterval(pruebaEnCurso); pruebaEnCurso = null; }
    var elegir = opciones.elegir || function () { return 0; };
    var mirar = opciones.mirar === undefined ? false : opciones.mirar;
    RITMO = opciones.ritmo || 60;
    var errores = [];
    var previo = window.onerror;
    window.onerror = function (m) { errores.push(String(m)); };

    return new Promise(function (resolver) {
      // Estado limpio.
      frenarRelojes();
      document.getElementById('portada').classList.add('ido');
      J.paso = 0; J.lugar = Guion.ARRANQUE; J.visitados = {};
      J.jugando = false;
      J.tension = 0; J.tensionSuave = 0; J.climax = 0;
      J.recorrido = [Guion.ARRANQUE]; J.indicios = []; J.perdidos = [];
      J.esconde = null; J.vioAhora = null;
      J.mazo = Guion.CARTAS.map(function (c) { return c.clave; });
      J.jugadas = []; J.u = 1; J.destino = null;
      mirada.activo = false; mirada.resuelto = false;
      elCierre.classList.remove('ver');
      elMano.innerHTML = '';
      llegar(true);

      var vueltas = 0, jugados = 0;
      var reloj = pruebaEnCurso = setInterval(function () {
        vueltas++;
        if (vueltas > 6000) { cerrar('agoto el tiempo'); return; }
        if (elCierre.classList.contains('ver')) { cerrar(null); return; }

        // Si hay un instante abierto, resolverlo como pida la prueba.
        if (mirada.activo && !mirada.resuelto) {
          var quiere = (typeof mirar === 'function') ? mirar(jugados) : mirar;
          if (quiere) window.forzarMirada(true);
        }

        var cartas = elMano.classList.contains('fuera')
          ? [] : elMano.querySelectorAll('.carta');
        if (cartas.length && J.u >= 1) {
          jugados++;
          var i = Math.min(cartas.length - 1,
                           Math.max(0, elegir(jugados - 1, cartas.length)));
          cartas[i].click();
        }
      }, 8);

      function cerrar(motivo) {
        clearInterval(reloj);
        if (pruebaEnCurso === reloj) pruebaEnCurso = null;
        RITMO = 1;
        window.onerror = previo;
        resolver({
          pasos: J.paso,
          recorrido: J.recorrido.slice(),
          indicios: J.indicios.length,
          jugadas: J.jugadas.slice(),
          cierre: elCierre.classList.contains('ver'),
          textoCierre: (elCierre.textContent || '').slice(0, 80),
          // La cama solo puede ser el ultimo eslabon del recorrido.
          camaTemprana: J.recorrido.slice(0, -1).indexOf('cama') !== -1,
          errores: errores,
          motivo: motivo
        });
      }
    });
  };

  /* Corre muchas partidas y resume: variedad de recorridos y si la cama se
     coló antes de tiempo. */
  window.simularMuchas = function (n, opciones) {
    n = n || 50;
    var vistos = {}, camas = 0, fallos = 0, errores = 0, indicios = [];
    var i = 0;
    function una() {
      if (i >= n) {
        var suma = indicios.reduce(function (a, b) { return a + b; }, 0);
        return Promise.resolve({
          partidas: n,
          recorridosDistintos: Object.keys(vistos).length,
          camaTemprana: camas,
          sinCierre: fallos,
          conErrores: errores,
          indiciosProm: indicios.length ? +(suma / indicios.length).toFixed(2) : 0
        });
      }
      i++;
      var op = { elegir: function () { return Math.floor(Math.random() * 3); } };
      if (opciones) {
        Object.keys(opciones).forEach(function (k) { op[k] = opciones[k]; });
      }
      return window.pruebaPartida(op).then(function (p) {
        vistos[p.recorrido.join('>')] = true;
        if (p.camaTemprana) camas++;
        if (!p.cierre) fallos++;
        if (p.errores.length) errores++;
        indicios.push(p.indicios);
        return una();
      });
    }
    return una();
  };

  /* Dibuja un cuadro de cada figura y de cada etapa de una mutacion, y avisa
     si alguno rompe. Hace falta porque con la pestaña oculta requestAnimationFrame
     da cero frames: las partidas simuladas pasan sin dibujar nunca, y un error
     de dibujo se cuela hasta la pantalla del jugador sin que nada lo note. */
  window.verificarDibujo = function () {
    var fallos = [];
    var previo = window.onerror;
    Object.keys(Figuras.CATALOGO).forEach(function (k) {
      try { window.instante(k, null, { t: 2 }); }
      catch (e) { fallos.push(k + ': ' + e.message); }
    });
    // Y una mutacion en curso, que es cuando se dibuja el instante.
    [0, .25, .5, .75, .99].forEach(function (u) {
      try {
        window.instante('montania', null, { t: 2, destino: 'platillo', u: u });
        Instante.arrancar(mirada, W * .5, H * .4, 90);
        mirada.u = u;
        window.instante('montania', null, { t: 2, destino: 'platillo', u: u });
      } catch (e) { fallos.push('mutacion u=' + u + ': ' + e.message); }
    });
    mirada.activo = false;
    window.onerror = previo;
    return { figuras: Object.keys(Figuras.CATALOGO).length, fallos: fallos, ok: !fallos.length };
  };

  /* Recorre lugares y cartas y avisa si falta algo. */
  window.auditar = function () {
    var faltan = [], sinPintor = [], sinBase = [], cartasACama = [];
    Object.keys(Guion.LUGARES).forEach(function (k) {
      var l = Guion.LUGARES[k];
      if (!Figuras.CATALOGO[k]) faltan.push('figura inexistente: ' + k);
      if (!l.nombre) faltan.push(k + ' sin nombre');
      if (!l.llegada) faltan.push(k + ' sin llegada');
      if (!l.vuelta) faltan.push(k + ' sin vuelta');
      if (!l.esconde) faltan.push(k + ' sin esconde');
      if (!l.revela || !Guion.LUGARES[l.revela]) faltan.push(k + ' revela mal: ' + l.revela);
    });
    Guion.CARTAS.forEach(function (c) {
      if (!c.accion) faltan.push('carta ' + c.clave + ' sin accion');
      if (!c.lectura) faltan.push('carta ' + c.clave + ' sin lectura');
      if (c.figura === 'cama') cartasACama.push(c.clave);
      if (!c.revela && !Guion.LUGARES[c.figura]) {
        faltan.push('carta ' + c.clave + ' apunta a ' + c.figura);
      }
    });
    Object.keys(Figuras.CATALOGO).forEach(function (k) {
      if (!Pintores.PINTORES[k] && k !== 'montania') sinPintor.push(k);
      if (!(k in BASES)) sinBase.push(k);
    });
    // Toda combinación carta x lugar tiene que dar una figura que exista.
    var combinacionesMal = [];
    Object.keys(Guion.LUGARES).forEach(function (k) {
      Guion.CARTAS.forEach(function (c) {
        var d = Guion.destino(c.clave, k);
        if (!d || !Guion.LUGARES[d]) combinacionesMal.push(c.clave + '@' + k + '->' + d);
      });
    });
    return {
      lugares: Object.keys(Guion.LUGARES).length,
      cartas: Guion.CARTAS.length,
      figuras: Object.keys(Figuras.CATALOGO).length,
      faltan: faltan, sinPintor: sinPintor, sinBase: sinBase,
      cartasACama: cartasACama, combinacionesMal: combinacionesMal,
      ok: !faltan.length && !sinPintor.length && !sinBase.length &&
          !cartasACama.length && !combinacionesMal.length
    };
  };
})();
