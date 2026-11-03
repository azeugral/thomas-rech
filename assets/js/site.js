/* Thomás Rech: topo, menu, hero (shader no desktop, MP4 no toque), portfólio, projetos, coberturas e lightbox. */
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

  /* projetos: miniaturas trocam a foto principal */
  qa('.proj').forEach(function (p) {
    var foto = q('.proj-foto', p);
    qa('.proj-mini', p).forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.classList.contains('ativo')) { abrirLB([{ g: b.getAttribute('data-g'), leg: q('h3', p).textContent }], 0); return; }
        qa('.proj-mini', p).forEach(function (o) { o.classList.toggle('ativo', o === b); });
        foto.classList.add('troca');
        setTimeout(function () {
          foto.srcset = b.getAttribute('data-p') + ' 540w, ' + b.getAttribute('data-g') + ' 1080w';
          foto.src = b.getAttribute('data-p');
          var fim = function () { foto.classList.remove('troca'); };
          if (foto.complete) fim(); else foto.addEventListener('load', fim, { once: true });
        }, 260);
      });
    });
    foto.style.cursor = 'zoom-in';
    foto.addEventListener('click', function () {
      var at = q('.proj-mini.ativo', p);
      abrirLB(qa('.proj-mini', p).map(function (b) { return { g: b.getAttribute('data-g'), leg: q('h3', p).textContent }; }), qa('.proj-mini', p).indexOf(at));
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
      qa('.filtro').forEach(function (o) { var a = o === b; o.classList.toggle('ativo', a); o.setAttribute('aria-pressed', a ? 'true' : 'false'); });
      aplicar();
    });
  });
  verMais.addEventListener('click', function () { limite += 12; aplicar(); });
  aplicar();

  /* coberturas: toque alterna a foto */
  qa('.cob-quadro').forEach(function (b) { b.addEventListener('click', function () { b.classList.toggle('alt'); }); });

  /* lightbox */
  var lb = q('#lb'), lbImg = q('#lb-img'), lbLeg = q('#lb-leg'), lista = [], idx = 0, focoAntes = null;
  function mostrar() { var it = lista[idx]; lbImg.src = it.g; lbImg.alt = it.leg; lbLeg.textContent = it.leg; var multi = lista.length > 1; q('#lb-ant').hidden = !multi; q('#lb-prox').hidden = !multi; }
  function abrirLB(l, i) { lista = l; idx = Math.max(0, i); focoAntes = doc.activeElement; mostrar(); lb.hidden = false; body.style.overflow = 'hidden'; q('#lb-fechar').focus(); }
  function fecharLB() { lb.hidden = true; lbImg.removeAttribute('src'); body.style.overflow = ''; if (focoAntes) focoAntes.focus(); }
  function passo(d) { idx = (idx + d + lista.length) % lista.length; mostrar(); }
  q('#lb-fechar').addEventListener('click', fecharLB);
  q('#lb-ant').addEventListener('click', function () { passo(-1); });
  q('#lb-prox').addEventListener('click', function () { passo(1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) fecharLB(); });
  doc.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') fecharLB(); else if (e.key === 'ArrowLeft') passo(-1); else if (e.key === 'ArrowRight') passo(1);
  });
  var tx = null;
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) { if (tx === null) return; var d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50 && lista.length > 1) passo(d < 0 ? 1 : -1); tx = null; });

  function grupo(sel, legDe) {
    var bs = qa(sel);
    bs.forEach(function (b) {
      b.addEventListener('click', function () {
        var vis = bs.filter(function (x) { return x.offsetParent !== null; });
        abrirLB(vis.map(function (x) { return { g: x.getAttribute('data-g'), leg: legDe(x) }; }), vis.indexOf(b));
      });
    });
  }
  grupo('.obra-btn', function (b) { return q('b', b).textContent; });
  grupo('.pint-btn', function (b) { return b.nextElementSibling.textContent; });
  grupo('.dsp-quadro', function (b) { return q('h3', b.parentNode).textContent; });
  grupo('.flash-btn', function (b) { return 'Flash ' + b.nextElementSibling.textContent; });

  var ano = q('#ano'); if (ano) ano.textContent = new Date().getFullYear();
})();
