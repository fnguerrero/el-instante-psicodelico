/* Bel: el personaje, dibujado y animado con código.

   Proporciones de figurín: la cabeza entra unas siete veces y media en el alto,
   y las piernas se llevan más de la mitad. Eso es lo que estiliza una silueta;
   con cabeza grande y piernas cortas queda infantil por más que se afinen las
   líneas.

   La caminata va lenta a propósito: paso largo, cadencia baja, cadera que
   bascula y brazos sueltos. Un ciclo rápido se lee como trotecito. */
var Bel = (function () {
  'use strict';

  var PIEL = '#e3b58c';
  var PIEL_SOMBRA = '#c08f65';
  var PELO = '#241a20';
  var PELO_LUZ = '#463039';
  var ABRIGO = '#4a3250';
  var ABRIGO_LUZ = '#654472';
  var ABRIGO_OSCURO = '#2c1e35';
  var PANTALON = '#241d2e';
  var BOTA = '#181220';
  var BUFANDA = '#c0303f';
  var BUFANDA_OSCURA = '#8e2029';
  var LABIO = '#b8323f';

  function crear(x, y) {
    return {
      x: x, y: y,
      vx: 0,
      mirando: 1,
      paso: 0,
      quieto: 0,
      alto: 176,
      pose: 'camina',
      // Cuanto levanta la cabeza para mirar algo que esta arriba (0 a 1).
      alza: 0,
      // Empuje de la onda de una transformacion: la corre y la inclina.
      empuje: 0,
      // Cuanto se echa para atras por lo que esta viendo (0 a 1).
      asombro: 0
    };
  }

  /* Cadencia baja: a velocidad de paseo el ciclo tarda cerca de un segundo y
     medio, que es lo que hace que se vea suelta y no apurada. */
  function actualizar(b, dt, andando) {
    // Lo que la empuja o la asombra vuelve a cero solo, con distinta inercia:
    // el golpe pasa rapido, la impresion tarda.
    if (b.empuje) b.empuje *= Math.pow(.06, dt);
    if (b.asombro) b.asombro *= Math.pow(.35, dt);
    if (andando) {
      b.paso += dt * Math.min(6.4, 2.4 + Math.abs(b.vx) * .017);
      b.quieto = 0;
    } else {
      b.quieto += dt;
      var resto = b.paso % Math.PI;
      if (resto > .06 && resto < Math.PI - .06) b.paso += dt * 4.2;
    }
  }

  /* (x, y) es donde apoya los pies, ya en coordenadas de pantalla. */
  function dibujar(cx, b, x, y, escala, luzAmbiente) {
    var s = (escala || 1) * (b.alto / 176);
    var A = 176 * s;
    var dir = b.mirando;
    var andando = Math.abs(b.vx) > 4;
    var f = b.paso;

    var pasoA = andando ? Math.sin(f) : 0;
    var pasoB = andando ? Math.sin(f + Math.PI) : 0;
    // Sube y baja poco: el balanceo fuerte es de caminata deportiva.
    var rebote = andando ? Math.abs(Math.cos(f)) * 1.7 * s : 0;
    var respira = !andando ? Math.sin(b.quieto * 1.5) * 1.0 * s : 0;
    // La cadera bascula al ritmo del paso; es lo que da el andar.
    var cadereo = andando ? Math.sin(f) * A * .010 : 0;
    var inclina = andando ? Math.sin(f) * .022 : 0;
    var vuelo = Math.min(1, Math.abs(b.vx) / 210);

    // Esqueleto estilizado: piernas largas, cintura alta y marcada.
    var cadera = -A * .515;
    var cintura = -A * .615;
    var hombro = -A * .805;
    var cuello = -A * .855;
    var cabezaY = -A * .930;
    var rCabeza = A * .066;
    var faldaY = cadera + A * .105;

    // Sombra fija en el piso.
    cx.save();
    cx.globalAlpha = .32;
    cx.fillStyle = '#000';
    cx.beginPath();
    cx.ellipse(x, y + 2, A * .12 - vuelo * A * .015, A * .020, 0, 0, 6.2832);
    cx.fill();
    cx.restore();

    // La onda de la transformacion la corre un poco y la echa para atras.
    var golpe = b.empuje || 0;
    var atras = (b.asombro || 0);

    cx.save();
    cx.translate(x - dir * golpe * A * .10, y - rebote + respira);
    cx.scale(dir, 1);
    cx.rotate(inclina - golpe * .10 - atras * .045);

    // ---- pierna de atrás ----
    pierna(cx, A, cadera + cadereo, pasoB, '#1c1626', '#120d18');
    // ---- brazo de atrás ----
    brazo(cx, A, hombro, -pasoB, ABRIGO_OSCURO, PIEL_SOMBRA);
    // ---- pierna de adelante ----
    pierna(cx, A, cadera + cadereo, pasoA, PANTALON, BOTA);

    // ---- abrigo ----
    // Entallado en la cintura y acampanado abajo: marca la figura en vez de
    // taparla como un tubo.
    cx.fillStyle = ABRIGO;
    cx.beginPath();
    cx.moveTo(-A * .058, hombro + A * .008);
    cx.quadraticCurveTo(-A * .050, cintura, -A * .046, cintura + A * .015);
    cx.quadraticCurveTo(-A * .070, cadera, -A * .074 - vuelo * A * .070, faldaY);
    cx.lineTo(A * .072, faldaY);
    cx.quadraticCurveTo(A * .068, cadera, A * .045, cintura + A * .015);
    cx.quadraticCurveTo(A * .050, cintura, A * .057, hombro + A * .008);
    cx.closePath();
    cx.fill();
    // Franja de luz del lado de adelante.
    cx.fillStyle = ABRIGO_LUZ;
    cx.beginPath();
    cx.moveTo(A * .057, hombro + A * .008);
    cx.quadraticCurveTo(A * .050, cintura, A * .045, cintura + A * .015);
    cx.quadraticCurveTo(A * .068, cadera, A * .072, faldaY);
    cx.lineTo(A * .030, faldaY);
    cx.quadraticCurveTo(A * .028, cadera, A * .020, cintura + A * .012);
    cx.quadraticCurveTo(A * .026, cintura, A * .028, hombro + A * .008);
    cx.closePath();
    cx.fill();
    // Cinto que marca la cintura.
    cx.fillStyle = '#2a1c30';
    cx.beginPath();
    cx.moveTo(-A * .048, cintura + A * .004);
    cx.lineTo(A * .047, cintura + A * .004);
    cx.lineTo(A * .046, cintura + A * .022);
    cx.lineTo(-A * .047, cintura + A * .022);
    cx.closePath();
    cx.fill();
    cx.fillStyle = '#c9a24a';
    cx.fillRect(A * .012, cintura + A * .007, A * .015, A * .013);

    // ---- brazo de adelante ----
    brazo(cx, A, hombro, -pasoA, ABRIGO_LUZ, PIEL);

    // ---- bufanda ----
    cx.fillStyle = BUFANDA;
    cx.beginPath();
    cx.ellipse(A * .002, cuello + A * .012, A * .046, A * .022, 0, 0, 6.2832);
    cx.fill();
    cx.fillStyle = BUFANDA_OSCURA;
    cx.beginPath();
    cx.ellipse(-A * .024, cuello + A * .014, A * .023, A * .019, 0, 0, 6.2832);
    cx.fill();
    var flamea = andando ? Math.sin(f * 1.1) * A * .009 : Math.sin(b.quieto * .9) * A * .003;
    cx.fillStyle = BUFANDA;
    cx.beginPath();
    cx.moveTo(-A * .030, cuello + A * .002);
    cx.quadraticCurveTo(-A * .082 - vuelo * A * .060, cuello + A * .040 + flamea,
                        -A * .072 - vuelo * A * .070, cuello + A * .110 + flamea);
    cx.lineTo(-A * .038, cuello + A * .094);
    cx.quadraticCurveTo(-A * .048, cuello + A * .048, -A * .008, cuello + A * .030);
    cx.closePath();
    cx.fill();

    // ---- cabeza ----
    /* Todo lo que sigue gira sobre el cuello. Es lo que hace que Bel mire
       lo que esta pasando en vez de quedarse de perfil mirando la nada. */
    cx.save();
    cx.translate(0, cuello);
    cx.rotate(-(b.alza || 0) * .46);
    cx.translate(0, -cuello);

    // Melena larga por detrás, con su propio retraso al caminar.
    var melena = andando ? Math.sin(f + .9) * A * .008 : Math.sin(b.quieto * 1.2) * A * .003;
    cx.fillStyle = PELO;
    cx.beginPath();
    cx.moveTo(-rCabeza * .25, cabezaY - rCabeza * .85);
    // Borde de atrás: baja casi recto hasta media espalda.
    cx.quadraticCurveTo(-rCabeza * 1.34, cabezaY - rCabeza * .10, -rCabeza * 1.22, cuello + A * .055);
    cx.quadraticCurveTo(-rCabeza * 1.16 + melena, cuello + A * .155,
                        -rCabeza * .96 + melena, cuello + A * .205);
    // Puntas.
    cx.quadraticCurveTo(-rCabeza * .60 + melena, cuello + A * .215,
                        -rCabeza * .46 + melena, cuello + A * .175);
    // Borde de adelante: vuelve pegado al cuello.
    cx.quadraticCurveTo(-rCabeza * .40, cuello + A * .080, -rCabeza * .40, cuello - A * .005);
    cx.quadraticCurveTo(-rCabeza * .46, cabezaY + rCabeza * .55, -rCabeza * .22, cabezaY);
    cx.closePath();
    cx.fill();
    // Mechón que cae por delante del hombro: es lo que hace que se lea lacio.
    cx.beginPath();
    cx.moveTo(rCabeza * .26, cabezaY + rCabeza * .26);
    cx.quadraticCurveTo(rCabeza * .58, cabezaY + rCabeza * 1.00, rCabeza * .44, cuello + A * .092);
    cx.quadraticCurveTo(rCabeza * .38 + melena * .5, cuello + A * .150,
                        rCabeza * .14 + melena * .5, cuello + A * .132);
    cx.quadraticCurveTo(rCabeza * .08, cuello + A * .052, -rCabeza * .04, cabezaY + rCabeza * .56);
    cx.closePath();
    cx.fill();
    // Brillo largo, siguiendo la caída.
    cx.save();
    cx.globalAlpha = .35;
    cx.fillStyle = PELO_LUZ;
    cx.beginPath();
    cx.ellipse(-rCabeza * .74, cuello + A * .020, rCabeza * .10, A * .062, .06, 0, 6.2832);
    cx.fill();
    cx.restore();

    // Cara: óvalo alargado con mentón, no un círculo.
    cx.fillStyle = PIEL;
    cx.beginPath();
    cx.moveTo(-rCabeza * .08, cabezaY - rCabeza * 1.06);
    cx.quadraticCurveTo(rCabeza * .62, cabezaY - rCabeza * 1.00, rCabeza * .70, cabezaY - rCabeza * .24);
    // Nariz: apenas un quiebre del perfil. A este tamaño cualquier bulto se
    // lee como pico, así que va casi al ras.
    cx.quadraticCurveTo(rCabeza * .70, cabezaY - rCabeza * .08, rCabeza * .665, cabezaY + rCabeza * .04);
    cx.quadraticCurveTo(rCabeza * .645, cabezaY + rCabeza * .13, rCabeza * .585, cabezaY + rCabeza * .18);
    // Labio y mentón afinado.
    cx.quadraticCurveTo(rCabeza * .70, cabezaY + rCabeza * .38, rCabeza * .48, cabezaY + rCabeza * .62);
    cx.quadraticCurveTo(rCabeza * .26, cabezaY + rCabeza * .92, -rCabeza * .16, cabezaY + rCabeza * .88);
    cx.quadraticCurveTo(-rCabeza * .74, cabezaY + rCabeza * .70, -rCabeza * .80, cabezaY - rCabeza * .10);
    cx.quadraticCurveTo(-rCabeza * .84, cabezaY - rCabeza * .82, -rCabeza * .08, cabezaY - rCabeza * 1.06);
    cx.closePath();
    cx.fill();
    // Sombra suave del lado de atrás, sin borde duro.
    var sg = cx.createLinearGradient(-rCabeza, cabezaY, rCabeza * .2, cabezaY);
    sg.addColorStop(0, PIEL_SOMBRA);
    sg.addColorStop(1, 'rgba(227,181,140,0)');
    cx.fillStyle = sg;
    cx.beginPath();
    cx.ellipse(-rCabeza * .30, cabezaY + rCabeza * .10, rCabeza * .52, rCabeza * .90, 0, 0, 6.2832);
    cx.fill();

    // Pelo. El largo de adelante es lo que enmarca: dos caídas a los costados
    // de la cara que llegan al pecho, no un casco con volumen arriba.
    dibujarPelo(cx, null, rCabeza, cabezaY, cuello, A, melena);

    // Ceja, ojo con pestaña, y labios.
    var reloj = b.quieto + b.paso * .35;
    var parpadeo = (Math.sin(reloj * .55) > .992) ? .14 : 1;
    cx.strokeStyle = '#3a2830';
    cx.lineWidth = Math.max(.8, rCabeza * .075);
    cx.lineCap = 'round';
    cx.beginPath();
    // Arco suave y alto: una ceja baja e inclinada lee como enojo.
    cx.moveTo(rCabeza * .20, cabezaY - rCabeza * .18);
    cx.quadraticCurveTo(rCabeza * .38, cabezaY - rCabeza * .30, rCabeza * .55, cabezaY - rCabeza * .16);
    cx.stroke();
    if (parpadeo > .5) {
      // Blanco, iris y brillo: así se lee un ojo abierto y con mirada.
      cx.fillStyle = '#f2e6dc';
      cx.beginPath();
      cx.ellipse(rCabeza * .38, cabezaY + rCabeza * .06, rCabeza * .125, rCabeza * .098, 0, 0, 6.2832);
      cx.fill();
      cx.fillStyle = '#3b2418';
      cx.beginPath();
      cx.ellipse(rCabeza * .42, cabezaY + rCabeza * .07, rCabeza * .074, rCabeza * .086, 0, 0, 6.2832);
      cx.fill();
      cx.fillStyle = '#140c10';
      cx.beginPath();
      cx.ellipse(rCabeza * .43, cabezaY + rCabeza * .07, rCabeza * .040, rCabeza * .048, 0, 0, 6.2832);
      cx.fill();
      cx.fillStyle = 'rgba(255,255,255,.85)';
      cx.beginPath();
      cx.ellipse(rCabeza * .46, cabezaY + rCabeza * .01, rCabeza * .024, rCabeza * .020, 0, 0, 6.2832);
      cx.fill();
    } else {
      // Cerrado: una línea curva, nada más.
      cx.strokeStyle = '#241820';
      cx.lineWidth = Math.max(.8, rCabeza * .055);
      cx.lineCap = 'round';
      cx.beginPath();
      cx.moveTo(rCabeza * .26, cabezaY + rCabeza * .05);
      cx.quadraticCurveTo(rCabeza * .41, cabezaY + rCabeza * .14, rCabeza * .52, cabezaY + rCabeza * .06);
      cx.stroke();
    }
    if (parpadeo > .5) {
      cx.strokeStyle = '#241820';
      cx.lineWidth = Math.max(.8, rCabeza * .050);
      cx.lineCap = 'round';
      cx.beginPath();
      cx.moveTo(rCabeza * .25, cabezaY - rCabeza * .055);
      cx.quadraticCurveTo(rCabeza * .41, cabezaY - rCabeza * .125, rCabeza * .52, cabezaY - rCabeza * .02);
      cx.stroke();
    }
    // Labios.
    cx.fillStyle = LABIO;
    cx.beginPath();
    cx.ellipse(rCabeza * .46, cabezaY + rCabeza * .44, rCabeza * .130, rCabeza * .068, -.16, 0, 6.2832);
    cx.fill();
    // Comisura levantada: alcanza para que no se vea seria.
    cx.strokeStyle = LABIO;
    cx.lineWidth = Math.max(.7, rCabeza * .045);
    cx.lineCap = 'round';
    cx.beginPath();
    cx.moveTo(rCabeza * .34, cabezaY + rCabeza * .47);
    cx.quadraticCurveTo(rCabeza * .28, cabezaY + rCabeza * .43, rCabeza * .26, cabezaY + rCabeza * .37);
    cx.stroke();
    // Aro: chico, a la altura de la oreja, apenas asomando bajo el pelo.
    cx.strokeStyle = '#c9a24a';
    cx.lineWidth = Math.max(.7, rCabeza * .055);
    cx.beginPath();
    cx.arc(-rCabeza * .06, cabezaY + rCabeza * .26, rCabeza * .105, -.4, 3.4);
    cx.stroke();

    cx.restore();

    // Contraluz de la feria.
    if (luzAmbiente !== false) {
      cx.save();
      cx.globalCompositeOperation = 'lighter';
      cx.translate(x, y - rebote + respira);
      cx.scale(dir, 1);
      cx.rotate(inclina);
      cx.strokeStyle = 'rgba(255,198,124,.24)';
      cx.lineWidth = Math.max(1, 1.6 * s);
      cx.beginPath();
      cx.moveTo(A * .057, hombro + A * .008);
      cx.quadraticCurveTo(A * .050, cintura, A * .045, cintura + A * .015);
      cx.quadraticCurveTo(A * .068, cadera, A * .072, faldaY);
      cx.stroke();
      cx.beginPath();
      cx.moveTo(rCabeza * .70, cabezaY - rCabeza * .24);
      cx.quadraticCurveTo(rCabeza * .74, cabezaY + rCabeza * .30, rCabeza * .48, cabezaY + rCabeza * .62);
      cx.stroke();
      cx.restore();
    }

    cx.restore();   // cierra el giro de la cabeza
  }

  /* El pelo.

     Las "caídas" largas a los dos lados terminaron tapándole la cara entera,
     así que se volvió a esta construcción: volumen sobre el cráneo, un mechón
     ancho que baja por delante de la oreja, y la melena que ya se dibujó por
     detrás. La cara queda enmarcada pero visible. */
  function dibujarPelo(cx, estilo, r, cabezaY, cuello, A, melena) {
    cx.fillStyle = PELO;

    // Casquete: exterior bien alto, interior bien adentro. La distancia entre
    // los dos bordes es el espesor, y es lo que hace que no se vea una capa fina.
    cx.beginPath();
    cx.moveTo(-r * 1.06, cabezaY + r * .34);
    cx.quadraticCurveTo(-r * 1.30, cabezaY - r * .92, -r * .12, cabezaY - r * 1.46);
    cx.quadraticCurveTo(r * .88, cabezaY - r * 1.28, r * .92, cabezaY - r * .34);
    cx.quadraticCurveTo(r * 1.00, cabezaY + r * .14, r * .62, cabezaY + r * .02);
    cx.quadraticCurveTo(r * .54, cabezaY - r * .40, r * .04, cabezaY - r * .50);
    cx.quadraticCurveTo(-r * .44, cabezaY - r * .58, -r * .62, cabezaY - r * .10);
    cx.quadraticCurveTo(-r * .78, cabezaY + r * .14, -r * 1.06, cabezaY + r * .34);
    cx.closePath();
    cx.fill();

    // Mechón que baja por delante de la oreja hasta pasada la mandíbula.
    cx.beginPath();
    cx.moveTo(-r * .34, cabezaY - r * .90);
    cx.quadraticCurveTo(-r * 1.16, cabezaY - r * .34, -r * .96, cabezaY + r * .46);
    cx.quadraticCurveTo(-r * .80, cabezaY + r * 1.02, -r * .26, cabezaY + r * 1.06);
    cx.quadraticCurveTo(-r * .44, cabezaY + r * .54, -r * .42, cabezaY + r * .04);
    cx.quadraticCurveTo(-r * .40, cabezaY - r * .48, -r * .14, cabezaY - r * .74);
    cx.closePath();
    cx.fill();

    // Brillo sobre el casquete.
    cx.save();
    cx.globalAlpha = .5;
    cx.fillStyle = PELO_LUZ;
    cx.beginPath();
    cx.ellipse(-r * .02, cabezaY - r * 1.10, r * .50, r * .12, -.12, 0, 6.2832);
    cx.fill();
    cx.restore();
  }

  /* Piernas largas, con el paso amplio y la rodilla apenas marcada. */
  function pierna(cx, A, cadera, fase, colorPierna, colorBota) {
    var largo = -cadera;                    // llega justo al piso
    var ang = fase * .40;                   // paso largo, no rápido
    var rodillaX = Math.sin(ang) * largo * .50;
    var rodillaY = cadera + Math.cos(ang * .82) * largo * .52;
    var alza = Math.max(0, Math.sin(fase)) * A * .022;
    var pieX = Math.sin(ang * 1.10) * largo;
    var pieY = cadera + Math.cos(ang * 1.10) * largo - alza;

    cx.strokeStyle = colorPierna;
    cx.lineWidth = A * .034;                // más finas que antes
    cx.lineCap = 'round';
    cx.lineJoin = 'round';
    cx.beginPath();
    cx.moveTo(0, cadera);
    cx.lineTo(rodillaX, rodillaY);
    cx.lineTo(pieX, pieY);
    cx.stroke();

    // Bota de caña, con un poco de taco.
    cx.fillStyle = colorBota;
    cx.save();
    cx.translate(pieX, pieY);
    cx.rotate(Math.sin(fase) * .10);
    cx.fillRect(-A * .015, -A * .050, A * .030, A * .050);
    cx.beginPath();
    cx.ellipse(A * .012, A * .002, A * .034, A * .015, 0, 0, 6.2832);
    cx.fill();
    cx.restore();
  }

  /* Brazos sueltos, con amplitud corta: el braceo largo es de marcha. */
  function brazo(cx, A, hombro, fase, colorManga, colorMano) {
    var largo = A * .30;
    var ang = fase * .40;
    var codoX = Math.sin(ang) * largo * .52;
    var codoY = hombro + Math.cos(ang * .9) * largo * .54;
    var manoX = Math.sin(ang * 1.25) * largo * .96;
    var manoY = hombro + Math.cos(ang * 1.05) * largo;

    cx.strokeStyle = colorManga;
    cx.lineWidth = A * .027;
    cx.lineCap = 'round';
    cx.lineJoin = 'round';
    cx.beginPath();
    cx.moveTo(0, hombro);
    cx.lineTo(codoX, codoY);
    cx.lineTo(manoX, manoY);
    cx.stroke();

    cx.fillStyle = colorMano;
    cx.beginPath();
    cx.ellipse(manoX, manoY + A * .008, A * .014, A * .019, 0, 0, 6.2832);
    cx.fill();
  }

  /* Sentada, para cuando se sube a una atracción. */
  function sentada(cx, x, y, escala, dir) {
    var s = escala || 1, A = 176 * s;
    cx.save();
    cx.translate(x, y);
    cx.scale(dir || 1, 1);

    var cadera = -A * .05, cintura = -A * .16, hombro = -A * .32;
    var cuello = -A * .375, cabezaY = -A * .455, rCabeza = A * .066;

    cx.strokeStyle = PANTALON; cx.lineWidth = A * .034;
    cx.lineCap = 'round'; cx.lineJoin = 'round';
    cx.beginPath();
    cx.moveTo(0, cadera); cx.lineTo(A * .19, cadera + A * .01); cx.lineTo(A * .21, A * .10);
    cx.stroke();
    cx.fillStyle = BOTA;
    cx.beginPath(); cx.ellipse(A * .222, A * .11, A * .034, A * .015, 0, 0, 6.2832); cx.fill();

    cx.fillStyle = ABRIGO;
    cx.beginPath();
    cx.moveTo(-A * .060, cadera);
    cx.quadraticCurveTo(-A * .044, cintura, -A * .052, hombro);
    cx.lineTo(A * .050, hombro);
    cx.quadraticCurveTo(A * .042, cintura, A * .058, cadera);
    cx.closePath(); cx.fill();
    cx.fillStyle = ABRIGO_LUZ;
    cx.beginPath();
    cx.moveTo(A * .050, hombro);
    cx.quadraticCurveTo(A * .042, cintura, A * .058, cadera);
    cx.lineTo(A * .022, cadera);
    cx.quadraticCurveTo(A * .016, cintura, A * .020, hombro);
    cx.closePath(); cx.fill();

    cx.strokeStyle = ABRIGO_LUZ; cx.lineWidth = A * .027;
    cx.beginPath();
    cx.moveTo(A * .016, hombro + A * .02); cx.lineTo(A * .128, hombro + A * .07);
    cx.stroke();
    cx.fillStyle = PIEL;
    cx.beginPath(); cx.ellipse(A * .138, hombro + A * .078, A * .014, A * .019, 0, 0, 6.2832); cx.fill();

    cx.fillStyle = BUFANDA;
    cx.beginPath(); cx.ellipse(A * .002, cuello + A * .012, A * .046, A * .022, 0, 0, 6.2832); cx.fill();
    cx.fillStyle = PELO;
    cx.beginPath();
    cx.moveTo(-rCabeza * .30, cabezaY - rCabeza * .70);
    cx.quadraticCurveTo(-rCabeza * 1.60, cabezaY + rCabeza * .40, -rCabeza * 1.20, cuello + A * .06);
    cx.quadraticCurveTo(-rCabeza * .70, cuello + A * .09, -rCabeza * .45, cuello + A * .04);
    cx.closePath(); cx.fill();
    cx.fillStyle = PIEL;
    cx.beginPath();
    cx.moveTo(-rCabeza * .08, cabezaY - rCabeza * 1.06);
    cx.quadraticCurveTo(rCabeza * .62, cabezaY - rCabeza * 1.00, rCabeza * .70, cabezaY - rCabeza * .24);
    cx.quadraticCurveTo(rCabeza * .70, cabezaY - rCabeza * .08, rCabeza * .665, cabezaY + rCabeza * .04);
    cx.quadraticCurveTo(rCabeza * .645, cabezaY + rCabeza * .13, rCabeza * .585, cabezaY + rCabeza * .18);
    cx.quadraticCurveTo(rCabeza * .70, cabezaY + rCabeza * .38, rCabeza * .48, cabezaY + rCabeza * .62);
    cx.quadraticCurveTo(rCabeza * .26, cabezaY + rCabeza * .92, -rCabeza * .16, cabezaY + rCabeza * .88);
    cx.quadraticCurveTo(-rCabeza * .74, cabezaY + rCabeza * .70, -rCabeza * .80, cabezaY - rCabeza * .10);
    cx.quadraticCurveTo(-rCabeza * .84, cabezaY - rCabeza * .82, -rCabeza * .08, cabezaY - rCabeza * 1.06);
    cx.closePath(); cx.fill();
    cx.fillStyle = PELO;
    cx.beginPath();
    cx.moveTo(-rCabeza * .84, cabezaY + rCabeza * .18);
    cx.quadraticCurveTo(-rCabeza * 1.02, cabezaY - rCabeza * .86, -rCabeza * .10, cabezaY - rCabeza * 1.16);
    cx.quadraticCurveTo(rCabeza * .70, cabezaY - rCabeza * 1.02, rCabeza * .74, cabezaY - rCabeza * .36);
    cx.quadraticCurveTo(rCabeza * .82, cabezaY - rCabeza * .16, rCabeza * .60, cabezaY - rCabeza * .20);
    cx.quadraticCurveTo(rCabeza * .58, cabezaY - rCabeza * .74, rCabeza * .12, cabezaY - rCabeza * .80);
    cx.quadraticCurveTo(-rCabeza * .42, cabezaY - rCabeza * .84, -rCabeza * .62, cabezaY - rCabeza * .26);
    cx.closePath(); cx.fill();
    cx.fillStyle = '#f2e6dc';
    cx.beginPath();
    cx.ellipse(rCabeza * .37, cabezaY - rCabeza * .04, rCabeza * .135, rCabeza * .105, 0, 0, 6.2832); cx.fill();
    cx.fillStyle = '#140c10';
    cx.beginPath();
    cx.ellipse(rCabeza * .43, cabezaY - rCabeza * .03, rCabeza * .055, rCabeza * .065, 0, 0, 6.2832); cx.fill();
    cx.fillStyle = LABIO;
    cx.beginPath();
    cx.ellipse(rCabeza * .50, cabezaY + rCabeza * .36, rCabeza * .13, rCabeza * .075, -.30, 0, 6.2832); cx.fill();
    cx.restore();
  }

  return {
    crear: crear, actualizar: actualizar, dibujar: dibujar, sentada: sentada,
    PIEL: PIEL, ABRIGO: ABRIGO, BUFANDA: BUFANDA
  };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = Bel; }
