/* =========================================================
CORK PINS

The pins on the CORK model, the key, and the panel under it that a pin opens. What each pin is comes from
CORK_TOOLS (cork-tools.js).

Uses: viewer and viewerWrap (viewer.js).
========================================================= */

const corkKey = document.getElementById("cork-key");
const toolPopup = document.getElementById("tool-popup");
const STATUS_TEXT = { installed: "On site now", planned: "Planned" };
let popupPin = null;                      // the pin the panel is showing

// One pin on the model per tool
function addToolPins() {
    CORK_TOOLS.forEach((tool, i) => {
        const pin = document.createElement("button");
        pin.type = "button";
        pin.className = `ToolPin ${tool.status} ${tool.place}`;
        pin.id = `pin-${tool.id}`;
        pin.slot = `hotspot-tool-${i}`;
        pin.dataset.position = tool.pos.map(v => `${v}m`).join(" ");
        pin.dataset.normal = tool.normal.map(v => `${v}m`).join(" ");
        pin.dataset.visibilityAttribute = "visible";
        pin.setAttribute("aria-label", `${tool.name} (${STATUS_TEXT[tool.status]})`);
        pin.innerHTML = '<span class="ToolPin-label"></span>';
        pin.firstChild.textContent = tool.name;
        pin.addEventListener("click", () => openToolPopup(tool, pin));
        viewer.appendChild(pin);
    });
}

function openToolPopup(tool, pin) {
    // Only the tools with a photo have a picture
    const image = document.getElementById("tool-image");
    document.getElementById("tool-figure").hidden = !tool.image;
    if (tool.image) {
        image.src = tool.image;
        image.alt = tool.name;
        const note = document.getElementById("tool-image-note");
        note.textContent = tool.imageNote || "";
        note.hidden = !tool.imageNote;
    }
    const status = document.getElementById("tool-status");
    status.textContent = STATUS_TEXT[tool.status];
    status.className = `cork-chip ${tool.status}`;
    document.getElementById("tool-name").textContent = tool.name;
    document.getElementById("tool-where").textContent = tool.where;
    document.getElementById("tool-purpose").textContent = tool.purpose;
    const link = document.getElementById("tool-link");
    document.getElementById("tool-link-line").hidden = !tool.link;
    if (tool.link) { link.href = tool.link.url; link.textContent = tool.link.text; }

    viewer.querySelectorAll(".ToolPin.selected").forEach(other => other.classList.remove("selected"));
    pin.classList.add("selected");
    popupPin = pin;
    toolPopup.hidden = false;
    toolPopup.scrollTop = 0;
}

function closeToolPopup() {
    toolPopup.hidden = true;
    popupPin = null;
    viewer.querySelectorAll(".ToolPin.selected").forEach(pin => pin.classList.remove("selected"));
}

// Switch the pins off to look at the bare model
document.getElementById("pins-toggle").addEventListener("change", e => {
    viewerWrap.classList.toggle("pins-off", !e.target.checked);
    if (!e.target.checked) closeToolPopup();
});

document.getElementById("tool-popup-close").addEventListener("click", closeToolPopup);
document.addEventListener("keydown", e => { if (e.key === "Escape") closeToolPopup(); });
