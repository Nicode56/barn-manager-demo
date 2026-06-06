import React from "react";
import { useParams } from "react-router-dom";
import { animals } from "@/demo-data/animals";
import { clients } from "@/demo-data/clients";

export const AnimalDetailPage: React.FC = () => {
  const { animalId } = useParams();
  const animal = animals.find(a => a.id === animalId);

  if (!animal) {
    return <div className="p-8">Animal not found.</div>;
  }

  const owner = clients.find(c => c.id === animal.ownerId);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">{animal.name}</h1>

      <div className="space-y-3">
        <p><strong>Breed:</strong> {animal.breed}</p>
        <p><strong>Age:</strong> {animal.age}</p>
        <p><strong>Owner:</strong> {owner?.name}</p>
        <p><strong>Next Vet Visit:</strong> {animal.nextVet}</p>
        <p><strong>Next Farrier:</strong> {animal.nextFarrier}</p>
        <p><strong>Location:</strong> {animal.pasture}</p>
      </div>
    </div>
  );
};