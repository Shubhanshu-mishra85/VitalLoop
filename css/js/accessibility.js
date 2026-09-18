/* =========================================================
   VITAL LOOP — ACCESSIBILITY MANAGER
   File: js/accessibility.js
   ========================================================= */

(function () {
    "use strict";

    const SETTINGS_KEY = "vitalLoopAccessibility";

    const defaults = {
        largeText: false,
        highContrast: false,
        reduceTransparency: false,
        simpleUI: false,
        easyMode: false
    };

    function loadSettings() {
        try {
            const saved = localStorage.getItem(SETTINGS_KEY);

            return {
                ...defaults,
                ...(saved ? JSON.parse(saved) : {})
            };
        } catch (error) {
            return { ...defaults };
        }
    }

    function saveSettings(settings) {
        try {
            localStorage.setItem(
                SETTINGS_KEY,
                JSON.stringify(settings)
            );
        } catch (error) {
            console.warn(
                "Accessibility settings could not be saved."
            );
        }
    }

    function applySettings(settings) {
        const html = document.documentElement;

        html.classList.toggle(
            "vital-loop-large-text",
            settings.largeText
        );

        html.classList.toggle(
            "vital-loop-high-contrast",
            settings.highContrast
        );

        html.classList.toggle(
            "vital-loop-reduce-transparency",
            settings.reduceTransparency
        );

        html.classList.toggle(
            "vital-loop-simple-ui",
            settings.simpleUI
        );

        html.classList.toggle(
            "vital-loop-easy-mode",
            settings.easyMode
        );
    }

    function updateSetting(name, value) {
        const settings = loadSettings();

        if (!(name in defaults)) {
            return;
        }

        settings[name] = Boolean(value);

        saveSettings(settings);
        applySettings(settings);

        announceChange(name, settings[name]);
    }

    function toggleSetting(name) {
        const settings = loadSettings();

        updateSetting(
            name,
            !settings[name]
        );
    }

    function resetSettings() {
        const settings = {
            ...defaults
        };

        saveSettings(settings);
        applySettings(settings);

        announce(
            "Accessibility settings reset."
        );
    }

    function announceChange(name, enabled) {
        const labels = {
            largeText: "Large text",
            highContrast: "High contrast",
            reduceTransparency:
                "Reduced transparency",
            simpleUI: "Simplified interface",
            easyMode: "Easy Mode"
        };

        const label =
            labels[name] || "Accessibility setting";

        announce(
            `${label} ${enabled ? "enabled" : "disabled"}.`
        );
    }

    function announce(message) {
        let region =
            document.querySelector(
                ".vital-loop-live-region"
            );

        if (!region) {
            region =
                document.createElement("div");

            region.className =
                "vital-loop-live-region";

            region.setAttribute(
                "aria-live",
                "polite"
            );

            region.setAttribute(
                "aria-atomic",
                "true"
            );

            document.body.appendChild(region);
        }

        region.textContent = "";

        window.setTimeout(() => {
            region.textContent = message;
        }, 50);
    }

    function setupControls() {
        const controls =
            document.querySelectorAll(
                "[data-accessibility]"
            );

        controls.forEach((control) => {
            const setting =
                control.dataset.accessibility;

            if (!(setting in defaults)) {
                return;
            }

            const settings = loadSettings();

            control.setAttribute(
                "aria-pressed",
                String(settings[setting])
            );

            control.addEventListener(
                "click",
                () => {
                    toggleSetting(setting);

                    const updated =
                        loadSettings();

                    control.setAttribute(
                        "aria-pressed",
                        String(updated[setting])
                    );
                }
            );
        });
    }

    function setupKeyboardDetection() {
        document.addEventListener(
            "keydown",
            (event) => {
                if (
                    event.key === "Tab"
                ) {
                    document.documentElement.classList.add(
                        "vital-loop-keyboard-user"
                    );
                }
            }
        );

        document.addEventListener(
            "pointerdown",
            () => {
                document.documentElement.classList.remove(
                    "vital-loop-keyboard-user"
                );
            }
        );
    }

    function setupReducedMotionDetection() {
        if (!window.matchMedia) {
            return;
        }

        const mediaQuery =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            );

        if (mediaQuery.matches) {
            document.documentElement.classList.add(
                "vital-loop-system-reduced-motion"
            );
        }

        const listener = (event) => {
            document.documentElement.classList.toggle(
                "vital-loop-system-reduced-motion",
                event.matches
            );
        };

        if (
            typeof mediaQuery.addEventListener ===
            "function"
        ) {
            mediaQuery.addEventListener(
                "change",
                listener
            );
        }
    }

    function init() {
        const settings =
            loadSettings();

        applySettings(settings);
        setupControls();
        setupKeyboardDetection();
        setupReducedMotionDetection();
    }

    window.VitalLoopAccessibility = {
        init,
        loadSettings,
        saveSettings,
        applySettings,
        updateSetting,
        toggleSetting,
        resetSettings,
        announce
    };

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
