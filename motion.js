(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Barra de progresso de leitura
  var ticking = false;
  function updateProgress() {
    var max = root.scrollHeight - window.innerHeight;
    root.style.setProperty('--p', max > 0 ? Math.min(window.scrollY / max, 1) : 0);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  updateProgress();

  if (reduce) return;

  // Spotlight que acompanha o cursor (somente com mouse)
  if (window.matchMedia('(pointer: fine)').matches) {
    root.classList.add('fx');
    var raf = 0, mx = 0, my = 0;
    window.addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (!raf) {
        raf = requestAnimationFrame(function () {
          root.style.setProperty('--mx', mx + 'px');
          root.style.setProperty('--my', my + 'px');
          raf = 0;
        });
      }
    }, { passive: true });
  }

  // Revelar elementos ao rolar a página
  if (!('IntersectionObserver' in window)) return;
  var groups = [
    '.section-head', '.project', '.skills-strip span', '.about-grid > div',
    '.education', '.experience > *', '.competencies article',
    '.contact .wrap > *', 'footer > *'
  ];
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px' });

  groups.forEach(function (selector) {
    document.querySelectorAll(selector).forEach(function (el) {
      var index = Array.prototype.indexOf.call(el.parentElement.children, el);
      el.style.setProperty('--d', Math.min(index, 6) * 0.08 + 's');
      el.classList.add('rv');
      io.observe(el);
    });
  });
})();
