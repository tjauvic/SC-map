/* =========================================================
FILTER CONTROL
========================================================= */
const FilterControl =
L.Control.extend({

    options: {
        position: "topright"
    },

    onAdd: function () {

        const container =
            L.DomUtil.create(
                "div",
                "leaflet-filter-control leaflet-bar"
            );

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        const filterOptions =
            Object.entries(FILTER_CONFIG)
                .map(
                    ([key, label]) => `
                        <label>
                            <input
                                type="checkbox"
                                class="data-filter"
                                value="${key}"
                            >
                            ${label}
                        </label>
                    `
                )
                .join("");

        container.innerHTML = `
            <strong>
                Filter Data Types:
            </strong>

            <div class="filter-scroll-container">
                ${filterOptions}
            </div>
        `;

        return container;
    }
});

/* =========================================================
OPACITY CONTROL
========================================================= */
const OpacityControl =
L.Control.extend({

    options: {
        position: "topright"
    },

    onAdd: function () {

        const container =
            L.DomUtil.create(
                "div",
                "opacity-control"
            );

        container.innerHTML = `

            <label for="bathymetry-opacity">
                Bathymetry opacity
            </label>

            <input
                id="bathymetry-opacity"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value="${MAP_CONFIG.bathymetryOpacity}"
            />

            <div class="opacity-value">
                <span id="opacity-value">
                    ${Math.round(MAP_CONFIG.bathymetryOpacity * 100)}%
                </span>
            </div>
        `;

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        const slider =
            container.querySelector(
                "#bathymetry-opacity"
            );

        const value =
            container.querySelector(
                "#opacity-value"
            );

        slider.addEventListener(
            "input",
            function () {

                const opacity =
                    parseFloat(this.value);

                bathymetry.setOpacity(opacity);

                value.textContent =
                    Math.round(opacity * 100) + "%";
            }
        );

        return container;
    }
});

/* =========================================================
LEGEND CONTROL
========================================================= */
const LegendControl =
L.Control.extend({

    options: {
        position: "bottomright"
    },

    onAdd: function () {

        const container =
            L.DomUtil.create(
                "div",
                "bathymetry-legend"
            );

        container.innerHTML = `

            <h4>
                Bathymetry
            </h4>

            <div class="gradient"></div>

            <div class="legend-labels">

                <span>
                    Deep
                </span>

                <span>
                    Shallow
                </span>

            </div>
        `;

        return container;
    }
});
