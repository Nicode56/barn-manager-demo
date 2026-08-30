export type HealthAppointmentType =
  | "Vet check"
  | "Dental cleaning"
  | "Farrier visit"
  | "Chiropractor";

export interface HealthEvent {
  id: string;
  type: HealthAppointmentType;
  date: string; // "YYYY-MM-DD" for new appointments; loose strings ("June 15") for seed data
  time?: string; // "HH:MM", 24-hour
  horse: string;
  animalId?: number;
  vet?: string; // provider name - optional ("if available")
  notes?: string;
  // For farrier visits (which see a whole list of animals in one session):
  // whether this animal's owner will be present, so owner-present animals
  // can be worked to the front of the farrier's list.
  ownerPresent?: boolean;
  ownerUnavailable?: boolean;
  relayNotes?: string;
  confirmed?: boolean;
}

export const healthEvents: HealthEvent[] = [
  {
    id: "h1",
    type: "Vet check",
    date: "June 15",
    horse: "Copper",
    vet: "Dr. Ellis",
    notes: "Follow up on ankle swelling.",
    ownerUnavailable: true,
    relayNotes: "Please let the owner know Copper needs daily light turnout and joint supplement support after the check-up.",
  },
  {
    id: "h2",
    type: "Dental cleaning",
    date: "July 1",
    horse: "Willow",
    vet: "Dr. Patel",
    notes: "Check molar alignment.",
    ownerUnavailable: false,
  },
  {
    id: "h3",
    type: "Farrier visit",
    date: "July 10",
    horse: "Luna",
    vet: "Farrier Jay",
    notes: "Balance left hind hoof.",
    ownerUnavailable: true,
    relayNotes: "Tell the owner to keep Luna turned out on soft footing for 48 hours and monitor for any soreness.",
  },
];
