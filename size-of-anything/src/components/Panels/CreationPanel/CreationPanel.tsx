import React from "react";
import "../../../styles/global.css";
import { useMapContext } from "../../../context/MapContext";
import L from "leaflet";

const OSM_Type = {
  NODE: "node",
  WAY: "way",
  RELATION: "relation",
} as const;
type OSM_Type = (typeof OSM_Type)[keyof typeof OSM_Type];

export const CreationPanel: React.FC = () => {
  const { map /*, polygons? */ } = useMapContext();
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
    let overpassDataElements = null;

    try {
      // Use Nominatim to resolve name into way/relation
      let possiblePlaces: any[] = await fetchCandidates(input);
      place = possiblePlaces[0];
      osmType = place.osm_type;
      osmId = place.osm_id;
      console.log(`Resolved ${input} to ${osmType}(${osmId})`);

      overpassDataElements = await getRawCoordinates(osmType, osmId);

      // Add each node and way to the respective collections
      if (map) {
        await queryAndDisplayPolygon(
          overpassDataElements,
          {
            osmType: osmType as OSM_Type,
            osmId,
          },
          map,
          polygonLayerRef
        );
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

        const coords = await queryAndDisplayPolygon(
          data.elements,
          {}, // No osmType or osmId since this is spatial discovery
          map,
          polygonLayerRef
        );
        if (!coords) {
          alert("No valid polygon found at this location.");
          return;
        }
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

// Given the name of a place,
// fetch all possible candidates from Nominatim,
// filter out only ways and relations,
// and return the remaining list of candidates.
async function fetchCandidates(input: string) {
  // Gather candidates from Nominatim
  let nominatimResponse = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      input
    )}`
  );
  let nominatimData = await nominatimResponse.json();
  console.log("Nominatim data:", nominatimData);

  // Filter out only ways and relations
  nominatimData = nominatimData.filter(
    (candidate: any) =>
      candidate.osm_type === "way" || candidate.osm_type === "relation"
  );

  // If no candidates found, alert the user
  if (nominatimData.length === 0) {
    alert("Could not find anything named " + input + ".");
    return [];
  }

  // Return the filtered candidates
  return nominatimData;
}

// Given an OSM type and ID (which guarantees a unique element),
// fetch and return the coordinates of that way or relation using Overpass API.
async function getRawCoordinates(osmType: string, osmId: string | null) {
  let query = `[out:json]; ${osmType}(${osmId}); (._; >;); out body;`;
  let response = await fetch(
    `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
  );
  let coordinates = (await response.json()).elements;

  if (!coordinates || coordinates.length === 0) {
    alert("Boundary data not found!");
    return;
  }
  return coordinates;
}

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

function buildCoords(
  osmType: OSM_Type,
  overpassDataElements: any[],
  osmId: string | null,
  nodes: { [id: number]: [number, number] },
  ways: any[]
): any[] {
  if (osmType == OSM_Type.WAY) {
    let wayNodes = overpassDataElements.find(
      (el: { type: string; id: string | null }) =>
        el.type === "way" && el.id == osmId
    )?.nodes;

    if (!wayNodes) {
      return [];
    }

    return wayNodes.map((id: number) => nodes[id]);
  } else if (osmType == OSM_Type.RELATION) {
    let outerRings = [];
    let innerRings = [];

    let relation = overpassDataElements.find(
      (el: { type: string; id: string | null }) =>
        el.type === "relation" && el.id == osmId
    );
    if (!relation) {
      alert("Relation not found!");
      return [];
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
              coords[coords.length - 1].toString() === nextCoords[0].toString()
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
      return [];
    }

    return outerRings.map((outer, index) => {
      let outerRing = outer;
      let inner: [number, number][][] = [];

      if (index === 0) {
        inner = innerRings;
      }

      return [outerRing, ...inner];
    });
  } else {
    console.error("Unsupported OSM type:", osmType);
    return [];
  }
}

async function queryAndDisplayPolygon(
  overpassElements: any[],
  options: {
    osmType?: OSM_Type;
    osmId?: string | null;
  },
  map: L.Map,
  polygonLayerRef: React.MutableRefObject<L.Polygon | null>
) {
  let polygonCoords: L.LatLngExpression[] | L.LatLngExpression[][] | null =
    null;

  if (options.osmType && options.osmId) {
    const nodes: { [id: number]: [number, number] } = {};
    const ways: any[] = [];

    for (const el of overpassElements) {
      if (el.type === "node") nodes[el.id] = [el.lat, el.lon];
      else if (el.type === "way") ways.push(el);
    }

    const coords = buildCoords(
      options.osmType,
      overpassElements,
      options.osmId,
      nodes,
      ways
    );
    if (!coords || coords.length === 0) return null;

    // Normalize to always be [[]] (multi-ring)
    const isSingleRing =
      Array.isArray(coords) &&
      coords.length > 0 &&
      Array.isArray(coords[0]) &&
      typeof coords[0][0] === "number";
    polygonCoords = isSingleRing ? [coords as [number, number][]] : coords;
  } else {
    const extracted = extractFirstValidPolygon(overpassElements);
    if (!extracted) return null;
    polygonCoords = [extracted];
  }

  // Add to map
  if (map) {
    addPolygonToMap(polygonCoords, map, polygonLayerRef);
  } else {
    console.error("Map is not initialized: cannot add polygon.");
    return null;
  }

  return polygonCoords;
}

function addPolygonToMap(
  polygonCoords: L.LatLngExpression[] | L.LatLngExpression[][],
  map: L.Map,
  polygonLayerRef: React.MutableRefObject<L.Polygon | null>
) {
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
}
