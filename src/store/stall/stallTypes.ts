export interface StallDetails {
  id: string;
  stallId: string;
  animalId: string | null;
  medicalNotes: string[];
  feedSchedule: string[];
  photoIds: string[];
  maintenanceTaskIds: string[];
  staffNotes: string[];
}