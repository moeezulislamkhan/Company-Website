(function () {
  'use strict';

  /* =========================================
     INNOVEXA — ABOUT PAGE INTERACTIONS
     ========================================= */

  /* -----------------------------------------
     01. Dynamic Footer Year
     ----------------------------------------- */
  const year = document.getElementById('year');

  if (year) {
    year.textContent = new Date().getFullYear();
  }


  /* -----------------------------------------
     02. INNOVEXA DNA — Interactive Nodes
     ----------------------------------------- */
  const dnaNodes = document.querySelectorAll('.dna-node');
  const dnaReadout = document.getElementById('dnaReadout');

  const dnaContent = {
    clarity: {
      title: 'Clarity',
      description:
        'We make the complex feel understandable, actionable and beautifully simple.'
    },

    craft: {
      title: 'Craft',
      description:
        'We care about the small decisions that turn a working product into a memorable one.'
    },

    curiosity: {
      title: 'Curiosity',
      description:
        'We keep asking better questions so the solution can move beyond the obvious.'
    },

    care: {
      title: 'Care',
      description:
        'We build with empathy for the people, teams and businesses using the result.'
    }
  };


  /* -----------------------------------------
     DNA Node Interaction
     ----------------------------------------- */
  dnaNodes.forEach(function (node) {
    node.addEventListener('click', function () {

      // Remove active state from all nodes
      dnaNodes.forEach(function (item) {
        item.classList.remove('is-active');
      });

      // Activate selected node
      node.classList.add('is-active');

      const dnaKey = node.dataset.dna;
      const content = dnaContent[dnaKey];

      // Safety check
      if (!content || !dnaReadout) {
        return;
      }

      // Get readable label
      const nodeText = node.textContent.trim();
      const firstWord = nodeText.split(' ')[0];

      dnaReadout.innerHTML = `
        <small>${firstWord} / PRINCIPLE</small>
        <h3>${content.title}</h3>
        <p>${content.description}</p>
      `;
    });
  });


  /* -----------------------------------------
     03. Scroll Reveal System
     ----------------------------------------- */
  const scenes = document.querySelectorAll('.scene');

  if ('IntersectionObserver' in window) {

    const sceneObserver = new IntersectionObserver(
      function (entries) {

        entries.forEach(function (entry) {

          if (entry.isIntersecting) {
            entry.target.classList.add('is-seen');
          }

        });

      },
      {
        threshold: 0.18
      }
    );

    scenes.forEach(function (scene) {
      sceneObserver.observe(scene);
    });

  } else {

    // Fallback for older browsers
    scenes.forEach(function (scene) {
      scene.classList.add('is-seen');
    });

  }


  /* -----------------------------------------
     04. Smooth Internal Navigation
     ----------------------------------------- */
  const internalLinks = document.querySelectorAll(
    'a[href^="#"]'
  );

  internalLinks.forEach(function (link) {

    link.addEventListener('click', function (event) {

      const targetId = link.getAttribute('href');

      if (!targetId || targetId === '#') {
        return;
      }

      const target = document.querySelector(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();

      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

    });

  });


  /* -----------------------------------------
     05. Active DNA Node — First Principle
     ----------------------------------------- */
  if (dnaNodes.length && !document.querySelector('.dna-node.is-active')) {
    dnaNodes[0].classList.add('is-active');
  }


  /* -----------------------------------------
     06. Subtle Mouse Parallax
     For immersive visual sections
     ----------------------------------------- */
  const parallaxItems = document.querySelectorAll(
    '[data-parallax]'
  );

  if (parallaxItems.length && window.matchMedia('(pointer: fine)').matches) {

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    window.addEventListener('mousemove', function (event) {

      mouseX =
        (event.clientX / window.innerWidth - 0.5) * 2;

      mouseY =
        (event.clientY / window.innerHeight - 0.5) * 2;

    });

    function animateParallax() {

      currentX += (mouseX - currentX) * 0.05;
      currentY += (mouseY - currentY) * 0.05;

      parallaxItems.forEach(function (item) {

        const strength =
          Number(item.dataset.parallax) || 12;

        item.style.transform =
          `translate3d(
            ${currentX * strength}px,
            ${currentY * strength}px,
            0
          )`;

      });

      requestAnimationFrame(animateParallax);
    }

    animateParallax();
  }


  /* -----------------------------------------
     07. Horizontal Evolution Scroll Support
     ----------------------------------------- */
  const horizontalSections =
    document.querySelectorAll('[data-horizontal-scroll]');

  horizontalSections.forEach(function (section) {

    section.addEventListener(
      'wheel',
      function (event) {

        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
          return;
        }

        const canScrollLeft =
          section.scrollLeft > 0;

        const canScrollRight =
          section.scrollLeft + section.clientWidth <
          section.scrollWidth - 1;

        if (
          (event.deltaY > 0 && canScrollRight) ||
          (event.deltaY < 0 && canScrollLeft)
        ) {
          event.preventDefault();

          section.scrollLeft += event.deltaY;
        }

      },
      {
        passive: false
      }
    );

  });


  /* -----------------------------------------
     08. Page Loaded State
     ----------------------------------------- */
  window.addEventListener('load', function () {
    document.body.classList.add('about-page-ready');
  });


})();