"""Monta index.html e agendar.html a partir de tools/modelo.html, tools/modelo-agendar.html e das listas de tools/processar.py.
Uso: python tools/montar.py   (editar os modelos, nunca os .html da raiz)
Cada imagem ampliável leva data-g (foto inteira em assets/img/full), data-leg (título) e data-det (detalhes)."""
import html, os, sys
AQUI = os.path.dirname(os.path.abspath(__file__)); SITE = os.path.dirname(AQUI)
sys.path.insert(0, AQUI)
import processar as P

WA = 'https://w.app/thomrech'
CAT = {'japonesa': 'Japonesa', 'tradicional': 'Tradicional'}

PROJ = {
    'dragao': ('Costas', 'Dragão sobre um mago', 'Começamos em 2020 com um desafio: cobrir um mago que ocupava quase todas as costas do Fernando. Virou um dragão, até onde a pele deixava ir.', 'Cobertura, de 2020 a 2026'),
    'barong': ('Costas', 'Barong', 'O rei dos espíritos da mitologia de Bali, nas costas do Hugo Guaracy, um dos tatuadores que ensinaram o Thomás a tatuar.', '10 sessões em 4 meses'),
    'perna': ('Perna', 'Perna fechada do Kennedy', 'Para terminar antes de ele voltar ao Japão, foram cinco sábados seguidos de sessão.', '9 sessões'),
    'peito': ('Peito', 'Samurai com dragão', 'Samurai de um lado, dragão do outro, fechando o peito do Gustavo.', 'Projeto de peito'),
    'nivaldo': ('Braço', 'Braço do Nivaldo', 'Tigre e flores vermelhas com fundo escuro, do ombro ao punho.', 'Braço fechado'),
    'rodrigo': ('Braço e peito', 'Braço do Rodrigo', 'Dragão, flores e fundo de nuvens subindo do punho até o peito.', 'Braço fechado'),
}

COB = [
    ('Braço da Isabela', 'Tatuagens antigas que ela já não queria viraram uma composição nova, com força e movimento do ombro ao punho.'),
    ('Cobertura de outubro', 'Braço inteiro refeito, finalizado no fim de outubro de 2026.'),
    ('Atropelo com preto', 'Primeira sessão de uma cobertura: blocos de preto fecham o que existia e abrem espaço para o desenho novo.'),
    ('Rosto tradicional', 'Um rosto tradicional bem limpo, desenhado para disfarçar a tatuagem antiga do pescoço.'),
]

# legendas dos flashes (para o pedido e para a ampliação)
FLASH_NOMES = ['Tigre com crisântemo', 'Baiacu', 'Rosa com arame', 'Crisântemo', 'Sapo', 'Carpa e baiacu', 'Camarão', 'Ferradura com flores',
               'Dragão', 'Tanuki', 'Kappa', 'Sakuras', 'Hannya', 'Búfalo']


def a(s):
    return html.escape(s, quote=True)


def img(src_p, src_g, alt, w, h, sizes, extra=''):
    return (f'<img src="{src_p}" srcset="{src_p} {w}w, {src_g} {w * 2}w" sizes="{sizes}" alt="{a(alt)}" '
            f'width="{w}" height="{h}" loading="lazy" decoding="async" draggable="false"{extra}>')


def projetos():
    out = []
    for chave, fotos in P.PROJETOS.items():
        tag, tit, txt, meta = PROJ[chave]
        n = len(fotos)
        principal = img(f'assets/img/projetos/{chave}-1-p.webp', f'assets/img/projetos/{chave}-1.webp', f'{tit}: {txt}', 540, 675,
                        '(max-width: 700px) 80vw, (max-width: 1100px) 50vw, 33vw', ' class="proj-foto"')
        mini = ''.join(f'<button class="proj-mini{" ativo" if j == 0 else ""}" data-g="assets/img/full/proj-{chave}-{j + 1}.webp" '
                       f'data-p="assets/img/projetos/{chave}-{j + 1}-p.webp" data-m="assets/img/projetos/{chave}-{j + 1}.webp" aria-label="Foto {j + 1} de {n}">'
                       f'<img src="assets/img/projetos/{chave}-{j + 1}-p.webp" alt="" width="540" height="675" loading="lazy" decoding="async" draggable="false"></button>'
                       for j in range(n))
        out.append(f'''      <article class="proj entra" data-leg="{a(tit)}" data-det="{a(tag + ' · ' + meta + '. ' + txt)}">
        <div class="proj-quadro">{principal}<span class="lupa" aria-hidden="true"></span><div class="proj-minis">{mini}</div></div>
        <p class="proj-tag">{tag}</p><h3>{tit}</h3><p>{txt}</p><p class="proj-meta">{meta}</p>
      </article>''')
    return '\n'.join(out)


def obras():
    li = []
    for i, (_c, _k, cat, leg, _d) in enumerate(P.OBRAS):
        n = f'{i + 1:02d}'
        li.append(f'''      <li class="obra" data-cat="{cat}"><button class="obra-btn amplia" data-g="assets/img/full/obras-{n}.webp" data-leg="{a(leg)}" data-det="{a('Tatuagem ' + CAT[cat].lower() + ' do Thomás Rech')}" aria-label="Ampliar: {a(leg)}">
        <span class="obra-img">{img(f"assets/img/obras/{n}-p.webp", f"assets/img/obras/{n}.webp", leg, 480, 600, "(max-width: 700px) 72vw, (max-width: 1100px) 33vw, 25vw")}<span class="lupa" aria-hidden="true"></span></span>
        <span class="obra-leg"><b>{leg}</b><small>{CAT[cat]}</small></span></button></li>''')
    return '\n'.join(li)


