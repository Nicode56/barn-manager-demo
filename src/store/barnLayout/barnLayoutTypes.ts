export type StallType = "standard" | "foaling" | "medical" | "quarantine" | "tackroom" | "storage" | "custom";

export interface StallShape {
  id: string;
  farmId: string;
  barnId: string;

  name: string;

  // Layout / geometry
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;

  // Semantics
  stallType: StallType;

  // Assignment
  assignedAnimalId: number | null;
  assignedAnimalName?: string;

  // Manager controls
  capacity: number;
  notes?: string;
}