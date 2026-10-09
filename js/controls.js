/* =========================================================
SIDEBAR

A left rail of buttons; each opens one panel beside it (only one at a
time). Markup is in index.html; the panels are filled in here.
========================================================= */

function buildFilterPanel() {
    const list = document.getElementById("filter-list");

    list.innerHTML = Object.entries(FILTER_CONFIG)
        .map(([key, label]) => `
            <label>
                <input type="checkbox" class="data-filter" value="${key}">
                ${label}
            </label>
        `)
        .join("");

    list.querySelectorAll(".data-filter").forEach(box => {
        box.addEventListener("change", updateBoreholeMarkers);
    });

    document.getElementById("filter-clear").addEventListener("click", () => {
        list.querySelectorAll(".data-filter:checked").forEach(box => {
            box.checked = false;
        });
        updateBoreholeMarkers();
    });
}

/* Basemap radios and overlay checkboxes */
function buildLayersPanel(baseMaps, overlays) {
    const baseList = document.getElementById("basemap-list");

    Object.entries(baseMaps).forEach(([name, layer]) => {
        const label = document.createElement("label");
        label.innerHTML = `<input type="radio" name="basemap"> ${name}`;
        const input = label.querySelector("input");
        input.checked = map.hasLayer(layer);

        input.addEventListener("change", () => {
            Object.values(baseMaps).forEach(other => {
                if (other !== layer && map.hasLayer(other)) map.removeLayer(other);
            });
            map.addLayer(layer);
            if (layer.bringToBack) layer.bringToBack();
        });

        baseList.appendChild(label);
    });

    Object.entries(overlays).forEach(([name, layer]) => addOverlayToggle(layer, name));
}

/* Also called by js/instruments.js once its data has loaded */
function addOverlayToggle(layer, labelHtml) {
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox"> <span>${labelHtml}</span>`;
    const input = label.querySelector("input");
    input.checked = map.hasLayer(layer);

    input.addEventListener("change", () => {
        if (input.checked) map.addLayer(layer);
        else map.removeLayer(layer);
    });

    document.getElementById("overlay-list").appendChild(label);
}

/* Key to everything drawn on the map. The instrument list comes from
   js/instrument-catalog.js so it always matches the markers. */
function buildLegendPanel() {
    const instruments = Object.entries(CATEGORY_GLYPH)
        .map(([category, glyph]) => `
            <li>${glyphSvg(glyph, 26)}<span>${category}<small>${infoForCategory(category)?.description ?? ""}</small></span></li>`)
        .join("");

    document.getElementById("legend-content").innerHTML = `
        <h3>Boreholes</h3>
        <ul class="legend-list">
            <li>${boreholeSvg("red", 22)}<span>Solid Carbon project holes</span></li>
            <li>${boreholeSvg("blue", 22)}<span>Other boreholes</span></li>
        </ul>

        <h3>Ocean Networks Canada</h3>
        <ul class="legend-list">
            <li><span class="legend-line legend-line-cable"></span><span>Fibre-optic cable</span></li>
        </ul>
        <p class="legend-note">Current instruments (grouped where they overlap; click a numbered badge to expand):</p>
        <ul class="legend-list legend-instruments">${instruments}</ul>

        <h3>Planned (Solid Carbon)</h3>
        <ul class="legend-list">
            <li><span class="legend-planned">${glyphSvg("cork", 24)}</span><span>Planned hole or equipment</span></li>
            <li><span class="legend-line legend-line-planned"></span><span>Planned cable</span></li>
            <li><span class="legend-line legend-line-possible"></span><span>Possible cable</span></li>
        </ul>
    `;
}

function initSidebar() {
    const sidebar = document.getElementById("sidebar");
    const buttons = document.querySelectorAll(".rail-button");
    const panels = document.querySelectorAll(".side-panel");

    function openPanel(name) {
        buttons.forEach(button => {
            const active = button.dataset.panel === name;
            button.classList.toggle("active", active);
            button.setAttribute("aria-expanded", active);
        });
        panels.forEach(panel => {
            panel.hidden = panel.dataset.panel !== name;
        });
        sidebar.classList.toggle("open", Boolean(name));
        map.invalidateSize();
    }

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            openPanel(button.classList.contains("active") ? null : button.dataset.panel);
        });
    });

    // Help is open to start with, except on phones where the panel covers the map
    openPanel(window.matchMedia("(max-width: 600px)").matches ? null : "help");
}

/* 47.7610467 -> "47.76105° N": the one format used for coordinates across the site */
function formatCoordinate(value, positive, negative) {
    return `${Math.abs(value).toFixed(5)}° ${value >= 0 ? positive : negative}`;
}

/* Latitude and longitude under the mouse, bottom left of the map */
function addCursorCoordinates() {
    const control = L.control({ position: "bottomleft" });

    control.onAdd = () => L.DomUtil.create("div", "cursor-coords");
    control.addTo(map);

    const box = control.getContainer();
    const clear = () => { box.textContent = "Lat, Lon: move the mouse over the map"; };
    clear();

    map.on("mousemove", event => {
        const { lat, lng } = event.latlng.wrap();
        box.textContent = `${formatCoordinate(lat, "N", "S")}, ${formatCoordinate(lng, "E", "W")}`;
    });
    map.on("mouseout", clear);
}
