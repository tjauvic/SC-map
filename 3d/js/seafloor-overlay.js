/* =========================================================
SEAFLOOR OVERLAY

What is drawn over the two seafloor models: the borehole labels, the dimension lines, the depth ruler and the column of layer
labels. They hang off invisible anchors that model-viewer keeps projected onto the screen, and are redrawn as
SVG every frame by frame() in viewer.js.

Uses: viewer, model and sceneY (models.js).
========================================================= */

// ---- Scene anchors ------------------------------------------------------------------------------------
// Everything drawn over the seafloor model (borehole labels, dimension lines, the layer label column) hangs
// off invisible anchors that model-viewer keeps projected onto the screen. Positions are scene metres
// [x, y, z]; -Z is north and Y is up.
const WEST = -2400, EAST = 2100, NORTH = -1577.300048828125, SOUTH = 1922.699951171875, FLOOR = -700;

// x and z are the centres of the CORKs in the models (the CORK nodes in the .glb files, the same in both), so the
// labels and the dimension lines between boreholes line up with the middle of each CORK.
const boreholes = [
    { id: "1026B", pos: [-1056.387939453125, 0, -180.65219116210938] },
    { id: "1362A", pos: [-1203.3328857421875, 0, -0.04028356447815895] },
    { id: "1362B", pos: [-1272.4715576171875, 0, 303.4114990234375] },
    { id: "1301B", pos: [-1516.9639892578125, 0, 774.3952026367188] },
    { id: "1027C", pos: [1059.81005859375, 0, 475.0859069824219] },
];

// Footprint corners at the bottom of the layers (FLOOR)
const corners = {
    A: [WEST, FLOOR, NORTH],
    B: [EAST, FLOOR, NORTH],
    C: [EAST, FLOOR, SOUTH],
};

// The depth ruler stands on the back-right (north-east) corner of the footprint, from the seafloor (y = 0) down to
// FLOOR, marked in metres below sea level. SEAFLOOR_MBSL is the depth of y = 0: the boreholes' water depths run
// 2656-2661 m. A tick is placed at every RULER_STEP m of depth.
const SEAFLOOR_MBSL = 2658, RULER_STEP = 100;
const RULER = [EAST, NORTH];
const rulerTicks = [];                                       // { y: scene metres, mbsl }
for (let mbsl = Math.ceil(SEAFLOOR_MBSL / RULER_STEP) * RULER_STEP; mbsl < SEAFLOOR_MBSL - FLOOR; mbsl += RULER_STEP) {
    rulerTicks.push({ y: SEAFLOOR_MBSL - mbsl, mbsl });
}

// The label column, top to bottom. Each points at its layer's mid-depth (y) on the west wall at z = WALL_Z.
// Swatch colours are the layers' glTF base colours converted from linear to sRGB (what the viewer displays).
// Optional entries drop out of the column when their anchor is off-screen.
const WALL_Z = 897.8;
const layerLabels = [
    { text: "Seafloor", color: "#a0d5ff", y: 0, optional: true },
    { text: "Sediments", color: "#d9cdb8", y: -160, optional: true },    // seafloor to top of basement
    { text: "Upper pillow basalt", color: "#898e95", y: -362.1 },
    { text: "Hyaloclastite breccia", color: "#c4aa89", y: -403.6 },
    { text: "Massive & sheet flows", color: "#6c737c", y: -421.0 },
    { text: "Lower pillow basalt", color: "#9b959e", y: -473.1 },
    { text: "Undifferentiated basalt", color: "#616169", y: -604.0 },
];

// Built for the model on show, since sceneY() depends on it
let anchors = [], anchorPosition = {};

function buildAnchors() {
    const at = ([x, y, z]) => [x, sceneY(y), z];
    anchors = [
        ...boreholes.map(b => ({ id: `bh-${b.id}`, pos: at(b.pos) })),
        ...Object.entries(corners).map(([k, pos]) => ({ id: `corner-${k}`, pos: at(pos) })),
        { id: "ruler-top", pos: at([RULER[0], 0, RULER[1]]) },
        ...rulerTicks.map((t, i) => ({ id: `ruler-${i}`, pos: at([RULER[0], t.y, RULER[1]]) })),
        { id: "ruler-bottom", pos: at([RULER[0], FLOOR, RULER[1]]) },
        ...layerLabels.map((l, i) => ({ id: `layer-${i}`, pos: at([WEST, l.y, WALL_Z]), normal: [-1, 0, 0] })),
    ];
    anchorPosition = Object.fromEntries(anchors.map(a => [a.id, a.pos]));
}

function addAnchors() {
    anchors.forEach(({ id, pos, normal = [0, 1, 0] }, n) => {
        const el = document.createElement("button");
        el.id = id;
        el.className = "DimAnchor";
        el.slot = `hotspot-${n}`;
        el.dataset.position = pos.map(v => `${v}m`).join(" ");
        el.dataset.normal = normal.map(v => `${v}m`).join(" ");
        el.dataset.visibilityAttribute = "visible";
        viewer.appendChild(el);
    });
}

