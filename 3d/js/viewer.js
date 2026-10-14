/* =========================================================
THE VIEWER

The entry point for the 3D viewer page: the model, the camera view buttons, loading a model, the compass and the
frame loop. Loaded last, so everything it calls is already defined.

Uses: models.js, seafloor-overlay.js, cork-pins.js.
========================================================= */

const viewer = document.getElementById("viewer");
const viewerWrap = document.querySelector(".viewer-wrap");
const overlay = document.getElementById("dimension-overlay");

const viewSelect = document.getElementById("view-select");
const corkViewSelect = document.getElementById("cork-view-select");
const viewButtons = [...document.querySelectorAll(".view-select button")];

function markView(name) {
    viewButtons.forEach(b => b.classList.toggle("active", b.dataset.view === name));
}

function setView(name) {
    const v = model.views[name];
    viewer.cameraTarget = v.target;
    viewer.cameraOrbit = v.orbit;
    viewer.fieldOfView = v.fov;
    markView(name);
    // A tool around the CORK has no pin outside the site layout view, so its panel closes
    if (popupPin && popupPin.classList.contains("nearby") && name !== "layout") closeToolPopup();
    // Names beside the pins only in the site layout view, where there is room for them
    viewerWrap.classList.toggle("show-labels", name === "layout");
}

for (const select of [viewSelect, corkViewSelect]) {
    select.addEventListener("click", e => {
        const b = e.target.closest("button[data-view]");
        if (b) setView(b.dataset.view);
    });
}

// Dragging or zooming by hand leaves the preset, so un-highlight it
viewer.addEventListener("camera-change", e => {
    if (e.detail.source === "user-interaction") markView(null);
});

const scaleNote = document.getElementById("scale-note");
const scaleBadge = document.getElementById("scale-badge");
let pendingView = "overview";

function loadModel(src, button) {
    // Highlight the selected model button
    document.querySelectorAll(".model-select button").forEach(el => el.classList.remove("active"));
    if (button) button.classList.add("active");

    // Swap what is drawn over the model: the seafloor models get anchors for the labels and dimension lines,
    // the CORK model gets the tool pins and panel
    viewer.querySelectorAll(".DimAnchor, .ToolPin").forEach(el => el.remove());
    anchors = [];
    anchorPosition = {};
    closeToolPopup();

    const seafloor = seafloorModels[src];
    const cork = corkModels[src];
    model = seafloor || cork;
    if (seafloor) {
        buildAnchors();
        addAnchors();
    }
    if (cork) addToolPins();

    // The viewer won't zoom out far from a small model unless told it may
    if (cork) viewer.setAttribute("max-camera-orbit", "auto auto 400m");
    else viewer.removeAttribute("max-camera-orbit");

    viewSelect.hidden = !seafloor;
    corkViewSelect.hidden = !cork;
    corkKey.hidden = !cork;
    for (const el of [scaleNote, scaleBadge]) {
        el.hidden = !seafloor;
        el.classList.toggle("exaggerated", Boolean(seafloor) && model.vScale > 1);
    }
    if (seafloor) {
        scaleNote.textContent = model.note;
        scaleBadge.textContent = model.badge;
    }

    // Frame the new model. The camera is reset again once it has loaded, because loading a model
    // puts the camera back to its default.
    pendingView = model.defaultView || "overview";
    setView(pendingView);
    viewer.src = src;
}

viewer.addEventListener("load", () => {
    setView(pendingView);
    viewer.jumpCameraToGoal();
});

// ---- Compass ------------------------------------------------------------------------------------------
// Model north is the -Z axis.
//   - dragging orbits the camera (theta), which fires camera-change
//   - auto-rotate spins the model itself (turntableRotation, in radians)
//     and fires NO event, so it has to be polled every frame.
const compassNeedle = document.getElementById("compass-needle");

// One frame loop for the overlay and the compass
function frame() {
    const wrap = viewerWrap.getBoundingClientRect();
    const orbit = viewer.getCameraOrbit();
    const span = visibleSpan(orbit);

    overlay.innerHTML = dimensionsSvg(wrap, span < model.minDimSpan)
        + boreholeLabelsSvg(wrap)
        + layerLabelsSvg(wrap, orbit, span);

    compassNeedle.style.transform = `rotate(${(orbit.theta - viewer.turntableRotation) * 180 / Math.PI}deg)`;
    requestAnimationFrame(frame);
}

customElements.whenDefined("model-viewer").then(() => requestAnimationFrame(frame));

// Show the seafloor labels on first load
loadModel("seafloor_v4.glb", document.querySelector(".model-select button.active"));
