(() => {
  "use strict";

  /* =========================================
     INNOVEXA — SERVICES PAGE
     Frontend-only interactions
     ========================================= */


  /* -----------------------------------------
     01. FOOTER YEAR
     ----------------------------------------- */

  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }


  /* -----------------------------------------
     02. MOBILE NAVIGATION
     ----------------------------------------- */

  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");

  if (navToggle && mainNav) {

    navToggle.addEventListener("click", () => {

      const isOpen = mainNav.classList.toggle("open");

      navToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

    });


    mainNav.querySelectorAll("a").forEach(link => {

      link.addEventListener("click", () => {

        mainNav.classList.remove("open");

        navToggle.setAttribute(
          "aria-expanded",
          "false"
        );

      });

    });

  }


  /* -----------------------------------------
     03. SCROLL REVEAL
     ----------------------------------------- */

  const revealItems = document.querySelectorAll(".reveal");

  if (
    "IntersectionObserver" in window &&
    revealItems.length
  ) {

    const revealObserver =
      new IntersectionObserver(
        entries => {

          entries.forEach(entry => {

            if (entry.isIntersecting) {

              entry.target.classList.add(
                "is-visible"
              );

              revealObserver.unobserve(
                entry.target
              );

            }

          });

        },
        {
          threshold: 0.14,
          rootMargin: "0px 0px -40px 0px"
        }
      );


    revealItems.forEach(item => {

      revealObserver.observe(item);

    });

  } else {

    revealItems.forEach(item => {

      item.classList.add("is-visible");

    });

  }


  /* -----------------------------------------
     04. SERVICE UNIVERSE
     ----------------------------------------- */

  const serviceNodes =
    document.querySelectorAll(".map-node");

  const serviceReadout =
    document.getElementById("serviceReadout");


  const serviceData = {

    app: {
      label: "01 / APP DEVELOPMENT",
      title:
        "Experiences people keep coming back to.",
      text:
        "Product strategy, mobile UX and engineering connected from first screen to launch."
    },

    web: {
      label: "02 / WEB DEVELOPMENT",
      title:
        "Digital surfaces built to perform.",
      text:
        "High-performance websites and web applications designed to communicate, convert and scale."
    },

    ui: {
      label: "03 / UI / UX DESIGN",
      title:
        "Every interaction has a reason.",
      text:
        "Research, information architecture, visual systems and prototypes that remove friction."
    },

    shopify: {
      label: "04 / SHOPIFY",
      title:
        "Commerce designed to convert.",
      text:
        "Brand, merchandising, UX and storefront experience brought together around the buyer."
    },

    ai: {
      label: "05 / AI & AUTOMATION",
      title:
        "Systems that move without being chased.",
      text:
        "Intelligent workflows that reduce repetitive work and help teams make faster decisions."
    }

  };


  serviceNodes.forEach(node => {

    node.addEventListener("click", () => {

      serviceNodes.forEach(item => {

        item.classList.remove("active");

      });


      node.classList.add("active");


      const serviceKey =
        node.dataset.service;

      const data =
        serviceData[serviceKey];


      if (!data || !serviceReadout) {
        return;
      }


      serviceReadout.innerHTML = `

        <small>${data.label}</small>

        <strong>${data.title}</strong>

        <p>${data.text}</p>

      `;

    });

  });


  /* -----------------------------------------
     05. DEFAULT SERVICE
     ----------------------------------------- */

  if (
    serviceNodes.length &&
    !document.querySelector(
      ".map-node.active"
    )
  ) {

    serviceNodes[0].classList.add("active");

  }


  /* -----------------------------------------
     06. STARTING POINT SELECTOR
     ----------------------------------------- */

  const choiceButtons =
    document.querySelectorAll(
      "[data-choice]"
    );

  const choiceResult =
    document.getElementById(
      "choiceResult"
    );


  const choiceText = {

    "new-product":
      "Great starting point. Let's turn the new idea into something people can use.",

    "existing-product":
      "Let's find the friction, improve the experience and unlock the next version.",

    "business-system":
      "Let's connect the right technology so the business can move with less friction.",

    "not-sure":
      "That's okay. Start with the problem — we'll help shape the opportunity."

  };


  choiceButtons.forEach(button => {

    button.addEventListener("click", () => {

      choiceButtons.forEach(item => {

        item.classList.remove("active");

      });


      button.classList.add("active");


      const choice =
        button.dataset.choice;


      if (
        choiceResult &&
        choiceText[choice]
      ) {

        choiceResult.textContent =
          choiceText[choice];

      }

    });

  });


  /* -----------------------------------------
     07. VISUAL LAB MOUSE PARALLAX
     ----------------------------------------- */

  const visualLabs =
    document.querySelectorAll(
      ".device-lab, .browser-lab, .interface-lab, .storefront-lab, .neural-lab"
    );


  const finePointer =
    window.matchMedia(
      "(pointer: fine)"
    ).matches;


  const reducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;


  if (
    finePointer &&
    !reducedMotion &&
    visualLabs.length
  ) {

    visualLabs.forEach(lab => {

      lab.addEventListener(
        "pointermove",
        event => {

          const rect =
            lab.getBoundingClientRect();


          const x =
            (event.clientX - rect.left) /
            rect.width -
            0.5;


          const y =
            (event.clientY - rect.top) /
            rect.height -
            0.5;


          lab.style.setProperty(
            "--mx",
            `${x * 10}px`
          );


          lab.style.setProperty(
            "--my",
            `${y * 10}px`
          );

        }
      );


      lab.addEventListener(
        "pointerleave",
        () => {

          lab.style.setProperty(
            "--mx",
            "0px"
          );


          lab.style.setProperty(
            "--my",
            "0px"
          );

        }
      );

    });

  }


  /* -----------------------------------------
     08. SMOOTH ANCHOR NAVIGATION
     ----------------------------------------- */

  const internalLinks =
    document.querySelectorAll(
      'a[href^="#"]'
    );


  internalLinks.forEach(link => {

    link.addEventListener(
      "click",
      event => {

        const targetId =
          link.getAttribute("href");


        if (
          !targetId ||
          targetId === "#"
        ) {
          return;
        }


        const target =
          document.querySelector(
            targetId
          );


        if (!target) {
          return;
        }


        event.preventDefault();


        target.scrollIntoView({
          behavior: reducedMotion
            ? "auto"
            : "smooth",
          block: "start"
        });

      }
    );

  });


  /* -----------------------------------------
     09. ACTIVE SECTION TRACKING
     ----------------------------------------- */

  const sections =
    document.querySelectorAll(
      "main > section[id]"
    );


  if (
    "IntersectionObserver" in window &&
    sections.length
  ) {

    const sectionObserver =
      new IntersectionObserver(
        entries => {

          entries.forEach(entry => {

            if (
              entry.isIntersecting &&
              entry.intersectionRatio > 0.25
            ) {

              entry.target.classList.add(
                "section-active"
              );

            }

          });

        },
        {
          threshold: [0.25, 0.5]
        }
      );


    sections.forEach(section => {

      sectionObserver.observe(section);

    });

  }


  /* -----------------------------------------
     10. NEURAL NETWORK PULSE
     ----------------------------------------- */

  const neuralLab =
    document.querySelector(
      ".neural-lab"
    );


  if (
    neuralLab &&
    !reducedMotion
  ) {

    let pulse = 0;


    const animateNeural =
      () => {

        pulse += 0.025;


        const intensity =
          (Math.sin(pulse) + 1) / 2;


        neuralLab.style.setProperty(
          "--neural-pulse",
          intensity.toFixed(3)
        );


        requestAnimationFrame(
          animateNeural
        );

      };


    animateNeural();

  }


  /* -----------------------------------------
     11. APP DEVICE FLOAT
     ----------------------------------------- */

  const device =
    document.querySelector(
      ".device-main"
    );


  if (
    device &&
    !reducedMotion
  ) {

    let start =
      performance.now();


    const animateDevice =
      now => {

        const elapsed =
          (now - start) / 1000;


        const y =
          Math.sin(elapsed * 1.15) *
          7;


        device.style.setProperty(
          "--device-float",
          `${y}px`
        );


        requestAnimationFrame(
          animateDevice
        );

      };


    requestAnimationFrame(
      animateDevice
    );

  }


  /* -----------------------------------------
     12. PAGE READY
     ----------------------------------------- */

  window.addEventListener(
    "load",
    () => {

      document.body.classList.add(
        "services-page-ready"
      );

    }
  );

})();