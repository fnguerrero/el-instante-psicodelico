#!/usr/bin/env python3
"""Servidor de desarrollo: sirve el juego y recibe capturas del canvas.

El navegador integrado de esta sesion no compone frames, asi que no se le
pueden pedir capturas de pantalla. La solucion es al reves: la pagina manda el
contenido del canvas y el servidor lo guarda en tools/capturas/, listo para
abrir como archivo.

Desde la pagina:
    fetch('/_captura/loquesea.png', {method:'POST', body: canvas.toDataURL()})

Uso:  py -3 tools/servidor.py [puerto]
"""
import base64
import io
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAPTURAS = os.path.join(BASE, 'tools', 'capturas')


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=BASE, **kw)

    def do_POST(self):
        if not self.path.startswith('/_captura/'):
            self.send_error(404)
            return
        nombre = os.path.basename(self.path[len('/_captura/'):]) or 'captura.png'
        if not nombre.endswith('.png'):
            nombre += '.png'
        largo = int(self.headers.get('Content-Length', 0))
        datos = self.rfile.read(largo).decode('utf-8', 'replace').strip()
        if ',' in datos[:80]:
            datos = datos.split(',', 1)[1]
        try:
            crudo = base64.b64decode(datos)
        except Exception as e:
            self.send_error(400, str(e))
            return
        if not os.path.isdir(CAPTURAS):
            os.makedirs(CAPTURAS)
        ruta = os.path.join(CAPTURAS, nombre)
        with open(ruta, 'wb') as f:
            f.write(crudo)
        cuerpo = ('guardado %s (%d bytes)' % (nombre, len(crudo))).encode()
        self.send_response(200)
        self.send_header('Content-Type', 'text/plain; charset=utf-8')
        self.send_header('Content-Length', str(len(cuerpo)))
        self.end_headers()
        self.wfile.write(cuerpo)

    def end_headers(self):
        # Sin cache: en desarrollo se recarga todo el tiempo.
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()

    def log_message(self, *a):
        pass          # sin ruido en la consola


def main():
    puerto = int(sys.argv[1]) if len(sys.argv) > 1 else 8133
    srv = ThreadingHTTPServer(('127.0.0.1', puerto), Handler)
    print('sirviendo %s en http://localhost:%d' % (BASE, puerto))
    print('capturas en %s' % CAPTURAS)
    srv.serve_forever()


if __name__ == '__main__':
    main()
