/* =========================================================
MAP INITIALIZATION
========================================================= */
const map = L.map("map", {
    minZoom: MAP_CONFIG.minZoom,
    maxZoom: MAP_CONFIG.maxZoom
});

// Layers can't be added until the map has a view, so set it straight away
map.fitBounds(MAP_CONFIG.initialBounds);

// When a popup opens, pan so that the popup itself (which sits above the clicked
// marker) is centred on the map. Leaflet's built-in autoPan only nudges the map
// far enough for the popup to fit, so it is switched off to avoid the two fighting.
L.Popup.mergeOptions({ autoPan: false });

function centerOnPopup(popup) {
    const box = popup.getElement().getBoundingClientRect();
    const view = map.getContainer().getBoundingClientRect();
    // Leaflet's default pan (0.25 s, nearly linear) feels abrupt; a longer, softer ease is gentler
    map.panBy([
        box.left + box.width / 2 - (view.left + view.width / 2),
        box.top + box.height / 2 - (view.top + view.height / 2)
    ], { duration: 0.7, easeLinearity: 0.15 });
}

map.on("popupopen", event => {
    requestAnimationFrame(() => centerOnPopup(event.popup));

    // Instrument photos load after the popup opens and make it taller, so centre again then
    event.popup.getElement().querySelectorAll("img").forEach(image => {
        if (!image.complete) {
            image.addEventListener("load", () => centerOnPopup(event.popup), { once: true });
        }
    });
});

// Stacking order of what is drawn on the map, bottom to top: ONC cables (the
// default overlay pane), ONC instruments, proposed instruments, then the
// borehole pins. Popups (pane 700) stay above all of them.
map.createPane("oncInstruments").style.zIndex = 610;
map.createPane("proposed").style.zIndex = 620;
map.createPane("boreholes").style.zIndex = 630;

/* =========================================================
BASEMAP
========================================================= */

const osm =
L.tileLayer(
"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
{
maxNativeZoom: 19,

maxZoom: 22,

        attribution:
            '&copy; <a href="https://openstreetmap.org" target="_blank">OpenStreetMap</a> contributors'
    }
);

const ESRI_ATTRIBUTION = 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC';

const Esri_NatGeoWorldMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', { attribution: ESRI_ATTRIBUTION, maxNativeZoom: 9, maxZoom: 22});

/* GMRT (Global Multi-Resolution Topography): live shaded-relief bathymetry
   from ship multibeam surveys, up to 100 m resolution. */
const gmrt =
L.tileLayer.wms(
"https://www.gmrt.org/services/mapserver/wms_merc",
{
    layers: "GMRT",
    format: "image/jpeg",          // about a tenth the size of PNG; the layer is opaque anyway
    version: "1.3.0",
    maxNativeZoom: 12,             // data is at most 100 m/pixel; past this, scale tiles up instead of asking the slow server
    maxZoom: 22,
    updateWhenZooming: false,      // don't fetch tiles for the in-between zoom levels of an animation
    attribution:
        'Bathymetry: <a href="https://www.gmrt.org" target="_blank">GMRT</a> (Ryan et al., 2009)'
}
);

gmrt.addTo(map);
/* =========================================================
MARKER ICONS (SVG, see js/borehole-icons.js)
========================================================= */

const redCork = boreholeIcon("red");
const blueCork = boreholeIcon("blue");

/* =========================================================
BOREHOLE MARKERS
========================================================= */

const markerGroup =
L.layerGroup().addTo(map);

/* =========================================================
POPUP DATA LINKS

Links come from DATA_LINKS (js/datalinks.js), which is
generated from the "Data by hole" inventory sheet. A category that
is flagged in boreholes.js but has no link in the sheet is still
listed, as plain text, so the popup agrees with the filter.
========================================================= */

function siteIdFor(holeId) {

    return holeId.replace(/[A-Z]+$/, "");

}

function buildDataLinks(hole) {

    const holeLinks =
        DATA_LINKS[hole.id] || {};

    return Object.entries(FILTER_CONFIG)
        .filter(
            ([key]) =>
                hole.dataType?.[key] === true ||
                holeLinks[key]
        )
        .map(
            ([key, label]) => ({
                label: label,
                url: holeLinks[key] || null
            })
        )
        .sort(
            (a, b) => a.label.localeCompare(b.label)
        );

}

