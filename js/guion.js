/* El guion.

   Duermevela es un sueño de Bel. En el sueño las cosas no se quedan quietas:
   muestran lo que son cuando ella las mira con la carta justa.

   Ocho escenas en fila. En cada una te reparten tres cartas del mazo, jugás
   una, y esa carta transforma lo que hay delante. La carta se gasta. Con
   catorce cartas y ocho escenas sobran seis: eso es lo que mantiene la
   elección viva hasta el final y hace que dos partidas no sean iguales.

   La Estrella es la carta del don, y es la única sin figura propia: revela lo
   que esa escena era en realidad, distinto en cada una. */
var Guion = (function () {
  'use strict';

  /* ============ el mazo ============ */

  /* figura   en qué convierte lo que haya delante
     revela   si es true, la figura la pone la escena
     tono     'luz' | 'sombra' — se usa para el cierre y para cómo reacciona Bel
     color    tiñe el fogonazo de la transformación */
  var CARTAS = [
    { clave: 'estrella', num: 'XVII', nombre: 'La Estrella', glifo: '✶',
      revela: true, tono: 'luz', color: '170,205,255',
      lectura: 'Ver lo que hay debajo.' },
    { clave: 'torre', num: 'XVI', nombre: 'La Torre', glifo: '⚡',
      figura: 'ruina', tono: 'sombra', color: '255,150,120',
      lectura: 'Lo mal armado se cae.' },
    { clave: 'luna', num: 'XVIII', nombre: 'La Luna', glifo: '☾',
      figura: 'luna', tono: 'sombra', color: '220,215,255',
      lectura: 'Lo lejano se acerca.' },
    { clave: 'sol', num: 'XIX', nombre: 'El Sol', glifo: '☀',
      figura: 'casa', tono: 'luz', color: '255,205,130',
      lectura: 'Se prende la luz.' },
    { clave: 'muerte', num: 'XIII', nombre: 'La Muerte', glifo: '⚱',
      figura: 'arbol', tono: 'sombra', color: '160,220,170',
      lectura: 'Termina algo y arranca otra cosa.' },
    { clave: 'loco', num: '0', nombre: 'El Loco', glifo: '✧',
      figura: 'puerta', tono: 'luz', color: '255,220,160',
      lectura: 'Aparece una salida.' },
    { clave: 'enamorados', num: 'VI', nombre: 'Los Enamorados', glifo: '☍',
      figura: 'bandada', tono: 'luz', color: '230,190,220',
      lectura: 'No estabas sola.' },
    { clave: 'mundo', num: 'XXI', nombre: 'El Mundo', glifo: '◎',
      figura: 'cama', tono: 'luz', color: '200,190,240',
      lectura: 'Todo vuelve al lugar del que salió.' },
    { clave: 'rueda', num: 'X', nombre: 'La Rueda', glifo: '☸',
      figura: 'calesita', tono: 'luz', color: '255,190,150',
      lectura: 'Da la vuelta y vuelve a empezar.' },
    { clave: 'ermitano', num: 'IX', nombre: 'El Ermitaño', glifo: '⚹',
      figura: 'faro', tono: 'luz', color: '255,232,170',
      lectura: 'Una luz sola, a lo lejos.' },
    { clave: 'sacerdotisa', num: 'II', nombre: 'La Sacerdotisa', glifo: '☽',
      figura: 'laguna', tono: 'sombra', color: '150,175,230',
      lectura: 'Lo que sabés y no sabés cómo.' },
    { clave: 'templanza', num: 'XIV', nombre: 'La Templanza', glifo: '⚗',
      figura: 'barca', tono: 'luz', color: '170,215,215',
      lectura: 'Pasar de un lado al otro, sin apuro.' },
    { clave: 'colgado', num: 'XII', nombre: 'El Colgado', glifo: '⚯',
      figura: 'reloj', tono: 'sombra', color: '200,180,150',
      lectura: 'Todo se frena y vos mirás.' },
    { clave: 'emperatriz', num: 'III', nombre: 'La Emperatriz', glifo: '✿',
      figura: 'arbol', tono: 'luz', color: '190,225,160',
      lectura: 'Lo que cuidaste, crece.' }
  ];

  function carta(clave) {
    for (var i = 0; i < CARTAS.length; i++) {
      if (CARTAS[i].clave === clave) return CARTAS[i];
    }
    return null;
  }

  /* ============ las escenas ============ */

  /* El arco va de "esto es raro" a "esto lo hago yo". Las tres primeras Bel las
     mira como si le pasaran; en el medio empieza a sospechar; al final sabe.

     figura   con qué arranca la escena
     revela   qué saca La Estrella acá: lo que la cosa era en realidad
     entrada  lo que Bel piensa al llegar
     dichos   lo que piensa según la carta jugada; 'otra' cubre el resto */
  var ESCENAS = [
    {
      clave: 'descampado',
      titulo: 'Donde no debería estar',
      figura: 'cama',
      revela: 'puerta',
      entrada: 'Me acosté en mi cuarto. La cama es la mía, las sábanas son las ' +
               'mías. Lo que no es mío es todo lo demás.',
      dichos: {
        estrella: 'No era una cama: era la puerta de casa, y yo la crucé dormida. ' +
                  'Siempre supe cuándo una cosa era otra cosa. Nunca supe explicarlo.',
        torre: 'Se hizo pedazos apenas la miré fijo. Ni la toqué. ' +
               'Eso me pasa seguido y prefiero no pensarlo.',
        luna: 'Se vino encima, enorme, y en vez de asustarme me tranquilizó. ' +
              'Como cuando algo que venía de lejos por fin llega.',
        sol: 'Se prendieron las luces de una casa que no está más. ' +
             'Y yo la reconocí antes de mirarla bien.',
        muerte: 'Se abrió y le salieron ramas. Era un árbol todo este tiempo, ' +
                'esperando que alguien la dejara crecer.',
        loco: 'Se paró sola una puerta en el medio del campo, con luz atrás. ' +
              'No sé a dónde da. Sé que da a algún lado.',
        enamorados: 'Salieron volando y eran muchos. Toda la vida pensé que ' +
                    'estas cosas me pasaban a mí sola.',
        mundo: 'Volvió a ser una cama. Igualita. Pero yo ya la vi de otra manera ' +
               'y eso no se devuelve.',
        rueda: 'Se puso a girar y quedó una calesita, con la música y todo. ' +
               'Dormir también es eso: dar vueltas y volver al mismo lugar.',
        ermitano: 'Quedó un faro solo, prendido, sin mar alrededor. ' +
                  'Alumbrando por si acaso, que es lo que hago yo todo el día.',
        sacerdotisa: 'Se hizo agua debajo de mí. No me hundí. ' +
                     'Hay cosas que sé sin haberlas aprendido y esta es una.',
        templanza: 'Se volvió una barca y yo ya estaba adentro. ' +
                   'Nunca me subí: siempre estuve arriba de algo que se movía.',
        colgado: 'Quedó un reloj enorme con las agujas al revés. ' +
                 'Acá el tiempo hace lo que quiere y a mí me deja mirar.',
        emperatriz: 'Le crecieron raíces a la cama y se volvió un árbol grande. ' +
                    'Lo que uno cuida mucho tiempo termina creciendo solo.',
        otra: 'Cambió. No sé bien en qué, pero cambió porque yo la miré.'
      }
    },
    {
      clave: 'feria',
      titulo: 'La que estaba apagada',
      figura: 'montania',
      revela: 'platillo',
      entrada: 'La montaña rusa de la feria a la que me llevaban. Está apagada y ' +
               'está entera, y eso es imposible: la desarmaron cuando yo tenía nueve.',
      dichos: {
        estrella: 'No era una montaña rusa. Nunca lo fue. ' +
                  'Yo la miré bien y ella esperó a que la mirara bien.',
        torre: 'Se vino abajo con un ruido que no hizo ruido. ' +
               'Yo ya sabía que estaba floja. Siempre sé cuál está floja.',
        luna: 'Se puso enorme arriba de todo y el hierro quedó chiquito abajo. ' +
              'Las cosas grandes hacen chicas a las otras. También las personas.',
        sol: 'Se prendieron las luces de la casa donde crecí, arriba de las vías. ' +
             'Alguien las dejó prendidas para mí.',
        muerte: 'La estructura se puso verde y las vías eran ramas. ' +
                'Lo que estaba muerto ahí no estaba tan muerto.',
        loco: 'Se abrió una puerta en el medio de la subida. ' +
              'Nunca se me ocurrió que se podía salir por el medio.',
        enamorados: 'Los fierros se soltaron y eran pájaros. Estuvieron ahí todo ' +
                    'el tiempo, quietos, haciéndose los que eran otra cosa.',
        mundo: 'Volvió a mi cama, en el medio de la feria. Absurdo. ' +
               'Y sin embargo es exactamente lo que necesitaba ver.',
        rueda: 'Se enroscó sobre sí misma y quedó la calesita de al lado, ' +
               'la que yo elegía siempre porque la rusa me daba miedo.',
        ermitano: 'Quedó un faro donde estaba la subida. ' +
                  'Lo alto sirve para dos cosas: para tirarse o para avisar.',
        sacerdotisa: 'Abajo de las vías había agua y ahora está a la vista. ' +
                     'Siempre hubo agua abajo. Yo lo sabía sin saberlo.',
        templanza: 'Los vagones se volvieron una barca. ' +
                   'Es el mismo viaje pero sin la parte de tener miedo.',
        colgado: 'Se paró todo y quedó un reloj gigante contando al revés. ' +
                 'Yo tenía nueve. Sigo teniendo nueve en algún lado.',
        emperatriz: 'Reventó de hojas. Una montaña rusa hecha árbol, ' +
                    'y no se le cayó ni un fierro.',
        otra: 'Se dio vuelta como una media. Sigue siendo la misma cosa por dentro.'
      }
    },
    {
      clave: 'calesita',
      titulo: 'La que gira sin nadie',
      figura: 'calesita',
      revela: 'reloj',
      entrada: 'Gira despacio, con la música baja. No hay un solo chico arriba ' +
               'y sin embargo va a la velocidad de cuando está llena.',
      dichos: {
        estrella: 'No era una calesita: era un reloj. Doce caballitos, doce horas. ' +
                  'Yo lo supe antes de contarlos, y después los conté igual.',
        torre: 'Se cayó el techo primero, después el resto. ' +
               'Nada que gire tanto tiempo aguanta que lo miren de cerca.',
        luna: 'Se puso enorme atrás y los caballitos le pasaban por delante. ' +
              'Como si me estuvieran mostrando algo y yo tuviera que apurarme.',
        sol: 'Se volvió una casa con la luz prendida, en el mismo lugar. ' +
             'La sortija siempre fue eso: llegar a algo que te espera.',
        muerte: 'Se le pararon las vueltas y le crecieron ramas. ' +
                'Los caballitos quedaron colgados como frutas.',
        loco: 'Quedó una puerta girando sola en el medio. ' +
              'Es lo más raro que vi en toda la noche y no me sorprendió nada.',
        enamorados: 'Los caballitos se soltaron y eran pájaros. ' +
                    'Se fueron todos juntos, que es como se van las cosas lindas.',
        mundo: 'Volvió a mi cama. La calesita giraba en mi cuarto ' +
               'todas las noches que me costó dormirme.',
        rueda: 'Giró más rápido y se volvió otra calesita, más grande. ' +
               'Lo que vuelve, vuelve más grande. Eso también lo sé.',
        ermitano: 'Se estiró para arriba y quedó un faro. ' +
                  'Dejó de dar vueltas y se puso a alumbrar. Envidiable.',
        sacerdotisa: 'Se hundió y quedó el agua girando en el mismo lugar. ' +
                     'El agua también da vueltas, pero nadie la acusa de perder el tiempo.',
        templanza: 'Un caballito se volvió barca y los otros desaparecieron. ' +
                   'Dar vueltas o cruzar. Toda la vida es elegir una de las dos.',
        colgado: 'Se frenó en seco y quedó un reloj, quieto. ' +
                 'Es la primera vez en la noche que algo me obedece tan rápido.',
        emperatriz: 'Le brotaron flores a los caballitos. ' +
                    'Lo que uno usa con cariño mucho tiempo, en algún momento florece.',
        otra: 'Dejó de ser lo que era sin dejar de dar vueltas.'
      }
    },
    {
      clave: 'laguna',
      titulo: 'La que copia mal',
      figura: 'laguna',
      revela: 'barca',
      entrada: 'Un agua quieta con la luna adentro. Pero la luna de arriba no está: ' +
               'el agua está reflejando algo que no existe todavía.',
      dichos: {
        estrella: 'No era el agua: era una barca, y el reflejo era su vela. ' +
                  'Estaba viendo el final del viaje antes de que empezara. ' +
                  'Eso hago siempre, y a la gente le da impresión.',
        torre: 'Se secó de golpe y quedaron los escombros del fondo. ' +
               'Toda agua quieta tiene algo hundido. La mía también.',
        luna: 'Bajó la de verdad y se juntó con la del reflejo. ' +
              'Por un segundo hubo dos y las dos eran ciertas.',
        sol: 'Se prendió una casa donde estaba el reflejo. ' +
             'El agua estaba copiando una casa. Tardó, pero llegó.',
        muerte: 'Del agua salió un árbol enorme, mojado. ' +
                'Lo que está abajo del agua no está perdido: está esperando.',
        loco: 'Quedó una puerta parada en el medio del agua, sin mojarse. ' +
              'Y la luz de atrás sí se reflejaba. Los sueños son muy prolijos.',
        enamorados: 'El agua se levantó en pájaros. Todos los que se reflejaron ' +
                    'ahí alguna vez, saliendo juntos.',
        mundo: 'Se volvió mi cama, flotando. Dormir es esto: ' +
               'quedarse quieta arriba de algo muy profundo.',
        rueda: 'El agua se puso a girar y quedó una calesita mojada. ' +
               'Los remolinos y las calesitas son la misma idea.',
        ermitano: 'Del medio del agua creció un faro. ' +
                  'Ahí sí: un faro con agua alrededor, por fin algo que cierra.',
        sacerdotisa: 'Se hizo más honda y más quieta. No cambió de forma, ' +
                     'cambió de profundidad. No sabía que eso se podía hacer.',
        templanza: 'Apareció la barca y el reflejo por fin coincidió. ' +
                   'El agua no estaba copiando mal: estaba copiando temprano.',
        colgado: 'Se congeló con las ondas a medio hacer. ' +
                 'Un agua quieta de verdad, no como las de mentira.',
        emperatriz: 'Se llenó de juncos y de bichos y de cosas vivas. ' +
                    'Estaba demasiado limpia para ser real.',
        otra: 'El reflejo cambió antes que la cosa reflejada. Otra vez.'
      }
    },
    {
      clave: 'faro',
      titulo: 'La que avisa',
      figura: 'faro',
      revela: 'bandada',
      entrada: 'Un faro prendido, dando vueltas, sin mar. Está avisando de algo ' +
               'a un montón de gente que no veo. Yo entiendo perfecto lo que hace.',
      dichos: {
        estrella: 'No era un faro: eran todos los que alguna vez lo vieron y ' +
                  'llegaron bien. La luz era ellos. Eso es lo que soy yo cuando ' +
                  'alguien se sienta enfrente y me pide que le lea algo.',
        torre: 'Se cayó y la luz siguió prendida un rato más, entre los fierros. ' +
               'Uno se puede caer y seguir avisando. Lo vi hacer.',
        luna: 'Se puso atrás y el haz del faro le pasaba por encima. ' +
              'Dos cosas alumbrando lo mismo, sin pelearse.',
        sol: 'Se volvió una casa con la luz prendida. Es lo mismo que un faro ' +
             'pero para una sola persona. A veces alcanza con eso.',
        muerte: 'Se puso verde y quedó un árbol con una luz arriba. ' +
                'Todos los faros quieren ser árboles cuando se jubilan.',
        loco: 'Quedó la puerta y la luz salía de atrás. ' +
              'El faro no avisaba de un peligro: avisaba de una salida.',
        enamorados: 'La luz se separó en pájaros y se fueron para todos lados. ' +
                    'Así se reparte lo que uno sabe: no se guarda, se suelta.',
        mundo: 'Volvió a mi cama, con la lamparita del velador prendida. ' +
               'Todo faro es alguien que no apagó la luz por las dudas.',
        rueda: 'Se volvió calesita y siguió girando igual. ' +
               'La diferencia entre alumbrar y jugar es más chica de lo que parece.',
        ermitano: 'Se hizo más alto y más solo. ' +
                  'Hay una parte de esto que se hace de a una y no hay vuelta.',
        sacerdotisa: 'Debajo apareció el agua que le faltaba. ' +
                     'Ahora es un faro de verdad. Le puse el mar yo.',
        templanza: 'Llegó una barca hasta la luz. ' +
                   'Todo este tiempo el faro estaba esperando que alguien llegara.',
        colgado: 'El haz se frenó apuntando hacia mí. ' +
                 'Me tuve que quedar ahí, iluminada, sin nada que hacer.',
        emperatriz: 'Se llenó de enredaderas y siguió alumbrando. ' +
                    'Las cosas que sirven no dejan de servir porque les crezca encima.',
        otra: 'Cambió de forma y siguió haciendo exactamente lo mismo: avisar.'
      }
    },
    {
      clave: 'casa',
      titulo: 'La que tiene la luz prendida',
      figura: 'casa',
      revela: 'arbol',
      entrada: 'La casa de la infancia, con las dos ventanas prendidas. ' +
               'Alguien está adentro y me está esperando sin apuro.',
      dichos: {
        estrella: 'No era la casa: era el árbol del patio, el que yo miraba desde ' +
                  'la ventana. La casa la puse yo alrededor para no quedarme afuera.',
        torre: 'La tiré abajo yo. Con mirarla. Después me quedé parada un rato ' +
               'mirando el pozo, sin saber qué hacer con eso.',
        luna: 'Se puso arriba del techo, blanca, y la casa quedó chiquita y ' +
              'calentita, como cuando volvés tarde y todavía hay alguien despierto.',
        sol: 'Se prendió más. Todas las ventanas, todas juntas. ' +
             'No hacía falta que yo hiciera nada: ya estaba prendida.',
        muerte: 'Le crecieron ramas por adentro y le levantaron el techo. ' +
                'Las casas de uno siguen creciendo aunque uno se vaya.',
        loco: 'Quedó la puerta sola, sin la casa. Es raro: es lo único que ' +
              'necesitaba de esa casa, la puerta y la luz de atrás.',
        enamorados: 'Se llenó de gente que salía volando por las ventanas. ' +
                    'Todos los que pasaron por ahí, todos juntos, saliendo.',
        mundo: 'Se volvió mi cama, esta, la de ahora. Con la casa adentro. ' +
               'Todo lo que fui vive donde duermo.',
        rueda: 'Se puso a girar y quedó la calesita de la plaza de enfrente. ' +
               'Está a la misma distancia de la infancia. Da igual cuál mire.',
        ermitano: 'Se estiró hasta ser un faro. La casa siempre hizo eso: ' +
                  'quedarse prendida para que alguien encuentre el camino.',
        sacerdotisa: 'Se hundió despacio y quedó el agua sobre el techo. ' +
                     'Igual se veían las ventanas prendidas, abajo.',
        templanza: 'Se volvió una barca amarrada. ' +
                   'Las casas de uno son eso: algo que te lleva y te espera.',
        colgado: 'Quedó un reloj con las agujas paradas a la hora de la cena. ' +
                 'Justo esa hora. No la elegí yo, o sí.',
        emperatriz: 'Se le vino encima el jardín entero y la abrazó. ' +
                    'Lo que se cuida no se cae: se cubre de otra cosa.',
        otra: 'Cambió, y la luz de las ventanas no se apagó en ningún momento.'
      }
    },
    {
      clave: 'reloj',
      titulo: 'La que no coincide',
      figura: 'reloj',
      revela: 'luna',
      entrada: 'Un reloj enorme. La aguja de los minutos va para adelante, la de ' +
               'los segundos va para atrás. Las dos tienen razón y eso me encanta.',
      dichos: {
        estrella: 'No era un reloj: era la luna. Siempre fue la luna. ' +
                  'La gente le puso agujas para poder decir a qué hora pasan las ' +
                  'cosas, pero las cosas pasan cuando ella dice.',
        torre: 'Se hizo pedazos y las agujas quedaron clavadas en el piso. ' +
               'Nunca rompí nada tan a gusto.',
        luna: 'Se corrió el reloj y atrás estaba ella, esperando el turno. ' +
              'Lo que mide el tiempo tapa lo que hace el tiempo.',
        sol: 'Se volvió una casa y en la ventana se veía un reloj chiquito. ' +
             'El tiempo adentro de una casa pesa distinto.',
        muerte: 'Le salieron ramas por la esfera y las agujas quedaron entre ' +
                'las hojas. Un árbol es un reloj que nadie mira.',
        loco: 'Quedó una puerta con el reloj de picaporte. ' +
              'Uno pasa por las horas como pasa por las puertas: de a una.',
        enamorados: 'Las agujas se soltaron y eran pájaros. Se fueron. ' +
                    'El tiempo se va con la gente, no con los relojes.',
        mundo: 'Volvió a mi cama y el reloj era el despertador de la mesa de luz. ' +
               'Faltaba poco. Siempre falta poco.',
        rueda: 'Se puso a girar entero y quedó una calesita. ' +
               'Es lo mismo con caballitos: doce lugares y todos vuelven.',
        ermitano: 'Se estiró y quedó un faro con la hora arriba. ' +
                  'Alumbrar y contar el tiempo son el mismo trabajo, de noche.',
        sacerdotisa: 'Se hundió y las agujas siguieron girando abajo del agua. ' +
                     'Más lento. Todo es más lento abajo del agua y nadie se queja.',
        templanza: 'Se volvió una barca y las agujas eran los remos. ' +
                   'Uno rema con el tiempo, no contra él. Me lo dijeron mil veces.',
        colgado: 'Se paró del todo. Silencio. ' +
                 'Y yo seguí acá, mirando, que es lo único que sé hacer bien.',
        emperatriz: 'Le creció un jardín en la esfera y tapó los números. ' +
                    'Lo vivo no necesita saber la hora.',
        otra: 'Marcó una hora que no existe y yo la entendí igual.'
      }
    },
    {
      clave: 'final',
      titulo: 'Antes de despertarte',
      figura: 'puerta',
      revela: 'cama',
      entrada: 'Una puerta parada sola, con luz atrás. Es la última: lo sé igual ' +
               'que sé todo lo demás acá, sin que nadie me lo diga.',
      dichos: {
        estrella: 'Es mi cama. Estuve en mi cama todo el tiempo. Y todo lo que vi ' +
                  'lo puse yo, con lo único que tengo: mirar una cosa hasta que ' +
                  'muestra lo que es.',
        torre: 'La tiré. Y me despierto igual. ' +
               'Resulta que la puerta no era la que decidía.',
        luna: 'Se acercó hasta taparlo todo, y del otro lado ya era de día. ' +
              'A veces lo que se te viene encima es la mañana.',
        sol: 'Del otro lado había una casa con la luz prendida. ' +
             'Siempre hubo una casa con la luz prendida, en todos lados.',
        muerte: 'Se volvió un árbol y la puerta quedó entre las ramas. ' +
                'Se puede pasar igual. Se puede pasar por casi todo.',
        loco: 'Se abrió y atrás había otra puerta. Me reí. ' +
              'Así es siempre y a mí no me molesta.',
        enamorados: 'Se abrió y salieron todos volando hacia acá, hacia mí. ' +
                    'Ahí entendí para qué me sirve esto que sé hacer.',
        mundo: 'Volvió todo a mi cama y yo estaba adentro, dormida, mirándome ' +
               'dormir. Que es más o menos lo que hago siempre.',
        rueda: 'Se volvió una calesita y yo estaba arriba, dando la última vuelta. ' +
               'Sabía que era la última. Siempre se sabe.',
        ermitano: 'Se volvió un faro y yo estaba abajo, mirando para arriba. ' +
                  'Alguien tiene que quedarse prendido y me toca a mí.',
        sacerdotisa: 'Se hizo agua y del otro lado se veía la mañana, temblando. ' +
                     'Voy a tener que cruzarla nadando y no me molesta.',
        templanza: 'Del otro lado había una barca esperándome, con el remo puesto. ' +
                   'Nadie me apura. Nunca me apuraron, en realidad.',
        colgado: 'Se frenó justo antes de abrirse y me dejó ahí. ' +
                 'Un rato más adentro del sueño. Se lo agradezco.',
        emperatriz: 'Se llenó de flores y la luz de atrás se puso verde. ' +
                    'Lo que sembré en esta noche creció en una noche.',
        otra: 'Se abrió. Del otro lado había luz y no me dio miedo.'
      }
    }
  ];

  /* ============ el cierre ============ */

  /* Lo último que se lee. No es un puntaje: es de qué se dio cuenta Bel según
     lo que eligió mirar. Se evalúa de lo más específico a lo más general. */
  function cierre(jugadas) {
    var tuvo = {};
    for (var i = 0; i < jugadas.length; i++) tuvo[jugadas[i]] = true;

    var sombras = 0, luces = 0;
    for (var j = 0; j < jugadas.length; j++) {
      var c = carta(jugadas[j]);
      if (!c) continue;
      if (c.tono === 'sombra') sombras++; else luces++;
    }

    if (tuvo.estrella) {
      return ['Bel se despertó a las cuatro y monedas, con esa claridad rara de ' +
              'cuando el sueño te dejó algo en la mano.',
              'No fue que entendió el sueño. Fue que entendió que el sueño lo había ' +
              'hecho ella. Que mirar una cosa hasta que muestra lo que es no es ' +
              'algo que le pasa: es algo que hace.',
              'Y que lo viene haciendo despierta desde siempre, sin darle nombre.'];
    }
    if (tuvo.enamorados) {
      return ['Bel se despertó a las cuatro y monedas y lo primero que pensó fue ' +
              'en la gente.',
              'Toda la noche las cosas se le abrieron y salió gente volando de ' +
              'adentro. Nunca estuvo mirando objetos: estuvo mirando lo que las ' +
              'personas dejan pegado en las cosas.',
              'Para eso le sirve. Para eso la buscan.'];
    }
    if (tuvo.ermitano || tuvo.sol) {
      return ['Bel se despertó a las cuatro y monedas, con la sensación de haber ' +
              'dejado algo prendido.',
              'En el sueño, cada vez que pudo, encendió una luz. Un faro, una ' +
              'ventana, una casa esperando. No para ver ella: para que alguien ' +
              'más encontrara el camino.',
              'Se conoce lo suficiente como para saber que eso no fue casualidad.'];
    }
    if (tuvo.colgado || tuvo.sacerdotisa) {
      return ['Bel se despertó a las cuatro y monedas, despacio, sin sobresalto.',
              'En el sueño había frenado el tiempo y había hundido las cosas para ' +
              'ver qué tenían abajo. No apuró nada. Miró hasta que las cosas se ' +
              'cansaron de disimular.',
              'Es exactamente su manera de trabajar, y le salió dormida.'];
    }
    if (sombras > luces) {
      return ['Bel se despertó a las cuatro y monedas, con el pecho apretado.',
              'En el sueño había tirado abajo casi todo lo que tocó. Y lo que le ' +
              'quedó dando vueltas no fue el miedo: fue darse cuenta de que para ' +
              'tirar algo abajo primero hay que verlo flojo. Y ella lo vio.',
              'Eso también es el don, aunque de ese lado no le guste tanto.'];
    }
    return ['Bel se despertó a las cuatro y monedas, con el sueño todavía encima.',
            'No se acordaba del orden ni de los lugares. Se acordaba de una sola ' +
            'cosa: que cada vez que había mirado algo con ganas, ese algo se había ' +
            'dado vuelta y le había mostrado lo que era.',
            'No es poco. En realidad, es casi todo lo que hace.'];
  }

  return { CARTAS: CARTAS, ESCENAS: ESCENAS, carta: carta, cierre: cierre };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = Guion; }
