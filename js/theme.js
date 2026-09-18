/* =========================================================
   VITAL LOOP — THEME MANAGER
   File: js/theme.js
   ========================================================= */

(function () {
    "use strict";

    const STORAGE_KEY = "vitalLoopTheme";

    function getSavedTheme() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (error) {
            return null;
        }
    }

    function getSystemTheme() {
        if (
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
        ) {
            return "dark";
        }

        return "light";
    }

    function applyTheme(theme, save = true) {
        if (theme !== "dark" && theme !== "light") {
            theme = "light";
        }

        document.documentElement.setAttribute(
            "data-theme",
            theme
        );

        document.documentElement.classList.toggle(
            "dark-mode",
            theme === "dark"
        );

        document.documentElement.classList.toggle(
            "light-mode",
            theme === "light"
        );

        document.body.classList.toggle(
            "dark-mode",
            theme === "dark"
        );

        document.body.classList.toggle(
            "light-mode",
            theme === "light"
        );

        updateToggleState(theme);

        if (save) {
            try {
                localStorage.setItem(
                    STORAGE_KEY,
                    theme
                );
            } catch (error) {
                // Storage may be unavailable.
            }
        }

        window.dispatchEvent(
            new CustomEvent("vitalLoopThemeChange", {
                detail: { theme: theme }
            })
        );
    }

    function updateToggleState(theme) {
        const toggles = document.querySelectorAll(
            "[data-theme-toggle]"
        );

        toggles.forEach(function (toggle) {
            const isDark = theme === "dark";

            toggle.setAttribute(
                "aria-pressed",
                String(isDark)
            );

            toggle.setAttribute(
                "aria-label",
                isDark
                    ? "Switch to day mode"
                    : "Switch to night mode"
            );

            const icon =
                toggle.querySelector(
                    "[data-theme-icon]"
                );

            if (icon) {
                icon.textContent =
                    isDark ? "☀️" : "🌙";
            }

            const label =
                toggle.querySelector(
                    "[data-theme-label]"
                );

            if (label) {
                label.textContent =
                    isDark
                        ? "Day Mode"
                        : "Night Mode";
            }
        });
    }

    function toggleTheme() {
        const current =
            document.documentElement.getAttribute(
                "data-theme"
            ) || "light";

        applyTheme(
            current === "dark"
                ? "light"
                : "dark"
        );
    }

    function setupToggle() {
        document
            .querySelectorAll("[data-theme-toggle]")
            .forEach(function (toggle) {
                if (
                    toggle.dataset.themeReady === "true"
                ) {
                    return;
                }

                toggle.dataset.themeReady = "true";

                toggle.addEventListener(
                    "click",
                    toggleTheme
                );

                toggle.addEventListener(
                    "keydown",
                    function (event) {
                        if (
                            event.key === "Enter" ||
                            event.key === " "
                        ) {
                            event.preventDefault();
                            toggleTheme();
                        }
                    }
                );
            });
    }

    function setupSystemTheme() {
        if (!window.matchMedia) {
            return;
        }

        const mediaQuery =
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            );

        mediaQuery.addEventListener(
            "change",
            function (event) {
                if (getSavedTheme()) {
                    return;
                }

                applyTheme(
                    event.matches
                        ? "dark"
                        : "light",
                    false
                );
            }
        );
    }

    function init() {
        const saved =
            getSavedTheme();

        const theme =
            saved ||
            getSystemTheme();

        applyTheme(
            theme,
            Boolean(saved)
        );

        setupToggle();
        setupSystemTheme();
    }

    window.VitalLoopTheme = {
        init: init,
        toggle: toggleTheme,
        set: applyTheme,
        get: function () {
            return (
                document.documentElement.getAttribute(
                    "data-theme"
                ) || "light"
            );
        }
    };

    /*
     * Apply the theme as early as possible.
     * This helps reduce the light/dark flash
     * while the page is loading.
     */
    try {
        const saved =
            localStorage.getItem(STORAGE_KEY);

        const initial =
            saved ||
            (
                window.matchMedia &&
                window.matchMedia(
                    "(prefers-color-scheme: dark)"
                ).matches
                    ? "dark"
                    : "light"
            );

        document.documentElement.setAttribute(
            "data-theme",
            initial
        );
    } catch (error) {
        document.documentElement.setAttribute(
            "data-theme",
            "light"
        );
    }

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            init
        );
    } else {
        init();
    }

})();
