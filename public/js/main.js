/* ============================================================
   Integrative Health Partners — Main JS
   ============================================================ */

(function () {
  'use strict';

  /* --- Navigation --- */
  const nav = document.getElementById('main-nav');
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('nav-mobile');
  const isHome = document.body.dataset.page === 'home';

  function updateNav() {
    if (!nav) return;
    const scrolled = window.scrollY > 60;
    if (isHome) {
      nav.classList.toggle('transparent', !scrolled);
      nav.classList.toggle('scrolled', scrolled);
    } else {
      nav.classList.add('opaque');
      nav.classList.remove('transparent');
    }
  }

  if (nav) {
    updateNav();
    window.addEventListener('scroll', updateNav, { passive: true });
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      const open = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }

  /* Close mobile menu on link click */
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        if (hamburger) hamburger.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* --- Testimonial Carousel --- */
  var testimonials = document.querySelectorAll('.testimonial');
  var tmDots = document.querySelectorAll('.tm-dot');
  var tmPrev = document.getElementById('tm-prev');
  var tmNext = document.getElementById('tm-next');
  var tmCurrent = 0;
  var tmTimer = null;

  function showTestimonial(index) {
    if (!testimonials.length) return;
    testimonials.forEach(function (t, i) {
      t.classList.toggle('active', i === index);
    });
    tmDots.forEach(function (d, i) {
      d.classList.toggle('active', i === index);
    });
    tmCurrent = index;
  }

  function nextTestimonial() {
    showTestimonial((tmCurrent + 1) % testimonials.length);
  }
  function prevTestimonial() {
    showTestimonial((tmCurrent - 1 + testimonials.length) % testimonials.length);
  }

  if (testimonials.length) {
    showTestimonial(0);
    tmTimer = setInterval(nextTestimonial, 5000);
    if (tmPrev) tmPrev.addEventListener('click', function () { clearInterval(tmTimer); prevTestimonial(); tmTimer = setInterval(nextTestimonial, 5000); });
    if (tmNext) tmNext.addEventListener('click', function () { clearInterval(tmTimer); nextTestimonial(); tmTimer = setInterval(nextTestimonial, 5000); });
    tmDots.forEach(function (d, i) {
      d.addEventListener('click', function () { clearInterval(tmTimer); showTestimonial(i); tmTimer = setInterval(nextTestimonial, 5000); });
    });
  }

  /* --- FAQ Accordion --- */
  document.querySelectorAll('.faq-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var body = item ? item.querySelector('.faq-body') : null;
      var isOpen = btn.classList.contains('open');
      /* Close all */
      document.querySelectorAll('.faq-btn.open').forEach(function (b) {
        b.classList.remove('open');
        var bBody = b.closest('.faq-item') ? b.closest('.faq-item').querySelector('.faq-body') : null;
        if (bBody) bBody.classList.remove('open');
      });
      /* Open clicked (if it wasn't open) */
      if (!isOpen && body) {
        btn.classList.add('open');
        body.classList.add('open');
      }
    });
  });

  /* --- Scroll Reveal (Intersection Observer) --- */
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    /* Fallback: show all */
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* --- Blog Page: load posts --- */
  var blogGrid = document.getElementById('blog-grid');
  if (blogGrid) {
    /* Blog posts are server-rendered — no JS fetch needed */
  }

  /* --- Blog Post Page: ensure content is visible --- */
  var postContent = document.querySelector('.blog-post-content');
  if (postContent) {
    /* Content is server-rendered already */
  }

  /* --- Smooth scroll for anchor links --- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

})();
