import React from "react";
import "../../../styles/global.css";
import { useMapContext } from "../../../context/MapContext";
import L from "leaflet";

export const CreationPanel: React.FC = () => {
  const { map } = useMapContext();
  const polygonLayerRef = React.useRef<L.Polygon | null>(null);

  const handleSearch = async () => {
    const input = document
      .querySelector<HTMLInputElement>(".input-field")
      ?.value.trim();
    if (!input) return;

    let place = null;
    let osmType = null;
    let osmId: string | null = null;
    let overpassData = null;

    try {
      const isOsmID = /^\d+$/.test(input);

      if (isOsmID) {
        // Treat input as a Way ID and fetch directly from Overpass
        osmType = "way";
        osmId = input;
        console.log(`Direct Overpass query for Way(${osmId})`);

        let query = `[out:json]; way(${osmId}); (._; >;); out body;`;
        let response = await fetch(
          `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
            query
          )}`
        );
        overpassData = await response.json();

        if (!overpassData.elements || overpassData.elements.length === 0) {
          alert("Could not find a way with that ID.");
          return;
        }
      } else {
        // Use Nominatim to resolve name into way/relation
        let nominatimResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            input
          )}`
        );
        let nominatimData = await nominatimResponse.json();

        nominatimData = nominatimData.filter(
          (candidate: any) =>
            candidate.osm_type === "way" || candidate.osm_type === "relation"
        );
        if (nominatimData.length === 0) {
          alert("Could not find anything named " + input + ".");
          return;
        }

        place = nominatimData[0];
        osmType = place.osm_type;
        osmId = place.osm_id;

        console.log(`Resolved ${input} to ${osmType}(${osmId})`);

        let query = `[out:json]; ${osmType}(${osmId}); (._; >;); out body;`;
        let response = await fetch(
          `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
            query
          )}`
        );
        overpassData = await response.json();

        if (!overpassData.elements || overpassData.elements.length === 0) {
          alert("Boundary data not found!");
          return;
        }
      }

      // Proceed with node parsing and polygon drawing (unchanged from your code)
      let nodes: { [id: number]: [number, number] } = {};
      let ways: any[] = [];

      overpassData.elements.forEach((el: any) => {
        if (el.type === "node") {
          nodes[el.id] = [el.lat, el.lon];
        } else if (el.type === "way") {
          ways.push(el);
        }
      });

      let coordinates: any[] = [];

      if (osmType === "way") {
        let wayNodes = overpassData.elements.find(
          (el: { type: string; id: string | null }) =>
            el.type === "way" && el.id == osmId
        )?.nodes;
        if (!wayNodes) {
          alert("Could not find geometry.");
          return;
        }
        coordinates = wayNodes.map((id: string | number) => nodes[Number(id)]);
      } else if (osmType === "relation") {
        let outerRings = [];
        let innerRings = [];

        let relation = overpassData.elements.find(
          (el: { type: string; id: string | null }) =>
            el.type === "relation" && el.id == osmId
        );
        if (!relation) {
          alert("Relation not found!");
          return;
        }

        let wayMap: { [key: number]: [number, number][] } = {};
        ways.forEach((way: any) => {
          wayMap[way.id] = way.nodes.map((id: number) => nodes[id]);
        });

        let outerWays = relation.members.filter(
          (m: { type: string; role: string }) =>
            m.type === "way" && m.role === "outer"
        );
        let innerWays = relation.members.filter(
          (m: { type: string; role: string }) =>
            m.type === "way" && m.role === "inner"
        );

        function buildRings(ways: any[]) {
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

                if (
                  coords[coords.length - 1].toString() ===
                  nextCoords[0].toString()
                ) {
                  coords = coords.concat(nextCoords.slice(1));
                  ways.splice(i, 1);
                  changed = true;
                  break;
                } else if (
                  coords[0].toString() ===
                  nextCoords[nextCoords.length - 1].toString()
                ) {
                  coords = nextCoords.slice(0, -1).concat(coords);
                  ways.splice(i, 1);
                  changed = true;
                  break;
                } else if (coords[0].toString() === nextCoords[0].toString()) {
                  coords = nextCoords.reverse().slice(0, -1).concat(coords);
                  ways.splice(i, 1);
                  changed = true;
                  break;
                } else if (
                  coords[coords.length - 1].toString() ===
                  nextCoords[nextCoords.length - 1].toString()
                ) {
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
          let inner: [number, number][][] = [];

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

      // Ensure coordinates is always an array of LatLng tuples or array of arrays
      let polygonCoords: L.LatLngExpression[] | L.LatLngExpression[][] =
        coordinates;

      // If coordinates is a flat array of [lat, lng], wrap it in another array for consistency
      if (
        Array.isArray(coordinates) &&
        coordinates.length > 0 &&
        Array.isArray(coordinates[0]) &&
        typeof coordinates[0][0] === "number"
      ) {
        polygonCoords = [coordinates as [number, number][]];
      }

      if (polygonLayerRef.current && map) {
        map.removeLayer(polygonLayerRef.current);
      }

      if (map) {
        polygonLayerRef.current = L.polygon(polygonCoords, {
          color: "blue",
          weight: 2,
          fillOpacity: 0.4,
        }).addTo(map);
      }

      if (map && polygonLayerRef.current) {
        map.fitBounds(polygonLayerRef.current.getBounds());
        enablePolygonDragging(polygonLayerRef.current, map);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while fetching data.");
    }
  };

  return (
    <div id="creationPanel">
      {/* Panel content goes here */}
      <div>
        <input
          type="text"
          placeholder="Search for anything..."
          className="input-field"
        />
        <button
          id="microphoneButton"
          type="button"
          onClick={() => {
            const input =
              document.querySelector<HTMLInputElement>(".input-field");
            if (!("webkitSpeechRecognition" in window)) {
              alert("Speech recognition not supported in this browser.");
              return;
            }
            const recognition = new (window as any).webkitSpeechRecognition();
            recognition.lang = "en-US";
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            recognition.onresult = (event: any) => {
              if (input) {
                input.value = event.results[0][0].transcript;
                input.dispatchEvent(new Event("input", { bubbles: true }));
                handleSearch();
              }
            };
            recognition.onerror = () => {
              alert("Speech recognition error.");
            };
            recognition.start();
          }}
        >
          🎤
        </button>
        <button id="searchButton" onClick={handleSearch}>
          🔍
        </button>
      </div>
    </div>
  );
};

function enablePolygonDragging(layer: L.Polygon<any>, map: L.Map) {
  layer.on("mousedown", function (event) {
    map.dragging.disable();
    let startLatLng = event.latlng;

    function moveHandler(moveEvent: { latlng: L.LatLng }) {
      let deltaLat = moveEvent.latlng.lat - startLatLng.lat;
      let deltaLng = moveEvent.latlng.lng - startLatLng.lng;

      let latLngs;

      try {
        latLngs = layer.getLatLngs(); // Polygon or rectangle
      } catch (e) {
        // If it's a circle, handle differently
        if (layer instanceof L.Circle) {
          let center = layer.getLatLng();
          let newCenter = L.latLng(
            center.lat + deltaLat,
            center.lng + deltaLng
          );
          layer.setLatLng(newCenter);
          startLatLng = moveEvent.latlng;
          return;
        } else {
          console.error("Unsupported layer type for dragging.");
          return;
        }
      }

      // Shift polygon or rectangle points
      let newLatLngs = latLngs.map((ring: any) => {
        if (Array.isArray(ring) && Array.isArray(ring[0])) {
          return ring.map((subRing: any) =>
            subRing.map((point: any) =>
              L.latLng(point.lat + deltaLat, point.lng + deltaLng)
            )
          );
        } else if (Array.isArray(ring)) {
          return ring.map((point: any) =>
            L.latLng(point.lat + deltaLat, point.lng + deltaLng)
          );
        } else {
          return ring;
        }
      });

      layer.setLatLngs(newLatLngs);
      startLatLng = moveEvent.latlng;
    }

    function stopHandler() {
      map.off("mousemove", moveHandler);
      map.off("mouseup", stopHandler);
      map.dragging.enable();
    }

    map.on("mousemove", moveHandler);
    map.on("mouseup", stopHandler);
  });
}
