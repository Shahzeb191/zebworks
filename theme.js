/* ============================================================
   THEME.JS — ZebWorks Theme System
   ============================================================ */

(function () {
  const STORAGE_KEY = 'zw-theme';
  const CUSTOM_ACCENT_KEY = 'zw-custom-accent';

  // Apply saved theme immediately (before DOM ready to avoid flash)
  const savedTheme = localStorage.getItem(STORAGE_KEY) || 'slate';
  document.documentElement.setAttribute('data-theme', savedTheme);

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initNavbar();
    initMobileNav();
    initScrollReveal();
    initRoleCycler();
    markActiveNavLink();
  });

  /* ─── THEME INIT ─── */
  function initTheme() {
    const btn = document.getElementById('themeBtn');
    const panel = document.getElementById('themePanel');
    const swatches = document.querySelectorAll('.swatch');
    const colorPicker = document.getElementById('accentPicker');

    if (!btn || !panel) return;

    // Restore custom accent if saved
    const savedAccent = localStorage.getItem(CUSTOM_ACCENT_KEY);
    if (savedAccent && savedTheme === 'custom') {
      applyCustomAccent(savedAccent);
      if (colorPicker) colorPicker.value = savedAccent;
    }

    // Mark active swatch
    updateActiveSwatch(savedTheme);

    // Toggle panel
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      panel.classList.toggle('open');
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!panel.contains(e.target) && e.target !== btn) {
        panel.classList.remove('open');
      }
    });

    // Swatch click
    swatches.forEach(function (s) {
      s.addEventListener('click', function () {
        const theme = s.getAttribute('data-t');
        setTheme(theme);
        updateActiveSwatch(theme);
        panel.classList.remove('open');
      });
    });

    // Custom color picker
    if (colorPicker) {
      colorPicker.addEventListener('input', function () {
        applyCustomAccent(colorPicker.value);
        setTheme('custom');
        localStorage.setItem(CUSTOM_ACCENT_KEY, colorPicker.value);
        updateActiveSwatch('custom');
      });
    }
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  function updateActiveSwatch(theme) {
    document.querySelectorAll('.swatch').forEach(function (s) {
      s.classList.toggle('active', s.getAttribute('data-t') === theme);
    });
  }

  function applyCustomAccent(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return;
    const root = document.documentElement;
    root.style.setProperty('--accent', hex);
    root.style.setProperty('--accent2', lighten(hex, 20));
    root.style.setProperty('--accent-rgb', `${rgb.r},${rgb.g},${rgb.b}`);
    root.style.setProperty('--glow', `rgba(${rgb.r},${rgb.g},${rgb.b},0.18)`);
    root.style.setProperty('--tag-bg', `rgba(${rgb.r},${rgb.g},${rgb.b},0.08)`);
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  function lighten(hex, amount) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    const r = Math.min(255, rgb.r + amount);
    const g = Math.min(255, rgb.g + amount);
    const b = Math.min(255, rgb.b + amount);
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  }

  /* ─── NAVBAR SCROLL ─── */
  function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    window.addEventListener('scroll', function () {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* ─── MOBILE NAV ─── */
  function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const drawer = document.getElementById('navDrawer');
    if (!toggle || !drawer) return;

    toggle.addEventListener('click', function () {
      const open = drawer.classList.toggle('open');
      document.body.style.overflow = open ? 'hidden' : '';
      toggle.querySelectorAll('span')[0].style.transform = open ? 'rotate(45deg) translate(5px,5px)' : '';
      toggle.querySelectorAll('span')[1].style.opacity = open ? '0' : '1';
      toggle.querySelectorAll('span')[2].style.transform = open ? 'rotate(-45deg) translate(5px,-5px)' : '';
    });

    // Close on link click
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        drawer.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ─── SCROLL REVEAL ─── */
  function initScrollReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el) { observer.observe(el); });
  }

  /* ─── ROLE CYCLER (Hero) ─── */
  function initRoleCycler() {
    const el = document.getElementById('roleCycler');
    if (!el) return;

    const roles = [
      'Web Developer',
      'Frontend Engineer',
      'UI Builder',
      'Problem Solver',
      'Your Tech Partner'
    ];

    let i = 0;
    let charIdx = 0;
    let deleting = false;
    let timeout;

    function type() {
      const current = roles[i];
      if (!deleting) {
        el.textContent = current.substring(0, charIdx + 1);
        charIdx++;
        if (charIdx === current.length) {
          deleting = true;
          timeout = setTimeout(type, 1800);
          return;
        }
      } else {
        el.textContent = current.substring(0, charIdx - 1);
        charIdx--;
        if (charIdx === 0) {
          deleting = false;
          i = (i + 1) % roles.length;
        }
      }
      timeout = setTimeout(type, deleting ? 55 : 90);
    }

    type();
  }

  /* ─── ACTIVE NAV LINK ─── */
  function markActiveNavLink() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      const href = a.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) {
        a.classList.add('active');
      }
    });
  }

})();
