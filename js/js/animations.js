/* =========================================================
   VITAL LOOP — ANIMATIONS ENGINE
   js/animations.js
   ========================================================= */

(function () {
  "use strict";

  /* =======================================================
     CONFIG
     ======================================================= */

  const CONFIG = {
    revealThreshold: 0.12,
    revealRootMargin: "0px 0px -45px 0px",
    counterDuration: 1400,
    staggerDelay: 70
  };


  /* =======================================================
     DOM READY
     ======================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    function () {

      initializeRevealAnimations();
      initializeCounters();
      initializeStaggerAnimations();
      initializeMagneticButtons();
      initializeCardTilt();
      initializeScrollProgress();
      initializeRippleEffect();
      initializeReducedMotion();

    }
  );


  /* =======================================================
     REDUCED MOTION
     ======================================================= */

  let reducedMotion = false;

  function initializeReducedMotion() {

    if (!window.matchMedia) {
      return;
    }

    const mediaQuery =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    reducedMotion =
      mediaQuery.matches;

    if (reducedMotion) {

      document.documentElement.classList.add(
        "reduced-motion"
      );

    }

    mediaQuery.addEventListener(
      "change",
      function (event) {

        reducedMotion =
          event.matches;

        document.documentElement.classList.toggle(
          "reduced-motion",
          reducedMotion
        );

      }
    );

  }


  /* =======================================================
     SCROLL REVEAL
     ======================================================= */

  function initializeRevealAnimations() {

    const elements =
      document.querySelectorAll(
        ".reveal, " +
        ".scroll-reveal, " +
        "[data-reveal]"
      );

    if (!elements.length) {
      return;
    }

    if (
      reducedMotion ||
      !("IntersectionObserver" in window)
    ) {

      elements.forEach(function (element) {

        element.classList.add(
          "revealed"
        );

      });

      return;

    }

    const observer =
      new IntersectionObserver(
        function (entries, observerInstance) {

          entries.forEach(function (entry) {

            if (!entry.isIntersecting) {
              return;
            }

            const element =
              entry.target;

            const delay =
              element.dataset.revealDelay;

            if (delay) {

              element.style.transitionDelay =
                delay + "ms";

            }

            element.classList.add(
              "revealed"
            );

            observerInstance.unobserve(
              element
            );

          });

        },
        {
          threshold:
            CONFIG.revealThreshold,

          rootMargin:
            CONFIG.revealRootMargin
        }
      );

    elements.forEach(function (element) {

      observer.observe(element);

    });

  }


  /* =======================================================
     NUMBER COUNTERS
     ======================================================= */

  function initializeCounters() {

    const counters =
      document.querySelectorAll(
        "[data-counter]"
      );

    if (!counters.length) {
      return;
    }

    if (
      reducedMotion ||
      !("IntersectionObserver" in window)
    ) {

      counters.forEach(function (counter) {

        setCounterFinalValue(
          counter
        );

      });

      return;

    }

    const observer =
      new IntersectionObserver(
        function (entries, observerInstance) {

          entries.forEach(function (entry) {

            if (!entry.isIntersecting) {
              return;
            }

            const counter =
              entry.target;

            if (
              counter.dataset.counterStarted ===
              "true"
            ) {
              observerInstance.unobserve(
                counter
              );

              return;
            }

            counter.dataset.counterStarted =
              "true";

            animateCounter(
              counter
            );

            observerInstance.unobserve(
              counter
            );

          });

        },
        {
          threshold: 0.4
        }
      );

    counters.forEach(function (counter) {

      observer.observe(counter);

    });

  }


  function getCounterValue(element) {

    const raw =
      element.dataset.counter;

    const value =
      Number(
        String(raw)
          .replace(/,/g, "")
      );

    return Number.isFinite(value)
      ? value
      : 0;

  }


  function setCounterFinalValue(element) {

    const value =
      getCounterValue(element);

    const decimals =
      Number(
        element.dataset.counterDecimals ||
        0
      );

    element.textContent =
      formatNumber(
        value,
        decimals,
        element
      );

  }


  function animateCounter(element) {

    const target =
      getCounterValue(element);

    const decimals =
      Number(
        element.dataset.counterDecimals ||
        0
      );

    const duration =
      Number(
        element.dataset.counterDuration ||
        CONFIG.counterDuration
      );

    const prefix =
      element.dataset.counterPrefix ||
      "";

    const suffix =
      element.dataset.counterSuffix ||
      "";

    const start =
      performance.now();

    function frame(now) {

      const progress =
        Math.min(
          (now - start) / duration,
          1
        );

      const eased =
        1 -
        Math.pow(
          1 - progress,
          3
        );

      const current =
        target * eased;

      element.textContent =
        prefix +
        formatNumericValue(
          current,
          decimals
        ) +
        suffix;

      if (progress < 1) {

        requestAnimationFrame(
          frame
        );

      }

    }

    requestAnimationFrame(
      frame
    );

  }


  function formatNumber(
    value,
    decimals,
    element
  ) {

    const prefix =
      element.dataset.counterPrefix ||
      "";

    const suffix =
      element.dataset.counterSuffix ||
      "";

    return (
      prefix +
      formatNumericValue(
        value,
        decimals
      ) +
      suffix
    );

  }


  function formatNumericValue(
    value,
    decimals
  ) {

    return Number(
      value
    ).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits:
          decimals,

        maximumFractionDigits:
          decimals
      }
    );

  }


  /* =======================================================
     STAGGERED ITEMS
     ======================================================= */

  function initializeStaggerAnimations() {

    const groups =
      document.querySelectorAll(
        "[data-stagger]"
      );

    groups.forEach(function (group) {

      const children =
        group.children;

      Array.from(children).forEach(
        function (child, index) {

          child.style.setProperty(
            "--stagger-delay",
            (
              index *
              CONFIG.staggerDelay
            ) + "ms"
          );

          child.classList.add(
            "stagger-item"
          );

        }
      );

    });

  }


  /* =======================================================
     MAGNETIC BUTTONS
     ======================================================= */

  function initializeMagneticButtons() {

    if (
      reducedMotion ||
      window.matchMedia(
        "(hover: none)"
      ).matches
    ) {
      return;
    }

    const buttons =
      document.querySelectorAll(
        "[data-magnetic]"
      );

    buttons.forEach(function (button) {

      button.addEventListener(
        "mousemove",
        function (event) {

          const rect =
            button.getBoundingClientRect();

          const x =
            event.clientX -
            rect.left -
            rect.width / 2;

          const y =
            event.clientY -
            rect.top -
            rect.height / 2;

          const strength =
            Number(
              button.dataset.magneticStrength ||
              0.12
            );

          button.style.transform =
            "translate(" +
            (x * strength) +
            "px, " +
            (y * strength) +
            "px)";

        }
      );

      button.addEventListener(
        "mouseleave",
        function () {

          button.style.transform =
            "";

        }
      );

    });

  }


  /* =======================================================
     CARD TILT
     ======================================================= */

  function initializeCardTilt() {

    if (
      reducedMotion ||
      window.matchMedia(
        "(hover: none)"
      ).matches
    ) {
      return;
    }

    const cards =
      document.querySelectorAll(
        "[data-tilt]"
      );

    cards.forEach(function (card) {

      card.addEventListener(
        "mousemove",
        function (event) {

          const rect =
            card.getBoundingClientRect();

          const x =
            event.clientX -
            rect.left;

          const y =
            event.clientY -
            rect.top;

          const rotateX =
            ((y / rect.height) - 0.5) *
            -5;

          const rotateY =
            ((x / rect.width) - 0.5) *
            5;

          card.style.transform =
            "perspective(900px) " +
            "rotateX(" +
            rotateX +
            "deg) " +
            "rotateY(" +
            rotateY +
            "deg) " +
            "translateY(-3px)";

        }
      );

      card.addEventListener(
        "mouseleave",
        function () {

          card.style.transform =
            "";

        }
      );

    });

  }


  /* =======================================================
     SCROLL PROGRESS
     ======================================================= */

  function initializeScrollProgress() {

    const progress =
      document.querySelector(
        "[data-scroll-progress]"
      );

    if (!progress) {
      return;
    }

    function update() {

      const scrollTop =
        window.scrollY;

      const documentHeight =
        document.documentElement
          .scrollHeight;

      const viewportHeight =
        window.innerHeight;

      const maxScroll =
        documentHeight -
        viewportHeight;

      const percentage =
        maxScroll > 0
          ? (
              scrollTop /
              maxScroll
            ) * 100
          : 0;

      progress.style.width =
        Math.max(
          0,
          Math.min(
            100,
            percentage
          )
        ) + "%";

    }

    window.addEventListener(
      "scroll",
      update,
      {
        passive: true
      }
    );

    window.addEventListener(
      "resize",
      update
    );

    update();

  }


  /* =======================================================
     RIPPLE EFFECT
     ======================================================= */

  function initializeRippleEffect() {

    document.addEventListener(
      "click",
      function (event) {

        const element =
          event.target.closest(
            "[data-ripple]"
          );

        if (!element) {
          return;
        }

        if (reducedMotion) {
          return;
        }

        const rect =
          element.getBoundingClientRect();

        const ripple =
          document.createElement(
            "span"
          );

        ripple.className =
          "vital-ripple";

        const size =
          Math.max(
            rect.width,
            rect.height
          );

        ripple.style.width =
          size + "px";

        ripple.style.height =
          size + "px";

        ripple.style.left =
          (
            event.clientX -
            rect.left -
            size / 2
          ) + "px";

        ripple.style.top =
          (
            event.clientY -
            rect.top -
            size / 2
          ) + "px";

        element.appendChild(
          ripple
        );

        setTimeout(function () {

          ripple.remove();

        }, 650);

      }
    );

  }


  /* =======================================================
     PARALLAX
     ======================================================= */

  function initializeParallax() {

    if (
      reducedMotion ||
      window.matchMedia(
        "(hover: none)"
      ).matches
    ) {
      return;
    }

    const elements =
      document.querySelectorAll(
        "[data-parallax]"
      );

    if (!elements.length) {
      return;
    }

    let ticking = false;

    function update() {

      const scroll =
        window.scrollY;

      elements.forEach(function (element) {

        const speed =
          Number(
            element.dataset.parallax ||
            0.08
          );

        const rect =
          element.getBoundingClientRect();

        const center =
          rect.top +
          rect.height / 2 -
          window.innerHeight / 2;

        const offset =
          center * speed;

        element.style.transform =
          "translate3d(0," +
          (-offset) +
          "px,0)";

      });

      ticking = false;

    }

    window.addEventListener(
      "scroll",
      function () {

        if (ticking) {
          return;
        }

        ticking = true;

        requestAnimationFrame(
          update
        );

      },
      {
        passive: true
      }
    );

  }

  initializeParallax();


  /* =======================================================
     PAGE TRANSITION
     ======================================================= */

  function initializePageTransitions() {

    if (reducedMotion) {
      return;
    }

    document.addEventListener(
      "click",
      function (event) {

        const link =
          event.target.closest(
            "a"
          );

        if (!link) {
          return;
        }

        if (
          link.target === "_blank" ||
          link.hasAttribute("download") ||
          link.dataset.noTransition !== undefined
        ) {
          return;
        }

        const href =
          link.getAttribute("href");

        if (
          !href ||
          href.startsWith("#") ||
          href.startsWith("javascript:") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:")
        ) {
          return;
        }

        let url;

        try {

          url =
            new URL(
              href,
              window.location.href
            );

        } catch (error) {

          return;

        }

        if (
          url.origin !==
          window.location.origin
        ) {
          return;
        }

        if (
          url.pathname ===
          window.location.pathname
        ) {
          return;
        }

        event.preventDefault();

        document.body.classList.add(
          "page-exiting"
        );

        setTimeout(
          function () {

            window.location.href =
              url.href;

          },
          180
        );

      }
    );

  }

  initializePageTransitions();


  /* =======================================================
     LOADED STATE
     ======================================================= */

  function markPageLoaded() {

    document.documentElement.classList.add(
      "page-ready"
    );

    document.body.classList.add(
      "page-ready"
    );

  }

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      markPageLoaded
    );

  } else {

    markPageLoaded();

  }


  /* =======================================================
     PUBLIC API
     ======================================================= */

  window.VitalLoopAnimations = {

    reveal: function (
      element
    ) {

      if (!element) {
        return;
      }

      element.classList.add(
        "revealed"
      );

    },

    counter: function (
      element
    ) {

      if (!element) {
        return;
      }

      animateCounter(
        element
      );

    },

    reducedMotion: function () {

      return reducedMotion;

    }

  };

})();
