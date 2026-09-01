"""Arma un HTML autocontenido a partir de la prueba y sus modulos.

El juego no usa imagenes ni audio: todo se dibuja o se sintetiza. Asi que el
bundle es sencillo — reemplazar cada <script src> por su contenido."""
import io, os, re, sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def adelgazar(js):
    """Saca del BUNDLE los comentarios que ocupan una linea entera.

    El codigo fuente los conserva enteros: son la mitad del valor del proyecto.
    Lo que viaja en el archivo suelto no los necesita.

    Es deliberadamente conservador: solo borra lineas cuyo contenido COMPLETO es
    un comentario, y para los bloques exige que la linea empiece con /* y que el
    cierre este en su propia linea. Un // dentro de un string, o un /* pegado a
    codigo, quedan intactos porque no cumplen esas condiciones. Preferible dejar
    comentarios de mas que romper el juego por ahorrar kilobytes.
    """
    salida, dentro = [], False
    for linea in js.split(chr(10)):
        limpio = linea.strip()
        if dentro:
            if limpio.endswith('*/'):
                dentro = False
            continue
        if limpio.startswith('/*') and not limpio.endswith('*/'):
            dentro = True
            continue
        if limpio.startswith('/*') and limpio.endswith('*/'):
            continue
        if limpio.startswith('//'):
            continue
        if limpio == '' and salida and salida[-1].strip() == '':
            continue
        salida.append(linea)
    return chr(10).join(salida)


def construir(entrada, salida):
    ruta = os.path.join(BASE, entrada)
    html = io.open(ruta, encoding='utf-8').read()
    # --gordo deja los comentarios: sirve para depurar el propio bundle.
    adelgaza = '--gordo' not in sys.argv

    def meter(m):
        src = m.group(1)
        p = os.path.normpath(os.path.join(os.path.dirname(ruta), src))
        if not os.path.isfile(p):
            raise SystemExit('falta el modulo: ' + src)
        cuerpo = io.open(p, encoding='utf-8').read()
        if adelgaza:
            cuerpo = adelgazar(cuerpo)
        return '<script>\n' + cuerpo + '\n</script>'

    html = re.sub(r'<script src="([^"]+)"></script>', meter, html)

    if '<script src=' in html:
        raise SystemExit('quedo un script sin incrustar')
    # Sin estas piezas el bundle no juega: mejor no emitirlo que emitirlo roto.
    for clave in ['function jugar(', 'Figuras.preparar', 'Pintores.pintar',
                  'requestAnimationFrame(cuadroSeguro)', 'pedirCuadro', 'var Figuras', 'var Pintores',
                  'var Audio2', 'var Guion', 'Audio2.transformar', 'Audio2.prender',
                  'touchstart', 'LEJANIA', 'var BASES', 'var Instante',
                  'dibujar: dibujar', 'Instante.dibujar', 'forzarMirada',
                  'var Naipes', 'Naipes.dibujar', 'NO_AL_ARRANQUE',
                  'cartaDeElla', 'astrologa:', 'function dorso', 'mostrarCartaFinal',
                  'CARTA_PARA_BEL', 'abrirCarta', 'tensar', 'tensionSuave',
                  'correrCuadros', 'verificarLuz', 'verificarLayout',
                  'guardarPartida', 'og:image', 'rel="manifest"']:
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
