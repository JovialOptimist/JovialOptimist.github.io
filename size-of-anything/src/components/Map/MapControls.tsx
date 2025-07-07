// src/components/Map/MapControls.tsx
import React from "react";
import { Button } from "../UI/Button";

export const MapControls: React.FC = () => {
  return (
    <div className="absolute top-4 right-4 z-10 space-y-2">
      <Button onClick={() => alert("Locate")} className="block">
        Locate
      </Button>
      <Button onClick={() => alert("North")} className="block">
        North
      </Button>
      <Button onClick={() => alert("Share")} className="block">
        Share
      </Button>
    </div>
  );
};
