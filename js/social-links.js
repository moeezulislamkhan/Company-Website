(function () {
  'use strict';

  var profiles = {
    facebook: 'https://www.facebook.com/share/14mkxaJNSre/',
    instagram: 'https://www.instagram.com/innovexatechnologies_01?igsh=MWFoNDU5NzIyZDdqdg==',
    linkedin: 'https://www.linkedin.com/company/innovexa-digital/',
    x: 'https://x.com/innovexatech_01',
    tiktok: 'https://vt.tiktok.com/ZSVKH9Ssy/',
    whatsapp: 'https://wa.me/923247943761',
    github: 'https://github.com/innovexatechnologies'
  };

  document.querySelectorAll('.social-icons a, .socials a').forEach(function (link) {
    var label = (link.getAttribute('aria-label') || link.textContent || '').toLowerCase();
    var key = label.indexOf('facebook') >= 0 ? 'facebook' :
      label.indexOf('instagram') >= 0 ? 'instagram' :
      label.indexOf('linkedin') >= 0 ? 'linkedin' :
      label.indexOf('tiktok') >= 0 ? 'tiktok' :
      label.indexOf('whatsapp') >= 0 ? 'whatsapp' :
      label.indexOf('github') >= 0 || label.indexOf('youtube') >= 0 ? 'github' :
      label.indexOf('x') >= 0 || label.indexOf('twitter') >= 0 ? 'x' : null;

    if (key) {
      link.href = profiles[key];
      link.target = '_blank';
      link.rel = 'noopener';
      if (key === 'github') {
        link.setAttribute('aria-label', 'GitHub');
        link.title = 'GitHub';
      }
    }
  });
})();
