const map = L.map('map').setView([33.8121, -117.9190], 15); // Default to Disneyland
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let polygonLayer = null; // Store polygon layer for updates

document.getElementById("searchButton").addEventListener("click", async () => {
    const input = document.getElementById("locationInput").value.trim();
    if (!input) return;

    let osmType = null;
    let osmId = null;

    try {
        if (/^\d+$/.test(input)) {
            // 📌 If input is a number, assume it's an OSM ID and determine its type
            let nominatimResponse = await fetch(`https://nominatim.openstreetmap.org/lookup?osm_ids=W${input},R${input}&format=json`);
            let nominatimData = await nominatimResponse.json();
            
            if (nominatimData.length === 0) {
                alert("Invalid OSM ID!");
                return;
            }

            let place = nominatimData[0];
            let i = 0;
            do {
                place = nominatimData[i];
                osmType = place.osm_type;
                osmId = place.osm_id;
                i++;
            } while ((osmType !== "way" && osmType !== "relation") && i < nominatimData.length);
            if (osmType !== "way" && osmType !== "relation") {
                alert("Selected place does not have a boundary!");
                return;
            }
        } else {
            // 📌 Otherwise, assume it's a location name and use Nominatim search
            let nominatimResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}`);
            let nominatimData = await nominatimResponse.json();

            if (nominatimData.length === 0) {
                alert("Location not found!");
                return;
            }

            let place = nominatimData[0];
            let i = 0;
            do {
                place = nominatimData[i];
                osmType = place.osm_type;
                osmId = place.osm_id;
                i++;
            } while ((osmType !== "way" && osmType !== "relation") && i < nominatimData.length);
            if (osmType !== "way" && osmType !== "relation") {
                alert("Selected place does not have a boundary!");
                return;
            }
        }


        console.log(`Fetching OSM Data for ${osmType}(${osmId})`);

        // Step 2: Fetch boundary data from Overpass API
        let query = `[out:json]; ${osmType}(${osmId}); (._; >;); out body;`;
        let overpassResponse = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        let overpassData = await overpassResponse.json();

        if (!overpassData.elements || overpassData.elements.length === 0) {
            alert("Boundary data not found!");
            return;
        }

        // Step 3: Extract node coordinates
        let nodes = {};
        let ways = [];

        overpassData.elements.forEach(el => {
            if (el.type === "node") {
                nodes[el.id] = [el.lat, el.lon]; // Store node coordinates
            } else if (el.type === "way") {
                ways.push(el); // Store way elements
            }
        });

        let coordinates = [];

        if (osmType === "way") {
            // Directly get nodes of the way
            let wayNodes = overpassData.elements.find(el => el.type === "way" && el.id == osmId)?.nodes;
            if (!wayNodes) {
                alert("Could not find geometry.");
                return;
            }
            coordinates = wayNodes.map(id => nodes[id]);
        } else if (osmType === "relation") {
            // Collect nodes from all ways in the relation
            overpassData.elements.forEach(el => {
                if (el.type === "relation" && el.id == osmId) {
                    el.members.forEach(member => {
                        if (member.type === "way") {
                            let way = ways.find(w => w.id === member.ref);
                            if (way && way.nodes) {
                                coordinates.push(...way.nodes.map(id => nodes[id]));
                            }
                        }
                    });
                }
            });
        }

        if (coordinates.length === 0) {
            alert("Could not construct boundary.");
            return;
        }

        // Step 4: Draw polygon on the map
        if (polygonLayer) {
            map.removeLayer(polygonLayer);
        }

        polygonLayer = L.polygon(coordinates, {
            color: "blue",
            weight: 2,
            fillOpacity: 0.4
        }).addTo(map);

        map.fitBounds(polygonLayer.getBounds());

        // Step 5: Enable polygon dragging
        polygonLayer.on('mousedown', function (event) {
            map.dragging.disable();
            let startLatLng = event.latlng;

            function moveHandler(moveEvent) {
                let deltaLat = moveEvent.latlng.lat - startLatLng.lat;
                let deltaLng = moveEvent.latlng.lng - startLatLng.lng;

                let newLatLngs = polygonLayer.getLatLngs()[0].map(point => [
                    point.lat + deltaLat,
                    point.lng + deltaLng
                ]);

                polygonLayer.setLatLngs(newLatLngs);
                startLatLng = moveEvent.latlng;
            }

            function stopHandler() {
                map.off('mousemove', moveHandler);
                map.off('mouseup', stopHandler);
                map.dragging.enable();
            }

            map.on('mousemove', moveHandler);
            map.on('mouseup', stopHandler);
        });

    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while fetching data.");
    }
});
