import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  FarmShape,
  ShapeType,
  LocationCategory,
  Point, 
  AnnotationType, 
  MapAnnotation,
} from "./farmLayoutTypes";

import {
  generateOutlinePoints,
  generateAviaryTentPolygon,
  snapPointsToShape,
} from "../../styles/mapGeometry";

interface FarmLayoutState {
  shapes: FarmShape[];
  editMode: boolean;
  rotationToolsEnabled: boolean;
  selectedShapeId: string | null;
  annotations: MapAnnotation[];
}

const initialState: FarmLayoutState = {
  shapes: [],
  editMode: false,
  rotationToolsEnabled: false,
  selectedShapeId: null,
  annotations: [],
};

const farmLayoutSlice = createSlice({
  name: "farmLayout",
  initialState,
  reducers: {
    setEditMode(state, action: PayloadAction<boolean>) {
      state.editMode = action.payload;
    },

    toggleRotationTools(state) {
      state.rotationToolsEnabled = !state.rotationToolsEnabled;
    },

    addShape(
      state,
      action: PayloadAction<{
        farmId: string;
        type: ShapeType;
        name: string;
        category: LocationCategory | null;
        x: number;
        y: number;
        width?: number;
        height?: number;
        r?: number;
      }>
    ) {
      const id = crypto.randomUUID();
      const { type, name, category, x, y, width, height, r } = action.payload;

      let assignedCategory = category;
      if (!assignedCategory) {
        switch (type) {
          case "aviary":
            assignedCategory = "Aviary";
            break;
          case "rect":
          case "stadium":
            assignedCategory = "Barn";
            break;
          case "circle":
            assignedCategory = "Pasture";
            break;
          default:
            assignedCategory = "Other";
        }
      }

      // ⭐ AVIARY → regular octagon polygon
      if (type === "aviary") {
        const w = width ?? 200;
        const h = height ?? 200;

        const local = generateAviaryTentPolygon(w, h);
        const points = local.map((p) => ({
          x: p.x + x,
          y: p.y + y,
        }));

        state.shapes.push({
          id,
          farmId: action.payload.farmId,
          type,
          baseType: "aviary",
          name,
          category: "Aviary",
          x,
          y,
          width: w,
          height: h,
          points,
          rotation: 0,

          // metadata
          animalId: [],
          notes: [],
          maintenanceTaskIds: [],
          photoIds: [],
        });

        state.selectedShapeId = id;
        return;
      }

      // ⭐ NON-AVIARY SHAPES
      state.shapes.push({
        id,
        farmId: action.payload.farmId,
        type,
        name,
        category: assignedCategory,
        x,
        y,
        width:
          width ??
          (type === "rect" || type === "stadium" ? 160 : undefined),
        height:
          height ??
          (type === "rect"
            ? 100
            : type === "stadium"
            ? 80
            : undefined),
        r: r ?? (type === "circle" ? 60 : undefined),
        rotation: 0,

        // metadata
        animalId: [],
        notes: [],
        maintenanceTaskIds: [],
        photoIds: [],
      });

      state.selectedShapeId = id;
    },

    updateShape(
      state,
      action: PayloadAction<{ id: string; changes: Partial<FarmShape> }>
    ) {
      const shape = state.shapes.find((s) => s.id === action.payload.id);
      if (shape) {
        Object.assign(shape, action.payload.changes);
      }
    },

    deleteShape(state, action: PayloadAction<string>) {
      state.shapes = state.shapes.filter((s) => s.id !== action.payload);
      if (state.selectedShapeId === action.payload) {
        state.selectedShapeId = null;
      }
    },

    selectShape(state, action: PayloadAction<string | null>) {
      state.selectedShapeId = action.payload;
      state.shapes.forEach((s) => {
        s.isSelected = s.id === action.payload;
      });
    },

    straightenShape(state, action: PayloadAction<string>) {
      const shape = state.shapes.find((s) => s.id === action.payload);
      if (shape) {
        shape.rotation = 0;
      }
    },

    // ⭐ CLEANUP SHAPE → restore preset geometry
    snapShapeToStandard(state, action: PayloadAction<string>) {
      const shape = state.shapes.find((s) => s.id === action.payload);
      if (!shape) return;

      // Only polygon shapes need cleanup
      if (!shape.points || !shape.baseType) return;

      // Compute bounding box
      const xs = shape.points.map((p) => p.x);
      const ys = shape.points.map((p) => p.y);

      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const maxX = Math.max(...xs);
      const maxY = Math.max(...ys);

      shape.x = minX;
      shape.y = minY;
      shape.width = maxX - minX;
      shape.height = maxY - minY;

      // ⭐ Restore octagon for aviary
      if (shape.baseType === "aviary") {
        const local = generateAviaryTentPolygon(shape.width!, shape.height!);
        shape.points = local.map((p) => ({
          x: p.x + shape.x,
          y: p.y + shape.y,
        }));
        shape.type = "polygon";
        return;
      }

      // ⭐ Non-aviary → revert to preset shape
      const snapped = snapPointsToShape(shape.points, shape.baseType);
      shape.x = snapped.x;
      shape.y = snapped.y;
      shape.width = snapped.width;
      shape.height = snapped.height;
      shape.r = snapped.r;

      shape.points = undefined;
      shape.baseType = undefined;
    },

    renameShape(state, action: PayloadAction<{ id: string; newName: string }>) {
      const shape = state.shapes.find((s) => s.id === action.payload.id);
      if (shape) {
        shape.name = action.payload.newName;
      }
    },

    // ⭐ ENTER FREEFORM EDIT → convert the shape's current geometry into
    // draggable polygon points (rect corners, circle/stadium outline, etc.)
    startPointEdit(state, action: PayloadAction<{ id: string }>) {
      const shape = state.shapes.find((s) => s.id === action.payload.id);
      if (!shape || shape.points) return;

      shape.baseType = shape.type;
      shape.points = generateOutlinePoints(shape);
    },

    setCategory(
      state,
      action: PayloadAction<{ id: string; category: LocationCategory }>
    ) {
      const shape = state.shapes.find((s) => s.id === action.payload.id);
      if (shape) {
        shape.category = action.payload.category;
      }
    },

    setCapacity(state, action: PayloadAction<{ id: string; capacity: number }>) {
      const shape = state.shapes.find((s) => s.id === action.payload.id);
      if (shape) {
        shape.capacity = action.payload.capacity;
      }
    },

    addAnimalToShape(
      state,
      action: PayloadAction<{ id: string; animalId: number }>
    ) {
      const shape = state.shapes.find((s) => s.id === action.payload.id);
      if (shape && !shape.animalId.includes(action.payload.animalId)) {
        shape.animalId.push(action.payload.animalId);
      }
    },

    removeAnimalFromShape(
      state,
      action: PayloadAction<{ id: string; animalId: number }>
    ) {
      const shape = state.shapes.find((s) => s.id === action.payload.id);
      if (shape) {
        shape.animalId = shape.animalId.filter((id) => id !== action.payload.animalId);
      }
    },

    addAnnotation(state, action: PayloadAction<{
      id: string;
      type: AnnotationType;
      points: Point[];
      text?: string;
      thickness?: number;
      fontSize?: number;
    }>
  ) {
    state.annotations.push({
      id: action.payload.id,
      type: action.payload.type,
      points: action.payload.points,
      text: action.payload.text ?? "",
      thickness: action.payload.thickness ?? 16,
      fontSize: action.payload.fontSize ?? 14,
    });
  },
  updateAnnotation(
    state,
    action: PayloadAction<{
      id: string;
      changes: Partial<MapAnnotation>;
    }>
  ) {
    const a = state.annotations.find((ann) => ann.id === action.payload.id);
    if (a) Object.assign(a, action.payload.changes);
  },
  updateAnnotationPoint(
    state,
    action: PayloadAction<{
      id: string;
      index: number;
      x: number;
      y: number;
    }>
  ) {
    const a = state.annotations.find((ann) => ann.id === action.payload.id);
    if (!a) return;
    a.points[action.payload.index] = {
      x: action.payload.x,
      y: action.payload.y,
    };
  },

  deleteAnnotation(state, action: PayloadAction<string>) {
    state.annotations = state.annotations.filter(
      (ann) => ann.id !== action.payload
    );
  }
    }
  }
  )


export const {
  setEditMode,
  toggleRotationTools,
  addShape,
  updateShape,
  deleteShape,
  selectShape,
  straightenShape,
  snapShapeToStandard, 
  renameShape,
  startPointEdit,
  setCategory, 
  setCapacity,
  addAnimalToShape,
  removeAnimalFromShape,
  addAnnotation,
  updateAnnotation,
  updateAnnotationPoint,
  deleteAnnotation,
} = farmLayoutSlice.actions;

export default farmLayoutSlice.reducer;

