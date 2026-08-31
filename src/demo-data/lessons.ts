export type LessonFormat = "private" | "group";

export interface LessonSlot {
  id: string;
  time: string;
  available: boolean;
  client: string;
  horse: string;
  instructor: string;
  type: string;
  /** Most farms only offer private (single horse + trainer) lessons; larger
   * farms can optionally also offer group lessons. Omitted/undefined means
   * "private" - group is opt-in, not the default. */
  format?: LessonFormat;
  /** Group lessons only: how many riders the session can hold. */
  capacity?: number;
  /** Group lessons only: how many riders have booked in so far. */
  bookedCount?: number;
  /** Set when a manager has blocked this slot out (maintenance, personal use,
   * etc.) rather than it being booked by a client. */
  blocked?: boolean;
  blockReason?: string;
}

export const lessonSlots: LessonSlot[] = [
  { id: "l1", time: "9:00 AM", available: true, client: "", horse: "", instructor: "Jordan", type: "Beginner flatwork", format: "private" },
  { id: "l2", time: "10:30 AM", available: false, client: "Liam Carter", horse: "Shadow", instructor: "Taylor", type: "Jumping lesson", format: "private" },
  { id: "l3", time: "1:00 PM", available: true, client: "", horse: "", instructor: "Jordan", type: "Trail prep", format: "private" },
  { id: "l4", time: "2:30 PM", available: true, client: "", horse: "", instructor: "Taylor", type: "Dressage basics", format: "private" },
  { id: "l5", time: "11:00 AM", available: true, client: "", horse: "", instructor: "Jordan", type: "Group flatwork clinic", format: "group", capacity: 4, bookedCount: 2 },
  { id: "l6", time: "3:30 PM", available: false, client: "", horse: "", instructor: "Taylor", type: "Group jumping clinic", format: "group", capacity: 3, bookedCount: 3 },
];
