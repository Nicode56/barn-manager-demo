import { createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";


const demoSlice = createSlice({
  name: "demo",
  initialState: {
    message:
      "This demo shows how actual barn operations would appear: lesson bookings, health alerts, schedules, and team notes all visible at a glance.",
    highlights: [
      {
        title: "Barn status",
        detail: "8 horses on site, 4 open stalls, pasture rotation starting today.",
      },
      {
        title: "Lesson schedule",
        detail: "Ava, Ben, and Claire are booked; reserve Rojo for the afternoon session.",
      },
      {
        title: "Health alerts",
        detail: "Copper and Sahara need farrier check-ins; Luna is due for vaccines.",
      },
    ],
    boardNotes: [
      {
        title: "Farrier visit",
        description: "Copper and Sahara due for hoof trims on Friday morning.",
        link: "/animal-maintenance",
      },
      {
        title: "Client lessons",
        description: "Confirm lesson times for the week. Cancel if needed",
        link: "/lessons",
      },
      {
        title: "Vet Visit",
        description: "Review health and request appt if needed.",
        link: "/health-schedule",
      },
      {
        title: "Morning barn note",
        description: "Pasture construction ongoing throughout the week.",
        link: "/demo/manager",
      },
      {
        title: "New Arrivals",
        description: "Three new animals due to arrive this week."
      }
    ],
  },
  reducers: {},
});

export const demoReducer = demoSlice.reducer;
