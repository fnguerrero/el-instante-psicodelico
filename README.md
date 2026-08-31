# El segundo de más

> **Estado: Activo** — en desarrollo.
> Se llamó *Duermevela* hasta el 28/08/2026. El nombre viejo sigue apareciendo en
> `.nonstop/` porque ahí está el registro de cómo se construyó.

Un regalo para Bel. Continúa su historia después de
[Kermés](https://github.com/fnguerrero/kermes): otra noche, entre arcanos y
figuras que no terminan de ser lo que parecen.

HTML y JavaScript puro, sin dependencias: se abre y anda.

## Cómo se juega

Estás en un lugar. Tenés un mazo de 14 arcanos y te reparten tres. **La carta que
jugás transforma lo que tenés delante, y esa cosa nueva es donde estás ahora** —
por eso el recorrido se ramifica solo y dos partidas no se parecen.

Mientras las piezas vuelan hay **un instante**: un anillo se cierra sobre la
figura y hay que tocar cuando llega a la marca. Si le acertás, ves lo que ese
lugar escondía. Si errás, se transforma igual, pero eso ya no lo vas a saber.

Todo lo que los lugares esconden falla de la misma manera: las cosas se acomodan
cuando alguien las mira. Ocho pasos, cuatro finales según cuánto hayas visto, y
al final un arcano que no está en el mazo.

## Cómo se corre

| Para qué | Cómo |
|---|---|
| Jugar | Abrir `dist/el-segundo-de-mas.html` — un archivo, sin servidor |
| Desarrollar | `py -3 tools/servidor.py 8139` y entrar a `localhost:8139/index.html` |
| Empaquetar | `py -3 tools/build.py index.html dist/el-segundo-de-mas.html` |

El servidor de desarrollo además recibe capturas del canvas por POST y las
escribe en `tools/capturas/`, que es cómo se revisan los renders sin depender de
que el navegador componga la pantalla.

## Cómo está armado

| Archivo | Qué hace |
|---|---|
| `js/juego.js` | El hilo: pasos, mano, estado, dibujo de la escena |
| `js/guion.js` | Los 14 lugares, las 14 cartas, los finales y el arcano XXII |
| `js/figuras.js` | Las figuras como segmentos, para que las piezas vuelen al mutar |
| `js/pintores.js` | Las mismas figuras pintadas en serio, para cuando aterrizan |
| `js/naipes.js` | Los arcanos dibujados como naipes de Marsella |
| `js/instante.js` | La mecánica de puntería: el anillo que se cierra |
| `js/audio.js` | Todo el sonido, sintetizado: cero archivos |
| `js/bel.js` | El personaje |
| `tools/build.py` | Empaqueta a un HTML único, con guardas que impiden emitir un bundle roto |

Las figuras existen dos veces a propósito: como segmentos (`figuras.js`) para el
vuelo de las piezas durante una transformación, y pintadas (`pintores.js`) para
cuando están quietas. Es lo que permite que una montaña rusa se desarme y se
rearme como platillo sin que ninguna de las dos se vea como palitos.

## Historial

El registro completo de cómo se construyó está en `.nonstop/`: tres tandas de
trabajo con su spec, su checklist y su informe, más una bitácora continua de 70
entradas con qué se hizo y cómo se verificó.
