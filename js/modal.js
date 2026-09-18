/* =========================================================
   VITAL LOOP — MODAL MANAGER
   File: js/modal.js
   ========================================================= */

(function () {
    "use strict";

    let activeModal = null;
    let previousFocusedElement = null;

    /* -------------------------------------------------------
       Helpers
    ------------------------------------------------------- */

    function getFocusableElements(container) {
        return Array.from(
            container.querySelectorAll(
                `
                a[href],
                button:not([disabled]),
                input:not([disabled]),
                select:not([disabled]),
                textarea:not([disabled]),
                [tabindex]:not([tabindex="-1"])
                `
            )
        ).filter(
            (element) =>
                !element.hasAttribute("hidden") &&
                element.offsetParent !== null
        );
    }

    function lockBody() {
        document.body.classList.add(
            "vital-loop-modal-open"
        );
    }

    function unlockBody() {
        document.body.classList.remove(
            "vital-loop-modal-open"
        );
    }

    /* -------------------------------------------------------
       Open Existing Modal
    ------------------------------------------------------- */

    function openModal(modal) {
        if (!modal) return;

        previousFocusedElement =
            document.activeElement;

        if (activeModal && activeModal !== modal) {
            closeModal(activeModal, false);
        }

        activeModal = modal;

        modal.classList.add("open");

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        lockBody();

        const focusable =
            getFocusableElements(modal);

        if (focusable.length) {
            window.setTimeout(() => {
                focusable[0].focus();
            }, 50);
        }
    }

    /* -------------------------------------------------------
       Close Modal
    ------------------------------------------------------- */

    function closeModal(
        modal = activeModal,
        restoreFocus = true
    ) {
        if (!modal) return;

        modal.classList.remove("open");

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        if (modal === activeModal) {
            activeModal = null;
        }

        unlockBody();

        if (
            restoreFocus &&
            previousFocusedElement &&
            typeof previousFocusedElement.focus ===
                "function"
        ) {
            window.setTimeout(() => {
                previousFocusedElement.focus();
            }, 50);
        }
    }

    /* -------------------------------------------------------
       Create Modal
    ------------------------------------------------------- */

    function createModal(options = {}) {
        const {
            title = "Vital Loop",
            subtitle = "",
            content = "",
            type = "",
            showClose = true,
            buttons = []
        } = options;

        const modal =
            document.createElement("div");

        modal.className =
            `vital-loop-modal ${type}`;

        modal.setAttribute(
            "role",
            "dialog"
        );

        modal.setAttribute(
            "aria-modal",
            "true"
        );

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        const buttonsHTML =
            buttons
                .map(
                    (button, index) => `
                        <button
                            type="button"
                            class="
                                vital-loop-modal-btn
                                ${button.variant || "secondary"}
                            "
                            data-modal-button="${index}"
                        >
                            ${escapeHTML(
                                button.text || "Continue"
                            )}
                        </button>
                    `
                )
                .join("");

        modal.innerHTML = `
            <div
                class="vital-loop-modal-dialog"
                role="document"
            >

                <div class="vital-loop-modal-header">

                    <div>
                        <h2 class="vital-loop-modal-title">
                            ${escapeHTML(title)}
                        </h2>

                        ${
                            subtitle
                                ? `
                                <p class="vital-loop-modal-subtitle">
                                    ${escapeHTML(subtitle)}
                                </p>
                                `
                                : ""
                        }
                    </div>

                    ${
                        showClose
                            ? `
                            <button
                                type="button"
                                class="vital-loop-modal-close"
                                aria-label="Close dialog"
                            >
                                ×
                            </button>
                            `
                            : ""
                    }

                </div>

                <div class="vital-loop-modal-body">
                    ${content}
                </div>

                ${
                    buttons.length
                        ? `
                        <div class="vital-loop-modal-footer">
                            ${buttonsHTML}
                        </div>
                        `
                        : ""
                }

            </div>
        `;

        document.body.appendChild(modal);

        const closeButton =
            modal.querySelector(
                ".vital-loop-modal-close"
            );

        if (closeButton) {
            closeButton.addEventListener(
                "click",
                () => closeModal(modal)
            );
        }

        modal.addEventListener(
            "click",
            (event) => {
                if (
                    event.target === modal
                ) {
                    closeModal(modal);
                }
            }
        );

        buttons.forEach(
            (button, index) => {
                const element =
                    modal.querySelector(
                        `[data-modal-button="${index}"]`
                    );

                if (
                    element &&
                    typeof button.onClick ===
                        "function"
                ) {
                    element.addEventListener(
                        "click",
                        () => {
                            button.onClick(modal);
                        }
                    );
                }
            }
        );

        return modal;
    }

    /* -------------------------------------------------------
       Escape HTML
    ------------------------------------------------------- */

    function escapeHTML(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /* -------------------------------------------------------
       Confirmation Modal
    ------------------------------------------------------- */

    function confirm(options = {}) {
        return new Promise((resolve) => {
            const {
                title = "Confirm Action",
                message =
                    "Are you sure you want to continue?",
                confirmText = "Continue",
                cancelText = "Cancel",
                danger = false
            } = options;

            const modal =
                createModal({
                    title,
                    content: `
                        <div class="
                            vital-loop-confirmation
                        ">
                            <div class="
                                vital-loop-modal-icon
                            ">
                                ${danger ? "⚠" : "?"}
                            </div>

                            <p>
                                ${escapeHTML(message)}
                            </p>
                        </div>
                    `,
                    buttons: [
                        {
                            text: cancelText,
                            variant: "secondary",
                            onClick: () => {
                                closeModal(modal);
                                modal.remove();
                                resolve(false);
                            }
                        },
                        {
                            text: confirmText,
                            variant: danger
                                ? "danger"
                                : "primary",
                            onClick: () => {
                                closeModal(modal);
                                modal.remove();
                                resolve(true);
                            }
                        }
                    ]
                });

            openModal(modal);
        });
    }

    /* -------------------------------------------------------
       Emergency Alert
    ------------------------------------------------------- */

    function emergencyAlert(message) {
        const modal =
            createModal({
                type: "emergency",
                title:
                    "Emergency Coordination",
                subtitle:
                    "Please follow authorised healthcare guidance.",
                content: `
                    <div class="
                        vital-loop-modal-centered
                    ">
                        <div class="
                            vital-loop-modal-icon
                        ">
                            🚨
                        </div>

                        <p>
                            ${escapeHTML(message)}
                        </p>
                    </div>
                `,
                buttons: [
                    {
                        text: "Understood",
                        variant: "danger",
                        onClick: () => {
                            closeModal(modal);
                            modal.remove();
                        }
                    }
                ]
            });

        openModal(modal);

        return modal;
    }

    /* -------------------------------------------------------
       Loading Modal
    ------------------------------------------------------- */

    function showLoading(
        message = "Please wait..."
    ) {
        const modal =
            createModal({
                type: "loading",
                showClose: false,
                title: "Processing",
                content: `
                    <div class="
                        vital-loop-modal-centered
                    ">
                        <div class="
                            vital-loop-modal-loader
                        "></div>

                        <p>
                            ${escapeHTML(message)}
                        </p>
                    </div>
                `
            });

        openModal(modal);

        return {
            close: () => {
                closeModal(modal);
                modal.remove();
            }
        };
    }

    /* -------------------------------------------------------
       Keyboard Handling
    ------------------------------------------------------- */

    function handleKeyboard(event) {
        if (!activeModal) return;

        if (event.key === "Escape") {
            event.preventDefault();
            closeModal(activeModal);
            return;
        }

        if (event.key !== "Tab") {
            return;
        }

        const focusable =
            getFocusableElements(
                activeModal
            );

        if (!focusable.length) {
            event.preventDefault();
            return;
        }

        const first = focusable[0];
        const last =
            focusable[focusable.length - 1];

        if (
            event.shiftKey &&
            document.activeElement === first
        ) {
            event.preventDefault();
            last.focus();
        } else if (
            !event.shiftKey &&
            document.activeElement === last
        ) {
            event.preventDefault();
            first.focus();
        }
    }

    /* -------------------------------------------------------
       Existing Modal Controls
    ------------------------------------------------------- */

    function setupExistingModals() {
        const modals =
            document.querySelectorAll(
                ".vital-loop-modal"
            );

        modals.forEach((modal) => {
            if (
                !modal.hasAttribute(
                    "aria-hidden"
                )
            ) {
                modal.setAttribute(
                    "aria-hidden",
                    "true"
                );
            }

            const closeButtons =
                modal.querySelectorAll(
                    ".vital-loop-modal-close, [data-modal-close]"
                );

            closeButtons.forEach(
                (button) => {
                    button.addEventListener(
                        "click",
                        () => closeModal(modal)
                    );
                }
            );

            modal.addEventListener(
                "click",
                (event) => {
                    if (
                        event.target === modal
                    ) {
                        closeModal(modal);
                    }
                }
            );
        });

        const openButtons =
            document.querySelectorAll(
                "[data-modal-open]"
            );

        openButtons.forEach((button) => {
            button.addEventListener(
                "click",
                () => {
                    const targetID =
                        button.dataset.modalOpen;

                    const modal =
                        document.getElementById(
                            targetID
                        );

                    if (modal) {
                        openModal(modal);
                    }
                }
            );
        });
    }

    /* -------------------------------------------------------
       Initialise
    ------------------------------------------------------- */

    function init() {
        setupExistingModals();

        document.addEventListener(
            "keydown",
            handleKeyboard
        );
    }

    /* -------------------------------------------------------
       Public API
    ------------------------------------------------------- */

    window.VitalLoopModal = {
        init,
        open: openModal,
        close: closeModal,
        create: createModal,
        confirm,
        emergencyAlert,
        showLoading
    };

    /* -------------------------------------------------------
       Start
    ------------------------------------------------------- */

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            init
        );
    } else {
        init();
    }

})();
