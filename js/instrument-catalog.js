/* Instrument catalog: what each type of instrument is and how it is drawn.
   Maps ONC device categories (and the planned equipment named in
   assets/proposed_monitoring.geojson) to an icon and a plain-language
   description, and builds the icon markers used on the map, in popups and in
   the legend.

   The drawings are plain SVG files in assets/icons/instruments/ that can be
   opened and edited in any vector editor (32x32 canvas). To add one, save a
   new file there and add its name to ICON_NAMES. */

const ICON_DIR = "assets/icons/instruments/";

const ICON_NAMES = new Set([
    "accelerometer",
    "adapter",
    "adcp",
    "cameraLight",
    "cork",
    "ctd",
    "currentMeter",
    "datalogger",
    "ferryBox",
    "generic",
    "hydrophone",
    "junctionBox",
    "node",
    "orientation",
    "osmosampler",
    "oxygen",
    "panTilt",
    "piezometer",
    "platform",
    "pressureRecorder",
    "pump",
    "seismometer",
    "sonar",
    "tiltmeter",
    "transponder",
    "videoCamera"
]);

/* ONC device category name -> glyph key */
const CATEGORY_GLYPH = {
    "Hydrophone": "hydrophone",
    "Orientation Instrument": "orientation",
    "Conductivity Temperature Depth": "ctd",
    "Junction Box": "junctionBox",
    "Piezometer": "piezometer",
    "Bottom Pressure Recorder": "pressureRecorder",
    "Oxygen Sensor": "oxygen",
    "Platform": "platform",
    "Circulation Obviation Retrofit Kit": "cork",
    "Broadband Seismometer": "seismometer",
    "Accelerometer": "accelerometer",
    "Pan Tilt Lights": "panTilt",
    "Camera Lights": "cameraLight",
    "Video Camera": "videoCamera",
    "Node": "node",
    "Adapter": "adapter",
    "Datalogger": "datalogger",
    "Tiltmeter": "tiltmeter",
    "Acoustic Transponder": "transponder",
    "Current Meter": "currentMeter"
};

/* What each ONC device category does comes from ONC's own descriptions (onc-categories.js).
   Where ONC's wiki has an instrument page for the type, `url` links to it. */
const ONC_INSTRUMENTS_WIKI = "https://wiki.oceannetworks.ca";
const SEISMOMETERS_URL = ONC_INSTRUMENTS_WIKI + "/spaces/instruments/pages/13598836/Seismometers";
const CATEGORY_URL = {
    "Circulation Obviation Retrofit Kit": ONC_INSTRUMENTS_WIKI + "/display/instruments/CORK",
    "Broadband Seismometer": SEISMOMETERS_URL,
    "Accelerometer": SEISMOMETERS_URL
};
const ADCP_URL = ONC_INSTRUMENTS_WIKI + "/display/instruments/Acoustic%20Doppler%20Current%20Profilers%20(ADCP)";

function infoForCategory(category) {
    const description = ONC_DEVICE_CATEGORIES[category]?.description;
    if (!description) return null;
    return {
        description: description,
        url: CATEGORY_URL[category] || (/doppler/i.test(category) ? ADCP_URL : undefined)
    };
}

function glyphForCategory(category) {
    if (CATEGORY_GLYPH[category]) return CATEGORY_GLYPH[category];
    if (/doppler/i.test(category || "")) return "adcp";
    return "generic";
}

/* Free-text planned-instrument names (proposed_monitoring.geojson) -> glyph key */
function glyphForPlannedInstrument(text) {
    const t = String(text || "").toLowerCase();
    if (t.includes("hydrophone")) return "hydrophone";
    if (t.includes("sonar")) return "sonar";
    if (t.includes("camera")) return "videoCamera";
    if (t.includes("pump")) return "pump";
    if (t.includes("pressure")) return "pressureRecorder";
    if (t.includes("ferry box")) return "ferryBox";
    if (t.includes("ctd")) return "ctd";
    if (t.includes("osmo")) return "osmosampler";
    if (t.includes("cork")) return "cork";
    return "generic";
}

/* The ONC device category whose description is used for each item listed on a planned hole's CORK.
   The first pattern that matches wins. */
const PLANNED_CATEGORIES = [
    [/osmo/i, "Water sampler"],
    [/ferry box|ctd/i, "Conductivity Temperature Depth"],
    [/pressure/i, "Pressure Gauge"]
];

function descriptionForPlannedInstrument(text) {
    const match = PLANNED_CATEGORIES.find(([pattern]) => pattern.test(text));
    return match ? ONC_DEVICE_CATEGORIES[match[1]]?.description ?? "" : "";
}

function glyphSvg(key, size) {
    const name = ICON_NAMES.has(key) ? key : "generic";
    return `<img class="instrument-glyph" src="${ICON_DIR}${name}.svg" width="${size}" height="${size}" alt="">`;
}

/* Marker holding the glyph. variant: "current" | "proposed" | "planned".
   Current instruments are drawn directly on the map; planned ones sit on a
   dashed green disc so they read as not yet installed. */
function instrumentIcon(key, variant, scale = 1) {
    const size = Math.round((variant === "proposed" ? 40 : 34) * scale);
    const planned = variant !== "current";
    return L.divIcon({
        className: `instrument-marker instrument-marker-${planned ? "proposed" : "current"}`,
        html: glyphSvg(key, planned ? Math.round(size * 0.78) : size),
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2]
    });
}
