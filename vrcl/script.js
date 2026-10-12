const map = L.map("map", {
  zoomControl: true,
  scrollWheelZoom: true
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const radiusLayer = L.featureGroup().addTo(map);
const boundaryLayer = L.featureGroup().addTo(map);
const status = document.getElementById("status");
const count = document.getElementById("count");

const cityCenter = [-37.814079513964856, 144.96333065387304];
const fiftyKmRadius = L.circle(cityCenter, {
  radius: 50000,
  color: "#d26a6a",
  weight: 2,
  opacity: 0.9,
  fillColor: "#d26a6a",
  fillOpacity: 0.12
}).addTo(radiusLayer);

fiftyKmRadius.bindPopup("50 km radius around Melbourne CBD");

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function showBoundary(record) {
  if (!Array.isArray(record.boundaries) || record.boundaries.length < 3) {
    throw new Error(`Boundary "${record.name || "unknown"}" has invalid coordinates.`);
  }

  const points = record.boundaries.map((point) => {
    if (
      !Array.isArray(point) ||
      point.length < 2 ||
      !Number.isFinite(point[0]) ||
      !Number.isFinite(point[1])
    ) {
      throw new Error(`Boundary "${record.name || "unknown"}" has invalid coordinates.`);
    }
    return [point[1], point[0]];
  });

  const polygon = L.polygon(points, {
    color: "#147f8a",
    weight: 1.5,
    opacity: 0.9,
    fillColor: "#48b8ad",
    fillOpacity: 0.19
  }).addTo(boundaryLayer);

  polygon.bindTooltip(escapeHtml(record.name || "Unnamed area"));
  polygon.bindPopup(
    `<h2 class="popup-title">${escapeHtml(record.data?.title || record.name || "Council area")}</h2>` +
    `<p class="popup-subtitle">${escapeHtml(record.name || "")}</p>`
  );
  polygon.on("mouseover", () => polygon.setStyle({ weight: 2.5, fillOpacity: 0.35 }));
  polygon.on("mouseout", () => polygon.setStyle({ weight: 1.5, fillOpacity: 0.19 }));
}

document.getElementById("fit-map").addEventListener("click", () => {
  if (boundaryLayer.getLayers().length > 0) {
    map.fitBounds(boundaryLayer.getBounds(), { padding: [18, 18] });
  }
});

async function loadBoundaries() {
  try {
    const response = await fetch("./MapData.json");
    if (!response.ok) {
      throw new Error(`Could not load MapData.json (HTTP ${response.status}).`);
    }

    const records = await response.json();
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error("MapData.json does not contain any boundary records.");
    }

    records.forEach(showBoundary);
    map.fitBounds(boundaryLayer.getBounds(), { padding: [18, 18] });
    map.setView(cityCenter, 10);
    count.textContent = `${records.length} local government areas`;
    status.textContent = `Showing all ${records.length} boundaries. Select an area for its council name.`;
  } catch (error) {
    count.textContent = "Boundaries unavailable";
    status.dataset.state = "error";
    status.textContent = `${error.message} Serve this folder over HTTP (rather than opening index.html as a file) and check your internet connection.`;
    console.error("Failed to load council boundaries:", error);
  }
}

loadBoundaries();
