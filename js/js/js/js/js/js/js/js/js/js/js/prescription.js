/* =========================================================
   VITAL LOOP — PRESCRIPTION INTELLIGENCE
   js/prescription.js
   ========================================================= */

(function () {
  "use strict";

  const STORAGE_KEY =
    "vitalLoopPrescription";

  const state = {
    file: null,
    fileType: "",
    fileName: "",
    extractedText: "",
    medicines: [],
    processing: false
  };


  /* =======================================================
     INITIALIZATION
     ======================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    initializePrescription
  );


  function initializePrescription() {

    bindUpload();

    bindFileInput();

    bindRemoveFile();

    bindAnalyzeButton();

    bindClearButton();

    bindDemoButton();

    restoreSavedPrescription();

    initializeDropZone();

  }


  /* =======================================================
     FILE INPUT
     ======================================================= */

  function bindFileInput() {

    document
      .querySelectorAll(
        "[data-prescription-input]"
      )
      .forEach(
        function (input) {

          input.addEventListener(
            "change",
            function () {

              if (
                input.files &&
                input.files.length
              ) {

                handleFile(
                  input.files[0]
                );

              }

            }
          );

        }
      );

  }


  /* =======================================================
     UPLOAD BUTTON
     ======================================================= */

  function bindUpload() {

    document
      .querySelectorAll(
        "[data-prescription-upload]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              const input =
                document.querySelector(
                  "[data-prescription-input]"
                );

              if (input) {

                input.click();

              }

            }
          );

        }
      );

  }


  /* =======================================================
     DRAG & DROP
     ======================================================= */

  function initializeDropZone() {

    document
      .querySelectorAll(
        "[data-prescription-dropzone]"
      )
      .forEach(
        function (zone) {

          zone.addEventListener(
            "dragover",
            function (event) {

              event.preventDefault();

              zone.classList.add(
                "drag-active"
              );

            }
          );


          zone.addEventListener(
            "dragleave",
            function () {

              zone.classList.remove(
                "drag-active"
              );

            }
          );


          zone.addEventListener(
            "drop",
            function (event) {

              event.preventDefault();

              zone.classList.remove(
                "drag-active"
              );


              const files =
                event.dataTransfer &&
                event.dataTransfer.files;


              if (
                files &&
                files.length
              ) {

                handleFile(
                  files[0]
                );

              }

            }
          );

        }
      );

  }


  /* =======================================================
     HANDLE FILE
     ======================================================= */

  function handleFile(
    file
  ) {

    if (!file) {
      return;
    }


    const validation =
      validateFile(
        file
      );


    if (!validation.valid) {

      showMessage(
        validation.message
      );

      return;

    }


    state.file =
      file;

    state.fileName =
      file.name;

    state.fileType =
      file.type ||
      getFileType(
        file.name
      );

    state.extractedText =
      "";

    state.medicines =
      [];


    renderFilePreview();

    updateAnalyzeButton();

    showMessage(
      "Prescription file added."
    );

  }


  /* =======================================================
     VALIDATE FILE
     ======================================================= */

  function validateFile(
    file
  ) {

    const maxSize =
      10 * 1024 * 1024;


    if (
      file.size >
      maxSize
    ) {

      return {
        valid: false,
        message:
          "File is too large. Please choose a file under 10 MB."
      };

    }


    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf"
    ];


    const extension =
      getFileExtension(
        file.name
      );


    const allowedExtensions = [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "pdf"
    ];


    const typeAllowed =
      allowedTypes.includes(
        file.type
      );


    const extensionAllowed =
      allowedExtensions.includes(
        extension
      );


    if (
      !typeAllowed &&
      !extensionAllowed
    ) {

      return {
        valid: false,
        message:
          "Please upload a JPG, PNG, WEBP or PDF prescription."
      };

    }


    return {
      valid: true
    };

  }


  function getFileExtension(
    fileName
  ) {

    return String(
      fileName || ""
    )
      .split(".")
      .pop()
      .toLowerCase();

  }


  function getFileType(
    fileName
  ) {

    const extension =
      getFileExtension(
        fileName
      );


    const types = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      pdf: "application/pdf"
    };


    return (
      types[extension] ||
      ""
    );

  }


  /* =======================================================
     PREVIEW
     ======================================================= */

  function renderFilePreview() {

    const preview =
      document.querySelector(
        "[data-prescription-preview]"
      );

    const empty =
      document.querySelector(
        "[data-prescription-empty]"
      );


    if (!preview) {
      return;
    }


    preview.hidden =
      false;


    if (empty) {

      empty.hidden =
        true;

    }


    setText(
      "[data-prescription-file-name]",
      state.fileName
    );


    setText(
      "[data-prescription-file-size]",
      formatFileSize(
        state.file
          ? state.file.size
          : 0
      )
    );


    const image =
      preview.querySelector(
        "[data-prescription-image]"
      );


    const pdf =
      preview.querySelector(
        "[data-prescription-pdf]"
      );


    if (image) {

      image.hidden =
        true;

    }


    if (pdf) {

      pdf.hidden =
        true;

    }


    if (
      state.file &&
      state.fileType.startsWith(
        "image/"
      ) &&
      image
    ) {

      const reader =
        new FileReader();


      reader.onload =
        function (event) {

          image.src =
            event.target.result;

          image.alt =
            "Uploaded prescription preview";

          image.hidden =
            false;

        };


      reader.readAsDataURL(
        state.file
      );

    } else if (
      state.file &&
      state.fileType ===
        "application/pdf" &&
      pdf
    ) {

      pdf.hidden =
        false;

    }

  }


  /* =======================================================
     REMOVE FILE
     ======================================================= */

  function bindRemoveFile() {

    document
      .querySelectorAll(
        "[data-prescription-remove]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            removeFile
          );

        }
      );

  }


  function removeFile() {

    state.file =
      null;

    state.fileType =
      "";

    state.fileName =
      "";

    state.extractedText =
      "";

    state.medicines =
      [];


    const input =
      document.querySelector(
        "[data-prescription-input]"
      );


    if (input) {

      input.value =
        "";

    }


    const preview =
      document.querySelector(
        "[data-prescription-preview]"
      );


    const empty =
      document.querySelector(
        "[data-prescription-empty]"
      );


    if (preview) {

      preview.hidden =
        true;

    }


    if (empty) {

      empty.hidden =
        false;

    }


    hideAnalysis();

    updateAnalyzeButton();

  }


  /* =======================================================
     ANALYZE
     ======================================================= */

  function bindAnalyzeButton() {

    document
      .querySelectorAll(
        "[data-prescription-analyze]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            analyzePrescription
          );

        }
      );

  }


  async function analyzePrescription() {

    if (
      state.processing
    ) {

      return;

    }


    if (!state.file) {

      showMessage(
        "Please upload a prescription first."
      );

      return;

    }


    state.processing =
      true;

    setProcessingState(
      true
    );


    try {

      /*
        Browser-only prototype behaviour:

        - Text-based files are processed locally.
        - Images/PDFs are previewed and prepared for
          OCR integration.
        - No clinical interpretation is generated.
      */

      if (
        state.fileType.startsWith(
          "image/"
        )
      ) {

        await processImageFile();

      } else if (
        state.fileType ===
        "application/pdf"
      ) {

        await processPDFFile();

      }


      renderAnalysis();

      savePrescription();

      showMessage(
        "Prescription information prepared for review."
      );

    } catch (error) {

      console.error(
        "Vital Loop prescription processing error:",
        error
      );

      showMessage(
        "The prescription could not be processed. Please review it manually."
      );

    } finally {

      state.processing =
        false;

      setProcessingState(
        false
      );

    }

  }


  /* =======================================================
     IMAGE PROCESSING
     ======================================================= */

  async function processImageFile() {

    /*
      OCR is intentionally not implemented as a
      clinical decision engine.

      A production deployment can connect an approved
      OCR service here to extract visible text only.
    */

    state.extractedText =
      "Image uploaded successfully. OCR integration is required to extract prescription text.";

    state.medicines =
      [];

  }


  /* =======================================================
     PDF PROCESSING
     ======================================================= */

  async function processPDFFile() {

    /*
      PDF parsing/OCR can be connected through a
      trusted backend or approved document-processing
      service.

      The browser prototype does not invent medicine
      information from the PDF.
    */

    state.extractedText =
      "PDF uploaded successfully. Document text extraction is required for this file.";

    state.medicines =
      [];

  }


  /* =======================================================
     PROCESSING UI
     ======================================================= */

  function setProcessingState(
    processing
  ) {

    document
      .querySelectorAll(
        "[data-prescription-analyze]"
      )
      .forEach(
        function (button) {

          button.disabled =
            processing;

          button.classList.toggle(
            "is-processing",
            processing
          );


          const label =
            button.querySelector(
              "[data-analyze-label]"
            );


          if (label) {

            label.textContent =
              processing
                ? "Reviewing..."
                : "Analyze Prescription";

          } else {

            button.textContent =
              processing
                ? "Reviewing..."
                : "Analyze Prescription";

          }

        }
      );


    document
      .querySelectorAll(
        "[data-prescription-processing]"
      )
      .forEach(
        function (element) {

          element.hidden =
            !processing;

        }
      );

  }


  /* =======================================================
     RENDER ANALYSIS
     ======================================================= */

  function renderAnalysis() {

    const panel =
      document.querySelector(
        "[data-prescription-analysis]"
      );


    if (panel) {

      panel.hidden =
        false;

    }


    setText(
      "[data-extracted-text]",
      state.extractedText ||
        "No text extracted."
    );


    renderMedicineList();

    renderSafetySummary();

  }


  function renderMedicineList() {

    const container =
      document.querySelector(
        "[data-medicine-list]"
      );


    if (!container) {
      return;
    }


    if (!state.medicines.length) {

      container.innerHTML = `
        <div class="medicine-empty-state">

          <span
            class="medicine-empty-icon"
            aria-hidden="true"
          >
            💊
          </span>

          <h3>
            Medicine details need review
          </h3>

          <p>
            This prototype does not invent or infer
            medicine names, doses, or treatment instructions.
            Review the prescription text with a doctor or pharmacist.
          </p>

        </div>
      `;

      return;

    }


    container.innerHTML =
      state.medicines
        .map(
          function (medicine) {

            return `
              <article class="prescription-medicine-card">

                <div class="medicine-card-header">

                  <div>
                    <span class="medicine-label">
                      Medicine
                    </span>

                    <h3>
                      ${escapeHTML(
                        medicine.name
                      )}
                    </h3>
                  </div>

                  <span class="medicine-review-badge">
                    Review
                  </span>

                </div>

                <div class="medicine-card-grid">

                  <div>
                    <span>
                      Strength
                    </span>

                    <strong>
                      ${escapeHTML(
                        medicine.strength ||
                        "Not identified"
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Prescription instruction
                    </span>

                    <strong>
                      ${escapeHTML(
                        medicine.instructions ||
                        "Not identified"
                      )}
                    </strong>
                  </div>

                </div>

              </article>
            `;

          }
        )
        .join("");

  }


  /* =======================================================
     SAFETY SUMMARY
     ======================================================= */

  function renderSafetySummary() {

    const container =
      document.querySelector(
        "[data-prescription-safety]"
      );


    if (!container) {
      return;
    }


    container.innerHTML = `
      <div class="prescription-safety-content">

        <div class="prescription-safety-icon">
          ✓
        </div>

        <div>

          <h3>
            Safety Review
          </h3>

          <p>
            Vital Loop only organizes visible prescription
            information. It does not diagnose conditions,
            prescribe medicines, calculate age-based doses,
            or change a doctor's instructions.
          </p>

          <p>
            If any medicine name, strength, instruction,
            or timing is unclear, confirm it with the
            prescribing doctor or a qualified pharmacist.
          </p>

        </div>

      </div>
    `;

  }


  /* =======================================================
     HIDE ANALYSIS
     ======================================================= */

  function hideAnalysis() {

    document
      .querySelectorAll(
        "[data-prescription-analysis]"
      )
      .forEach(
        function (panel) {

          panel.hidden =
            true;

        }
      );

  }


  /* =======================================================
     CLEAR
     ======================================================= */

  function bindClearButton() {

    document
      .querySelectorAll(
        "[data-prescription-clear]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            clearPrescription
          );

        }
      );

  }


  function clearPrescription() {

    removeFile();

    try {

      localStorage.removeItem(
        STORAGE_KEY
      );

    } catch (error) {
      /* Optional storage. */
    }


    showMessage(
      "Prescription workspace cleared."
    );

  }


  /* =======================================================
     DEMO MODE
     ======================================================= */

  function bindDemoButton() {

    document
      .querySelectorAll(
        "[data-prescription-demo]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            loadDemoPrescription
          );

        }
      );

  }


  function loadDemoPrescription() {

    /*
      Demo data is deliberately limited to
      organizational information. No dosage or
      treatment recommendation is generated.
    */

    state.file =
      null;

    state.fileName =
      "Demo Prescription";

    state.fileType =
      "demo";

    state.extractedText =
      "Demo prescription text: medicine names and visible prescription instructions should be reviewed against the original document.";

    state.medicines = [
      {
        name:
          "Medicine name from prescription",

        strength:
          "Visible strength",

        instructions:
          "Use the exact instruction written by the prescriber."
      }
    ];


    renderAnalysis();

    showMessage(
      "Demo prescription loaded."
    );

  }


  /* =======================================================
     SAVE
     ======================================================= */

  function savePrescription() {

    const record = {
      fileName:
        state.fileName,

      fileType:
        state.fileType,

      extractedText:
        state.extractedText,

      medicines:
        state.medicines,

      updatedAt:
        new Date().toISOString(),

      safetyNote:
        "Information organizer only. No diagnosis, prescription, or age-based dosage calculation."
    };


    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          record
        )
      );

    } catch (error) {

      console.warn(
        "Vital Loop prescription data could not be saved.",
        error
      );

    }

  }


  /* =======================================================
     RESTORE
     ======================================================= */

  function restoreSavedPrescription() {

    try {

      const raw =
        localStorage.getItem(
          STORAGE_KEY
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
        typeof record !== "object"
      ) {

        return;

      }


      state.fileName =
        record.fileName ||
        "";

      state.fileType =
        record.fileType ||
        "";

      state.extractedText =
        record.extractedText ||
        "";

      state.medicines =
        Array.isArray(
          record.medicines
        )
          ? record.medicines
          : [];


      if (
        state.extractedText
      ) {

        renderAnalysis();

      }

    } catch (error) {

      console.warn(
        "Vital Loop prescription record unavailable.",
        error
      );

    }

  }


  /* =======================================================
     ANALYZE BUTTON STATE
     ======================================================= */

  function updateAnalyzeButton() {

    document
      .querySelectorAll(
        "[data-prescription-analyze]"
      )
      .forEach(
        function (button) {

          button.disabled =
            !state.file;

        }
      );

  }


  /* =======================================================
     FILE SIZE
     ======================================================= */

  function formatFileSize(
    bytes
  ) {

    if (
      !Number.isFinite(
        Number(bytes)
      ) ||
      bytes <= 0
    ) {

      return "—";

    }


    const units =
      [
        "B",
        "KB",
        "MB",
        "GB"
      ];


    const index =
      Math.min(
        Math.floor(
          Math.log(bytes) /
          Math.log(1024)
        ),
        units.length - 1
      );


    const size =
      bytes /
      Math.pow(
        1024,
        index
      );


    return (
      size.toFixed(
        index === 0
          ? 0
          : 1
      ) +
      " " +
      units[index]
    );

  }


  /* =======================================================
     TEXT HELPERS
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
        "vitalLoopPrescriptionToast"
      );


    if (!toast) {

      toast =
        document.createElement(
          "div"
        );

      toast.id =
        "vitalLoopPrescriptionToast";


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

  window.VitalLoopPrescription = {

    getState:
      function () {

        return {
          ...state,

          medicines:
            state.medicines.slice()
        };

      },

    getMedicines:
      function () {

        return state.medicines.slice();

      },

    clear:
      function () {

        clearPrescription();

      },

    loadDemo:
      function () {

        loadDemoPrescription();

      },

    hasFile:
      function () {

        return Boolean(
          state.file
        );

      }

  };

})();
