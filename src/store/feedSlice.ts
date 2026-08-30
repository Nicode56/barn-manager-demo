import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "sonner";
import { startLoading, stopLoading } from "./loadingSlice";
import { randomDelay } from "@/utils/randomDelay";



export const asyncClearAlert = createAsyncThunk(
  "feed/asyncClearAlert",
  async (alertId: string, { dispatch }) => {
    dispatch(startLoading());
    await randomDelay();
    dispatch(stopLoading());
    return alertId;
  }
);


export const asyncMarkComplete = createAsyncThunk(
  "maintenance/asyncMarkComplete",
  async (taskId: string, { dispatch }) => {
    dispatch(startLoading());
    await new Promise(res => setTimeout(res, 800));
    dispatch(stopLoading());
    return taskId;
  }
);


interface FeedAlert {
  id: string;
  animalId: string;
  level: "low" | "critical";
}

interface FeedState {
  alerts: FeedAlert[];
}

const initialState: FeedState = {
  alerts: [
    { id: "fa1", animalId: "1", level: "low" },
    { id: "fa2", animalId: "3", level: "critical" },
  ],
};

const feedSlice = createSlice({
  name: "feed",
  initialState,
  reducers: {
  clearAlertOptimistic(state, action) {
    state.alerts = state.alerts.filter(a => a.id !== action.payload);
  },
},

  
  extraReducers: builder => {
  builder.addCase(asyncClearAlert.fulfilled, (state, action) => {
    state.alerts = state.alerts.filter(a => a.id !== action.payload);
  });
}



});

export const { clearAlertOptimistic } = feedSlice.actions;
export const feedReducer = feedSlice.reducer;
