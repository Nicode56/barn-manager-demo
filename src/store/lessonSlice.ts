import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { lessonSlots } from "@/demo-data/lessons";
import { startLoading, stopLoading } from "./loadingSlice";
import { randomDelay } from "@/utils/randomDelay";

export const asyncBookSlot = createAsyncThunk(
  "lessons/asyncBookSlot",
  async (slotId: string, { dispatch }) => {
    dispatch(startLoading());
    await randomDelay();
    dispatch(stopLoading());
    return slotId;
  }
);

export const asyncCancelSlot = createAsyncThunk(
  "lessons/asyncCancelSlot",
  async (slotId: string) => {
    await new Promise(res => setTimeout(res, 700));
    return slotId;
  }
);

export const asyncBlockSlot = createAsyncThunk(
  "lessons/asyncBlockSlot",
  async (payload: { id: string; reason: string }, { dispatch }) => {
    dispatch(startLoading());
    await randomDelay();
    dispatch(stopLoading());
    return payload;
  }
);

export const asyncUnblockSlot = createAsyncThunk(
  "lessons/asyncUnblockSlot",
  async (slotId: string, { dispatch }) => {
    dispatch(startLoading());
    await randomDelay();
    dispatch(stopLoading());
    return slotId;
  }
);

const lessonSlice = createSlice({
  name: "lessons",
  initialState: {
    slots: lessonSlots,
  },
  reducers: {
    bookSlotOptimistic(state, action) {
      const slot = state.slots.find(s => s.id === action.payload);
      if (slot) slot.available = false;
    },
    cancelSlotOptimistic(state, action) {
      const slot = state.slots.find(s => s.id === action.payload);
      if (slot) slot.available = true;
    },
    blockSlotOptimistic(state, action: { payload: { id: string; reason: string } }) {
      const slot = state.slots.find(s => s.id === action.payload.id);
      if (slot && slot.available) {
        slot.available = false;
        slot.blocked = true;
        slot.blockReason = action.payload.reason;
      }
    },
    unblockSlotOptimistic(state, action) {
      const slot = state.slots.find(s => s.id === action.payload);
      if (slot && slot.blocked) {
        slot.available = true;
        slot.blocked = false;
        slot.blockReason = undefined;
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(asyncBookSlot.fulfilled, (state, action) => {
        const slot = state.slots.find(s => s.id === action.payload);
        if (slot) slot.available = false;
      })
      .addCase(asyncCancelSlot.fulfilled, (state, action) => {
        const slot = state.slots.find(s => s.id === action.payload);
        if (slot) slot.available = true;
      })
      .addCase(asyncBlockSlot.fulfilled, (state, action) => {
        const slot = state.slots.find(s => s.id === action.payload.id);
        if (slot) {
          slot.available = false;
          slot.blocked = true;
          slot.blockReason = action.payload.reason;
        }
      })
      .addCase(asyncUnblockSlot.fulfilled, (state, action) => {
        const slot = state.slots.find(s => s.id === action.payload);
        if (slot) {
          slot.available = true;
          slot.blocked = false;
          slot.blockReason = undefined;
        }
      });
  },
});

export const {
  bookSlotOptimistic,
  cancelSlotOptimistic,
  blockSlotOptimistic,
  unblockSlotOptimistic,
} = lessonSlice.actions;
export const lessonReducer = lessonSlice.reducer;
