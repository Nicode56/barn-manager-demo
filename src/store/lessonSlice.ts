import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
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

// Whether a slot should be visible in a given client's "Available Lessons":
// open arena time (no one booked into it yet), a group lesson with room
// left, or a private lesson that's this client's own booking. A private
// lesson someone else booked never shows here, regardless of the raw
// `available` flag.
export function isLessonVisibleToClient(slot: LessonSlot, clientName: string | undefined): boolean {
  if (slot.blocked) return false;
  if (slot.format === "group") return isLessonAvailable(slot);
  return !slot.client || slot.client === clientName;
}

export interface BookSlotPayload {
  slotId: string;
  client: string;
  horse: string;
}

export const asyncBookSlot = createAsyncThunk(
  "lessons/asyncBookSlot",
  async (payload: BookSlotPayload, { dispatch }) => {
    dispatch(startLoading());
    await randomDelay();
    dispatch(stopLoading());
    return payload;
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

function applyBookSlot(state: { slots: LessonSlot[] }, payload: BookSlotPayload) {
  const slot = state.slots.find(s => s.id === payload.slotId);
  if (!slot) return;
  if (slot.format === "group") {
    const capacity = slot.capacity ?? 0;
    slot.bookedCount = Math.min((slot.bookedCount ?? 0) + 1, capacity);
    slot.available = slot.bookedCount < capacity;
  } else {
    slot.client = payload.client;
    slot.horse = payload.horse;
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
    // Clear the booking entirely so the slot reads as open arena time again
    // instead of staying hidden behind the previous booker's name.
    slot.client = "";
    slot.horse = "";
    slot.available = true;
  }
}

const lessonSlice = createSlice({
  name: "lessons",
  initialState: {
    slots: lessonSlots,
  },
  reducers: {
    bookSlotOptimistic(state, action: PayloadAction<BookSlotPayload>) {
      applyBookSlot(state, action.payload);
    },
    cancelSlotOptimistic(state, action: PayloadAction<string>) {
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