// ---- Overlay ------------------------------------------------------------------------------------------
const CHAR_W = 5.4;                                  // px per character at 10px Inter, used to size the pills
const escapeText = t => t.replace("&", "&amp;");

// Screen position of an anchor relative to the viewer, or null while model-viewer says it isn't visible
function anchorPos(id, wrap) {
    const el = document.getElementById(id);
    if (!el || !el.hasAttribute("data-visible")) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left - wrap.left, y: r.top - wrap.top };
}

// Scene width (m) visible across the view at the orbit target
const visibleSpan = orbit => 2 * orbit.radius * Math.tan(viewer.getFieldOfView() * Math.PI / 360);

// Clip the segment a-b to the viewer rectangle (Liang-Barsky); returns the visible parameter range or null
function clipToView(a, b, w, h, pad = 6) {
    let t0 = 0, t1 = 1;
    const dx = b.x - a.x, dy = b.y - a.y;
    for (const [p, q] of [[-dx, a.x - pad], [dx, w - pad - a.x], [-dy, a.y - pad], [dy, h - pad - a.y]]) {
        if (p === 0) { if (q < 0) return null; continue; }
        const t = q / p;
        if (p < 0) { if (t > t1) return null; t0 = Math.max(t0, t); }
        else { if (t < t0) return null; t1 = Math.min(t1, t); }
    }
    return [t0, t1];
}

// Dimension lines connect pairs of anchors and are labelled with the real distance between them.
// "cork" lines run between boreholes along the seafloor, so they stay visible in the close-up cork views;
// the footprint lines are hidden there because they would cut across the cork.
const dimensionPairs = [
    ["bh-1026B", "bh-1362A", "cork"],
    ["bh-1362A", "bh-1362B", "cork"],
    ["corner-A", "corner-B"],
    ["corner-B", "corner-C"],
];

function dimensionsSvg(wrap, closeUp) {
    let svg = "";
    for (const [aId, bId, kind] of dimensionPairs) {
        if (closeUp && kind !== "cork") continue;
        const a = anchorPos(aId, wrap), b = anchorPos(bId, wrap);
        if (!a || !b) continue;

        // Only the on-screen part of the line is drawn, and its label sits at the middle of that part, so
        // a line to a far-away borehole still shows (and is readable) when zoomed in on a cork
        const clip = clipToView(a, b, wrap.width, wrap.height);
        if (!clip) continue;
        const at = t => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
        const p = at(clip[0]), q = at(clip[1]);
        const dot = e => (e.x >= 0 && e.x <= wrap.width && e.y >= 0 && e.y <= wrap.height)
            ? `<circle class="ov-dot" cx="${e.x}" cy="${e.y}" r="3" />` : "";

        // True distance: the vertical part is divided by how much the model is stretched
        const [dx, dy, dz] = anchorPosition[aId].map((v, i) => v - anchorPosition[bId][i]);
        const distance = Math.hypot(dx, dy / model.vScale, dz);
        svg += `
            <line class="ov-dim-line" x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}" />
            ${dot(a)}${dot(b)}
            <text class="ov-dim-text" x="${(p.x + q.x) / 2}" y="${(p.y + q.y) / 2 - 6}" text-anchor="middle">${Math.round(distance)} m</text>`;
    }
    return svg;
}

// The depth ruler, drawn like the dimension lines (same line, dots and text) and hidden the same ways: when its
// anchors are hidden by the model and in the close-up views.
function rulerSvg(wrap) {
    const top = anchorPos("ruler-top", wrap), bottom = anchorPos("ruler-bottom", wrap);
    if (!top || !bottom) return "";
    const clip = clipToView(top, bottom, wrap.width, wrap.height);
    if (!clip) return "";
    const at = t => ({ x: top.x + (bottom.x - top.x) * t, y: top.y + (bottom.y - top.y) * t });
    const p = at(clip[0]), q = at(clip[1]);
    const dot = e => (e.x >= 0 && e.x <= wrap.width && e.y >= 0 && e.y <= wrap.height)
        ? `<circle class="ov-dot" cx="${e.x}" cy="${e.y}" r="3" />` : "";
    let svg = `<line class="ov-dim-line" x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}" />${dot(top)}${dot(bottom)}`;

    // Ticks point away from the middle of the view, at right angles to the ruler
    const len = Math.hypot(bottom.x - top.x, bottom.y - top.y) || 1;
    let nx = -(bottom.y - top.y) / len, ny = (bottom.x - top.x) / len;
    if (nx * (top.x - wrap.width / 2) + ny * (top.y - wrap.height / 2) < 0) { nx = -nx; ny = -ny; }
    const side = nx < 0 ? "end" : "start";
    const onScreen = e => e.x > 8 && e.x < wrap.width - 8 && e.y > 8 && e.y < wrap.height - 8;
    rulerTicks.forEach((t, i) => {
        const c = anchorPos(`ruler-${i}`, wrap);
        if (!c || !onScreen(c)) return;
        svg += `
            <line class="ov-dim-tick" x1="${c.x}" y1="${c.y}" x2="${c.x + nx * 8}" y2="${c.y + ny * 8}" />
            <text class="ov-dim-text" x="${c.x + nx * 11}" y="${c.y + ny * 11 + 4}" text-anchor="${side}">${t.mbsl}</text>`;
    });
    if (onScreen(top)) {
        svg += `<text class="ov-dim-text" x="${top.x + nx * 11}" y="${top.y + ny * 11 - 6}" text-anchor="${side}">mbsl</text>`;
    }
    return svg;
}

