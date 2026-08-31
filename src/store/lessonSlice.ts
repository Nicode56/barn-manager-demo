import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { lessonSlots, LessonSlot } from "@/demo-data/lessons";
import { startLoading, stopLoading } from "./loadingSlice";
import { randomDelay } from "@/utils/randomDelay";

// The single source of truth for whether a slot counts as an "available
// lesson": a private lesson is available until someone books it, while a
// group lesson stays available until it hits capacity - a partially-booked
// group session is still open to more riders, unlike a private one.
export function isLessonAvailable(slot: LessonSlot): boolean {
  if (slot.blocked) return false;
  if (slot.format === "group") {
    return (slot.bookedCount ?? 0) < (slot.capacity ?? 0);
  }
  return slot.available;
}

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

function applyBookSlot(state: { slots: LessonSlot[] }, slotId: string) {
  const slot = state.slots.find(s => s.id === slotId);
  if (!slot) return;
  if (slot.format === "group") {
    const capacity = slot.capacity ?? 0;
    slot.bookedCount = Math.min((slot.bookedCount ?? 0) + 1, capacity);
    slot.available = slot.bookedCount < capacity;
  } else {
    slot.available = false;
  }
}

function applyCancelSlot(state: { slots: LessonSlot[] }, slotId: string) {
  const slot = state.slots.find(s => s.id === slotId);
  if (!slot) return;
  if (slot.format === "group") {
    slot.bookedCount = Math.max((slot.bookedCount ?? 0) - 1, 0);
    slot.available = true;
  } else {
    slot.available = true;
  }
}

const lessonSlice = createSlice({
  name: "lessons",
  initialState: {
    slots: lessonSlots,
  },
  reducers: {
    bookSlotOptimistic(state, action) {
      applyBookSlot(state, action.payload);
    },
    cancelSlotOptimistic(state, action) {
      applyCancelSlot(state, action.payload);
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
        applyBookSlot(state, action.payload);
      })
      .addCase(asyncCancelSlot.fulfilled, (state, action) => {
        applyCancelSlot(state, action.payload);
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
