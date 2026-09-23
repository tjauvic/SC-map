/* =========================================================
MAP INITIALIZATION
========================================================= */
const map = L.map("map", {

center:
    MAP_CONFIG.center,

zoom:
    MAP_CONFIG.zoom,

minZoom:
    MAP_CONFIG.minZoom,
    
maxZoom:
    MAP_CONFIG.maxZoom,

worldCopyJump:
    MAP_CONFIG.worldCopyJump

});
/* =========================================================
BASEMAP
========================================================= */

const osm =
L.tileLayer(
"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
{
maxZoom: 19,

        attribution:
            '&copy; <a href="https://openstreetmap.org" target="_blank">OpenStreetMap</a> contributors'
    }
);

var Esri_NatGeoWorldMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC', maxNativeZoom: 12});

Esri_NatGeoWorldMap.addTo(map);
/* =========================================================
MARKER ICONS
========================================================= */

const CorkIcon =
L.Icon.extend({

    options: {

        shadowUrl:
            "assets/shadow-cork.png",

        iconSize:
            [44.4, 70.4],

        shadowSize:
            [51.0, 50.6],

        iconAnchor:
            [22.2, 70.4],

        shadowAnchor:
            [0, 50.2],

        popupAnchor:
            [0, -70.4]
    }
});

const redCork =
new CorkIcon({
iconUrl: "assets/red-cork.png"
});
const greenCork =
new CorkIcon({
iconUrl: "assets/green-cork.png"
});

const blueCork =
new CorkIcon({
iconUrl: "assets/blue-cork.png"
});

const yellowCork =
new CorkIcon({
iconUrl: "assets/yellow-cork.png"
});

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
                    icon: iconFor(hole),
                    zIndexOffset: zIndexFor(hole)
                }
            ).bindPopup(
                buildPopupContent(hole),
                {
                    maxWidth: 260,
                    maxHeight: 260
                }
            );


        markerGroup.addLayer(marker);

    }
);

}
/* =========================================================
FILTER CONTROL
========================================================= */

new FilterControl().addTo(map);

document
.querySelectorAll(".data-filter")
.forEach(
checkbox => {

        checkbox.addEventListener(
            "change",
            updateBoreholeMarkers
        );

    }
);

updateBoreholeMarkers();

/* =========================================================
CASCADIA BASIN BATHYMETRY
========================================================= */

const bathymetry =
L.tileLayer(
DATA_URLS.bathymetry,
{

        minZoom:
            7,

        maxNativeZoom:
            13,

        maxZoom:
            19,

        tileSize:
            256,

        opacity:
            MAP_CONFIG.bathymetryOpacity,

        attribution:
            'Bathymetry: <a href="https://www.arcgis.com/home/item.html?id=2d33516a1c7d4941ad061a0d84c2fb9a" target="_blank">Cascadia Basin Bathymetry</a> / Ocean Networks Canada'
    }
);

bathymetry.addTo(map);
/* =========================================================
LAYER CONTROL
========================================================= */

const baseMaps = {

"National Geographic (Esri)":
    Esri_NatGeoWorldMap,

"OpenStreetMap":
    osm

};

const overlays = {

"Cascadia Basin Bathymetry":
    bathymetry

};
L.control.layers(
baseMaps,
overlays,
{
collapsed: false
}
).addTo(map);
/* =========================================================
TILE ERROR REPORTING
========================================================= */

bathymetry.on(
"tileerror",
function (event) {

    console.warn(
        "Bathymetry tile failed to load:",
        event.tile.src
    );

}

);

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

L.geoJSON(
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
MAP CONTROLS
========================================================= */

map.addControl(
new OpacityControl()
);

map.addControl(
new LegendControl()
);

/* =========================================================
INITIAL MAP EXTENT
========================================================= */

map.fitBounds(
MAP_CONFIG.initialBounds
);
