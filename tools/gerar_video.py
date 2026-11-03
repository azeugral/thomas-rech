"""Grava o suminagashi do hero (assets/js/sumi.js) num Edge headless:
- assets/video/sumi-retrato.mp4 (720x1280, celular) e sumi-largo.mp4 (1280x720, tablet deitado);
- assets/img/sumi-retrato.webp e sumi-largo.webp: pôsteres (movimento reduzido e antes do vídeo carregar).
O ciclo do shader é periódico, então o vídeo fecha sem emenda.
Uso: python tools/gerar_video.py [--teste]   (--teste só grava quadros em _ref/hero/)"""
import io, os, subprocess, sys
from playwright.sync_api import sync_playwright
import imageio_ffmpeg
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__)); SITE = os.path.dirname(AQUI)
VID = os.path.join(SITE, 'assets', 'video'); IMG = os.path.join(SITE, 'assets', 'img')
CONF = os.path.join(SITE, '..', '_ref', 'hero')
FPS = 30


def pagina(p, w, h, retrato):
    b = p.chromium.launch(channel='msedge', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': w, 'height': h})
    pg.set_content(f'<body style="margin:0;background:#0e0d0c"><canvas id="c" width="{w}" height="{h}" style="display:block"></canvas></body>')
    pg.add_script_tag(path=os.path.join(SITE, 'assets', 'js', 'sumi.js'))
    pg.evaluate(f"window.S = sumiGL(document.getElementById('c'), {{retrato: {'true' if retrato else 'false'}, preserveDrawingBuffer: true}})")
    return b, pg


def quadro(pg, t, ent=1):
    pg.evaluate(f'S.desenhar({t}, {ent})')
    return pg.screenshot(type='png')


def gravar(p, w, h, retrato, nome):
    b, pg = pagina(p, w, h, retrato)
    ciclo = pg.evaluate('S.ciclo')
    Image.open(io.BytesIO(quadro(pg, 4))).convert('RGB').save(os.path.join(IMG, nome + '.webp'), 'WEBP', quality=86)
    mp4 = os.path.join(VID, nome + '.mp4')
    enc = subprocess.Popen([imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'png', '-i', '-',
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '28', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart', '-an', mp4], stdin=subprocess.PIPE)
    q = round(ciclo * FPS)
    for i in range(q):
        enc.stdin.write(quadro(pg, i / FPS))
    enc.stdin.close(); enc.wait(); b.close()
    print(mp4, round(os.path.getsize(mp4) / 1e6, 2), 'MB', q, 'quadros')


def main():
    os.makedirs(VID, exist_ok=True); os.makedirs(CONF, exist_ok=True)
    with sync_playwright() as p:
        if '--teste' in sys.argv:
            b, pg = pagina(p, 1600, 900, False)
            for t, e in ((0, .25), (0, .6), (4, 1), (20, 1)):
                open(os.path.join(CONF, f'largo-{t}-{e}.png'), 'wb').write(quadro(pg, t, e))
            b.close()
            b, pg = pagina(p, 540, 960, True)
            open(os.path.join(CONF, 'retrato-4.png'), 'wb').write(quadro(pg, 4))
            b.close(); return
        gravar(p, 720, 1280, True, 'sumi-retrato')
        gravar(p, 1280, 720, False, 'sumi-largo')


if __name__ == '__main__':
    main()
