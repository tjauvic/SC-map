
const INSTRUMENT_STYLE = {
    current: {
        radius: 6,
        color: "#1b2a3a",
        weight: 1.5,
        fillColor: "#ffffff",
        fillOpacity: 1
    },
    proposedPoint: {
        radius: 12,
        color: "#1f9d55",
        weight: 2,
        dashArray: "4 3",
        fillColor: "#1f9d55",
        fillOpacity: 0.12
    },
    proposedCable: {
        planned: { color: "#1f9d55", weight: 3, dashArray: "8 6" },
        possible: { color: "#1f9d55", weight: 2, dashArray: "2 6", opacity: 0.8 }
    }
};
 
function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
 
function listHtml(items) {
    return `<ul class="instrument-list">${
        items.map(item => `<li>${item}</li>`).join("")
    }</ul>`;
}
 
/* ---------- current ONC instruments ---------- */
 
function currentInstrumentPopup(p, meta) {
    const name = p.devicename || p.devicecode || "ONC instrument";
    const depth = p.depth != null ? `${Math.round(p.depth)} m depth` : "";
    const details = [
        ["Category", p.devicecategoryname],
        ["Site", p.sitename],
        ["Location code", p.locationcode],
        ["Device ID", p.deviceid],
        ["Device code", p.devicecode]
    ]
        .filter(([, value]) => value != null && value !== "")
        .map(([label, value]) => `${label}: ${escapeHtml(value)}`);
    const image = p.image_url
        ? `<img class="instrument-image" src="${escapeHtml(p.image_url)}" alt="" loading="lazy">`
        : "";
 
    return `
        <div class="instrument-popup">
            <strong>${escapeHtml(name)}</strong>
            <div class="instrument-muted">${escapeHtml([p.devicecategoryname, p.locationname, depth].filter(Boolean).join(" · "))}</div>
            ${image}
            <div class="popup-data-heading">Instrument details</div>
            ${listHtml(details)}
            <div class="instrument-source">
                Source: ${escapeHtml(meta.source || "Ocean Networks Canada")}${
                    meta.retrieved ? `, retrieved ${escapeHtml(meta.retrieved)}` : ""}
            </div>
        </div>`;
}
 
function buildCurrentInstrumentsLayer(data) {
    const meta = data.metadata || {};
    return L.geoJSON(data, {
        pointToLayer: (feature, latlng) =>
            L.circleMarker(latlng, INSTRUMENT_STYLE.current),
        onEachFeature: (feature, layer) =>
            layer.bindPopup(currentInstrumentPopup(feature.properties || {}, meta), { maxWidth: 280 })
    });
}
 
/* ---------- proposed Solid Carbon monitoring ---------- */
 
function proposedPopup(p, meta) {
    if (p.length_m) {
        return `
            <div class="instrument-popup">
                <strong>${escapeHtml(p.name)}</strong>
                <div class="instrument-muted">${escapeHtml(p.status)} · ≈${escapeHtml(p.length_m)} m · schematic route</div>
            </div>`;
    }
 
    const unlocated = (meta.unlocated || []).map(u =>
        `${escapeHtml(u.name)} <span class="instrument-muted">· ${escapeHtml(u.note)}</span>`
    );
 
    return `
        <div class="instrument-popup">
            <strong>${escapeHtml(p.name)}: ${escapeHtml(p.role)}</strong>
            <div class="instrument-muted">${escapeHtml(p.status)} · ${escapeHtml(p.connection)}</div>
            <div class="popup-data-heading">Planned instruments</div>
            ${listHtml((p.instruments || []).map(escapeHtml))}
            ${unlocated.length ? `
                <div class="popup-data-heading">Also planned in the area (location TBD)</div>
                ${listHtml(unlocated)}` : ""}
        </div>`;
}
 
function buildProposedLayer(data) {
    const meta = data.metadata || {};
    return L.geoJSON(data, {
        style: feature =>
            INSTRUMENT_STYLE.proposedCable[feature.properties.status] ||
            INSTRUMENT_STYLE.proposedCable.possible,
        pointToLayer: (feature, latlng) =>
            L.circleMarker(latlng, INSTRUMENT_STYLE.proposedPoint),
        onEachFeature: (feature, layer) =>
            layer.bindPopup(proposedPopup(feature.properties || {}, meta), { maxWidth: 300 })
    });
}
 
/* ---------- load and register ---------- */
 
function loadInstrumentLayer(url, build, label) {
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(response.status);
            return response.json();
        })
        .then(data => {
            const layer = build(data).addTo(map);
            layerControl.addOverlay(layer, label);
        })
        .catch(error =>
            console.warn(`Could not load ${url}:`, error)
        );
}
 
loadInstrumentLayer(
    "assets/onc_instruments.geojson",
    buildCurrentInstrumentsLayer,
    '<span class="legend-swatch swatch-current"></span>Current ONC instruments'
);
 
loadInstrumentLayer(
    "assets/proposed_monitoring.geojson",
    buildProposedLayer,
    '<span class="legend-swatch swatch-proposed"></span>Proposed monitoring'
)