def cob():
    out = []
    for i, (tit, txt) in enumerate(COB):
        out.append(f'''      <article class="cob entra">
        <div class="cob-quadro">
          <button class="cob-abre amplia" data-g="assets/img/full/cob-{i + 1}.webp" data-g2="assets/img/full/cob-{i + 1}b.webp" data-leg="{a(tit)}" data-det="{a(txt)}" aria-label="Ampliar: {a(tit)}">
            {img(f"assets/img/cob/{i + 1}-p.webp", f"assets/img/cob/{i + 1}.webp", tit, 480, 600, "(max-width: 700px) 72vw, (max-width: 1100px) 50vw, 25vw", ' class="cob-a"')}
            {img(f"assets/img/cob/{i + 1}b-p.webp", f"assets/img/cob/{i + 1}b.webp", tit + ", outra foto", 480, 600, "(max-width: 700px) 72vw, (max-width: 1100px) 50vw, 25vw", ' class="cob-b"')}
            <span class="lupa" aria-hidden="true"></span>
          </button>
          <button class="cob-troca" aria-label="Ver outra foto: {a(tit)}">Outra foto</button>
        </div>
        <h3>{tit}</h3><p>{txt}</p>
      </article>''')
    return '\n'.join(out)


def disp():
    out = []
    for i, (_c, _k, tit, linha, _d) in enumerate(P.DISP):
        n = f'{i + 1:02d}'
        out.append(f'''      <article class="dsp entra">
        <button class="dsp-quadro amplia" data-g="assets/img/full/disp-{n}.webp" data-leg="{a(tit)}" data-det="{a('Desenho disponível · ' + linha + '. Pode ser adaptado para outra parte do corpo.')}" aria-label="Ampliar: {a(tit)}">{img(f"assets/img/disp/{n}-p.webp", f"assets/img/disp/{n}.webp", f"Desenho disponível: {tit}", 480, 600, "(max-width: 700px) 72vw, (max-width: 1100px) 50vw, 33vw")}<span class="lupa" aria-hidden="true"></span></button>
        <div class="dsp-txt"><h3>{tit}</h3><p>{linha}</p><a class="dsp-link" href="agendar.html?disp={n}">Quero este desenho</a></div>
      </article>''')
    return '\n'.join(out)


def flash():
    out = []
    for i in range(len(P.FLASH)):
        n = f'{i + 1:02d}'; nome = FLASH_NOMES[i]
        out.append(f'''        <li><button class="flash-btn amplia" data-g="assets/img/full/flash-{n}.webp" data-leg="{a(f'F{n} · {nome}')}" data-det="Flash pronto para tatuar, em cor ou em preto e cinza." aria-label="Ampliar flash F{n}"><img src="assets/img/flash/{n}.webp" alt="Flash disponível F{n}: {a(nome)}" width="640" height="640" loading="lazy" decoding="async" draggable="false"><span class="lupa" aria-hidden="true"></span></button><p><span>F{n}</span><a href="agendar.html?flash=F{n}">Quero este</a></p></li>''')
    return '\n'.join(out)


def pinturas():
    out = []
    for i, (_c, _k, leg, _d) in enumerate(P.PINTURAS):
        n = f'{i + 1:02d}'
        out.append(f'''      <li><button class="pint-btn amplia" data-g="assets/img/full/pint-{n}.webp" data-leg="{a(leg)}" data-det="Pintura do Thomás em papel." aria-label="Ampliar: {a(leg)}">{img(f"assets/img/pinturas/{n}-p.webp", f"assets/img/pinturas/{n}.webp", f"Pintura do Thomás: {leg}", 480, 600, "(max-width: 700px) 72vw, 33vw")}<span class="lupa" aria-hidden="true"></span></button><p>{leg}</p></li>''')
    return '\n'.join(out)


def opcoes_disp():
    return '\n'.join(f'''            <label><input type="radio" name="desenho" value="{a(tit)}" data-id="{i + 1:02d}"><img src="assets/img/disp/{i + 1:02d}-p.webp" alt="" width="480" height="600" loading="lazy"><span>{tit}</span></label>'''
                     for i, (_c, _k, tit, _l, _d) in enumerate(P.DISP))


def opcoes_flash():
    return '\n'.join(f'''            <label><input type="radio" name="flash" value="F{i + 1:02d} · {a(FLASH_NOMES[i])}" data-id="F{i + 1:02d}"><img src="assets/img/flash/{i + 1:02d}.webp" alt="" width="640" height="640" loading="lazy"><span>F{i + 1:02d} · {FLASH_NOMES[i]}</span></label>'''
                     for i in range(len(P.FLASH)))


def main():
    s = open(os.path.join(AQUI, 'modelo.html'), encoding='utf-8').read()
    for k, f in (('PROJETOS', projetos), ('OBRAS', obras), ('COB', cob), ('DISP', disp), ('FLASH', flash), ('PINTURAS', pinturas)):
        s = s.replace('{{' + k + '}}', f())
    s = s.replace('{{WA}}', WA)
    open(os.path.join(SITE, 'index.html'), 'w', encoding='utf-8', newline='\n').write(s)
    g = open(os.path.join(AQUI, 'modelo-agendar.html'), encoding='utf-8').read()
    g = g.replace('{{OPC_DISP}}', opcoes_disp()).replace('{{OPC_FLASH}}', opcoes_flash()).replace('{{WA}}', WA)
    open(os.path.join(SITE, 'agendar.html'), 'w', encoding='utf-8', newline='\n').write(g)
    print('index.html e agendar.html ok')


if __name__ == '__main__':
    main()
