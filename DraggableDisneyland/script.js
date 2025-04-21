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
        enablePolygonDragging(polygonLayer); // ✅ Enable dragging
        

        // Step 6: Calculate area and draw equivalent rectangle
        const squareButton = document.getElementById("makeSquareButton");
        squareButton.addEventListener("click", async () => {
            const area = calculatePolygonArea(coordinates);
            console.log(`Total area: ${area.toFixed(2)} m²`);

            if (window.rectangleLayer) {
                map.removeLayer(window.rectangleLayer);
            }
            window.rectangleLayer = drawEquivalentRectangle(area);
            enablePolygonDragging(window.rectangleLayer); // ✅ Enable dragging
        });

        const circleButton = document.getElementById("makeCircleButton");
        circleButton.addEventListener("click", async () => {
            const area = calculatePolygonArea(coordinates);
            console.log(`Total area: ${area.toFixed(2)} m²`);

            if (window.circleLayer) {
                map.removeLayer(window.circleLayer);
            }
            window.circleLayer = drawEquivalentCircle(area);
            enablePolygonDragging(window.circleLayer); // ✅ Enable dragging
        });
        

    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while fetching data.");
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



