(function () {
  'use strict';

  if (window.top !== window.self || document.getElementById('shared-shell-host')) return;

  document.querySelectorAll('body > header.site-header, body > footer.site-footer').forEach(function (element) {
    element.remove();
  });

  var host = document.createElement('div');
  host.id = 'shared-shell-host';
  host.setAttribute('aria-live', 'polite');
  document.body.insertBefore(host, document.body.firstChild);

  var footerHost = document.createElement('div');
  footerHost.id = 'shared-shell-footer-host';
  footerHost.setAttribute('aria-live', 'polite');
  document.body.appendChild(footerHost);

  var shadow = host.attachShadow({ mode: 'open' });
  var footerShadow = footerHost.attachShadow({ mode: 'open' });
  var baseUrl = new URL('index.html', document.baseURI);

  fetch(baseUrl.href)
    .then(function (response) {
      if (!response.ok) throw new Error('Unable to load the shared site shell.');
      return response.text();
    })
    .then(function (html) {
      var documentParser = new DOMParser();
      var master = documentParser.parseFromString(html, 'text/html');
      var masterStyle = master.querySelector('style');
      var header = master.querySelector('body > header');
      var footer = master.querySelector('body > footer');
      if (!header || !footer) throw new Error('The master header or footer is missing from index.html.');

      var style = document.createElement('style');
      if (masterStyle) {
        style.textContent = masterStyle.textContent
          .replace(/:root\s*\{/g, ':host{')
          .replace(/body\s*\{/g, ':host{');
      }
      shadow.appendChild(style.cloneNode(true));
      footerShadow.appendChild(style);
      shadow.appendChild(header.cloneNode(true));
      footerShadow.appendChild(footer.cloneNode(true));

      shadow.querySelectorAll('a[href]').forEach(function (link) {
        var href = link.getAttribute('href');
        if (href && href.charAt(0) === '#') {
          link.setAttribute('href', 'index.html' + href);
        }
      });

      var nav = shadow.querySelector('#mainNav');
      var toggle = shadow.querySelector('#menuToggle');
      if (nav && toggle) {
        toggle.addEventListener('click', function () {
          toggle.classList.toggle('active');
          nav.classList.toggle('open');
        });
        nav.querySelectorAll('a').forEach(function (link) {
          link.addEventListener('click', function () {
            toggle.classList.remove('active');
            nav.classList.remove('open');
          });
        });
      }

      var currentPage = window.location.pathname.split('/').pop() || 'index.html';
      shadow.querySelectorAll('.main-nav a[href]').forEach(function (link) {
        var href = link.getAttribute('href').split('#')[0];
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        }
      });

      window.dispatchEvent(new CustomEvent('shared-shell-ready'));
    })
    .catch(function (error) {
      host.remove();
      footerHost.remove();
      console.error(error);
    });
})();
