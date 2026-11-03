"""Gera as imagens do site a partir de _ref/ig (posts do Instagram, NNN_k.jpg).
Uso: python tools/processar.py        (--folha só monta _ref/conf-recortes.jpg para conferir os recortes)"""
import os, sys
from PIL import Image, ImageOps, ImageDraw

AQUI = os.path.dirname(os.path.abspath(__file__)); SITE = os.path.dirname(AQUI)
R = os.path.join(SITE, '..', '_ref'); A = os.path.join(SITE, 'assets', 'img')

# Portfólio: (post, foto, categoria, legenda, desvio vertical do recorte 0..1)
OBRAS = [
    ('035', 0, 'japonesa', 'Sakuras com nuvens, braço da Agnes', .4),
    ('133', 0, 'japonesa', 'Flor, água e muito preto', .45),
    ('017', 0, 'japonesa', 'Perna com Hyottoko e Okame', .35),
    ('138', 0, 'japonesa', 'Braço com tigre, em progresso', .4),
    ('029', 1, 'japonesa', 'Braço do Rodolfo, fundo terminado', .4),
    ('051', 0, 'japonesa', 'Karashishi com sakuras', .4),
    ('031', 0, 'japonesa', 'Sakuras com fundo de nuvens', .4),
    ('037', 0, 'japonesa', 'Hannya com momiji', .4),
    ('053', 0, 'japonesa', 'Sakura com onda', .45),
    ('054', 0, 'japonesa', 'Crisântemo na perna', .45),
    ('064', 1, 'japonesa', 'Serpente com momiji', .4),
    ('132', 0, 'japonesa', 'Kitsune com momiji', .45),
    ('028', 0, 'japonesa', 'Perna com carpa, em andamento', .45),
    ('044', 0, 'japonesa', 'Kirin no antebraço', .45),
    ('052', 0, 'japonesa', 'Árvore japonesa', .45),
    ('027', 0, 'japonesa', 'Gueixa com sakura', .4),
    ('024', 0, 'tradicional', 'Onça pintada na mão', .45),
    ('041', 0, 'tradicional', 'Leque tradicional', .4),
    ('078', 0, 'tradicional', 'Lince', .45),
    ('096', 0, 'tradicional', 'Galo tradicional', .45),
    ('149', 0, 'tradicional', 'Tigre tradicional', .5),
    ('103', 0, 'tradicional', 'Sapinho no banho de lámen', .5),
    ('034', 1, 'tradicional', 'Truta tradicional', .45),
    ('080', 0, 'tradicional', 'Tubarão com flores', .5),
    ('100', 0, 'tradicional', 'Peônia', .45),
    ('108', 0, 'tradicional', 'Jiboia', .5),
]

# Projetos grandes: (chave, [(post, foto, dy)...])
PROJETOS = {
    'dragao': [('008', 0, .35), ('008', 2, .35)],
    'barong': [('066', 0, .35), ('066', 3, .35), ('066', 1, .4)],
    'perna': [('067', 2, .4), ('067', 0, .4), ('067', 6, .4)],
    'peito': [('011', 0, .4), ('011', 4, .4), ('011', 6, .4)],
    'nivaldo': [('018', 0, .35), ('018', 3, .4), ('018', 5, .4)],
    'rodrigo': [('019', 2, .4), ('019', 0, .35), ('019', 6, .4)],
}

# Coberturas: (post, foto, dy)
COB = [('046', 0, .35), ('004', 3, .4), ('091', 0, .4), ('104', 0, .45)]
COB_X = [('046', 3, .4), ('004', 0, .4), ('091', 3, .4), ('104', 1, .45)]

# Disponíveis: projetos de corpo e flashes
DISP = [
    ('059', 0, 'Costas: tigre com momiji', 'Quatro versões de cor', .45),
    ('060', 0, 'Fênix com nuvens', 'Braço ou perna', .45),
    ('061', 0, 'Crisântemos com onda', 'Braço fechado', .45),
    ('069', 0, 'Papoulas com vento', 'Braço fechado', .45),
    ('001', 0, 'Braço inteiro', 'Projeto em 3D', .32),
    ('002', 0, 'Crisântemo com nuvens', 'Braço inteiro, projeto em 3D', .32),
]
FLASH = [('013', k, .5) for k in range(1, 9)] + [('049', k, .5) for k in range(0, 6)]

PINTURAS = [('021', 0, 'Carpa com ginkgo, papel de arroz', .5), ('023', 0, 'Fujin, papel canson 200 g', .5),
            ('022', 2, 'Raijin, deus do trovão', .5), ('020', 0, 'Kintaro e a carpa', .5),
            ('163', 0, 'Carpa no Portão do Dragão, nanquim e acrílica em kraft', .5), ('158', 0, 'Tigre, nanquim e guache sobre papel de arroz', .5)]

