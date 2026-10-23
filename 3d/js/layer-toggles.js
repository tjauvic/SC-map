/* =========================================================
LAYER TOGGLES

The Water / Sediment / Basement checkboxes over the seafloor models. A hidden group is drawn fully transparent (its
materials are all blended), so nothing else about the model changes. Materials are matched by name prefix.

Uses: viewer (viewer.js), which calls applyVisibility from its load handler.
========================================================= */

const LAYER_GROUPS = {
    water:    ["water_mat", "sea_surface_mat"],
    sediment: ["sediment_mat"],
    basement: ["1_Upper_pillow", "2_Hyaloclastite", "3_Massive", "4_Lower_pillow", "5_Undifferentiated", "basement_top"],
};
const groupVisible = { water: true, sediment: true, basement: true };
const layerToggles = document.getElementById("layer-toggles");
const shownAlpha = new Map();       // material name -> the opacity it has when shown

function applyVisibility() {
    for (const m of viewer.model.materials) {
        const group = Object.keys(LAYER_GROUPS).find(g => LAYER_GROUPS[g].some(k => m.name.startsWith(k)));
        if (!group) continue;
        const [r, g, b, a] = m.pbrMetallicRoughness.baseColorFactor;
        if (!shownAlpha.has(m.name)) shownAlpha.set(m.name, a);
        m.pbrMetallicRoughness.setBaseColorFactor([r, g, b, groupVisible[group] ? shownAlpha.get(m.name) : 0]);
    }
}

layerToggles.addEventListener("change", e => {
    groupVisible[e.target.dataset.group] = e.target.checked;
    applyVisibility();
});
