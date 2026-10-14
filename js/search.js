/* =========================================================
SEARCH

Find a borehole or instrument by name. Boreholes are indexed here;
js/instruments.js adds the instruments with addSearchItems() once their
data has loaded. Each item is
    { label, detail, text, visible(), show() }
where text is what gets matched, visible() says whether its layer is
switched on, and show() flies to it and opens its popup.
========================================================= */

const searchItems = [];

function addSearchItems(items) {
    searchItems.push(...items);
}

/* Fly to a point, then run `then` (straight away if the map is already there) */
function flyThen(latlng, then) {
    latlng = L.latLng(latlng);
    if (map.getCenter().distanceTo(latlng) < 1) {
        then();
        return;
    }
    map.once("moveend", then);
    map.flyTo(latlng, Math.max(map.getZoom(), 15));
}

function boreholeSearchItems() {
    return boreholes.map(hole => ({
        label: `Borehole ${hole.id}`,
        detail: hole.description || `Expedition leg ${hole.leg}`,
        text: `Borehole ${hole.id} ${hole.description} ${hole.leg}`,
        visible: () => map.hasLayer(markerGroup),
        show() {
            flyThen(hole.coords, () => {
                const marker = boreholeMarkers.get(hole.id);
                if (marker) {
                    marker.openPopup();
                } else {
                    // The hole is hidden by the filters, so it has no marker to open
                    L.popup({ maxWidth: 260, offset: [0, -70] })
                        .setLatLng(hole.coords)
                        .setContent(buildPopupContent(hole))
                        .openOn(map);
                }
            });
        }
    }));
}

function initSearch() {
    addSearchItems(boreholeSearchItems());

    const input = document.getElementById("search-input");
    const list = document.getElementById("search-results");
    let shown = [];

    function runSearch() {
        const query = input.value.trim().toLowerCase();
        const words = query.split(/\s+/);

        // Best first: the name starts with the query, then the name contains every word,
        // then a match only in the extra text (site, category, location)
        const rank = item => {
            const label = item.label.toLowerCase();
            if (label.startsWith(query)) return 0;
            return words.every(word => label.includes(word)) ? 1 : 2;
        };

        shown = query === "" ? [] : searchItems
            .filter(item => item.visible() && words.every(word => item.text.toLowerCase().includes(word)))
            .sort((a, b) => rank(a) - rank(b) || a.label.localeCompare(b.label, undefined, { numeric: true }))
            .slice(0, 15);

        list.innerHTML = "";
        if (query !== "" && shown.length === 0) {
            const empty = document.createElement("li");
            empty.className = "search-empty";
            empty.textContent = "No matches";
            list.appendChild(empty);
        }
        shown.forEach(item => {
            const row = document.createElement("li");
            const button = document.createElement("button");
            button.type = "button";
            button.innerHTML = '<span class="search-label"></span><small class="search-detail"></small>';
            button.querySelector(".search-label").textContent = item.label;
            button.querySelector(".search-detail").textContent = item.detail;
            button.addEventListener("click", () => choose(item));
            row.appendChild(button);
            list.appendChild(row);
        });
    }

    function choose(item) {
        // On phones the open panel covers the map, so close it first
        if (window.matchMedia("(max-width: 600px)").matches) {
            document.querySelector(".rail-button.active")?.click();
        }
        item.show();
    }

    input.addEventListener("input", runSearch);
    input.addEventListener("keydown", event => {
        if (event.key === "Enter" && shown.length > 0) choose(shown[0]);
    });
}
