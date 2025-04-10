const map = L.map('map').setView([33.8121, -117.9190], 15); // Default to Disneyland
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let polygonLayer = null; // Store polygon layer for updates

document.getElementById("searchButton").addEventListener("click", async () => {
    const input = document.getElementById("locationInput").value.trim();
    if (!input) return; // ignore null input

    let place = null;
    let osmType = null;
    let osmId = null;

    try {
        const isOsmID = /^\d+$/.test(input); // Check if input is a number
        let nominatimData = null;
        let errorMessage = null;

        // Step 1: Fetch data from Nominatim API
        if (isOsmID) {
            // get all of the ways and relations for the given OSM ID
            let nominatimResponse = await fetch(`https://nominatim.openstreetmap.org/lookup?osm_ids=W${input},R${input}&format=json`);
            nominatimData = await nominatimResponse.json();
            errorMessage = "Could not find a way or relation with OSM ID " + input + ".";
        } else {
            // get all of the ways and relations for the given object
            let nominatimResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}`);
            nominatimData = await nominatimResponse.json();
            errorMessage = "Could not find anything named " + input + ".";
        }

        // filter out everything other than ways or relations from nominatim data
        nominatimData = nominatimData.filter(candidate => candidate.osm_type === "way" || candidate.osm_type === "relation");
        if (nominatimData.length === 0) {
            alert(errorMessage);
            return;
        }

        place = nominatimData[0]; // Take the first result
        osmType = place.osm_type; // "way" or "relation"
        osmId = place.osm_id; // OSM ID
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
            let outerRings = [];
            let innerRings = [];
        
            let relation = overpassData.elements.find(el => el.type === "relation" && el.id == osmId);
            if (!relation) {
                alert("Relation not found!");
                return;
            }
        
            // Map way ID to its node list
            let wayMap = {};
            ways.forEach(way => {
                wayMap[way.id] = way.nodes.map(id => nodes[id]);
            });
        
            // Group members by role
            let outerWays = relation.members.filter(m => m.type === "way" && m.role === "outer");
            let innerWays = relation.members.filter(m => m.type === "way" && m.role === "inner");
        
            // Assemble closed rings
            function buildRings(ways) {
                let rings = [];
        
                while (ways.length) {
                    let ring = ways.shift();
                    let coords = [...wayMap[ring.ref]];
                    let changed = true;
        
                    while (changed) {
                        changed = false;
                        for (let i = 0; i < ways.length; i++) {
                            let nextCoords = wayMap[ways[i].ref];
                            if (!nextCoords) continue;
        
                            if (coords[coords.length - 1].toString() === nextCoords[0].toString()) {
                                coords = coords.concat(nextCoords.slice(1));
                                ways.splice(i, 1);
                                changed = true;
                                break;
                            } else if (coords[0].toString() === nextCoords[nextCoords.length - 1].toString()) {
                                coords = nextCoords.slice(0, -1).concat(coords);
                                ways.splice(i, 1);
                                changed = true;
                                break;
                            } else if (coords[0].toString() === nextCoords[0].toString()) {
                                coords = nextCoords.reverse().slice(0, -1).concat(coords);
                                ways.splice(i, 1);
                                changed = true;
                                break;
                            } else if (coords[coords.length - 1].toString() === nextCoords[nextCoords.length - 1].toString()) {
                                coords = coords.concat(nextCoords.reverse().slice(1));
                                ways.splice(i, 1);
                                changed = true;
                                break;
                            }
                        }
                    }
        
                    rings.push(coords);
                }
        
                return rings;
            }
        
            outerRings = buildRings(outerWays);
            innerRings = buildRings(innerWays);
        
            if (outerRings.length === 0) {
                alert("No outer boundary found.");
                return;
            }
        
            // Leaflet format: array of rings: [outer, [inner1, inner2, ...]]
            coordinates = outerRings.map((outer, index) => {
                let outerRing = outer;
                let inner = [];
        
                // Optional: match which inner holes go with which outer ring
                if (index === 0) {
                    inner = innerRings;
                }
        
                return [outerRing, ...inner];
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
        
                // Get all rings (outer and inner) — could be single or multi
                let latLngs = polygonLayer.getLatLngs();
        
                let newLatLngs = latLngs.map(ring => {
                    // If it's a multipolygon (nested), map inner arrays
                    if (Array.isArray(ring[0])) {
                        return ring.map(subRing =>
                            subRing.map(point => L.latLng(point.lat + deltaLat, point.lng + deltaLng))
                        );
                    } else {
                        // Single ring
                        return ring.map(point => L.latLng(point.lat + deltaLat, point.lng + deltaLng));
                    }
                });
        
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
