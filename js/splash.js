/**
 * Innovexa Technologies — premium particle logo assembly
 *
 * Frontend only.
 *
 * The particles are sampled from the REAL logo asset so the
 * complete X + curved orbit/swoosh are reconstructed.
 */

(function () {
  'use strict';

  var splash = document.getElementById('splashScreen');
  var canvas = document.getElementById('splashCanvas');
  var img = document.getElementById('splashLogo');
  var name = document.getElementById('splashName');

  var reduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (!splash) return;

  document.documentElement.classList.add('splash-active');

  var done = false;
  var start = 0;
  var raf = 0;

  var particles = [];

  var W = 0;
  var H = 0;
  var dpr = 1;

  /*
   * Main particle assembly:
   *
   * 0.0s    scattered particles
   * 0.2s    particles begin moving
   * 2.45s   complete logo
   * 3.10s   logo + company name
   * 3.75s   splash starts leaving
   */

  var DURATION = 2450;
  var HOLD = 650;


  /* ==========================================================
     REMOVE SPLASH
     ========================================================== */

  function removeSplash() {

    if (done) return;

    done = true;

    cancelAnimationFrame(raf);

    document.documentElement.classList.remove(
      'splash-active'
    );

    splash.classList.add('is-leaving');

    window.setTimeout(function () {

      if (splash.parentNode) {
        splash.parentNode.removeChild(splash);
      }

    }, 850);
  }


  /* ==========================================================
     REDUCED MOTION
     ========================================================== */

  function reducedMotion() {

    splash.classList.add(
      'reduced-motion',
      'logo-ready'
    );

    if (name) {
      name.classList.add('is-visible');
    }

    window.setTimeout(
      removeSplash,
      1500
    );
  }


  if (
    reduced ||
    !canvas ||
    !img
  ) {

    reducedMotion();

    return;
  }


  /* ==========================================================
     CANVAS
     ========================================================== */

  var ctx = canvas.getContext(
    '2d',
    {
      alpha: true
    }
  );

  if (!ctx) {

    reducedMotion();

    return;
  }


  /* ==========================================================
     RESIZE
     ========================================================== */

  function resize() {

    W = window.innerWidth;
    H = window.innerHeight;

    dpr = Math.min(
      window.devicePixelRatio || 1,
      2
    );

    canvas.width =
      Math.floor(W * dpr);

    canvas.height =
      Math.floor(H * dpr);

    canvas.style.width =
      W + 'px';

    canvas.style.height =
      H + 'px';

    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );
  }

  resize();

  window.addEventListener(
    'resize',
    resize,
    {
      passive: true
    }
  );


  /* ==========================================================
     PREMIUM EASING
     ========================================================== */

  function ease(t) {

    t = Math.max(
      0,
      Math.min(1, t)
    );

    return 1 -
      Math.pow(
        1 - t,
        5
      );
  }


  /* ==========================================================
     DETECT BLUE LOGO PIXELS
     ========================================================== */

  function isLogoBlue(
    r,
    g,
    b
  ) {

    return (
      b > 65 &&
      b > r * 1.13 &&
      b > g * 0.88 &&
      (g + b) > 145
    );
  }


  /* ==========================================================
     BUILD EXACT PARTICLE TARGETS
     ========================================================== */

  function makeTargets() {

    var source =
      document.createElement(
        'canvas'
      );

    var size = 512;

    source.width = size;
    source.height = size;

    var sourceCtx =
      source.getContext(
        '2d',
        {
          willReadFrequently: true
        }
      );

    sourceCtx.drawImage(
      img,
      0,
      0,
      size,
      size
    );

    var data =
      sourceCtx.getImageData(
        0,
        0,
        size,
        size
      ).data;


    /*
     * First discover the COMPLETE emblem.
     *
     * This is the important correction.
     *
     * The old version sampled only:
     *
     * y = 30 → 150
     *
     * which caused the lower X and curved swoosh
     * to disappear.
     *
     * Now we scan the whole logo and automatically
     * find every blue pixel belonging to the emblem.
     */

    var minX = size;
    var minY = size;

    var maxX = -1;
    var maxY = -1;


    for (
      var y = 0;
      y < size;
      y += 2
    ) {

      for (
        var x = 0;
        x < size;
        x += 2
      ) {

        var p =
          (y * size + x) * 4;

        var r = data[p];
        var g = data[p + 1];
        var b = data[p + 2];

        if (
          isLogoBlue(
            r,
            g,
            b
          )
        ) {

          minX =
            Math.min(
              minX,
              x
            );

          minY =
            Math.min(
              minY,
              y
            );

          maxX =
            Math.max(
              maxX,
              x
            );

          maxY =
            Math.max(
              maxY,
              y
            );
        }
      }
    }


    if (maxX < 0) {
      return null;
    }


    var width =
      maxX - minX;

    var height =
      maxY - minY;


    var points = [];


    /*
     * More particles = much more complete logo.
     *
     * Desktop:
     * every ~2 pixels
     *
     * Mobile:
     * every ~3 pixels
     */

    var stride =
      window.innerWidth < 600
        ? 3
        : 2;


    for (
      var py = minY;
      py <= maxY;
      py += stride
    ) {

      for (
        var px = minX;
        px <= maxX;
        px += stride
      ) {

        var i =
          (py * size + px) * 4;

        var r = data[i];
        var g = data[i + 1];
        var b = data[i + 2];


        if (
          !isLogoBlue(
            r,
            g,
            b
          )
        ) {
          continue;
        }


        /*
         * Slight randomness keeps the particle field
         * organic without destroying the final logo.
         */

        if (
          Math.random() >
          (
            window.innerWidth < 600
              ? 0.74
              : 0.88
          )
        ) {

          continue;
        }


        points.push({

          x:
            (px - minX) /
            width,

          y:
            (py - minY) /
            height,

          r: r,
          g: g,
          b: b

        });
      }
    }


    return points.length > 400
      ? points
      : null;
  }


  /* ==========================================================
     INITIALIZE PARTICLES
     ========================================================== */

  function init(targets) {

    var maxParticles =
      W < 600
        ? 1500
        : (
            W < 1100
              ? 2300
              : 3000
          );


    /*
     * Protect mobile performance.
     */

    if (
      targets.length >
      maxParticles
    ) {

      var step =
        targets.length /
        maxParticles;

      targets =
        targets.filter(
          function (_, i) {

            return (
              i %
              Math.ceil(step)
            ) === 0;

          }
        );
    }


    /* ========================================================
       LOGO POSITION
       ======================================================== */

    var markW =
      Math.min(
        520,
        Math.max(
          285,
          W * 0.42
        )
      );


    var markH =
      markW * 0.71;


    if (H < 700) {

      markW =
        Math.min(
          markW,
          W * 0.72
        );
    }


    markH =
      markW * 0.71;


    var left =
      (W - markW) / 2;


    var top =
      H * 0.5 -
      markH * 0.64;


    /* ========================================================
       CREATE PARTICLES
       ======================================================== */

    particles =
      targets.map(
        function (t, index) {

          var angle =
            Math.random() *
            Math.PI *
            2;


          var distance =
            Math.min(W, H) *
            (
              0.15 +
              Math.random() *
              0.52
            );


          /*
           * Fully scattered starting positions.
           */

          var sx =
            Math.random() * W;

          var sy =
            Math.random() * H;


          /*
           * Slight natural directional variation.
           */

          sx +=
            Math.cos(angle) *
            distance *
            0.18;

          sy +=
            Math.sin(angle) *
            distance *
            0.18;


          return {

            x: sx,
            y: sy,

            sx: sx,
            sy: sy,

            /*
             * EXACT final particle position
             */

            tx:
              left +
              t.x *
              markW,

            ty:
              top +
              t.y *
              markH,


            /*
             * Particle appearance
             */

            r:
              0.62 +
              Math.random() *
              1.25,

            alpha:
              0.42 +
              Math.random() *
              0.52,


            /*
             * EXACT logo color
             */

            cr: t.r,
            cg: t.g,
            cb: t.b,


            /*
             * Organic movement
             */

            phase:
              Math.random() *
              Math.PI *
              2,

            drift:
              7 +
              Math.random() *
              16,


            /*
             * Slight stagger.
             */

            delay:
              Math.random() *
              280,


            /*
             * Occasional glow particles.
             */

            glow:
              index % 15 === 0
          };
        }
      );


    start =
      performance.now();


    render(start);
  }


  /* ==========================================================
     RENDER
     ========================================================== */

  function render(now) {

    if (done) return;


    ctx.clearRect(
      0,
      0,
      W,
      H
    );


    var elapsed =
      now - start;


    var finished =
      elapsed >= DURATION;


    particles.forEach(
      function (p) {

        var t =
          Math.max(
            0,
            Math.min(
              1,
              (
                elapsed -
                p.delay
              ) /
              (
                DURATION -
                p.delay
              )
            )
          );


        var e =
          ease(t);


        var remaining =
          1 - t;


        /*
         * Subtle movement while particles travel.
         *
         * This prevents a robotic straight-line effect.
         */

        var sway =
          Math.sin(
            p.phase +
            elapsed *
            0.0015
          ) *
          p.drift *
          remaining;


        var swayY =
          Math.cos(
            p.phase +
            elapsed *
            0.00115
          ) *
          p.drift *
          remaining;


        var x =
          p.sx +
          (
            p.tx -
            p.sx
          ) *
          e +
          sway;


        var y =
          p.sy +
          (
            p.ty -
            p.sy
          ) *
          e +
          swayY;


        var alpha =
          p.alpha *
          (
            t < 0.08
              ? t / 0.08
              : 1
          );


        /*
         * Once assembled, lock every particle exactly
         * onto its target. This creates a clean finished logo.
         */

        if (finished) {

          x = p.tx;
          y = p.ty;

          alpha =
            Math.min(
              1,
              p.alpha + 0.16
            );
        }


        /* Particle */

        ctx.beginPath();

        ctx.fillStyle =
          'rgba(' +
          p.cr +
          ',' +
          p.cg +
          ',' +
          p.cb +
          ',' +
          alpha +
          ')';


        ctx.arc(
          x,
          y,
          p.r,
          0,
          Math.PI * 2
        );

        ctx.fill();


        /*
         * Very subtle particle glow near completion.
         */

        if (
          p.glow &&
          t > 0.78
        ) {

          ctx.beginPath();

          ctx.fillStyle =
            'rgba(115,178,255,' +
            (
              alpha *
              0.07
            ) +
            ')';


          ctx.arc(
            x,
            y,
            p.r * 5.2,
            0,
            Math.PI * 2
          );

          ctx.fill();
        }

      }
    );


    /* ========================================================
       LOGO COMPLETE
       ======================================================== */

    if (
      elapsed >=
      DURATION + 100
    ) {

      splash.classList.add(
        'logo-ready'
      );


      if (name) {
        name.classList.add(
          'is-visible'
        );
      }
    }


    /* ========================================================
       TRANSITION TO HOME
       ======================================================== */

    if (
      elapsed >=
      DURATION + HOLD
    ) {

      removeSplash();

      return;
    }


    raf =
      requestAnimationFrame(
        render
      );
  }


  /* ==========================================================
     BOOT
     ========================================================== */

  function boot() {

    function ready() {

      var targets =
        makeTargets();


      if (targets) {

        init(targets);

      } else {

        reducedMotion();
      }
    }


    img.onload =
      ready;


    if (img.complete) {
      ready();
    }
  }


  /*
   * Safety fallback.
   */

  window.setTimeout(
    function () {

      if (
        !done &&
        !particles.length
      ) {

        reducedMotion();
      }

    },
    5000
  );


  boot();

})();