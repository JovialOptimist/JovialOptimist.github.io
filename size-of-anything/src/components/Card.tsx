import React, { useEffect, useRef, useState } from "react";
import "./Card.css";

interface WayCardProps {
  id: number;
}

interface OsmElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
  nodes?: number[];
}

const tagThemeMap: Record<string, Record<string, string>> = {
  amenity: {
    hospital: "theme-red",
    school: "theme-blue",
    library: "theme-indigo",
    university: "theme-purple",
    kindergarten: "theme-pink",
    restaurant: "theme-orange",
    cafe: "theme-coffee",
    fast_food: "theme-yellow",
    bar: "theme-brown",
    pub: "theme-beer",
    police: "theme-darkblue",
    fire_station: "theme-red",
    post_office: "theme-orange",
    bank: "theme-green",
    pharmacy: "theme-pink",
    clinic: "theme-lightred",
    toilet: "theme-lightgray",
    shelter: "theme-gray",
    community_centre: "theme-teal",
    recycling: "theme-green",
    marketplace: "theme-yellow",
    parking: "theme-gray",
    charging_station: "theme-electric",
    fountain: "theme-blue",
    bus_station: "theme-teal",
    courthouse: "theme-burgundy",
    townhall: "theme-purple",
  },
  natural: {
    water: "theme-blue",
    wood: "theme-green",
    peak: "theme-gray",
    tree: "theme-forest",
    cliff: "theme-brown",
    spring: "theme-lightblue",
    bay: "theme-blue",
    reef: "theme-coral",
    rock: "theme-darkgray",
    wetland: "theme-aqua",
    sand: "theme-sand",
    volcano: "theme-red",
    glacier: "theme-cyan",
  },
  landuse: {
    cemetery: "theme-purple",
    residential: "theme-gray",
    retail: "theme-orange",
    commercial: "theme-darkgray",
    industrial: "theme-brown",
    farmland: "theme-yellow",
    forest: "theme-green",
    grass: "theme-lightgreen",
    recreation_ground: "theme-teal",
    railway: "theme-darkgray",
    orchard: "theme-olive",
    vineyard: "theme-grape",
    allotments: "theme-leaf",
    brownfield: "theme-brown",
    greenfield: "theme-lightgreen",
    quarry: "theme-gray",
  },
  leisure: {
    park: "theme-green",
    stadium: "theme-orange",
    pitch: "theme-grass",
    swimming_pool: "theme-blue",
    garden: "theme-pink",
    dog_park: "theme-brown",
    golf_course: "theme-lime",
    fitness_centre: "theme-red",
    nature_reserve: "theme-forest",
    marina: "theme-navy",
    playground: "theme-yellow",
    track: "theme-red",
    ice_rink: "theme-lightblue",
    sports_centre: "theme-teal",
    water_park: "theme-cyan",
  },
  highway: {
    primary: "theme-orange",
    residential: "theme-lightgray",
    secondary: "theme-yellow",
    tertiary: "theme-lime",
    service: "theme-gray",
    footway: "theme-brown",
    cycleway: "theme-blue",
    motorway: "theme-red",
    trunk: "theme-green",
    pedestrian: "theme-pink",
    unclassified: "theme-lightgray",
    path: "theme-brown",
    steps: "theme-gray",
    bus_stop: "theme-teal",
    crossing: "theme-yellow",
  },
  building: {
    yes: "theme-gray",
    house: "theme-lightgray",
    apartments: "theme-bluegray",
    retail: "theme-orange",
    commercial: "theme-darkgray",
    industrial: "theme-brown",
    church: "theme-purple",
    school: "theme-blue",
    hospital: "theme-red",
    train_station: "theme-navy",
    hotel: "theme-gold",
    hut: "theme-wood",
    garage: "theme-gray",
    warehouse: "theme-slate",
    sports_hall: "theme-teal",
  },
  place: {
    neighbourhood: "theme-gray",
    suburb: "theme-lightgray",
    city: "theme-darkblue",
    town: "theme-purple",
    village: "theme-green",
    hamlet: "theme-brown",
    locality: "theme-lightgray",
    island: "theme-blue",
    farm: "theme-yellowgreen",
  },
  tourism: {
    attraction: "theme-gold",
    museum: "theme-indigo",
    zoo: "theme-orange",
    theme_park: "theme-pink",
    viewpoint: "theme-lightblue",
    artwork: "theme-purple",
    hotel: "theme-gold",
    guest_house: "theme-beige",
    motel: "theme-gray",
    camp_site: "theme-green",
    caravan_site: "theme-lightgreen",
    hostel: "theme-teal",
  },
  shop: {
    supermarket: "theme-green",
    bakery: "theme-yellow",
    clothes: "theme-pink",
    shoes: "theme-brown",
    electronics: "theme-blue",
    books: "theme-indigo",
    convenience: "theme-lightgray",
    greengrocer: "theme-leaf",
    butcher: "theme-red",
    florist: "theme-pink",
    hairdresser: "theme-purple",
    furniture: "theme-wood",
    jewelry: "theme-gold",
    gift: "theme-red",
    pet: "theme-orange",
  },
  railway: {
    station: "theme-navy",
    halt: "theme-lightblue",
    tram_stop: "theme-teal",
    subway_entrance: "theme-darkgray",
    level_crossing: "theme-yellow",
    signal: "theme-red",
  },
  man_made: {
    bridge: "theme-gray",
    lighthouse: "theme-white",
    pier: "theme-wood",
    tower: "theme-silver",
    water_tower: "theme-blue",
    windmill: "theme-cyan",
    pipeline: "theme-darkgray",
  },
};

