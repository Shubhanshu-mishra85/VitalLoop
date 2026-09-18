/* =========================================================
   VITAL LOOP — SERVICE WORKER
   Cache Fix + Offline Support
   ========================================================= */

const CACHE_NAME = "vital-loop-v4";

const APP_SHELL = [
    "./",
    "./index.html",

    "./css/style.css",
    "./css/responsive.css",
    "./css/animations.css",
    "./css/header.css",
    "./css/footer.css",
    "./css/keyboard.css",

    "./js/app.js",
    "./js/loader.js",
    "./js/animations.js",
    "./js/theme.js",
    "./js/language.js",
    "./js/voice.js",
    "./js/footer.js",
    "./js/keyboard.js",

    "./assets/logo/icon-192.png",

    "./manifest.json"
];


/* =========================================================
   INSTALL
   ========================================================= */

self.addEventListener("install", function (event) {

    /*
     * Activate the new service worker immediately.
     */

    self.skipWaiting();

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(function (cache) {

                return cache.addAll(APP_SHELL);

            })
            .catch(function (error) {

                console.log(
                    "Vital Loop cache setup:",
                    error
                );

            })

    );

});


/* =========================================================
   ACTIVATE
   ========================================================= */

self.addEventListener("activate", function (event) {

    event.waitUntil(

        caches.keys()
            .then(function (cacheNames) {

                return Promise.all(

                    cacheNames.map(function (cacheName) {

                        /*
                         * Delete every old Vital Loop cache.
                         */

                        if (cacheName !== CACHE_NAME) {

                            return caches.delete(
                                cacheName
                            );

                        }

                    })

                );

            })
            .then(function () {

                return self.clients.claim();

            })

    );

});


/* =========================================================
   FETCH
   ========================================================= */

self.addEventListener("fetch", function (event) {

    const request = event.request;

    /*
     * Only handle normal GET requests.
     */

    if (request.method !== "GET") {
        return;
    }


    event.respondWith(

        fetch(request)

            .then(function (response) {

                /*
                 * Save a fresh successful response.
                 */

                if (
                    response &&
                    response.status === 200 &&
                    response.type === "basic"
                ) {

                    const copy =
                        response.clone();

                    caches.open(CACHE_NAME)
                        .then(function (cache) {

                            cache.put(
                                request,
                                copy
                            );

                        });

                }

                return response;

            })

            .catch(function () {

                /*
                 * If internet is unavailable,
                 * use cached version.
                 */

                return caches.match(request)
                    .then(function (cached) {

                        if (cached) {
                            return cached;
                        }


                        /*
                         * Offline navigation fallback.
                         */

                        if (
                            request.mode === "navigate"
                        ) {

                            return caches.match(
                                "./index.html"
                            );

                        }

                    });

            })

    );

});


/* =========================================================
   MESSAGE
   ========================================================= */

self.addEventListener("message", function (event) {

    if (!event.data) {
        return;
    }


    /*
     * Allows the website to force activation.
     */

    if (
        event.data.type ===
        "SKIP_WAITING"
    ) {

        self.skipWaiting();

    }


    /*
     * Completely clear Vital Loop caches.
     */

    if (
        event.data.type ===
        "CLEAR_CACHE"
    ) {

        event.waitUntil(

            caches.keys()
                .then(function (names) {

                    return Promise.all(

                        names.map(function (name) {

                            return caches.delete(
                                name
                            );

                        })

                    );

                })

        );

    }

});
