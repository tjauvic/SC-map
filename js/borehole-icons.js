/* Borehole markers: a CORK wellhead on a cone. The drawings are plain SVG files
   in assets/icons/boreholes/ (red.svg, blue.svg, shadow.svg) that can be edited
   in any vector editor. They are drawn on a 444x704 grid with the cone tip at
   the bottom centre, which is the point that marks the borehole location.
   shadow.svg shares that grid but has a wider canvas (700 wide) so the long
   shadow cast toward the upper right isn't clipped. */

const BOREHOLE_DIR = "assets/icons/boreholes/";

/* Image of a borehole marker at the given width (height follows the 444x704 grid) */
function boreholeSvg(color, width) {
    const height = Math.round(width * 704 / 444 * 10) / 10;
    return `<img src="${BOREHOLE_DIR}${color}.svg" width="${width}" height="${height}" alt="">`;
}

/* Leaflet marker icon: tip of the cone sits on the borehole location */
function boreholeIcon(color) {
    const width = 44.4, height = 70.4;
    const shadowWidth = Math.round(width * 700 / 444 * 10) / 10;
    return L.divIcon({
        className: "borehole-marker",
        html: `<img class="borehole-shadow" src="${BOREHOLE_DIR}shadow.svg" width="${shadowWidth}" height="${height}" alt="">` +
              boreholeSvg(color, width),
        iconSize: [width, height],
        iconAnchor: [width / 2, height],
        popupAnchor: [0, -height]
    });
}

/* A borehole with no CORK: a drill bit in a shaft cut down through layers of sediment, drawn in
   the same flat cartoon style and palette as the instrument icons (hole.svg, 32x26 grid, cropped
   from a 32 grid). The marker is anchored at the top of the shaft, where it meets the seafloor. */
function holeSvg(width) {
    const height = Math.round(width * 26 / 32 * 10) / 10;
    return `<img src="${BOREHOLE_DIR}hole.svg" width="${width}" height="${height}" alt="">`;
}

function holeIcon() {
    const width = 34, height = 27.6;
    const surfaceY = height * 7 / 26;
    return L.divIcon({
        className: "borehole-marker",
        html: holeSvg(width),
        iconSize: [width, height],
        iconAnchor: [width / 2, surfaceY],
        popupAnchor: [0, -surfaceY]
    });
}
