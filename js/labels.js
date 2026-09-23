/* =========================================================
BARE OUTCROP LABELS
========================================================= */
const bareLabelsGroup = L.layerGroup();

const bareOutcrops = [

{
    position: [47.859334, -127.619693],
    label: "Papa Bare Outcrop",
    anchor: [40, 5]
},

{
    position: [47.838384, -127.731489],
    label: "Mama Bare Outcrop",
    anchor: [45, 5]
},

{
    position: [47.710326, -127.785897],
    label: "Baby Bare Outcrop",
    anchor: [45, 5]
},

{
    position: [47.274390, -128.053916],
    label: "Grizzly Bare Outcrop",
    anchor: [60, 5]
},

{
    position: [47.552147, -128.189873],
    label: "Grinnin' Bare Outcrop",
    anchor: [50, 5]
}

];
bareOutcrops.forEach(
function (outcrop) {

    const icon =
        L.divIcon({

            className:
                "basemap-style-label",

            html:
                outcrop.label,

            iconSize:
                [0, 0],

            iconAnchor:
                outcrop.anchor
        });


    L.marker(
        outcrop.position,
        {
            icon: icon,
            interactive: false
        }
    ).addTo(
        bareLabelsGroup
    );

}

);
/* =========================================================
LABEL ZOOM LOGIC
========================================================= */

function updateBareOutcropLabels() {

const currentZoom =
    map.getZoom();


if (
    currentZoom >= MAP_CONFIG.labelMinZoom
) {

    if (
        !map.hasLayer(bareLabelsGroup)
    ) {

        map.addLayer(
            bareLabelsGroup
        );

    }

}
else {

    if (
        map.hasLayer(bareLabelsGroup)
    ) {

        map.removeLayer(
            bareLabelsGroup
        );

    }

}

}
