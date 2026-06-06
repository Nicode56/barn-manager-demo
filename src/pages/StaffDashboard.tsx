import React from "react";
import { Link } from "react-router-dom";
import { animals } from "@/demo-data/animals";
import { maintenanceTasks } from "@/demo-data/maintenance";
import { lessonSlots } from "@/demo-data/lessons";

export const StaffDashboard: React.FC = () => {
  const assignedAnimals = animals.slice(0, 2); // mock assignment
  const activeMaintenance = maintenanceTasks.filter(t => t.status !== "Completed");
  const upcomingLessons = lessonSlots.filter(s => s.available);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Barn Staff Dashboard</h1>

      <h2 className="text-xl font-semibold mb-3">Your Assigned Animals</h2>
      <ul className="space-y-3 mb-8">
        {assignedAnimals.map(a => (
          <li key={a.id} className="bulletin-item">
            {a.name} — {a.breed}
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mb-3">Maintenance Tasks</h2>
      <ul className="space-y-3 mb-8">
        {activeMaintenance.map(t => (
          <li key={t.id} className="bulletin-item">
            {t.title} — <strong>{t.status}</strong>
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mb-3">Upcoming Lessons</h2>
      <ul className="space-y-3">
        {upcomingLessons.map(l => (
          <li key={l.id} className="bulletin-item">{l.time}</li>
        ))}
      </ul>
    </div>
  );
};
