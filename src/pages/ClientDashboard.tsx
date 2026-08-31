import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useDemoAuth } from "@/contexts/DemoAuthContext";

export const ClientDashboard: React.FC = () => {
  const { user } = useDemoAuth();
  const animals = useSelector((state: RootState) => state.farm.animals);
  const lessonSlots = useSelector((state: RootState) => state.lessons.slots);
  const healthEvents = useSelector((state: RootState) => state.health.events);

  const myHorses = animals.filter(a => a.ownerId === user?.clientId);
  const myLessons = lessonSlots.filter(
    s => s.available || s.client === user?.name,
  );
  const myHealth = healthEvents.filter(h => myHorses.some(a => a.name === h.horse));

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 page-title-banner">Client Dashboard</h1>

      <h2 className="text-xl font-semibold mb-3 page-title-banner">My Horses</h2>
      <ul className="space-y-3 mb-8">
        {myHorses.map(h => (
          <li key={h.id} className="bulletin-item">
            <Link to={`/animals/${h.id}`} className="flex items-center gap-4">
              <img
                src={h.image}
                alt={`${h.name} portrait`}
                className="horse-thumb"
                loading="lazy"
              />
              <div>
                <strong>{h.name}</strong> — {h.breed}
                <div className="text-sm text-gray-700">
                  Next vet: {h.health.vet} · Next farrier: {h.health.farrier}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mb-3 page-title-banner">Available Lessons</h2>
      <ul className="space-y-3 mb-8">
        {myLessons.map(l => (
          <li key={l.id} className="bulletin-item">
            <strong>{l.time}</strong> — {l.type}
            <div className="text-sm text-gray-700">Horse: {l.horse} · Instructor: {l.instructor}</div>
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mb-3 page-title-banner">Health Appointments</h2>
      <ul className="space-y-3">
        {myHealth.map(h => (
          <li key={h.id} className="bulletin-item">
            <strong>{h.horse}</strong> — {h.type}
            <div className="text-sm text-gray-700">{h.date} · {h.vet}</div>
            <p className="mt-1">{h.notes}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};
