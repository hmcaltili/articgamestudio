'use strict';

// Page load fade-in
window.addEventListener('load', () => { document.body.classList.add('loaded'); });

// Custom Cursor
(function () {
  const c = document.getElementById('cursor');
  const f = document.getElementById('cursorFollower');
  if (!c || !f || window.matchMedia('(pointer: coarse)').matches) return;
  let mx = 0, my = 0, fx = 0, fy = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    c.style.left = mx + 'px'; c.style.top = my + 'px';
  });
  (function loop() {
    fx += (mx - fx) * 0.12; fy += (my - fy) * 0.12;
    f.style.left = fx + 'px'; f.style.top = fy + 'px';
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('a, button, input, select, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
})();

// Navbar scroll
(function () {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const fn = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', fn, { passive: true });
  fn();
})();

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    const offset = document.getElementById('nav')?.offsetHeight || 72;
    window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  });
});

// Reveal on scroll
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  els.forEach(el => io.observe(el));
})();

// Orb parallax
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const orbs = document.querySelectorAll('.orb');
  document.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth - 0.5) * 24;
    const y = (e.clientY / window.innerHeight - 0.5) * 24;
    orbs.forEach((o, i) => {
      const f = (i + 1) * 0.45;
      o.style.transform = `translate(${x * f}px, ${y * f}px)`;
    });
  }, { passive: true });
})();

// Contact form
(function () {
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const btn = document.getElementById('form-submit-btn');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    let valid = true;
    ['form-name', 'form-email', 'form-subject', 'form-message'].forEach(id => {
      const el = document.getElementById(id);
      if (!el.value.trim()) {
        el.classList.add('field-error');
        valid = false;
        el.addEventListener('input', () => el.classList.remove('field-error'), { once: true });
      }
    });
    if (!valid) return;

    const orig = btn.innerHTML;
    btn.innerHTML = '<span>Sending…</span>';
    btn.disabled = true;
    await new Promise(r => setTimeout(r, 1400));
    btn.innerHTML = orig;
    btn.disabled = false;
    form.reset();
    if (success) {
      success.classList.add('show');
      setTimeout(() => success.classList.remove('show'), 5000);
    }
  });
})();
