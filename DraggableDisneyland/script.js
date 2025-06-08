const map = L.map('map').setView([33.8121, -117.9190], 15); // Default to Disneyland
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let polygonLayer = null; // Store polygon layer for updates

document.getElementById("searchButton").addEventListener("click", async () => {
    const input = document.getElementById("locationInput").value.trim();
    if (!input) return;

    let place = null;
    let osmType = null;
    let osmId = null;
    let overpassData = null;

    try {
        const isOsmID = /^\d+$/.test(input);

        if (isOsmID) {
            // Treat input as a Way ID and fetch directly from Overpass
            osmType = "way";
            osmId = input;
            console.log(`Direct Overpass query for Way(${osmId})`);

            let query = `[out:json]; way(${osmId}); (._; >;); out body;`;
            let response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
            overpassData = await response.json();

            if (!overpassData.elements || overpassData.elements.length === 0) {
                alert("Could not find a way with that ID.");
                return;
            }
        } else {
            // Use Nominatim to resolve name into way/relation
            let nominatimResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}`);
            let nominatimData = await nominatimResponse.json();

            nominatimData = nominatimData.filter(candidate => candidate.osm_type === "way" || candidate.osm_type === "relation");
            if (nominatimData.length === 0) {
                alert("Could not find anything named " + input + ".");
                return;
            }

            place = nominatimData[0];
            osmType = place.osm_type;
            osmId = place.osm_id;

            console.log(`Resolved ${input} to ${osmType}(${osmId})`);

            let query = `[out:json]; ${osmType}(${osmId}); (._; >;); out body;`;
            let response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
            overpassData = await response.json();

            if (!overpassData.elements || overpassData.elements.length === 0) {
                alert("Boundary data not found!");
                return;
            }
        }

        // Proceed with node parsing and polygon drawing (unchanged from your code)
        let nodes = {};
        let ways = [];

        overpassData.elements.forEach(el => {
            if (el.type === "node") {
                nodes[el.id] = [el.lat, el.lon];
            } else if (el.type === "way") {
                ways.push(el);
            }
        });

        let coordinates = [];

        if (osmType === "way") {
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

            let wayMap = {};
            ways.forEach(way => {
                wayMap[way.id] = way.nodes.map(id => nodes[id]);
            });

            let outerWays = relation.members.filter(m => m.type === "way" && m.role === "outer");
            let innerWays = relation.members.filter(m => m.type === "way" && m.role === "inner");

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

            coordinates = outerRings.map((outer, index) => {
                let outerRing = outer;
                let inner = [];

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

        if (polygonLayer) {
            map.removeLayer(polygonLayer);
        }

        polygonLayer = L.polygon(coordinates, {
            color: "blue",
            weight: 2,
            fillOpacity: 0.4
        }).addTo(map);

        map.fitBounds(polygonLayer.getBounds());
        enablePolygonDragging(polygonLayer);

        document.getElementById("makeSquareButton").addEventListener("click", async () => {
            const area = calculatePolygonArea(coordinates);
            console.log(`Total area: ${area.toFixed(2)} m²`);

            if (window.rectangleLayer) {
                map.removeLayer(window.rectangleLayer);
            }
            window.rectangleLayer = drawEquivalentRectangle(area);
            enablePolygonDragging(window.rectangleLayer);
        });

        document.getElementById("makeCircleButton").addEventListener("click", async () => {
            const area = calculatePolygonArea(coordinates);
            console.log(`Total area: ${area.toFixed(2)} m²`);

            if (window.circleLayer) {
                map.removeLayer(window.circleLayer);
            }
            window.circleLayer = drawEquivalentCircle(area);
            enablePolygonDragging(window.circleLayer);
        });

    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while fetching data.");
    }
});


document.getElementById("searchButton2").addEventListener("click", async () => {
    const tagInput = prompt("Enter Overpass tag filter (e.g., landuse=industrial):");
    if (!tagInput) return;

    const bounds = map.getBounds();
    //const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;

    const query = `
        [out:json][timeout:25];
        area[name="Issaquah"]->.searchArea;
        (
            way[${tagInput}](area.searchArea);
        );
        (._; >;);
        out body;
    `;

    try {
        const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        const data = await res.json();

        const nodes = {};
        const ways = [];

        for (const el of data.elements) {
            if (el.type === "node") {
                nodes[el.id] = [el.lat, el.lon];
            } else if (el.type === "way" && el.nodes[0] === el.nodes[el.nodes.length - 1]) {
                ways.push(el);
            }
        }

        let totalArea = 0;
        const allCoords = [];

        for (const way of ways) {
            const coords = way.nodes.map(id => nodes[id]).filter(Boolean);
            if (coords.length > 2) {
                currentArea = calculatePolygonArea(coords);
                console.log(`Area of way ${way.id}: ${currentArea.toFixed(2)} m²`);
                totalArea += currentArea;
                allCoords.push(coords);
            }
        }

        console.log(`Found ${ways.length} closed ways with total area: ${totalArea.toFixed(2)} m²`);

        if (totalArea === 0) {
            alert("No area could be calculated from the result.");
            return;
        }

        if (window.squareFromSearchLayer) {
            map.removeLayer(window.squareFromSearchLayer);
        }

        window.squareFromSearchLayer = drawEquivalentRectangle(totalArea);
        enablePolygonDragging(window.squareFromSearchLayer);

    } catch (err) {
        console.error("Overpass error:", err);
        alert("Failed to fetch data from Overpass.");
    }
});


function calculatePolygonArea(coords) {
    // Use spherical excess formula for polygons on Earth
    // Returns area in square meters
    const R = 6371000; // Radius of Earth in meters

    function rad(deg) {
        return deg * Math.PI / 180;
    }

    function ringArea(ring) {
        let area = 0;
        for (let i = 0, len = ring.length; i < len; i++) {
            const [lat1, lon1] = ring[i];
            const [lat2, lon2] = ring[(i + 1) % len];

            const φ1 = rad(lat1), φ2 = rad(lat2);
            const Δλ = rad(lon2 - lon1);

            area += Δλ * (2 + Math.sin(φ1) + Math.sin(φ2));
        }
        return Math.abs(area * R * R / 2);
    }

    if (!Array.isArray(coords[0][0])) {
        // Single polygon
        return ringArea(coords);
    } else {
        // Multipolygon with possible holes
        let total = 0;
        coords.forEach(polygon => {
            const outer = polygon[0];
            total += ringArea(outer);
            for (let i = 1; i < polygon.length; i++) {
                total -= ringArea(polygon[i]); // subtract holes
            }
        });
        return total;
    }
}

function drawEquivalentRectangle(totalArea) {
    // Centered near the center of the map view
    const center = map.getCenter();
    const lat = center.lat;
    const lng = center.lng;

    const sideLength = Math.sqrt(totalArea); // Make it a square for simplicity
    const metersPerDegreeLat = 111320;
    const metersPerDegreeLng = 40075000 * Math.cos(lat * Math.PI / 180) / 360;
    const sideLat = sideLength / metersPerDegreeLat;
    const sideLng = sideLength / metersPerDegreeLng;    

    const bounds = [
        [lat - sideLat / 2, lng - sideLng / 2],
        [lat - sideLat / 2, lng + sideLng / 2],
        [lat + sideLat / 2, lng + sideLng / 2],
        [lat + sideLat / 2, lng - sideLng / 2],
        [lat - sideLat / 2, lng - sideLng / 2],
    ];
    

    const rect = L.polygon(bounds, {
        color: "red",
        weight: 2,
        fillOpacity: 0.2,
        dashArray: "5, 5"
    }).addTo(map);

    return rect;
}

function drawEquivalentCircle(totalArea) {
    // Centered near the center of the map view
    const center = map.getCenter();
    const lat = center.lat;
    const lng = center.lng;

    const radius = Math.sqrt(totalArea / Math.PI); // Radius for circle
    
    const circle = L.circle([lat, lng], {
        color: "green",
        weight: 2,
        fillOpacity: 0.2,
        radius: radius,
        dashArray: "5, 5"
    }).addTo(map);

    return circle;
}

function enablePolygonDragging(layer) {
    layer.on('mousedown', function (event) {
        map.dragging.disable();
        let startLatLng = event.latlng;

        function moveHandler(moveEvent) {
            let deltaLat = moveEvent.latlng.lat - startLatLng.lat;
            let deltaLng = moveEvent.latlng.lng - startLatLng.lng;

            let latLngs;

            try {
                latLngs = layer.getLatLngs(); // Polygon or rectangle
            } catch (e) {
                // If it's a circle, handle differently
                if (layer instanceof L.Circle) {
                    let center = layer.getLatLng();
                    let newCenter = L.latLng(center.lat + deltaLat, center.lng + deltaLng);
                    layer.setLatLng(newCenter);
                    startLatLng = moveEvent.latlng;
                    return;
                } else {
                    console.error("Unsupported layer type for dragging.");
                    return;
                }
            }

            // Shift polygon or rectangle points
            let newLatLngs = latLngs.map(ring => {
                if (Array.isArray(ring[0])) {
                    return ring.map(subRing =>
                        subRing.map(point => L.latLng(point.lat + deltaLat, point.lng + deltaLng))
                    );
                } else {
                    return ring.map(point => L.latLng(point.lat + deltaLat, point.lng + deltaLng));
                }
            });

            layer.setLatLngs(newLatLngs);
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
}



