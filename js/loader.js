/* =========================================================
   VITAL LOOP — LOADER
   Guaranteed loader exit + fallback
   ========================================================= */

(function () {
  "use strict";

  const MIN_LOADER_TIME = 1800;
  const MAX_LOADER_TIME = 4500;

  const startTime = Date.now();

  function getLoader() {
    return (
      document.getElementById("pageLoader") ||
      document.querySelector(".page-loader") ||
      document.querySelector(".loader-screen") ||
      document.querySelector(".loading-screen")
    );
  }

  function showWebsite() {
    const loader = getLoader();

    document.documentElement.classList.add("loader-finished");
    document.body.classList.add("loader-finished");

    if (loader) {
      loader.classList.add("loader-hidden");

      setTimeout(function () {
        loader.style.display = "none";
        loader.setAttribute("aria-hidden", "true");
      }, 700);
    }

    // Make sure the actual website is visible
    const mainContent =
      document.querySelector("main") ||
      document.querySelector(".site-content") ||
      document.querySelector("#app");

    if (mainContent) {
      mainContent.style.visibility = "visible";
      mainContent.style.opacity = "1";
    }

    // Restore scrolling
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }

  function finishLoader() {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, MIN_LOADER_TIME - elapsed);

    setTimeout(showWebsite, remaining);
  }

  // Normal page load
  if (document.readyState === "complete") {
    finishLoader();
  } else {
    window.addEventListener("load", finishLoader, { once: true });
  }

  // IMPORTANT:
  // Never allow the loader to stay forever.
  setTimeout(function () {
    showWebsite();
  }, MAX_LOADER_TIME);

  // Extra fallback for slow/broken resources
  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
      if (document.body) {
        const loader = getLoader();

        if (loader && !loader.classList.contains("loader-hidden")) {
          showWebsite();
        }
      }
    }, MAX_LOADER_TIME);
  });

})();
