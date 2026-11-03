/* Thomás Rech: topo, menu, hero (shader no desktop, MP4 no toque), blocos 2x2 do celular, projetos, coberturas, portfólio e ampliação. */
(function () {
  var doc = document, body = doc.body;
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var q = function (s, el) { return (el || doc).querySelector(s); };
  var qa = function (s, el) { return Array.prototype.slice.call((el || doc).querySelectorAll(s)); };

  /* topo e menu */
  var topo = q('#topo'), nav = q('#nav'), menu = q('#menu-btn');
  function rolou() { topo.classList.toggle('rolou', window.scrollY > 40); }
  window.addEventListener('scroll', rolou, { passive: true }); rolou();
  function fecharMenu() { nav.classList.remove('aberto'); topo.classList.remove('menu-aberto'); menu.setAttribute('aria-expanded', 'false'); body.style.overflow = ''; }
  menu.addEventListener('click', function () {
    var abre = !nav.classList.contains('aberto');
    nav.classList.toggle('aberto', abre); topo.classList.toggle('menu-aberto', abre);
    menu.setAttribute('aria-expanded', abre ? 'true' : 'false'); body.style.overflow = abre ? 'hidden' : '';
  });
  qa('a', nav).forEach(function (a) { a.addEventListener('click', fecharMenu); });

  /* hero: entrada em camadas */
  var arte = q('.hero-arte img');
  function pronto() { requestAnimationFrame(function () { body.classList.add('pronto'); }); }
  if (arte.complete) pronto(); else { arte.addEventListener('load', pronto); arte.addEventListener('error', pronto); setTimeout(pronto, 1800); }

  /* hero: suminagashi. Ponteiro fino e tela larga = shader ao vivo; toque = MP4 do mesmo shader */
  var caixa = q('.hero-sumi'), cv = q('#sumi'), poster = q('.hero-poster');
  var largo = window.matchMedia('(min-width: 1025px)').matches;
  var fino = window.matchMedia('(pointer: fine)').matches;
  var retrato = window.innerHeight > window.innerWidth;
  if (retrato) poster.src = poster.getAttribute('data-retrato');

  function heroVideo() {
    if (reduz) return;
    var v = doc.createElement('video');
    v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true; v.preload = 'auto';
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
    v.poster = poster.src;
    v.src = retrato ? 'assets/video/sumi-retrato.mp4' : 'assets/video/sumi-largo.mp4';
    v.addEventListener('playing', function () { v.classList.add('on'); }, { once: true });
    caixa.appendChild(v);
    var p = v.play(); if (p && p.catch) p.catch(function () {});
  }

  function heroGL() {
    var S;
    try { S = window.sumiGL(cv, { retrato: false }); } catch (e) { S = null; }
    if (!S) { cv.remove(); return; }
    var esc = Math.min(window.devicePixelRatio || 1, 1.5), t0 = performance.now(), ult = t0, lento = 0, vivo = true, visivel = true, raf = 0;
    function medir() { var r = caixa.getBoundingClientRect(); cv.width = Math.round(r.width * esc); cv.height = Math.round(r.height * esc); }
    medir();
    window.addEventListener('resize', function () { medir(); quadro(performance.now()); });
    cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); vivo = false; cancelAnimationFrame(raf); cv.remove(); });
    function quadro(agora) {
      var t = (agora - t0) / 1000, ent = Math.min(1, t / 3.4);
      S.desenhar(t + 4, 1 - Math.pow(1 - ent, 3));
    }
    function laco(agora) {
      if (!vivo || !visivel) return;
      var dt = agora - ult; ult = agora;
      if (dt > 24) { if (++lento > 40 && esc > .75) { esc = Math.max(.75, esc - .25); medir(); lento = 0; } } else lento = 0;
      quadro(agora); raf = requestAnimationFrame(laco);
    }
    new IntersectionObserver(function (es) {
      visivel = es[0].isIntersecting;
      if (visivel && vivo) { cancelAnimationFrame(raf); ult = performance.now(); raf = requestAnimationFrame(laco); }
    }).observe(caixa);
    requestAnimationFrame(function () { cv.classList.add('on'); });
  }

  if (reduz) cv.remove();
  else if (largo && fino && window.sumiGL) heroGL();
  else { cv.remove(); heroVideo(); }

  /* revelar ao rolar */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .08 }) : null;
  qa('.entra').forEach(function (el) { if (io && !reduz) io.observe(el); else el.classList.add('vis'); });

  /* ampliação: foto inteira (assets/img/full), título e detalhes; toque duplo aproxima, arrastar move, deslizar troca */
  var lb = q('#lb'), palco = q('#lb-palco'), lbImg = q('#lb-img'), lista = [], idx = 0, focoAntes = null;
  var z = 1, tx = 0, ty = 0;
  function aplicaZoom(anima) {
    lbImg.style.transition = anima ? 'transform .35s cubic-bezier(.16,.84,.32,1)' : 'none';
    lbImg.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + z + ')';
    lb.classList.toggle('zoom', z > 1);
  }
  function limita() {
    var w = lbImg.offsetWidth, h = lbImg.offsetHeight, W = palco.clientWidth, H = palco.clientHeight;
    var mx = Math.max(0, (w * z - W) / 2), my = Math.max(0, (h * z - H) / 2);
    tx = Math.max(-mx, Math.min(mx, tx)); ty = Math.max(-my, Math.min(my, ty));
  }
  function zoomEm(cx, cy) {
    if (z > 1) { z = 1; tx = ty = 0; aplicaZoom(true); return; }
    var r = lbImg.getBoundingClientRect();
    var px = cx - (r.left + r.width / 2), py = cy - (r.top + r.height / 2);
    z = Math.min(3, Math.max(2.2, lbImg.naturalWidth / r.width));
    tx = -px * (z - 1); ty = -py * (z - 1); limita(); aplicaZoom(true);
  }
  function mostrar() {
    var it = lista[idx];
    z = 1; tx = ty = 0; aplicaZoom(false);
    lb.classList.add('carregando');
    lbImg.onload = function () { lb.classList.remove('carregando'); };
    lbImg.src = it.g; lbImg.alt = it.leg || '';
    q('#lb-leg').textContent = it.leg || ''; q('#lb-det').textContent = it.det || '';
    var multi = lista.length > 1;
    q('#lb-ant').hidden = !multi; q('#lb-prox').hidden = !multi;
    q('#lb-cont').textContent = multi ? (idx + 1) + ' / ' + lista.length : '';
    if (multi) { var pre = new Image(); pre.src = lista[(idx + 1) % lista.length].g; }
  }
  function abrirLB(l, i) { lista = l; idx = Math.max(0, i); focoAntes = doc.activeElement; mostrar(); lb.hidden = false; body.style.overflow = 'hidden'; q('#lb-fechar').focus({ preventScroll: true }); }
  function fecharLB() { lb.hidden = true; lbImg.removeAttribute('src'); body.style.overflow = ''; if (focoAntes) focoAntes.focus({ preventScroll: true }); }
  function passo(d) { if (lista.length < 2) return; idx = (idx + d + lista.length) % lista.length; mostrar(); }
  q('#lb-fechar').addEventListener('click', fecharLB);
  q('#lb-ant').addEventListener('click', function () { passo(-1); });
  q('#lb-prox').addEventListener('click', function () { passo(1); });
  doc.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') fecharLB(); else if (e.key === 'ArrowLeft') passo(-1); else if (e.key === 'ArrowRight') passo(1);
  });
  var ptr = null, ultimoToque = 0;
  palco.addEventListener('pointerdown', function (e) {
    ptr = { id: e.pointerId, x: e.clientX, y: e.clientY, tx: tx, ty: ty, moveu: false };
    try { palco.setPointerCapture(e.pointerId); } catch (er) {}
  });
  palco.addEventListener('pointermove', function (e) {
    if (!ptr || e.pointerId !== ptr.id) return;
    var dx = e.clientX - ptr.x, dy = e.clientY - ptr.y;
    if (Math.abs(dx) + Math.abs(dy) > 6) ptr.moveu = true;
    if (z > 1) { tx = ptr.tx + dx; ty = ptr.ty + dy; limita(); aplicaZoom(false); }
    else if (ptr.moveu) { lbImg.style.transition = 'none'; lbImg.style.transform = 'translate(' + dx * .6 + 'px,' + Math.max(0, dy) * .5 + 'px)'; }
  });
  palco.addEventListener('pointerup', function (e) {
    if (!ptr || e.pointerId !== ptr.id) return;
    var dx = e.clientX - ptr.x, dy = e.clientY - ptr.y, moveu = ptr.moveu; ptr = null;
    if (z === 1 && moveu) {
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) passo(dx < 0 ? 1 : -1);
      else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) fecharLB();
      else aplicaZoom(true);
      return;
    }
    if (moveu) return;
    if (e.pointerType === 'mouse') {
      var r = lbImg.getBoundingClientRect(), naFoto = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (naFoto || z > 1) zoomEm(e.clientX, e.clientY); else fecharLB();
      return;
    }
    var agora = Date.now();
    if (agora - ultimoToque < 320) { zoomEm(e.clientX, e.clientY); ultimoToque = 0; } else ultimoToque = agora;
  });
  palco.addEventListener('pointercancel', function () { ptr = null; aplicaZoom(true); });

  function item(b) { return { g: b.getAttribute('data-g'), leg: b.getAttribute('data-leg'), det: b.getAttribute('data-det') }; }
  function grupo(sel) {
    var bs = qa(sel);
    bs.forEach(function (b) {
      b.addEventListener('click', function () {
        var vis = bs.filter(function (x) { return !x.closest('.fora'); });
        abrirLB(vis.map(item), vis.indexOf(b));
      });
    });
  }
  grupo('.obra-btn'); grupo('.pint-btn'); grupo('.dsp-quadro'); grupo('.flash-btn');

  /* projetos: miniaturas trocam a foto principal; tocar na foto amplia todas as fotos do projeto */
  qa('.proj').forEach(function (p) {
    var foto = q('.proj-foto', p), minis = qa('.proj-mini', p);
    function fotos() { return minis.map(function (b) { return { g: b.getAttribute('data-g'), leg: p.getAttribute('data-leg'), det: p.getAttribute('data-det') }; }); }
    minis.forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.classList.contains('ativo')) { abrirLB(fotos(), minis.indexOf(b)); return; }
        minis.forEach(function (o) { o.classList.toggle('ativo', o === b); });
        foto.classList.add('troca');
        setTimeout(function () {
          foto.srcset = b.getAttribute('data-p') + ' 540w, ' + b.getAttribute('data-m') + ' 1080w';
          foto.src = b.getAttribute('data-p');
          var fim = function () { foto.classList.remove('troca'); };
          if (foto.complete) fim(); else foto.addEventListener('load', fim, { once: true });
        }, 260);
      });
    });
    foto.addEventListener('click', function () { abrirLB(fotos(), minis.indexOf(q('.proj-mini.ativo', p))); });
  });

  /* coberturas: "Outra foto" alterna; tocar na foto amplia as duas */
  qa('.cob-quadro').forEach(function (c) {
    var abre = q('.cob-abre', c);
    q('.cob-troca', c).addEventListener('click', function () { c.classList.toggle('alt'); });
    abre.addEventListener('click', function () {
      var leg = abre.getAttribute('data-leg'), det = abre.getAttribute('data-det');
      abrirLB([{ g: abre.getAttribute('data-g'), leg: leg, det: det }, { g: abre.getAttribute('data-g2'), leg: leg, det: det }], c.classList.contains('alt') ? 1 : 0);
    });
  });

  /* celular: blocos com mais de 4 imagens mostram 4 em grade 2x2 e um "Ver todos" */
  qa('.mob4').forEach(function (g) {
    var n = g.children.length; if (n <= 4) return;
    var w = doc.createElement('div'); w.className = 'mob4-mais';
    w.innerHTML = '<button type="button" class="btn btn-linha" aria-expanded="false">Ver todos (' + n + ')</button>';
    (g.closest('.flash-trilho-wrap') || g).insertAdjacentElement('afterend', w);
    var b = q('button', w);
    b.addEventListener('click', function () {
      var abre = !g.classList.contains('todos');
      g.classList.toggle('todos', abre); b.setAttribute('aria-expanded', abre ? 'true' : 'false');
      b.textContent = abre ? 'Mostrar menos' : 'Ver todos (' + n + ')';
      if (!abre) g.scrollIntoView({ block: 'start', behavior: reduz ? 'auto' : 'smooth' });
    });
  });

  /* portfólio: filtro + ver mais */
  var obras = qa('.obra'), filtro = 'tudo', limite = 12, verMais = q('#ver-mais');
  function aplicar() {
    var vis = 0;
    obras.forEach(function (o) {
      var ok = filtro === 'tudo' || o.getAttribute('data-cat') === filtro;
      o.classList.toggle('fora', !ok);
      if (ok) { vis++; o.classList.toggle('oculta', vis > limite); } else o.classList.remove('oculta');
    });
    verMais.parentNode.hidden = vis <= limite;
  }
  qa('.filtro').forEach(function (b) {
    b.addEventListener('click', function () {
      filtro = b.getAttribute('data-f'); limite = 12;
      qa('.filtro').forEach(function (o) { var at = o === b; o.classList.toggle('ativo', at); o.setAttribute('aria-pressed', at ? 'true' : 'false'); });
      aplicar();
    });
  });
  verMais.addEventListener('click', function () { limite += 12; aplicar(); });
  aplicar();

  var ano = q('#ano'); if (ano) ano.textContent = new Date().getFullYear();
})();
