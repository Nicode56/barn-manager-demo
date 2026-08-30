import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StallDetails } from "./stallTypes";

interface StallState {
  details: StallDetails[];
  openModalStallId: string | null;
}

const initialState: StallState = {
  details: [],
  openModalStallId: null,
};

const stallSlice = createSlice({
  name: "stall",
  initialState,
  reducers: {
    openStallModal(state, action: PayloadAction<string>) {
      state.openModalStallId = action.payload;
    },
    closeStallModal(state) {
      state.openModalStallId = null;
    },
    setStallDetails(state, action: PayloadAction<StallDetails>) {
      const existing = state.details.find(d => d.stallId === action.payload.stallId);
      if (existing) {
        Object.assign(existing, action.payload);
      } else {
        state.details.push(action.payload);
      }
    },
    updateStallDetails(
      state,
      action: PayloadAction<{ stallId: string; changes: Partial<StallDetails> }>
    ) {
      const stall = state.details.find(d => d.stallId === action.payload.stallId);
      if (stall) {
        Object.assign(stall, action.payload.changes);
      }
    },
  },
});

export const {
  openStallModal,
  closeStallModal,
  setStallDetails,
  updateStallDetails,
} = stallSlice.actions;

export default stallSlice.reducer;