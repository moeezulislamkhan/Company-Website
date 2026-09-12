document.addEventListener('DOMContentLoaded', function () {
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Active nav link (multi-page) ----------
     Matches the current URL against each nav link's path, so the
     right item is highlighted whether pages are served as
     /about.html or rewritten to a clean /about route. */
  (function setActiveNavLink() {
    var path = window.location.pathname.replace(/\/index\.html$/, '/');
    var normalized = path === '/' || path === '' ? 'index' : path.replace(/^\/|\.html$|\/$/g, '');
    if (normalized === '') normalized = 'index';

    document.querySelectorAll('.main-nav a[href]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      var linkPath = href.replace(/^\/|\.html$|\/$/g, '');
      if (linkPath === '') linkPath = 'index';
      if (linkPath === normalized) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  })();

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close mobile nav after clicking a link
    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Header scroll state + back-to-top ---------- */
  var header = document.getElementById('header');
  var backToTop = document.getElementById('backToTop');

  function onScroll() {
    var scrolled = window.scrollY > 12;
    if (header) header.classList.toggle('is-scrolled', scrolled);
    if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 500);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Scroll reveal ----------
     Elements with .reveal fade + rise into place once, the moment
     they enter the viewport. --reveal-i (set inline in the HTML)
     staggers cards within the same group. Falls back to showing
     everything immediately if IntersectionObserver isn't available
     or the person prefers reduced motion. */
  var revealEls = document.querySelectorAll('.reveal');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  } else if (revealEls.length) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });

    // Safety net: if something is never observed as intersecting
    // (e.g. it's already in view but the browser fires late), reveal
    // everything after a short delay so content is never stuck hidden.
    window.setTimeout(function () {
      revealEls.forEach(function (el) { el.classList.add('in-view'); });
    }, 2500);
  }

  /* ---------- Page transition on internal navigation ----------
     A short, subtle fade-out before leaving the page so the switch
     to the next page feels like one continuous experience rather
     than a hard cut. Only intercepts plain left-clicks on same-site
     .html links; new tabs, downloads, external and anchor links are
     left completely alone. */
  if (!prefersReducedMotion) {
    document.querySelectorAll('a[href]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;
      var isHashOnly = href.charAt(0) === '#';
      var isExternalScheme = /^(https?:)?\/\//.test(href) || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0;
      var isHtmlPage = /\.html(#.*)?$/.test(href);
      if (isHashOnly || isExternalScheme || !isHtmlPage) return;
      if (link.target && link.target !== '' && link.target !== '_self') return;

      link.addEventListener('click', function (e) {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        document.body.classList.add('is-leaving');
        window.setTimeout(function () {
          window.location.href = href;
        }, 180);
      });
    });
  }

  /* ---------- Contact form validation + submission ---------- */
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');
  var submitBtn = document.getElementById('submitBtn');
  var submitLabel = submitBtn ? submitBtn.querySelector('.btn-label') : null;

  function setSubmitLabel(text) {
    if (submitLabel) {
      submitLabel.textContent = text;
    } else if (submitBtn) {
      submitBtn.textContent = text;
    }
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors();

      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var subject = form.subject.value.trim();
      var message = form.message.value.trim();
      var valid = true;

      if (name.length < 2) {
        showError('name', 'Please enter your full name.');
        valid = false;
      }
      if (!isValidEmail(email)) {
        showError('email', 'Please enter a valid email address.');
        valid = false;
      }
      if (subject.length < 3) {
        showError('subject', 'Please add a short subject.');
        valid = false;
      }
      if (message.length < 10) {
        showError('message', 'Tell us a bit more about your project (10+ characters).');
        valid = false;
      }

      if (!valid) {
        setStatus('Please fix the highlighted fields.', 'error');
        return;
      }

      submitBtn.disabled = true;
      setSubmitLabel('Sending...');
      setStatus('', '');

      // Frontend-only: no backend, API, or database involved. This
      // simulates network latency so the loading state is visible,
      // then shows a professional success message and resets the form.
      window.setTimeout(function () {
        form.reset();
        submitBtn.disabled = false;
        setSubmitLabel('Send message');
        setStatus('Thanks! Your message has been received — we\'ll be in touch shortly.', 'success');
      }, 900);
    });
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function showError(fieldName, message) {
    var field = form.querySelector('[name="' + fieldName + '"]');
    var errorEl = form.querySelector('.field-error[data-for="' + fieldName + '"]');
    if (field) field.closest('.form-field').classList.add('error');
    if (errorEl) errorEl.textContent = message;
  }

  function clearErrors() {
    form.querySelectorAll('.form-field').forEach(function (f) { f.classList.remove('error'); });
    form.querySelectorAll('.field-error').forEach(function (e) { e.textContent = ''; });
  }

  function setStatus(message, type) {
    if (!status) return;
    status.textContent = message;
    status.className = 'form-status' + (type ? ' ' + type : '');
  }
});

/* Show the page immediately if it's reached via back/forward cache
   (bfcache) so a previous is-leaving fade doesn't linger. */
window.addEventListener('pageshow', function (event) {
  document.body.classList.remove('is-leaving');
});