SOBRE = ('201', 0, .35)
HERO = ('021', 0)


def post(cod, k):
    return os.path.join(R, 'ig', f'{cod}_{k}.jpg')


def recortar(src, w, h, dy=.5):
    im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
    return ImageOps.fit(im, (w, h), Image.LANCZOS, centering=(.5, dy))


def salvar(im, nome, q=82):
    p = os.path.join(A, nome); os.makedirs(os.path.dirname(p), exist_ok=True)
    im.save(p, 'WEBP', quality=q, method=6)


def cheia(src, nome, lado=1800):
    """Foto inteira, sem recorte, para a ampliação (lightbox)."""
    im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
    if max(im.size) > lado:
        k = lado / max(im.size); im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    salvar(im, f'full/{nome}.webp', 84)


def par(src, pasta, n, w, h, dy):
    """Versão grande e pequena (-p) do mesmo recorte."""
    big = recortar(src, w, h, dy); salvar(big, f'{pasta}/{n}.webp')
    salvar(big.resize((w // 2, h // 2), Image.LANCZOS), f'{pasta}/{n}-p.webp')


def main():
    if '--folha' in sys.argv:
        ims = [recortar(post(c, k), 200, 250, dy) for c, k, _cat, _l, dy in OBRAS]
        ims += [recortar(post(c, k), 200, 250, dy) for v in PROJETOS.values() for c, k, dy in v]
        ims += [recortar(post(c, k), 200, 250, dy) for c, k, _t, _l, dy in DISP]
        ims += [recortar(post(c, k), 200, 200, dy) for c, k, dy in FLASH]
        ims += [recortar(post(c, k), 200, 250, dy) for c, k, _l, dy in PINTURAS]
        col = 10; lin = (len(ims) + col - 1) // col
        f = Image.new('RGB', (col * 204, lin * 254), 'white'); d = ImageDraw.Draw(f)
        for i, im in enumerate(ims):
            f.paste(im, ((i % col) * 204, (i // col) * 254)); d.text(((i % col) * 204 + 4, (i // col) * 254 + 4), str(i), fill='yellow')
        f.save(os.path.join(R, 'conf-recortes.jpg'), quality=82); return

    for i, (c, k, _cat, _l, dy) in enumerate(OBRAS):
        par(post(c, k), 'obras', f'{i + 1:02d}', 960, 1200, dy); cheia(post(c, k), f'obras-{i + 1:02d}')
    for chave, fotos in PROJETOS.items():
        for j, (c, k, dy) in enumerate(fotos):
            par(post(c, k), 'projetos', f'{chave}-{j + 1}', 1080, 1350, dy); cheia(post(c, k), f'proj-{chave}-{j + 1}')
    for i, ((c, k, dy), (c2, k2, dy2)) in enumerate(zip(COB, COB_X)):
        par(post(c, k), 'cob', f'{i + 1}', 960, 1200, dy); par(post(c2, k2), 'cob', f'{i + 1}b', 960, 1200, dy2)
        cheia(post(c, k), f'cob-{i + 1}'); cheia(post(c2, k2), f'cob-{i + 1}b')
    for i, (c, k, _t, _l, dy) in enumerate(DISP):
        par(post(c, k), 'disp', f'{i + 1:02d}', 960, 1200, dy); cheia(post(c, k), f'disp-{i + 1:02d}')
    for i, (c, k, dy) in enumerate(FLASH):
        salvar(recortar(post(c, k), 640, 640, dy), f'flash/{i + 1:02d}.webp')
        salvar(recortar(post(c, k), 1400, 1400, dy), f'full/flash-{i + 1:02d}.webp', 84)
    for i, (c, k, _l, dy) in enumerate(PINTURAS):
        par(post(c, k), 'pinturas', f'{i + 1:02d}', 960, 1200, dy); cheia(post(c, k), f'pint-{i + 1:02d}')
    c, k, dy = SOBRE
    salvar(recortar(post(c, k), 1080, 1350, dy), 'sobre.webp')
    # Hero: a pintura inteira, em duas larguras
    im = ImageOps.exif_transpose(Image.open(post(*HERO))).convert('RGB')
    salvar(im, 'hero-carpa.webp', 86)
    salvar(im.resize((900, round(900 * im.height / im.width)), Image.LANCZOS), 'hero-carpa-p.webp', 84)
    print('imagens ok')


if __name__ == '__main__':
    main()
