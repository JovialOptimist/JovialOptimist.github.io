import React from "react";

type Coordinate = [number, number];

function ActiveElementPanel({
  name,
  outline,
}: {
  name?: string;
  outline?: Coordinate[];
}) {
  return (
    <div
      style={{
        width: "30vw",
        height: "20vh",
        backgroundColor: "#a5f2f1",
        boxSizing: "border-box",
        border: "3px solid #539695",
        borderRadius: "8px",
        verticalAlign: "middle",
        textAlign: "center",
        alignContent: "center",
        fontSize: "1.5em",
      }}
    >
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
