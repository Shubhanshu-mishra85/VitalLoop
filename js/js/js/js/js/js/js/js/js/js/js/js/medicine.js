/* =========================================================
   VITAL LOOP — MEDICINE INTELLIGENCE
   js/medicine.js
   ========================================================= */

(function () {
  "use strict";

  const PRESCRIPTION_KEY = "vitalLoopPrescription";

  const state = {
    medicines: [],
    selectedMedicine: null,
    searchTerm: "",
    category: "all"
  };


  /* =======================================================
     INITIALIZATION
     ======================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    initializeMedicine
  );


  function initializeMedicine() {

    loadPrescriptionMedicines();

    bindSearch();

    bindCategoryFilters();

    bindClearSearch();

    bindRefresh();

    bindMedicineCards();

    renderMedicinePage();

  }


  /* =======================================================
     LOAD PRESCRIPTION DATA
     ======================================================= */

  function loadPrescriptionMedicines() {

    try {

      const raw =
        localStorage.getItem(
          PRESCRIPTION_KEY
        );


      if (!raw) {
        return;
      }


      const record =
        JSON.parse(
          raw
        );


      if (
        !record ||
        !Array.isArray(
          record.medicines
        )
      ) {

        return;

      }


      state.medicines =
        record.medicines.map(
          function (medicine) {

            return {
              name:
                medicine.name ||
                "Medicine",

              strength:
                medicine.strength ||
                "Not identified",

              instructions:
                medicine.instructions ||
                "Not identified",

              source:
                "Prescription review"
            };

          }
        );

    } catch (error) {

      console.warn(
        "Vital Loop medicine data could not be loaded.",
        error
      );

    }

  }


  /* =======================================================
     SEARCH
     ======================================================= */

  function bindSearch() {

    document
      .querySelectorAll(
        "[data-medicine-search]"
      )
      .forEach(
        function (input) {

          input.addEventListener(
            "input",
            function () {

              state.searchTerm =
                input.value
                  .trim()
                  .toLowerCase();

              renderMedicinePage();

            }
          );

        }
      );

  }


  /* =======================================================
     CATEGORY FILTERS
     ======================================================= */

  function bindCategoryFilters() {

    document
      .querySelectorAll(
        "[data-medicine-category]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              state.category =
                button.dataset
                  .medicineCategory ||
                "all";


              document
                .querySelectorAll(
                  "[data-medicine-category]"
                )
                .forEach(
                  function (item) {

                    item.classList.toggle(
                      "active",
                      item === button
                    );

                    item.setAttribute(
                      "aria-pressed",
                      item === button
                        ? "true"
                        : "false"
                    );

                  }
                );


              renderMedicinePage();

            }
          );

        }
      );

  }


  /* =======================================================
     CLEAR SEARCH
     ======================================================= */

  function bindClearSearch() {

    document
      .querySelectorAll(
        "[data-medicine-clear]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              document
                .querySelectorAll(
                  "[data-medicine-search]"
                )
                .forEach(
                  function (input) {

                    input.value =
                      "";

                  }
                );


              state.searchTerm =
                "";


              renderMedicinePage();

            }
          );

        }
      );

  }


  /* =======================================================
     REFRESH
     ======================================================= */

  function bindRefresh() {

    document
      .querySelectorAll(
        "[data-medicine-refresh]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              loadPrescriptionMedicines();

              renderMedicinePage();

              showMessage(
                "Medicine information refreshed."
              );

            }
          );

        }
      );

  }


  /* =======================================================
     RENDER
     ======================================================= */

  function renderMedicinePage() {

    renderPrescriptionSection();

    renderSearchResults();

    updateCount();

  }


  /* =======================================================
     PRESCRIPTION MEDICINES
     ======================================================= */

  function renderPrescriptionSection() {

    const container =
      document.querySelector(
        "[data-prescription-medicines]"
      );


    if (!container) {
      return;
    }


    if (
      !state.medicines.length
    ) {

      container.innerHTML = `
        <div class="medicine-empty-state">

          <div
            class="medicine-empty-icon"
            aria-hidden="true"
          >
            💊
          </div>

          <h3>
            No prescription medicines available
          </h3>

          <p>
            Upload a prescription from the
            Prescription Intelligence page to
            organize visible medicine information.
          </p>

          <a
            class="btn btn-primary"
            href="prescription.html"
          >
            Open Prescription
          </a>

        </div>
      `;

      return;

    }


    container.innerHTML =
      state.medicines
        .map(
          function (medicine, index) {

            return `
              <article
                class="medicine-card"
                data-medicine-index="${index}"
              >

                <div class="medicine-card-top">

                  <div class="medicine-icon">
                    💊
                  </div>

                  <span class="medicine-status">
                    Review
                  </span>

                </div>

                <h3>
                  ${escapeHTML(
                    medicine.name
                  )}
                </h3>

                <p class="medicine-strength">
                  ${escapeHTML(
                    medicine.strength
                  )}
                </p>

                <div class="medicine-instruction">

                  <span>
                    Prescription instruction
                  </span>

                  <strong>
                    ${escapeHTML(
                      medicine.instructions
                    )}
                  </strong>

                </div>

                <button
                  type="button"
                  class="btn btn-secondary medicine-view-button"
                  data-view-medicine="${index}"
                >
                  View Details
                </button>

              </article>
            `;

          }
        )
        .join("");


    bindMedicineCards();

  }


  /* =======================================================
     SEARCH RESULTS
     ======================================================= */

  function renderSearchResults() {

    const container =
      document.querySelector(
        "[data-medicine-results]"
      );


    if (!container) {
      return;
    }


    const catalogue =
      getMedicineCatalogue();


    const filtered =
      catalogue.filter(
        function (medicine) {

          const matchesSearch =
            !state.searchTerm ||
            medicine.name
              .toLowerCase()
              .includes(
                state.searchTerm
              );


          const matchesCategory =
            state.category === "all" ||
            medicine.category ===
              state.category;


          return (
            matchesSearch &&
            matchesCategory
          );

        }
      );


    if (!filtered.length) {

      container.innerHTML = `
        <div class="medicine-empty-state">

          <div
            class="medicine-empty-icon"
            aria-hidden="true"
          >
            🔎
          </div>

          <h3>
            No medicine information found
          </h3>

          <p>
            Try another search term.
            Do not use this page to choose,
            start, stop, or change a medicine.
          </p>

        </div>
      `;

      return;

    }


    container.innerHTML =
      filtered
        .map(
          function (medicine) {

            return createCatalogueCard(
              medicine
            );

          }
        )
        .join("");


    container
      .querySelectorAll(
        "[data-catalogue-medicine]"
      )
      .forEach(
        function (card) {

          card.addEventListener(
            "click",
            function () {

              const name =
                card.dataset
                  .catalogueMedicine;


              openMedicineDetails(
                name
              );

            }
          );

        }
      );

  }


  function createCatalogueCard(
    medicine
  ) {

    return `
      <article
        class="medicine-catalogue-card"
        data-catalogue-medicine="${escapeAttribute(
          medicine.name
        )}"
        tabindex="0"
        role="button"
        aria-label="View information about ${escapeAttribute(
          medicine.name
        )}"
      >

        <div class="medicine-catalogue-icon">
          ${medicine.icon || "💊"}
        </div>

        <div>

          <span class="medicine-category">
            ${escapeHTML(
              medicine.categoryLabel
            )}
          </span>

          <h3>
            ${escapeHTML(
              medicine.name
            )}
          </h3>

          <p>
            ${escapeHTML(
              medicine.description
            )}
          </p>

        </div>

      </article>
    `;

  }


  /* =======================================================
     MEDICINE CATALOGUE
     ======================================================= */

  function getMedicineCatalogue() {

    return [

      {
        name:
          "Paracetamol",

        category:
          "general",

        categoryLabel:
          "General information",

        icon:
          "💊",

        description:
          "General educational information about a commonly used medicine."
      },

      {
        name:
          "Ibuprofen",

        category:
          "general",

        categoryLabel:
          "General information",

        icon:
          "💊",

        description:
          "General educational information. Personal use should follow professional advice."
      },

      {
        name:
          "Amoxicillin",

        category:
          "antibiotic",

        categoryLabel:
          "Antibiotic",

        icon:
          "🧪",

        description:
          "Antibiotic medicine information for educational purposes."
      },

      {
        name:
          "Azithromycin",

        category:
          "antibiotic",

        categoryLabel:
          "Antibiotic",

        icon:
          "🧪",

        description:
          "General information about an antibiotic medicine."
      },

      {
        name:
          "Cetirizine",

        category:
          "allergy",

        categoryLabel:
          "Allergy",

        icon:
          "🌿",

        description:
          "General educational information about an allergy medicine."
      },

      {
        name:
          "Omeprazole",

        category:
          "digestive",

        categoryLabel:
          "Digestive",

        icon:
          "🩺",

        description:
          "General educational information about a digestive-system medicine."
      }

    ];

  }


  /* =======================================================
     MEDICINE DETAILS
     ======================================================= */

  function openMedicineDetails(
    medicineName
  ) {

    const medicine =
      getMedicineCatalogue()
        .find(
          function (item) {

            return (
              item.name.toLowerCase() ===
              String(
                medicineName
              ).toLowerCase()
            );

          }
        );


    if (!medicine) {
      return;
    }


    state.selectedMedicine =
      medicine;


    const modal =
      document.querySelector(
        "[data-medicine-modal]"
      );


    if (!modal) {

      showMessage(
        medicine.description
      );

      return;

    }


    setText(
      "[data-modal-medicine-name]",
      medicine.name
    );


    setText(
      "[data-modal-medicine-category]",
      medicine.categoryLabel
    );


    setText(
      "[data-modal-medicine-description]",
      medicine.description
    );


    const safety =
      modal.querySelector(
        "[data-modal-medicine-safety]"
      );


    if (safety) {

      safety.textContent =
        "Do not start, stop, or change this medicine based only on this educational page. Follow the prescription or confirm with a doctor or pharmacist.";

    }


    modal.hidden =
      false;


    document.body.classList.add(
      "modal-open"
    );


    const close =
      modal.querySelector(
        "[data-medicine-modal-close]"
      );


    if (close) {

      close.focus();

    }

  }


  /* =======================================================
     MEDICINE MODAL
     ======================================================= */

  function bindMedicineCards() {

    document
      .querySelectorAll(
        "[data-view-medicine]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function (event) {

              event.stopPropagation();


              const index =
                Number(
                  button.dataset
                    .viewMedicine
                );


              const medicine =
                state.medicines[
                  index
                ];


              if (!medicine) {
                return;
              }


              openPrescriptionMedicine(
                medicine
              );

            }
          );

        }
      );


    document
      .querySelectorAll(
        "[data-medicine-modal-close]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            closeMedicineModal
          );

        }
      );


    document
      .querySelectorAll(
        "[data-medicine-modal]"
      )
      .forEach(
        function (modal) {

          modal.addEventListener(
            "click",
            function (event) {

              if (
                event.target ===
                modal
              ) {

                closeMedicineModal();

              }

            }
          );

        }
      );


    document.addEventListener(
      "keydown",
      function (event) {

        if (
          event.key ===
          "Escape"
        ) {

          closeMedicineModal();

        }

      }
    );

  }


  function openPrescriptionMedicine(
    medicine
  ) {

    const modal =
      document.querySelector(
        "[data-medicine-modal]"
      );


    if (!modal) {

      showMessage(
        "Prescription information is available for review."
      );

      return;

    }


    setText(
      "[data-modal-medicine-name]",
      medicine.name
    );


    setText(
      "[data-modal-medicine-category]",
      "From uploaded prescription"
    );


    setText(
      "[data-modal-medicine-description]",
      "Strength: " +
        medicine.strength +
        ". Prescription instruction: " +
        medicine.instructions
    );


    const safety =
      modal.querySelector(
        "[data-modal-medicine-safety]"
      );


    if (safety) {

      safety.textContent =
        "This is the information recorded from the prescription review. Confirm unclear text with the prescribing doctor or pharmacist.";

    }


    modal.hidden =
      false;


    document.body.classList.add(
      "modal-open"
    );

  }


  function closeMedicineModal() {

    document
      .querySelectorAll(
        "[data-medicine-modal]"
      )
      .forEach(
        function (modal) {

          modal.hidden =
            true;

        }
      );


    document.body.classList.remove(
      "modal-open"
    );


    state.selectedMedicine =
      null;

  }


  /* =======================================================
     COUNT
     ======================================================= */

  function updateCount() {

    const element =
      document.querySelector(
        "[data-medicine-count]"
      );


    if (!element) {
      return;
    }


    const catalogue =
      getMedicineCatalogue();


    const count =
      catalogue.filter(
        function (medicine) {

          const matchesSearch =
            !state.searchTerm ||
            medicine.name
              .toLowerCase()
              .includes(
                state.searchTerm
              );


          const matchesCategory =
            state.category === "all" ||
            medicine.category ===
              state.category;


          return (
            matchesSearch &&
            matchesCategory
          );

        }
      ).length;


    element.textContent =
      count +
      (count === 1
        ? " medicine"
        : " medicines");

  }


  /* =======================================================
     PUBLIC SEARCH API
     ======================================================= */

  function searchMedicine(
    term
  ) {

    state.searchTerm =
      String(
        term || ""
      )
        .trim()
        .toLowerCase();


    document
      .querySelectorAll(
        "[data-medicine-search]"
      )
      .forEach(
        function (input) {

          input.value =
            term || "";

        }
      );


    renderMedicinePage();

  }


  /* =======================================================
     SAFETY NOTICE
     ======================================================= */

  function showMedicineSafetyNotice() {

    const notice =
      document.querySelector(
        "[data-medicine-safety-notice]"
      );


    if (!notice) {
      return;
    }


    notice.hidden =
      false;


    notice.innerHTML = `
      <div class="medicine-safety-inner">

        <span
          class="medicine-safety-icon"
          aria-hidden="true"
        >
          ✓
        </span>

        <div>

          <strong>
            Medicine Safety
          </strong>

          <p>
            Vital Loop provides educational and
            organizational information only.
            It does not diagnose, prescribe,
            calculate personal doses, or replace
            a doctor or pharmacist.
          </p>

        </div>

      </div>
    `;

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


  function escapeAttribute(
    value
  ) {

    return escapeHTML(
      value
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
        "vitalLoopMedicineToast"
      );


    if (!toast) {

      toast =
        document.createElement(
          "div"
        );


      toast.id =
        "vitalLoopMedicineToast";


      Object.assign(
        toast.style,
        {
          position: "fixed",
          left: "50%",
          bottom: "24px",
          transform:
            "translateX(-50%)",
          zIndex: "99999",
          maxWidth: "90vw",
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
          textAlign:
            "center",
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
        3000
      );

  }


  /* =======================================================
     PUBLIC API
     ======================================================= */

  window.VitalLoopMedicine = {

    search:
      searchMedicine,

    open:
      openMedicineDetails,

    close:
      closeMedicineModal,

    refresh:
      function () {

        loadPrescriptionMedicines();

        renderMedicinePage();

      },

    getPrescriptionMedicines:
      function () {

        return state.medicines.slice();

      },

    getCatalogue:
      function () {

        return getMedicineCatalogue();

      }

  };


  /*
    Display the safety notice whenever the page provides
    the corresponding container.
  */

  showMedicineSafetyNotice();

})();
