/* Rações Glória – main.js */
'use strict';

/* ── Hero: crossfade de vídeos ──────────────────────────────────────── */
(function () {
  const videos = document.querySelectorAll('.hero__video');
  const dots   = document.querySelectorAll('.hero__dot-btn');
  if (!videos.length) return;

  let current  = 0;
  let timer    = null;
  const DELAY  = 8000;

  function goTo(idx) {
    videos[current].classList.remove('hero__video--active');
    dots[current]?.classList.remove('hero__dot-btn--active');
    current = idx;
    const v = videos[current];
    v.classList.add('hero__video--active');
    dots[current]?.classList.add('hero__dot-btn--active');
    // Pre-carrega o próximo
    const next = videos[(current + 1) % videos.length];
    if (next.preload === 'none') { next.preload = 'auto'; next.load(); }
  }

  function next() { goTo((current + 1) % videos.length); }

  function startTimer() { timer = setInterval(next, DELAY); }
  function resetTimer()  { clearInterval(timer); startTimer(); }

  dots.forEach(d => d.addEventListener('click', () => { goTo(+d.dataset.index); resetTimer(); }));
  startTimer();
})();

/* ── Header: transparente no topo, sólido ao rolar ──────────────────── */
(function () {
  const h = document.getElementById('header');
  if (!h) return;
  function update() {
    if (window.scrollY > 40) { h.classList.add('scrolled'); h.classList.remove('hero-top'); }
    else                      { h.classList.remove('scrolled'); h.classList.add('hero-top'); }
  }
  update();
  window.addEventListener('scroll', update, { passive: true });
})();

/* ── Hamburger ──────────────────────────────────────────────────────── */
(function () {
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  });
  // Fecha ao clicar em link
  nav.querySelectorAll('.nav__link').forEach(l => l.addEventListener('click', () => {
    nav.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', false);
  }));
})();

/* ── Scroll reveal ──────────────────────────────────────────────────── */
(function () {
  if (!('IntersectionObserver' in window)) return;

  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  // Aplica a classe de animação via JS (sem JS tudo fica visível por padrão)
  els.forEach((el) => {
    el.classList.add('js-reveal');
    if      (el.classList.contains('reveal--delay-3')) el.classList.add('js-reveal--delay-3');
    else if (el.classList.contains('reveal--delay-2')) el.classList.add('js-reveal--delay-2');
    else if (el.classList.contains('reveal--delay-1')) el.classList.add('js-reveal--delay-1');
  });

  // Fallback: se após 3s ainda houver elementos ocultos, revela todos
  setTimeout(() => {
    document.querySelectorAll('.js-reveal:not(.visible)').forEach(el => el.classList.add('visible'));
  }, 3000);

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  els.forEach(el => io.observe(el));
})();

/* ── Contadores animados nas stats do hero ──────────────────────────── */
(function () {
  const nums = document.querySelectorAll('.stat__num[data-count]');
  if (!nums.length) return;
  function animCount(el) {
    const target = +el.dataset.count;
    const dur    = 1800;
    const step   = 16;
    let start    = null;
    function ease(t) { return t < .5 ? 2*t*t : -1+(4-2*t)*t; }
    function tick(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(ease(progress) * target).toLocaleString('pt-BR');
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { animCount(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.5 });
  nums.forEach(n => io.observe(n));
})();

/* ── Smooth scroll para âncoras ─────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

/* ══════════════════════════════════════════════════════════════════════
   PÁGINA DE PRODUTOS
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  const cards  = Array.from(grid.querySelectorAll('.product-card'));
  const radios = document.querySelectorAll('input[name="linha"]');
  const cbs    = document.querySelectorAll('input[data-tag]');
  const search = document.getElementById('search');
  const countEl = document.getElementById('productCount');

  function filter() {
    const linha      = document.querySelector('input[name="linha"]:checked')?.value || '';
    const activeTags = Array.from(cbs).filter(c => c.checked).map(c => c.dataset.tag);
    const q          = (search?.value || '').toLowerCase().trim();

    let visible = 0;
    cards.forEach(card => {
      const matchLinha = !linha || card.dataset.linha === linha;
      const cardTags   = (card.dataset.tags || '').split(' ');
      const matchTag   = activeTags.length === 0 || activeTags.some(t => cardTags.includes(t));
      const matchQ     = !q || card.querySelector('.product-card__name')?.textContent.toLowerCase().includes(q);
      const show = matchLinha && matchTag && matchQ;
      card.classList.toggle('hidden', !show);
      if (show) visible++;
    });

    if (countEl) countEl.textContent = visible;
  }

  radios.forEach(r => r.addEventListener('change', filter));
  cbs.forEach(c => c.addEventListener('change', filter));
  if (search) search.addEventListener('input', filter);

  // Pré-filtra via ?linha=
  const param = new URLSearchParams(location.search).get('linha');
  if (param) {
    const r = document.querySelector(`input[name="linha"][value="${param}"]`);
    if (r) { r.checked = true; filter(); }
  }
})();