function getThemeClassFromTags(tags: Record<string, string> | null): string {
  if (!tags) return "theme-default";

  for (const key of Object.keys(tagThemeMap)) {
    const value = tags[key];
    if (value && tagThemeMap[key][value]) {
      return tagThemeMap[key][value];
    }
  }

  return "theme-default";
}

import { polygon, multiPolygon, area } from "@turf/turf";
/**
 * Calculate the area of a closed OSM way (or multipolygon) in square kilometers.
 * @param coords Array of [lon, lat] coordinates that form a closed polygon.
 * @returns Area in square kilometers.
 */
function calculateOsmAreaKm2(coords: [number, number][]): number {
  if (coords.length < 3) return 0;

  // Ensure it's a closed polygon
  const first = coords[0];
  const last = coords[coords.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    coords.push(first); // close the ring
  }

  const poly = polygon([coords]);
  const areaSqMeters = area(poly);

  return areaSqMeters / 1_000_000;
}

function WayCard({ id }: WayCardProps) {
  const [tags, setTags] = useState<Record<string, string> | null>(null);
  const [coords, setCoords] = useState<[number, number][]>([]);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fetchWayData = async () => {
      try {
        const query = `
          [out:json];
          way(${id});
          (._;>;);
          out body;
        `;
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
          query
        )}`;
        const res = await fetch(url);
        const json = await res.json();

        const elements: OsmElement[] = json.elements;

        const nodeMap = new Map<number, [number, number]>();
        const way = elements.find((el) => el.type === "way" && el.id === id);
        if (!way || !way.nodes) throw new Error("Way not found");

        for (const el of elements) {
          if (el.type === "node" && el.lat && el.lon) {
            nodeMap.set(el.id, [el.lon, el.lat]);
          }
        }

        const wayCoords = way.nodes
          .map((nodeId) => nodeMap.get(nodeId))
          .filter(Boolean) as [number, number][];
        setTags(way.tags ?? {});
        setCoords(wayCoords);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load OSM way.");
      }
    };

    fetchWayData();
  }, [id]);

  useEffect(() => {
    if (coords.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const padding = 10;
    const width = canvas.width;
    const height = canvas.height;

    const lons = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);

    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    // 🌍 Latitude-based aspect ratio correction
    const avgLat = (minLat + maxLat) / 2;
    const latCorrection = Math.cos(avgLat * (Math.PI / 180));

    // Apply correction to lon range
    const correctedLonRange = (maxLon - minLon) * latCorrection;
    const latRange = maxLat - minLat;

    const scaleX = (width - padding * 2) / correctedLonRange;
    const scaleY = (height - padding * 2) / latRange;
    const scale = Math.min(scaleX, scaleY);

    const offsetX = padding - minLon * scale * latCorrection;
    const offsetY = padding + maxLat * scale;

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();

    coords.forEach(([lon, lat], i) => {
      const x = lon * scale * latCorrection + offsetX;
      const y = offsetY - lat * scale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [coords]);

  const themeClass = getThemeClassFromTags(tags);
  let size = calculateOsmAreaKm2(coords);

  return (
    <div className={`way-card ${themeClass}`}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {tags?.name && <h2>{tags.name}</h2>}
        <button className="card-button">❔</button>
      </div>
      {error ? (
        <p className="error-text">{error}</p>
      ) : (
        <>
          <canvas
            ref={canvasRef}
            className="way-canvas"
            width={300}
            height={300}
          />
          {/* <p className="way-id">Way ID: {id}</p> */}
          <p className="way-id">{size.toFixed(2)} km²</p>
          <details className="way-details">
            <summary className="way-details-summary">Attributes</summary>
            <pre className="way-tags">{JSON.stringify(tags, null, 2)}</pre>
          </details>
        </>
      )}
    </div>
  );
}

export default WayCard;
