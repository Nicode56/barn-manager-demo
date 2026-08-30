import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { assignAnimalToStall, updateStall } from "../barnLayout/barnLayoutSlice";
import {
  addAnimalToShape,
  removeAnimalFromShape,
} from "../farmLayout/farmLayoutSlice";

export type MoveTarget =
  | { kind: "shape"; shapeId: string }
  | { kind: "stall"; stallId: string };

export const moveAnimalToLocation = createAsyncThunk(
  "animals/moveAnimalToLocation",
  async (
    { animalId, target }: { animalId: number; target: MoveTarget },
    { dispatch, getState }
  ) => {
    const state = getState() as RootState;

    //
    // 1. Remove animal from any shape
    //
    const currentShape = state.farmLayout.shapes.find((s) =>
      s.animalId.includes(animalId)
    );

    if (currentShape) {
      dispatch(removeAnimalFromShape({ id: currentShape.id, animalId }));
    }

    //
    // 2. Remove animal from any stall
    //
    const currentStall = state.barnLayout.stalls.find(
      (s) => s.assignedAnimalId === animalId
    );

    if (currentStall) {
      dispatch(updateStall({ id: currentStall.id, assignedAnimalId: null }));
    }

    //
    // 3. Assign to new target
    //
    if (target.kind === "shape") {
      dispatch(addAnimalToShape({ id: target.shapeId, animalId }));
    } else {
      dispatch(
        assignAnimalToStall({
          stallId: target.stallId,
          animalId,
          barnId: state.barnLayout.barnId,
          keepPasture: false,
        })
      );
    }

    return true;
  }
);
