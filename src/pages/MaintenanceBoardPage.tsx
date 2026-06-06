import React from "react";
import { maintenanceTasks } from "@/demo-data/maintenance";

export const MaintenanceBoardPage: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Maintenance Orders</h1>

      <ul className="space-y-4">
        {maintenanceTasks.map(task => (
          <li key={task.id} className="bulletin-item">
            {task.title} — <strong>{task.status}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
};