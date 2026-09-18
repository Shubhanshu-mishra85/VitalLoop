/* =========================================================
   VITAL LOOP — PWA SERVICE WORKER
   sw.js
   ========================================================= */

const CACHE_VERSION = "vital-loop-v2";

const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DATA_CACHE = `${CACHE_VERSION}-data`;

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

  "./data/blood-centres.json",
  "./data/camps.json",
  "./data/demo-data.json",

  "./manifest.json"
];


/* =========================================================
   INSTALL
   ========================================================= */

self.addEventListener(
  "install",
  event => {

    event.waitUntil(

      caches
        .open(STATIC_CACHE)
        .then(cache => {

          return cache.addAll(
            APP_SHELL
          );

        })
        .catch(error => {

          console.warn(
            "Vital Loop install cache warning:",
            error
          );

        })
        .finally(() => {

          return self.skipWaiting();

        })

    );

  }
);


/* =========================================================
   ACTIVATE
   ========================================================= */

self.addEventListener(
  "activate",
  event => {

    event.waitUntil(

      caches
        .keys()
        .then(cacheNames => {

          return Promise.all(

            cacheNames
              .filter(cacheName => {

                return (
                  cacheName.startsWith(
                    "vital-loop-"
                  ) &&
                  cacheName !==
                    STATIC_CACHE &&
                  cacheName !==
                    DATA_CACHE
                );

              })
              .map(cacheName => {

                return caches.delete(
                  cacheName
                );

              })

          );

        })
        .then(() => {

          return self.clients.claim();

        })

    );

  }
);


/* =========================================================
   FETCH STRATEGY
   ========================================================= */

self.addEventListener(
  "fetch",
  event => {

    const request =
      event.request;

    if (
      request.method !== "GET"
    ) {
      return;
    }

    const url =
      new URL(request.url);


    /*
      Only handle HTTP/HTTPS requests.
    */

    if (
      url.protocol !== "http:" &&
      url.protocol !== "https:"
    ) {
      return;
    }


    /*
      JSON data:
      Network first.
    */

    if (
      url.pathname.includes("/data/")
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
      HTML pages:
      Network first with cached fallback.
    */

    if (
      request.mode === "navigate" ||
      request.destination === "document"
    ) {

      event.respondWith(
        networkFirstDocument(
          request
        )
      );

      return;
    }


    /*
      CSS, JS and other static resources:
      Cache first.
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
      await fetch(request);

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

    return offlineResponse();

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
      await fetch(request);

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


    const home =
      await cache.match(
        "./index.html"
      );

    if (home) {
      return home;
    }


    return offlineResponse();

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
      await fetch(request);


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

    return offlineResponse();

  }

}


/* =========================================================
   OFFLINE FALLBACK
   ========================================================= */

function offlineResponse() {

  return new Response(
    `
      <!DOCTYPE html>

      <html lang="en">

      <head>

        <meta charset="UTF-8">

        <meta
          name="viewport"
          content="width=device-width,initial-scale=1"
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
            display: grid;
            place-items: center;
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
            padding: 34px;
            text-align: center;
            border-radius: 28px;
            background: #fff;
            box-shadow:
              0 24px 70px
              rgba(16,32,39,.14);
          }

          .offline-icon {
            width: 70px;
            height: 70px;
            margin: 0 auto 20px;
            display: grid;
            place-items: center;
            border-radius: 22px;
            background: #d7263d;
            color: #fff;
            font-size: 30px;
          }

          h1 {
            margin: 0 0 12px;
            font-size: 28px;
          }

          p {
            margin: 0 0 24px;
            line-height: 1.7;
            color: #52636a;
          }

          button {
            border: 0;
            border-radius: 14px;
            padding: 13px 22px;
            background: #102027;
            color: #fff;
            font-weight: 700;
            cursor: pointer;
          }

        </style>

      </head>

      <body>

        <main class="offline-card">

          <div
            class="offline-icon"
            aria-hidden="true"
          >
            ♥
          </div>

          <h1>
            You're Offline
          </h1>

          <p>
            Vital Loop cannot connect to the
            network right now. Try again when
            your connection is available.
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
   SKIP WAITING
   ========================================================= */

self.addEventListener(
  "message",
  event => {

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
        clearCaches()
      );

    }

  }
);


/* =========================================================
   CLEAR CACHES
   ========================================================= */

async function clearCaches() {

  const names =
    await caches.keys();


  await Promise.all(

    names
      .filter(name =>
        name.startsWith(
          "vital-loop-"
        )
      )
      .map(name =>
        caches.delete(name)
      )

  );

}


/* =========================================================
   BACKGROUND SYNC
   ========================================================= */

self.addEventListener(
  "sync",
  event => {

    if (
      event.tag !==
      "vital-loop-request-sync"
    ) {

      return;
    }


    /*
      Reserved for future authenticated
      request synchronization.

      Emergency requests are never silently
      submitted by the service worker.
    */

    event.waitUntil(
      Promise.resolve()
    );

  }
);


/* =========================================================
   PUSH NOTIFICATIONS
   ========================================================= */

self.addEventListener(
  "push",
  event => {

    if (!event.data) {
      return;
    }


    let payload;


    try {

      payload =
        event.data.json();

    } catch (error) {

      payload = {
        title:
          "Vital Loop",
        body:
          event.data.text()
      };

    }


    const title =
      payload.title ||
      "Vital Loop";


    const options = {

      body:
        payload.body ||
        "You have a new Vital Loop update.",

      tag:
        payload.tag ||
        "vital-loop-update",

      data:
        payload.url ||
        "./index.html",

      requireInteraction:
        false

    };


    event.waitUntil(

      self.registration
        .showNotification(
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
  event => {

    event.notification.close();


    const target =
      event.notification.data ||
      "./index.html";


    event.waitUntil(

      self.clients
        .matchAll({
          type: "window",
          includeUncontrolled: true
        })
        .then(clients => {

          for (
            const client of clients
          ) {

            if (
              "focus" in client
            ) {

              client.navigate(
                target
              );

              return client.focus();

            }

          }


          if (
            self.clients.openWindow
          ) {

            return self.clients.openWindow(
              target
            );

          }

        })

    );

  }
);
