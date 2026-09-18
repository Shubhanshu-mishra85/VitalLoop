/* =========================================================
   VITAL LOOP — FOOTER MANAGER
   File: js/footer.js
   ========================================================= */

(function () {
    "use strict";

    /* -------------------------------------------------------
       Current Year
    ------------------------------------------------------- */

    function setCurrentYear() {
        const year = new Date().getFullYear();

        const elements = document.querySelectorAll(
            "[data-current-year]"
        );

        elements.forEach((element) => {
            element.textContent = year;
        });
    }

    /* -------------------------------------------------------
       Smooth Internal Navigation
    ------------------------------------------------------- */

    function setupSmoothNavigation() {
        const links = document.querySelectorAll(
            'a[href^="#"]'
        );

        links.forEach((link) => {
            link.addEventListener("click", (event) => {
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

                if (
                    window.history &&
                    window.history.replaceState
                ) {
                    window.history.replaceState(
                        null,
                        "",
                        targetId
                    );
                }
            });
        });
    }

    /* -------------------------------------------------------
       Back To Top
    ------------------------------------------------------- */

    function setupBackToTop() {
        const buttons = document.querySelectorAll(
            "[data-back-to-top]"
        );

        if (!buttons.length) {
            return;
        }

        function updateVisibility() {
            const visible =
                window.scrollY > 450;

            buttons.forEach((button) => {
                button.hidden = !visible;
                button.setAttribute(
                    "aria-hidden",
                    String(!visible)
                );
            });
        }

        buttons.forEach((button) => {
            button.addEventListener(
                "click",
                () => {
                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });
                }
            );
        });

        window.addEventListener(
            "scroll",
            updateVisibility,
            { passive: true }
        );

        updateVisibility();
    }

    /* -------------------------------------------------------
       Footer External Links
    ------------------------------------------------------- */

    function setupExternalLinks() {
        const links = document.querySelectorAll(
            '.vital-loop-footer a[href^="http"]'
        );

        links.forEach((link) => {
            const href =
                link.getAttribute("href");

            if (!href) {
                return;
            }

            try {
                const url =
                    new URL(
                        href,
                        window.location.href
                    );

                if (
                    url.origin !==
                    window.location.origin
                ) {
                    link.setAttribute(
                        "target",
                        "_blank"
                    );

                    link.setAttribute(
                        "rel",
                        "noopener noreferrer"
                    );
                }
            } catch (error) {
                /* Ignore invalid URLs. */
            }
        });
    }

    /* -------------------------------------------------------
       Footer Logo Fallback
    ------------------------------------------------------- */

    function setupLogoFallback() {
        const logos = document.querySelectorAll(
            ".vital-loop-footer-logo img"
        );

        logos.forEach((logo) => {
            logo.addEventListener(
                "error",
                () => {
                    logo.style.display = "none";

                    const fallback =
                        document.createElement("span");

                    fallback.textContent =
                        "Vital Loop";

                    fallback.style.cssText = `
                        color: #ffffff;
                        font-size: 18px;
                        font-weight: 800;
                        letter-spacing: .2px;
                    `;

                    logo.parentElement.appendChild(
                        fallback
                    );
                },
                { once: true }
            );
        });
    }

    /* -------------------------------------------------------
       Initialise
    ------------------------------------------------------- */

    function init() {
        setCurrentYear();
        setupSmoothNavigation();
        setupBackToTop();
        setupExternalLinks();
        setupLogoFallback();
    }

    /* -------------------------------------------------------
       Public API
    ------------------------------------------------------- */

    window.VitalLoopFooter = {
        init,
        setCurrentYear
    };

    /* -------------------------------------------------------
       Start
    ------------------------------------------------------- */

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
