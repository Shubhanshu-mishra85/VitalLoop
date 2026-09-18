/* =========================================================
   VITAL LOOP — SERVICE WORKER
   js/service-worker.js
   ========================================================= */

const CACHE_VERSION =
  "vital-loop-cache-v1";

const STATIC_CACHE =
  `${CACHE_VERSION}-static`;

const DATA_CACHE =
  `${CACHE_VERSION}-data`;


/* =========================================================
   APP SHELL
   ========================================================= */

const APP_SHELL = [
  "./",
  "./index.html",
  "./emergency.html",
  "./blood-request.html",
  "./find-blood.html",
  "./donor.html",
  "./camps.html",
  "./blood-education.html",
  "./assistant.html",
  "./prescription.html",
  "./medicine.html",
  "./about.html",
  "./dashboard.html",
  "./tracking.html",
  "./easy-mode.html",
  "./privacy.html",

  "./css/style.css",
  "./css/responsive.css",
  "./css/animations.css",
  "./css/assistant.css",
  "./css/dashboard.css",
  "./css/prescription.css",

  "./js/app.js",
  "./js/loader.js",
  "./js/animations.js",
  "./js/assistant.js",
  "./js/emergency.js",
  "./js/request.js",
  "./js/tracking.js",
  "./js/donor.js",
  "./js/search.js",
  "./js/dashboard.js",
  "./js/easy-mode.js",
  "./js/accessibility.js",
  "./js/prescription.js",
  "./js/medicine.js",
  "./js/map.js",

  "./manifest.json"
];


/* =========================================================
   INSTALL
   ========================================================= */

self.addEventListener(
  "install",
  function (event) {

    event.waitUntil(
      caches
        .open(
          STATIC_CACHE
        )
        .then(
          function (cache) {

            return cache.addAll(
              APP_SHELL
            );

          }
        )
        .then(
          function () {

            return self.skipWaiting();

          }
        )
        .catch(
          function (error) {

            console.warn(
              "Vital Loop cache installation warning:",
              error
            );

          }
        )
    );

  }
);


/* =========================================================
   ACTIVATE
   ========================================================= */

self.addEventListener(
  "activate",
  function (event) {

    event.waitUntil(

      caches
        .keys()
        .then(
          function (cacheNames) {

            return Promise.all(

              cacheNames
                .filter(
                  function (cacheName) {

                    return (
                      cacheName.startsWith(
                        "vital-loop-cache-"
                      ) &&
                      cacheName !==
                        STATIC_CACHE &&
                      cacheName !==
                        DATA_CACHE
                    );

                  }
                )
                .map(
                  function (cacheName) {

                    return caches.delete(
                      cacheName
                    );

                  }
                )

            );

          }
        )
        .then(
          function () {

            return self.clients.claim();

          }
        )

    );

  }
);


/* =========================================================
   FETCH
   ========================================================= */

self.addEventListener(
  "fetch",
  function (event) {

    const request =
      event.request;


    if (
      request.method !==
      "GET"
    ) {

      return;

    }


    const url =
      new URL(
        request.url
      );


    /*
      Do not intercept:
      - browser extensions
      - unsupported protocols
      - external APIs
    */

    if (
      url.protocol !==
      "http:" &&
      url.protocol !==
      "https:"
    ) {

      return;

    }


    /*
      JSON/data files:
      network-first so the app can receive
      newer information whenever internet
      connectivity is available.
    */

    if (
      url.pathname.includes(
        "/data/"
      )
    ) {

      event.respondWith(
        networkFirst(
          request,
          DATA_CACHE
        )
      );

      return;

    }


    /*
      HTML:
      network-first with cached fallback.
      This helps prevent stale pages after
      a new deployment.
    */

    if (
      request.mode ===
      "navigate" ||
      request.destination ===
      "document"
    ) {

      event.respondWith(
        networkFirstDocument(
          request
        )
      );

      return;

    }


    /*
      CSS / JS / images / manifest:
      cache-first with network fallback.
    */

    event.respondWith(
      cacheFirst(
        request,
        STATIC_CACHE
      )
    );

  }
);


/* =========================================================
   NETWORK FIRST
   ========================================================= */

async function networkFirst(
  request,
  cacheName
) {

  const cache =
    await caches.open(
      cacheName
    );


  try {

    const response =
      await fetch(
        request
      );


    if (
      response &&
      response.ok
    ) {

      await cache.put(
        request,
        response.clone()
      );

    }


    return response;

  } catch (error) {

    const cached =
      await cache.match(
        request
      );


    if (cached) {

      return cached;

    }


    return createOfflineResponse();

  }

}


/* =========================================================
   DOCUMENT NETWORK FIRST
   ========================================================= */

async function networkFirstDocument(
  request
) {

  const cache =
    await caches.open(
      STATIC_CACHE
    );


  try {

    const response =
      await fetch(
        request
      );


    if (
      response &&
      response.ok
    ) {

      await cache.put(
        request,
        response.clone()
      );

    }


    return response;

  } catch (error) {

    const cached =
      await cache.match(
        request
      );


    if (cached) {

      return cached;

    }


    const index =
      await cache.match(
        "./index.html"
      );


    if (index) {

      return index;

    }


    return createOfflineResponse();

  }

}


/* =========================================================
   CACHE FIRST
   ========================================================= */

