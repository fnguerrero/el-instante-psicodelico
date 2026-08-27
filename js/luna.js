/* La luna de esta noche, de verdad.
   Versión compacta: alcanza con la longitud del Sol y de la Luna para sacar la
   fase y el signo. Serie lunar ELP-2000 truncada (Meeus cap. 47) y Sol por la
   fórmula de precisión reducida del cap. 25, que da mejor de 0.01°.
   La fase decide qué atracciones están abiertas, así que cambia cada noche. */
var Luna = (function () {
  'use strict';

  var D2R = Math.PI / 180;
  function norm360(x) { x = x % 360; return x < 0 ? x + 360 : x; }
  function sind(x) { return Math.sin(x * D2R); }
  function cosd(x) { return Math.cos(x * D2R); }

  function julianDay(y, m, d, horas) {
    horas = horas || 0;
    if (m <= 2) { y -= 1; m += 12; }
    var a = Math.floor(y / 100);
    var b = 2 - a + Math.floor(a / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1))
      + d + b - 1524.5 + horas / 24;
  }

  /* Términos principales de la serie de longitud lunar: [D, M, M', F, coef].
     Con estos treinta el error queda muy por debajo del grado, que es todo lo
     que hace falta para saber la fase y en qué signo está. */
  var TERMINOS = [
    [0,0,1,0,6288774],[2,0,-1,0,1274027],[2,0,0,0,658314],[0,0,2,0,213618],
    [0,1,0,0,-185116],[0,0,0,2,-114332],[2,0,-2,0,58793],[2,-1,-1,0,57066],
    [2,0,1,0,53322],[2,-1,0,0,45758],[0,1,-1,0,-40923],[1,0,0,0,-34720],
    [0,1,1,0,-30383],[2,0,0,-2,15327],[0,0,1,2,-12528],[0,0,1,-2,10980],
    [4,0,-1,0,10675],[0,0,3,0,10034],[4,0,-2,0,8548],[2,1,-1,0,-7888],
    [2,1,0,0,-6766],[1,0,-1,0,-5163],[1,1,0,0,4987],[2,-1,1,0,4036],
    [2,0,2,0,3994],[4,0,0,0,3861],[2,0,-3,0,3665],[0,1,-2,0,-2689],
    [2,0,-1,2,-2602],[2,-1,-2,0,2390],[1,0,1,0,-2348],[2,-2,0,0,2236]
  ];

  function longitudLuna(jde) {
    var T = (jde - 2451545.0) / 36525.0;
    var Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + Math.pow(T, 3) / 538841;
    var D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T;
    var M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T;
    var Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T;
    var F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T;
    var E = 1 - 0.002516 * T - 0.0000074 * T * T;
    var A1 = 119.75 + 131.849 * T, A2 = 53.09 + 479264.290 * T;

    var suma = 0;
    for (var i = 0; i < TERMINOS.length; i++) {
      var r = TERMINOS[i];
      var arg = r[0] * D + r[1] * M + r[2] * Mp + r[3] * F;
      var ecc = Math.abs(r[1]) === 1 ? E : (Math.abs(r[1]) === 2 ? E * E : 1);
      suma += r[4] * ecc * sind(arg);
    }
    suma += 3958 * sind(A1) + 1962 * sind(Lp - F) + 318 * sind(A2);
    return norm360(Lp + suma / 1000000);
  }

  function longitudSol(jde) {
    var T = (jde - 2451545.0) / 36525.0;
    var L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    var M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    var C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * sind(M)
      + (0.019993 - 0.000101 * T) * sind(2 * M)
      + 0.000289 * sind(3 * M);
    return norm360(L0 + C);
  }

  var SIGNOS = ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo',
    'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'];
  var GLIFOS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
  var ELEMENTOS = ['fuego', 'tierra', 'aire', 'agua'];

  /* Nombre de la fase según la elongación, con los cortes que se usan siempre. */
  function nombreFase(elong) {
    if (elong < 22.5 || elong >= 337.5) return 'luna nueva';
    if (elong < 67.5) return 'creciente';
    if (elong < 112.5) return 'cuarto creciente';
    if (elong < 157.5) return 'gibosa creciente';
    if (elong < 202.5) return 'luna llena';
    if (elong < 247.5) return 'gibosa menguante';
    if (elong < 292.5) return 'cuarto menguante';
    return 'menguante';
  }

  /* Estado de la luna en una fecha. Sin argumento, ahora mismo. */
  function estado(fecha) {
    var f = fecha || new Date();
    var jd = julianDay(f.getUTCFullYear(), f.getUTCMonth() + 1, f.getUTCDate(),
      f.getUTCHours() + f.getUTCMinutes() / 60);
    // ΔT ronda los 70 s en estas décadas: para la fase es despreciable, pero
    // se aplica igual porque no cuesta nada.
    var jde = jd + 70 / 86400;
    var ll = longitudLuna(jde), ls = longitudSol(jde);
    var elong = norm360(ll - ls);
    var iluminacion = (1 - cosd(elong)) / 2;
    var signo = Math.floor(ll / 30);
    return {
      jd: jd,
      longitud: ll,
      longitudSol: ls,
      elongacion: elong,
      iluminacion: iluminacion,
      creciente: elong < 180,
      fase: nombreFase(elong),
      signo: signo,
      signoNombre: SIGNOS[signo],
      signoGlifo: GLIFOS[signo],
      elemento: ELEMENTOS[signo % 4],
      grado: ll - signo * 30,
      // Los treinta días del ciclo, para elegir variantes con algo estable.
      diaLunar: Math.floor(elong / 360 * 29.53)
    };
  }

  function texto(e) {
    var g = Math.floor(e.grado);
    var m = Math.floor((e.grado - g) * 60);
    return e.fase + ' · ' + g + '°' + (m < 10 ? '0' : '') + m + "' " + e.signoGlifo +
      ' ' + e.signoNombre;
  }

  return {
    julianDay: julianDay,
    longitudLuna: longitudLuna,
    longitudSol: longitudSol,
    estado: estado,
    texto: texto,
    SIGNOS: SIGNOS, GLIFOS: GLIFOS
  };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = Luna; }
