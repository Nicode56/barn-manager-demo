import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StallShape, StallType } from "./barnLayoutTypes";
import { animals } from "../../demo-data/animals";

interface BarnLayoutState {
  stalls: StallShape[];
  selectedStallId: string | null;
  barnId: string;
}

const initialState: BarnLayoutState = {
  stalls: [],
  selectedStallId: null,
  barnId: '',
};

export const barnLayoutSlice = createSlice({
  name: "barnLayout",
  initialState,
  reducers: {
    // -----------------------------
    // SELECT STALL
    // -----------------------------
    selectStall(state, action: PayloadAction<string | null>) {
      state.selectedStallId = action.payload;
    },

    // -----------------------------
    // ADD STALL
    // -----------------------------
    addStall(state, action: PayloadAction<{ x?: number; y?: number } | undefined>) {
      const newId = "stall-" + Math.random().toString(36).substring(2, 9);

      state.stalls.push({
        id: newId,
        x: action.payload?.x ?? 40,
        y: action.payload?.y ?? 40,
        width: 260,
        height: 260,
        stallType: "standard",
        notes: "",
        capacity: 1,
        assignedAnimalId: null,

        // REQUIRED BY StallShape
        farmId: "",
        barnId: state.barnId,
        name: "",
        rotation: 0,
      });
    },

    addTackroom(state, action: PayloadAction<{ x?: number; y?: number } | undefined>) {
      const newId = "tack-" + Math.random().toString(36).substring(2, 9);

      state.stalls.push({
        id: newId,
        x: action.payload?.x ?? 40,
        y: action.payload?.y ?? 40,
        width: 180,
        height: 260,
        stallType: "tackroom",
        notes: "",
        capacity: 0,
        assignedAnimalId: null,

        // REQUIRED BY StallShape
        farmId: "",
        barnId: state.barnId,
        name: "",
        rotation: 0,
      });
    },

    saveMap(state, action: PayloadAction<string>) {
      const barnId = action.payload;

      console.log("Saving barn layout for barn:", barnId);
      console.log("Current stalls:", JSON.parse(JSON.stringify(state.stalls)));
    },

    saveAssignments(state, action: PayloadAction<string>) {
      const barnId = action.payload;

      console.log("Saving animal assignments for barn:", barnId);

      const assigned = state.stalls
        .filter((s) => s.assignedAnimalId)
        .map((s) => ({
          stallId: s.id,
          animalId: s.assignedAnimalId,
        }));

      console.log("Assignments:", assigned);
    },

    // -----------------------------
    // UPDATE POSITION (DRAG)
    // -----------------------------
    updateStallPosition(
      state,
      action: PayloadAction<{ id: string; x: number; y: number }>
    ) {
      const stall = state.stalls.find((s) => s.id === action.payload.id);
      if (!stall) return;

      stall.x = action.payload.x;
      stall.y = action.payload.y;
    },

    // -----------------------------
    // SNAP TO GRID
    // -----------------------------
    snapStallToGrid(
      state,
      action: PayloadAction<{ id: string; x: number; y: number }>
    ) {
      const stall = state.stalls.find((s) => s.id === action.payload.id);
      if (!stall) return;

      stall.x = action.payload.x;
      stall.y = action.payload.y;
    },

    // -----------------------------
    // CHANGE STALL TYPE
    // -----------------------------
    setStallType(
      state,
      action: PayloadAction<{ id: string; stallType: StallType }>
    ) {
      const stall = state.stalls.find((s) => s.id === action.payload.id);
      if (!stall) return;

      stall.stallType = action.payload.stallType;
    },

    // -----------------------------
    // ASSIGN ANIMAL
    // -----------------------------
    assignAnimalToStall(
      state,
      action: PayloadAction<{
        animalId: number;
        stallId: string;
        barnId: string;
        keepPasture?: boolean;
      }>
    ) {
      const { animalId, stallId, barnId, keepPasture } = action.payload;

      const stall = state.stalls.find((s) => s.id === stallId);
      if (!stall) return;

      // Clear this animal from any other stall it currently occupies
      state.stalls.forEach((s) => {
        if (s.id !== stallId && s.assignedAnimalId === animalId) {
          s.assignedAnimalId = null;
        }
      });

      // Assign stall
      stall.assignedAnimalId = animalId;

      // Update animal in demo-data
      const animal = animals.find((a) => a.id === animalId);
      if (!animal) return;

      animal.barnId = barnId;
      animal.stall = stallId;

      if (!keepPasture) {
        animal.pasture = '';
      }
    },

    // -----------------------------
    // UPDATE CAPACITY
    // -----------------------------
    updateCapacity(
      state,
      action: PayloadAction<{ id: string; capacity: number }>
    ) {
      const stall = state.stalls.find((s) => s.id === action.payload.id);
      if (!stall) return;

      stall.capacity = action.payload.capacity;
    },

    // -----------------------------
    // UPDATE NOTES
    // -----------------------------
    updateNotes(
      state,
      action: PayloadAction<{ id: string; notes: string }>
    ) {
      const stall = state.stalls.find((s) => s.id === action.payload.id);
      if (!stall) return;

      stall.notes = action.payload.notes;
    },

    updateStall(
      state,
      action: PayloadAction<{ id: string; [key: string]: any }>
    ) {
      const { id, ...changes } = action.payload;
      const stall = state.stalls.find((s) => s.id === id);
      if (stall) {
        Object.assign(stall, changes);
      }
    }
  },
});

export const {
  selectStall,
  addStall,
  addTackroom,
  saveMap,
  saveAssignments,
  updateStallPosition,
  snapStallToGrid,
  setStallType,
  assignAnimalToStall,
  updateCapacity,
  updateNotes,
  updateStall,
} = barnLayoutSlice.actions;

export default barnLayoutSlice.reducer;



