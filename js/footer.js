/* =========================================================
   VITAL LOOP — FOOTER MANAGER
   ========================================================= */

(function () {
  "use strict";

  function setCurrentYear() {
    const yearElements = document.querySelectorAll(
      "[data-current-year], #currentYear, .current-year"
    );

    const year = new Date().getFullYear();

    yearElements.forEach((element) => {
      element.textContent = year;
    });
  }

  function setFooterLinks() {
    const footer = document.querySelector(
      "footer, .site-footer, .vl-footer"
    );

    if (!footer) return;

    footer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", function () {
        this.classList.add("footer-link-clicked");

        setTimeout(() => {
          this.classList.remove("footer-link-clicked");
        }, 250);
      });
    });
  }

  function setupBackToTop() {
    const buttons = document.querySelectorAll(
      "[data-back-to-top], #backToTop, .back-to-top"
    );

    if (!buttons.length) return;

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      });
    });

    const updateVisibility = () => {
      const visible = window.scrollY > 500;

      buttons.forEach((button) => {
        button.classList.toggle("is-visible", visible);
      });
    };

    window.addEventListener("scroll", updateVisibility, {
      passive: true
    });

    updateVisibility();
  }

  function setupFooterObserver() {
    const footer = document.querySelector(
      "footer, .site-footer, .vl-footer"
    );

    if (!footer || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            footer.classList.add("footer-visible");
          }
        });
      },
      {
        threshold: 0.08
      }
    );

    observer.observe(footer);
  }

  function initFooter() {
    setCurrentYear();
    setFooterLinks();
    setupBackToTop();
    setupFooterObserver();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFooter);
  } else {
    initFooter();
  }

  window.VitalLoopFooter = {
    init: initFooter,
    setCurrentYear
  };
})();