async function cacheFirst(
  request,
  cacheName
) {

  const cache =
    await caches.open(
      cacheName
    );


  const cached =
    await cache.match(
      request
    );


  if (cached) {

    return cached;

  }


  try {

    const response =
      await fetch(
        request
      );


    if (
      response &&
      response.ok
    ) {

      await cache.put(
        request,
        response.clone()
      );

    }


    return response;

  } catch (error) {

    return createOfflineResponse();

  }

}


/* =========================================================
   OFFLINE RESPONSE
   ========================================================= */

function createOfflineResponse() {

  return new Response(
    `
      <!DOCTYPE html>

      <html lang="en">

      <head>

        <meta charset="UTF-8">

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        >

        <title>
          Vital Loop — Offline
        </title>

        <style>

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            font-family:
              system-ui,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif;
            background:
              #edf8f5;
            color:
              #102027;
          }

          .offline-card {
            width: min(520px, 100%);
            padding: 32px;
            border-radius: 28px;
            background:
              rgba(255,255,255,.92);
            box-shadow:
              0 24px 70px rgba(16,32,39,.14);
            text-align: center;
          }

          .offline-icon {
            width: 72px;
            height: 72px;
            margin: 0 auto 20px;
            display: grid;
            place-items: center;
            border-radius: 24px;
            background:
              #d7263d;
            color:
              white;
            font-size: 32px;
          }

          h1 {
            margin: 0 0 12px;
            font-size: 28px;
          }

          p {
            margin: 0 0 22px;
            line-height: 1.7;
            color:
              #52636a;
          }

          button {
            border: 0;
            border-radius: 14px;
            padding: 13px 20px;
            background:
              #102027;
            color:
              #fff;
            font-weight: 700;
            cursor: pointer;
          }

        </style>

      </head>

      <body>

        <main
          class="offline-card"
          role="main"
        >

          <div
            class="offline-icon"
            aria-hidden="true"
          >
            ♥
          </div>

          <h1>
            You're offline
          </h1>

          <p>
            Vital Loop could not connect to the
            network right now. Cached pages may
            still be available.
          </p>

          <button
            type="button"
            onclick="location.reload()"
          >
            Try Again
          </button>

        </main>

      </body>

      </html>
    `,
    {
      status: 503,
      headers: {
        "Content-Type":
          "text/html; charset=utf-8"
      }
    }
  );

}


/* =========================================================
   MESSAGE HANDLER
   ========================================================= */

self.addEventListener(
  "message",
  function (event) {

    if (
      !event.data
    ) {

      return;

    }


    if (
      event.data.type ===
      "SKIP_WAITING"
    ) {

      self.skipWaiting();

    }


    if (
      event.data.type ===
      "CLEAR_CACHE"
    ) {

      event.waitUntil(
        clearVitalLoopCaches()
      );

    }

  }
);


/* =========================================================
   CLEAR CACHE
   ========================================================= */

async function clearVitalLoopCaches() {

  const cacheNames =
    await caches.keys();


  await Promise.all(
    cacheNames
      .filter(
        function (name) {

          return name.startsWith(
            "vital-loop-cache-"
          );

        }
      )
      .map(
        function (name) {

          return caches.delete(
            name
          );

        }
      )
  );

}


/* =========================================================
   BACKGROUND SYNC FALLBACK
   ========================================================= */

self.addEventListener(
  "sync",
  function (event) {

    /*
      Reserved for future request-sync
      functionality.

      No emergency request is silently
      submitted from the service worker.
    */

    if (
      event.tag ===
      "vital-loop-request-sync"
    ) {

      event.waitUntil(
        Promise.resolve()
      );

    }

  }
);


/* =========================================================
   PUSH NOTIFICATION PLACEHOLDER
   ========================================================= */

self.addEventListener(
  "push",
  function (event) {

    /*
      Notification infrastructure can be
      connected later with an authenticated
      backend.

      The service worker does not invent
      medical or emergency notifications.
    */

    if (
      !event.data
    ) {

      return;

    }


    let data = null;


    try {

      data =
        event.data.json();

    } catch (error) {

      data = {
        title:
          "Vital Loop",
        body:
          event.data.text()
      };

    }


    const title =
      data.title ||
      "Vital Loop";


    const options = {
      body:
        data.body ||
        "You have a new Vital Loop update.",

      icon:
        "./assets/logo/icon-192.png",

      badge:
        "./assets/logo/icon-192.png",

      tag:
        data.tag ||
        "vital-loop-update",

      data:
        data.url ||
        "./index.html",

      vibrate:
        [100, 50, 100],

      requireInteraction:
        false
    };


    event.waitUntil(
      self.registration.showNotification(
        title,
        options
      )
    );

  }
);


/* =========================================================
   NOTIFICATION CLICK
   ========================================================= */

self.addEventListener(
  "notificationclick",
  function (event) {

    event.notification.close();


    const target =
      event.notification.data ||
      "./index.html";


    event.waitUntil(

      clients
        .matchAll({
          type:
            "window",
          includeUncontrolled:
            true
        })
        .then(
          function (clientList) {

            for (
              const client of clientList
            ) {

              if (
                "focus" in
                client
              ) {

                client.navigate(
                  target
                );

                return client.focus();

              }

            }


            if (
              clients.openWindow
            ) {

              return clients.openWindow(
                target
              );

            }

          }
        )

    );

  }
);
