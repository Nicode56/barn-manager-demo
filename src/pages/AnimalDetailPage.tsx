import React, { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { clients } from "@/demo-data/clients";
import { OwnerQuickView } from "@/components/OwnerQuickView";
import { MoveHorseModal } from "@/components/MoveHorseModal";
import { useCanEditLayout } from "@/hooks/useCanEditLayout";
import { useDemoAuth } from "@/contexts/DemoAuthContext";
import { updateAnimalImage } from "@/store/farmSlice";

export const AnimalDetailPage: React.FC = () => {
  const { animalId } = useParams();
  const dispatch = useDispatch<AppDispatch>();

  // Use Redux animals instead of demo-data
  const animal = useSelector((state: RootState) =>
    state.farm.animals.find(a => a.id === Number(animalId))
  );

  const [showOwnerQuickView, setShowOwnerQuickView] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const canEditLayout = useCanEditLayout();
  const { user } = useDemoAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!animal) {
    return (
      <div className="p-8">
        <p className="wood-text-box">Animal not found.</p>
      </div>
    );
  }

  const owner = clients.find(c => c.id === animal.ownerId);

  // Only the manager or the animal's own owner (checked via the logged-in
  // client's clientId against animal.ownerId) can edit the profile photo.
  // Staff and anyone browsing without a role are view-only.
  const isOwner = user?.role === "client" && user.clientId === animal.ownerId;
  const canEditAnimal = user?.role === "manager" || isOwner;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        dispatch(updateAnimalImage({ animalId: animal.id, image: reader.result }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="p-8 relative">
      <h1 className="text-3xl font-bold mb-4 page-title-banner">{animal.name}</h1>

      {/* OWNER-VISIBLE FEED & SUPPLEMENT ALERTS */}
      <div className="mb-6 space-y-2">
        {animal.feed.low && (
          <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-red-700 font-semibold">
            ⚠️ Feed Alert: Your horse’s feed is running low.
          </div>
        )}

        {animal.supplements
          .filter(s => s.low)
          .map(supp => (
            <div
              key={supp.name}
              className="p-3 bg-orange-50 border border-orange-300 rounded-lg text-orange-700 font-semibold"
            >
              ⚠️ Supplement Alert: {supp.name} is running low.
            </div>
          ))}
      </div>

      <div className="horse-profile">
        <div className="horse-image-card">
          <img
            src={animal.image}
            alt={`${animal.name} portrait`}
            className="horse-photo"
            loading="lazy"
          />

          {canEditAnimal && (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Horse image preview
                </div>
                <div className="text-xs text-slate-500">
                  Replace this image with a fresh barn photo in the final UI.
                </div>
              </div>

              <button
                type="button"
                className="replace-image-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                Replace with horse image
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageFileChange}
              />
            </div>
          )}

          {/* EMERGENCY QUICK VIEW BUTTON */}
          <button
            type="button"
            className="emergency-btn font-bold py-3 px-6 rounded-lg w-full mt-4"
            onClick={() => setShowOwnerQuickView(true)}
          >
            OWNER EMERGENCY CONTACT
          </button>
        </div>

        <div className="space-y-3 horse-profile-details">
          <p><strong>Breed:</strong> {animal.breed}</p>
          <p><strong>Age:</strong> {animal.age}</p>
          <p><strong>Owner:</strong> {owner?.name} ({owner?.email}, {owner?.phone})</p>

          <p><strong>Next Vet Visit:</strong> {animal.health.vet}</p>
          <p><strong>Next Farrier:</strong> {animal.health.farrier}</p>
          <p><strong>Next Dentist:</strong> {animal.health.dentist}</p>
          <p><strong>Vaccinations:</strong> {animal.health.vaccinations}</p>

          <p><strong>Last Vet Seen:</strong> {animal.health.lastVet ?? "Not yet recorded"}</p>
          <p><strong>Last Farrier Seen:</strong> {animal.health.lastFarrier ?? "Not yet recorded"}</p>
          <p><strong>Last Dentist Seen:</strong> {animal.health.lastDentist ?? "Not yet recorded"}</p>
          <p><strong>Last Chiropractor Seen:</strong> {animal.health.lastChiropractor ?? "Not yet recorded"}</p>

          <p><strong>Temperament:</strong> {animal.temperament}</p>
          <p><strong>Precautions:</strong> {animal.precautions}</p>

          <p>
            <strong>Current Location:</strong>{" "}
            {animal.stall || animal.pasture || "Unassigned"}
          </p>

          {canEditLayout && (
            <button
            onClick={() => setShowMoveModal(true)} 
            className="px-4 py-2 text-sm rounded-md border border-amber-300 bg-amber-50 text-amber-700 hover:border-amber-600"
            >
              Move to Different Location
            </button>
          )}
        </div>
      </div>

      {showMoveModal && (
        <MoveHorseModal
        horseId={animal.id}
        onClose={() => setShowMoveModal(false)}
        />
      )}

      {/* EMERGENCY QUICK VIEW SHEET */}
      {showOwnerQuickView && (
        <OwnerQuickView
          horseId={Number(animal.id)}
          role={"staff"}
          onClose={() => setShowOwnerQuickView(false)}
        />
      )}
    </div>
  );
};



