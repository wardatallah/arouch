const translations = {};
const RTL_LANGS = new Set(['ar']);
const SUPPORTED_LANGS = ['en', 'fr', 'ar'];

async function loadLanguage(lang) {
  if (translations[lang]) return translations[lang];
  const res = await fetch(`languages/${lang}.json`);
  translations[lang] = await res.json();
  return translations[lang];
}

async function setLanguage(lang) {
  const t = await loadLanguage(lang);
  if (!t) return;

  const isRtl = RTL_LANGS.has(lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  document.body.classList.toggle('rtl', isRtl);

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] === undefined) return;

    if (el.tagName === 'OPTION') {
      el.textContent = t[key];
    } else if (el.hasAttribute('data-i18n-html')) {
      el.innerHTML = t[key];
    } else {
      el.textContent = t[key];
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key] !== undefined) el.placeholder = t[key];
  });

  document.title = `Garage Arouch — ${t.logoTagline}`;

  document.getElementById('langCurrent').textContent = lang.toUpperCase();
  document.querySelectorAll('.lang-option').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  localStorage.setItem('ga_lang', lang);
}

document.addEventListener('DOMContentLoaded', () => {

  // Navbar scroll effect
  const navbar = document.getElementById('navbar');
  const handleScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  // Language switcher
  const langBtn = document.getElementById('langBtn');
  const langDropdown = document.getElementById('langDropdown');

  langBtn.addEventListener('click', e => {
    e.stopPropagation();
    langDropdown.classList.toggle('open');
  });

  document.addEventListener('click', () => {
    langDropdown.classList.remove('open');
  });

  langDropdown.querySelectorAll('.lang-option').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      setLanguage(btn.dataset.lang);
      langDropdown.classList.remove('open');
    });
  });

  const savedLang = localStorage.getItem('ga_lang') || 'fr';
  setLanguage(savedLang);

  // Scroll-reveal animation
  const fadeElements = document.querySelectorAll(
    '.service-card, .about-content, .about-image, .gallery-item, .testimonial-card, .contact-info, .contact-form'
  );

  fadeElements.forEach(el => el.classList.add('fade-in'));

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  fadeElements.forEach(el => observer.observe(el));

  // Contact form handling
  const form = document.getElementById('contactForm');
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const lang = document.documentElement.lang || 'fr';
    const t = await loadLanguage(lang);
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = t.formSending;
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = t.formSent;
      btn.style.background = '#22c55e';

      setTimeout(() => {
        btn.textContent = t.formSubmit;
        btn.style.background = '';
        btn.disabled = false;
        form.reset();
      }, 2500);
    }, 1200);
  });

});
