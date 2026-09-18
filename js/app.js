/* =========================================================
   VITAL LOOP — APP.JS
   Navigation + Mobile Menu + Safe Button Handling
   ========================================================= */

(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {

        /* -------------------------------------------------
           MOBILE MENU
           ------------------------------------------------- */

        const menuButton =
            document.getElementById("menuToggle");

        const mobileMenu =
            document.getElementById("mobileMenu");

        if (menuButton && mobileMenu) {

            menuButton.addEventListener("click", function (event) {

                event.preventDefault();
                event.stopPropagation();

                mobileMenu.classList.toggle("open");

                const isOpen =
                    mobileMenu.classList.contains("open");

                menuButton.setAttribute(
                    "aria-expanded",
                    isOpen ? "true" : "false"
                );

                menuButton.innerHTML =
                    isOpen ? "✕" : "☰";
            });


            /* Close menu after selecting a link */

            mobileMenu
                .querySelectorAll("a")
                .forEach(function (link) {

                    link.addEventListener("click", function () {

                        mobileMenu.classList.remove("open");

                        menuButton.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                        menuButton.innerHTML = "☰";

                    });

                });
        }


        /* -------------------------------------------------
           MOBILE MORE BUTTON
           ------------------------------------------------- */

        const moreButton =
            document.getElementById("mobileMoreButton");

        if (moreButton) {

            moreButton.addEventListener("click", function () {

                if (mobileMenu) {

                    mobileMenu.classList.toggle("open");

                    const isOpen =
                        mobileMenu.classList.contains("open");

                    if (menuButton) {

                        menuButton.setAttribute(
                            "aria-expanded",
                            isOpen ? "true" : "false"
                        );

                        menuButton.innerHTML =
                            isOpen ? "✕" : "☰";
                    }

                    if (isOpen) {

                        mobileMenu.scrollIntoView({
                            behavior: "smooth",
                            block: "nearest"
                        });

                    }

                }

            });
        }


        /* -------------------------------------------------
           SAFE NAVIGATION
           ------------------------------------------------- */

        /*
         * Make sure internal Vital Loop links work
         * even if another script accidentally interferes.
         */

        document
            .querySelectorAll("a[href]")
            .forEach(function (link) {

                const href =
                    link.getAttribute("href");

                if (!href) return;

                /* Ignore external links */

                if (
                    href.startsWith("http://") ||
                    href.startsWith("https://") ||
                    href.startsWith("#") ||
                    href.startsWith("mailto:") ||
                    href.startsWith("tel:")
                ) {
                    return;
                }


                link.addEventListener(
                    "click",
                    function (event) {

                        /*
                         * Do not prevent the normal browser
                         * navigation. This simply ensures the
                         * target exists as a normal page link.
                         */

                        const target =
                            link.getAttribute("target");

                        if (target === "_blank") {
                            return;
                        }

                        /* Close mobile menu */

                        if (mobileMenu) {
                            mobileMenu.classList.remove("open");
                        }

                    }
                );

            });


        /* -------------------------------------------------
           BUTTONS WITH data-page
           ------------------------------------------------- */

        document
            .querySelectorAll("[data-page]")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const page =
                            button.getAttribute("data-page");

                        if (page) {
                            window.location.href = page;
                        }

                    }
                );

            });


        /* -------------------------------------------------
           CURRENT YEAR
           ------------------------------------------------- */

        const yearElement =
            document.getElementById("currentYear");

        if (yearElement) {

            yearElement.textContent =
                new Date().getFullYear();

        }


        /* -------------------------------------------------
           PREVENT BROKEN # LINKS
           ------------------------------------------------- */

        document
            .querySelectorAll('a[href="#"]')
            .forEach(function (link) {

                link.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                    }
                );

            });


        /* -------------------------------------------------
           BACK TO TOP
           ------------------------------------------------- */

        const backTop =
            document.getElementById("backToTop");

        if (backTop) {

            backTop.addEventListener(
                "click",
                function () {

                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });

                }
            );

        }

    });

})();
