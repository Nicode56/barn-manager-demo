import React from "react";
import { Link } from "react-router-dom";
import { useDemoAuth } from "@/contexts/DemoAuthContext";
import { animals } from "@/demo-data/animals";
import { lessonSlots } from "@/demo-data/lessons";
import { healthEvents } from "@/demo-data/health";

export const ClientDashboard: React.FC = () => {
  const { user } = useDemoAuth();

  const myHorses = animals.filter(a => user?.horses?.includes(a.id));
  const myLessons = lessonSlots.filter(s => s.available); // mock: all available slots are bookable
  const myHealth = healthEvents; // mock: show all for demo

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Client Dashboard</h1>

      <h2 className="text-xl font-semibold mb-3">My Horses</h2>
      <ul className="space-y-3 mb-8">
        {myHorses.map(h => (
          <li key={h.id} className="bulletin-item">
            {h.name} — {h.breed}
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mb-3">Available Lessons</h2>
      <ul className="space-y-3 mb-8">
        {myLessons.map(l => (
          <li key={l.id} className="bulletin-item">{l.time}</li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mb-3">Health Appointments</h2>
      <ul className="space-y-3">
        {myHealth.map(h => (
          <li key={h.id} className="bulletin-item">
            {h.type} — {h.date}
          </li>
        ))}
      </ul>
    </div>
  );
};
