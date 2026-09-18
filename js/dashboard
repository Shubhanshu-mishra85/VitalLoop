/* =========================================================
   VITAL LOOP — DASHBOARD CONTROLLER
   js/dashboard.js
   ========================================================= */

(function () {
  "use strict";

  const REQUEST_KEY = "vitalLoopRequest";
  const REQUESTS_KEY = "vitalLoopRequests";
  const DONORS_KEY = "vitalLoopDonors";

  const state = {
    request: null,
    requests: [],
    donors: [],
    centres: [],
    camps: []
  };


  /* =======================================================
     INITIALIZATION
     ======================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    initDashboard
  );


  async function initDashboard() {

    loadLocalData();

    await loadRemoteData();

    renderDashboard();

    bindDashboardActions();

    listenForUpdates();

  }


  /* =======================================================
     LOAD LOCAL DATA
     ======================================================= */

  function loadLocalData() {

    state.request =
      readJSON(
        REQUEST_KEY,
        null
      );

    state.requests =
      readJSON(
        REQUESTS_KEY,
        []
      );

    state.donors =
      readJSON(
        DONORS_KEY,
        []
      );

    if (
      !Array.isArray(
        state.requests
      )
    ) {

      state.requests = [];

    }

    if (
      !Array.isArray(
        state.donors
      )
    ) {

      state.donors = [];

    }

    /*
      Ensure the active request also appears in
      the local history used by the prototype dashboard.
    */

    if (
      state.request &&
      state.request.id
    ) {

      const exists =
        state.requests.some(
          function (item) {

            return (
              item.id ===
              state.request.id
            );

          }
        );

      if (!exists) {

        state.requests.unshift(
          state.request
        );

      }

    }

  }


  /* =======================================================
     LOAD DATA FILES
     ======================================================= */

  async function loadRemoteData() {

    const results =
      await Promise.all([
        fetchJSON(
          "data/blood-centres.json"
        ),
        fetchJSON(
          "data/camps.json"
        )
      ]);

    state.centres =
      normalizeArray(
        results[0]
      );

    state.camps =
      normalizeArray(
        results[1]
      );

  }


  async function fetchJSON(
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
        "Vital Loop dashboard data unavailable:",
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


  /* =======================================================
     DASHBOARD RENDER
     ======================================================= */

  function renderDashboard() {

    renderStats();

    renderRequestSummary();

    renderBloodAvailability();

    renderActivity();

    renderRequestTimeline();

    renderDonorSummary();

    renderLocationSummary();

    renderAnalytics();

    renderPrototypeNotice();

  }


  /* =======================================================
     STATS
     ======================================================= */

  function renderStats() {

    const totalRequests =
      state.requests.length;

    const activeRequests =
      state.requests.filter(
        function (request) {

          return (
            request.statusKey !==
              "resolved" &&
            request.status !==
              "Request Closed"
          );

        }
      ).length;

    const donorCount =
      state.donors.length;

    const centreCount =
      state.centres.length;


    setValue(
      "[data-dashboard-requests]",
      totalRequests
    );

    setValue(
      "[data-total-requests]",
      totalRequests
    );

    setValue(
      "[data-dashboard-active-requests]",
      activeRequests
    );

    setValue(
      "[data-active-requests]",
      activeRequests
    );

    setValue(
      "[data-dashboard-donors]",
      donorCount
    );

    setValue(
      "[data-total-donors]",
      donorCount
    );

    setValue(
      "[data-dashboard-centres]",
      centreCount
    );

    setValue(
      "[data-total-centres]",
      centreCount
    );

  }


  /* =======================================================
     REQUEST SUMMARY
     ======================================================= */

  function renderRequestSummary() {

    if (!state.request) {

      setValue(
        "[data-dashboard-request-status]",
        "No active request"
      );

      setValue(
        "[data-dashboard-request-id]",
        "—"
      );

      setValue(
        "[data-dashboard-request-group]",
        "—"
      );

      setValue(
        "[data-dashboard-request-location]",
        "—"
      );

      return;

    }


    setValue(
      "[data-dashboard-request-status]",
      state.request.status ||
        "Request Created"
    );

    setValue(
      "[data-dashboard-request-id]",
      state.request.id ||
        "—"
    );

    setValue(
      "[data-dashboard-request-group]",
      state.request.bloodGroup ||
        "—"
    );

    setValue(
      "[data-dashboard-request-location]",
      state.request.hospital ||
        state.request.location ||
        "—"
    );

    setValue(
      "[data-dashboard-request-urgency]",
      state.request.urgency ||
        "—"
    );

    setValue(
      "[data-dashboard-request-created]",
      formatDate(
        state.request.createdAt
      )
    );

  }


  /* =======================================================
     BLOOD AVAILABILITY
     ======================================================= */

  function renderBloodAvailability() {

    const container =
      document.querySelector(
        "[data-blood-availability]"
      );

    if (!container) {
      return;
    }


    /*
      The dashboard intentionally presents centre/resource
      information rather than claiming live blood inventory.
    */

    const groups =
      [
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-"
      ];


    const counts =
      {};

    groups.forEach(
      function (group) {

        counts[group] = 0;

      }
    );


    state.centres.forEach(
      function (centre) {

        const group =
          centre.bloodGroup ||
          centre.blood_group ||
          centre.group;

        if (
          group &&
          Object.prototype.hasOwnProperty.call(
            counts,
            group
          )
        ) {

          counts[group] += 1;

        }

      }
    );


    const max =
      Math.max(
        1,
        ...Object.values(
          counts
        )
      );


    container.innerHTML =
      groups
        .map(
          function (group) {

            const count =
              counts[group];

            const width =
              Math.round(
                (
                  count /
                  max
                ) * 100
              );

            return `
              <div class="blood-availability-row">

                <div class="blood-availability-label">
                  <strong>
                    ${escapeHTML(group)}
                  </strong>

                  <span>
                    ${count}
                    resource record${
                      count === 1
                        ? ""
                        : "s"
                    }
                  </span>
                </div>

                <div class="blood-availability-track">

                  <span
                    class="blood-availability-bar"
                    style="width:${width}%"
                  ></span>

                </div>

              </div>
            `;

          }
        )
        .join("");

  }


  /* =======================================================
     ACTIVITY
     ======================================================= */

  function renderActivity() {

    const container =
      document.querySelector(
        "[data-dashboard-activity]"
      );

    if (!container) {
      return;
    }


    const activity =
      state.requests
        .slice()
        .sort(
          function (a, b) {

            return (
              new Date(
                b.updatedAt ||
                b.createdAt ||
                0
              ) -
              new Date(
                a.updatedAt ||
                a.createdAt ||
                0
              )
            );

          }
        )
        .slice(0, 6);


    if (!activity.length) {

      container.innerHTML = `
        <div class="dashboard-empty-state">
          <span>📋</span>
          <p>
            No request activity yet.
          </p>
        </div>
      `;

      return;

    }


    container.innerHTML =
      activity
        .map(
          function (item) {

            return `
              <article class="dashboard-activity-item">

                <div class="activity-icon">
                  ${getActivityIcon(
                    item.statusKey
                  )}
                </div>

                <div class="activity-content">

                  <strong>
                    ${escapeHTML(
                      item.id ||
                      "Request"
                    )}
                  </strong>

                  <span>
                    ${escapeHTML(
                      item.status ||
                      "Request Created"
                    )}
                  </span>

                </div>

                <time>
                  ${escapeHTML(
                    formatRelativeDate(
                      item.updatedAt ||
                      item.createdAt
                    )
                  )}
                </time>

              </article>
            `;

          }
        )
        .join("");

  }


  /* =======================================================
     REQUEST TIMELINE
     ======================================================= */

  function renderRequestTimeline() {

    const container =
      document.querySelector(
        "[data-dashboard-request-timeline]"
      );

    if (!container) {
      return;
    }


    if (!state.request) {

      container.innerHTML = `
        <div class="dashboard-empty-state">
          <span>🚨</span>
          <p>
            Create an emergency request to view its coordination journey.
          </p>
        </div>
      `;

      return;

    }


    const flow = [
      {
        key: "created",
        label: "Request Created"
      },
      {
        key: "matching",
        label: "Potential Resources"
      },
      {
        key: "verification",
        label: "Verification"
      },
      {
        key: "coordination",
        label: "Healthcare Coordination"
      },
      {
        key: "resolved",
        label: "Closed"
      }
    ];


    const currentIndex =
      getStatusIndex(
        state.request
      );


    container.innerHTML =
      flow
        .map(
          function (item, index) {

            let stateClass =
              "pending";

            if (
              index <
              currentIndex
            ) {

              stateClass =
                "complete";

            } else if (
              index ===
              currentIndex
            ) {

              stateClass =
                "current";

            }


            return `
              <div
                class="request-timeline-step ${stateClass}"
              >

                <div class="request-timeline-marker">

                  ${
                    stateClass ===
                    "complete"
                      ? "✓"
                      : index + 1
                  }

                </div>

                <span>
                  ${escapeHTML(
                    item.label
                  )}
                </span>

              </div>
            `;

          }
        )
        .join("");

  }


  function getStatusIndex(
    request
  ) {

    if (
      Number.isFinite(
        Number(
          request.statusStep
        )
      )
    ) {

      return Math.max(
        0,
        Math.min(
          4,
          Number(
            request.statusStep
          )
        )
      );

    }


    const status =
      String(
        request.statusKey ||
        ""
      );


    const map = {
      created: 0,
      matching: 1,
      verification: 2,
      coordination: 3,
      resolved: 4
    };


    return Object.prototype.hasOwnProperty.call(
      map,
      status
    )
      ? map[status]
      : 0;

  }


  /* =======================================================
     DONOR SUMMARY
     ======================================================= */

  function renderDonorSummary() {

    const container =
      document.querySelector(
        "[data-dashboard-donor-summary]"
      );

    if (!container) {
      return;
    }


    const available =
      state.donors.filter(
        function (donor) {

          return (
            donor.availability ===
            "available"
          );

        }
      ).length;


    const unavailable =
      state.donors.length -
      available;


    container.innerHTML = `
      <div class="dashboard-donor-stat">
        <span class="dashboard-stat-number">
          ${available}
        </span>

        <span class="dashboard-stat-label">
          Available for coordination
        </span>
      </div>

      <div class="dashboard-donor-stat">
        <span class="dashboard-stat-number">
          ${unavailable}
        </span>

        <span class="dashboard-stat-label">
          Currently unavailable
        </span>
      </div>
    `;

  }


  /* =======================================================
     LOCATION SUMMARY
     ======================================================= */

  function renderLocationSummary() {

    const container =
      document.querySelector(
        "[data-dashboard-location]"
      );

    if (!container) {
      return;
    }


    const requestLocation =
      state.request &&
      state.request.locationData;


    if (
      requestLocation &&
      Number.isFinite(
        Number(
          requestLocation.latitude
        )
      ) &&
      Number.isFinite(
        Number(
          requestLocation.longitude
        )
      )
    ) {

      container.innerHTML = `
        <div class="dashboard-location-active">

          <span class="location-pulse">
            ●
          </span>

          <div>
            <strong>
              Request location captured
            </strong>

            <p>
              ${escapeHTML(
                Number(
                  requestLocation.latitude
                ).toFixed(4)
              )},
              ${escapeHTML(
                Number(
                  requestLocation.longitude
                ).toFixed(4)
              )}
            </p>
          </div>

        </div>
      `;

      return;

    }


    container.innerHTML = `
      <div class="dashboard-location-empty">

        <span>📍</span>

        <div>
          <strong>
            Location not captured
          </strong>

          <p>
            Use location from an emergency or resource search page when needed.
          </p>
        </div>

      </div>
    `;

  }


  /* =======================================================
     ANALYTICS
     ======================================================= */

  function renderAnalytics() {

    const total =
      state.requests.length;

    const resolved =
      state.requests.filter(
        function (request) {

          return (
            request.statusKey ===
            "resolved" ||
            request.status ===
            "Request Closed"
          );

        }
      ).length;

    const active =
      Math.max(
        0,
        total - resolved
      );


    const metrics = {
      total,
      active,
      resolved,
      donors:
        state.donors.length,
      centres:
        state.centres.length,
      camps:
        state.camps.length
    };


    Object.keys(metrics)
      .forEach(
        function (key) {

          setValue(
            "[data-analytics-" +
              key +
              "]",
            metrics[key]
          );

        }
      );


    const completionRate =
      total > 0
        ? Math.round(
            (
              resolved /
              total
            ) * 100
          )
        : 0;


    setValue(
      "[data-analytics-completion]",
      completionRate + "%"
    );


    renderSimpleAnalyticsBars(
      metrics
    );

  }


  function renderSimpleAnalyticsBars(
    metrics
  ) {

    const container =
      document.querySelector(
        "[data-dashboard-analytics-bars]"
      );

    if (!container) {
      return;
    }


    const values = [
      {
        label: "Requests",
        value: metrics.total
      },
      {
        label: "Donors",
        value: metrics.donors
      },
      {
        label: "Blood Centres",
        value: metrics.centres
      },
      {
        label: "Camps",
        value: metrics.camps
      }
    ];


    const max =
      Math.max(
        1,
        ...values.map(
          function (item) {
            return item.value;
          }
        )
      );


    container.innerHTML =
      values
        .map(
          function (item) {

            const width =
              Math.round(
                (
                  item.value /
                  max
                ) * 100
              );


            return `
              <div class="analytics-bar-row">

                <div class="analytics-bar-label">
                  <span>
                    ${escapeHTML(
                      item.label
                    )}
                  </span>

                  <strong>
                    ${item.value}
                  </strong>
                </div>

                <div class="analytics-bar-track">

                  <span
                    class="analytics-bar-fill"
                    style="width:${width}%"
                  ></span>

                </div>

              </div>
            `;

          }
        )
        .join("");

  }


  /* =======================================================
     PROTOTYPE NOTICE
     ======================================================= */

  function renderPrototypeNotice() {

    document
      .querySelectorAll(
        "[data-prototype-notice]"
      )
      .forEach(
        function (element) {

          element.textContent =
            "Dashboard data shown here is prototype/demo information or locally stored activity. It does not represent guaranteed live blood inventory.";

        }
      );

  }


  /* =======================================================
     ACTIONS
     ======================================================= */

  function bindDashboardActions() {

    document
      .querySelectorAll(
        "[data-dashboard-refresh]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            async function () {

              button.disabled =
                true;

              button.classList.add(
                "is-refreshing"
              );

              loadLocalData();

              await loadRemoteData();

              renderDashboard();

              setValue(
                "[data-dashboard-last-updated]",
                "Updated just now"
              );

              setTimeout(
                function () {

                  button.disabled =
                    false;

                  button.classList.remove(
                    "is-refreshing"
                  );

                },
                500
              );

            }
          );

        }
      );


    document
      .querySelectorAll(
        "[data-dashboard-print]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              window.print();

            }
          );

        }
      );


    document
      .querySelectorAll(
        "[data-dashboard-clear]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            clearDashboardRequest
          );

        }
      );

  }


  /* =======================================================
     EVENTS
     ======================================================= */

  function listenForUpdates() {

    document.addEventListener(
      "vitalLoopRequestCreated",
      function () {

        loadLocalData();

        renderDashboard();

      }
    );


    document.addEventListener(
      "vitalLoopRequestUpdated",
      function () {

        loadLocalData();

        renderDashboard();

      }
    );


    window.addEventListener(
      "storage",
      function (event) {

        if (
          event.key === REQUEST_KEY ||
          event.key === REQUESTS_KEY ||
          event.key === DONORS_KEY
        ) {

          loadLocalData();

          renderDashboard();

        }

      }
    );

  }


  /* =======================================================
     CLEAR DASHBOARD REQUEST
     ======================================================= */

  function clearDashboardRequest() {

    try {

      localStorage.removeItem(
        REQUEST_KEY
      );

      localStorage.removeItem(
        "vitalLoopCurrentRequestId"
      );

      state.request =
        null;

      renderDashboard();

      showMessage(
        "Current request removed from this device."
      );

    } catch (error) {

      showMessage(
        "Unable to remove current request."
      );

    }

  }


  /* =======================================================
     ACTIVITY ICON
     ======================================================= */

  function getActivityIcon(
    status
  ) {

    const icons = {
      created: "🚨",
      matching: "🎯",
      verification: "✓",
      coordination: "🏥",
      resolved: "✓"
    };

    return (
      icons[status] ||
      "📋"
    );

  }


  /* =======================================================
     DATE HELPERS
     ======================================================= */

  function formatDate(
    value
  ) {

    if (!value) {
      return "—";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return "—";

    }

    return date.toLocaleString(
      undefined,
      {
        dateStyle: "medium",
        timeStyle: "short"
      }
    );

  }


  function formatRelativeDate(
    value
  ) {

    if (!value) {
      return "Unknown time";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return "Unknown time";

    }

    const difference =
      Date.now() -
      date.getTime();

    const minute =
      60 * 1000;

    const hour =
      60 * minute;

    const day =
      24 * hour;


    if (
      difference < minute
    ) {

      return "Just now";

    }

    if (
      difference < hour
    ) {

      return (
        Math.floor(
          difference / minute
        ) +
        " min ago"
      );

    }

    if (
      difference < day
    ) {

      return (
        Math.floor(
          difference / hour
        ) +
        " hr ago"
      );

    }

    if (
      difference < 7 * day
    ) {

      return (
        Math.floor(
          difference / day
        ) +
        " days ago"
      );

    }

    return formatDate(
      value
    );

  }


  /* =======================================================
     STORAGE
     ======================================================= */

  function readJSON(
    key,
    fallback
  ) {

    try {

      const raw =
        localStorage.getItem(
          key
        );

      if (!raw) {
        return fallback;
      }

      return JSON.parse(
        raw
      );

    } catch (error) {

      return fallback;

    }

  }


  /* =======================================================
     DOM HELPERS
     ======================================================= */

  function setValue(
    selector,
    value
  ) {

    document
      .querySelectorAll(
        selector
      )
      .forEach(
        function (element) {

          element.textContent =
            value;

        }
      );

  }


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
        "vitalLoopDashboardToast"
      );


    if (!toast) {

      toast =
        document.createElement(
          "div"
        );

      toast.id =
        "vitalLoopDashboardToast";

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

  window.VitalLoopDashboard = {

    refresh:
      async function () {

        loadLocalData();

        await loadRemoteData();

        renderDashboard();

        return {
          request:
            state.request,

          requests:
            state.requests,

          donors:
            state.donors,

          centres:
            state.centres,

          camps:
            state.camps
        };

      },

    getData:
      function () {

        return {
          request:
            state.request,

          requests:
            state.requests.slice(),

          donors:
            state.donors.slice(),

          centres:
            state.centres.slice(),

          camps:
            state.camps.slice()
        };

      }

  };

})();
