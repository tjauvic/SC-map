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

/* Plain-language description of each ONC device category, shown in the
   instrument popups and the legend. Where ONC has an instrument page for the
   type, `url` links to it. */
const ONC_INSTRUMENTS_WIKI = "https://wiki.oceannetworks.ca";

const CATEGORY_INFO = {
    "Hydrophone": {
        description: "An underwater microphone. It detects and records ambient sounds such as whale and dolphin calls, ship traffic and earthquakes."
    },
    "Orientation Instrument": {
        description: "A compass and tilt sensor that records which way a nearby instrument is pointing, so its data can be interpreted."
    },
    "Conductivity Temperature Depth": {
        description: "The core oceanographic sensor set. It measures the seawater's conductivity (which gives salinity), temperature and depth."
    },
    "Junction Box": {
        description: "A seafloor hub that passes power and communications from the cable out to nearby instruments."
    },
    "Piezometer": {
        description: "Measures the pressure of fluids in seafloor sediment, which shows how the sediment responds to tides, earthquakes and tectonic strain."
    },
    "Bottom Pressure Recorder": {
        description: "Measures the pressure of the water above it. That reveals tides, tsunamis and small movements of the seafloor."
    },
    "Oxygen Sensor": {
        description: "Measures how much oxygen is dissolved in the water column."
    },
    "Platform": {
        description: "A flat frame, or mud mat, that rests on the seafloor and holds instruments and their cables."
    },
    "Circulation Obviation Retrofit Kit": {
        description: "A CORK seals a drilled borehole so pressure, temperature and fluid chemistry deep in the seafloor crust can be monitored for years.",
        url: ONC_INSTRUMENTS_WIKI + "/display/instruments/CORK"
    },
    "Broadband Seismometer": {
        description: "Records ground shaking over a wide range of strengths, from faint ground noise up to large earthquakes.",
        url: ONC_INSTRUMENTS_WIKI + "/spaces/instruments/pages/13598836/Seismometers"
    },
    "Accelerometer": {
        description: "Measures strong ground shaking during earthquakes, where more sensitive seismometers would be overwhelmed.",
        url: ONC_INSTRUMENTS_WIKI + "/spaces/instruments/pages/13598836/Seismometers"
    },
    "Pan Tilt Lights": {
        description: "A motorised mount that swivels lights, and often a camera, up, down and side to side to look around the site."
    },
    "Camera Lights": {
        description: "Lights that brighten the dark seafloor so the cameras can film."
    },
    "Video Camera": {
        description: "Sends live or recorded video of the seafloor, its animals and the instruments."
    },
    "Node": {
        description: "A hub on the cable that powers the instruments around it and carries their data back to shore."
    },
    "Adapter": {
        description: "Converts an instrument's signal into a form the cable network can carry."
    },
    "Datalogger": {
        description: "Records readings from sensors and passes them on to the network."
    },
    "Tiltmeter": {
        description: "Measures very small changes in the tilt of the seafloor."
    },
    "Acoustic Transponder": {
        description: "Sends and answers sound pings so an instrument's position underwater can be measured."
    },
    "Current Meter": {
        description: "Measures the speed and direction of the water current at one point."
    }
};

const ADCP_INFO = {
    description: "An acoustic Doppler current profiler (ADCP). It sends sound beams upward and uses the echoes to measure current speed and direction at many depths.",
    url: ONC_INSTRUMENTS_WIKI + "/display/instruments/Acoustic%20Doppler%20Current%20Profilers%20(ADCP)"
};

function infoForCategory(category) {
    if (CATEGORY_INFO[category]) return CATEGORY_INFO[category];
    if (/doppler/i.test(category || "")) return ADCP_INFO;
    return null;
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
    if (t.includes("ferry box") || t.includes("ctd")) return "ctd";
    if (t.includes("osmo")) return "osmosampler";
    if (t.includes("cork")) return "cork";
    return "generic";
}

/* What the items listed on a planned hole's CORK do. The first pattern that matches wins. */
const PLANNED_DESCRIPTIONS = [
    [/osmo/i, "Collects small samples of the fluid in the borehole over time, to be analysed after it is recovered."],
    [/ferry box|ctd/i, "A sensor package that measures the chemistry of the borehole fluid, here with a CTD, a carbon meter and a fluorometer."],
    [/pressure/i, "Logs the pressure of the fluid in the borehole, which responds to earthquakes, tides and the injected fluid."]
];

function descriptionForPlannedInstrument(text) {
    const match = PLANNED_DESCRIPTIONS.find(([pattern]) => pattern.test(text));
    return match ? match[1] : "";
}

function glyphSvg(key, size) {
    const name = ICON_NAMES.has(key) ? key : "generic";
    return `<img class="instrument-glyph" src="${ICON_DIR}${name}.svg" width="${size}" height="${size}" alt="">`;
}

/* Marker holding the glyph. variant: "current" | "proposed" | "planned".
   Current instruments are drawn directly on the map; planned ones sit on a
   dashed green disc so they read as not yet installed. */
function instrumentIcon(key, variant) {
    const size = variant === "proposed" ? 40 : 34;
    const planned = variant !== "current";
    return L.divIcon({
        className: `instrument-marker instrument-marker-${planned ? "proposed" : "current"}`,
        html: glyphSvg(key, planned ? Math.round(size * 0.78) : size),
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2]
    });
}
