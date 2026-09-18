/* =========================================================
   VITAL LOOP — SEARCH MANAGER
   File: js/search.js
   ========================================================= */

(function () {
    "use strict";

    const DATA_URL =
        "data/blood-centres.json";

    let resources = [];
    let filteredResources = [];

    let selectedBloodGroup = "all";
    let selectedType = "all";
    let searchTerm = "";

    /* -------------------------------------------------------
       Helpers
    ------------------------------------------------------- */

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getElement(selector) {
        return document.querySelector(selector);
    }

    function getAllElements(selector) {
        return document.querySelectorAll(selector);
    }

    function normalize(value) {
        return String(value ?? "")
            .trim()
            .toLowerCase();
    }

    /* -------------------------------------------------------
       Load Blood Centre Data
    ------------------------------------------------------- */

    async function loadResources() {
        try {
            const response =
                await fetch(DATA_URL, {
                    cache: "no-store"
                });

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}`
                );
            }

            const data =
                await response.json();

            if (Array.isArray(data)) {
                resources = data;
            } else if (
                Array.isArray(data.bloodCentres)
            ) {
                resources = data.bloodCentres;
            } else if (
                Array.isArray(data.centres)
            ) {
                resources = data.centres;
            } else {
                resources = [];
            }

            applyFilters();

        } catch (error) {
            console.warn(
                "Blood resource data could not be loaded.",
                error
            );

            resources = [];

            renderResults();
        }
    }

    /* -------------------------------------------------------
       Search
    ------------------------------------------------------- */

    function performSearch(value) {
        searchTerm =
            normalize(value);

        updateClearButton();

        applyFilters();
    }

    function matchesSearch(resource) {
        if (!searchTerm) {
            return true;
        }

        const searchableText = [
            resource.name,
            resource.title,
            resource.city,
            resource.location,
            resource.address,
            resource.area,
            resource.type,
            resource.bloodGroup,
            resource.blood_group
        ]
            .filter(Boolean)
            .join(" ");

        return normalize(
            searchableText
        ).includes(searchTerm);
    }

    /* -------------------------------------------------------
       Blood Group Filter
    ------------------------------------------------------- */

    function setBloodGroup(group) {
        selectedBloodGroup =
            normalize(group) || "all";

        getAllElements(
            ".vital-loop-blood-group"
        ).forEach((button) => {
            const value =
                normalize(
                    button.dataset.bloodGroup ||
                    button.dataset.group ||
                    button.textContent
                );

            button.classList.toggle(
                "active",
                value === selectedBloodGroup
            );

            button.setAttribute(
                "aria-pressed",
                String(
                    value === selectedBloodGroup
                )
            );
        });

        applyFilters();
    }

    function matchesBloodGroup(resource) {
        if (
            selectedBloodGroup === "all"
        ) {
            return true;
        }

        const resourceGroup =
            normalize(
                resource.bloodGroup ||
                resource.blood_group ||
                resource.group
            );

        /*
         * The dataset may represent a centre
         * rather than a specific unit. In that case,
         * retain the resource if its declared
         * supported groups contain the requested group.
         */
        if (
            Array.isArray(
                resource.bloodGroups
            )
        ) {
            return resource.bloodGroups.some(
                (group) =>
                    normalize(group) ===
                    selectedBloodGroup
            );
        }

        if (
            typeof resource.bloodGroups ===
            "string"
        ) {
            return resource.bloodGroups
                .split(",")
                .map(normalize)
                .includes(
                    selectedBloodGroup
                );
        }

        return (
            resourceGroup ===
            selectedBloodGroup
        );
    }

    /* -------------------------------------------------------
       Type Filter
    ------------------------------------------------------- */

    function setType(type) {
        selectedType =
            normalize(type) || "all";

        getAllElements(
            ".vital-loop-search-filter"
        ).forEach((button) => {
            const value =
                normalize(
                    button.dataset.type ||
                    button.dataset.filter ||
                    ""
                );

            if (!value) return;

            button.classList.toggle(
                "active",
                value === selectedType
            );
        });

        applyFilters();
    }

    function matchesType(resource) {
        if (selectedType === "all") {
            return true;
        }

        const resourceType =
            normalize(
                resource.type ||
                resource.category ||
                resource.resourceType
            );

        return (
            resourceType ===
            selectedType
        );
    }

    /* -------------------------------------------------------
       Distance / Sorting
    ------------------------------------------------------- */

    function getDistance(resource) {
        const distance =
            Number(
                resource.distance ??
                resource.distanceKm ??
                resource.distance_km
            );

        return Number.isFinite(distance)
            ? distance
            : Infinity;
    }

    function sortResources(value) {
        const sort =
            normalize(value);

        if (
            sort === "distance" ||
            sort === "nearest"
        ) {
            filteredResources.sort(
                (a, b) =>
                    getDistance(a) -
                    getDistance(b)
            );
        }

        if (
            sort === "name" ||
            sort === "alphabetical"
        ) {
            filteredResources.sort(
                (a, b) =>
                    normalize(
                        a.name ||
                        a.title
                    ).localeCompare(
                        normalize(
                            b.name ||
                            b.title
                        )
                    )
            );
        }

        if (
            sort === "status"
        ) {
            filteredResources.sort(
                (a, b) =>
                    getStatusRank(b) -
                    getStatusRank(a)
            );
        }

        renderResults();
    }

    function getStatusRank(resource) {
        const verified =
            resource.verified === true ||
            normalize(
                resource.verificationStatus
            ) === "verified";

        const status =
            normalize(
                resource.availabilityStatus ||
                resource.status
            );

        if (verified) return 3;
        if (status === "potential") return 2;
        return 1;
    }

    /* -------------------------------------------------------
       Apply Filters
    ------------------------------------------------------- */

    function applyFilters() {
        filteredResources =
            resources.filter(
                (resource) =>
                    matchesSearch(resource) &&
                    matchesBloodGroup(resource) &&
                    matchesType(resource)
            );

        renderResults();
    }

    /* -------------------------------------------------------
       Render Results
    ------------------------------------------------------- */

    function getResultContainer() {
        return (
            getElement(
                "#searchResults"
            ) ||
            getElement(
                ".vital-loop-search-results"
            )
        );
    }

    function getDisplayName(resource) {
        return (
            resource.name ||
            resource.title ||
            "Blood Resource"
        );
    }

    function getLocation(resource) {
        return (
            resource.location ||
            resource.address ||
            [
                resource.area,
                resource.city
            ]
                .filter(Boolean)
                .join(", ") ||
            "Location information unavailable"
        );
    }

    function getResourceType(resource) {
        return (
            resource.type ||
            resource.category ||
            "Blood Resource"
        );
    }

    function getStatus(resource) {
        const verified =
            resource.verified === true ||
            normalize(
                resource.verificationStatus
            ) === "verified";

        if (verified) {
            return {
                label: "Verified",
                className: "verified"
            };
        }

        return {
            label: "Potential",
            className: "potential"
        };
    }

    function getBloodGroup(resource) {
        return (
            resource.bloodGroup ||
            resource.blood_group ||
            "Not specified"
        );
    }

    function getDistanceText(resource) {
        const distance =
            getDistance(resource);

        if (!Number.isFinite(distance)) {
            return "Distance unavailable";
        }

        return `${distance.toFixed(1)} km`;
    }

    function getNavigationUrl(resource) {
        const latitude =
            resource.latitude ??
            resource.lat;

        const longitude =
            resource.longitude ??
            resource.lng ??
            resource.lon;

        if (
            Number.isFinite(
                Number(latitude)
            ) &&
            Number.isFinite(
                Number(longitude)
            )
        ) {
            return (
                "https://www.google.com/maps/search/?api=1&query=" +
                encodeURIComponent(
                    `${latitude},${longitude}`
                )
            );
        }

        return (
            "https://www.google.com/maps/search/?api=1&query=" +
            encodeURIComponent(
                getDisplayName(resource) +
                " " +
                getLocation(resource)
            )
        );
    }

    function renderResults() {
        const container =
            getResultContainer();

        if (!container) {
            return;
        }

        updateResultCount(
            filteredResources.length
        );

        if (!filteredResources.length) {
            container.innerHTML = `
                <div class="
                    vital-loop-search-empty
                ">
                    <div class="
                        vital-loop-search-empty-icon
                    ">
                        🔎
                    </div>

                    <h3>
                        No matching resources found
                    </h3>

                    <p>
                        Try another blood group,
                        location or search term.
                    </p>
                </div>
            `;

            return;
        }

        container.innerHTML =
            filteredResources
                .map(renderResourceCard)
                .join("");

        setupResultActions();
    }

    function renderResourceCard(resource) {
        const status =
            getStatus(resource);

        const name =
            escapeHTML(
                getDisplayName(resource)
            );

        const location =
            escapeHTML(
                getLocation(resource)
            );

        const type =
            escapeHTML(
                getResourceType(resource)
            );

        const group =
            escapeHTML(
                getBloodGroup(resource)
            );

        const distance =
            escapeHTML(
                getDistanceText(resource)
            );

        const navigation =
            getNavigationUrl(resource);

        const safeNavigation =
            escapeHTML(navigation);

        return `
            <article
                class="
                    vital-loop-search-result
                "
                data-resource-id="${escapeHTML(
                    resource.id ||
                    resource._id ||
                    ""
                )}"
            >

                <div class="
                    vital-loop-search-result-top
                ">

                    <div class="
                        vital-loop-search-result-icon
                    ">
                        🩸
                    </div>

                    <div class="
                        vital-loop-search-result-info
                    ">
                        <h3 class="
                            vital-loop-search-result-title
                        ">
                            ${name}
                        </h3>

                        <p class="
                            vital-loop-search-result-location
                        ">
                            📍 ${location}
                        </p>
                    </div>

                </div>

                <span class="
                    vital-loop-search-status
                    ${status.className}
                ">
                    ${status.label}
                </span>

                <div class="
                    vital-loop-search-meta
                ">

                    <div class="
                        vital-loop-search-meta-item
                    ">
                        <span class="
                            vital-loop-search-meta-label
                        ">
                            Resource Type
                        </span>

                        <span class="
                            vital-loop-search-meta-value
                        ">
                            ${type}
                        </span>
                    </div>

                    <div class="
                        vital-loop-search-meta-item
                    ">
                        <span class="
                            vital-loop-search-meta-label
                        ">
                            Blood Group
                        </span>

                        <span class="
                            vital-loop-search-meta-value
                        ">
                            ${group}
                        </span>
                    </div>

                    <div class="
                        vital-loop-search-meta-item
                    ">
                        <span class="
                            vital-loop-search-meta-label
                        ">
                            Distance
                        </span>

                        <span class="
                            vital-loop-search-meta-value
                        ">
                            ${distance}
                        </span>
                    </div>

                    <div class="
                        vital-loop-search-meta-item
                    ">
                        <span class="
                            vital-loop-search-meta-label
                        ">
                            Availability
                        </span>

                        <span class="
                            vital-loop-search-meta-value
                        ">
                            ${
                                status.label ===
                                "Verified"
                                    ? "Verified"
                                    : "Needs verification"
                            }
                        </span>
                    </div>

                </div>

                <div class="
                    vital-loop-search-actions
                ">

                    <a
                        class="
                            vital-loop-search-action
                            primary
                        "
                        href="${safeNavigation}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        📍 Navigate
                    </a>

                    <button
                        type="button"
                        class="
                            vital-loop-search-action
                            details
                        "
                        data-resource-id="${escapeHTML(
                            resource.id ||
                            resource._id ||
                            ""
                        )}"
                    >
                        View Details
                    </button>

                </div>

            </article>
        `;
    }

    /* -------------------------------------------------------
       Result Count
    ------------------------------------------------------- */

    function updateResultCount(count) {
        const counters =
            getAllElements(
                ".vital-loop-search-results-count"
            );

        counters.forEach((counter) => {
            counter.textContent =
                `${count} resource${
                    count === 1
                        ? ""
                        : "s"
                } found`;
        });
    }

    /* -------------------------------------------------------
       Details
    ------------------------------------------------------- */

    function setupResultActions() {
        getAllElements(
            ".vital-loop-search-action.details"
        ).forEach((button) => {
            button.addEventListener(
                "click",
                () => {
                    const id =
                        button.dataset.resourceId;

                    const resource =
                        resources.find(
                            (item) =>
                                String(
                                    item.id ||
                                    item._id ||
                                    ""
                                ) === String(id)
                        );

                    if (resource) {
                        showDetails(resource);
                    }
                }
            );
        });
    }

    function showDetails(resource) {
        const title =
            getDisplayName(resource);

        const status =
            getStatus(resource);

        const message = [
            `Type: ${getResourceType(resource)}`,
            `Location: ${getLocation(resource)}`,
            `Blood group: ${getBloodGroup(resource)}`,
            `Status: ${status.label}`,
            `Distance: ${getDistanceText(resource)}`
        ].join("\n");

        if (
            window.VitalLoopModal &&
            typeof
                window.VitalLoopModal.create ===
                "function"
        ) {
            const modal =
                window.VitalLoopModal.create({
                    title,
                    subtitle:
                        "Resource information",
                    content: `
                        <p>
                            ${escapeHTML(
                                message
                            ).replace(
                                /\n/g,
                                "<br>"
                            )}
                        </p>

                        <p>
                            ${
                                status.label ===
                                "Verified"
                                    ? "Availability has been marked as verified in the available dataset."
                                    : "This is potential availability and still requires verification."
                            }
                        </p>
                    `,
                    buttons: [
                        {
                            text: "Close",
                            variant: "secondary",
                            onClick: () => {
                                window.VitalLoopModal.close(
                                    modal
                                );

                                modal.remove();
                            }
                        }
                    ]
                });

            window.VitalLoopModal.open(
                modal
            );

            return;
        }

        alert(message);
    }

    /* -------------------------------------------------------
       Clear Search
    ------------------------------------------------------- */

    function clearSearch() {
        const input =
            getElement(
                ".vital-loop-search-input"
            );

        if (input) {
            input.value = "";
        }

        searchTerm = "";

        updateClearButton();

        applyFilters();

        if (input) {
            input.focus();
        }
    }

    function updateClearButton() {
        const clearButtons =
            getAllElements(
                ".vital-loop-search-clear"
            );

        clearButtons.forEach((button) => {
            button.classList.toggle(
                "show",
                Boolean(searchTerm)
            );
        });
    }

    /* -------------------------------------------------------
       Setup Search Controls
    ------------------------------------------------------- */

    function setupSearchInput() {
        const inputs =
            getAllElements(
                ".vital-loop-search-input"
            );

        inputs.forEach((input) => {
            input.addEventListener(
                "input",
                () => {
                    performSearch(
                        input.value
                    );
                }
            );
        });

        const clearButtons =
            getAllElements(
                ".vital-loop-search-clear"
            );

        clearButtons.forEach((button) => {
            button.addEventListener(
                "click",
                clearSearch
            );
        });
    }

    function setupBloodGroups() {
        getAllElements(
            ".vital-loop-blood-group"
        ).forEach((button) => {
            button.addEventListener(
                "click",
                () => {
                    const group =
                        button.dataset.bloodGroup ||
                        button.dataset.group ||
                        button.textContent;

                    setBloodGroup(group);
                }
            );
        });
    }

    function setupFilters() {
        getAllElements(
            ".vital-loop-search-filter"
        ).forEach((button) => {
            button.addEventListener(
                "click",
                () => {
                    const type =
                        button.dataset.type ||
                        button.dataset.filter;

                    if (type) {
                        setType(type);
                    }
                }
            );
        });
    }

    function setupSort() {
        const sort =
            getElement(
                ".vital-loop-search-sort"
            );

        if (!sort) return;

        sort.addEventListener(
            "change",
            () => {
                sortResources(
                    sort.value
                );
            }
        );
    }

    /* -------------------------------------------------------
       Public API
    ------------------------------------------------------- */

    window.VitalLoopSearch = {
        init: function () {
            setupSearchInput();
            setupBloodGroups();
            setupFilters();
            setupSort();

            loadResources();
        },

        search: performSearch,
        setBloodGroup,
        setType,
        clearSearch,
        applyFilters,
        loadResources,

        getResources: () =>
            [...resources],

        getFilteredResources: () =>
            [...filteredResources]
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
            () => {
                window.VitalLoopSearch.init();
            }
        );
    } else {
        window.VitalLoopSearch.init();
    }

})();
