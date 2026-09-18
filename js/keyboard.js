/* =========================================================
   VITAL LOOP — KEYBOARD ACCESSIBILITY
   File: js/keyboard.js
   ========================================================= */

(function () {
    "use strict";

    function isTypingTarget(element) {
        if (!element) return false;

        const tag = element.tagName
            ? element.tagName.toLowerCase()
            : "";

        return (
            tag === "input" ||
            tag === "textarea" ||
            tag === "select" ||
            element.isContentEditable
        );
    }

    /* -------------------------------------------------------
       Escape Key
       ------------------------------------------------------- */

    function setupEscapeHandler() {
        document.addEventListener("keydown", function (event) {
            if (event.key !== "Escape") return;

            // Close open modals
            const openModals =
                document.querySelectorAll(
                    ".modal.is-open, .modal.active, [aria-modal='true'].is-open"
                );

            openModals.forEach(function (modal) {
                modal.classList.remove(
                    "is-open",
                    "active"
                );

                modal.setAttribute(
                    "aria-hidden",
                    "true"
                );
            });

            // Close mobile navigation
            const nav =
                document.querySelector(
                    ".mobile-menu.active, .mobile-nav.active"
                );

            if (nav) {
                nav.classList.remove("active");
                nav.setAttribute(
                    "aria-hidden",
                    "true"
                );
            }
        });
    }

    /* -------------------------------------------------------
       Focus Visible
       ------------------------------------------------------- */

    function setupFocusDetection() {
        document.addEventListener(
            "keydown",
            function (event) {
                if (event.key === "Tab") {
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
    }

    /* -------------------------------------------------------
       Enter / Space for Accessible Buttons
       ------------------------------------------------------- */

    function setupAccessibleClickTargets() {
        const targets =
            document.querySelectorAll(
                "[role='button'][tabindex='0']"
            );

        targets.forEach(function (target) {
            target.addEventListener(
                "keydown",
                function (event) {
                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {
                        if (
                            isTypingTarget(
                                event.target
                            )
                        ) {
                            return;
                        }

                        event.preventDefault();
                        target.click();
                    }
                }
            );
        });
    }

    /* -------------------------------------------------------
       Skip Link
       ------------------------------------------------------- */

    function createSkipLink() {
        if (
            document.querySelector(
                ".vital-loop-skip-link"
            )
        ) {
            return;
        }

        const main =
            document.querySelector("main");

        if (!main) {
            return;
        }

        if (!main.id) {
            main.id = "main-content";
        }

        const skip =
            document.createElement("a");

        skip.className =
            "vital-loop-skip-link";

        skip.href =
            "#" + main.id;

        skip.textContent =
            "Skip to main content";

        document.body.insertBefore(
            skip,
            document.body.firstChild
        );
    }

    /* -------------------------------------------------------
       Keyboard Shortcut: /
       Focus Search
       ------------------------------------------------------- */

    function setupSearchShortcut() {
        document.addEventListener(
            "keydown",
            function (event) {
                if (
                    event.key !== "/" ||
                    isTypingTarget(
                        document.activeElement
                    ) ||
                    event.ctrlKey ||
                    event.metaKey ||
                    event.altKey
                ) {
                    return;
                }

                const search =
                    document.querySelector(
                        'input[type="search"], #searchInput, .search-input'
                    );

                if (search) {
                    event.preventDefault();
                    search.focus();
                }
            }
        );
    }

    /* -------------------------------------------------------
       Initialise
       ------------------------------------------------------- */

    function init() {
        setupEscapeHandler();
        setupFocusDetection();
        setupAccessibleClickTargets();
        createSkipLink();
        setupSearchShortcut();
    }

    window.VitalLoopKeyboard = {
        init
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
