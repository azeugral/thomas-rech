# Thomás Rech · Tatuagem japonesa em Maringá-PR

Prévia de site feita pelo LRGZ para o Thomás Rech ([@thomrech](https://instagram.com/thomrech)), tatuador há 17 anos, especialista em tatuagem japonesa: braços fechados, pernas, costas e coberturas.

Endereço da prévia: https://azeugral.github.io/thomas-rech/ (com `noindex` e `robots.txt` bloqueando tudo até ele aprovar).

## Como está montado

- **Hero:** a pintura dele "Carpa com ginkgo" (papel de arroz) em tela cheia, sobre um **suminagashi** em shader: anéis de sumi que nascem de gotas e são levados por redemoinhos lentos. É a técnica de tinta marmorizada que ele mesmo posta (jun/2023). No desktop roda ao vivo em WebGL (`assets/js/sumi.js`); no toque entra o MP4 gravado do mesmo shader (`assets/video/sumi-retrato.mp4` e `sumi-largo.mp4`). O ciclo é periódico (36 s), então o vídeo fecha sem emenda e nunca escurece. Com movimento reduzido fica o pôster parado.
- **Entrada em camadas:** a pintura assenta, o nome sobe linha a linha, depois o texto, as etiquetas, os botões e a faixa da agenda. A tinta se espalha das gotas nos primeiros 3 s.
- **Seções:** sobre, projetos grandes (6 fechamentos com miniaturas), portfólio (grade uniforme 4:5, filtro Japonesa/Tradicional, ver mais), desenhos disponíveis + flashes, pinturas, coberturas (toque alterna a foto), como funciona um fechamento, agenda aberta.
- **Identidade:** sumi `#0e0d0c`, papel de arroz `#ece5d8`, vermelho do selo `#c8381c`. Shippori Mincho B1 + Zen Kaku Gothic New. O selo "TR" quadrado vem do carimbo que ele põe nas pinturas. Botões retos.
- **Contato:** o botão principal leva ao link da bio (`https://w.app/thomrech`) e há DM (`https://ig.me/m/thomrech`) na agenda e no rodapé.

## Ferramentas (`tools/`)

| Arquivo | Faz |
|---|---|
| `processar.py` | Recorta as fotos do Instagram (`--folha` monta `_ref/conf-recortes.jpg` para conferir) |
| `modelo.html` + `montar.py` | Monta o `index.html` (editar o modelo, nunca o index) |
| `gerar_video.py` | Grava os MP4 e os pôsteres do suminagashi (`--teste` só grava quadros em `_ref/hero`) |
| `og.py` | `og.jpg` e `apple-touch-icon.png` |

O material bruto (324 posts, 756 fotos, `legendas.txt`, folhas de contato) fica fora do repo, em `../_ref/`.

## CONFIRMAR antes de publicar de verdade

1. **WhatsApp:** a bio tem o link `w.app/thomrech` ("Orçamento: link abaixo"), que é o que o site usa. O número por trás dele não foi conferido. Legendas de 2024 citam (67) 3211-5517, que parece ser o fixo do estúdio de Campo Grande.
2. **Estúdio de Maringá:** nome, endereço e se é estúdio próprio. A legenda de 31/12/2025 diz "2026 novo estúdio e também nova cidade"; o site fala em "estúdio próprio, aberto em 2026" e "endereço enviado no agendamento".
3. **Campo Grande-MS:** a bio diz "1 semana/mês → @hardwork_tattoo". Confirmar se as datas saem mesmo nos stories.
4. **Hugo Guaracy:** o site diz que ele foi um dos que ensinaram o Thomás a tatuar (legenda de 25/12/2024). Confirmar se pode citar.
5. **Nomes de clientes:** Fernando, Hugo, Kennedy, Gustavo, Nivaldo, Rodrigo, Isabela e Agnes vieram das legendas. Confirmar se pode manter ou trocar por descrições.
6. **Desenhos disponíveis:** os projetos de corpo são de 2023 a 2025 (tigre de costas, fênix, crisântemos, papoulas, braços em 3D) e os flashes de set/2026 e jul/2025. Conferir quais ainda estão livres.
7. **Cobertura de outubro:** a legenda do post de 29/10 é só "Cobertura.". O texto do site é genérico.
8. **Pinturas:** confirmar se alguma está à venda (o dragão em sumi de 2024 estava) e se ele quer um botão para isso.
9. **Destaques:** a API dos destaques deu erro 500 e eles não foram extraídos. "Orçamentos" pode ter o passo a passo dele para trocar o "Como funciona".
10. **Dados de perfil:** em 03/11/2026 o perfil mostrava 11,5 mil seguidores e 972 posts (o dossiê falava em 12 mil e "sem link na bio").
11. **Domínio:** a definir. Ao trocar, ajustar `og:image` no `tools/modelo.html` e tirar o `noindex` e o `robots.txt`.
12. **Cache:** CSS e JS usam `?v=1`. Ao mudar, subir o número no modelo.

---

Site por L R G Z
