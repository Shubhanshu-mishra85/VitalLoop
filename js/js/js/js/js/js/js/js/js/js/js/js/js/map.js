/* =========================================================
   VITAL LOOP — MAP & LOCATION ENGINE
   js/map.js
   ========================================================= */

(function () {
  "use strict";

  const CONFIG = {
    defaultCenter: {
      lat: 26.8467,
      lng: 80.9462
    },

    defaultZoom: 12,

    mapTiles:
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

    attribution:
      '&copy; OpenStreetMap contributors'
  };


  const state = {
    maps: {},
    markers: {},
    userLocation: null,
    watchIds: {},
    datasets: {
      bloodCentres: [],
      camps: [],
      donors: []
    }
  };


  /* =======================================================
     INITIALIZATION
     ======================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    initializeMapEngine
  );


  function initializeMapEngine() {

    loadDatasets();

    initializeDeclaredMaps();

    bindLocationButtons();

  }


  /* =======================================================
     DATA LOADING
     ======================================================= */

  async function loadDatasets() {

    const sources = [
      {
        key: "bloodCentres",
        url: "data/blood-centres.json"
      },

      {
        key: "camps",
        url: "data/camps.json"
      },

      {
        key: "donors",
        url: "data/demo-data.json"
      }
    ];


    await Promise.all(
      sources.map(
        async function (source) {

          try {

            const response =
              await fetch(
                source.url,
                {
                  cache: "no-cache"
                }
              );


            if (!response.ok) {
              throw new Error(
                "Dataset request failed"
              );
            }


            const data =
              await response.json();


            if (
              source.key ===
              "donors"
            ) {

              state.datasets.donors =
                extractDonors(
                  data
                );

            } else {

              state.datasets[
                source.key
              ] =
                Array.isArray(
                  data
                )
                  ? data
                  : Array.isArray(
                      data.items
                    )
                    ? data.items
                    : [];

            }


          } catch (error) {

            console.warn(
              "Vital Loop map dataset unavailable:",
              source.url,
              error
            );

          }

        }
      )
    );


    refreshAllMaps();

  }


  function extractDonors(
    data
  ) {

    if (
      Array.isArray(
        data
      )
    ) {

      return data;

    }


    if (
      Array.isArray(
        data.donors
      )
    ) {

      return data.donors;

    }


    return [];

  }


  /* =======================================================
     MAP INITIALIZATION
     ======================================================= */

  function initializeDeclaredMaps() {

    if (
      typeof L ===
      "undefined"
    ) {

      console.warn(
        "Leaflet is not loaded. Map features require Leaflet."
      );

      return;

    }


    document
      .querySelectorAll(
        "[data-vital-loop-map]"
      )
      .forEach(
        function (element) {

          const mapId =
            element.id ||
            "vitalLoopMap-" +
              Date.now();


          if (!element.id) {

            element.id =
              mapId;

          }


          const type =
            element.dataset
              .vitalLoopMap ||
            "general";


          initMap(
            mapId,
            type
          );

        }
      );

  }


  function initMap(
    mapId,
    type
  ) {

    if (
      typeof L ===
      "undefined"
    ) {

      return null;

    }


    const element =
      document.getElementById(
        mapId
      );


    if (!element) {
      return null;
    }


    if (
      state.maps[mapId]
    ) {

      state.maps[mapId].invalidateSize();

      return state.maps[mapId];

    }


    const center =
      state.userLocation ||
      CONFIG.defaultCenter;


    const map =
      L.map(
        mapId,
        {
          zoomControl:
            true,

          attributionControl:
            true,

          scrollWheelZoom:
            false
        }
      ).setView(
        [
          center.lat,
          center.lng
        ],
        CONFIG.defaultZoom
      );


    L.tileLayer(
      CONFIG.mapTiles,
      {
        maxZoom: 19,
        attribution:
          CONFIG.attribution
      }
    ).addTo(
      map
    );


    state.maps[mapId] =
      map;


    state.markers[mapId] =
      [];


    element.dataset.mapType =
      type;


    setTimeout(
      function () {

        map.invalidateSize();

      },
      200
    );


    addMapLegend(
      mapId,
      type
    );


    return map;

  }


  /* =======================================================
     COMPATIBILITY API
     ======================================================= */

  window.initLiveMap =
    function (
      mapId,
      latitude,
      longitude,
      label
    ) {

      const map =
        initMap(
          mapId,
          "blood-centre"
        );


      if (!map) {
        return null;
      }


      if (
        Number.isFinite(
          Number(latitude)
        ) &&
        Number.isFinite(
          Number(longitude)
        )
      ) {

        map.setView(
          [
            Number(latitude),
            Number(longitude)
          ],
          14
        );


        addUserMarker(
          mapId,
          Number(latitude),
          Number(longitude),
          label ||
            "Search Location"
        );

      }


      return map;

    };


  /* =======================================================
     USER LOCATION
     ======================================================= */

  function bindLocationButtons() {

    document
      .querySelectorAll(
        "[data-get-location]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              requestUserLocation();

            }
          );

        }
      );

  }


  function requestUserLocation() {

    if (
      !navigator.geolocation
    ) {

      showLocationMessage(
        "Location is not supported on this device."
      );

      return;

    }


    showLocationMessage(
      "Requesting your location..."
    );


    navigator.geolocation.getCurrentPosition(
      function (position) {

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;


        setUserLocation(
          latitude,
          longitude
        );


        showLocationMessage(
          "Your location is ready."
        );

      },

      function (error) {

        console.warn(
          "Vital Loop location error:",
          error
        );


        showLocationMessage(
          getLocationErrorMessage(
            error
          )
        );

      },

      {
        enableHighAccuracy:
          true,

        timeout:
          12000,

        maximumAge:
          60000
      }
    );

  }


  function setUserLocation(
    latitude,
    longitude
  ) {

    const lat =
      Number(latitude);

    const lng =
      Number(longitude);


    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {

      return;

    }


    state.userLocation = {
      lat,
      lng
    };


    localStorage.setItem(
      "vitalLoopLocation",
      JSON.stringify(
        state.userLocation
      )
    );


    Object.keys(
      state.maps
    )
      .forEach(
        function (mapId) {

          const map =
            state.maps[
              mapId
            ];


          map.setView(
            [
              lat,
              lng
            ],
            Math.max(
              map.getZoom(),
              13
            )
          );


          addUserMarker(
            mapId,
            lat,
            lng,
            "Your Location"
          );

        }
      );


    refreshAllMaps();

  }


  function restoreUserLocation() {

    try {

      const saved =
        JSON.parse(
          localStorage.getItem(
            "vitalLoopLocation"
          ) || "null"
        );


      if (
        saved &&
        Number.isFinite(
          Number(saved.lat)
        ) &&
        Number.isFinite(
          Number(saved.lng)
        )
      ) {

        state.userLocation = {
          lat:
            Number(saved.lat),

          lng:
            Number(saved.lng)
        };

      }

    } catch (error) {

      console.warn(
        "Saved Vital Loop location unavailable.",
        error
      );

    }

  }


  restoreUserLocation();


  /* =======================================================
     LIVE LOCATION WATCH
     ======================================================= */

  window.startLiveLocationWatch =
    function (
      key,
      mapId,
      statusId,
      label
    ) {

      if (
        !navigator.geolocation
      ) {

        updateStatus(
          statusId,
          "Location is not supported."
        );

        return;

      }


      stopLiveLocationWatch(
        key
      );


      const watchId =
        navigator.geolocation.watchPosition(
          function (position) {

            const lat =
              position.coords.latitude;

            const lng =
              position.coords.longitude;


            setUserLocation(
              lat,
              lng
            );


            if (
              mapId &&
              state.maps[mapId]
            ) {

              state.maps[
                mapId
              ].setView(
                [
                  lat,
                  lng
                ],
                Math.max(
                  state.maps[
                    mapId
                  ].getZoom(),
                  13
                )
              );

            }


            updateStatus(
              statusId,
              (
                label ||
                "Location"
              ) +
                " updated."
            );

          },

          function (error) {

            updateStatus(
              statusId,
              getLocationErrorMessage(
                error
              )
            );

          },

          {
            enableHighAccuracy:
              true,

            maximumAge:
              15000,

            timeout:
              15000
          }
        );


      state.watchIds[key] =
        watchId;

  };


  function stopLiveLocationWatch(
    key
  ) {

    const watchId =
      state.watchIds[key];


    if (
      watchId ===
      undefined
    ) {

      return;

    }


    try {

      navigator.geolocation.clearWatch(
        watchId
      );

    } catch (error) {
      /* Ignore cleanup errors. */
    }


    delete state.watchIds[
      key
    ];

  }


  window.stopLiveLocationWatch =
    stopLiveLocationWatch;


  /* =======================================================
     USER MARKER
     ======================================================= */

  function addUserMarker(
    mapId,
    latitude,
    longitude,
    label
  ) {

    const map =
      state.maps[mapId];


    if (!map) {
      return;
    }


    const icon =
      createMarkerIcon(
        "user"
      );


    if (
      state.markers[
        mapId
      ].userMarker
    ) {

      state.markers[
        mapId
      ].userMarker.setLatLng(
        [
          latitude,
          longitude
        ]
      );

      return;

    }


    const marker =
      L.marker(
        [
          latitude,
          longitude
        ],
        {
          icon
        }
      )
      .addTo(
        map
      )
      .bindPopup(
        `
          <strong>
            ${escapeHTML(
              label ||
              "Your Location"
            )}
          </strong>
          <br>
          <span>
            Location used for nearby resource discovery.
          </span>
        `
      );


    state.markers[
      mapId
    ].userMarker =
      marker;

  }


  /* =======================================================
     BLOOD CENTRE MARKERS
     ======================================================= */

  window.loadLiveBloodBankMarkers =
    function (
      latitude,
      longitude
    ) {

      loadMarkersForType(
        "blood-centre",
        latitude,
        longitude
      );

    };


  function loadMarkersForType(
    type,
    latitude,
    longitude
  ) {

    const center = {
      lat:
        Number.isFinite(
          Number(latitude)
        )
          ? Number(latitude)
          : (
              state.userLocation
                ? state.userLocation.lat
                : CONFIG.defaultCenter.lat
            ),

      lng:
        Number.isFinite(
          Number(longitude)
        )
          ? Number(longitude)
          : (
              state.userLocation
                ? state.userLocation.lng
                : CONFIG.defaultCenter.lng
            )
    };


    Object.keys(
      state.maps
    )
      .forEach(
        function (mapId) {

          const mapType =
            document
              .getElementById(
                mapId
              )
              ?.dataset
              .mapType;


          if (
            normalizeMapType(
              mapType
            ) ===
            normalizeMapType(
              type
            )
          ) {

            renderResourceMarkers(
              mapId,
              type,
              center
            );

          }

        }
      );

  }


  /* =======================================================
     RENDER RESOURCE MARKERS
     ======================================================= */

  function renderResourceMarkers(
    mapId,
    type,
    center
  ) {

    const map =
      state.maps[
        mapId
      ];


    if (!map) {
      return;
    }


    clearResourceMarkers(
      mapId
    );


    let records = [];


    if (
      type ===
      "blood-centre"
    ) {

      records =
        state.datasets
          .bloodCentres;

    } else if (
      type ===
      "camp"
    ) {

      records =
        state.datasets
          .camps;

    } else if (
      type ===
      "donor"
    ) {

      records =
        state.datasets
          .donors;

    }


    records
      .filter(
        function (record) {

          return hasCoordinates(
            record
          );

        }
      )
      .forEach(
        function (record) {

          const lat =
            getLatitude(
              record
            );

          const lng =
            getLongitude(
              record
            );


          const marker =
            L.marker(
              [
                lat,
                lng
              ],
              {
                icon:
                  createMarkerIcon(
                    type
                  )
              }
            )
            .addTo(
              map
            );


          marker.bindPopup(
            createPopup(
              record,
              type
            )
          );


          state.markers[
            mapId
          ].push(
            marker
          );

        }
      );


    addUserMarker(
      mapId,
      center.lat,
      center.lng,
      "Search Location"
    );

  }


  /* =======================================================
     ALL MAPS
     ======================================================= */

  function refreshAllMaps() {

    Object.keys(
      state.maps
    )
      .forEach(
        function (mapId) {

          const element =
            document.getElementById(
              mapId
            );


          if (!element) {
            return;
          }


          const type =
            normalizeMapType(
              element.dataset
                .mapType
            );


          const center =
            state.userLocation ||
            CONFIG.defaultCenter;


          if (
            type ===
            "blood-centre"
          ) {

            renderResourceMarkers(
              mapId,
              "blood-centre",
              center
            );

          } else if (
            type ===
            "camp"
          ) {

            renderResourceMarkers(
              mapId,
              "camp",
              center
            );

          } else if (
            type ===
            "donor"
          ) {

            renderResourceMarkers(
              mapId,
              "donor",
              center
            );

          } else {

            addUserMarker(
              mapId,
              center.lat,
              center.lng,
              "Search Location"
            );

          }

        }
      );

  }


  /* =======================================================
     MAP LEGEND
     ======================================================= */

  function addMapLegend(
    mapId,
    type
  ) {

    const element =
      document.getElementById(
        mapId
      );


    if (!element) {
      return;
    }


    if (
      element.querySelector(
        ".vital-loop-map-note"
      )
    ) {

      return;

    }


    const note =
      document.createElement(
        "div"
      );


    note.className =
      "vital-loop-map-note";


    note.innerHTML = `
      <span aria-hidden="true">ⓘ</span>
      <span>
        ${getMapNote(
          type
        )}
      </span>
    `;


    element.appendChild(
      note
    );

  }


  function getMapNote(
    type
  ) {

    if (
      normalizeMapType(
        type
      ) ===
      "blood-centre"
    ) {

      return "Potential blood resources shown for discovery. Availability must be verified with the authorised facility.";

    }


    if (
      normalizeMapType(
        type
      ) ===
      "donor"
    ) {

      return "Donor locations are demonstration/discovery data unless explicitly verified.";

    }


    if (
      normalizeMapType(
        type
      ) ===
      "camp"
    ) {

      return "Camp information should be verified with the organiser before travel.";

    }


    return "Map information is provided for navigation and discovery.";

  }


  /* =======================================================
     POPUP
     ======================================================= */

  function createPopup(
    record,
    type
  ) {

    const name =
      getRecordName(
        record
      );


    const address =
      getRecordAddress(
        record
      );


    const lat =
      getLatitude(
        record
      );


    const lng =
      getLongitude(
        record
      );


    const mapUrl =
      createGoogleMapsUrl(
        name,
        lat,
        lng
      );


    let note =
      "Information for discovery.";


    if (
      normalizeMapType(
        type
      ) ===
      "blood-centre"
    ) {

      note =
        "Potential resource only. Confirm current availability directly with the authorised centre.";

    } else if (
      normalizeMapType(
        type
      ) ===
      "donor"
    ) {

      note =
        "Donor information requires verification and appropriate coordination.";

    } else if (
      normalizeMapType(
        type
      ) ===
      "camp"
    ) {

      note =
        "Verify date, venue and organiser details before travelling.";

    }


    return `
      <div class="vital-loop-map-popup">

        <strong>
          ${escapeHTML(
            name
          )}
        </strong>

        ${
          address
            ? `
              <p>
                ${escapeHTML(
                  address
                )}
              </p>
            `
            : ""
        }

        <small>
          ${escapeHTML(
            note
          )}
        </small>

        <a
          href="${escapeAttribute(
            mapUrl
          )}"
          target="_blank"
          rel="noopener noreferrer"
          class="map-navigation-link"
        >
          📍 Open Navigation
        </a>

      </div>
    `;

  }


  /* =======================================================
     GOOGLE MAPS URL
     ======================================================= */

  function createGoogleMapsUrl(
    name,
    latitude,
    longitude
  ) {

    const query =
      name +
      " near " +
      latitude +
      "," +
      longitude;


    return (
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(
        query
      )
    );

  }


  /* =======================================================
     CLEAR MARKERS
     ======================================================= */

  function clearResourceMarkers(
    mapId
  ) {

    const map =
      state.maps[
        mapId
      ];


    if (!map) {
      return;
    }


    const markers =
      state.markers[
        mapId
      ] || [];


    markers.forEach(
      function (marker) {

        try {

          map.removeLayer(
            marker
          );

        } catch (error) {
          /* Ignore marker cleanup errors. */
        }

      }
    );


    state.markers[
      mapId
    ] = [];

  }


  /* =======================================================
     MARKER ICON
     ======================================================= */

  function createMarkerIcon(
    type
  ) {

    const colors = {
      user:
        "#d7263d",

      "blood-centre":
        "#c6283d",

      donor:
        "#a91f38",

      camp:
        "#008f83",

      hospital:
        "#2455c3",

      general:
        "#334155"
    };


    const symbols = {
      user:
        "●",

      "blood-centre":
        "✚",

      donor:
        "♥",

      camp:
        "⌁",

      hospital:
        "✚",

      general:
        "•"
    };


    const key =
      normalizeMapType(
        type
      );


    const color =
      colors[key] ||
      colors.general;


    const symbol =
      symbols[key] ||
      symbols.general;


    return L.divIcon(
      {
        className:
          "vital-loop-map-marker",

        html:
          `
            <span
              style="
                display:flex;
                align-items:center;
                justify-content:center;
                width:36px;
                height:36px;
                border-radius:50% 50% 50% 0;
                transform:rotate(-45deg);
                background:${color};
                color:#fff;
                box-shadow:0 8px 18px rgba(0,0,0,.2);
                border:3px solid #fff;
                font-weight:900;
              "
            >
              <span
                style="
                  transform:rotate(45deg);
                  font-size:14px;
                "
              >
                ${symbol}
              </span>
            </span>
          `,

        iconSize:
          [36, 36],

        iconAnchor:
          [18, 36],

        popupAnchor:
          [0, -34]
      }
    );

  }


  /* =======================================================
     DISTANCE
     ======================================================= */

  function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
  ) {

    const earthRadius =
      6371;


    const dLat =
      toRadians(
        lat2 - lat1
      );


    const dLon =
      toRadians(
        lon2 - lon1
      );


    const a =
      Math.sin(
        dLat / 2
      ) ** 2 +
      Math.cos(
        toRadians(lat1)
      ) *
      Math.cos(
        toRadians(lat2)
      ) *
      Math.sin(
        dLon / 2
      ) ** 2;


    const c =
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(
          1 - a
        )
      );


    return (
      earthRadius *
      c
    );

  }


  function toRadians(
    value
  ) {

    return (
      value *
      Math.PI /
      180
    );

  }


  /* =======================================================
     RECORD HELPERS
     ======================================================= */

  function hasCoordinates(
    record
  ) {

    const lat =
      getLatitude(
        record
      );

    const lng =
      getLongitude(
        record
      );


    return (
      Number.isFinite(lat) &&
      Number.isFinite(lng)
    );

  }


  function getLatitude(
    record
  ) {

    return firstNumber(
      record?.latitude,
      record?.lat,
      record?.location?.latitude,
      record?.location?.lat,
      record?.coordinates?.latitude,
      record?.coordinates?.lat
    );

  }


  function getLongitude(
    record
  ) {

    return firstNumber(
      record?.longitude,
      record?.lng,
      record?.lon,
      record?.location?.longitude,
      record?.location?.lng,
      record?.location?.lon,
      record?.coordinates?.longitude,
      record?.coordinates?.lng
    );

  }


  function firstNumber(
    ...values
  ) {

    for (
      const value of values
    ) {

      const number =
        Number(
          value
        );


      if (
        Number.isFinite(
          number
        )
      ) {

        return number;

      }

    }


    return NaN;

  }


  function getRecordName(
    record
  ) {

    return (
      record?.name ||
      record?.title ||
      record?.facilityName ||
      record?.hospitalName ||
      "Vital Loop Resource"
    );

  }


  function getRecordAddress(
    record
  ) {

    if (
      typeof record?.address ===
      "string"
    ) {

      return record.address;

    }


    if (
      record?.address &&
      typeof record.address ===
        "object"
    ) {

      return [
        record.address.line1,
        record.address.line2,
        record.address.city,
        record.address.state
      ]
        .filter(Boolean)
        .join(", ");

    }


    return (
      record?.locationName ||
      record?.city ||
      ""
    );

  }


  /* =======================================================
     NORMALIZE MAP TYPE
     ======================================================= */

  function normalizeMapType(
    type
  ) {

    const value =
      String(
        type || "general"
      )
        .toLowerCase()
        .trim();


    const aliases = {
      bloodbank:
        "blood-centre",

      blood_bank:
        "blood-centre",

      bloodbankmap:
        "blood-centre",

      "blood-centre":
        "blood-centre",

      bloodcentre:
        "blood-centre",

      blood_center:
        "blood-centre",

      donor:
        "donor",

      donors:
        "donor",

      camp:
        "camp",

      camps:
        "camp",

      hospital:
        "hospital",

      hospitals:
        "hospital"
    };


    return (
      aliases[value] ||
      value
    );

  }


  /* =======================================================
     STATUS
     ======================================================= */

  function updateStatus(
    statusId,
    message
  ) {

    if (!statusId) {
      return;
    }


    const element =
      document.getElementById(
        statusId
      );


    if (!element) {
      return;
    }


    element.textContent =
      message;


    element.setAttribute(
      "role",
      "status"
    );

  }


  function showLocationMessage(
    message
  ) {

    document
      .querySelectorAll(
        "[data-location-status]"
      )
      .forEach(
        function (element) {

          element.textContent =
            message;

        }
      );


    updateStatus(
      "bloodBankLocationStatus",
      message
    );

    updateStatus(
      "locationStatus",
      message
    );

  }


  function getLocationErrorMessage(
    error
  ) {

    if (!error) {

      return "Unable to access your location.";

    }


    if (
      error.code ===
      1
    ) {

      return "Location permission was not granted.";

    }


    if (
      error.code ===
      2
    ) {

      return "Your location could not be determined.";

    }


    if (
      error.code ===
      3
    ) {

      return "Location request timed out. Please try again.";

    }


    return "Unable to access your location.";

  }


  /* =======================================================
     EXTERNAL NAVIGATION API
     ======================================================= */

  window.VitalLoopMap =
    {

      init:
        initMap,

      setLocation:
        setUserLocation,

      requestLocation:
        requestUserLocation,

      refresh:
        refreshAllMaps,

      calculateDistance:
        calculateDistance,

      openGoogleMaps:
        function (
          name,
          latitude,
          longitude
        ) {

          const url =
            createGoogleMapsUrl(
              name,
              latitude,
              longitude
            );


          window.open(
            url,
            "_blank",
            "noopener,noreferrer"
          );

        },

      getLocation:
        function () {

          return state.userLocation
            ? {
                ...state.userLocation
              }
            : null;

        },

      getDatasets:
        function () {

          return {
            bloodCentres:
              state.datasets
                .bloodCentres
                .slice(),

            camps:
              state.datasets
                .camps
                .slice(),

            donors:
              state.datasets
                .donors
                .slice()
          };

        }

    };

})();
