/* =========================================================
   VITAL LOOP — NOTIFICATION SYSTEM
   File: js/notifications.js
   ========================================================= */

(function () {
    "use strict";

    const STORAGE_KEY = "vitalLoopNotifications";

    const DEFAULT_NOTIFICATIONS = [
        {
            id: "welcome",
            type: "info",
            icon: "✦",
            title: "Welcome to Vital Loop",
            message:
                "Use Vital Loop to discover potential resources and coordinate emergency requirements.",
            time: "Just now",
            unread: true
        }
    ];

    /* -------------------------------------------------------
       Storage
    ------------------------------------------------------- */

    function loadNotifications() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (!saved) {
                return DEFAULT_NOTIFICATIONS;
            }

            const parsed = JSON.parse(saved);

            return Array.isArray(parsed)
                ? parsed
                : DEFAULT_NOTIFICATIONS;
        } catch (error) {
            console.warn(
                "Vital Loop notifications could not be loaded.",
                error
            );

            return DEFAULT_NOTIFICATIONS;
        }
    }

    function saveNotifications(notifications) {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(notifications)
            );
        } catch (error) {
            console.warn(
                "Vital Loop notifications could not be saved.",
                error
            );
        }
    }

    /* -------------------------------------------------------
       Helpers
    ------------------------------------------------------- */

    function escapeHTML(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getTimeLabel() {
        return "Just now";
    }

    function getTypeIcon(type) {
        const icons = {
            success: "✓",
            error: "!",
            warning: "⚠",
            info: "ℹ",
            emergency: "🚨"
        };

        return icons[type] || "ℹ";
    }

    /* -------------------------------------------------------
       Create Notification Container
    ------------------------------------------------------- */

    function ensureContainer() {
        let container = document.querySelector(
            ".vital-loop-notifications"
        );

        if (!container) {
            container = document.createElement("div");

            container.className =
                "vital-loop-notifications";

            container.setAttribute(
                "aria-live",
                "polite"
            );

            container.setAttribute(
                "aria-atomic",
                "false"
            );

            document.body.appendChild(container);
        }

        return container;
    }

    /* -------------------------------------------------------
       Toast Notification
    ------------------------------------------------------- */

    function showToast(options = {}) {
        const {
            type = "info",
            title = "Vital Loop",
            message = "",
            duration = 5000,
            actionText = "",
            onAction = null
        } = options;

        const container = ensureContainer();

        const notification =
            document.createElement("div");

        notification.className =
            `vital-loop-notification ${type}`;

        notification.setAttribute(
            "role",
            type === "emergency"
                ? "alert"
                : "status"
        );

        notification.innerHTML = `
            <div class="vital-loop-notification-icon">
                ${escapeHTML(getTypeIcon(type))}
            </div>

            <div class="vital-loop-notification-content">
                <h4 class="vital-loop-notification-title">
                    ${escapeHTML(title)}
                </h4>

                <p class="vital-loop-notification-message">
                    ${escapeHTML(message)}
                </p>

                ${
                    actionText
                        ? `
                        <button
                            type="button"
                            class="vital-loop-notification-action"
                        >
                            ${escapeHTML(actionText)}
                        </button>
                        `
                        : ""
                }
            </div>

            <button
                type="button"
                class="vital-loop-notification-close"
                aria-label="Close notification"
            >
                ×
            </button>
        `;

        container.appendChild(notification);

        const closeButton =
            notification.querySelector(
                ".vital-loop-notification-close"
            );

        closeButton.addEventListener(
            "click",
            () => removeToast(notification)
        );

        if (actionText && typeof onAction === "function") {
            const actionButton =
                notification.querySelector(
                    ".vital-loop-notification-action"
                );

            actionButton.addEventListener(
                "click",
                () => {
                    onAction();
                    removeToast(notification);
                }
            );
        }

        if (duration > 0) {
            window.setTimeout(() => {
                removeToast(notification);
            }, duration);
        }

        return notification;
    }

    function removeToast(notification) {
        if (!notification) return;

        notification.classList.add("hide");

        window.setTimeout(() => {
            notification.remove();
        }, 320);
    }

    /* -------------------------------------------------------
       Notification Panel
    ------------------------------------------------------- */

    function ensurePanel() {
        let panel = document.querySelector(
            ".vital-loop-notification-panel"
        );

        if (panel) return panel;

        panel = document.createElement("section");

        panel.className =
            "vital-loop-notification-panel";

        panel.setAttribute(
            "aria-label",
            "Notifications"
        );

        panel.innerHTML = `
            <div class="vital-loop-notification-panel-header">
                <h3>Notifications</h3>

                <button
                    type="button"
                    class="vital-loop-notification-clear"
                >
                    Mark all read
                </button>
            </div>

            <div class="vital-loop-notification-list"></div>
        `;

        document.body.appendChild(panel);

        const clearButton =
            panel.querySelector(
                ".vital-loop-notification-clear"
            );

        clearButton.addEventListener(
            "click",
            markAllRead
        );

        return panel;
    }

    function renderNotificationPanel() {
        const panel = ensurePanel();

        const list =
            panel.querySelector(
                ".vital-loop-notification-list"
            );

        const notifications =
            loadNotifications();

        if (!notifications.length) {
            list.innerHTML = `
                <div class="vital-loop-notification-empty">
                    <div class="vital-loop-notification-empty-icon">
                        🔔
                    </div>

                    <h4>No notifications</h4>

                    <p>
                        You're all caught up.
                    </p>
                </div>
            `;

            updateBadge(0);
            return;
        }

        list.innerHTML = notifications
            .map((notification) => {
                const type =
                    notification.type || "info";

                return `
                    <article
                        class="
                            vital-loop-notification-item
                            ${notification.unread ? "unread" : ""}
                        "
                        data-notification-id="${escapeHTML(
                            notification.id
                        )}"
                    >
                        <div
                            class="
                                vital-loop-notification-item-icon
                            "
                        >
                            ${escapeHTML(
                                notification.icon ||
                                getTypeIcon(type)
                            )}
                        </div>

                        <div
                            class="
                                vital-loop-notification-item-content
                            "
                        >
                            <h4
                                class="
                                    vital-loop-notification-item-title
                                "
                            >
                                ${escapeHTML(
                                    notification.title
                                )}
                            </h4>

                            <p
                                class="
                                    vital-loop-notification-item-text
                                "
                            >
                                ${escapeHTML(
                                    notification.message
                                )}
                            </p>

                            <span
                                class="
                                    vital-loop-notification-item-time
                                "
                            >
                                ${escapeHTML(
                                    notification.time ||
                                    ""
                                )}
                            </span>
                        </div>
                    </article>
                `;
            })
            .join("");

        updateBadge(
            notifications.filter(
                (item) => item.unread
            ).length
        );
    }

    /* -------------------------------------------------------
       Badge
    ------------------------------------------------------- */

    function updateBadge(count) {
        const badges = document.querySelectorAll(
            ".vital-loop-notification-badge"
        );

        badges.forEach((badge) => {
            if (count <= 0) {
                badge.textContent = "";
                badge.style.display = "none";
            } else {
                badge.textContent =
                    count > 99 ? "99+" : String(count);

                badge.style.display = "flex";
            }
        });
    }

    /* -------------------------------------------------------
       Add Persistent Notification
    ------------------------------------------------------- */

    function addNotification(options = {}) {
        const notifications =
            loadNotifications();

        const notification = {
            id:
                options.id ||
                `notification-${Date.now()}`,

            type:
                options.type ||
                "info",

            icon:
                options.icon ||
                getTypeIcon(
                    options.type || "info"
                ),

            title:
                options.title ||
                "Vital Loop",

            message:
                options.message ||
                "",

            time:
                options.time ||
                getTimeLabel(),

            unread:
                options.unread !== false
        };

        notifications.unshift(notification);

        /*
         * Keep the notification list lightweight.
         */
        const limited =
            notifications.slice(0, 30);

        saveNotifications(limited);

        updateBadge(
            limited.filter(
                (item) => item.unread
            ).length
        );

        return notification;
    }

    /* -------------------------------------------------------
       Mark Read
    ------------------------------------------------------- */

    function markAsRead(id) {
        const notifications =
            loadNotifications();

        const updated =
            notifications.map((notification) => {
                if (notification.id === id) {
                    return {
                        ...notification,
                        unread: false
                    };
                }

                return notification;
            });

        saveNotifications(updated);

        renderNotificationPanel();
    }

    function markAllRead() {
        const notifications =
            loadNotifications();

        const updated =
            notifications.map(
                (notification) => ({
                    ...notification,
                    unread: false
                })
            );

        saveNotifications(updated);

        renderNotificationPanel();
    }

    /* -------------------------------------------------------
       Clear Notifications
    ------------------------------------------------------- */

    function clearNotifications() {
        saveNotifications([]);

        renderNotificationPanel();
    }

    /* -------------------------------------------------------
       Toggle Panel
    ------------------------------------------------------- */

    function togglePanel() {
        const panel = ensurePanel();

        const isOpen =
            panel.classList.contains("open");

        if (isOpen) {
            closePanel();
        } else {
            renderNotificationPanel();
            panel.classList.add("open");
        }
    }

    function openPanel() {
        const panel = ensurePanel();

        renderNotificationPanel();

        panel.classList.add("open");
    }

    function closePanel() {
        const panel = document.querySelector(
            ".vital-loop-notification-panel"
        );

        if (!panel) return;

        panel.classList.remove("open");
    }

    /* -------------------------------------------------------
       Notification Bell
    ------------------------------------------------------- */

    function setupBell() {
        const bells = document.querySelectorAll(
            ".vital-loop-notification-bell"
        );

        bells.forEach((bell) => {
            bell.addEventListener(
                "click",
                (event) => {
                    event.stopPropagation();
                    togglePanel();
                }
            );
        });

        document.addEventListener(
            "click",
            (event) => {
                const panel =
                    document.querySelector(
                        ".vital-loop-notification-panel"
                    );

                if (!panel) return;

                const clickedInsidePanel =
                    panel.contains(event.target);

                const clickedBell =
                    event.target.closest(
                        ".vital-loop-notification-bell"
                    );

                if (
                    !clickedInsidePanel &&
                    !clickedBell
                ) {
                    closePanel();
                }
            }
        );
    }

    /* -------------------------------------------------------
       Request Notifications
    ------------------------------------------------------- */

    function notifyRequestCreated(requestId) {
        addNotification({
            id: `request-created-${requestId || Date.now()}`,
            type: "success",
            icon: "✓",
            title: "Request Created",
            message:
                "Your emergency request has been recorded for coordination.",
            unread: true
        });

        showToast({
            type: "success",
            title: "Request Created",
            message:
                "Your request is ready for the next coordination step."
        });
    }

    function notifyPotentialResource() {
        addNotification({
            id:
                "potential-resource-" +
                Date.now(),

            type: "info",
            icon: "🩸",

            title:
                "Potential Resource Found",

            message:
                "A potentially relevant blood resource was discovered. Availability still needs verification.",

            unread: true
        });
    }

    function notifyEmergency() {
        addNotification({
            id:
                "emergency-" +
                Date.now(),

            type: "emergency",
            icon: "🚨",

            title:
                "Emergency Request",

            message:
                "An emergency coordination request requires attention.",

            unread: true
        });

        showToast({
            type: "emergency",
            title: "Emergency Coordination",
            message:
                "Please follow the authorised healthcare facility's instructions.",
            duration: 7000
        });
    }

    /* -------------------------------------------------------
       Initialise
    ------------------------------------------------------- */

    function init() {
        ensureContainer();
        ensurePanel();

        setupBell();

        const notifications =
            loadNotifications();

        updateBadge(
            notifications.filter(
                (item) => item.unread
            ).length
        );
    }

    /* -------------------------------------------------------
       Public API
    ------------------------------------------------------- */

    window.VitalLoopNotifications = {
        init,
        showToast,
        addNotification,
        markAsRead,
        markAllRead,
        clearNotifications,
        renderNotificationPanel,
        updateBadge,
        openPanel,
        closePanel,
        togglePanel,
        notifyRequestCreated,
        notifyPotentialResource,
        notifyEmergency
    };

    /* -------------------------------------------------------
       Start
    ------------------------------------------------------- */

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            init
        );
    } else {
        init();
    }

})();
