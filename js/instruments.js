
const INSTRUMENT_STYLE = {
    proposedCable: {
        planned: { color: "#1f9d55", weight: 3, dashArray: "8 6" },
        possible: { color: "#1f9d55", weight: 2, dashArray: "2 6", opacity: 0.8 },
        tether: { color: "#1f9d55", weight: 1.5, dashArray: "3 3", opacity: 0.7, interactive: false }
    }
};
 
function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
 
function listHtml(items, extraClass = "") {
    return `<ul class="instrument-list ${extraClass}">${
        items.map(item => `<li>${item}</li>`).join("")
    }</ul>`;
}
 
/* ---------- current ONC instruments ---------- */
 
/* What this type of instrument does, with a link to ONC's page for it when there is one */
function categoryInfoHtml(category) {
    const info = infoForCategory(category);
    if (!info) return "";
    const link = info.url
        ? ` <a href="${escapeHtml(info.url)}" target="_blank" rel="noopener">Learn more at ONC</a>`
        : "";
    return `<p class="instrument-desc">${escapeHtml(info.description)}${link}</p>`;
}

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
            ${categoryInfoHtml(p.devicecategoryname)}
            ${image}
            <div class="popup-data-heading">Instrument details</div>
            ${listHtml(details)}
            <div class="instrument-source">
                Source: ${escapeHtml(meta.source || "Ocean Networks Canada")}${
                    meta.retrieved ? `, retrieved ${escapeHtml(meta.retrieved)}` : ""}
            </div>
        </div>`;
}
 
/* Many instruments share one location (e.g. 4 hydrophones, or a camera,
   lights and junction box on the same platform), so the icons would sit on
   top of each other and only the top one could be clicked. A cluster group
   merges nearby markers into one badge showing the most common device and a
   count; clicking zooms in, and at maximum zoom (or when they share exactly
   the same spot) it fans the icons out so each can be clicked. */
function currentClusterIcon(cluster) {
    const markers = cluster.getAllChildMarkers();
    const counts = {};
    markers.forEach(m => {
        const category = m.feature.properties.devicecategoryname;
        counts[category] = (counts[category] || 0) + 1;
    });
    const dominant = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
    return L.divIcon({
        className: "instrument-marker instrument-marker-current instrument-cluster",
        html: glyphSvg(glyphForCategory(dominant), 34) +
              `<span class="instrument-cluster-count">${markers.length}</span>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
    });
}

function buildCurrentInstrumentsLayer(data) {
    const meta = data.metadata || {};
    const group = L.markerClusterGroup({
        clusterPane: "oncInstruments",
        maxClusterRadius: 30,
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: true,
        spiderLegPolylineOptions: { weight: 1.5, color: "#1b2a3a", opacity: 0.6 },
        iconCreateFunction: currentClusterIcon
    });
    group.addLayer(L.geoJSON(data, {
        pointToLayer: (feature, latlng) =>
            L.marker(latlng, {
                pane: "oncInstruments",
                icon: instrumentIcon(glyphForCategory(feature.properties.devicecategoryname), "current"),
                title: feature.properties.devicecategoryname || ""
            }),
        onEachFeature: (feature, layer) =>
            layer.bindPopup(currentInstrumentPopup(feature.properties || {}, meta), { maxWidth: 280 })
    }));
    return group;
}
 
/* ---------- proposed Solid Carbon monitoring ---------- */
 
function proposedPopup(p, meta) {
    if (p.kind === "equipment") {
        return `
            <div class="instrument-popup">
                <strong>${escapeHtml(p.name)}</strong>
                <div class="instrument-muted">Planned at ${escapeHtml(p.hole)}</div>
                ${p.description ? `<p class="instrument-desc">${escapeHtml(p.description)}</p>` : ""}
                <div>${escapeHtml(p.note)}</div>
            </div>`;
    }

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
            <div class="popup-data-heading">Mounted on the CORK</div>
            ${listHtml((p.instruments || []).map(plannedInstrumentItem), "planned-list")}
            ${unlocated.length ? `
                <div class="popup-data-heading">Also planned in the area (location TBD)</div>
                ${listHtml(unlocated)}` : ""}
        </div>`;
}
 
function plannedInstrumentItem(text) {
    const description = descriptionForPlannedInstrument(text);
    return `${glyphSvg(glyphForPlannedInstrument(text), 16)}<span>${escapeHtml(text)}${
        description ? `<small>${escapeHtml(description)}</small>` : ""}</span>`;
}

function buildProposedLayer(data) {
    const meta = data.metadata || {};
    return L.geoJSON(data, {
        style: feature =>
            INSTRUMENT_STYLE.proposedCable[feature.properties.status] ||
            INSTRUMENT_STYLE.proposedCable.possible,
        pointToLayer: (feature, latlng) =>
            feature.properties.kind === "equipment"
                ? L.marker(latlng, {
                    pane: "proposed",
                    icon: instrumentIcon(feature.properties.glyph, "planned"),
                    title: `${feature.properties.name} (planned)`
                })
                : L.marker(latlng, {
                    pane: "proposed",
                    icon: instrumentIcon("cork", "proposed"),
                    title: `${feature.properties.name} (planned)`
                }),
        onEachFeature: (feature, layer) => {
            if (feature.properties.status === "tether") return;
            layer.bindPopup(proposedPopup(feature.properties || {}, meta), { maxWidth: 300 });
        }
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
            addOverlayToggle(layer, label);
        })
        .catch(error =>
            console.warn(`Could not load ${url}:`, error)
        );
}
 
loadInstrumentLayer(
    "assets/onc_instruments.geojson",
    buildCurrentInstrumentsLayer,
    `${glyphSvg("ctd", 20)}Current ONC instruments`
);
 
loadInstrumentLayer(
    "assets/proposed_monitoring.geojson",
    buildProposedLayer,
    '<span class="legend-swatch swatch-proposed"></span>Proposed monitoring'
);
