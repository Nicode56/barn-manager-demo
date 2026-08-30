import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { healthEvents, HealthEvent, HealthAppointmentType } from "@/demo-data/health";
import { startLoading, stopLoading } from "./loadingSlice";
import { randomDelay } from "@/utils/randomDelay";
import { recordProviderVisit } from "./farmSlice";
import type { RootState } from "./store";

const PROVIDER_FIELD_BY_TYPE: Record<
  HealthAppointmentType,
  "lastVet" | "lastFarrier" | "lastDentist" | "lastChiropractor"
> = {
  "Vet check": "lastVet",
  "Dental cleaning": "lastDentist",
  "Farrier visit": "lastFarrier",
  "Chiropractor": "lastChiropractor",
};

// An appointment is "past" once its date (and time, if given) has passed -
// evaluated live against the current time rather than a stored flag, so it
// naturally moves between the active list and the manager's confirmation
// queue as time passes.
export function isAppointmentPast(event: HealthEvent): boolean {
  const dateTime = new Date(event.time ? `${event.date} ${event.time}` : event.date);
  if (isNaN(dateTime.getTime())) return false;
  return dateTime.getTime() < Date.now();
}

export interface AppointmentGroup {
  key: string;
  type: HealthAppointmentType;
  date: string;
  time?: string;
  vet?: string;
  events: HealthEvent[];
}

// Groups appointments that share a type/date/time/provider into one visit -
// e.g. a farrier seeing ten animals in one session becomes one group of ten,
// instead of ten separate list entries. Single-animal appointments simply
// form a group of one and render the same as before. Group/animal order
// follows the events' own array order, so farrier's owner-present-first
// ordering (set at creation time) is preserved within each group.
export function groupAppointments(events: HealthEvent[]): AppointmentGroup[] {
  const groups: AppointmentGroup[] = [];
  const groupByKey = new Map<string, AppointmentGroup>();

  for (const event of events) {
    const key = `${event.type}|${event.date}|${event.time ?? ""}|${event.vet ?? ""}`;
    let group = groupByKey.get(key);
    if (!group) {
      group = { key, type: event.type, date: event.date, time: event.time, vet: event.vet, events: [] };
      groupByKey.set(key, group);
      groups.push(group);
    }
    group.events.push(event);
  }

  return groups;
}

export const asyncAddAppointment = createAsyncThunk(
  "health/asyncAddAppointment",
  async (appointment: HealthEvent, { dispatch }) => {
    dispatch(startLoading());
    await randomDelay();
    dispatch(stopLoading());
    return appointment;
  }
);

// For appointment types that see multiple animals in one session (farrier
// visits), each animal gets its own HealthEvent - sharing the same
// date/time/provider - so it can be confirmed and recorded independently.
export const asyncAddAppointments = createAsyncThunk(
  "health/asyncAddAppointments",
  async (appointments: HealthEvent[], { dispatch }) => {
    dispatch(startLoading());
    await randomDelay();
    dispatch(stopLoading());
    return appointments;
  }
);

export const confirmAppointment = createAsyncThunk(
  "health/confirmAppointment",
  async (appointmentId: string, { dispatch, getState }) => {
    const state = getState() as RootState;
    const appointment = state.health.events.find(e => e.id === appointmentId);

    if (appointment?.animalId != null) {
      const field = PROVIDER_FIELD_BY_TYPE[appointment.type];
      dispatch(
        recordProviderVisit({
          animalId: appointment.animalId,
          field,
          date: appointment.date,
        })
      );
    }

    return appointmentId;
  }
);

const healthSlice = createSlice({
  name: "health",
  initialState: {
    events: healthEvents,
  },
  reducers: {
    addAppointmentOptimistic(state, action: PayloadAction<HealthEvent>) {
      state.events.push(action.payload);
    },
    addAppointmentsOptimistic(state, action: PayloadAction<HealthEvent[]>) {
      state.events.push(...action.payload);
    },
  },
  extraReducers: builder => {
    builder
      // Note: asyncAddAppointment/asyncAddAppointments have no matching
      // reducer here on purpose - the optimistic actions already pushed the
      // appointment(s) immediately; the thunks exist only to drive the
      // loading indicator (startLoading/stopLoading). Pushing again here
      // would insert every appointment twice.
      .addCase(confirmAppointment.fulfilled, (state, action) => {
        const appointment = state.events.find(e => e.id === action.payload);
        if (appointment) appointment.confirmed = true;
      });
  },
});

export const { addAppointmentOptimistic, addAppointmentsOptimistic } = healthSlice.actions;
export const healthReducer = healthSlice.reducer;
