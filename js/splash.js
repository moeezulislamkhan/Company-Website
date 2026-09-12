/**
 * Innovexa Technologies — Particle Logo Splash
 * ------------------------------------------------------------
 * PARTICLE LOGO ASSEMBLY
 *
 * The real logo image is used ONLY as a pixel source.
 * The actual <img> is never displayed.
 *
 * Particles:
 *  1. Start scattered around the screen
 *  2. Fly toward the real logo pixels
 *  3. Assemble the complete logo
 *  4. Lock permanently into exact positions
 *  5. Snap to a crisp, fully rendered version of the real logo
 *     (drawn directly onto the same canvas, so it always looks
 *     sharp instead of a field of dots)
 *  6. Hold the completed logo
 *  7. Exit the splash
 *
 * IMPORTANT:
 * HTML IDs expected:
 *
 *   #splashScreen
 *   #splashCanvas
 *   #splashLogo
 *   #splashName
 */

(function () {

    'use strict';


    /* =========================================================
       ELEMENTS
    ========================================================= */

    var splash =
        document.getElementById('splashScreen');

    if (!splash) return;

    var canvas =
        document.getElementById('splashCanvas');

    var logoEl =
        document.getElementById('splashLogo');

    var nameEl =
        document.getElementById('splashName');


    /* =========================================================
       BLACKOUT (APPLIED IMMEDIATELY)
       ---------------------------------------------------------
       The splash background is made fully black right from the
       start — before particles even begin scattering — by
       hiding the gradient / grid layers and setting the splash
       screen's background to solid black. Particles then
       animate on top of a black background the whole time,
       through assembly and into the final sharp logo.
    ========================================================= */

    if (splash) {

        splash.style.backgroundColor =
            '#000000';

    }

    var initialBgEl =
        splash.querySelector(
            '.splash-bg'
        );

    if (initialBgEl) {

        initialBgEl.style.opacity =
            '0';

    }

    var initialGridEl =
        splash.querySelector(
            '.splash-grid'
        );

    if (initialGridEl) {

        initialGridEl.style.opacity =
            '0';

    }


    /* =========================================================
       SESSION
    ========================================================= */

    var SESSION_KEY =
        'innovexaSplashShown';

    var alreadyShown = false;

    try {

        alreadyShown =
            sessionStorage.getItem(
                SESSION_KEY
            ) === '1';

    } catch (error) {

        alreadyShown = false;

    }


    if (alreadyShown) {

        if (splash.parentNode) {

            splash.parentNode.removeChild(
                splash
            );

        }

        return;

    }


    document.documentElement.classList.add(
        'splash-active'
    );


    /* =========================================================
       STATE
    ========================================================= */

    var finished = false;

    var animationStarted = false;

    var resizeTimer = null;


    /* =========================================================
       SESSION MARK
    ========================================================= */

    function markSessionSeen() {

        try {

            sessionStorage.setItem(
                SESSION_KEY,
                '1'
            );

        } catch (error) {

            /* Ignore storage errors */

        }

    }


    /* =========================================================
       FINISH
    ========================================================= */

    function finishSplash() {

        if (finished) return;

        finished = true;

        document.documentElement.classList.remove(
            'splash-active'
        );

        splash.classList.add(
            'is-leaving'
        );

        markSessionSeen();

        window.setTimeout(
            function () {

                if (splash.parentNode) {

                    splash.parentNode.removeChild(
                        splash
                    );

                }

            },
            850
        );

    }


    /* =========================================================
       SAFETY TIMER
    ========================================================= */

    var safetyTimer =
        window.setTimeout(
            finishSplash,
            15000
        );


    /* =========================================================
       HIDE REAL IMAGE
       ---------------------------------------------------------
       The <img> is only ever used as a pixel source for
       sampling and as the source drawn onto the canvas at the
       end. It is never itself made visible.
    ========================================================= */

    if (logoEl) {

        logoEl.style.opacity = '0';

        logoEl.style.visibility =
            'hidden';

        logoEl.style.pointerEvents =
            'none';

    }


    /* =========================================================
       FALLBACK
    ========================================================= */

    function fallbackSimple() {

        if (canvas && canvas.parentNode) {

            canvas.parentNode.removeChild(
                canvas
            );

        }

        window.setTimeout(
            function () {

                window.clearTimeout(
                    safetyTimer
                );

                finishSplash();

            },
            900
        );

    }


    /* =========================================================
       REDUCED MOTION
    ========================================================= */

    var reducedMotion = false;

    try {

        reducedMotion =
            window.matchMedia(
                '(prefers-reduced-motion: reduce)'
            ).matches;

    } catch (error) {

        reducedMotion = false;

    }


    if (reducedMotion) {

        if (canvas && canvas.parentNode) {

            canvas.parentNode.removeChild(
                canvas
            );

        }

        if (nameEl) {

            nameEl.style.opacity = '1';

        }

        window.setTimeout(
            function () {

                window.clearTimeout(
                    safetyTimer
                );

                finishSplash();

            },
            900
        );

        return;

    }


    /* =========================================================
       CANVAS CHECK
    ========================================================= */

    if (
        !canvas ||
        typeof canvas.getContext !== 'function'
    ) {

        fallbackSimple();

        return;

    }


    var ctx =
        canvas.getContext(
            '2d',
            {
                alpha: true,
                desynchronized: true
            }
        );


    if (!ctx) {

        fallbackSimple();

        return;

    }


    /* =========================================================
       DPR
    ========================================================= */

    var dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );


    /* =========================================================
       VIEWPORT
    ========================================================= */

    var viewportWidth = 0;

    var viewportHeight = 0;


    function resizeCanvas() {

        viewportWidth =
            window.innerWidth;

        viewportHeight =
            window.innerHeight;

        canvas.width =
            Math.round(
                viewportWidth * dpr
            );

        canvas.height =
            Math.round(
                viewportHeight * dpr
            );

        canvas.style.width =
            viewportWidth + 'px';

        canvas.style.height =
            viewportHeight + 'px';

        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );

    }


    resizeCanvas();


    /* =========================================================
       IMAGE PIXEL TEST
       ---------------------------------------------------------
       We intentionally DO NOT classify pixels according to
       "symbol", "Innovexa", or "Technologies".

       Every visible pixel belongs to the logo.

       This prevents text from disappearing because of incorrect
       hard-coded Y percentages.
    ========================================================= */

    function isVisibleLogoPixel(
        r,
        g,
        b,
        a
    ) {

        if (a < 45) {

            return false;

        }

        /*
         * Transparent / nearly transparent.
         */
        if (
            r < 10 &&
            g < 10 &&
            b < 10 &&
            a < 80
        ) {

            return false;

        }

        /*
         * Ignore a near-black background.
         *
         * This is intentionally not overly aggressive,
         * otherwise dark logo pixels could disappear.
         */
        if (
            r < 15 &&
            g < 15 &&
            b < 18
        ) {

            return false;

        }

        /*
         * Luminance.
         */
        var brightness =
            (
                0.299 * r +
                0.587 * g +
                0.114 * b
            );

        return brightness > 20;

    }


    /* =========================================================
       SHUFFLE
    ========================================================= */

    function shuffle(array) {

        for (
            var i = array.length - 1;
            i > 0;
            i--
        ) {

            var j =
                Math.floor(
                    Math.random() * (i + 1)
                );

            var temp =
                array[i];

            array[i] =
                array[j];

            array[j] =
                temp;

        }

    }


    /* =========================================================
       SAMPLE LOGO
       ---------------------------------------------------------
       IMPORTANT FIX:
       We sample the logo in its ORIGINAL aspect ratio.

       More importantly:
       - no artificial symbol/text regions
       - no random omission of text
       - more points are retained around thin strokes
    ========================================================= */

    function sampleLogoPoints(
        img,
        targetCount
    ) {

        var naturalWidth =
            img.naturalWidth ||
            img.width;

        var naturalHeight =
            img.naturalHeight ||
            img.height;


        if (
            !naturalWidth ||
            !naturalHeight
        ) {

            return null;

        }


        /*
         * Large sampling surface.
         */
        var sampleSize = 1600;


        var off =
            document.createElement(
                'canvas'
            );

        off.width =
            sampleSize;

        off.height =
            sampleSize;


        var octx =
            off.getContext(
                '2d',
                {
                    willReadFrequently: true
                }
            );


        if (!octx) {

            return null;

        }


        /*
         * Original aspect ratio.
         */
        var aspect =
            naturalWidth /
            naturalHeight;


        var drawWidth;

        var drawHeight;


        if (aspect >= 1) {

            drawWidth =
                sampleSize;

            drawHeight =
                sampleSize /
                aspect;

        } else {

            drawHeight =
                sampleSize;

            drawWidth =
                sampleSize *
                aspect;

        }


        var offsetX =
            (
                sampleSize -
                drawWidth
            ) / 2;


        var offsetY =
            (
                sampleSize -
                drawHeight
            ) / 2;


        try {

            octx.clearRect(
                0,
                0,
                sampleSize,
                sampleSize
            );

            /*
             * IMPORTANT:
             * High quality scaling.
             */
            octx.imageSmoothingEnabled =
                true;

            octx.imageSmoothingQuality =
                'high';

            octx.drawImage(
                img,
                offsetX,
                offsetY,
                drawWidth,
                drawHeight
            );

        } catch (error) {

            return null;

        }


        var imageData;


        try {

            imageData =
                octx.getImageData(
                    0,
                    0,
                    sampleSize,
                    sampleSize
                ).data;

        } catch (error) {

            return null;

        }


        var visiblePixels = [];


        /* =====================================================
           COLLECT EVERY VISIBLE PIXEL
        ===================================================== */

        for (
            var y = 0;
            y < sampleSize;
            y++
        ) {

            for (
                var x = 0;
                x < sampleSize;
                x++
            ) {

                /*
                 * Only inspect image area.
                 */
                if (
                    x < offsetX ||
                    x > offsetX + drawWidth ||
                    y < offsetY ||
                    y > offsetY + drawHeight
                ) {

                    continue;

                }


                var index =
                    (
                        y *
                        sampleSize +
                        x
                    ) * 4;


                var r =
                    imageData[index];

                var g =
                    imageData[index + 1];

                var b =
                    imageData[index + 2];

                var a =
                    imageData[index + 3];


                if (
                    !isVisibleLogoPixel(
                        r,
                        g,
                        b,
                        a
                    )
                ) {

                    continue;

                }


                /*
                 * Normalize coordinates relative
                 * to original logo.
                 */
                var nx =
                    (
                        x -
                        offsetX
                    ) /
                    drawWidth;


                var ny =
                    (
                        y -
                        offsetY
                    ) /
                    drawHeight;


                if (
                    nx < 0 ||
                    nx > 1 ||
                    ny < 0 ||
                    ny > 1
                ) {

                    continue;

                }


                visiblePixels.push({

                    nx: nx,

                    ny: ny,

                    r: r,

                    g: g,

                    b: b,

                    a: a

                });

            }

        }


        if (
            visiblePixels.length === 0
        ) {

            return null;

        }


        /*
         * -----------------------------------------------------
         * IMPORTANT TEXT VISIBILITY FIX
         *
         * Instead of simply taking random pixels, divide the
         * logo into a fine grid.
         *
         * Every part of the logo gets representation.
         *
         * This prevents:
         *
         *     INNOVEXA
         *
         * or
         *
         *     TECHNOLOGIES
         *
         * from becoming too thin / disappearing.
         * -----------------------------------------------------
         */

        var gridColumns = 80;

        var gridRows = 80;

        var buckets = new Array(
            gridColumns *
            gridRows
        );


        for (
            var bIndex = 0;
            bIndex < buckets.length;
            bIndex++
        ) {

            buckets[bIndex] = [];

        }


        for (
            var p = 0;
            p < visiblePixels.length;
            p++
        ) {

            var pixel =
                visiblePixels[p];


            var gx =
                Math.min(
                    gridColumns - 1,
                    Math.floor(
                        pixel.nx *
                        gridColumns
                    )
                );


            var gy =
                Math.min(
                    gridRows - 1,
                    Math.floor(
                        pixel.ny *
                        gridRows
                    )
                );


            buckets[
                gy *
                gridColumns +
                gx
            ].push(pixel);

        }


        /*
         * Shuffle individual buckets.
         */
        for (
            var q = 0;
            q < buckets.length;
            q++
        ) {

            if (
                buckets[q].length > 1
            ) {

                shuffle(
                    buckets[q]
                );

            }

        }


        var result = [];


        /*
         * First pass:
         * Take at least one point from every occupied cell.
         *
         * This is the main text visibility fix.
         */
        for (
            var cell = 0;
            cell < buckets.length;
            cell++
        ) {

            if (
                buckets[cell].length
            ) {

                result.push(
                    buckets[cell][0]
                );

            }

        }


        /*
         * Remaining points.
         */
        var remaining =
            visiblePixels.slice();


        shuffle(
            remaining
        );


        /*
         * Add points until desired density.
         */
        var needed =
            Math.max(
                0,
                targetCount -
                result.length
            );


        for (
            var rIndex = 0;
            rIndex < remaining.length &&
            rIndex < needed;
            rIndex++
        ) {

            result.push(
                remaining[rIndex]
            );

        }


        /*
         * If logo has fewer actual pixels than
         * target count, do NOT invent shape.
         *
         * We duplicate actual logo points with
         * tiny offsets only when necessary.
         */
        if (
            result.length <
            Math.min(
                targetCount,
                visiblePixels.length
            )
        ) {

            /*
             * Already covered by the sampling above.
             */

        }


        /*
         * Final shuffle determines assembly order.
         */
        shuffle(result);


        return result;

    }


    /* =========================================================
       EASING
    ========================================================= */

    function easeOutCubic(t) {

        return 1 -
            Math.pow(
                1 - t,
                3
            );

    }


    function easeInOutCubic(t) {

        if (t < 0.5) {

            return 4 *
                t *
                t *
                t;

        }

        return 1 -
            Math.pow(
                -2 * t + 2,
                3
            ) / 2;

    }


    /* =========================================================
       LOGO GEOMETRY
    ========================================================= */

    function calculateLogoGeometry(img) {

        var vw =
            window.innerWidth;

        var vh =
            window.innerHeight;


        var isMobile =
            vw <= 640;

        var isTablet =
            vw > 640 &&
            vw <= 1024;


        var naturalWidth =
            img.naturalWidth ||
            img.width;

        var naturalHeight =
            img.naturalHeight ||
            img.height;


        var aspect =
            naturalWidth /
            naturalHeight;


        var maxWidth;


        if (isMobile) {

            maxWidth =
                Math.min(
                    vw * 0.90,
                    470
                );

        }

        else if (isTablet) {

            maxWidth =
                Math.min(
                    vw * 0.72,
                    650
                );

        }

        else {

            maxWidth =
                Math.min(
                    vw * 0.58,
                    760
                );

        }


        var width =
            maxWidth;


        var height =
            width /
            aspect;


        /*
         * Prevent logo becoming too tall.
         */
        var maxHeight =
            isMobile
                ? vh * 0.72
                : vh * 0.68;


        if (
            height >
            maxHeight
        ) {

            height =
                maxHeight;

            width =
                height *
                aspect;

        }


        /*
         * Slightly above exact center so the logo
         * feels visually centered.
         */
        var centerX =
            vw / 2;


        var centerY =
            vh / 2 -
            (
                isMobile
                    ? 0
                    : 8
            );


        return {

            width: width,

            height: height,

            centerX: centerX,

            centerY: centerY

        };

    }


    /* =========================================================
       PARTICLE CREATION
    ========================================================= */

    function createParticles(
        points,
        img
    ) {

        var geometry =
            calculateLogoGeometry(
                img
            );


        var particles =
            [];


        for (
            var i = 0;
            i < points.length;
            i++
        ) {

            var point =
                points[i];


            /*
             * EXACT FINAL POSITION.
             */
            var targetX =
                geometry.centerX +
                (
                    point.nx -
                    0.5
                ) *
                geometry.width;


            var targetY =
                geometry.centerY +
                (
                    point.ny -
                    0.5
                ) *
                geometry.height;


            /*
             * Wide scattered starting field.
             */
            var startX =
                -50 +
                Math.random() *
                (
                    window.innerWidth +
                    100
                );


            var startY =
                -50 +
                Math.random() *
                (
                    window.innerHeight +
                    100
                );


            /*
             * Particle size.
             *
             * Text gets slightly stronger.
             */
            var size =
                1.25 +
                Math.random() *
                1.25;


            /*
             * Every particle keeps original
             * logo color.
             */
            var color =
                'rgb(' +
                point.r +
                ',' +
                point.g +
                ',' +
                point.b +
                ')';


            /*
             * Curved path strength.
             */
            var curve =
                (
                    Math.random() -
                    0.5
                ) *
                120;


            particles.push({

                x: startX,

                y: startY,

                startX: startX,

                startY: startY,

                targetX: targetX,

                targetY: targetY,

                size: size,

                color: color,

                alpha:
                    0.78 +
                    Math.random() *
                    0.22,

                curve: curve,

                delay:
                    Math.random() *
                    420,

                phase:
                    Math.random() *
                    Math.PI *
                    2,

                speed:
                    100 +
                    Math.random() *
                    120

            });

        }


        return particles;

    }


    /* =========================================================
       DRAW PARTICLE
    ========================================================= */

    function drawParticle(
        particle,
        x,
        y,
        radius,
        alpha
    ) {

        ctx.beginPath();

        ctx.fillStyle =
            particle.color;

        ctx.globalAlpha =
            alpha;

        ctx.arc(
            x,
            y,
            radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }


    /* =========================================================
       FINAL LOGO — SHARP IMAGE SNAP
       ---------------------------------------------------------
       This is the key fix.

       Once the particles finish settling, we stop drawing
       hundreds of tiny dots (which will always look grainy,
       no matter how tightly they pack together) and instead
       draw the REAL logo image directly onto the SAME canvas,
       at the exact same position/size the particles just
       assembled into.

       Nothing new becomes visible (no <img> tag, no second
       element) — the canvas itself simply renders a crisp,
       fully anti-aliased copy of the logo in place of the
       particle cloud, so the on-screen result looks like the
       particles themselves "sharpened" into the final logo.
    ========================================================= */

    function drawFinalLogoImage(img) {

        var geometry =
            calculateLogoGeometry(
                img
            );

        var drawX =
            geometry.centerX -
            geometry.width / 2;

        var drawY =
            geometry.centerY -
            geometry.height / 2;

        ctx.clearRect(
            0,
            0,
            window.innerWidth,
            window.innerHeight
        );

        ctx.globalCompositeOperation =
            'source-over';

        ctx.globalAlpha = 1;

        ctx.imageSmoothingEnabled =
            true;

        ctx.imageSmoothingQuality =
            'high';

        ctx.drawImage(
            img,
            drawX,
            drawY,
            geometry.width,
            geometry.height
        );

        ctx.globalAlpha = 1;

    }


    /* =========================================================
       PARTICLE ANIMATION
    ========================================================= */

    function runParticles(
        points,
        img
    ) {

        if (
            animationStarted ||
            finished
        ) {

            return;

        }


        animationStarted = true;


        var particles =
            createParticles(
                points,
                img
            );


        if (
            !particles ||
            !particles.length
        ) {

            fallbackSimple();

            return;

        }


        /* =====================================================
           TIMING
        ===================================================== */

        var scatterHold =
            280;


        var travelDuration =
            2300;


        var settleDuration =
            900;


        var finalHold =
            1500;


        var startTime =
            null;


        var completed =
            false;


        /* =====================================================
           FRAME
        ===================================================== */

        function frame(now) {

            if (finished) {

                return;

            }


            if (startTime === null) {

                startTime =
                    now;

            }


            var elapsed =
                now -
                startTime;


            var width =
                window.innerWidth;

            var height =
                window.innerHeight;


            /*
             * -------------------------------------------------
             * FINAL LOCK
             * -------------------------------------------------
             * Checked BEFORE drawing particles for this frame,
             * so the very first frame at/after completion draws
             * the crisp real logo instead of one last dotty
             * particle frame.
             */

            var logoCompleteAt =
                scatterHold +
                travelDuration +
                settleDuration;


            if (
                elapsed >=
                logoCompleteAt
            ) {

                drawFinalLogoImage(
                    img
                );


                /*
                 * Hold complete logo.
                 */
                if (
                    elapsed >=
                    logoCompleteAt +
                    finalHold
                ) {

                    if (!completed) {

                        completed = true;

                        onAssembled();

                    }

                    return;

                }


                requestAnimationFrame(
                    frame
                );

                return;

            }


            ctx.clearRect(
                0,
                0,
                width,
                height
            );


            ctx.globalCompositeOperation =
                'source-over';


            /*
             * -------------------------------------------------
             * PARTICLES
             * -------------------------------------------------
             */

            for (
                var i = 0;
                i < particles.length;
                i++
            ) {

                var p =
                    particles[i];


                /*
                 * Individual delay.
                 */
                var local =
                    elapsed -
                    scatterHold -
                    p.delay;


                var travelT;


                if (local <= 0) {

                    travelT = 0;

                }

                else {

                    travelT =
                        Math.min(
                            1,
                            local /
                            travelDuration
                        );

                }


                var travelEase =
                    easeOutCubic(
                        travelT
                    );


                /*
                 * -------------------------------------------------
                 * BEZIER CURVE
                 * -------------------------------------------------
                 */

                var dx =
                    p.targetX -
                    p.startX;


                var dy =
                    p.targetY -
                    p.startY;


                var distance =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    ) || 1;


                var middleX =
                    (
                        p.startX +
                        p.targetX
                    ) / 2;


                var middleY =
                    (
                        p.startY +
                        p.targetY
                    ) / 2;


                var controlX =
                    middleX +
                    (
                        -dy /
                        distance
                    ) *
                    p.curve;


                var controlY =
                    middleY +
                    (
                        dx /
                        distance
                    ) *
                    p.curve;


                var inverse =
                    1 -
                    travelEase;


                var x =
                    inverse *
                    inverse *
                    p.startX +

                    2 *
                    inverse *
                    travelEase *
                    controlX +

                    travelEase *
                    travelEase *
                    p.targetX;


                var y =
                    inverse *
                    inverse *
                    p.startY +

                    2 *
                    inverse *
                    travelEase *
                    controlY +

                    travelEase *
                    travelEase *
                    p.targetY;


                /*
                 * -------------------------------------------------
                 * SETTLE
                 * -------------------------------------------------
                 *
                 * This phase brings particles to their exact
                 * final positions before the sharp-image snap
                 * takes over.
                 */

                var settleStart =
                    scatterHold +
                    travelDuration;


                var settleT =
                    Math.max(
                        0,
                        Math.min(
                            1,
                            (
                                elapsed -
                                settleStart
                            ) /
                            settleDuration
                        )
                    );


                if (settleT > 0) {

                    var settleEase =
                        easeInOutCubic(
                            settleT
                        );


                    x +=
                        (
                            p.targetX -
                            x
                        ) *
                        settleEase;


                    y +=
                        (
                            p.targetY -
                            y
                        ) *
                        settleEase;

                }


                /*
                 * -------------------------------------------------
                 * HARD LOCK
                 * -------------------------------------------------
                 */

                if (
                    settleT >= 1
                ) {

                    x =
                        p.targetX;

                    y =
                        p.targetY;

                }


                /*
                 * -------------------------------------------------
                 * APPEARANCE
                 * -------------------------------------------------
                 */

                var alpha =
                    Math.min(
                        1,
                        Math.max(
                            0,
                            elapsed /
                            scatterHold
                        )
                    );


                alpha *=
                    p.alpha;


                /*
                 * Slightly larger particles as
                 * the logo completes.
                 */
                var finalBoost =
                    settleT *
                    0.55;


                /*
                 * Tiny movement ONLY while particles
                 * are travelling.
                 */
                var microMove =
                    travelT < 1
                        ? Math.sin(
                            now /
                            p.speed +
                            p.phase
                        ) *
                        0.15
                        : 0;


                var radius =
                    Math.max(
                        0.65,
                        p.size +
                        finalBoost +
                        microMove
                    );


                drawParticle(
                    p,
                    x,
                    y,
                    radius,
                    alpha
                );

            }


            ctx.globalAlpha = 1;


            requestAnimationFrame(
                frame
            );

        }


        requestAnimationFrame(
            frame
        );

    }


    /* =========================================================
       ASSEMBLED
    ========================================================= */

    function onAssembled() {

        if (finished) return;


        /*
         * Do NOT use the HTML logo here.
         *
         * The canvas itself now contains the crisp final
         * logo image, drawn by drawFinalLogoImage().
         */
        if (nameEl) {

            nameEl.style.opacity =
                '0';

        }


        window.setTimeout(
            function () {

                if (finished) return;

                window.clearTimeout(
                    safetyTimer
                );

                finishSplash();

            },
            900
        );

    }


    /* =========================================================
       IMAGE LOAD
    ========================================================= */

    var img =
        new Image();


    img.onload =
        function () {

            if (finished) return;


            var width =
                window.innerWidth;


            /*
             * Particle count.
             *
             * Higher density = clearer text.
             */
            var targetCount;


            if (width <= 480) {

                targetCount =
                    3200;

            }

            else if (width <= 640) {

                targetCount =
                    4000;

            }

            else if (width <= 1024) {

                targetCount =
                    5200;

            }

            else {

                targetCount =
                    6800;

            }


            var points =
                sampleLogoPoints(
                    img,
                    targetCount
                );


            if (
                !points ||
                !points.length
            ) {

                fallbackSimple();

                return;

            }


            /*
             * Wait one browser frame so the canvas
             * is fully ready.
             */
            requestAnimationFrame(
                function () {

                    if (finished) return;

                    runParticles(
                        points,
                        img
                    );

                }
            );

        };


    /* =========================================================
       IMAGE ERROR
    ========================================================= */

    img.onerror =
        function () {

            fallbackSimple();

        };


    /* =========================================================
       SOURCE
    ========================================================= */

    if (
        logoEl &&
        logoEl.getAttribute('src')
    ) {

        /*
         * IMPORTANT:
         * Use the same source as the hidden
         * splash logo.
         */
        img.src =
            logoEl.getAttribute(
                'src'
            );

    }

    else {

        fallbackSimple();

        return;

    }


    /* =========================================================
       RESIZE
       ---------------------------------------------------------
       We do NOT rebuild the particle animation during resize.
       This prevents particles from suddenly jumping.
    ========================================================= */

    window.addEventListener(
        'resize',
        function () {

            clearTimeout(
                resizeTimer
            );


            resizeTimer =
                window.setTimeout(
                    function () {

                        resizeCanvas();

                    },
                    120
                );

        }
    );


    /* =========================================================
       VISIBILITY
    ========================================================= */

    document.addEventListener(
        'visibilitychange',
        function () {

            if (
                document.hidden &&
                !finished
            ) {

                window.clearTimeout(
                    safetyTimer
                );


                safetyTimer =
                    window.setTimeout(
                        finishSplash,
                        12000
                    );

            }

        }
    );


})();