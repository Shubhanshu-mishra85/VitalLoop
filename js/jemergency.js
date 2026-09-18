/* =========================================================
   VITAL LOOP — EMERGENCY COORDINATION
   js/emergency.js
   ========================================================= */

(function () {
  "use strict";

  /* =======================================================
     CONFIGURATION
     ======================================================= */

  const STORAGE_KEY =
    "vitalLoopRequest";

  const FORM_SELECTORS = [
    "#emergencyForm",
    "#bloodRequestForm",
    "[data-emergency-form]"
  ];

  const FIELD_SELECTORS = {
    patientName: [
      "#patientName",
      "[name='patientName']"
    ],

    bloodGroup: [
      "#bloodGroup",
      "[name='bloodGroup']"
    ],

    units: [
      "#units",
      "[name='units']"
    ],

    hospital: [
      "#hospital",
      "[name='hospital']"
    ],

    location: [
      "#location",
      "[name='location']"
    ],

    contact: [
      "#contact",
      "[name='contact']"
    ],

    urgency: [
      "#urgency",
      "[name='urgency']"
    ],

    notes: [
      "#notes",
      "[name='notes']"
    ]
  };


  /* =======================================================
     STATE
     ======================================================= */

  let activeForm = null;

  let currentLocation = null;


  /* =======================================================
     INITIALIZATION
     ======================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    initializeEmergency
  );


  function initializeEmergency() {

    activeForm =
      findFirst(
        FORM_SELECTORS
      );

    if (!activeForm) {
      return;
    }

    initializeForm();

    initializeLocation();

    initializeBloodGroup();

    initializeUnitField();

    restoreExistingRequest();

  }


  /* =======================================================
     FORM
     ======================================================= */

  function initializeForm() {

    activeForm.addEventListener(
      "submit",
      handleSubmit
    );

    const resetButtons =
      activeForm.querySelectorAll(
        "[data-reset-form]"
      );

    resetButtons.forEach(
      function (button) {

        button.addEventListener(
          "click",
          resetForm
        );

      }
    );

  }


  /* =======================================================
     SUBMIT
     ======================================================= */

  function handleSubmit(event) {

    event.preventDefault();

    clearValidationErrors();

    const formData =
      collectFormData();

    const validation =
      validateForm(
        formData
      );

    if (!validation.valid) {

      showValidationErrors(
        validation.errors
      );

      const firstError =
        validation.firstField;

      if (firstError) {

        firstError.focus();

      }

      return;

    }

    const request =
      createRequest(
        formData
      );

    saveRequest(
      request
    );

    showSuccessState(
      request
    );

    addNotification(
      request
    );

  }


  /* =======================================================
     COLLECT DATA
     ======================================================= */

  function collectFormData() {

    return {
      patientName:
        getFieldValue(
          FIELD_SELECTORS.patientName
        ),

      bloodGroup:
        getFieldValue(
          FIELD_SELECTORS.bloodGroup
        ),

      units:
        getFieldValue(
          FIELD_SELECTORS.units
        ),

      hospital:
        getFieldValue(
          FIELD_SELECTORS.hospital
        ),

      location:
        getFieldValue(
          FIELD_SELECTORS.location
        ),

      contact:
        getFieldValue(
          FIELD_SELECTORS.contact
        ),

      urgency:
        getFieldValue(
          FIELD_SELECTORS.urgency
        ) ||
        "urgent",

      notes:
        getFieldValue(
          FIELD_SELECTORS.notes
        )
    };

  }


  /* =======================================================
     VALIDATION
     ======================================================= */

  function validateForm(
    data
  ) {

    const errors = [];

    let firstField = null;


    if (
      !data.bloodGroup
    ) {

      const field =
        findFirst(
          FIELD_SELECTORS.bloodGroup
        );

      errors.push({
        field,
        message:
          "Please select a blood group."
      });

      firstField =
        firstField ||
        field;

    }


    if (
      data.units
    ) {

      const units =
        Number(
          data.units
        );

      if (
        !Number.isFinite(units) ||
        units <= 0
      ) {

        const field =
          findFirst(
            FIELD_SELECTORS.units
          );

        errors.push({
          field,
          message:
            "Please enter a valid requirement."
        });

        firstField =
          firstField ||
          field;

      }

    }


    if (
      !data.hospital &&
      !data.location
    ) {

      const field =
        findFirst(
          FIELD_SELECTORS.hospital
        ) ||
        findFirst(
          FIELD_SELECTORS.location
        );

      errors.push({
        field,
        message:
          "Please provide a healthcare facility or location."
      });

      firstField =
        firstField ||
        field;

    }


    if (
      data.contact &&
      !isReasonablePhone(
        data.contact
      )
    ) {

      const field =
        findFirst(
          FIELD_SELECTORS.contact
        );

      errors.push({
        field,
        message:
          "Please enter a valid contact number."
      });

      firstField =
        firstField ||
        field;

    }


    return {
      valid:
        errors.length === 0,

      errors,

      firstField
    };

  }


  function isReasonablePhone(
    value
  ) {

    const cleaned =
      String(value)
        .replace(
          /[\s()-]/g,
          ""
        );

    /*
      This is only basic format validation.
      It does not verify ownership or identity.
    */

    return /^(\+?\d{7,15})$/.test(
      cleaned
    );

  }


  /* =======================================================
     CREATE REQUEST
     ======================================================= */

  function createRequest(
    data
  ) {

    const now =
      new Date();

    const requestId =
      generateRequestId();

    return {
      id:
        requestId,

      type:
        "Emergency Blood Coordination",

      patientName:
        data.patientName,

      bloodGroup:
        data.bloodGroup,

      units:
        data.units
          ? Number(data.units)
          : null,

      hospital:
        data.hospital,

      location:
        data.location,

      contact:
        data.contact,

      urgency:
        data.urgency,

      notes:
        data.notes,

      status:
        "Request Created",

      statusStep:
        1,

      createdAt:
        now.toISOString(),

      updatedAt:
        now.toISOString(),

      locationData:
        currentLocation
          ? {
              latitude:
                currentLocation.latitude,

              longitude:
                currentLocation.longitude,

              accuracy:
                currentLocation.accuracy
            }
          : null,

      disclaimer:
        "Prototype coordination record. Blood availability is not guaranteed. Verification by an authorised blood centre or healthcare professional is required."
    };

  }


  /* =======================================================
     REQUEST ID
     ======================================================= */

  function generateRequestId() {

    const date =
      new Date();

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        date.getDate()
      ).padStart(2, "0");

    const random =
      Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase();

    return (
      "VL-" +
      year +
      month +
      day +
      "-" +
      random
    );

  }


  /* =======================================================
     SAVE REQUEST
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

    } catch (error) {

      console.warn(
        "Vital Loop: request could not be saved.",
        error
      );

    }

    /*
      Also expose a small compatibility object
      for pages that consume the current request.
    */

    try {

      localStorage.setItem(
        "vitalLoopCurrentRequestId",
        request.id
      );

    } catch (error) {
      /* Ignore storage restrictions. */
    }

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
     RESTORE EXISTING REQUEST
     ======================================================= */

  function restoreExistingRequest() {

    let request = null;

    try {

      const saved =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (saved) {

        request =
          JSON.parse(
            saved
          );

      }

    } catch (error) {

      request = null;

    }

    if (
      !request ||
      typeof request !== "object"
    ) {
      return;
    }

    const indicator =
      document.querySelector(
        "[data-existing-request]"
      );

    if (indicator) {

      indicator.textContent =
        "Active request: " +
        (
          request.id ||
          "Available"
        );

      indicator.classList.add(
        "active"
      );

    }

  }


  /* =======================================================
     SUCCESS STATE
     ======================================================= */

  function showSuccessState(
    request
  ) {

    const success =
      document.querySelector(
        "[data-request-success]"
      );

    if (success) {

      success.hidden = false;

      const idElement =
        success.querySelector(
          "[data-request-id]"
        );

      if (idElement) {

        idElement.textContent =
          request.id;

      }

      const statusElement =
        success.querySelector(
          "[data-request-status]"
        );

      if (statusElement) {

        statusElement.textContent =
          request.status;

      }

      success.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

    } else {

      showToast(
        "Emergency request created: " +
        request.id
      );

    }

  }


  /* =======================================================
     NOTIFICATION
     ======================================================= */

  function addNotification(
    request
  ) {

    if (
      window.VitalLoopNotifications &&
      typeof
        window.VitalLoopNotifications.add ===
        "function"
    ) {

      window.VitalLoopNotifications.add({
        id:
          "request-" +
          request.id,

        title:
          "Emergency request created",

        message:
          "Request " +
          request.id +
          " is ready for coordination.",

        time:
          "Just now"
      });

    }

  }


  /* =======================================================
     LOCATION
     ======================================================= */

  function initializeLocation() {

    const buttons =
      document.querySelectorAll(
        "[data-use-location]"
      );

    buttons.forEach(
      function (button) {

        button.addEventListener(
          "click",
          function () {

            useCurrentLocation(
              button
            );

          }
        );

      }
    );

  }


  function useCurrentLocation(
    button
  ) {

    if (
      !navigator.geolocation
    ) {

      showToast(
        "Location is not supported by this browser."
      );

      return;

    }

    if (button) {

      button.disabled =
        true;

      button.dataset.originalText =
        button.textContent;

      button.textContent =
        "Finding location...";

    }

    navigator.geolocation.getCurrentPosition(

      function (position) {

        currentLocation = {
          latitude:
            position.coords.latitude,

          longitude:
            position.coords.longitude,

          accuracy:
            position.coords.accuracy
        };

        const locationField =
          findFirst(
            FIELD_SELECTORS.location
          );

        if (locationField) {

          locationField.value =
            "Current device location";

        }

        const status =
          document.querySelector(
            "[data-location-status]"
          );

        if (status) {

          status.textContent =
            "✓ Current location captured for this request.";

          status.classList.add(
            "success"
          );

        }

        if (button) {

          button.disabled =
            false;

          button.textContent =
            "✓ Location Added";

        }

      },

      function (error) {

        let message =
          "Unable to access location.";

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

        showToast(
          message
        );

        if (button) {

          button.disabled =
            false;

          button.textContent =
            button.dataset.originalText ||
            "Use Current Location";

        }

      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }

    );

  }


  /* =======================================================
     BLOOD GROUP
     ======================================================= */

  function initializeBloodGroup() {

    const fields =
      document.querySelectorAll(
        "select[name='bloodGroup'], #bloodGroup"
      );

    fields.forEach(
      function (field) {

        field.addEventListener(
          "change",
          function () {

            const display =
              document.querySelector(
                "[data-selected-blood-group]"
              );

            if (display) {

              display.textContent =
                field.value ||
                "Not selected";

            }

          }
        );

      }
    );

  }


  /* =======================================================
     UNITS FIELD
     ======================================================= */

  function initializeUnitField() {

    const fields =
      document.querySelectorAll(
        "input[name='units'], #units"
      );

    fields.forEach(
      function (field) {

        field.addEventListener(
          "input",
          function () {

            /*
              Only validate that the field contains
              a positive numeric requirement.
            */

            const value =
              Number(
                field.value
              );

            if (
              field.value &&
              (
                !Number.isFinite(value) ||
                value <= 0
              )
            ) {

              field.setCustomValidity(
                "Please enter a valid requirement."
              );

            } else {

              field.setCustomValidity(
                ""
              );

            }

          }
        );

      }
    );

  }


  /* =======================================================
     VALIDATION UI
     ======================================================= */

  function clearValidationErrors() {

    document
      .querySelectorAll(
        ".field-error"
      )
      .forEach(
        function (element) {

          element.remove();

        }
      );

    document
      .querySelectorAll(
        ".validation-error"
      )
      .forEach(
        function (element) {

          element.classList.remove(
            "validation-error"
          );

        }
      );

  }


  function showValidationErrors(
    errors
  ) {

    errors.forEach(
      function (error) {

        if (!error.field) {
          return;
        }

        error.field.classList.add(
          "validation-error"
        );

        const message =
          document.createElement(
            "div"
          );

        message.className =
          "field-error";

        message.setAttribute(
          "role",
          "alert"
        );

        message.textContent =
          error.message;

        const parent =
          error.field.parentElement;

        if (parent) {

          parent.appendChild(
            message
          );

        }

      }
    );

    showToast(
      "Please check the highlighted information."
    );

  }


  /* =======================================================
     RESET
     ======================================================= */

  function resetForm() {

    if (!activeForm) {
      return;
    }

    activeForm.reset();

    clearValidationErrors();

    currentLocation =
      null;

    const status =
      document.querySelector(
        "[data-location-status]"
      );

    if (status) {

      status.textContent =
        "";

      status.classList.remove(
        "success"
      );

    }

  }


  /* =======================================================
     FIELD HELPERS
     ======================================================= */

  function getFieldValue(
    selectors
  ) {

    const field =
      findFirst(
        selectors
      );

    if (!field) {
      return "";
    }

    return String(
      field.value || ""
    ).trim();

  }


  function findFirst(
    selectors
  ) {

    if (
      !Array.isArray(selectors)
    ) {
      return null;
    }

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
        return element;
      }

    }

    return null;

  }


  /* =======================================================
     TOAST FALLBACK
     ======================================================= */

  function showToast(
    message
  ) {

    if (
      window.VitalLoopToast &&
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
        "vitalLoopEmergencyToast"
      );

    if (!toast) {

      toast =
        document.createElement(
          "div"
        );

      toast.id =
        "vitalLoopEmergencyToast";

      toast.style.position =
        "fixed";

      toast.style.left =
        "50%";

      toast.style.bottom =
        "24px";

      toast.style.transform =
        "translateX(-50%)";

      toast.style.zIndex =
        "99999";

      toast.style.padding =
        "11px 16px";

      toast.style.borderRadius =
        "999px";

      toast.style.background =
        "#102027";

      toast.style.color =
        "#fff";

      toast.style.fontSize =
        "13px";

      toast.style.fontWeight =
        "700";

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

  window.VitalLoopEmergency = {

    createRequest:
      function (data) {

        const request =
          createRequest(
            data || {}
          );

        saveRequest(
          request
        );

        return request;

      },

    getRequest:
      function () {

        try {

          const saved =
            localStorage.getItem(
              STORAGE_KEY
            );

          return saved
            ? JSON.parse(saved)
            : null;

        } catch (error) {

          return null;

        }

      },

    clearRequest:
      function () {

        try {

          localStorage.removeItem(
            STORAGE_KEY
          );

          localStorage.removeItem(
            "vitalLoopCurrentRequestId"
          );

          return true;

        } catch (error) {

          return false;

        }

      },

    getLocation:
      function () {

        return currentLocation;

      }

  };


})();