// Borehole labels, beside their anchors (LABEL_OFFSET px to the right). Drawn after the dimension lines so they sit in front of them.
const LABEL_OFFSET = 14;                             // px from a CORK to the left edge of its label

function boreholeLabelsSvg(wrap) {
    return boreholes.map(b => {
        const c = anchorPos(`bh-${b.id}`, wrap);
        if (!c) return "";
        // The pill sits to the right of the CORK, not on it, so the CORK can still be seen from above. The
        // dimension lines still end on the CORK itself.
        const text = `Borehole ${b.id}`, w = text.length * CHAR_W + 16, h = 20, x = c.x + LABEL_OFFSET;
        return `
            <g class="ov-shadow"><rect class="ov-pill" x="${x}" y="${c.y - h / 2}" width="${w}" height="${h}" rx="5" /></g>
            <text class="ov-text" x="${x + w / 2}" y="${c.y + 3.5}" text-anchor="middle">${text}</text>`;
    }).join("");
}

// Layer labels: an evenly spaced vertical column beside the west wall, each joined by a leader line to its
// layer. Only shown when the camera is on the west side, zoomed in enough, with every layer anchor on screen.
const LABEL_H = 18, LABEL_GAP = 6, LABEL_MARGIN = 14, LABEL_LEAD = 40;   // LEAD: min px between column and nearest anchor
const LABEL_MAX_SPAN = 7000;     // m of scene visible across the view; zoomed out further than this, hide
const LABEL_MAX_ANGLE = 55;      // degrees the camera may be off straight-on to the west wall
const LABEL_EDGE_PAD = 20;       // px; every anchor must be this far inside the viewer

function westWallInFocus(orbit, span) {
    const thetaModel = orbit.theta - viewer.turntableRotation;      // camera azimuth in model space, as the compass uses
    const facing = -Math.sin(thetaModel);                           // 1 = looking straight at the west (-X) wall
    return span < LABEL_MAX_SPAN && facing > Math.cos(LABEL_MAX_ANGLE * Math.PI / 180);
}

function layerLabelsSvg(wrap, orbit, span) {
    if (!westWallInFocus(orbit, span)) return "";
    const items = [];
    layerLabels.forEach((l, i) => {
        const p = anchorPos(`layer-${i}`, wrap);
        if (p) items.push({ ...l, ax: p.x, ay: p.y });
    });
    const pad = LABEL_EDGE_PAD;
    const inView = i => i.ax > pad && i.ax < wrap.width - pad && i.ay > pad && i.ay < wrap.height - pad;
    const required = layerLabels.filter(l => !l.optional);
    if (!required.every(l => items.some(i => i.text === l.text && inView(i)))) return "";
    const shown = items.filter(inView);

    const w = Math.max(...shown.map(i => i.text.length)) * CHAR_W + 26;
    const minX = Math.min(...shown.map(i => i.ax)), maxX = Math.max(...shown.map(i => i.ax));
    const leftX = minX - LABEL_LEAD - w;                             // column's left edge if placed on the left
    const rightX = maxX + LABEL_LEAD;                                // ... and if placed on the right
    const leftOk = leftX >= LABEL_MARGIN;
    const rightOk = rightX + w <= wrap.width - LABEL_MARGIN;
    if (!leftOk && !rightOk) return "";
    const onLeft = leftOk && (!rightOk || minX - leftX - w <= rightX - maxX || (leftX + w / 2) < wrap.width / 2);
    const x = onLeft ? leftX : rightX;
    const edge = onLeft ? x + w : x;

    // Even vertical spacing, centred on the anchors, kept inside the viewer
    const pitch = LABEL_H + LABEL_GAP;
    const mean = shown.reduce((sum, i) => sum + i.ay, 0) / shown.length;
    const total = pitch * (shown.length - 1);
    const top = Math.min(Math.max(mean - total / 2, LABEL_H), wrap.height - LABEL_H - total);

    let lines = "", boxes = "";
    shown.forEach((it, n) => {
        const cy = top + n * pitch;
        lines += `
            <line class="ov-leader" x1="${edge}" y1="${cy}" x2="${it.ax}" y2="${it.ay}" />
            <circle class="ov-anchor-dot" cx="${it.ax}" cy="${it.ay}" r="3" style="fill: ${it.color};" />`;
        boxes += `
            <rect class="ov-pill-outlined" x="${x}" y="${cy - LABEL_H / 2}" width="${w}" height="${LABEL_H}" rx="5" />
            <rect x="${x + 6}" y="${cy - 4}" width="8" height="8" rx="2" style="fill: ${it.color};" />
            <text class="ov-text" x="${x + 19}" y="${cy + 3.5}">${escapeText(it.text)}</text>`;
    });
    return lines + boxes;
}
