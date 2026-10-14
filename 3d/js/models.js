/* =========================================================
THE MODELS

The three models the viewer can show, and the camera presets for each. Nothing here touches the page; the other
scripts read these.

  - seafloorModels: the two seafloor models (to scale, and 5x vertical exaggeration).
  - corkModels: the CORK model, with the tools on and around it (see cork-tools.js).
  - model: whichever of them is on show now (set by loadModel in viewer.js).
========================================================= */

// The two seafloor models. seaY is where the seafloor sits in the scene and vScale how many times taller than
// life it is drawn. views are the camera presets; minDimSpan is the visible width (m) below which the
// footprint dimension lines are hidden, because they would cut across the large CORKs in the close-ups.
const OVERVIEW = { orbit: "0deg 75deg auto", target: "auto auto auto", fov: "auto" };
const seafloorModels = {
    "seafloor_v4.glb": {
        seaY: 0, vScale: 1, minDimSpan: 200,
        badge: "To scale",
        note: "This model is drawn to true scale: heights and depths are not exaggerated.",
        // Orbit = "azimuth polar radius" about the target; azimuth is measured from +Z (south), so -90deg
        // looks at the west face.
        views: {
            overview:   OVERVIEW,
            layers:     { orbit: "-62deg 74deg 1500m", target: "-2400m -300m 900m", fov: "30deg" },   // west wall, labels in view
            injection:  { orbit: "63deg 78deg 40m", target: "-1203.3m 3.4m 0m", fov: "12deg" },       // cork at the top of 1362A
            monitoring: { orbit: "77deg 78deg 40m", target: "-1272.5m 3.4m 303.4m", fov: "12deg" },   // cork at the top of 1362B
        },
    },
    "Exaggerated.glb": {
        seaY: 1498.2, vScale: 5, minDimSpan: 500,
        badge: "5× vertical exaggeration",
        note: "This model is exaggerated: terrain relief, layer thicknesses and Corks are drawn with a 5X " +
              "verictal exaggeration. Horizontal distances remain consistent however, CORKs are not drawn to scale.",
        views: {
            overview:   OVERVIEW,
            layers:     { orbit: "-62deg 74deg 6800m", target: "-2400m -10m 900m", fov: "30deg" },
            injection:  { orbit: "63deg 78deg 700m", target: "-1203.3m 1600m 0m", fov: "30deg" },
            monitoring: { orbit: "77deg 78deg 700m", target: "-1272.5m 1600m 303.4m", fov: "30deg" },
        },
    },
};
let model = seafloorModels["seafloor_v4.glb"];
const sceneY = y => model.seaY + model.vScale * y;

// The CORK model and its camera presets. Its wellhead stands on 31.5 m of pipe, so the seafloor is at
// y = 31.54, and the positions in cork-tools.js are written to match.
const corkModels = {
    "cork1362A-draco.glb": {
        vScale: 1, minDimSpan: 0, defaultView: "wellhead",
        views: {
            wellhead: { orbit: "20deg 78deg 11m", target: "0m 36.34m 0m", fov: "30deg" },
            // The target is nudged west so the CORK sits in the clear part of the viewer, clear of the panel on the left
            layout:   { orbit: "-30deg 52deg 85m", target: "-7m 32.54m -4m", fov: "30deg" },
            whole:    OVERVIEW,
        },
    },
};
