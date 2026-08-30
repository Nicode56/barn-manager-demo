import { MaintenanceTask, maintenanceTasks } from "@/demo-data/maintenance";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { startLoading, stopLoading } from "./loadingSlice";
import { randomDelay } from "@/utils/randomDelay";

export const asyncMarkComplete = createAsyncThunk(
  "maintenance/asyncMarkComplete",
  async (taskId: string, { dispatch }) => {
    dispatch(startLoading());
    await randomDelay();
    dispatch(stopLoading());
    return taskId;
  }
);

export const asyncScheduleTask = createAsyncThunk(
  "maintenance/asyncScheduleTask",
  async (taskId: string) => {
    await new Promise(res => setTimeout(res, 800));
    return taskId;
  }
);

const maintenanceSlice = createSlice({
  name: "maintenance",
  initialState: {
  tasks: maintenanceTasks as MaintenanceTask[],
  completedTasks: [] as MaintenanceTask[]
},

  reducers: {
    markCompleteOptimistic: (state, action) => {
      const id = action.payload;
      const task = state.tasks.find(t => t.id === id);
      


      if (task) {
        task.status = "Completed";

        state.completedTasks.push({
          ...task,
          completedAt: new Date().toISOString()
        });

        state.tasks = state.tasks.filter(t => t.id !== id);
      }
    },

    scheduleTaskOptimistic(state, action) {
      const task = state.tasks.find(t => t.id === action.payload);
      if (task) task.status = "Scheduled";
    },

    addMaintenanceTask: (
      state,
      action: PayloadAction<{
        title: string;
        notes?: string;
        dueDate: string;
        assignedTo: string;
        repairCost?: number;
      }>
    ) => {
      state.tasks.push({
        id: Date.now().toString(),
        title: action.payload.title,
        status: "Pending",
        notes: action.payload.notes ?? "",
        dueDate: action.payload.dueDate,
        assignedTo: action.payload.assignedTo,
        repairCost: action.payload.repairCost ?? null
      });
    },

    updateMaintenanceTask: (
      state,
      action: PayloadAction<{
        id: string;
        title?: string;
        notes?: string;
        dueDate?: string;
        assignedTo?: string;
        repairCost?: number;
      }>
    ) => {
      const task =
        state.tasks.find(t => t.id === action.payload.id) ||
        state.completedTasks.find(t => t.id === action.payload.id);

      if (task) {
        Object.assign(task, action.payload);
      }
    }
  },

  extraReducers: builder => {
    builder.addCase(asyncMarkComplete.fulfilled, (state, action) => {
      const task = state.tasks.find(t => t.id === action.payload);
      if (task) task.status = "Completed";
    });

    builder.addCase(asyncScheduleTask.fulfilled, (state, action) => {
      const task = state.tasks.find(t => t.id === action.payload);
      if (task) task.status = "Scheduled";
    });
  }
});



export const {
  markCompleteOptimistic,
  scheduleTaskOptimistic,
  addMaintenanceTask,
  updateMaintenanceTask
} = maintenanceSlice.actions;

export const maintenanceReducer = maintenanceSlice.reducer;

