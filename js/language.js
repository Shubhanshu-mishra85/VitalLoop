/* =========================================================
   VITAL LOOP — LANGUAGE MANAGER
   File: js/language.js
   ========================================================= */

(function () {
    "use strict";

    const STORAGE_KEY = "vitalLoopLanguage";

    const supportedLanguages = {
        en: {
            name: "English",
            shortName: "EN"
        },
        hi: {
            name: "हिंदी",
            shortName: "HI"
        },
        hinglish: {
            name: "Hinglish",
            shortName: "HG"
        }
    };

    function getSavedLanguage() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (error) {
            return null;
        }
    }

    function isSupported(language) {
        return Object.prototype.hasOwnProperty.call(
            supportedLanguages,
            language
        );
    }

    function detectBrowserLanguage() {
        const browserLanguage =
            navigator.language ||
            navigator.userLanguage ||
            "en";

        if (browserLanguage.toLowerCase().startsWith("hi")) {
            return "hi";
        }

        return "en";
    }

    function applyLanguage(language, save = true) {
        if (!isSupported(language)) {
            language = "en";
        }

        document.documentElement.setAttribute(
            "lang",
            language === "hinglish"
                ? "en"
                : language
        );

        document.documentElement.setAttribute(
            "data-language",
            language
        );

        updateLanguageControls(language);

        if (save) {
            try {
                localStorage.setItem(
                    STORAGE_KEY,
                    language
                );
            } catch (error) {
                // Storage may be unavailable.
            }
        }

        window.dispatchEvent(
            new CustomEvent(
                "vitalLoopLanguageChange",
                {
                    detail: {
                        language: language
                    }
                }
            )
        );
    }

    function updateLanguageControls(language) {
        document
            .querySelectorAll(
                "[data-language-option]"
            )
            .forEach(function (option) {
                const selected =
                    option.getAttribute(
                        "data-language-option"
                    ) === language;

                option.classList.toggle(
                    "active",
                    selected
                );

                option.setAttribute(
                    "aria-selected",
                    String(selected)
                );
            });

        document
            .querySelectorAll(
                "[data-language-current]"
            )
            .forEach(function (element) {
                element.textContent =
                    supportedLanguages[language]
                        ? supportedLanguages[language]
                              .shortName
                        : "EN";
            });

        document
            .querySelectorAll(
                "[data-language-name]"
            )
            .forEach(function (element) {
                element.textContent =
                    supportedLanguages[language]
                        ? supportedLanguages[language]
                              .name
                        : "English";
            });
    }

    function setupLanguageControls() {
        document
            .querySelectorAll(
                "[data-language-option]"
            )
            .forEach(function (option) {
                if (
                    option.dataset.languageReady ===
                    "true"
                ) {
                    return;
                }

                option.dataset.languageReady =
                    "true";

                option.addEventListener(
                    "click",
                    function () {
                        const language =
                            option.getAttribute(
                                "data-language-option"
                            );

                        applyLanguage(language);
                    }
                );

                option.addEventListener(
                    "keydown",
                    function (event) {
                        if (
                            event.key === "Enter" ||
                            event.key === " "
                        ) {
                            event.preventDefault();

                            const language =
                                option.getAttribute(
                                    "data-language-option"
                                );

                            applyLanguage(language);
                        }
                    }
                );
            });
    }

    function init() {
        const saved =
            getSavedLanguage();

        const language =
            saved && isSupported(saved)
                ? saved
                : detectBrowserLanguage();

        applyLanguage(
            language,
            Boolean(saved)
        );

        setupLanguageControls();
    }

    window.VitalLoopLanguage = {
        init: init,
        set: applyLanguage,

        get: function () {
            return (
                document.documentElement.getAttribute(
                    "data-language"
                ) || "en"
            );
        },

        supported: supportedLanguages
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
