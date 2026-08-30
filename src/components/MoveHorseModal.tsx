import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { moveAnimalToLocation, MoveTarget } from "@/store/thunks/moveAnimalThunks";

interface MoveHorseModalProps {
  horseId: number | null;
  onClose: () => void;
}

export const MoveHorseModal: React.FC<MoveHorseModalProps> = ({
  horseId,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const animals = useSelector((state: RootState) => state.farm.animals);
  const shapes = useSelector((state: RootState) => state.farmLayout.shapes);
  const stalls = useSelector((state: RootState) => state.barnLayout.stalls);

  if (!horseId) return null;

  const horse = animals.find((a) => a.id === horseId);
  if (!horse) return null;

  const eligibleShapes = shapes.filter(
    (s) => s.category !== "Barn" && s.animalId.length < (s.capacity ?? 1)
  );
  const eligibleStalls = stalls.filter((s) => s.assignedAnimalId === null);

  const handleMove = async (target: MoveTarget) => {
    await dispatch(moveAnimalToLocation({ animalId: horseId, target }));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-[400px]">
        <h2 className="text-xl font-bold mb-4">Move {horse.name}</h2>

        <p className="text-slate-600 mb-3">
          Select a new location for this horse.
        </p>

        <div className="max-h-64 overflow-y-auto space-y-2">
          {eligibleShapes.map((shape) => (
            <button
              key={shape.id}
              onClick={() => handleMove({ kind: "shape", shapeId: shape.id })}
              className="w-full text-left px-4 py-2 rounded-md border hover:bg-slate-100 transition"
            >
              {shape.name} ({shape.category}) — {shape.animalId.length}/
              {shape.capacity ?? 1} filled
            </button>
          ))}

          {eligibleStalls.map((stall) => (
            <button
              key={stall.id}
              onClick={() => handleMove({ kind: "stall", stallId: stall.id })}
              className="w-full text-left px-4 py-2 rounded-md border hover:bg-slate-100 transition"
            >
              {stall.name} (Stall) — Open
            </button>
          ))}

          {eligibleShapes.length === 0 && eligibleStalls.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-4">
              No open locations available.
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-slate-200 hover:bg-slate-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
