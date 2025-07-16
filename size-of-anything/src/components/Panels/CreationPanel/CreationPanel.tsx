import React from "react";
import "../../../styles/global.css";
import { useMapContext } from "../../../context/MapContext";
import L from "leaflet";

export const CreationPanel: React.FC = () => {
  const { map } = useMapContext();
  const polygonLayerRef = React.useRef<L.Polygon | null>(null);
  const [isQueryMode, setIsQueryMode] = React.useState(false);

  const handleVoiceInput = () => {
    const input = document.querySelector<HTMLInputElement>(".input-field");
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
  };

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
        //map.removeLayer(polygonLayerRef.current);
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

  React.useEffect(() => {
    if (!map || !isQueryMode) return;

    const onMapClick = async (e: L.LeafletMouseEvent) => {
      setIsQueryMode(false);
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      const distance = 25; // meters around point
      const query = `
      [out:json][timeout:25];
      (
        is_in(${lat}, ${lng});
        way(around:${distance},${lat},${lng});
        relation(around:${distance},${lat},${lng});
      );
      out body geom;
      >;
      out geom;
    `;

      try {
        const response = await fetch(
          "https://overpass-api.de/api/interpreter",
          {
            method: "POST",
            body: query,
            headers: { "Content-Type": "text/plain" },
          }
        );

        const data = await response.json();

        const polygonFeature = extractFirstValidPolygon(data.elements);
        if (!polygonFeature) {
          alert("No valid polygon found at that location.");
          return;
        }

        const latLngs = polygonFeature.map(([lat, lon]) => [
          lat,
          lon,
        ]) as L.LatLngExpression[];

        if (polygonLayerRef.current) {
          map.removeLayer(polygonLayerRef.current);
        }

        polygonLayerRef.current = L.polygon(latLngs, {
          color: "red",
          weight: 2,
          fillOpacity: 0.3,
        }).addTo(map);

        map.fitBounds(polygonLayerRef.current.getBounds());
        enablePolygonDragging(polygonLayerRef.current, map);
      } catch (error) {
        console.error(error);
        alert("Failed to load data.");
      }
    };

    map.on("click", onMapClick);

    return () => {
      map.off("click", onMapClick);
      setIsQueryMode(false);
    };
  }, [map, isQueryMode]);

  const handleMagicWandClick = () => {
    setIsQueryMode(true);
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
        <button id="microphoneButton" type="button" onClick={handleVoiceInput}>
          🎤
        </button>
        <button id="searchButton" onClick={handleSearch}>
          🔍
        </button>
        <button id="magicWandButton" onClick={handleMagicWandClick}>
          🪄
        </button>
      </div>
    </div>
  );
};

function enablePolygonDragging(layer: L.Polygon<any>, map: L.Map) {
  let originalLatLngs: L.LatLng[][] | null = null;
  let dragStartLatLng: L.LatLng | null = null;

  layer.on("mousedown", function (event) {
    map.dragging.disable();
    dragStartLatLng = event.latlng;

    // Deep copy of the original points (not just a reference)
    const latLngs = layer.getLatLngs() as any;
    originalLatLngs = latLngs.map((ring: any) =>
      Array.isArray(ring[0])
        ? ring.map((subRing: any) =>
            subRing.map((pt: L.LatLng) => L.latLng(pt.lat, pt.lng))
          )
        : ring.map((pt: L.LatLng) => L.latLng(pt.lat, pt.lng))
    );

    function moveHandler(moveEvent: { latlng: L.LatLng }) {
      if (!originalLatLngs || !dragStartLatLng) return;

      const latDiff = moveEvent.latlng.lat - dragStartLatLng.lat;
      const lngDiff = moveEvent.latlng.lng - dragStartLatLng.lng;

      const startLat = dragStartLatLng.lat;
      const newLat = moveEvent.latlng.lat;

      const startCos = Math.cos((startLat * Math.PI) / 180);
      const newCos = Math.cos((newLat * Math.PI) / 180);

      const widthScale = startCos / newCos;

      function shiftAndScaleRing(ring: L.LatLng[]) {
        const centerLng =
          ring.reduce((sum, pt) => sum + pt.lng, 0) / ring.length;

        return ring.map((pt) => {
          const newLat = pt.lat + latDiff;

          const lngOffset = pt.lng - centerLng;
          const scaledLngOffset = lngOffset * widthScale;
          const newLng = centerLng + scaledLngOffset + lngDiff;

          return L.latLng(newLat, newLng);
        });
      }

      const transformed = originalLatLngs.map((ring: any) => {
        if (Array.isArray(ring[0])) {
          return ring.map((subRing: any) => shiftAndScaleRing(subRing));
        } else {
          return shiftAndScaleRing(ring);
        }
      });

      layer.setLatLngs(transformed);
    }

    function stopHandler() {
      map.off("mousemove", moveHandler);
      map.off("mouseup", stopHandler);
      map.dragging.enable();

      // Clear temporary state
      originalLatLngs = null;
      dragStartLatLng = null;
    }

    map.on("mousemove", moveHandler);
    map.on("mouseup", stopHandler);
  });
}

function extractFirstValidPolygon(elements: any[]): [number, number][] | null {
  for (const el of elements) {
    if (!el.geometry || el.geometry.length < 3) continue;

    const coords = el.geometry.map((p: any) => [p.lat, p.lon]);

    // Ensure the polygon is closed
    const first = coords[0];
    const last = coords[coords.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      coords.push(first);
    }

    return coords as [number, number][];
  }

  return null;
}
