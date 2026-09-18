/* =========================================================
   VITAL LOOP — EASY MODE
   js/easy-mode.js
   ========================================================= */

(function () {
  "use strict";

  const STORAGE_KEY = "vitalLoopEasyMode";

  const state = {
    enabled: false,
    step: 1,
    language: "en",
    voiceEnabled: false
  };

  const STEPS = [
    {
      number: 1,
      title: "What do you need?",
      titleHi: "Aapko kya chahiye?",
      description:
        "Choose the type of help you need.",
      descriptionHi:
        "Jis help ki zarurat hai, use select karein.",
      icon: "👋"
    },
    {
      number: 2,
      title: "Where do you need help?",
      titleHi: "Help kahan chahiye?",
      description:
        "Tell us your city, location or use your device location.",
      descriptionHi:
        "Apna city/location batayein ya device location use karein.",
      icon: "📍"
    },
    {
      number: 3,
      title: "Healthcare facility",
      titleHi: "Healthcare facility",
      description:
        "Add the hospital or healthcare facility connected with the request.",
      descriptionHi:
        "Request se connected hospital ya healthcare facility add karein.",
      icon: "🏥"
    },
    {
      number: 4,
      title: "Finding potential resources",
      titleHi: "Potential resources dhoondh rahe hain",
      description:
        "Vital Loop can help discover potential resources and coordination options.",
      descriptionHi:
        "Vital Loop potential resources aur coordination options dhoondhne mein help karta hai.",
      icon: "🔎"
    },
    {
      number: 5,
      title: "Verification & coordination",
      titleHi: "Verification aur coordination",
      description:
        "Availability must be confirmed through an authorised source.",
      descriptionHi:
        "Availability ko authorised source se confirm karna zaroori hai.",
      icon: "✓"
    }
  ];


  /* =======================================================
     INITIALIZATION
     ======================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    initializeEasyMode
  );


  function initializeEasyMode() {

    loadState();

    bindToggle();

    bindLanguage();

    bindSteps();

    bindVoice();

    bindQuickActions();

    applyMode();

    renderStep();

  }


  /* =======================================================
     STORAGE
     ======================================================= */

  function loadState() {

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

        state.enabled =
          Boolean(
            parsed.enabled
          );

        state.step =
          Number(
            parsed.step
          ) || 1;

        state.language =
          parsed.language === "hi"
            ? "hi"
            : "en";

        state.voiceEnabled =
          Boolean(
            parsed.voiceEnabled
          );

      }

    } catch (error) {

      console.warn(
        "Vital Loop Easy Mode state unavailable.",
        error
      );

    }

  }


  function saveState() {

    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          state
        )
      );

    } catch (error) {
      /* Storage is optional. */
    }

  }


  /* =======================================================
     TOGGLE
     ======================================================= */

  function bindToggle() {

    document
      .querySelectorAll(
        "[data-easy-mode-toggle]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              state.enabled =
                !state.enabled;

              saveState();

              applyMode();

              showMessage(
                state.enabled
                  ? getText(
                      "Easy Mode is on.",
                      "Easy Mode on hai."
                    )
                  : getText(
                      "Easy Mode is off.",
                      "Easy Mode off hai."
                    )
              );

            }
          );

        }
      );

  }


  function applyMode() {

    document.documentElement.classList.toggle(
      "easy-mode",
      state.enabled
    );

    document.body.classList.toggle(
      "easy-mode-active",
      state.enabled
    );


    document
      .querySelectorAll(
        "[data-easy-mode-toggle]"
      )
      .forEach(
        function (button) {

          button.setAttribute(
            "aria-pressed",
            String(
              state.enabled
            )
          );

          const label =
            button.querySelector(
              "[data-easy-mode-label]"
            );

          if (label) {

            label.textContent =
              state.enabled
                ? getText(
                    "Easy Mode On",
                    "Easy Mode On"
                  )
                : getText(
                    "Easy Mode",
                    "Easy Mode"
                  );

          }

        }
      );


    document
      .querySelectorAll(
        "[data-easy-mode-status]"
      )
      .forEach(
        function (element) {

          element.textContent =
            state.enabled
              ? getText(
                  "Easy Mode is active",
                  "Easy Mode active hai"
                )
              : getText(
                  "Easy Mode is off",
                  "Easy Mode off hai"
                );

        }
      );

  }


  /* =======================================================
     LANGUAGE
     ======================================================= */

  function bindLanguage() {

    document
      .querySelectorAll(
        "[data-easy-language]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              const language =
                button.dataset
                  .easyLanguage;

              if (
                language !== "hi" &&
                language !== "en"
              ) {
                return;
              }

              state.language =
                language;

              saveState();

              renderStep();

              updateLanguageUI();

            }
          );

        }
      );

    updateLanguageUI();

  }


  function updateLanguageUI() {

    document
      .querySelectorAll(
        "[data-easy-language]"
      )
      .forEach(
        function (button) {

          const active =
            button.dataset
              .easyLanguage ===
            state.language;

          button.classList.toggle(
            "active",
            active
          );

          button.setAttribute(
            "aria-pressed",
            String(
              active
            )
          );

        }
      );

  }


  /* =======================================================
     STEP NAVIGATION
     ======================================================= */

  function bindSteps() {

    document
      .querySelectorAll(
        "[data-easy-next]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              nextStep();

            }
          );

        }
      );


    document
      .querySelectorAll(
        "[data-easy-back]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              previousStep();

            }
          );

        }
      );


    document
      .querySelectorAll(
        "[data-easy-step]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              const target =
                Number(
                  button.dataset
                    .easyStep
                );

              if (
                target >= 1 &&
                target <= STEPS.length
              ) {

                state.step =
                  target;

                saveState();

                renderStep();

              }

            }
          );

        }
      );

  }


  function nextStep() {

    if (
      state.step <
      STEPS.length
    ) {

      state.step++;

      saveState();

      renderStep();

      return;

    }

    showMessage(
      getText(
        "You have reached the end of the guidance.",
        "Aap guidance ke end par pahunch gaye hain."
      )
    );

  }


  function previousStep() {

    if (
      state.step >
      1
    ) {

      state.step--;

      saveState();

      renderStep();

    }

  }


  function renderStep() {

    const current =
      STEPS[
        Math.max(
          0,
          Math.min(
            STEPS.length - 1,
            state.step - 1
          )
        )
      ];


    if (!current) {
      return;
    }


    const title =
      state.language === "hi"
        ? current.titleHi
        : current.title;

    const description =
      state.language === "hi"
        ? current.descriptionHi
        : current.description;


    setText(
      "[data-easy-step-number]",
      String(
        current.number
      )
    );

    setText(
      "[data-easy-step-icon]",
      current.icon
    );

    setText(
      "[data-easy-step-title]",
      title
    );

    setText(
      "[data-easy-step-description]",
      description
    );


    document
      .querySelectorAll(
        "[data-easy-step-item]"
      )
      .forEach(
        function (item) {

          const index =
            Number(
              item.dataset
                .easyStepItem
            );

          item.classList.toggle(
            "active",
            index === current.number
          );

          item.classList.toggle(
            "complete",
            index <
              current.number
          );

        }
      );


    const progress =
      (
        current.number /
        STEPS.length
      ) *
      100;


    document
      .querySelectorAll(
        "[data-easy-progress]"
      )
      .forEach(
        function (bar) {

          bar.style.width =
            progress + "%";

          bar.setAttribute(
            "aria-valuenow",
            String(
              Math.round(
                progress
              )
            )
          );

        }
      );


    setText(
      "[data-easy-progress-text]",
      state.language === "hi"
        ? `Step ${current.number} / ${STEPS.length}`
        : `Step ${current.number} of ${STEPS.length}`
    );


    updateNavigationButtons();

  }


  function updateNavigationButtons() {

    document
      .querySelectorAll(
        "[data-easy-back]"
      )
      .forEach(
        function (button) {

          button.disabled =
            state.step <= 1;

        }
      );


    document
      .querySelectorAll(
        "[data-easy-next]"
      )
      .forEach(
        function (button) {

          button.textContent =
            state.step >=
            STEPS.length
              ? getText(
                  "Done",
                  "Done"
                )
              : getText(
                  "Next",
                  "Aage"
                );

        }
      );

  }


  /* =======================================================
     QUICK ACTIONS
     ======================================================= */

  function bindQuickActions() {

    document
      .querySelectorAll(
        "[data-easy-action]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              handleQuickAction(
                button.dataset
                  .easyAction
              );

            }
          );

        }
      );

  }


  function handleQuickAction(
    action
  ) {

    const routes = {
      emergency:
        "emergency.html",

      request:
        "blood-request.html",

      find:
        "find-blood.html",

      donor:
        "donor.html",

      camps:
        "camps.html",

      education:
        "blood-education.html",

      assistant:
        "assistant.html",

      tracking:
        "tracking.html",

      prescription:
        "prescription.html"
    };


    if (
      routes[action]
    ) {

      window.location.href =
        routes[action];

      return;

    }


    if (
      action === "location"
    ) {

      requestLocation();

      return;

    }


    if (
      action === "voice"
    ) {

      toggleVoice();

    }

  }


  /* =======================================================
     VOICE SUPPORT
     ======================================================= */

  function bindVoice() {

    document
      .querySelectorAll(
        "[data-easy-voice]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            toggleVoice
          );

        }
      );

  }


  function toggleVoice() {

    if (
      !("speechSynthesis" in window)
    ) {

      showMessage(
        getText(
          "Voice output is not supported by this browser.",
          "Is browser mein voice output supported nahi hai."
        )
      );

      return;

    }


    state.voiceEnabled =
      !state.voiceEnabled;

    saveState();


    if (
      state.voiceEnabled
    ) {

      speakCurrentStep();

      showMessage(
        getText(
          "Voice guidance is on.",
          "Voice guidance on hai."
        )
      );

    } else {

      window.speechSynthesis.cancel();

      showMessage(
        getText(
          "Voice guidance is off.",
          "Voice guidance off hai."
        )
      );

    }


    updateVoiceUI();

  }


  function speakCurrentStep() {

    if (
      !state.voiceEnabled ||
      !window.speechSynthesis
    ) {
      return;
    }


    const current =
      STEPS[
        state.step - 1
      ];

    if (!current) {
      return;
    }


    window.speechSynthesis.cancel();


    const text =
      state.language === "hi"
        ? (
            current.titleHi +
            ". " +
            current.descriptionHi
          )
        : (
            current.title +
            ". " +
            current.description
          );


    const utterance =
      new SpeechSynthesisUtterance(
        text
      );


    utterance.lang =
      state.language === "hi"
        ? "hi-IN"
        : "en-IN";

    utterance.rate =
      0.9;

    utterance.pitch =
      1;


    window.speechSynthesis.speak(
      utterance
    );

  }


  function updateVoiceUI() {

    document
      .querySelectorAll(
        "[data-easy-voice]"
      )
      .forEach(
        function (button) {

          button.setAttribute(
            "aria-pressed",
            String(
              state.voiceEnabled
            )
          );

          const label =
            button.querySelector(
              "[data-easy-voice-label]"
            );

          if (label) {

            label.textContent =
              state.voiceEnabled
                ? getText(
                    "Voice On",
                    "Voice On"
                  )
                : getText(
                    "Voice",
                    "Voice"
                  );

          }

        }
      );

  }


  /* =======================================================
     LOCATION
     ======================================================= */

  function requestLocation() {

    if (
      !navigator.geolocation
    ) {

      showMessage(
        getText(
          "Location is not supported on this device.",
          "Is device par location supported nahi hai."
        )
      );

      return;

    }


    navigator.geolocation.getCurrentPosition(
      function (position) {

        const data = {
          latitude:
            position.coords.latitude,

          longitude:
            position.coords.longitude,

          accuracy:
            position.coords.accuracy,

          capturedAt:
            new Date().toISOString()
        };


        try {

          localStorage.setItem(
            "vitalLoopLastLocation",
            JSON.stringify(
              data
            )
          );

        } catch (error) {
          /* Optional local storage. */
        }


        setText(
          "[data-easy-location-status]",
          getText(
            "Location added.",
            "Location add ho gayi."
          )
        );


        showMessage(
          getText(
            "Current location added.",
            "Current location add ho gayi."
          )
        );

      },

      function (error) {

        let message =
          getText(
            "Unable to access location.",
            "Location access nahi ho paya."
          );


        if (
          error &&
          error.code === 1
        ) {

          message =
            getText(
              "Location permission was not granted.",
              "Location permission nahi di gayi."
            );

        } else if (
          error &&
          error.code === 2
        ) {

          message =
            getText(
              "Current location could not be found.",
              "Current location nahi mil saki."
            );

        } else if (
          error &&
          error.code === 3
        ) {

          message =
            getText(
              "Location request timed out.",
              "Location request ka time khatam ho gaya."
            );

        }


        showMessage(
          message
        );

      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );

  }


  /* =======================================================
     ACCESSIBILITY HELPERS
     ======================================================= */

  function increaseTextSize() {

    document.documentElement.classList.add(
      "easy-text-large"
    );

  }


  function decreaseTextSize() {

    document.documentElement.classList.remove(
      "easy-text-large"
    );

  }


  function focusMainContent() {

    const main =
      document.querySelector(
        "main"
      );

    if (!main) {
      return;
    }

    if (!main.hasAttribute("tabindex")) {

      main.setAttribute(
        "tabindex",
        "-1"
      );

    }

    main.focus();

  }


  /* =======================================================
     TEXT
     ======================================================= */

  function getText(
    english,
    hindi
  ) {

    return state.language === "hi"
      ? hindi
      : english;

  }


  function setText(
    selector,
    value
  ) {

    document
      .querySelectorAll(
        selector
      )
      .forEach(
        function (element) {

          element.textContent =
            value;

        }
      );

  }


  /* =======================================================
     TOAST
     ======================================================= */

  function showMessage(
    message
  ) {

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
        "vitalLoopEasyToast"
      );


    if (!toast) {

      toast =
        document.createElement(
          "div"
        );

      toast.id =
        "vitalLoopEasyToast";


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
            "14px 20px",
          borderRadius:
            "16px",
          background:
            "#102027",
          color:
            "#ffffff",
          fontSize:
            "15px",
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
        3000
      );

  }


  /* =======================================================
     PUBLIC API
     ======================================================= */

  window.VitalLoopEasyMode = {

    enable:
      function () {

        state.enabled =
          true;

        saveState();

        applyMode();

        renderStep();

      },

    disable:
      function () {

        state.enabled =
          false;

        saveState();

        applyMode();

      },

    toggle:
      function () {

        state.enabled =
          !state.enabled;

        saveState();

        applyMode();

        renderStep();

        return state.enabled;

      },

    isEnabled:
      function () {

        return state.enabled;

      },

    next:
      function () {

        nextStep();

      },

    back:
      function () {

        previousStep();

      },

    setLanguage:
      function (language) {

        if (
          language !== "en" &&
          language !== "hi"
        ) {

          return;

        }

        state.language =
          language;

        saveState();

        renderStep();

        updateLanguageUI();

      },

    getState:
      function () {

        return {
          ...state
        };

      },

    increaseText:
      increaseTextSize,

    decreaseText:
      decreaseTextSize,

    focusMain:
      focusMainContent

  };


  /* =======================================================
     INITIAL UI STATE
     ======================================================= */

  updateVoiceUI();

})();
