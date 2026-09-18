/* =========================================================
   VITAL LOOP — CORE APPLICATION
   js/app.js
   ========================================================= */

(function () {
  "use strict";

  /* =======================================================
     CONFIGURATION
     ======================================================= */

  const STORAGE = {
    theme: "vitalLoopTheme",
    language: "vitalLoopLanguage",
    notifications: "vitalLoopNotifications",
    request: "vitalLoopRequest",
    donor: "vitalLoopDonor",
    prescription: "vitalLoopPrescription",
    easyMode: "vitalLoopEasyMode"
  };

  const SELECTORS = {
    themeToggle: "#themeToggle",
    menuToggle: "#menuToggle",
    mobileMenu: "#mobileMenu",
    notificationButton: "#notificationButton",
    notificationPanel: "#notificationPanel"
  };


  /* =======================================================
     DOM READY
     ======================================================= */

  document.addEventListener("DOMContentLoaded", function () {

    initializeTheme();
    initializeMobileMenu();
    initializeNotifications();
    initializeSmoothNavigation();
    initializeExternalNavigation();
    initializeKeyboardAccessibility();
    initializeStorageCleanup();
    initializeCurrentYear();
    initializeCommonButtons();

  });


  /* =======================================================
     THEME
     ======================================================= */

  function initializeTheme() {

    const savedTheme = localStorage.getItem(STORAGE.theme);

    if (savedTheme === "dark") {
      document.body.classList.add("dark-mode");
    } else if (savedTheme === "light") {
      document.body.classList.remove("dark-mode");
    } else {

      const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;

      if (prefersDark) {
        document.body.classList.add("dark-mode");
      }

    }

    updateThemeButtons();

    const themeButton =
      document.querySelector(SELECTORS.themeToggle);

    if (themeButton) {

      themeButton.addEventListener("click", function () {

        const isDark =
          document.body.classList.toggle("dark-mode");

        localStorage.setItem(
          STORAGE.theme,
          isDark ? "dark" : "light"
        );

        updateThemeButtons();

        document.dispatchEvent(
          new CustomEvent("vitalLoopThemeChanged", {
            detail: {
              theme: isDark ? "dark" : "light"
            }
          })
        );

      });

    }

  }


  function updateThemeButtons() {

    const buttons =
      document.querySelectorAll(
        '[data-theme-toggle], #themeToggle'
      );

    const isDark =
      document.body.classList.contains("dark-mode");

    buttons.forEach(function (button) {

      button.setAttribute(
        "aria-pressed",
        String(isDark)
      );

      button.setAttribute(
        "aria-label",
        isDark
          ? "Switch to day mode"
          : "Switch to night mode"
      );

      button.title =
        isDark
          ? "Day mode"
          : "Night mode";

      const icon =
        button.querySelector("[data-theme-icon]");

      if (icon) {
        icon.textContent = isDark ? "☀" : "◐";
      }

    });

  }


  /* =======================================================
     MOBILE MENU
     ======================================================= */

  function initializeMobileMenu() {

    const menuToggle =
      document.querySelector(SELECTORS.menuToggle);

    const mobileMenu =
      document.querySelector(SELECTORS.mobileMenu);

    if (!menuToggle || !mobileMenu) {
      return;
    }

    menuToggle.addEventListener("click", function () {

      const isOpen =
        mobileMenu.classList.toggle("open");

      menuToggle.classList.toggle(
        "active",
        isOpen
      );

      menuToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

      document.body.classList.toggle(
        "menu-open",
        isOpen
      );

    });

    const menuLinks =
      mobileMenu.querySelectorAll("a");

    menuLinks.forEach(function (link) {

      link.addEventListener("click", function () {

        mobileMenu.classList.remove("open");
        menuToggle.classList.remove("active");
        menuToggle.setAttribute(
          "aria-expanded",
          "false"
        );

        document.body.classList.remove(
          "menu-open"
        );

      });

    });

    document.addEventListener("click", function (event) {

      if (!mobileMenu.classList.contains("open")) {
        return;
      }

      const clickedInside =
        mobileMenu.contains(event.target) ||
        menuToggle.contains(event.target);

      if (!clickedInside) {

        mobileMenu.classList.remove("open");
        menuToggle.classList.remove("active");
        menuToggle.setAttribute(
          "aria-expanded",
          "false"
        );

        document.body.classList.remove(
          "menu-open"
        );

      }

    });

  }


  /* =======================================================
     NOTIFICATIONS
     ======================================================= */

  function initializeNotifications() {

    const button =
      document.querySelector(
        SELECTORS.notificationButton
      );

    const panel =
      document.querySelector(
        SELECTORS.notificationPanel
      );

    if (!button || !panel) {
      return;
    }

    loadNotifications(panel);

    button.addEventListener("click", function (event) {

      event.stopPropagation();

      panel.classList.toggle("open");

      button.setAttribute(
        "aria-expanded",
        String(panel.classList.contains("open"))
      );

    });

    document.addEventListener("click", function (event) {

      if (
        panel.classList.contains("open") &&
        !panel.contains(event.target) &&
        !button.contains(event.target)
      ) {

        panel.classList.remove("open");

        button.setAttribute(
          "aria-expanded",
          "false"
        );

      }

    });

  }


  function loadNotifications(panel) {

    let notifications = [];

    try {

      const stored =
        localStorage.getItem(
          STORAGE.notifications
        );

      if (stored) {
        notifications = JSON.parse(stored);
      }

    } catch (error) {

      notifications = [];

    }

    if (!Array.isArray(notifications)) {
      notifications = [];
    }

    if (notifications.length === 0) {

      notifications = [
        {
          id: "welcome",
          title: "Welcome to Vital Loop",
          message:
            "Healthcare coordination support is ready.",
          time: "Now",
          read: false
        },
        {
          id: "safety",
          title: "Safety reminder",
          message:
            "Always verify medical information with authorised professionals.",
          time: "Today",
          read: false
        }
      ];

      saveNotifications(notifications);

    }

    renderNotifications(
      panel,
      notifications
    );

  }


  function renderNotifications(panel, notifications) {

    const list =
      panel.querySelector(
        "[data-notification-list]"
      );

    if (!list) {
      return;
    }

    list.innerHTML = "";

    notifications.forEach(function (notification) {

      const item =
        document.createElement("div");

      item.className =
        "notification-item" +
        (notification.read ? " read" : "");

      item.innerHTML = `
        <div class="notification-icon">
          ●
        </div>

        <div class="notification-content">
          <strong></strong>
          <span></span>
          <small></small>
        </div>
      `;

      item.querySelector("strong").textContent =
        notification.title || "Notification";

      item.querySelector("span").textContent =
        notification.message || "";

      item.querySelector("small").textContent =
        notification.time || "";

      list.appendChild(item);

    });

  }


  function saveNotifications(notifications) {

    try {

      localStorage.setItem(
        STORAGE.notifications,
        JSON.stringify(notifications)
      );

    } catch (error) {

      console.warn(
        "Vital Loop: notification storage unavailable."
      );

    }

  }


  window.VitalLoopNotifications = {

    add: function (notification) {

      let notifications = [];

      try {

        notifications =
          JSON.parse(
            localStorage.getItem(
              STORAGE.notifications
            ) || "[]"
          );

      } catch (error) {

        notifications = [];

      }

      notifications.unshift({
        id:
          notification.id ||
          "notification-" +
          Date.now(),

        title:
          notification.title ||
          "Vital Loop",

        message:
          notification.message ||
          "",

        time:
          notification.time ||
          "Just now",

        read: false
      });

      notifications =
        notifications.slice(0, 20);

      saveNotifications(notifications);

      const panel =
        document.querySelector(
          SELECTORS.notificationPanel
        );

      if (panel) {
        renderNotifications(
          panel,
          notifications
        );
      }

    },

    clear: function () {

      saveNotifications([]);

      const panel =
        document.querySelector(
          SELECTORS.notificationPanel
        );

      if (panel) {

        renderNotifications(
          panel,
          []
        );

      }

    }

  };


  /* =======================================================
     SMOOTH NAVIGATION
     ======================================================= */

  function initializeSmoothNavigation() {

    document.addEventListener(
      "click",
      function (event) {

        const link =
          event.target.closest(
            'a[href^="#"]'
          );

        if (!link) {
          return;
        }

        const targetId =
          link.getAttribute("href");

        if (
          !targetId ||
          targetId === "#"
        ) {
          return;
        }

        const target =
          document.querySelector(targetId);

        if (!target) {
          return;
        }

        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

        history.replaceState(
          null,
          "",
          targetId
        );

      }
    );

  }


  /* =======================================================
     EXTERNAL / MAP NAVIGATION
     ======================================================= */

  function initializeExternalNavigation() {

    document.addEventListener(
      "click",
      function (event) {

        const button =
          event.target.closest(
            "[data-map-search]"
          );

        if (!button) {
          return;
        }

        const query =
          button.dataset.mapSearch;

        if (!query) {
          return;
        }

        const url =
          "https://www.google.com/maps/search/?api=1&query=" +
          encodeURIComponent(query);

        window.open(
          url,
          "_blank",
          "noopener,noreferrer"
        );

      }
    );

  }


  /* =======================================================
     KEYBOARD ACCESSIBILITY
     ======================================================= */

  function initializeKeyboardAccessibility() {

    document.addEventListener(
      "keydown",
      function (event) {

        if (event.key === "Escape") {

          closeOpenInterfaces();

        }

      }
    );

  }


  function closeOpenInterfaces() {

    const mobileMenu =
      document.querySelector(
        SELECTORS.mobileMenu
      );

    const menuToggle =
      document.querySelector(
        SELECTORS.menuToggle
      );

    const notificationPanel =
      document.querySelector(
        SELECTORS.notificationPanel
      );

    if (mobileMenu) {
      mobileMenu.classList.remove("open");
    }

    if (menuToggle) {
      menuToggle.classList.remove("active");
      menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );
    }

    if (notificationPanel) {
      notificationPanel.classList.remove("open");
    }

    document.body.classList.remove(
      "menu-open"
    );

  }


  /* =======================================================
     STORAGE UTILITIES
     ======================================================= */

  window.VitalLoopStorage = {

    set: function (key, value) {

      try {

        localStorage.setItem(
          key,
          typeof value === "string"
            ? value
            : JSON.stringify(value)
        );

        return true;

      } catch (error) {

        console.warn(
          "Vital Loop: unable to save data.",
          error
        );

        return false;

      }

    },

    get: function (key, fallback = null) {

      try {

        const value =
          localStorage.getItem(key);

        if (value === null) {
          return fallback;
        }

        try {
          return JSON.parse(value);
        } catch (error) {
          return value;
        }

      } catch (error) {

        return fallback;

      }

    },

    remove: function (key) {

      try {

        localStorage.removeItem(key);

        return true;

      } catch (error) {

        return false;

      }

    }

  };


  /* =======================================================
     COMMON BUTTONS
     ======================================================= */

  function initializeCommonButtons() {

    const backButtons =
      document.querySelectorAll(
        "[data-go-back]"
      );

    backButtons.forEach(function (button) {

      button.addEventListener(
        "click",
        function () {

          if (
            window.history.length > 1
          ) {

            window.history.back();

          } else {

            window.location.href =
              "index.html";

          }

        }
      );

    });


    const shareButtons =
      document.querySelectorAll(
        "[data-share]"
      );

    shareButtons.forEach(function (button) {

      button.addEventListener(
        "click",
        async function () {

          const shareData = {
            title:
              button.dataset.shareTitle ||
              document.title,

            text:
              button.dataset.shareText ||
              "Vital Loop — Connecting People. Supporting Care.",

            url:
              button.dataset.shareUrl ||
              window.location.href
          };

          try {

            if (
              navigator.share &&
              window.isSecureContext
            ) {

              await navigator.share(
                shareData
              );

            } else {

              await navigator.clipboard.writeText(
                shareData.url
              );

              showToast(
                "Link copied successfully."
              );

            }

          } catch (error) {

            if (
              error &&
              error.name === "AbortError"
            ) {
              return;
            }

            showToast(
              "Sharing is not available."
            );

          }

        }
      );

    });

  }


  /* =======================================================
     TOAST
     ======================================================= */

  function showToast(message) {

    let toast =
      document.getElementById(
        "vitalLoopToast"
      );

    if (!toast) {

      toast =
        document.createElement("div");

      toast.id =
        "vitalLoopToast";

      toast.setAttribute(
        "role",
        "status"
      );

      toast.style.position = "fixed";
      toast.style.left = "50%";
      toast.style.bottom = "25px";
      toast.style.transform =
        "translateX(-50%) translateY(15px)";
      toast.style.zIndex = "99999";
      toast.style.padding =
        "11px 16px";
      toast.style.borderRadius =
        "999px";
      toast.style.background =
        "#102027";
      toast.style.color =
        "#ffffff";
      toast.style.fontSize =
        "13px";
      toast.style.fontWeight =
        "700";
      toast.style.boxShadow =
        "0 15px 40px rgba(0,0,0,.2)";
      toast.style.opacity = "0";
      toast.style.pointerEvents =
        "none";
      toast.style.transition =
        "opacity .25s ease, transform .25s ease";

      document.body.appendChild(toast);

    }

    toast.textContent = message;

    requestAnimationFrame(function () {

      toast.style.opacity = "1";
      toast.style.transform =
        "translateX(-50%) translateY(0)";

    });

    clearTimeout(
      toast._timeout
    );

    toast._timeout =
      setTimeout(function () {

        toast.style.opacity = "0";
        toast.style.transform =
          "translateX(-50%) translateY(15px)";

      }, 2600);

  }

  window.VitalLoopToast = showToast;


  /* =======================================================
     CURRENT YEAR
     ======================================================= */

  function initializeCurrentYear() {

    const year =
      new Date().getFullYear();

    document
      .querySelectorAll(
        "[data-current-year]"
      )
      .forEach(function (element) {

        element.textContent = year;

      });

  }


  /* =======================================================
     EASY MODE
     ======================================================= */

  window.VitalLoopEasyMode = {

    enable: function () {

      document.body.classList.add(
        "easy-mode-active"
      );

      localStorage.setItem(
        STORAGE.easyMode,
        "true"
      );

      document.dispatchEvent(
        new CustomEvent(
          "vitalLoopEasyModeChanged",
          {
            detail: {
              enabled: true
            }
          }
        )
      );

    },

    disable: function () {

      document.body.classList.remove(
        "easy-mode-active"
      );

      localStorage.setItem(
        STORAGE.easyMode,
        "false"
      );

      document.dispatchEvent(
        new CustomEvent(
          "vitalLoopEasyModeChanged",
          {
            detail: {
              enabled: false
            }
          }
        )
      );

    },

    isEnabled: function () {

      return (
        localStorage.getItem(
          STORAGE.easyMode
        ) === "true"
      );

    },

    toggle: function () {

      if (this.isEnabled()) {
        this.disable();
      } else {
        this.enable();
      }

    }

  };


  /* =======================================================
     REQUEST HELPERS
     ======================================================= */

  window.VitalLoopRequest = {

    save: function (request) {

      if (!request || typeof request !== "object") {
        return false;
      }

      const requestData = {
        ...request,

        id:
          request.id ||
          "VL-" +
          Date.now(),

        createdAt:
          request.createdAt ||
          new Date().toISOString(),

        updatedAt:
          new Date().toISOString()
      };

      return window.VitalLoopStorage.set(
        STORAGE.request,
        requestData
      );

    },

    get: function () {

      return window.VitalLoopStorage.get(
        STORAGE.request,
        null
      );

    },

    clear: function () {

      return window.VitalLoopStorage.remove(
        STORAGE.request
      );

    }

  };


  /* =======================================================
     PRESCRIPTION HELPERS
     ======================================================= */

  window.VitalLoopPrescription = {

    save: function (data) {

      if (!data || typeof data !== "object") {
        return false;
      }

      return window.VitalLoopStorage.set(
        STORAGE.prescription,
        data
      );

    },

    get: function () {

      return window.VitalLoopStorage.get(
        STORAGE.prescription,
        null
      );

    },

    clear: function () {

      return window.VitalLoopStorage.remove(
        STORAGE.prescription
      );

    }

  };


  /* =======================================================
     DONOR HELPERS
     ======================================================= */

  window.VitalLoopDonor = {

    save: function (data) {

      if (!data || typeof data !== "object") {
        return false;
      }

      return window.VitalLoopStorage.set(
        STORAGE.donor,
        data
      );

    },

    get: function () {

      return window.VitalLoopStorage.get(
        STORAGE.donor,
        null
      );

    },

    clear: function () {

      return window.VitalLoopStorage.remove(
        STORAGE.donor
      );

    }

  };


  /* =======================================================
     LOCATION HELPERS
     ======================================================= */

  window.VitalLoopLocation = {

    getCurrent: function (
      successCallback,
      errorCallback
    ) {

      if (
        !navigator.geolocation
      ) {

        if (typeof errorCallback === "function") {
          errorCallback(
            new Error(
              "Geolocation is not supported."
            )
          );
        }

        return;

      }

      navigator.geolocation.getCurrentPosition(
        function (position) {

          const location = {
            latitude:
              position.coords.latitude,

            longitude:
              position.coords.longitude,

            accuracy:
              position.coords.accuracy,

            timestamp:
              new Date().toISOString()
          };

          if (
            typeof successCallback === "function"
          ) {

            successCallback(
              location
            );

          }

        },

        function (error) {

          if (
            typeof errorCallback === "function"
          ) {

            errorCallback(error);

          }

        },

        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );

    },

    createMapsUrl: function (
      query
    ) {

      return (
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(query)
      );

    }

  };


  /* =======================================================
     STORAGE MAINTENANCE
     ======================================================= */

  function initializeStorageCleanup() {

    /*
      Remove only obsolete application keys if they are
      explicitly known. No medical data is automatically
      deleted here.
    */

    const obsoleteKeys = [
      "vitalLoopTemporaryToast"
    ];

    obsoleteKeys.forEach(function (key) {

      try {
        localStorage.removeItem(key);
      } catch (error) {
        /* Ignore storage errors. */
      }

    });

  }


  /* =======================================================
     PAGE UTILITIES
     ======================================================= */

  window.VitalLoop = {

    version: "1.0.0",

    storageKeys: STORAGE,

    isDarkMode: function () {

      return document.body.classList.contains(
        "dark-mode"
      );

    },

    page: function () {

      return (
        document.body.dataset.page ||
        window.location.pathname
          .split("/")
          .pop()
          .replace(".html", "") ||
        "home"
      );

    },

    scrollToTop: function () {

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    }

  };


  /* =======================================================
     GLOBAL ERROR SAFETY
     ======================================================= */

  window.addEventListener(
    "error",
    function (event) {

      /*
        Prevent one optional UI component from breaking
        the entire Vital Loop interface.
      */

      console.warn(
        "Vital Loop UI error:",
        event.message
      );

    }
  );


  /* =======================================================
     ONLINE / OFFLINE STATUS
     ======================================================= */

  function updateConnectionStatus() {

    const indicators =
      document.querySelectorAll(
        "[data-connection-status]"
      );

    const online =
      navigator.onLine;

    indicators.forEach(function (element) {

      element.textContent =
        online
          ? "Online"
          : "Offline";

      element.classList.toggle(
        "online",
        online
      );

      element.classList.toggle(
        "offline",
        !online
      );

    });

  }

  window.addEventListener(
    "online",
    updateConnectionStatus
  );

  window.addEventListener(
    "offline",
    updateConnectionStatus
  );

  document.addEventListener(
    "DOMContentLoaded",
    updateConnectionStatus
  );


  /* =======================================================
     PAGE VISIBILITY
     ======================================================= */

  document.addEventListener(
    "visibilitychange",
    function () {

      if (
        document.visibilityState === "visible"
      ) {

        updateConnectionStatus();

      }

    }
  );

})();
