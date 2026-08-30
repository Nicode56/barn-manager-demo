export type ShapeType = "rect" | "circle" | "stadium" | "polygon" | "aviary";

export type LocationCategory =
  | "Barn"
  | "Pasture"
  | "Arena"
  | "Round Pen"
  | "Exotic Enclosure"
  | "Storage"
  | "Parking"
  | "Road"
  | "Other"
  | "Aviary";

export interface Point {
  x: number;
  y: number;
}

export type AnnotationType = "arrow" | "label";

export interface MapAnnotation {
  id: string;              // UUID or string
  type: AnnotationType;
  points: Point[];
  text?: string;
  thickness?: number;
  fontSize?: number;
}

export interface FarmShape {
  id: string;              // UUID or string
  farmId: string;          // UUID linking shape to farm

  type: ShapeType;
  name: string;
  category: LocationCategory | null;

  // Position (top-left of bounding box)
  x: number;
  y: number;

  // Rectangles / Stadiums
  width?: number;
  height?: number;

  // Circles
  r?: number;

  // Aviary
  sideWallHeight?: number;

  // Freeform polygon vertices (absolute canvas coordinates)
  points?: Point[];

  // Restore shape type when snapping back
  baseType?: ShapeType;

  // Assigned animals (numeric IDs)
  animalId: number[];

  // Optional capacity
  capacity?: number;

  // Rotation
  rotation: number;

  // Additional metadata
  notes: string[];
  maintenanceTaskIds: string[];
  photoIds: string[];

  isSelected?: boolean;
}





