/* =========================================================
   VITAL LOOP — ACCESSIBILITY CONTROLLER
   js/accessibility.js
   ========================================================= */

(function () {
  "use strict";

  const STORAGE_KEY =
    "vitalLoopAccessibility";

  const state = {
    largeText: false,
    highContrast: false,
    reducedMotion: false,
    focusMode: false
  };


  /* =======================================================
     INITIALIZATION
     ======================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    initializeAccessibility
  );


  function initializeAccessibility() {

    loadPreferences();

    detectSystemPreferences();

    bindAccessibilityControls();

    applyAccessibility();

    improveKeyboardNavigation();

    addSkipLink();

    improveImages();

    improveButtons();

    updateAccessibilityUI();

  }


  /* =======================================================
     LOAD / SAVE
     ======================================================= */

  function loadPreferences() {

    try {

      const saved =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (!saved) {
        return;
      }

      const parsed =
        JSON.parse(
          saved
        );

      if (
        parsed &&
        typeof parsed === "object"
      ) {

        state.largeText =
          Boolean(
            parsed.largeText
          );

        state.highContrast =
          Boolean(
            parsed.highContrast
          );

        state.reducedMotion =
          Boolean(
            parsed.reducedMotion
          );

        state.focusMode =
          Boolean(
            parsed.focusMode
          );

      }

    } catch (error) {

      console.warn(
        "Vital Loop accessibility preferences unavailable.",
        error
      );

    }

  }


  function savePreferences() {

    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          state
        )
      );

    } catch (error) {
      /* Accessibility still works without storage. */
    }

  }


  /* =======================================================
     SYSTEM PREFERENCES
     ======================================================= */

  function detectSystemPreferences() {

    try {

      const reducedMotion =
        window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        );

      if (
        reducedMotion.matches
      ) {

        state.reducedMotion =
          true;

      }

      reducedMotion.addEventListener(
        "change",
        function (event) {

          if (
            event.matches
          ) {

            state.reducedMotion =
              true;

            applyAccessibility();

          }

        }
      );

    } catch (error) {
      /* matchMedia may not be available. */
    }

  }


  /* =======================================================
     CONTROLS
     ======================================================= */

  function bindAccessibilityControls() {

    document
      .querySelectorAll(
        "[data-a11y-large-text]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            toggleLargeText
          );

        }
      );


    document
      .querySelectorAll(
        "[data-a11y-contrast]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            toggleHighContrast
          );

        }
      );


    document
      .querySelectorAll(
        "[data-a11y-motion]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            toggleReducedMotion
          );

        }
      );


    document
      .querySelectorAll(
        "[data-a11y-focus]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            toggleFocusMode
          );

        }
      );


    document
      .querySelectorAll(
        "[data-a11y-reset]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            resetAccessibility
          );

        }
      );

  }


  /* =======================================================
     LARGE TEXT
     ======================================================= */

  function toggleLargeText() {

    state.largeText =
      !state.largeText;

    savePreferences();

    applyAccessibility();

    updateAccessibilityUI();

    showMessage(
      state.largeText
        ? "Larger text enabled."
        : "Larger text disabled."
    );

  }


  /* =======================================================
     HIGH CONTRAST
     ======================================================= */

  function toggleHighContrast() {

    state.highContrast =
      !state.highContrast;

    savePreferences();

    applyAccessibility();

    updateAccessibilityUI();

    showMessage(
      state.highContrast
        ? "High contrast enabled."
        : "High contrast disabled."
    );

  }


  /* =======================================================
     REDUCED MOTION
     ======================================================= */

  function toggleReducedMotion() {

    state.reducedMotion =
      !state.reducedMotion;

    savePreferences();

    applyAccessibility();

    updateAccessibilityUI();

    showMessage(
      state.reducedMotion
        ? "Reduced motion enabled."
        : "Reduced motion disabled."
    );

  }


  /* =======================================================
     FOCUS MODE
     ======================================================= */

  function toggleFocusMode() {

    state.focusMode =
      !state.focusMode;

    savePreferences();

    applyAccessibility();

    updateAccessibilityUI();

    showMessage(
      state.focusMode
        ? "Focus mode enabled."
        : "Focus mode disabled."
    );

  }


  /* =======================================================
     APPLY CLASSES
     ======================================================= */

  function applyAccessibility() {

    const root =
      document.documentElement;

    const body =
      document.body;


    root.classList.toggle(
      "a11y-large-text",
      state.largeText
    );

    root.classList.toggle(
      "a11y-high-contrast",
      state.highContrast
    );

    root.classList.toggle(
      "a11y-reduced-motion",
      state.reducedMotion
    );

    root.classList.toggle(
      "a11y-focus-mode",
      state.focusMode
    );


    body.classList.toggle(
      "a11y-large-text",
      state.largeText
    );

    body.classList.toggle(
      "a11y-high-contrast",
      state.highContrast
    );

    body.classList.toggle(
      "a11y-reduced-motion",
      state.reducedMotion
    );

    body.classList.toggle(
      "a11y-focus-mode",
      state.focusMode
    );

  }


  /* =======================================================
     UPDATE UI
     ======================================================= */

  function updateAccessibilityUI() {

    updateToggle(
      "[data-a11y-large-text]",
      state.largeText
    );

    updateToggle(
      "[data-a11y-contrast]",
      state.highContrast
    );

    updateToggle(
      "[data-a11y-motion]",
      state.reducedMotion
    );

    updateToggle(
      "[data-a11y-focus]",
      state.focusMode
    );

  }


  function updateToggle(
    selector,
    active
  ) {

    document
      .querySelectorAll(
        selector
      )
      .forEach(
        function (button) {

          button.setAttribute(
            "aria-pressed",
            String(
              active
            )
          );

          button.classList.toggle(
            "active",
            active
          );

        }
      );

  }


  /* =======================================================
     KEYBOARD NAVIGATION
     ======================================================= */

  function improveKeyboardNavigation() {

    document.addEventListener(
      "keydown",
      function (event) {

        if (
          event.key === "Tab"
        ) {

          document.body.classList.add(
            "keyboard-user"
          );

        }

      }
    );


    document.addEventListener(
      "mousedown",
      function () {

        document.body.classList.remove(
          "keyboard-user"
        );

      }
    );


    document.addEventListener(
      "keydown",
      function (event) {

        if (
          event.key === "Escape"
        ) {

          closeAccessibleOverlays();

        }

      }
    );

  }


  function closeAccessibleOverlays() {

    document
      .querySelectorAll(
        "[role='dialog'][aria-modal='true']"
      )
      .forEach(
        function (dialog) {

          if (
            !dialog.hidden
          ) {

            const closeButton =
              dialog.querySelector(
                "[data-close], [data-modal-close], .modal-close"
              );

            if (closeButton) {

              closeButton.click();

            }

          }

        }
      );


    document
      .querySelectorAll(
        ".mobile-menu.open, .mobile-menu.active, [data-mobile-menu].open"
      )
      .forEach(
        function (menu) {

          menu.classList.remove(
            "open",
            "active"
          );

        }
      );

  }


  /* =======================================================
     SKIP LINK
     ======================================================= */

  function addSkipLink() {

    if (
      document.querySelector(
        ".vital-loop-skip-link"
      )
    ) {

      return;

    }


    const main =
      document.querySelector(
        "main"
      );

    if (!main) {
      return;
    }


    if (
      !main.id
    ) {

      main.id =
        "main-content";

    }


    const skip =
      document.createElement(
        "a"
      );

    skip.className =
      "vital-loop-skip-link";

    skip.href =
      "#" +
      main.id;

    skip.textContent =
      "Skip to main content";


    document.body.insertBefore(
      skip,
      document.body.firstChild
    );

  }


  /* =======================================================
     IMAGE ACCESSIBILITY
     ======================================================= */

  function improveImages() {

    document
      .querySelectorAll(
        "img"
      )
      .forEach(
        function (image) {

          if (
            image.hasAttribute(
              "alt"
            )
          ) {

            return;

          }

          /*
            Decorative images should explicitly use
            an empty alt value rather than exposing the
            filename to screen readers.
          */

          image.setAttribute(
            "alt",
            ""
          );

        }
      );

  }


  /* =======================================================
     BUTTON ACCESSIBILITY
     ======================================================= */

  function improveButtons() {

    document
      .querySelectorAll(
        "button"
      )
      .forEach(
        function (button) {

          if (
            !button.getAttribute(
              "aria-label"
            ) &&
            !button.textContent.trim() &&
            !button.title
          ) {

            const title =
              button.getAttribute(
                "data-label"
              );

            if (title) {

              button.setAttribute(
                "aria-label",
                title
              );

            }

          }

        }
      );


    document
      .querySelectorAll(
        "[data-icon-button]"
      )
      .forEach(
        function (button) {

          if (
            !button.getAttribute(
              "aria-label"
            )
          ) {

            const label =
              button.dataset.iconButton;

            if (label) {

              button.setAttribute(
                "aria-label",
                label
              );

            }

          }

        }
      );

  }


  /* =======================================================
     LIVE REGION
     ======================================================= */

  function announce(
    message
  ) {

    let region =
      document.getElementById(
        "vitalLoopA11yLiveRegion"
      );


    if (!region) {

      region =
        document.createElement(
          "div"
        );

      region.id =
        "vitalLoopA11yLiveRegion";

      region.setAttribute(
        "aria-live",
        "polite"
      );

      region.setAttribute(
        "aria-atomic",
        "true"
      );

      region.style.position =
        "absolute";

      region.style.width =
        "1px";

      region.style.height =
        "1px";

      region.style.padding =
        "0";

      region.style.margin =
        "-1px";

      region.style.overflow =
        "hidden";

      region.style.clip =
        "rect(0,0,0,0)";

      region.style.whiteSpace =
        "nowrap";

      region.style.border =
        "0";

      document.body.appendChild(
        region
      );

    }


    region.textContent =
      "";

    setTimeout(
      function () {

        region.textContent =
          message;

      },
      30
    );

  }


  /* =======================================================
     FOCUS ELEMENT
     ======================================================= */

  function focusElement(
    selector
  ) {

    const element =
      document.querySelector(
        selector
      );

    if (!element) {
      return false;
    }


    if (
      !element.hasAttribute(
        "tabindex"
      )
    ) {

      element.setAttribute(
        "tabindex",
        "-1"
      );

    }


    element.focus({
      preventScroll:
        false
    });


    return true;

  }


  /* =======================================================
     TEXT SIZE
     ======================================================= */

  function setTextScale(
    scale
  ) {

    const validScales =
      [
        "normal",
        "large",
        "xlarge"
      ];


    if (
      !validScales.includes(
        scale
      )
    ) {

      return;

    }


    document.documentElement.dataset.textScale =
      scale;

    document.body.dataset.textScale =
      scale;


    state.largeText =
      scale !== "normal";

    savePreferences();

    applyAccessibility();

    updateAccessibilityUI();

  }


  /* =======================================================
     RESET
     ======================================================= */

  function resetAccessibility() {

    state.largeText =
      false;

    state.highContrast =
      false;

    state.reducedMotion =
      false;

    state.focusMode =
      false;


    document.documentElement.dataset.textScale =
      "normal";

    document.body.dataset.textScale =
      "normal";


    savePreferences();

    applyAccessibility();

    updateAccessibilityUI();

    announce(
      "Accessibility settings reset."
    );

    showMessage(
      "Accessibility settings reset."
    );

  }


  /* =======================================================
     TOAST
     ======================================================= */

  function showMessage(
    message
  ) {

    announce(
      message
    );


    if (
      typeof window.VitalLoopToast ===
      "function"
    ) {

      window.VitalLoopToast(
        message
      );

      return;

    }


    let toast =
      document.getElementById(
        "vitalLoopAccessibilityToast"
      );


    if (!toast) {

      toast =
        document.createElement(
          "div"
        );

      toast.id =
        "vitalLoopAccessibilityToast";

      Object.assign(
        toast.style,
        {
          position: "fixed",
          left: "50%",
          bottom: "24px",
          transform:
            "translateX(-50%)",
          zIndex: "99999",
          maxWidth: "90vw",
          padding:
            "12px 18px",
          borderRadius:
            "999px",
          background:
            "#102027",
          color:
            "#ffffff",
          fontSize:
            "14px",
          fontWeight:
            "700",
          textAlign:
            "center",
          boxShadow:
            "0 12px 30px rgba(0,0,0,.2)"
        }
      );


      document.body.appendChild(
        toast
      );

    }


    toast.textContent =
      message;


    clearTimeout(
      toast._timer
    );


    toast._timer =
      setTimeout(
        function () {

          toast.remove();

        },
        2800
      );

  }


  /* =======================================================
     PUBLIC API
     ======================================================= */

  window.VitalLoopAccessibility = {

    getState:
      function () {

        return {
          ...state
        };

      },

    enableLargeText:
      function () {

        state.largeText =
          true;

        savePreferences();

        applyAccessibility();

        updateAccessibilityUI();

      },

    disableLargeText:
      function () {

        state.largeText =
          false;

        savePreferences();

        applyAccessibility();

        updateAccessibilityUI();

      },

    toggleContrast:
      toggleHighContrast,

    toggleMotion:
      toggleReducedMotion,

    toggleFocus:
      toggleFocusMode,

    setTextScale:
      setTextScale,

    announce:
      announce,

    focus:
      focusElement,

    reset:
      resetAccessibility

  };

})();
