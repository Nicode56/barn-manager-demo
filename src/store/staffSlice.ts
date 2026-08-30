import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/* -----------------------------
   TYPES
----------------------------- */

export interface RoutineTask {
  id: string;
  label: string;
  shift: "AM" | "PM";
  completed: boolean;
}

export interface SpecialNote {
  id: string;
  message: string;
  expireAt: string;
  animal?: string;
}

export interface FeedItem {
  id: string;
  name: string;
  low: boolean;
}

export interface AssignedAnimal {
  id: string;
  name: string;
  notes: string;
}

export interface StaffMaintenanceTask {
  id: string;
  title: string;
  notes: string;
}

export interface Lesson {
  id: string;
  time: string;
  rider: string;
  horse: string;
}

export interface ShiftReport {
  id: string;
  timestamp: string;
  shift: "AM" | "PM";
  staffName: string;
  completedTasks: RoutineTask[];
  newNotes: SpecialNote[];
  lowFeed: FeedItem[];
  shiftNotes: string[];
  shiftPhotos: string[];
}

/* -----------------------------
   INITIAL STATE
----------------------------- */

const initialState = {
  routine: [
    { id: "am-feed", label: "Feed all animals", shift: "AM", completed: false },
    { id: "am-water", label: "Top off water troughs", shift: "AM", completed: false },
    { id: "am-stalls", label: "Clean stalls / paddocks", shift: "AM", completed: false },
    { id: "am-check", label: "Check animals for injuries", shift: "AM", completed: false },
    { id: "am-feedcheck", label: "Check feed levels", shift: "AM", completed: false },
    { id: "am-suppcheck", label: "Check supplement levels", shift: "AM", completed: false },

    { id: "pm-feed", label: "Evening feed", shift: "PM", completed: false },
    { id: "pm-water", label: "Water check", shift: "PM", completed: false },
    { id: "pm-sweep", label: "Sweep stalls / paddocks", shift: "PM", completed: false },
    { id: "pm-blankets", label: "Blankets / fly masks / turnout", shift: "PM", completed: false }
  ] as RoutineTask[],

  specialNotes: [
    {
      id: "note-1",
      message: "Daisy has a swollen hock — cold hose 10 minutes.",
      expireAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      animal: "Daisy"
    },
    {
      id: "note-2",
      message: "Vet arriving at 3 PM.",
      expireAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ] as SpecialNote[],

  feedLevels: [
    { id: "feed-1", name: "Sweet Feed", low: false },
    { id: "feed-2", name: "Senior Feed", low: false },
    { id: "feed-3", name: "Alfalfa Pellets", low: false },
    { id: "supp-1", name: "Joint Supplement", low: false },
    { id: "supp-2", name: "Hoof Supplement", low: false }
  ] as FeedItem[],

  assignedAnimals: [
    { id: "horse-1", name: "Daisy", notes: "Watch left hind swelling." },
    { id: "horse-2", name: "Thunder", notes: "Sensitive stomach — no sweet feed." }
  ] as AssignedAnimal[],

  maintenanceTasks: [
    { id: "mt-1", title: "Fix loose board in paddock 3", notes: "Found during AM check." },
    { id: "mt-2", title: "Replace water float valve", notes: "PM shift noticed slow fill." }
  ] as StaffMaintenanceTask[],

  upcomingLessons: [
    { id: "lesson-1", time: "4:00 PM", rider: "Emily", horse: "Daisy" },
    { id: "lesson-2", time: "5:30 PM", rider: "Jacob", horse: "Thunder" }
  ] as Lesson[],

  shiftNotes: [] as string[],
  shiftPhotos: [] as string[],

  shiftReports: [] as ShiftReport[],
  archivedShiftReports: [] as ShiftReport[],

  managerNotifications: [] as string[],

  currentStaffName: "Unknown Staff"
};

/* -----------------------------
   SLICE
----------------------------- */

const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    markRoutineTaskComplete(state, action: PayloadAction<string>) {
      const task = state.routine.find(t => t.id === action.payload);
      if (task) task.completed = !task.completed;
    },

    markFeedLow(state, action: PayloadAction<string>) {
      const item = state.feedLevels.find(f => f.id === action.payload);
      if (item) item.low = true;
    },

    addSpecialNote(state, action: PayloadAction<{ message: string; expireAt: string; animal?: string }>) {
      state.specialNotes.push({
        id: Date.now().toString(),
        message: action.payload.message,
        expireAt: action.payload.expireAt,
        animal: action.payload.animal
      });
    },

    removeExpiredSpecialNotes(state) {
      const now = Date.now();
      state.specialNotes = state.specialNotes.filter(
        note => new Date(note.expireAt).getTime() >= now
      );
    },

    addShiftNote(state, action: PayloadAction<string>) {
      state.shiftNotes.push(action.payload);
    },

    addShiftPhoto(state, action: PayloadAction<string>) {
      state.shiftPhotos.push(action.payload);
    },

    setCurrentStaffName(state, action: PayloadAction<string>) {
      state.currentStaffName = action.payload;
    },

    pushManagerNotification(state, action: PayloadAction<string>) {
      state.managerNotifications.push(action.payload);
    },

    archiveOldReports(state) {
      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;

      const oldReports = state.shiftReports.filter(
        r => new Date(r.timestamp).getTime() < cutoff
      );

      state.archivedShiftReports.push(...oldReports);

      state.shiftReports = state.shiftReports.filter(
        r => new Date(r.timestamp).getTime() >= cutoff
      );
    },

    completeShift(state) {
      const now = new Date();
      const hour = now.getHours();
      const shift = hour < 12 ? "AM" : "PM";

      const completedTasks = state.routine.filter(t => t.completed);
      const newNotes = state.specialNotes;
      const lowFeed = state.feedLevels.filter(f => f.low);

      const report: ShiftReport = {
        id: Date.now().toString(),
        timestamp: now.toISOString(),
        shift,
        staffName: state.currentStaffName,
        completedTasks,
        newNotes,
        lowFeed,
        shiftNotes: state.shiftNotes,
        shiftPhotos: state.shiftPhotos
      };

      state.shiftReports.push(report);

      // Manager notification
      state.managerNotifications.push(
        `${shift} shift completed by ${state.currentStaffName} — ${completedTasks.length} tasks completed, ${lowFeed.length} feed items low.`
      );

      // Reset shift data
      state.routine.forEach(t => (t.completed = false));
      state.shiftNotes = [];
      state.shiftPhotos = [];

      // Auto-archive old reports
      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const oldReports = state.shiftReports.filter(
        r => new Date(r.timestamp).getTime() < cutoff
      );

      state.archivedShiftReports.push(...oldReports);

      state.shiftReports = state.shiftReports.filter(
        r => new Date(r.timestamp).getTime() >= cutoff
      );
    }
  }
});

/* -----------------------------
   EXPORTS
----------------------------- */

export const {
  markRoutineTaskComplete,
  markFeedLow,
  addSpecialNote,
  addShiftNote,
  addShiftPhoto,
  setCurrentStaffName,
  pushManagerNotification,
  archiveOldReports,
  completeShift
} = staffSlice.actions;

export const staffReducer = staffSlice.reducer;





