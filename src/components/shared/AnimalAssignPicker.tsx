import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useAppDispatch } from "../../store/hooks";
import { moveAnimalToLocation, MoveTarget } from "../../store/thunks/moveAnimalThunks";

interface Props {
  animalId: number;
  targets: MoveTarget[]; // works for both farm + barn
  onClose: () => void;
}

const AnimalAssignPicker: React.FC<Props> = ({ animalId, targets, onClose }) => {
  const dispatch = useAppDispatch();
  const shapes = useSelector((state: RootState) => state.farmLayout.shapes);
  const stalls = useSelector((state: RootState) => state.barnLayout.stalls);

  const handleAssign = (target: MoveTarget) => {
    dispatch(moveAnimalToLocation({ animalId, target }));
    onClose();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {targets.map((t, idx) => {
        const isStall = t.kind === "stall";

        const stall = isStall ? stalls.find((s) => s.id === t.stallId) : undefined;
        const shape = !isStall ? shapes.find((s) => s.id === t.shapeId) : undefined;

        const alreadyHere = isStall
          ? stall?.assignedAnimalId === animalId
          : shape?.animalId.includes(animalId) ?? false;

        const stallIsFull =
          isStall && !alreadyHere && !!stall && stall.assignedAnimalId !== null;

        const shapeIsFull =
          !isStall &&
          !alreadyHere &&
          !!shape &&
          shape.animalId.length >= (shape.capacity ?? 1);

        const isFull = stallIsFull || shapeIsFull;

        const label = isStall
          ? stall?.name || t.stallId
          : `${shape?.name ?? t.shapeId} (${shape?.animalId.length ?? 0}/${shape?.capacity ?? 1})`;

        return (
          <button
            key={idx}
            onClick={() => handleAssign(t)}
            disabled={isFull || alreadyHere}
            style={{
              opacity: isFull || alreadyHere ? 0.6 : 1,
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: "#fff",
              textAlign: "left",
            }}
          >
            {label}
            {alreadyHere && " — Already here"}
            {isFull && " — Full"}
          </button>
        );
      })}
    </div>
  );
};

export default AnimalAssignPicker;
