(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(pointer: fine)').matches;
  var canHover = matchMedia('(hover: hover)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var each = function (sel, fn) { Array.prototype.forEach.call(d.querySelectorAll(sel), fn); };

  // Barra de progresso de leitura
  var ticking = false;
  function updateProgress() {
    var max = root.scrollHeight - innerHeight;
    root.style.setProperty('--p', max > 0 ? Math.min(scrollY / max, 1) : 0);
    ticking = false;
  }
  addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  updateProgress();

  // Menu destaca a seção atual
  if (hasIO) {
    var links = {};
    each('nav a[href^="#"]', function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        Object.keys(links).forEach(function (k) { links[k].classList.toggle('on', k === e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['inicio', 'projetos', 'sobre', 'experiencia', 'contato'].forEach(function (id) {
      var el = d.getElementById(id); if (el) spy.observe(el);
    });
  }

  // Atraso escalonado dos chips (via CSSOM, permitido pela CSP)
  each('.chips', function (ul) {
    Array.prototype.forEach.call(ul.children, function (li, i) { li.style.setProperty('--i', i); });
  });

  // Flashcards: em telas sem hover, o toque vira o card
  if (!canHover) {
    each('.flip', function (c) {
      c.addEventListener('click', function () { c.classList.toggle('flipped'); });
    });
  }

  // Contadores
  function count(el) {
    var to = +el.getAttribute('data-count'), t0 = null;
    el.textContent = '0';
    (function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / 1500, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }

  if (reduce) return;

  // Spotlight global do cursor
  if (fine) {
    root.classList.add('fx');
    var raf = 0, mx = 0, my = 0;
    addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (!raf) raf = requestAnimationFrame(function () {
        root.style.setProperty('--mx', mx + 'px');
        root.style.setProperty('--my', my + 'px');
        raf = 0;
      });
    }, { passive: true });

    // Foco de luz dentro dos cards de projeto
    each('.project', function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--cx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--cy', (e.clientY - r.top) + 'px');
      });
    });

    // Botões magnéticos
    each('.button, .nav-contact', function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--tx', (e.clientX - r.left - r.width / 2) * 0.18 + 'px');
        el.style.setProperty('--ty', (e.clientY - r.top - r.height / 2) * 0.28 + 'px');
      });
      el.addEventListener('pointerleave', function () {
        el.style.setProperty('--tx', '0px');
        el.style.setProperty('--ty', '0px');
      });
    });

    // Inclinação 3D do retrato
    var pt = d.querySelector('.portrait');
    if (pt) {
      pt.addEventListener('pointermove', function (e) {
        var r = pt.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        pt.style.setProperty('--rx', (-y * 9) + 'deg');
        pt.style.setProperty('--ry', (x * 11) + 'deg');
      });
      pt.addEventListener('pointerleave', function () {
        pt.style.setProperty('--rx', '0deg');
        pt.style.setProperty('--ry', '0deg');
      });
    }
  }

  // Letreiro das tecnologias (conteúdo repetido, cópias ocultas para leitores de tela)
  var strip = d.querySelector('.skills-strip .wrap');
  if (strip) {
    var base = Array.prototype.slice.call(strip.children);
    for (var n = 0; n < 5; n++) {
      base.forEach(function (k) {
        var c = k.cloneNode(true); c.setAttribute('aria-hidden', 'true'); strip.appendChild(c);
      });
    }
    root.classList.add('mq');
  }

  if (!hasIO) return;

  // Revelar ao rolar
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      el.classList.add('in');
      if (el.classList.contains('stats')) each('.stats b', count);
      io.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px' });

  [
    '.section-head', '.project', '.about-grid > div', '.education',
    '.experience > *', '.competencies article', '.contact .wrap > *', 'footer > *'
  ].forEach(function (selector) {
    each(selector, function (el) {
      var index = Array.prototype.indexOf.call(el.parentElement.children, el);
      el.style.setProperty('--d', Math.min(index, 6) * 0.08 + 's');
      el.classList.add('rv');
      io.observe(el);
    });
  });
  each('.portrait', function (el) { el.classList.add('bld'); io.observe(el); });
  each('.stats', function (el) { io.observe(el); });
})();
