import React from "react";
import { Link } from "react-router-dom";
import { animals } from "@/demo-data/animals";

export const AnimalListPage: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Animals</h1>

      <ul className="space-y-4">
        {animals.map(a => (
          <li key={a.id}>
            <Link to={`/animals/${a.id}`} className="bulletin-item">
              {a.name} — {a.breed}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};