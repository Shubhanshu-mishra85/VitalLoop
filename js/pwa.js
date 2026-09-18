/* =========================================================
   VITAL LOOP — PWA MANAGER
   File: js/pwa.js
   ========================================================= */

(function () {
    "use strict";

    const LOGO_PATH =
        "assets/logo/vital-loop-logo.png";

    let deferredInstallPrompt = null;

    /* -------------------------------------------------------
       Create Install Prompt
    ------------------------------------------------------- */

    function createInstallPrompt() {
        if (
            document.querySelector(
                ".vital-loop-install-prompt"
            )
        ) {
            return;
        }

        const prompt =
            document.createElement("div");

        prompt.className =
            "vital-loop-install-prompt";

        prompt.setAttribute(
            "role",
            "dialog"
        );

        prompt.setAttribute(
            "aria-label",
            "Install Vital Loop"
        );

        prompt.innerHTML = `
            <div class="vital-loop-install-icon">
                <img
                    src="${LOGO_PATH}"
                    alt="Vital Loop"
                >
            </div>

            <div class="vital-loop-install-content">
                <h3>Install Vital Loop</h3>

                <p>
                    Add Vital Loop to your device
                    for a faster app-like experience.
                </p>
            </div>

            <div class="vital-loop-install-actions">

                <button
                    type="button"
                    class="vital-loop-install-btn primary"
                    id="vitalLoopInstallBtn"
                >
                    Install
                </button>

                <button
                    type="button"
                    class="vital-loop-install-btn secondary"
                    id="vitalLoopInstallClose"
                >
                    Later
                </button>

            </div>
        `;

        document.body.appendChild(prompt);

        const installButton =
            document.getElementById(
                "vitalLoopInstallBtn"
            );

        const closeButton =
            document.getElementById(
                "vitalLoopInstallClose"
            );

        installButton.addEventListener(
            "click",
            installApp
        );

        closeButton.addEventListener(
            "click",
            hideInstallPrompt
        );
    }

    /* -------------------------------------------------------
       Show / Hide Install Prompt
    ------------------------------------------------------- */

    function showInstallPrompt() {
        if (!deferredInstallPrompt) {
            return;
        }

        createInstallPrompt();

        const prompt =
            document.querySelector(
                ".vital-loop-install-prompt"
            );

        if (!prompt) return;

        window.setTimeout(() => {
            prompt.classList.add("show");
        }, 100);
    }

    function hideInstallPrompt() {
        const prompt =
            document.querySelector(
                ".vital-loop-install-prompt"
            );

        if (!prompt) return;

        prompt.classList.remove("show");

        window.setTimeout(() => {
            prompt.remove();
        }, 350);
    }

    /* -------------------------------------------------------
       Install App
    ------------------------------------------------------- */

    async function installApp() {
        if (!deferredInstallPrompt) {
            hideInstallPrompt();
            return;
        }

        try {
            deferredInstallPrompt.prompt();

            const result =
                await deferredInstallPrompt.userChoice;

            if (
                result &&
                result.outcome === "accepted"
            ) {
                showStatusMessage(
                    "Vital Loop installation started.",
                    "success"
                );
            }

        } catch (error) {
            console.warn(
                "PWA installation could not be completed.",
                error
            );

        } finally {
            deferredInstallPrompt = null;

            hideInstallPrompt();
        }
    }

    /* -------------------------------------------------------
       Online / Offline Status
    ------------------------------------------------------- */

    function createOfflineBanner() {
        if (
            document.querySelector(
                ".vital-loop-offline-banner"
            )
        ) {
            return;
        }

        const banner =
            document.createElement("div");

        banner.className =
            "vital-loop-offline-banner";

        banner.textContent =
            "You are offline. Some features may be unavailable.";

        banner.setAttribute(
            "role",
            "status"
        );

        document.body.appendChild(banner);
    }

    function showOfflineBanner() {
        createOfflineBanner();

        const banner =
            document.querySelector(
                ".vital-loop-offline-banner"
            );

        if (banner) {
            banner.classList.add("show");
        }

        updateOnlineIndicators(false);
    }

    function hideOfflineBanner() {
        const banner =
            document.querySelector(
                ".vital-loop-offline-banner"
            );

        if (banner) {
            banner.classList.remove("show");
        }

        updateOnlineIndicators(true);
    }

    function updateOnlineIndicators(isOnline) {
        const indicators =
            document.querySelectorAll(
                ".vital-loop-online-indicator"
            );

        indicators.forEach((indicator) => {
            indicator.classList.toggle(
                "offline",
                !isOnline
            );

            indicator.setAttribute(
                "aria-label",
                isOnline
                    ? "Online"
                    : "Offline"
            );
        });
    }

    /* -------------------------------------------------------
       Generic Status Message
    ------------------------------------------------------- */

    function showStatusMessage(
        message,
        type = "info"
    ) {
        if (
            window.VitalLoopNotifications &&
            typeof
                window.VitalLoopNotifications.showToast ===
                "function"
        ) {
            window.VitalLoopNotifications.showToast({
                type,
                title: "Vital Loop",
                message
            });

            return;
        }

        /*
         * Fallback when notifications.js
         * has not loaded yet.
         */
        const existing =
            document.querySelector(
                ".vital-loop-pwa-status"
            );

        if (existing) {
            existing.remove();
        }

        const status =
            document.createElement("div");

        status.className =
            "vital-loop-pwa-status";

        status.textContent = message;

        status.style.cssText = `
            position: fixed;
            left: 50%;
            bottom: 20px;
            transform: translateX(-50%);
            z-index: 10001;
            padding: 11px 15px;
            border-radius: 12px;
            background: #263238;
            color: #ffffff;
            font-size: 12px;
            font-weight: 600;
            box-shadow: 0 10px 30px rgba(0,0,0,.18);
        `;

        document.body.appendChild(status);

        window.setTimeout(() => {
            status.remove();
        }, 3500);
    }

    /* -------------------------------------------------------
       Service Worker
    ------------------------------------------------------- */

    async function registerServiceWorker() {
        if (!("serviceWorker" in navigator)) {
            return null;
        }

        try {
            const registration =
                await navigator.serviceWorker.register(
                    "./sw.js",
                    {
                        scope: "./"
                    }
                );

            console.log(
                "Vital Loop service worker registered."
            );

            return registration;

        } catch (error) {
            console.warn(
                "Vital Loop service worker registration failed.",
                error
            );

            return null;
        }
    }

    /* -------------------------------------------------------
       Install Event
    ------------------------------------------------------- */

    function setupInstallListener() {
        window.addEventListener(
            "beforeinstallprompt",
            (event) => {
                event.preventDefault();

                deferredInstallPrompt = event;

                /*
                 * Delay the prompt slightly so that
                 * the user can see the application first.
                 */
                window.setTimeout(
                    showInstallPrompt,
                    2500
                );
            }
        );

        window.addEventListener(
            "appinstalled",
            () => {
                deferredInstallPrompt = null;

                hideInstallPrompt();

                showStatusMessage(
                    "Vital Loop has been installed.",
                    "success"
                );
            }
        );
    }

    /* -------------------------------------------------------
       Display Mode Detection
    ------------------------------------------------------- */

    function isStandalone() {
        return (
            window.matchMedia &&
            window.matchMedia(
                "(display-mode: standalone)"
            ).matches
        ) ||
        window.navigator.standalone === true;
    }

    /* -------------------------------------------------------
       Network Events
    ------------------------------------------------------- */

    function setupNetworkListeners() {
        window.addEventListener(
            "online",
            () => {
                hideOfflineBanner();

                showStatusMessage(
                    "Connection restored.",
                    "success"
                );
            }
        );

        window.addEventListener(
            "offline",
            showOfflineBanner
        );

        if (!navigator.onLine) {
            showOfflineBanner();
        } else {
            updateOnlineIndicators(true);
        }
    }

    /* -------------------------------------------------------
       Initialise
    ------------------------------------------------------- */

    async function init() {
        setupInstallListener();

        setupNetworkListeners();

        /*
         * Do not show an install prompt when
         * Vital Loop is already running as an app.
         */
        if (!isStandalone()) {
            /*
             * Service worker registration can happen
             * independently of the install prompt.
             */
            await registerServiceWorker();
        } else {
            await registerServiceWorker();
        }
    }

    /* -------------------------------------------------------
       Public API
    ------------------------------------------------------- */

    window.VitalLoopPWA = {
        init,
        installApp,
        showInstallPrompt,
        hideInstallPrompt,
        isStandalone,
        registerServiceWorker,
        showOfflineBanner,
        hideOfflineBanner
    };

    /* -------------------------------------------------------
       Start
    ------------------------------------------------------- */

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            init
        );
    } else {
        init();
    }

})();
