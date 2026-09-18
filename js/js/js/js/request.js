/* =========================================================
   VITAL LOOP — BLOOD REQUEST MANAGER
   js/request.js
   ========================================================= */

(function () {
  "use strict";

  const STORAGE_KEY = "vitalLoopRequest";
  const REQUESTS_KEY = "vitalLoopRequests";

  const STATUS_FLOW = [
    {
      key: "created",
      label: "Request Created"
    },
    {
      key: "matching",
      label: "Finding Potential Resources"
    },
    {
      key: "verification",
      label: "Verification & Coordination"
    },
    {
      key: "coordination",
      label: "Healthcare Coordination"
    },
    {
      key: "resolved",
      label: "Request Closed"
    }
  ];

  let requestForm = null;


  /* =======================================================
     INITIALIZE
     ======================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    initRequestManager
  );


  function initRequestManager() {

    requestForm =
      document.querySelector(
        "#bloodRequestForm"
      ) ||
      document.querySelector(
        "#requestForm"
      ) ||
      document.querySelector(
        "[data-request-form]"
      );

    if (requestForm) {
      bindForm();
    }

    bindRequestActions();
    renderCurrentRequest();
    renderRequestHistory();

  }


  /* =======================================================
     FORM BINDING
     ======================================================= */

  function bindForm() {

    requestForm.addEventListener(
      "submit",
      handleRequestSubmit
    );

  }


  async function handleRequestSubmit(
    event
  ) {

    event.preventDefault();

    const formData =
      collectFormData();

    const validation =
      validateRequest(
        formData
      );

    clearErrors();

    if (!validation.valid) {

      displayErrors(
        validation.errors
      );

      return;

    }

    const request =
      buildRequest(
        formData
      );

    saveRequest(
      request
    );

    updateRequestUI(
      request
    );

    showMessage(
      "Request created successfully."
    );

    document.dispatchEvent(
      new CustomEvent(
        "vitalLoopRequestCreated",
        {
          detail: request
        }
      )
    );

  }


  /* =======================================================
     COLLECT FORM DATA
     ======================================================= */

  function collectFormData() {

    return {
      patientName:
        valueOf([
          "#patientName",
          "[name='patientName']"
        ]),

      bloodGroup:
        valueOf([
          "#bloodGroup",
          "[name='bloodGroup']"
        ]),

      units:
        valueOf([
          "#units",
          "[name='units']"
        ]),

      hospital:
        valueOf([
          "#hospital",
          "[name='hospital']",
          "#facility"
        ]),

      location:
        valueOf([
          "#location",
          "[name='location']"
        ]),

      contact:
        valueOf([
          "#contact",
          "[name='contact']",
          "#phone"
        ]),

      urgency:
        valueOf([
          "#urgency",
          "[name='urgency']"
        ]) || "urgent",

      notes:
        valueOf([
          "#notes",
          "[name='notes']"
        ])
    };

  }


  /* =======================================================
     VALIDATION
     ======================================================= */

  function validateRequest(
    data
  ) {

    const errors = [];

    if (!data.bloodGroup) {

      errors.push({
        selector:
          "#bloodGroup",
        message:
          "Please select the required blood group."
      });

    }

    if (data.units) {

      const units =
        Number(data.units);

      if (
        !Number.isFinite(units) ||
        units <= 0
      ) {

        errors.push({
          selector:
            "#units",
          message:
            "Please enter a valid requirement."
        });

      }

    }

    if (
      !data.hospital &&
      !data.location
    ) {

      errors.push({
        selector:
          "#hospital",
        message:
          "Please provide a healthcare facility or location."
      });

    }

    if (
      data.contact &&
      !isValidContact(
        data.contact
      )
    ) {

      errors.push({
        selector:
          "#contact",
        message:
          "Please enter a valid contact number."
      });

    }

    return {
      valid:
        errors.length === 0,
      errors
    };

  }


  function isValidContact(
    value
  ) {

    const cleaned =
      String(value)
        .replace(
          /[\s()-]/g,
          ""
        );

    return /^\+?\d{7,15}$/.test(
      cleaned
    );

  }


  /* =======================================================
     BUILD REQUEST
     ======================================================= */

  function buildRequest(
    data
  ) {

    const now =
      new Date();

    const id =
      generateRequestId();

    return {
      id,

      patientName:
        data.patientName || "",

      bloodGroup:
        data.bloodGroup || "",

      units:
        data.units
          ? Number(data.units)
          : null,

      hospital:
        data.hospital || "",

      location:
        data.location || "",

      contact:
        data.contact || "",

      urgency:
        data.urgency || "urgent",

      notes:
        data.notes || "",

      status:
        "Request Created",

      statusKey:
        "created",

      statusStep:
        0,

      createdAt:
        now.toISOString(),

      updatedAt:
        now.toISOString(),

      verification:
        "Pending",

      availability:
        "Potential availability only",

      source:
        "Vital Loop Prototype",

      safetyNote:
        "Blood availability is not guaranteed. Verification by an authorised blood centre or healthcare professional is required."
    };

  }


  /* =======================================================
     REQUEST ID
     ======================================================= */

  function generateRequestId() {

    const date =
      new Date();

    const datePart =
      [
        date.getFullYear(),
        String(
          date.getMonth() + 1
        ).padStart(2, "0"),
        String(
          date.getDate()
        ).padStart(2, "0")
      ].join("");

    const randomPart =
      Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase();

    return (
      "VL-" +
      datePart +
      "-" +
      randomPart
    );

  }


  /* =======================================================
     SAVE CURRENT REQUEST
     ======================================================= */

  function saveRequest(
    request
  ) {

    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          request
        )
      );

      const history =
        getRequestHistory();

      const existingIndex =
        history.findIndex(
          function (item) {
            return item.id === request.id;
          }
        );

      if (
        existingIndex >= 0
      ) {

        history[
          existingIndex
        ] = request;

      } else {

        history.unshift(
          request
        );

      }

      localStorage.setItem(
        REQUESTS_KEY,
        JSON.stringify(
          history.slice(0, 20)
        )
      );

    } catch (error) {

      console.warn(
        "Vital Loop request storage unavailable.",
        error
      );

    }

  }


  /* =======================================================
     GET CURRENT REQUEST
     ======================================================= */

  function getCurrentRequest() {

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

      return request;

    } catch (error) {

      return null;

    }

  }


  /* =======================================================
     REQUEST HISTORY
     ======================================================= */

  function getRequestHistory() {

    try {

      const raw =
        localStorage.getItem(
          REQUESTS_KEY
        );

      if (!raw) {
        return [];
      }

      const parsed =
        JSON.parse(raw);

      return Array.isArray(parsed)
        ? parsed
        : [];

    } catch (error) {

      return [];

    }

  }


  /* =======================================================
     UPDATE REQUEST STATUS
     ======================================================= */

  function updateRequestStatus(
    statusKey
  ) {

    const request =
      getCurrentRequest();

    if (!request) {
      return null;
    }

    const status =
      STATUS_FLOW.find(
        function (item) {
          return item.key === statusKey;
        }
      );

    if (!status) {
      return request;
    }

    request.statusKey =
      status.key;

    request.status =
      status.label;

    request.statusStep =
      STATUS_FLOW.findIndex(
        function (item) {
          return item.key === status.key;
        }
      );

    request.updatedAt =
      new Date().toISOString();

    saveRequest(
      request
    );

    updateRequestUI(
      request
    );

    document.dispatchEvent(
      new CustomEvent(
        "vitalLoopRequestUpdated",
        {
          detail: request
        }
      )
    );

    return request;

  }


  /* =======================================================
     UPDATE UI
     ======================================================= */

  function updateRequestUI(
    request
  ) {

    if (!request) {
      return;
    }

    setText(
      "[data-request-id]",
      request.id
    );

    setText(
      "[data-request-status]",
      request.status
    );

    setText(
      "[data-request-blood-group]",
      request.bloodGroup ||
      "—"
    );

    setText(
      "[data-request-units]",
      request.units ||
      "—"
    );

    setText(
      "[data-request-hospital]",
      request.hospital ||
      request.location ||
      "—"
    );

    setText(
      "[data-request-urgency]",
      request.urgency ||
      "—"
    );

    updateStatusSteps(
      request
    );

  }


  function updateStatusSteps(
    request
  ) {

    const steps =
      document.querySelectorAll(
        "[data-request-step]"
      );

    steps.forEach(
      function (step) {

        const stepKey =
          step.dataset.requestStep;

        const index =
          STATUS_FLOW.findIndex(
            function (item) {
              return item.key === stepKey;
            }
          );

        step.classList.remove(
          "is-complete",
          "is-current"
        );

        if (
          index <
          request.statusStep
        ) {

          step.classList.add(
            "is-complete"
          );

        } else if (
          index ===
          request.statusStep
        ) {

          step.classList.add(
            "is-current"
          );

        }

      }
    );

  }


  /* =======================================================
     RENDER CURRENT REQUEST
     ======================================================= */

  function renderCurrentRequest() {

    const request =
      getCurrentRequest();

    if (!request) {
      return;
    }

    updateRequestUI(
      request
    );

    const emptyState =
      document.querySelector(
        "[data-no-request]"
      );

    if (emptyState) {

      emptyState.hidden =
        true;

    }

    const requestCard =
      document.querySelector(
        "[data-current-request]"
      );

    if (requestCard) {

      requestCard.hidden =
        false;

    }

  }


  /* =======================================================
     RENDER HISTORY
     ======================================================= */

  function renderRequestHistory() {

    const container =
      document.querySelector(
        "[data-request-history]"
      );

    if (!container) {
      return;
    }

    const history =
      getRequestHistory();

    if (!history.length) {

      container.innerHTML =
        "<p>No previous requests found.</p>";

      return;

    }

    container.innerHTML =
      history
        .map(
          function (request) {

            return createHistoryItem(
              request
            );

          }
        )
        .join("");

  }


  function createHistoryItem(
    request
  ) {

    const date =
      formatDate(
        request.createdAt
      );

    return `
      <article class="request-history-item">
        <div class="request-history-main">
          <strong>${escapeHTML(
            request.id || "Request"
          )}</strong>

          <span>
            ${escapeHTML(
              request.bloodGroup || "—"
            )}
          </span>
        </div>

        <div class="request-history-meta">
          <span>
            ${escapeHTML(
              request.status || "—"
            )}
          </span>

          <time datetime="${escapeHTML(
            request.createdAt || ""
          )}">
            ${escapeHTML(date)}
          </time>
        </div>
      </article>
    `;

  }


  /* =======================================================
     REQUEST ACTIONS
     ======================================================= */

  function bindRequestActions() {

    document
      .querySelectorAll(
        "[data-request-status-action]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              const status =
                button.dataset
                  .requestStatusAction;

              updateRequestStatus(
                status
              );

            }
          );

        }
      );


    document
      .querySelectorAll(
        "[data-clear-request]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            clearCurrentRequest
          );

        }
      );

  }


  function clearCurrentRequest() {

    try {

      localStorage.removeItem(
        STORAGE_KEY
      );

      localStorage.removeItem(
        "vitalLoopCurrentRequestId"
      );

      const card =
        document.querySelector(
          "[data-current-request]"
        );

      if (card) {
        card.hidden = true;
      }

      const empty =
        document.querySelector(
          "[data-no-request]"
        );

      if (empty) {
        empty.hidden = false;
      }

      showMessage(
        "Current request cleared from this device."
      );

    } catch (error) {

      showMessage(
        "Unable to clear the request."
      );

    }

  }


  /* =======================================================
     FORM ERROR UI
     ======================================================= */

  function clearErrors() {

    document
      .querySelectorAll(
        ".request-field-error"
      )
      .forEach(
        function (element) {
          element.remove();
        }
      );

    document
      .querySelectorAll(
        ".request-validation-error"
      )
      .forEach(
        function (element) {

          element.classList.remove(
            "request-validation-error"
          );

        }
      );

  }


  function displayErrors(
    errors
  ) {

    errors.forEach(
      function (error) {

        const field =
          document.querySelector(
            error.selector
          );

        if (!field) {
          return;
        }

        field.classList.add(
          "request-validation-error"
        );

        const message =
          document.createElement(
            "small"
          );

        message.className =
          "request-field-error";

        message.setAttribute(
          "role",
          "alert"
        );

        message.textContent =
          error.message;

        if (
          field.parentElement
        ) {

          field.parentElement.appendChild(
            message
          );

        }

      }
    );

    showMessage(
      "Please check the highlighted fields."
    );

  }


  /* =======================================================
     HELPERS
     ======================================================= */

  function valueOf(
    selectors
  ) {

    for (
      let i = 0;
      i < selectors.length;
      i++
    ) {

      const element =
        document.querySelector(
          selectors[i]
        );

      if (element) {

        return String(
          element.value || ""
        ).trim();

      }

    }

    return "";

  }


  function setText(
    selector,
    value
  ) {

    const elements =
      document.querySelectorAll(
        selector
      );

    elements.forEach(
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
      return "Unknown date";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return "Unknown date";

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

    const existing =
      document.getElementById(
        "vitalLoopRequestToast"
      );

    if (existing) {
      existing.remove();
    }

    const toast =
      document.createElement(
        "div"
      );

    toast.id =
      "vitalLoopRequestToast";

    toast.textContent =
      message;

    Object.assign(
      toast.style,
      {
        position: "fixed",
        left: "50%",
        bottom: "24px",
        transform: "translateX(-50%)",
        zIndex: "99999",
        padding: "12px 18px",
        borderRadius: "999px",
        background: "#102027",
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: "700",
        boxShadow:
          "0 12px 30px rgba(0,0,0,.18)"
      }
    );

    document.body.appendChild(
      toast
    );

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

  window.VitalLoopRequests = {

    create:
      function (data) {

        const request =
          buildRequest(
            data || {}
          );

        saveRequest(
          request
        );

        return request;

      },

    getCurrent:
      function () {

        return getCurrentRequest();

      },

    getHistory:
      function () {

        return getRequestHistory();

      },

    updateStatus:
      function (status) {

        return updateRequestStatus(
          status
        );

      },

    clear:
      function () {

        clearCurrentRequest();

      },

    statuses:
      STATUS_FLOW.slice()

  };

})();
