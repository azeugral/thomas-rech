"""og.jpg (1200x630) e apple-touch-icon.png. Uso: python tools/og.py
Fonte: _ref/fontes/ShipporiMinchoB1-ExtraBold.ttf (baixada do Google Fonts)."""
import os
from PIL import Image, ImageDraw, ImageFont, ImageOps
AQUI = os.path.dirname(os.path.abspath(__file__)); SITE = os.path.dirname(AQUI); R = os.path.join(SITE, '..', '_ref')
F = os.path.join(R, 'fontes', 'ShipporiMinchoB1-ExtraBold.ttf')
SUMI, PAPEL, SHU = (14, 13, 12), (236, 229, 216), (200, 56, 28)

def main():
    og = Image.new('RGB', (1200, 630), SUMI)
    fundo = Image.open(os.path.join(SITE, 'assets', 'img', 'sumi-largo.webp')).convert('RGB').resize((1200, 675)).crop((0, 20, 1200, 650))
    og.paste(fundo, (0, 0))
    arte = ImageOps.fit(Image.open(os.path.join(R, 'ig', '021_0.jpg')).convert('RGB'), (540, 630), Image.LANCZOS, centering=(.5, .42))
    m = Image.new('L', (540, 630), 255); md = ImageDraw.Draw(m)
    for x in range(200):
        md.line([(x, 0), (x, 630)], fill=int(255 * (x / 200) ** 1.4))
    og.paste(arte, (660, 0), m)
    d = ImageDraw.Draw(og)
    d.rectangle([70, 92, 122, 144], fill=SHU)
    f = ImageFont.truetype(F, 22); d.text((96, 118), 'TR', font=f, fill=(246, 239, 227), anchor='mm')
    d.text((70, 300), 'Thomás', font=ImageFont.truetype(F, 110), fill=PAPEL, anchor='ls')
    d.text((70, 410), 'Rech', font=ImageFont.truetype(F, 110), fill=PAPEL, anchor='ls')
    d.text((72, 480), 'Tatuagem japonesa · Maringá-PR', font=ImageFont.truetype(F, 30), fill=(190, 182, 170), anchor='ls')
    og.save(os.path.join(SITE, 'og.jpg'), quality=86)
    ic = Image.new('RGB', (180, 180), SHU); d = ImageDraw.Draw(ic)
    d.rectangle([10, 10, 169, 169], outline=(246, 239, 227), width=2)
    d.text((90, 92), 'TR', font=ImageFont.truetype(F, 78), fill=(246, 239, 227), anchor='mm')
    ic.save(os.path.join(SITE, 'apple-touch-icon.png'))
    print('og ok')

if __name__ == '__main__':
    main()