function buildHoleDetails(hole) {
    const [lat, lon] = hole.reportedLocation || hole.coords;

    return `
        <dl class="hole-details">
            <dt>Expedition leg</dt><dd>${hole.leg}</dd>
            <dt>Latitude</dt><dd>${formatCoordinate(lat, "N", "S")}</dd>
            <dt>Longitude</dt><dd>${formatCoordinate(lon, "E", "W")}</dd>
            <dt>Water depth</dt><dd>${hole.waterDepth} m</dd>
            <dt>Penetration</dt><dd>${hole.penetration} m</dd>
        </dl>
    `;
}

function buildPopupContent(hole) {

    const dataLinks =
        buildDataLinks(hole);

    const linksHtml =
        dataLinks.length === 0
            ? ""
            : `
                <div class="popup-data-heading">
                    Available data
                </div>
                <div class="popup-data-links">
                    ${
                        dataLinks
                            .map(
                                link => link.url
                                    ? `
                                        <a
                                            href="${link.url.replace(/"/g, "&quot;")}"
                                            target="_blank"
                                            rel="noopener"
                                        >
                                            ${link.label}
                                        </a>
                                    `
                                    : `
                                        <span
                                            class="popup-data-unlinked"
                                            title="Listed in the inventory, but no link has been added yet"
                                        >
                                            ${link.label}
                                        </span>
                                    `
                            )
                            .join("")
                    }
                </div>
            `;

    return `
        <div class="borehole-popup">
            <b>BoreHole ${hole.id}</b>
            ${
                hole.description
                    ? "<br>" + hole.description
                    : ""
            }
            ${buildHoleDetails(hole)}
            ${linksHtml}
        </div>
    `;

}

const PROJECT_SITE_ID = "327-U1362";

function iconFor(hole) {

    return siteIdFor(hole.id) === PROJECT_SITE_ID
        ? redCork
        : blueCork;

}

function zIndexFor(hole) {

    return siteIdFor(hole.id) === PROJECT_SITE_ID
        ? 1000
        : 0;

}

function updateBoreholeMarkers() {

markerGroup.clearLayers();

const selectedFilters =
    Array.from(
        document.querySelectorAll(
            ".data-filter:checked"
        )
    ).map(
        checkbox => checkbox.value
    );


boreholes.forEach(
    function (hole) {

        const matchesAllFilters =
            selectedFilters.length === 0 ||
            selectedFilters.every(
                filterKey =>
                    hole.dataType?.[filterKey] === true
            );


        if (!matchesAllFilters) {
            return;
        }


        const marker =
            L.marker(
                hole.coords,
                {
                    pane: "boreholes",
                    icon: iconFor(hole),
                    zIndexOffset: zIndexFor(hole)
                }
            ).bindPopup(
                buildPopupContent(hole),
                {
                    maxWidth: 260
                }
            );


        markerGroup.addLayer(marker);

    }
);

}
/* =========================================================
FILTER CONTROL
========================================================= */

buildFilterPanel();

updateBoreholeMarkers();

/* =========================================================
LAYER CONTROL
========================================================= */

const baseMaps = {

"GMRT Bathymetry":
    gmrt,

"National Geographic (Esri)":
    Esri_NatGeoWorldMap,

"OpenStreetMap":
    osm

};

const overlays = {

"Borehole markers":
    markerGroup

};
buildLayersPanel(baseMaps, overlays);

/* =========================================================
BARE OUTCROP LABELS
========================================================= */

updateBareOutcropLabels();

map.on(
"zoomend",
updateBareOutcropLabels
);

/* =========================================================
ONC CABLE DATA
========================================================= */

const cableLayer = L.geoJSON(
cableData,
{

    style:
        function () {

            return {

                color:
                    "#e8a33d",

                weight:
                    2,

                opacity:
                    0.85

            };

        },


    onEachFeature:
        function (feature, layer) {

            if (
                feature.properties &&
                feature.properties.Name
            ) {

                layer.bindPopup(
                    `<strong>Cable:</strong> ${feature.properties.Name}`
                );

            }

        }

}

).addTo(map);
/* =========================================================
SIDEBAR
========================================================= */

addOverlayToggle(cableLayer, "ONC cables");
addCursorCoordinates();
buildLegendPanel();
initSidebar();
