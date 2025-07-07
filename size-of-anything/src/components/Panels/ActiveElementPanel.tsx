import React from "react";
import "../../styles/global.css";

type Coordinate = [number, number];

function ActiveElementPanel({
  name,
  outline,
}: {
  name?: string;
  outline?: Coordinate[];
}) {
  return (
    <div id="activeElementPanel">
      {/* Panel content goes here */}
      <p className="text-center font-semibold">Active Element</p>
      {name && <p className="text-center text-md mt-2">Name: {name}</p>}
      {outline && outline.length > 0 && (
        <p className="text-md mt-2">Outline: {JSON.stringify(outline)}</p>
      )}
    </div>
  );
}

export { ActiveElementPanel };
