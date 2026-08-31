"""Arma un HTML autocontenido a partir de la prueba y sus modulos.

El juego no usa imagenes ni audio: todo se dibuja o se sintetiza. Asi que el
bundle es sencillo — reemplazar cada <script src> por su contenido."""
import io, os, re, sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def construir(entrada, salida):
    ruta = os.path.join(BASE, entrada)
    html = io.open(ruta, encoding='utf-8').read()

    def meter(m):
        src = m.group(1)
        p = os.path.normpath(os.path.join(os.path.dirname(ruta), src))
        if not os.path.isfile(p):
            raise SystemExit('falta el modulo: ' + src)
        return '<script>\n' + io.open(p, encoding='utf-8').read() + '\n</script>'

    html = re.sub(r'<script src="([^"]+)"></script>', meter, html)

    if '<script src=' in html:
        raise SystemExit('quedo un script sin incrustar')
    # Sin estas piezas el bundle no juega: mejor no emitirlo que emitirlo roto.
    for clave in ['function jugar(', 'Figuras.preparar', 'Pintores.pintar',
                  'requestAnimationFrame(cuadro)', 'var Figuras', 'var Pintores',
                  'var Audio2', 'var Guion', 'Audio2.transformar', 'Audio2.prender',
                  'touchstart', 'LEJANIA', 'var BASES', 'var Instante',
                  'dibujar: dibujar', 'Instante.dibujar', 'forzarMirada',
                  'var Naipes', 'Naipes.dibujar', 'NO_AL_ARRANQUE',
                  'cartaDeElla', 'astrologa:', 'function dorso', 'mostrarCartaFinal',
                  'CARTA_PARA_BEL', 'abrirCarta', 'tensar', 'tensionSuave']:
        if clave not in html:
            raise SystemExit('falta en el bundle: ' + clave)

    lugares = html.count('      llegada:')
    if lugares < 14:
        raise SystemExit('el bundle trae %d lugares, faltan' % lugares)
    cartas = html.count('      lectura:')
    if cartas < 14:
        raise SystemExit('el bundle trae %d cartas, faltan' % cartas)
    # Una referencia a elCarta fuera de jugar() rompe el cierre entero y no se
    # nota hasta la ultima pantalla: se chequea que haya exactamente una.
    if html.count('if (elCarta)') != 1:
        raise SystemExit('elCarta aparece %d veces; debe ser 1' % html.count('if (elCarta)'))
    if "figura: 'cama'" in html:
        raise SystemExit('hay una carta que lleva a la cama: la cama es del final')
    print('   %d lugares, %d cartas' % (lugares, cartas))

    dest = os.path.join(BASE, salida)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    io.open(dest, 'w', encoding='utf-8').write(html)
    print('%s    %.1f KB' % (os.path.basename(dest), len(html.encode('utf-8')) / 1024))

if __name__ == '__main__':
    construir(sys.argv[1] if len(sys.argv) > 1 else 'test/transformar.html',
              sys.argv[2] if len(sys.argv) > 2 else 'dist/prueba.html')
