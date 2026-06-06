import React from "react";
import { farmMap } from "@/demo-data/farm";

export const FarmMapPage: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Farm Map</h1>

      <div className="grid grid-cols-3 gap-4">
        {farmMap.map(tile => (
          <div key={tile.id} className="map-tile">
            {tile.label}
          </div>
        ))}
      </div>
    </div>
  );
};