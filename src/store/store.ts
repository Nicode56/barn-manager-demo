import { configureStore } from "@reduxjs/toolkit";
import { feedReducer } from "./feedSlice";
import { maintenanceReducer } from "./maintenanceSlice";
import { lessonReducer } from "./lessonSlice";
import { healthReducer } from "./healthSlice";
import { farmReducer } from "./farmSlice";
import { demoReducer } from "./demoSlice";
import { loadingReducer } from "./loadingSlice";
import { staffReducer } from "./staffSlice";
import farmLayoutReducer from "./farmLayout/farmLayoutSlice";
import barnLayoutReducer from "./barnLayout/barnLayoutSlice";
import stallReducer from "./stall/stallSlice";


export const store = configureStore({
  reducer: {
    demo: demoReducer,
    barn: barnLayoutReducer,
    feed: feedReducer,
    maintenance: maintenanceReducer,
    lessons: lessonReducer,
    health: healthReducer,
    farm: farmReducer,
    staff: staffReducer,
    loading: loadingReducer,
    farmLayout: farmLayoutReducer,
    barnLayout: barnLayoutReducer,
    stall: stallReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

