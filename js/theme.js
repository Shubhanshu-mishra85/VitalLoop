(function () {
  "use strict";

  const STORAGE_KEY = "vitalLoopTheme";

  function getPreferredTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === "dark" || saved === "light") {
      return saved;
    }

    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);

    localStorage.setItem(STORAGE_KEY, theme);

    document.querySelectorAll(
      "[data-theme-toggle], #themeToggle, .theme-toggle"
    ).forEach(function (button) {
      const isDark = theme === "dark";

      button.setAttribute(
        "aria-label",
        isDark ? "Switch to day mode" : "Switch to night mode"
      );

      button.setAttribute("title",
        isDark ? "Day Mode" : "Night Mode"
      );

      button.setAttribute("aria-pressed", String(isDark));

      const icon = button.querySelector(
        ".theme-icon, .theme-toggle-icon, i, span"
      );

      if (icon && !icon.classList.contains("theme-toggle-text")) {
        icon.textContent = isDark ? "☀" : "☾";
      }
    });
  }

  function toggleTheme() {
    const current =
      document.documentElement.getAttribute("data-theme") ||
      getPreferredTheme();

    applyTheme(current === "dark" ? "light" : "dark");
  }

  function initTheme() {
    applyTheme(getPreferredTheme());

    document.addEventListener("click", function (event) {
      const button = event.target.closest(
        "[data-theme-toggle], #themeToggle, .theme-toggle"
      );

      if (!button) return;

      event.preventDefault();
      toggleTheme();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTheme);
  } else {
    initTheme();
  }

  window.VitalLoopTheme = {
    apply: applyTheme,
    toggle: toggleTheme,
    current: getPreferredTheme
  };
})();
