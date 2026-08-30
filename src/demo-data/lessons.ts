export interface LessonSlot {
  id: string;
  time: string;
  available: boolean;
  client: string;
  horse: string;
  instructor: string;
  type: string;
  /** Set when a manager has blocked this slot out (maintenance, personal use,
   * etc.) rather than it being booked by a client. */
  blocked?: boolean;
  blockReason?: string;
}

export const lessonSlots: LessonSlot[] = [
  { id: "l1", time: "9:00 AM", available: true, client: "Emma Davis", horse: "Willow", instructor: "Jordan", type: "Beginner flatwork" },
  { id: "l2", time: "10:30 AM", available: false, client: "Liam Carter", horse: "Shadow", instructor: "Taylor", type: "Jumping lesson" },
  { id: "l3", time: "1:00 PM", available: true, client: "Ava Brooks", horse: "Daisy", instructor: "Jordan", type: "Trail prep" },
  { id: "l4", time: "2:30 PM", available: true, client: "Mia James", horse: "Copper", instructor: "Taylor", type: "Dressage basics" },
];
