'use strict';
// Decorative only: content and navigation also work without JavaScript.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const motionButton = document.querySelector('.motion-toggle');
const portrait = document.querySelector('.portrait');
let userPaused = false;
const revealAnimations = new Set();
const revealedElements = new WeakSet();
const revealTargets = document.querySelectorAll('.section-head, .project, .about-grid > div, .experience, .competencies article, .contact .wrap');
let revealObserver;
const activeCounts = new Map();
let countObserver;

function syncCounters(paused) {
  countObserver?.disconnect();
  for (const [element, frame] of activeCounts) {
    cancelAnimationFrame(frame);
    element.textContent = element.dataset.count;
  }
  activeCounts.clear();
  if (paused || !('IntersectionObserver' in window)) return;
  countObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      countObserver.unobserve(entry.target);
      const start = performance.now(), target = Number(entry.target.dataset.count);
      function step(now) {
        const progress = Math.min((now - start) / 1100, 1);
        entry.target.textContent = String(Math.round(target * (1 - (1 - progress) ** 3)));
        if (progress < 1) activeCounts.set(entry.target, requestAnimationFrame(step));
        else activeCounts.delete(entry.target);
      }
      activeCounts.set(entry.target, requestAnimationFrame(step));
    }
  }, {threshold: .5});
  document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));
}

function syncScrollMotion(paused) {
  revealObserver?.disconnect();
  for (const animation of revealAnimations) animation.cancel();
  revealAnimations.clear();
  if (paused || !('IntersectionObserver' in window) || !Element.prototype.animate) return;
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (!entry.isIntersecting || revealedElements.has(entry.target)) return;
      revealedElements.add(entry.target);
      revealObserver.unobserve(entry.target);
      // Cancel an earlier entrance if this element quickly re-enters the viewport.
      for (const animation of revealAnimations) {
        if (animation.effect?.target === entry.target) { animation.cancel(); revealAnimations.delete(animation); }
      }
      const animation = entry.target.animate([
        {opacity: 0.2, transform: 'translateY(54px) scale(.975)'},
        {opacity: 1, transform: 'translateY(0) scale(1)'}
      ], {duration: 1000, delay: Math.min(index, 3) * 100, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards'});
      revealAnimations.add(animation);
      animation.onfinish = () => revealAnimations.delete(animation);
    });
  }, {threshold: 0.08, rootMargin: '0px 0px -24px 0px'});
  revealTargets.forEach(target => revealObserver.observe(target));
}
function updateMotion() {
  const paused = userPaused || motionPreference.matches;
  document.body.classList.toggle('motion-paused', paused);
  motionButton.hidden = motionPreference.matches;
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.replaceChildren();
  const symbol = document.createElement('span');
  symbol.setAttribute('aria-hidden', 'true');
  symbol.className = paused ? 'control-icon play-icon' : 'control-icon pause-icon';
  motionButton.append(symbol, paused ? 'Ativar movimentos' : 'Pausar movimentos');
  if (paused) delete portrait.dataset.tilt;
  syncScrollMotion(paused);
  syncCounters(paused);
}
motionButton.addEventListener('click', () => { userPaused = !userPaused; updateMotion(); });
motionPreference.addEventListener('change', updateMotion);
portrait.addEventListener('pointermove', (event) => {
  if (motionPreference.matches || userPaused || !finePointer.matches) return;
  const bounds = portrait.getBoundingClientRect();
  portrait.dataset.tilt = event.clientX < bounds.left + bounds.width / 2 ? 'left' : 'right';
});
portrait.addEventListener('pointerleave', () => { delete portrait.dataset.tilt; });
updateMotion();

// Retain interactive technology cards, with real keyboard/touch buttons.
document.querySelectorAll('.flip').forEach((card, index) => {
  const button = card.querySelector('.flip-toggle');
  const back = card.querySelector('.back');
  back.id = `technologies-${index}`;
  button.setAttribute('aria-controls', back.id);
  button.hidden = false;
  back.setAttribute('aria-hidden', 'true');
  card.classList.add('interactive-flip');
  button.addEventListener('click', () => {
    const open = card.classList.toggle('flipped');
    button.setAttribute('aria-expanded', String(open));
    back.setAttribute('aria-hidden', String(!open));
    button.textContent = open ? 'Voltar' : 'Ver tecnologias';
  });
});

// Active section indicator is independent of motion preference.
if ('IntersectionObserver' in window) {
  const navigation = [...document.querySelectorAll('nav a[href^="#"]')];
  const spy = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      navigation.forEach(link => {
        const current = link.hash === `#${entry.target.id}`;
        link.classList.toggle('on', current);
        if (current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
  }, {rootMargin:'-15% 0px -65% 0px'});
  document.querySelectorAll('main section[id]').forEach(section => spy.observe(section));
}

// Keep the technology ticker; duplicate labels are hidden from assistive tech.
const strip = document.querySelector('.skills-strip .wrap');
if (strip) {
  const labels = [...strip.children];
  for (let i=0;i<2;i++) labels.forEach(label => {
    const copy=label.cloneNode(true); copy.setAttribute('aria-hidden','true'); strip.append(copy);
  });
  strip.classList.add('ticker');
}

document.querySelectorAll('.button, .nav-contact, .project').forEach(element => {
  element.addEventListener('pointermove', event => {
    if (userPaused || motionPreference.matches || !finePointer.matches) return;
    const box=element.getBoundingClientRect();
    element.style.setProperty('--pointer-x', `${event.clientX-box.left}px`);
    element.style.setProperty('--pointer-y', `${event.clientY-box.top}px`);
    if (!element.classList.contains('project')) {
      element.style.setProperty('--magnet-x', `${(event.clientX-box.left-box.width/2)*.08}px`);
      element.style.setProperty('--magnet-y', `${(event.clientY-box.top-box.height/2)*.1}px`);
    }
  });
  element.addEventListener('pointerleave', () => {
    element.style.setProperty('--magnet-x','0px');element.style.setProperty('--magnet-y','0px');
  });
});

// Preserve the subtle pointer light from the existing public version.
let spotlightFrame = 0;
if (typeof window.addEventListener === 'function') window.addEventListener('pointermove', event => {
  if (userPaused || motionPreference.matches || !finePointer.matches || spotlightFrame) return;
  spotlightFrame = requestAnimationFrame(() => {
    document.documentElement.style.setProperty('--light-x', `${event.clientX}px`);
    document.documentElement.style.setProperty('--light-y', `${event.clientY}px`);
    spotlightFrame = 0;
  });
}, {passive:true});
