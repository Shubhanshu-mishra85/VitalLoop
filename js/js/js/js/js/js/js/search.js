/* =========================================================
   VITAL LOOP — SMART SEARCH
   js/search.js
   ========================================================= */

(function () {
  "use strict";

  const DATA_SOURCES = {
    bloodCentres: "data/blood-centres.json",
    camps: "data/camps.json",
    demo: "data/demo-data.json"
  };

  const state = {
    bloodCentres: [],
    camps: [],
    donors: [],
    activeType: "all",
    query: "",
    location: null,
    loading: false
  };


  /* =======================================================
     INITIALIZATION
     ======================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    initSearch
  );


  async function initSearch() {

    bindSearchForms();

    bindFilters();

    bindLocationButtons();

    await loadSearchData();

    renderInitialResults();

  }


  /* =======================================================
     SEARCH FORMS
     ======================================================= */

  function bindSearchForms() {

    document
      .querySelectorAll(
        "[data-vital-search-form]"
      )
      .forEach(
        function (form) {

          form.addEventListener(
            "submit",
            function (event) {

              event.preventDefault();

              const input =
                form.querySelector(
                  "input[type='search'], input[name='search'], input"
                );

              state.query =
                input
                  ? String(
                      input.value || ""
                    ).trim()
                  : "";

              performSearch();

            }
          );

        }
      );


    document
      .querySelectorAll(
        "[data-vital-search-input]"
      )
      .forEach(
        function (input) {

          input.addEventListener(
            "input",
            debounce(
              function () {

                state.query =
                  String(
                    input.value || ""
                  ).trim();

                if (
                  state.query.length >= 2 ||
                  state.query.length === 0
                ) {

                  performSearch();

                }

              },
              250
            )
          );

        }
      );

  }


  /* =======================================================
     FILTERS
     ======================================================= */

  function bindFilters() {

    document
      .querySelectorAll(
        "[data-search-type]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              state.activeType =
                button.dataset.searchType ||
                "all";

              updateActiveFilter(
                button
              );

              performSearch();

            }
          );

        }
      );

  }


  function updateActiveFilter(
    activeButton
  ) {

    document
      .querySelectorAll(
        "[data-search-type]"
      )
      .forEach(
        function (button) {

          const isActive =
            button === activeButton;

          button.classList.toggle(
            "active",
            isActive
          );

          button.setAttribute(
            "aria-pressed",
            String(
              isActive
            )
          );

        }
      );

  }


  /* =======================================================
     LOCATION
     ======================================================= */

  function bindLocationButtons() {

    document
      .querySelectorAll(
        "[data-search-location]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              getCurrentLocation(
                button
              );

            }
          );

        }
      );

  }


  function getCurrentLocation(
    button
  ) {

    if (
      !navigator.geolocation
    ) {

      showMessage(
        "Location is not supported by this browser."
      );

      return;

    }

    const originalText =
      button.textContent;

    button.disabled =
      true;

    button.textContent =
      "Finding location...";


    navigator.geolocation.getCurrentPosition(

      function (position) {

        state.location = {
          latitude:
            position.coords.latitude,

          longitude:
            position.coords.longitude,

          accuracy:
            position.coords.accuracy
        };

        button.disabled =
          false;

        button.textContent =
          "✓ Location Added";

        setLocationStatus(
          "Current device location available."
        );

        performSearch();

      },

      function (error) {

        let message =
          "Unable to access your location.";

        if (
          error &&
          error.code === 1
        ) {

          message =
            "Location permission was not granted.";

        } else if (
          error &&
          error.code === 2
        ) {

          message =
            "Current location could not be determined.";

        } else if (
          error &&
          error.code === 3
        ) {

          message =
            "Location request timed out.";

        }

        button.disabled =
          false;

        button.textContent =
          originalText;

        showMessage(
          message
        );

      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }

    );

  }


  function setLocationStatus(
    message
  ) {

    document
      .querySelectorAll(
        "[data-search-location-status]"
      )
      .forEach(
        function (element) {

          element.textContent =
            message;

        }
      );

  }


  /* =======================================================
     DATA LOADING
     ======================================================= */

  async function loadSearchData() {

    state.loading =
      true;

    showLoadingState();

    const [
      centres,
      camps,
      demo
    ] =
      await Promise.all([
        loadJSON(
          DATA_SOURCES.bloodCentres
        ),
        loadJSON(
          DATA_SOURCES.camps
        ),
        loadJSON(
          DATA_SOURCES.demo
        )
      ]);


    state.bloodCentres =
      normalizeArray(
        centres
      );

    state.camps =
      normalizeArray(
        camps
      );


    /*
      Donor records are primarily local prototype data.
    */

    state.donors =
      loadLocalDonors();


    /*
      Some demo files may contain additional centre
      information. Add it only when it is an array.
    */

    if (
      demo &&
      Array.isArray(
        demo.bloodCentres
      )
    ) {

      state.bloodCentres =
        mergeUnique(
          state.bloodCentres,
          demo.bloodCentres
        );

    }


    state.loading =
      false;

  }


  async function loadJSON(
    url
  ) {

    try {

      const response =
        await fetch(
          url,
          {
            cache: "no-store"
          }
        );

      if (!response.ok) {
        return [];
      }

      return await response.json();

    } catch (error) {

      console.warn(
        "Vital Loop search data unavailable:",
        url
      );

      return [];

    }

  }


  function normalizeArray(
    value
  ) {

    if (
      Array.isArray(value)
    ) {
      return value;
    }

    if (
      value &&
      Array.isArray(
        value.data
      )
    ) {
      return value.data;
    }

    return [];

  }


  function loadLocalDonors() {

    try {

      const raw =
        localStorage.getItem(
          "vitalLoopDonors"
        );

      if (!raw) {
        return [];
      }

      const donors =
        JSON.parse(
          raw
        );

      return Array.isArray(
        donors
      )
        ? donors
        : [];

    } catch (error) {

      return [];

    }

  }


  /* =======================================================
     SEARCH
     ======================================================= */

  function performSearch() {

    const results =
      getFilteredResults();

    renderResults(
      results
    );

    updateResultCount(
      results.length
    );

  }


  function getFilteredResults() {

    const query =
      state.query
        .toLowerCase()
        .trim();


    const all = [];


    if (
      state.activeType === "all" ||
      state.activeType === "blood" ||
      state.activeType === "blood-centres" ||
      state.activeType === "centres"
    ) {

      state.bloodCentres.forEach(
        function (item) {

          all.push(
            normalizeCentre(
              item
            )
          );

        }
      );

    }


    if (
      state.activeType === "all" ||
      state.activeType === "donor" ||
      state.activeType === "donors"
    ) {

      state.donors.forEach(
        function (item) {

          all.push(
            normalizeDonor(
              item
            )
          );

        }
      );

    }


    if (
      state.activeType === "all" ||
      state.activeType === "camp" ||
      state.activeType === "camps"
    ) {

      state.camps.forEach(
        function (item) {

          all.push(
            normalizeCamp(
              item
            )
          );

        }
      );

    }


    let filtered =
      all.filter(
        function (item) {

          return matchesQuery(
            item,
            query
          );

        }
      );


    if (
      state.location
    ) {

      filtered =
        filtered
          .map(
            function (item) {

              if (
                item.latitude &&
                item.longitude
              ) {

                item.distance =
                  calculateDistance(
                    state.location.latitude,
                    state.location.longitude,
                    Number(item.latitude),
                    Number(item.longitude)
                  );

              }

              return item;

            }
          )
          .sort(
            function (a, b) {

              if (
                typeof a.distance !==
                  "number"
              ) {
                return 1;
              }

              if (
                typeof b.distance !==
                  "number"
              ) {
                return -1;
              }

              return (
                a.distance -
                b.distance
              );

            }
          );

    }


    return filtered;

  }


  /* =======================================================
     NORMALIZATION
     ======================================================= */

  function normalizeCentre(
    item
  ) {

    return {
      ...item,

      resultType:
        "blood-centre",

      title:
        item.name ||
        item.title ||
        "Blood Centre",

      description:
        item.description ||
        item.address ||
        "Potential blood resource location.",

      address:
        item.address ||
        item.location ||
        "",

      phone:
        item.phone ||
        item.contact ||
        "",

      latitude:
        item.latitude ??
        item.lat ??
        null,

      longitude:
        item.longitude ??
        item.lng ??
        item.lon ??
        null,

      availability:
        item.availability ||
        "Potential availability",

      verified:
        Boolean(
          item.verified
        )
    };

  }


  function normalizeDonor(
    item
  ) {

    return {
      ...item,

      resultType:
        "donor",

      title:
        item.name ||
        "Potential Donor",

      description:
        item.city
          ? "Potential donor in " +
            item.city
          : "Potential donor profile.",

      address:
        item.city ||
        "",

      phone:
        item.contact ||
        "",

      latitude:
        item.location &&
        item.location.latitude
          ? item.location.latitude
          : null,

      longitude:
        item.location &&
        item.location.longitude
          ? item.location.longitude
          : null,

      availability:
        item.availability ===
        "available"
          ? "Available for coordination"
          : "Status unavailable",

      verified:
        item.verificationStatus ===
        "Verified"
    };

  }


  function normalizeCamp(
    item
  ) {

    return {
      ...item,

      resultType:
        "camp",

      title:
        item.name ||
        item.title ||
        "Blood Donation Camp",

      description:
        item.description ||
        item.address ||
        "Blood donation camp information.",

      address:
        item.address ||
        item.location ||
        "",

      phone:
        item.phone ||
        item.contact ||
        "",

      latitude:
        item.latitude ??
        item.lat ??
        null,

      longitude:
        item.longitude ??
        item.lng ??
        item.lon ??
        null,

      availability:
        item.date
          ? "Scheduled"
          : "Camp information",

      verified:
        Boolean(
          item.verified
        )
    };

  }


  /* =======================================================
     QUERY MATCHING
     ======================================================= */

  function matchesQuery(
    item,
    query
  ) {

    if (!query) {
      return true;
    }

    const searchable = [
      item.title,
      item.name,
      item.description,
      item.address,
      item.city,
      item.state,
      item.bloodGroup,
      item.blood_group,
      item.group,
      item.type
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchable.includes(
      query
    );

  }


  /* =======================================================
     RENDER
     ======================================================= */

  function renderInitialResults() {

    if (state.loading) {
      return;
    }

    performSearch();

  }


  function renderResults(
    results
  ) {

    const containers =
      document.querySelectorAll(
        "[data-search-results]"
      );

    if (!containers.length) {
      return;
    }


    containers.forEach(
      function (container) {

        if (!results.length) {

          container.innerHTML =
            emptyStateHTML();

          return;

        }

        container.innerHTML =
          results
            .slice(0, 50)
            .map(
              function (item) {

                return resultCard(
                  item
                );

              }
            )
            .join("");

      }
    );


    bindResultActions();

  }


  function resultCard(
    item
  ) {

    const type =
      getReadableType(
        item.resultType
      );

    const distance =
      typeof item.distance ===
      "number"
        ? formatDistance(
            item.distance
          )
        : "";


    const mapUrl =
      createMapURL(
        item
      );


    return `
      <article
        class="search-result-card"
        data-result-type="${escapeHTML(
          item.resultType
        )}"
      >

        <div class="search-result-top">

          <div
            class="search-result-icon"
            aria-hidden="true"
          >
            ${getTypeIcon(
              item.resultType
            )}
          </div>

          <div class="search-result-heading">

            <span class="search-result-type">
              ${escapeHTML(type)}
            </span>

            <h3>
              ${escapeHTML(
                item.title ||
                "Resource"
              )}
            </h3>

          </div>

          ${
            item.bloodGroup
              ? `
                <span class="blood-group-chip">
                  ${escapeHTML(
                    item.bloodGroup
                  )}
                </span>
              `
              : ""
          }

        </div>


        <p class="search-result-description">
          ${escapeHTML(
            item.description ||
            "Information available through Vital Loop."
          )}
        </p>


        <div class="search-result-meta">

          ${
            item.address
              ? `
                <span>
                  📍
                  ${escapeHTML(
                    item.address
                  )}
                </span>
              `
              : ""
          }

          ${
            distance
              ? `
                <span>
                  ${escapeHTML(
                    distance
                  )}
                </span>
              `
              : ""
          }

          ${
            item.date
              ? `
                <span>
                  📅
                  ${escapeHTML(
                    item.date
                  )}
                </span>
              `
              : ""
          }

        </div>


        <div class="search-result-status">

          <span class="resource-status">
            ${escapeHTML(
              item.availability ||
              "Information available"
            )}
          </span>

          ${
            item.verified
              ? `
                <span class="verified-badge">
                  ✓ Verified
                </span>
              `
              : `
                <span class="unverified-badge">
                  Verification required
                </span>
              `
          }

        </div>


        <div class="search-result-actions">

          ${
            mapUrl
              ? `
                <a
                  href="${escapeHTML(
                    mapUrl
                  )}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="search-action-button"
                >
                  🗺️ Navigate
                </a>
              `
              : ""
          }

          ${
            item.phone
              ? `
                <a
                  href="tel:${escapeHTML(
                    item.phone
                  )}"
                  class="search-action-button secondary"
                >
                  📞 Contact
                </a>
              `
              : ""
          }

        </div>


        <div class="search-safety-note">
          Potential resource information only.
          Confirm availability through an authorised
          blood centre or healthcare facility.
        </div>

      </article>
    `;

  }


  function emptyStateHTML() {

    return `
      <div class="search-empty-state">

        <div class="search-empty-icon">
          🔎
        </div>

        <h3>
          No matching resources found
        </h3>

        <p>
          Try another search term, blood group,
          location, or resource type.
        </p>

        <button
          type="button"
          class="search-clear-button"
          data-clear-search
        >
          Clear Search
        </button>

      </div>
    `;

  }


  /* =======================================================
     RESULT ACTIONS
     ======================================================= */

  function bindResultActions() {

    document
      .querySelectorAll(
        "[data-clear-search]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            clearSearch
          );

        }
      );

  }


  function clearSearch() {

    state.query = "";

    document
      .querySelectorAll(
        "[data-vital-search-input]"
      )
      .forEach(
        function (input) {

          input.value =
            "";

        }
      );

    document
      .querySelectorAll(
        "input[type='search']"
      )
      .forEach(
        function (input) {

          input.value =
            "";

        }
      );

    performSearch();

  }


  /* =======================================================
     LOADING STATE
     ======================================================= */

  function showLoadingState() {

    document
      .querySelectorAll(
        "[data-search-results]"
      )
      .forEach(
        function (container) {

          container.innerHTML = `
            <div class="search-loading-state">
              <div
                class="search-loading-spinner"
                aria-hidden="true"
              ></div>

              <p>
                Finding available information...
              </p>
            </div>
          `;

        }
      );

  }


  /* =======================================================
     RESULT COUNT
     ======================================================= */

  function updateResultCount(
    count
  ) {

    document
      .querySelectorAll(
        "[data-search-result-count]"
      )
      .forEach(
        function (element) {

          element.textContent =
            String(count);

        }
      );

  }


  /* =======================================================
     MAP URL
     ======================================================= */

  function createMapURL(
    item
  ) {

    if (
      item.latitude !== null &&
      item.longitude !== null &&
      Number.isFinite(
        Number(item.latitude)
      ) &&
      Number.isFinite(
        Number(item.longitude)
      )
    ) {

      return (
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(
          Number(item.latitude) +
          "," +
          Number(item.longitude)
        )
      );

    }

    if (
      item.title ||
      item.address
    ) {

      return (
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(
          (
            item.title ||
            ""
          ) +
          " " +
          (
            item.address ||
            ""
          )
        )
      );

    }

    return "";

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
        Math.sqrt(1 - a)
      );

    return (
      earthRadius *
      c
    );

  }


  function toRadians(
    degrees
  ) {

    return (
      degrees *
      Math.PI /
      180
    );

  }


  function formatDistance(
    distance
  ) {

    if (
      distance < 1
    ) {

      return (
        Math.round(
          distance * 1000
        ) +
        " m away"
      );

    }

    return (
      distance.toFixed(1) +
      " km away"
    );

  }


  /* =======================================================
     TYPE HELPERS
     ======================================================= */

  function getReadableType(
    type
  ) {

    const types = {
      "blood-centre":
        "Blood Centre",

      donor:
        "Potential Donor",

      camp:
        "Donation Camp"
    };

    return (
      types[type] ||
      "Resource"
    );

  }


  function getTypeIcon(
    type
  ) {

    const icons = {
      "blood-centre":
        "🩸",

      donor:
        "🤝",

      camp:
        "📅"
    };

    return (
      icons[type] ||
      "📍"
    );

  }


  /* =======================================================
     ARRAY HELPERS
     ======================================================= */

  function mergeUnique(
    first,
    second
  ) {

    const result =
      Array.isArray(first)
        ? first.slice()
        : [];

    const existing =
      new Set(
        result.map(
          function (item) {

            return String(
              item.id ||
              item.name ||
              item.title ||
              ""
            ).toLowerCase();

          }
        )
      );

    second.forEach(
      function (item) {

        const key =
          String(
            item.id ||
            item.name ||
            item.title ||
            ""
          ).toLowerCase();

        if (
          !existing.has(key)
        ) {

          existing.add(key);

          result.push(
            item
          );

        }

      }
    );

    return result;

  }


  /* =======================================================
     DEBOUNCE
     ======================================================= */

  function debounce(
    callback,
    delay
  ) {

    let timer = null;

    return function () {

      const args =
        arguments;

      clearTimeout(
        timer
      );

      timer =
        setTimeout(
          function () {

            callback.apply(
              null,
              args
            );

          },
          delay
        );

    };

  }


  /* =======================================================
     ESCAPE
     ======================================================= */

  function escapeHTML(
    value
  ) {

    return String(
      value ?? ""
    )
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );

  }


  /* =======================================================
     TOAST
     ======================================================= */

  function showMessage(
    message
  ) {

    if (
      typeof window.VitalLoopToast ===
      "function"
    ) {

      window.VitalLoopToast(
        message
      );

      return;

    }

    let toast =
      document.getElementById(
        "vitalLoopSearchToast"
      );

    if (!toast) {

      toast =
        document.createElement(
          "div"
        );

      toast.id =
        "vitalLoopSearchToast";

      Object.assign(
        toast.style,
        {
          position: "fixed",
          left: "50%",
          bottom: "24px",
          transform:
            "translateX(-50%)",
          zIndex: "99999",
          padding:
            "12px 18px",
          borderRadius:
            "999px",
          background:
            "#102027",
          color:
            "#ffffff",
          fontSize:
            "14px",
          fontWeight:
            "700",
          boxShadow:
            "0 12px 30px rgba(0,0,0,.18)"
        }
      );

      document.body.appendChild(
        toast
      );

    }

    toast.textContent =
      message;

    clearTimeout(
      toast._timer
    );

    toast._timer =
      setTimeout(
        function () {

          toast.remove();

        },
        2800
      );

  }


  /* =======================================================
     PUBLIC API
     ======================================================= */

  window.VitalLoopSearch = {

    search:
      function (query) {

        state.query =
          String(
            query || ""
          ).trim();

        performSearch();

        return getFilteredResults();

      },

    setType:
      function (type) {

        state.activeType =
          type || "all";

        performSearch();

      },

    getResults:
      function () {

        return getFilteredResults();

      },

    getState:
      function () {

        return {
          ...state
        };

      },

    refresh:
      async function () {

        await loadSearchData();

        performSearch();

      }

  };

})();
