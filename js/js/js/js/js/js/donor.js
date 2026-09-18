/* =========================================================
   VITAL LOOP — DONOR NETWORK
   js/donor.js
   ========================================================= */

(function () {
  "use strict";

  const DONOR_KEY = "vitalLoopDonor";
  const DONORS_KEY = "vitalLoopDonors";

  let donorForm = null;
  let donorLocation = null;

  document.addEventListener("DOMContentLoaded", initDonorNetwork);

  function initDonorNetwork() {
    donorForm =
      document.querySelector("#donorForm") ||
      document.querySelector("#donorRegistrationForm") ||
      document.querySelector("[data-donor-form]");

    if (donorForm) {
      donorForm.addEventListener("submit", handleDonorSubmit);
    }

    bindLocationButtons();
    bindDonorActions();
    renderSavedDonor();
    renderDonorNetwork();
  }

  /* =======================================================
     FORM SUBMISSION
     ======================================================= */

  function handleDonorSubmit(event) {
    event.preventDefault();

    clearErrors();

    const data = collectDonorData();
    const validation = validateDonor(data);

    if (!validation.valid) {
      displayErrors(validation.errors);
      return;
    }

    const donor = createDonor(data);

    saveDonor(donor);
    renderSavedDonor();
    renderDonorNetwork();

    if (donorForm) {
      donorForm.reset();
    }

    donorLocation = null;

    showMessage("Donor profile saved successfully.");

    document.dispatchEvent(
      new CustomEvent("vitalLoopDonorRegistered", {
        detail: donor
      })
    );
  }

  /* =======================================================
     COLLECT DATA
     ======================================================= */

  function collectDonorData() {
    return {
      name: valueOf([
        "#donorName",
        "[name='donorName']",
        "[name='name']"
      ]),

      bloodGroup: valueOf([
        "#donorBloodGroup",
        "[name='donorBloodGroup']",
        "[name='bloodGroup']"
      ]),

      contact: valueOf([
        "#donorContact",
        "[name='donorContact']",
        "[name='contact']",
        "[name='phone']"
      ]),

      city: valueOf([
        "#donorCity",
        "[name='donorCity']",
        "[name='city']"
      ]),

      availability: valueOf([
        "#donorAvailability",
        "[name='donorAvailability']"
      ]) || "available",

      consent: checkedOf([
        "#donorConsent",
        "[name='donorConsent']"
      ])
    };
  }

  /* =======================================================
     VALIDATION
     ======================================================= */

  function validateDonor(data) {
    const errors = [];

    if (!data.name) {
      errors.push({
        selectors: [
          "#donorName",
          "[name='donorName']",
          "[name='name']"
        ],
        message: "Please enter the donor name."
      });
    }

    if (!data.bloodGroup) {
      errors.push({
        selectors: [
          "#donorBloodGroup",
          "[name='donorBloodGroup']",
          "[name='bloodGroup']"
        ],
        message: "Please select the donor blood group."
      });
    }

    if (!data.contact) {
      errors.push({
        selectors: [
          "#donorContact",
          "[name='donorContact']",
          "[name='contact']"
        ],
        message: "Please enter a contact number."
      });
    } else if (!isValidPhone(data.contact)) {
      errors.push({
        selectors: [
          "#donorContact",
          "[name='donorContact']",
          "[name='contact']"
        ],
        message: "Please enter a valid contact number."
      });
    }

    if (!data.city && !donorLocation) {
      errors.push({
        selectors: [
          "#donorCity",
          "[name='donorCity']",
          "[name='city']"
        ],
        message: "Please enter a city or use your current location."
      });
    }

    if (!data.consent) {
      errors.push({
        selectors: [
          "#donorConsent",
          "[name='donorConsent']"
        ],
        message: "Consent is required before saving this donor profile."
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  function isValidPhone(value) {
    const cleaned = String(value).replace(/[\s()-]/g, "");
    return /^\+?\d{7,15}$/.test(cleaned);
  }

  /* =======================================================
     CREATE DONOR
     ======================================================= */

  function createDonor(data) {
    const now = new Date();

    return {
      id: generateDonorId(),

      name: data.name,
      bloodGroup: data.bloodGroup,
      contact: data.contact,
      city: data.city,
      availability: data.availability,

      location: donorLocation
        ? {
            latitude: donorLocation.latitude,
            longitude: donorLocation.longitude,
            accuracy: donorLocation.accuracy
          }
        : null,

      consent: true,

      verificationStatus: "Unverified",

      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),

      source: "Vital Loop Prototype",

      safetyNote:
        "This profile represents potential donor availability only. Donation eligibility and blood compatibility must be determined by authorised healthcare professionals."
    };
  }

  function generateDonorId() {
    const random = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    return "VLD-" + Date.now().toString().slice(-6) + "-" + random;
  }

  /* =======================================================
     STORAGE
     ======================================================= */

  function saveDonor(donor) {
    try {
      localStorage.setItem(
        DONOR_KEY,
        JSON.stringify(donor)
      );

      const donors = getDonors();

      const existingIndex = donors.findIndex(function (item) {
        return item.id === donor.id;
      });

      if (existingIndex >= 0) {
        donors[existingIndex] = donor;
      } else {
        donors.unshift(donor);
      }

      localStorage.setItem(
        DONORS_KEY,
        JSON.stringify(donors.slice(0, 50))
      );
    } catch (error) {
      console.warn(
        "Vital Loop: donor information could not be saved.",
        error
      );
    }
  }

  function getSavedDonor() {
    try {
      const raw = localStorage.getItem(DONOR_KEY);

      if (!raw) {
        return null;
      }

      const donor = JSON.parse(raw);

      return donor && typeof donor === "object"
        ? donor
        : null;
    } catch (error) {
      return null;
    }
  }

  function getDonors() {
    try {
      const raw = localStorage.getItem(DONORS_KEY);

      if (!raw) {
        return [];
      }

      const donors = JSON.parse(raw);

      return Array.isArray(donors)
        ? donors
        : [];
    } catch (error) {
      return [];
    }
  }

  /* =======================================================
     CURRENT LOCATION
     ======================================================= */

  function bindLocationButtons() {
    document
      .querySelectorAll("[data-donor-location]")
      .forEach(function (button) {
        button.addEventListener("click", function () {
          captureLocation(button);
        });
      });
  }

  function captureLocation(button) {
    if (!navigator.geolocation) {
      showMessage("Location is not supported on this device.");
      return;
    }

    const originalText = button.textContent;

    button.disabled = true;
    button.textContent = "Finding location...";

    navigator.geolocation.getCurrentPosition(
      function (position) {
        donorLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };

        const cityField =
          document.querySelector("#donorCity") ||
          document.querySelector("[name='donorCity']");

        if (cityField && !cityField.value) {
          cityField.placeholder = "Current location added";
        }

        const status = document.querySelector(
          "[data-donor-location-status]"
        );

        if (status) {
          status.textContent =
            "✓ Current device location added.";
        }

        button.disabled = false;
        button.textContent = "✓ Location Added";

        showMessage("Location added to donor profile.");
      },

      function (error) {
        let message = "Unable to access current location.";

        if (error && error.code === 1) {
          message = "Location permission was not granted.";
        } else if (error && error.code === 2) {
          message = "Current location could not be determined.";
        } else if (error && error.code === 3) {
          message = "Location request timed out.";
        }

        button.disabled = false;
        button.textContent = originalText;

        showMessage(message);
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  }

  /* =======================================================
     RENDER SAVED DONOR
     ======================================================= */

  function renderSavedDonor() {
    const donor = getSavedDonor();

    const profile = document.querySelector(
      "[data-donor-profile]"
    );

    const empty = document.querySelector(
      "[data-no-donor-profile]"
    );

    if (!donor) {
      if (profile) {
        profile.hidden = true;
      }

      if (empty) {
        empty.hidden = false;
      }

      return;
    }

    if (profile) {
      profile.hidden = false;
    }

    if (empty) {
      empty.hidden = true;
    }

    setText(
      "[data-donor-name]",
      donor.name || "—"
    );

    setText(
      "[data-donor-blood-group]",
      donor.bloodGroup || "—"
    );

    setText(
      "[data-donor-city]",
      donor.city ||
        (donor.location ? "Location available" : "—")
    );

    setText(
      "[data-donor-availability]",
      formatAvailability(donor.availability)
    );

    setText(
      "[data-donor-verification]",
      donor.verificationStatus || "Unverified"
    );

    setText(
      "[data-donor-id]",
      donor.id || "—"
    );
  }

  /* =======================================================
     DONOR NETWORK LIST
     ======================================================= */

  function renderDonorNetwork() {
    const container = document.querySelector(
      "[data-donor-list]"
    );

    if (!container) {
      return;
    }

    const donors = getDonors();

    if (!donors.length) {
      container.innerHTML = `
        <div class="donor-empty-state">
          <p>No donor profiles saved on this device yet.</p>
        </div>
      `;

      return;
    }

    container.innerHTML = donors
      .map(function (donor) {
        return donorCard(donor);
      })
      .join("");
  }

  function donorCard(donor) {
    return `
      <article
        class="donor-network-card"
        data-donor-id="${escapeHTML(donor.id)}"
      >

        <div class="donor-card-header">

          <div class="donor-avatar" aria-hidden="true">
            ${escapeHTML(getInitials(donor.name))}
          </div>

          <div>
            <h3>
              ${escapeHTML(donor.name || "Donor")}
            </h3>

            <span class="donor-id">
              ${escapeHTML(donor.id || "")}
            </span>
          </div>

          <div class="donor-blood-badge">
            ${escapeHTML(donor.bloodGroup || "—")}
          </div>

        </div>

        <div class="donor-card-details">

          <div>
            <span>Location</span>
            <strong>
              ${escapeHTML(
                donor.city ||
                (donor.location
                  ? "Location available"
                  : "Not provided")
              )}
            </strong>
          </div>

          <div>
            <span>Status</span>
            <strong>
              ${escapeHTML(
                formatAvailability(
                  donor.availability
                )
              )}
            </strong>
          </div>

          <div>
            <span>Verification</span>
            <strong>
              ${escapeHTML(
                donor.verificationStatus ||
                "Unverified"
              )}
            </strong>
          </div>

        </div>

        <div class="donor-card-note">
          Potential donor profile only. Final donation eligibility
          and compatibility require authorised medical assessment.
        </div>

      </article>
    `;
  }

  /* =======================================================
     DONOR ACTIONS
     ======================================================= */

  function bindDonorActions() {
    document
      .querySelectorAll("[data-toggle-donor-availability]")
      .forEach(function (button) {
        button.addEventListener("click", toggleAvailability);
      });

    document
      .querySelectorAll("[data-clear-donor]")
      .forEach(function (button) {
        button.addEventListener("click", clearCurrentDonor);
      });
  }

  function toggleAvailability() {
    const donor = getSavedDonor();

    if (!donor) {
      showMessage("No donor profile found.");
      return;
    }

    donor.availability =
      donor.availability === "available"
        ? "unavailable"
        : "available";

    donor.updatedAt =
      new Date().toISOString();

    saveDonor(donor);

    renderSavedDonor();
    renderDonorNetwork();

    showMessage(
      donor.availability === "available"
        ? "Donor status set to available."
        : "Donor status set to unavailable."
    );
  }

  function clearCurrentDonor() {
    try {
      localStorage.removeItem(DONOR_KEY);

      renderSavedDonor();

      showMessage(
        "Current donor profile removed from this device."
      );
    } catch (error) {
      showMessage(
        "Unable to remove donor profile."
      );
    }
  }

  /* =======================================================
     ERROR UI
     ======================================================= */

  function clearErrors() {
    document
      .querySelectorAll(".donor-field-error")
      .forEach(function (element) {
        element.remove();
      });

    document
      .querySelectorAll(".donor-validation-error")
      .forEach(function (element) {
        element.classList.remove(
          "donor-validation-error"
        );
      });
  }

  function displayErrors(errors) {
    errors.forEach(function (error) {
      const field = findField(error.selectors);

      if (!field) {
        return;
      }

      field.classList.add(
        "donor-validation-error"
      );

      const message =
        document.createElement("small");

      message.className =
        "donor-field-error";

      message.setAttribute(
        "role",
        "alert"
      );

      message.textContent =
        error.message;

      if (field.parentElement) {
        field.parentElement.appendChild(
          message
        );
      }
    });

    showMessage(
      "Please check the highlighted fields."
    );
  }

  /* =======================================================
     HELPERS
     ======================================================= */

  function valueOf(selectors) {
    const field =
      findField(selectors);

    if (!field) {
      return "";
    }

    return String(
      field.value || ""
    ).trim();
  }

  function checkedOf(selectors) {
    const field =
      findField(selectors);

    return Boolean(
      field && field.checked
    );
  }

  function findField(selectors) {
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

  function setText(selector, value) {
    document
      .querySelectorAll(selector)
      .forEach(function (element) {
        element.textContent = value;
      });
  }

  function formatAvailability(value) {
    if (value === "available") {
      return "Available for Coordination";
    }

    if (value === "unavailable") {
      return "Currently Unavailable";
    }

    return value || "Unknown";
  }

  function getInitials(name) {
    if (!name) {
      return "VL";
    }

    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function (part) {
        return part.charAt(0).toUpperCase();
      })
      .join("");
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* =======================================================
     TOAST
     ======================================================= */

  function showMessage(message) {
    if (
      typeof window.VitalLoopToast ===
      "function"
    ) {
      window.VitalLoopToast(message);
      return;
    }

    let toast =
      document.getElementById(
        "vitalLoopDonorToast"
      );

    if (!toast) {
      toast =
        document.createElement("div");

      toast.id =
        "vitalLoopDonorToast";

      Object.assign(toast.style, {
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
      });

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
      setTimeout(function () {
        toast.remove();
      }, 2800);
  }

  /* =======================================================
     PUBLIC API
     ======================================================= */

  window.VitalLoopDonor = {
    getCurrent: function () {
      return getSavedDonor();
    },

    getAll: function () {
      return getDonors();
    },

    save: function (data) {
      const donor =
        createDonor(data || {});

      saveDonor(donor);

      return donor;
    },

    setAvailability: function (availability) {
      const donor =
        getSavedDonor();

      if (!donor) {
        return null;
      }

      donor.availability =
        availability;

      donor.updatedAt =
        new Date().toISOString();

      saveDonor(donor);

      return donor;
    },

    getLocation: function () {
      return donorLocation;
    }
  };

})();
