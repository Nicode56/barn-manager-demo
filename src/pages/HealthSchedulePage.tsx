import React from "react";
import { healthEvents } from "@/demo-data/health";

export const HealthSchedulePage: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Health & Maintenance Schedule</h1>

      <ul className="space-y-4">
        {healthEvents.map(e => (
          <li key={e.id} className="bulletin-item">
            {e.type} — {e.date}
          </li>
        ))}
      </ul>
    </div>
  );
};