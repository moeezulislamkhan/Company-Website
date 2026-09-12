/**
 * Innovexa Technologies — Splash Screen
 * --------------------------------------
 * Frontend-only, canvas-based particle assembly. Particles start
 * scattered across the viewport, then converge into the shape and
 * color of the actual logo asset (sampled from assets/logo.jpg via
 * an offscreen canvas), cross-fade into the crisp logo image, then
 * reveal the company name. Shown once per browser session, only on
 * the Home page. No backend, no build step, no external libraries.
 */
(function () {
  'use strict';

  var splash = document.getElementById('splashScreen');
  if (!splash) return;

  var SESSION_KEY = 'innovexaSplashShown';

  // Skip entirely on repeat visits within the same session.
  var alreadyShown = false;
  try {
    alreadyShown = sessionStorage.getItem(SESSION_KEY) === '1';
  } catch (err) {
    /* Storage unavailable (private mode, etc.) — just show it once and move on. */
  }
  if (alreadyShown) {
    splash.parentNode.removeChild(splash);
    return;
  }

  document.documentElement.classList.add('splash-active');

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var logoEl = document.getElementById('splashLogo');
  var nameEl = document.getElementById('splashName');
  var canvas = document.getElementById('splashCanvas');
  var finished = false;

  function markSessionSeen() {
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (err) { /* ignore */ }
  }

  function finishSplash() {
    if (finished) return;
    finished = true;
    document.documentElement.classList.remove('splash-active');
    splash.classList.add('is-leaving');
    markSessionSeen();
    window.setTimeout(function () {
      if (splash.parentNode) splash.parentNode.removeChild(splash);
    }, 700);
  }

  // Absolute safety net: whatever happens (image fails to load, a
  // browser quirk stalls the animation, etc.) the splash must never
  // permanently block the site.
  var safetyTimer = window.setTimeout(finishSplash, 7000);

  /* ---------- Reduced motion: simple, fast, no particles ---------- */
  if (prefersReducedMotion) {
    if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    requestAnimationFrame(function () {
      logoEl.classList.add('is-visible');
    });
    window.setTimeout(function () { nameEl.classList.add('is-visible'); }, 450);
    window.setTimeout(function () {
      window.clearTimeout(safetyTimer);
      finishSplash();
    }, 1500);
    return;
  }

  /* ---------- Full particle-assembly sequence ---------- */
  if (!canvas || typeof canvas.getContext !== 'function') {
    fallbackSimple();
    return;
  }
  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  function sizeCanvas() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  sizeCanvas();
  window.addEventListener('resize', sizeCanvas);

  function fallbackSimple() {
    if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    logoEl.classList.add('is-visible');
    window.setTimeout(function () { nameEl.classList.add('is-visible'); }, 500);
    window.setTimeout(function () {
      window.clearTimeout(safetyTimer);
      finishSplash();
    }, 1700);
  }

  /* Sample the real logo image onto a small offscreen canvas and
     collect the coordinates + color of every "bright" pixel — that
     becomes the particle target field, so the particles assemble
     into the logo's actual shape and colors, not a generic silhouette. */
  function sampleLogoPoints(img, targetCount) {
    var sampleSize = 130;
    var off = document.createElement('canvas');
    off.width = sampleSize;
    off.height = sampleSize;
    var octx = off.getContext('2d');

    try {
      octx.drawImage(img, 0, 0, sampleSize, sampleSize);
      var data = octx.getImageData(0, 0, sampleSize, sampleSize).data;
    } catch (err) {
      // Tainted canvas (e.g. opened via file:// without a local server) —
      // caller falls back to the simple fade sequence.
      return null;
    }

    var points = [];
    for (var y = 0; y < sampleSize; y++) {
      for (var x = 0; x < sampleSize; x++) {
        var idx = (y * sampleSize + x) * 4;
        var r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];
        var luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        if (a > 40 && luminance > 32) {
          points.push({ nx: x / sampleSize, ny: y / sampleSize, r: r, g: g, b: b });
        }
      }
    }
    if (!points.length) return null;

    // Shuffle (Fisher–Yates) then cap to a device-appropriate count.
    for (var i = points.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = points[i];
      points[i] = points[j];
      points[j] = tmp;
    }
    return points.slice(0, Math.min(targetCount, points.length));
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function runParticles(points) {
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var isSmall = vw <= 640;
    var logoBoxSize = Math.min(vw * (isSmall ? 0.62 : 0.42), 220);
    var centerX = vw / 2;
    var centerY = vh / 2 - (isSmall ? 46 : 58);

    var particles = points.map(function (p) {
      var targetX = centerX + (p.nx - 0.5) * logoBoxSize;
      var targetY = centerY + (p.ny - 0.5) * logoBoxSize;

      // Genuinely uniform across the whole viewport — not radial from
      // the center — so particles read as scattered edge-to-edge,
      // not as a ring or blob around the logo's future position.
      var startX = 10 + Math.random() * (vw - 20);
      var startY = 10 + Math.random() * (vh - 20);

      return {
        x: startX, y: startY,
        startX: startX, startY: startY,
        targetX: targetX, targetY: targetY,
        size: 1.3 + Math.random() * 2.1,
        baseAlpha: 0.3 + Math.random() * 0.45,
        color: 'rgb(' + p.r + ',' + p.g + ',' + p.b + ')',
        delay: Math.random() * 320,
        curve: (Math.random() - 0.5) * 130,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 160 + Math.random() * 140
      };
    });

    var scatterHold = 420;
    var travelDuration = 1850;
    var totalDuration = scatterHold + travelDuration + 420;
    var startTime = null;

    function frame(now) {
      if (!startTime) startTime = now;
      var elapsed = now - startTime;
      ctx.clearRect(0, 0, vw, vh);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        var localElapsed = elapsed - scatterHold - p.delay;
        var t = localElapsed <= 0 ? 0 : Math.min(1, localElapsed / travelDuration);
        var eased = easeOutCubic(t);

        var midX = (p.startX + p.targetX) / 2;
        var midY = (p.startY + p.targetY) / 2;
        var dx = p.targetX - p.startX;
        var dy = p.targetY - p.startY;
        var len = Math.sqrt(dx * dx + dy * dy) || 1;
        var ctrlX = midX + (-dy / len) * p.curve;
        var ctrlY = midY + (dx / len) * p.curve;

        var tt = Math.max(0, Math.min(1, eased));
        var omt = 1 - tt;
        var x = omt * omt * p.startX + 2 * omt * tt * ctrlX + tt * tt * p.targetX;
        var y = omt * omt * p.startY + 2 * omt * tt * ctrlY + tt * tt * p.targetY;

        var appearProgress = Math.min(1, elapsed / scatterHold);
        var settleAlpha = 0.5 + 0.5 * Math.min(1, t);
        var alpha = appearProgress * (p.baseAlpha + (settleAlpha - p.baseAlpha) * Math.min(1, t));
        var wobble = t < 1 ? Math.sin(now / p.twinkleSpeed + p.twinkle) * 0.35 : 0;

        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.arc(x, y, Math.max(0.6, p.size + wobble), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (elapsed < totalDuration) {
        requestAnimationFrame(frame);
      } else {
        onAssembled();
      }
    }
    requestAnimationFrame(frame);
  }

  function onAssembled() {
    logoEl.classList.add('is-visible');
    window.setTimeout(function () { canvas.classList.add('is-fading'); }, 110);
    window.setTimeout(function () { nameEl.classList.add('is-visible'); }, 480);
    window.setTimeout(function () {
      window.clearTimeout(safetyTimer);
      finishSplash();
    }, 480 + 560 + 480);
  }

  var img = new Image();
  img.onload = function () {
    var targetCount = window.innerWidth <= 640 ? 420 : (window.innerWidth <= 1024 ? 650 : 900);
    var points = sampleLogoPoints(img, targetCount);
    if (!points) {
      fallbackSimple();
      return;
    }
    requestAnimationFrame(function () { runParticles(points); });
  };
  img.onerror = fallbackSimple;
  img.src = logoEl.getAttribute('src');

  // Pause the rAF loop's perceived cost when the tab isn't visible;
  // the safety timer still guarantees forward progress either way.
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && !finished) {
      window.clearTimeout(safetyTimer);
      safetyTimer = window.setTimeout(finishSplash, 7000);
    }
  });
})();
