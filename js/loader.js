/* =========================================================
   VITAL LOOP — PREMIUM LOADER
   js/loader.js
   ========================================================= */

(function () {
  "use strict";

  const LOADER_ID = "vitalLoopLoader";

  const MAX_WAIT_TIME = 5000;

  const MIN_DISPLAY_TIME = 850;

  let loaderStartTime = Date.now();

  let hidden = false;


  /* =======================================================
     INITIALIZE
     ======================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    initializeLoader
  );


  function initializeLoader() {

    loaderStartTime = Date.now();

    const loader =
      document.getElementById(
        LOADER_ID
      );

    if (!loader) {
      return;
    }

    prepareLoader(loader);

    startLoaderAnimation(loader);

    /*
      Give the page enough time to render before
      removing the loading layer.
    */

    requestAnimationFrame(function () {

      setTimeout(function () {

        hideLoader();

      }, MIN_DISPLAY_TIME);

    });

    /*
      Absolute fallback.
      Even if another script fails, the loader will
      never remain visible indefinitely.
    */

    setTimeout(function () {

      hideLoader(true);

    }, MAX_WAIT_TIME);

  }


  /* =======================================================
     PREPARE
     ======================================================= */

  function prepareLoader(loader) {

    loader.setAttribute(
      "aria-busy",
      "true"
    );

    loader.setAttribute(
      "role",
      "status"
    );

    loader.setAttribute(
      "aria-label",
      "Loading Vital Loop"
    );

    loader.classList.add(
      "vital-loader-active"
    );

    document.body.classList.add(
      "loader-visible"
    );

  }


  /* =======================================================
     ANIMATION
     ======================================================= */

  function startLoaderAnimation(loader) {

    const drop =
      loader.querySelector(
        "[data-loader-drop]"
      );

    const ripple =
      loader.querySelector(
        "[data-loader-ripple]"
      );

    const progress =
      loader.querySelector(
        "[data-loader-progress]"
      );

    const brand =
      loader.querySelector(
        "[data-loader-brand]"
      );

    if (drop) {

      drop.classList.add(
        "loader-drop-start"
      );

    }

    if (ripple) {

      ripple.classList.add(
        "loader-ripple-start"
      );

    }

    if (brand) {

      setTimeout(function () {

        brand.classList.add(
          "loader-brand-visible"
        );

      }, 550);

    }

    if (progress) {

      progress.classList.add(
        "loader-progress-start"
      );

    }

  }


  /* =======================================================
     HIDE LOADER
     ======================================================= */

  function hideLoader(force) {

    if (hidden) {
      return;
    }

    const loader =
      document.getElementById(
        LOADER_ID
      );

    if (!loader) {
      hidden = true;
      document.body.classList.remove(
        "loader-visible"
      );
      return;
    }

    const elapsed =
      Date.now() -
      loaderStartTime;

    if (
      !force &&
      elapsed < MIN_DISPLAY_TIME
    ) {

      setTimeout(
        function () {
          hideLoader(false);
        },
        MIN_DISPLAY_TIME - elapsed
      );

      return;

    }

    hidden = true;

    loader.classList.add(
      "loader-complete"
    );

    loader.setAttribute(
      "aria-busy",
      "false"
    );

    document.body.classList.remove(
      "loader-visible"
    );

    /*
      Allow CSS transition to complete before
      removing the loader from normal interaction.
    */

    setTimeout(function () {

      loader.setAttribute(
        "aria-hidden",
        "true"
      );

      loader.classList.add(
        "loader-hidden"
      );

      loader.style.pointerEvents =
        "none";

    }, 650);

  }


  /* =======================================================
     PUBLIC API
     ======================================================= */

  window.VitalLoopLoader = {

    hide: function () {

      hideLoader(false);

    },

    forceHide: function () {

      hideLoader(true);

    },

    isVisible: function () {

      const loader =
        document.getElementById(
          LOADER_ID
        );

      if (!loader) {
        return false;
      }

      return !loader.classList.contains(
        "loader-hidden"
      );

    }

  };


  /* =======================================================
     PAGE LOAD FALLBACK
     ======================================================= */

  window.addEventListener(
    "load",
    function () {

      /*
        Do not wait indefinitely for external
        assets such as maps or optional images.
      */

      setTimeout(function () {

        hideLoader(false);

      }, 180);

    }
  );


  /* =======================================================
     REDUCED MOTION
     ======================================================= */

  function respectReducedMotion() {

    if (!window.matchMedia) {
      return;
    }

    const reduced =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    if (!reduced) {
      return;
    }

    const loader =
      document.getElementById(
        LOADER_ID
      );

    if (!loader) {
      return;
    }

    loader.classList.add(
      "loader-reduced-motion"
    );

  }


  document.addEventListener(
    "DOMContentLoaded",
    respectReducedMotion
  );


  /* =======================================================
     VISIBILITY SAFETY
     ======================================================= */

  document.addEventListener(
    "visibilitychange",
    function () {

      if (
        document.visibilityState === "visible" &&
        !hidden
      ) {

        const elapsed =
          Date.now() -
          loaderStartTime;

        if (elapsed > MAX_WAIT_TIME) {

          hideLoader(true);

        }

      }

    }
  );

})();
