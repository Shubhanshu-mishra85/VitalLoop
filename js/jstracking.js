/* =========================================================
   VITAL LOOP — REQUEST TRACKING
   js/tracking.js
   ========================================================= */

(function () {
  "use strict";

  const STORAGE_KEY = "vitalLoopRequest";

  const STATUS_FLOW = [
    {
      key: "created",
      title: "Request Created",
      description:
        "Your emergency request has been recorded."
    },
    {
      key: "matching",
      title: "Finding Potential Resources",
      description:
        "Potential blood resources and coordination options are being identified."
    },
    {
      key: "verification",
      title: "Verification & Coordination",
      description:
        "Availability information requires confirmation through an authorised source."
    },
    {
      key: "coordination",
      title: "Healthcare Coordination",
      description:
        "Coordination with the relevant healthcare facility is in progress."
    },
    {
      key: "resolved",
      title: "Request Closed",
      description:
        "The coordination request has been closed."
    }
  ];

  let currentRequest = null;


  /* =======================================================
     INITIALIZATION
     ======================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    initializeTracking
  );


  function initializeTracking() {

    currentRequest =
      loadCurrentRequest();

    bindActions();

    renderTracking();

    updateLastChecked();

  }


  /* =======================================================
     LOAD REQUEST
     ======================================================= */

  function loadCurrentRequest() {

    try {

      const raw =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (!raw) {
        return null;
      }

      const request =
        JSON.parse(raw);

      if (
        !request ||
        typeof request !== "object"
      ) {
        return null;
      }

      return normalizeRequest(
        request
      );

    } catch (error) {

      console.warn(
        "Vital Loop: unable to load request.",
        error
      );

      return null;

    }

  }


  /* =======================================================
     NORMALIZE REQUEST
     ======================================================= */

  function normalizeRequest(
    request
  ) {

    let statusKey =
      request.statusKey;

    /*
      Supports older request objects that may
      contain only statusStep or status.
    */

    if (
      !statusKey &&
      Number.isFinite(
        Number(request.statusStep)
      )
    ) {

      const index =
        Math.max(
          0,
          Math.min(
            STATUS_FLOW.length - 1,
            Number(
              request.statusStep
            )
          )
        );

      statusKey =
        STATUS_FLOW[index].key;

    }

    if (!statusKey) {
      statusKey = "created";
    }

    const statusIndex =
      STATUS_FLOW.findIndex(
        function (item) {
          return item.key === statusKey;
        }
      );

    return {
      ...request,

      statusKey,

      statusStep:
        statusIndex >= 0
          ? statusIndex
          : 0,

      status:
        statusIndex >= 0
          ? STATUS_FLOW[
              statusIndex
            ].title
          : (
              request.status ||
              "Request Created"
            )
    };

  }


  /* =======================================================
     RENDER
     ======================================================= */

  function renderTracking() {

    if (!currentRequest) {

      showEmptyState();

      return;

    }

    hideEmptyState();

    renderRequestDetails();

    renderTimeline();

    renderProgress();

    renderStatusBadge();

  }


  /* =======================================================
     REQUEST DETAILS
     ======================================================= */

  function renderRequestDetails() {

    setText(
      "[data-tracking-request-id]",
      currentRequest.id ||
      "—"
    );

    setText(
      "[data-request-id]",
      currentRequest.id ||
      "—"
    );

    setText(
      "[data-tracking-status]",
      currentRequest.status ||
      "Request Created"
    );

    setText(
      "[data-request-status]",
      currentRequest.status ||
      "Request Created"
    );

    setText(
      "[data-tracking-blood-group]",
      currentRequest.bloodGroup ||
      "—"
    );

    setText(
      "[data-request-blood-group]",
      currentRequest.bloodGroup ||
      "—"
    );

    setText(
      "[data-tracking-units]",
      currentRequest.units ||
      "—"
    );

    setText(
      "[data-request-units]",
      currentRequest.units ||
      "—"
    );

    setText(
      "[data-tracking-hospital]",
      currentRequest.hospital ||
      currentRequest.location ||
      "—"
    );

    setText(
      "[data-request-hospital]",
      currentRequest.hospital ||
      currentRequest.location ||
      "—"
    );

    setText(
      "[data-tracking-urgency]",
      currentRequest.urgency ||
      "—"
    );

    setText(
      "[data-tracking-created]",
      formatDate(
        currentRequest.createdAt
      )
    );

    setText(
      "[data-tracking-updated]",
      formatDate(
        currentRequest.updatedAt
      )
    );

  }


  /* =======================================================
     TIMELINE
     ======================================================= */

  function renderTimeline() {

    const timeline =
      document.querySelector(
        "[data-tracking-timeline]"
      );

    if (!timeline) {
      return;
    }

    timeline.innerHTML =
      STATUS_FLOW.map(
        function (
          status,
          index
        ) {

          return createTimelineItem(
            status,
            index
          );

        }
      ).join("");

  }


  function createTimelineItem(
    status,
    index
  ) {

    const currentIndex =
      Number(
        currentRequest.statusStep
      );

    let state =
      "pending";

    if (
      index <
      currentIndex
    ) {

      state =
        "complete";

    } else if (
      index ===
      currentIndex
    ) {

      state =
        "current";

    }

    return `
      <div
        class="tracking-step ${state}"
        data-status-key="${escapeHTML(
          status.key
        )}"
      >

        <div class="tracking-step-marker">

          ${
            state === "complete"
              ? "✓"
              : index + 1
          }

        </div>

        <div class="tracking-step-content">

          <h3>
            ${escapeHTML(
              status.title
            )}
          </h3>

          <p>
            ${escapeHTML(
              status.description
            )}
          </p>

          ${
            state === "current"
              ? `
                <span class="tracking-current-label">
                  Current stage
                </span>
              `
              : ""
          }

        </div>

      </div>
    `;

  }


  /* =======================================================
     PROGRESS
     ======================================================= */

  function renderProgress() {

    const currentIndex =
      Number(
        currentRequest.statusStep
      );

    const total =
      STATUS_FLOW.length - 1;

    const percentage =
      total > 0
        ? Math.round(
            (
              currentIndex /
              total
            ) * 100
          )
        : 0;

    const progressBars =
      document.querySelectorAll(
        "[data-tracking-progress]"
      );

    progressBars.forEach(
      function (bar) {

        bar.style.width =
          percentage + "%";

        bar.setAttribute(
          "aria-valuenow",
          String(
            percentage
          )
        );

      }
    );

    setText(
      "[data-tracking-progress-value]",
      percentage + "%"
    );

  }


  /* =======================================================
     STATUS BADGE
     ======================================================= */

  function renderStatusBadge() {

    const badges =
      document.querySelectorAll(
        "[data-tracking-status-badge]"
      );

    badges.forEach(
      function (badge) {

        badge.className =
          "tracking-status-badge";

        badge.classList.add(
          "status-" +
          currentRequest.statusKey
        );

        badge.textContent =
          currentRequest.status ||
          "Request Created";

      }
    );

  }


  /* =======================================================
     EMPTY STATE
     ======================================================= */

  function showEmptyState() {

    document
      .querySelectorAll(
        "[data-no-tracking-request]"
      )
      .forEach(
        function (element) {

          element.hidden =
            false;

        }
      );

    document
      .querySelectorAll(
        "[data-tracking-content]"
      )
      .forEach(
        function (element) {

          element.hidden =
            true;

        }
      );

  }


  function hideEmptyState() {

    document
      .querySelectorAll(
        "[data-no-tracking-request]"
      )
      .forEach(
        function (element) {

          element.hidden =
            true;

        }
      );

    document
      .querySelectorAll(
        "[data-tracking-content]"
      )
      .forEach(
        function (element) {

          element.hidden =
            false;

        }
      );

  }


  /* =======================================================
     ACTIONS
     ======================================================= */

  function bindActions() {

    document
      .querySelectorAll(
        "[data-refresh-tracking]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            refreshTracking
          );

        }
      );


    document
      .querySelectorAll(
        "[data-copy-request-id]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            copyRequestId
          );

        }
      );


    document
      .querySelectorAll(
        "[data-clear-tracking-request]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            clearRequest
          );

        }
      );


    document
      .querySelectorAll(
        "[data-demo-next-status]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            advanceDemoStatus
          );

        }
      );

  }


  /* =======================================================
     REFRESH
     ======================================================= */

  function refreshTracking() {

    const button =
      document.querySelector(
        "[data-refresh-tracking]"
      );

    if (button) {

      button.disabled =
        true;

      button.classList.add(
        "is-refreshing"
      );

    }

    currentRequest =
      loadCurrentRequest();

    renderTracking();

    updateLastChecked();

    setTimeout(
      function () {

        if (button) {

          button.disabled =
            false;

          button.classList.remove(
            "is-refreshing"
          );

        }

      },
      500
    );

    showMessage(
      currentRequest
        ? "Tracking information refreshed."
        : "No active request found."
    );

  }


  /* =======================================================
     LAST CHECKED
     ======================================================= */

  function updateLastChecked() {

    const now =
      new Date();

    const value =
      now.toLocaleTimeString(
        undefined,
        {
          hour: "2-digit",
          minute: "2-digit"
        }
      );

    setText(
      "[data-last-checked]",
      "Last checked: " +
      value
    );

  }


  /* =======================================================
     COPY REQUEST ID
     ======================================================= */

  async function copyRequestId() {

    if (
      !currentRequest ||
      !currentRequest.id
    ) {

      showMessage(
        "No request ID available."
      );

      return;

    }

    const id =
      currentRequest.id;

    try {

      if (
        navigator.clipboard &&
        navigator.clipboard.writeText
      ) {

        await navigator.clipboard.writeText(
          id
        );

      } else {

        fallbackCopy(
          id
        );

      }

      showMessage(
        "Request ID copied."
      );

    } catch (error) {

      showMessage(
        "Unable to copy request ID."
      );

    }

  }


  function fallbackCopy(
    text
  ) {

    const input =
      document.createElement(
        "textarea"
      );

    input.value =
      text;

    input.style.position =
      "fixed";

    input.style.opacity =
      "0";

    document.body.appendChild(
      input
    );

    input.focus();

    input.select();

    document.execCommand(
      "copy"
    );

    input.remove();

  }


  /* =======================================================
     CLEAR REQUEST
     ======================================================= */

  function clearRequest() {

    try {

      localStorage.removeItem(
        STORAGE_KEY
      );

      localStorage.removeItem(
        "vitalLoopCurrentRequestId"
      );

      currentRequest =
        null;

      renderTracking();

      showMessage(
        "Current request removed from this device."
      );

    } catch (error) {

      showMessage(
        "Unable to remove the current request."
      );

    }

  }


  /* =======================================================
     DEMO STATUS
     ======================================================= */

  function advanceDemoStatus() {

    if (!currentRequest) {

      showMessage(
        "Create a request first."
      );

      return;

    }

    const currentIndex =
      Number(
        currentRequest.statusStep
      );

    const nextIndex =
      Math.min(
        currentIndex + 1,
        STATUS_FLOW.length - 1
      );

    const nextStatus =
      STATUS_FLOW[
        nextIndex
      ];

    currentRequest.statusStep =
      nextIndex;

    currentRequest.statusKey =
      nextStatus.key;

    currentRequest.status =
      nextStatus.title;

    currentRequest.updatedAt =
      new Date().toISOString();

    saveCurrentRequest();

    renderTracking();

    showMessage(
      "Demo status updated."
    );

  }


  /* =======================================================
     SAVE CURRENT REQUEST
     ======================================================= */

  function saveCurrentRequest() {

    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          currentRequest
        )
      );

      updateHistory();

    } catch (error) {

      console.warn(
        "Vital Loop: unable to update request.",
        error
      );

    }

  }


  /* =======================================================
     UPDATE HISTORY
     ======================================================= */

  function updateHistory() {

    const HISTORY_KEY =
      "vitalLoopRequests";

    try {

      const raw =
        localStorage.getItem(
          HISTORY_KEY
        );

      let history =
        raw
          ? JSON.parse(raw)
          : [];

      if (!Array.isArray(history)) {
        history = [];
      }

      const index =
        history.findIndex(
          function (item) {

            return (
              item.id ===
              currentRequest.id
            );

          }
        );

      if (index >= 0) {

        history[index] =
          currentRequest;

      } else {

        history.unshift(
          currentRequest
        );

      }

      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(
          history.slice(0, 20)
        )
      );

    } catch (error) {
      /* Storage history is optional. */
    }

  }


  /* =======================================================
     HELPERS
     ======================================================= */

  function setText(
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
        "vitalLoopTrackingToast"
      );

    if (!toast) {

      toast =
        document.createElement(
          "div"
        );

      toast.id =
        "vitalLoopTrackingToast";

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

  window.VitalLoopTracking = {

    getCurrentRequest:
      function () {

        return loadCurrentRequest();

      },

    refresh:
      function () {

        currentRequest =
          loadCurrentRequest();

        renderTracking();

        return currentRequest;

      },

    getStatusFlow:
      function () {

        return STATUS_FLOW.slice();

      },

    updateStatus:
      function (
        statusKey
      ) {

        if (!currentRequest) {
          return null;
        }

        const index =
          STATUS_FLOW.findIndex(
            function (item) {
              return (
                item.key ===
                statusKey
              );
            }
          );

        if (index < 0) {
          return currentRequest;
        }

        currentRequest.statusStep =
          index;

        currentRequest.statusKey =
          statusKey;

        currentRequest.status =
          STATUS_FLOW[index].title;

        currentRequest.updatedAt =
          new Date().toISOString();

        saveCurrentRequest();

        renderTracking();

        return currentRequest;

      }

  };

})();
