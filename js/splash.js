/**
 * Innovexa Technologies — cinematic particle assembly
 * FRONTEND ONLY
 *
 * The visible logo is NEVER rendered as an image.
 * logo.jpg is loaded invisibly only as a pixel-sampling source.
 *
 * Sequence:
 * 0.0–0.4s  scattered particles
 * 0.4–2.7s  particles assemble the complete X + swoosh
 * 2.7–3.1s logo settles / brightens
 * 3.1–3.9s Innovation Technology assembles
 * 3.9–4.6s hold
 * 4.6s+     smooth splash exit
 */

(function () {
  'use strict';

  var splash = document.getElementById('splashScreen');
  var canvas = document.getElementById('splashCanvas');
  var sourceLogo = document.getElementById('splashLogo');
  var name = document.getElementById('splashName');

  if (!splash || !canvas || !sourceLogo) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });

  if (!ctx) return;

  document.documentElement.classList.add('splash-active');

  var W = 0, H = 0, DPR = 1;
  var particles = [];
  var connections = [];
  var finished = false;
  var startTime = 0;
  var raf = 0;

  var LOGO_TIME = 2500;
  var LOGO_HOLD = 350;
  var TEXT_TIME = 850;
  var FINAL_HOLD = 600;

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    DPR = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  function ease(t) {
    t = Math.max(0, Math.min(1, t));
    return t * t * (3 - 2 * t);
  }

  function easeOutQuint(t) {
    t = Math.max(0, Math.min(1, t));
    return 1 - Math.pow(1 - t, 5);
  }

  function bluePixel(r, g, b) {
    return (
      b > 55 &&
      b > r * 1.12 &&
      b > g * 0.84 &&
      (g + b) > 125
    );
  }

  /*
   * The source image contains the exact X + swoosh in the upper
   * portion and the company text below it. We deliberately sample
   * ONLY the emblem area, so the final particle logo is the exact
   * X + swoosh and never accidentally includes the source JPG text.
   */
  function getLogoTargets() {
    var off = document.createElement('canvas');
    var size = 900;
    off.width = size;
    off.height = size;

    var octx = off.getContext('2d', { willReadFrequently: true });
    octx.drawImage(sourceLogo, 0, 0, size, size);

    var data = octx.getImageData(0, 0, size, size).data;

    /* Source logo emblem crop: approximately x=130..1120,
       y=270..735 on the original 1254×1254 artwork. */
    var sx0 = 92;
    var sx1 = 805;
    var sy0 = 195;
    var sy1 = 530;

    var minX = size, minY = size, maxX = -1, maxY = -1;

    for (var y = sy0; y <= sy1; y += 1) {
      for (var x = sx0; x <= sx1; x += 1) {
        var i = (y * size + x) * 4;

        if (bluePixel(data[i], data[i + 1], data[i + 2])) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX < 0) return [];

    var width = maxX - minX || 1;
    var height = maxY - minY || 1;
    var points = [];

    /* Dense sampling. No random deletion.
       Every visible blue region receives particles. */
    var stride = W < 600 ? 2.25 : 1.45;

    for (var py = minY; py <= maxY; py += stride) {
      for (var px = minX; px <= maxX; px += stride) {
        var p = (Math.floor(py) * size + Math.floor(px)) * 4;
        var r = data[p], g = data[p + 1], b = data[p + 2];

        if (!bluePixel(r, g, b)) continue;

        points.push({
          x: (px - minX) / width,
          y: (py - minY) / height,
          r: r,
          g: g,
          b: b
        });
      }
    }

    return points;
  }

  function getTextTargets(text, fontSize, weight, tracking) {
    var off = document.createElement('canvas');
    var octx = off.getContext('2d', { willReadFrequently: true });

    var font = weight + ' ' + fontSize + 'px Inter, Arial, sans-serif';
    octx.font = font;

    var measured = octx.measureText(text).width + 60;
    off.width = Math.ceil(measured);
    off.height = Math.ceil(fontSize * 1.55);

    octx.font = font;
    octx.textBaseline = 'middle';
    octx.textAlign = 'left';
    octx.fillStyle = '#ffffff';

    /* Small tracking is applied by drawing letters individually. */
    octx.clearRect(0, 0, off.width, off.height);

    var x = 30;
    var y = off.height / 2;

    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      octx.fillText(ch, x, y);
      x += octx.measureText(ch).width + tracking;
    }

    var data = octx.getImageData(0, 0, off.width, off.height).data;
    var points = [];
    var stride = W < 600 ? 2.5 : 2;

    for (var py = 0; py < off.height; py += stride) {
      for (var px = 0; px < off.width; px += stride) {
        var p = (Math.floor(py) * off.width + Math.floor(px)) * 4;

        if (data[p + 3] < 110) continue;

        points.push({
          x: px / off.width,
          y: py / off.height,
          r: 238,
          g: 242,
          b: 247
        });
      }
    }

    return points;
  }

  function makeParticles() {
    var logoTargets = getLogoTargets();

    if (!logoTargets.length) return false;

    var logoW = Math.min(
      W * (W < 600 ? 0.82 : 0.42),
      W < 600 ? 410 : 560
    );

    var logoH = logoW * 0.64;

    var logoLeft = (W - logoW) / 2;
    var logoTop = H * 0.5 - logoH * 0.82;

    var logoParticles = logoTargets.map(function (t, index) {
      var angle = Math.random() * Math.PI * 2;
      var radius = Math.min(W, H) * (0.18 + Math.random() * 0.48);

      return {
        group: 'logo',

        sx: Math.random() * W + Math.cos(angle) * radius * 0.12,
        sy: Math.random() * H + Math.sin(angle) * radius * 0.12,

        tx: logoLeft + t.x * logoW,
        ty: logoTop + t.y * logoH,

        r: 0.82 + Math.random() * 1.18,
        alpha: 0.56 + Math.random() * 0.38,

        cr: t.r,
        cg: t.g,
        cb: t.b,

        phase: Math.random() * Math.PI * 2,
        drift: 5 + Math.random() * 12,

        delay: Math.random() * 220,

        _x: 0,
        _y: 0,
        _t: 0
      };
    });

    /* Text is created after the logo settles.
       It is still made entirely from particles. */
    var textSize = Math.max(
      22,
      Math.min(34, W * 0.036)
    );

    var innovation = getTextTargets(
      'Innovation',
      textSize,
      600,
      Math.max(0.3, textSize * 0.035)
    );

    var technology = getTextTargets(
      'Technology',
      textSize,
      600,
      Math.max(0.3, textSize * 0.035)
    );

    var textMaxWidth = Math.max(
      innovation.length,
      technology.length
    );

    var textScale = Math.min(
      1,
      (W * 0.76) / Math.max(1, textMaxWidth * 2.05)
    );

    var textW = Math.min(W * 0.72, 500);
    var textH = textSize * 1.35;

    function addText(points, offsetX, color) {
      return points.map(function (t, index) {
        var angle = Math.random() * Math.PI * 2;
        var radius = Math.min(W, H) * (0.12 + Math.random() * 0.42);

        return {
          group: 'text',

          sx: Math.random() * W + Math.cos(angle) * radius * 0.08,
          sy: Math.random() * H + Math.sin(angle) * radius * 0.08,

          tx:
            (W - textW) / 2 +
            offsetX +
            t.x * textW * textScale,

          ty:
            logoTop +
            logoH +
            42 +
            t.y * textH,

          r: 0.7 + Math.random() * 1.05,
          alpha: 0.48 + Math.random() * 0.42,

          cr: color[0],
          cg: color[1],
          cb: color[2],

          phase: Math.random() * Math.PI * 2,
          drift: 3 + Math.random() * 7,

          delay: Math.random() * 130,

          _x: 0,
          _y: 0,
          _t: 0
        };
      });
    }

    /* Center each word. */
    var innovationWidth = textW * textScale;
    var technologyWidth = textW * textScale;

    var textParticles = [];

    textParticles = textParticles.concat(
      addText(
        innovation,
        (textW - innovationWidth) * 0.5,
        [238, 242, 247]
      )
    );

    textParticles = textParticles.concat(
      addText(
        technology,
        (textW - technologyWidth) * 0.5,
        [47, 134, 255]
      )
    );

    particles = logoParticles.concat(textParticles);

    return true;
  }

  function buildConnections() {
    var links = [];
    var grid = Object.create(null);
    var cell = 7;

    particles.forEach(function (p, index) {
      var gx = Math.floor(p.tx / cell);
      var gy = Math.floor(p.ty / cell);
      var key = gx + ':' + gy;

      if (!grid[key]) grid[key] = [];
      grid[key].push(index);
    });

    particles.forEach(function (p, index) {
      var gx = Math.floor(p.tx / cell);
      var gy = Math.floor(p.ty / cell);

      for (var yy = -1; yy <= 1; yy++) {
        for (var xx = -1; xx <= 1; xx++) {
          var key = (gx + xx) + ':' + (gy + yy);
          var bucket = grid[key];

          if (!bucket) continue;

          bucket.forEach(function (otherIndex) {
            if (otherIndex <= index) return;

            var q = particles[otherIndex];

            if (p.group !== q.group) return;

            var dx = p.tx - q.tx;
            var dy = p.ty - q.ty;
            var distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= 6.2) {
              links.push({
                a: index,
                b: otherIndex
              });
            }
          });
        }
      }
    });

    return links;
  }

  function drawConnections(now) {
    connections.forEach(function (link) {
      var a = particles[link.a];
      var b = particles[link.b];

      var progress = Math.min(a._t, b._t);

      if (progress < 0.08) return;

      var strength = Math.pow(progress, 2.6);

      ctx.beginPath();
      ctx.moveTo(a._x, a._y);
      ctx.lineTo(b._x, b._y);

      var r = Math.round((a.cr + b.cr) / 2);
      var g = Math.round((a.cg + b.cg) / 2);
      var bl = Math.round((a.cb + b.cb) / 2);

      ctx.strokeStyle =
        'rgba(' +
        r + ',' +
        g + ',' +
        bl + ',' +
        (0.025 + strength * 0.22) +
        ')';

      ctx.lineWidth =
        0.35 +
        strength * 0.42;

      ctx.stroke();
    });
  }

  function drawParticle(p, x, y, alpha, assembled) {
    ctx.beginPath();

    ctx.fillStyle =
      'rgba(' +
      p.cr + ',' +
      p.cg + ',' +
      p.cb + ',' +
      alpha +
      ')';

    ctx.arc(
      x,
      y,
      p.r * (assembled ? 1.05 : 1),
      0,
      Math.PI * 2
    );

    ctx.fill();

    if (assembled && p.r > 1.2) {
      ctx.beginPath();

      ctx.fillStyle =
        'rgba(' +
        p.cr + ',' +
        p.cg + ',' +
        p.cb + ',' +
        (alpha * 0.055) +
        ')';

      ctx.arc(
        x,
        y,
        p.r * 4.5,
        0,
        Math.PI * 2
      );

      ctx.fill();
    }
  }

  function removeSplash() {
    if (finished) return;

    finished = true;
    cancelAnimationFrame(raf);

    splash.classList.add('is-leaving');
    document.documentElement.classList.remove('splash-active');

    window.setTimeout(function () {
      if (splash.parentNode) splash.parentNode.removeChild(splash);
    }, 850);
  }

  function render(now) {
    if (finished) return;

    var elapsed = now - startTime;

    ctx.clearRect(0, 0, W, H);

    particles.forEach(function (p) {
      var isLogo = p.group === 'logo';

      var localStart = isLogo ? 250 : LOGO_TIME + LOGO_HOLD;
      var localDuration = isLogo ? LOGO_TIME : TEXT_TIME;

      var raw =
        (elapsed - localStart - p.delay) /
        (localDuration - p.delay);

      var t = Math.max(0, Math.min(1, raw));
      var e = easeOutQuint(t);

      var remaining = 1 - t;

      var sway =
        Math.sin(
          p.phase + elapsed * 0.00125
        ) *
        p.drift *
        remaining;

      var swayY =
        Math.cos(
          p.phase + elapsed * 0.00105
        ) *
        p.drift *
        remaining;

      var x =
        p.sx +
        (p.tx - p.sx) * e +
        sway;

      var y =
        p.sy +
        (p.ty - p.sy) * e +
        swayY;

      if (t >= 1) {
        x = p.tx;
        y = p.ty;
      }

      p._x = x;
      p._y = y;
      p._t = t;

      var alpha = p.alpha;

      if (t < 0.12) {
        alpha *= t / 0.12;
      }

      if (!isLogo && elapsed < LOGO_TIME + LOGO_HOLD) {
        alpha = 0;
      }

      drawParticle(
        p,
        x,
        y,
        alpha,
        t > 0.78
      );
    });

    drawConnections(now);

    /* Logo completed. */
    if (elapsed >= LOGO_TIME + 80) {
      splash.classList.add('logo-ready');
    }

    /* Text completed. */
    if (elapsed >= LOGO_TIME + LOGO_HOLD + TEXT_TIME * 0.72) {
      if (name) name.classList.add('is-visible');
    }

    /* End. */
    if (
      elapsed >=
      LOGO_TIME +
      LOGO_HOLD +
      TEXT_TIME +
      FINAL_HOLD
    ) {
      removeSplash();
      return;
    }

    raf = requestAnimationFrame(render);
  }

  function start() {
    if (!makeParticles()) return;

    connections = buildConnections();

    startTime = performance.now();

    if (reduced) {
      particles.forEach(function (p) {
        p.sx = p.tx;
        p.sy = p.ty;
      });

      splash.classList.add('logo-ready');

      if (name) name.classList.add('is-visible');

      render(startTime + 5000);

      window.setTimeout(removeSplash, 1400);
      return;
    }

    raf = requestAnimationFrame(render);
  }

  /*
   * The source image is ONLY loaded for pixel sampling.
   * It has opacity:0 in CSS and is never drawn to the splash.
   */
  if (sourceLogo.complete) {
    start();
  } else {
    sourceLogo.addEventListener('load', start, { once: true });
  }

  /* Safety fallback. */
  window.setTimeout(function () {
    if (!finished && !particles.length) {
      removeSplash();
    }
  }, 6500);
})();
