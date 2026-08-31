import React from "react";
import styled from "@emotion/styled";
import { FarmShape } from "../../store/farmLayout/farmLayoutTypes";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { selectShape, updateShape } from "../../store/farmLayout/farmLayoutSlice";

import { LocationShape } from "./LocationShape";
import { LocationPolygonEditor } from "./LocationPolygonEditor";
import { MapAnnotationLayer } from "./MapAnnotationLayer";

interface Props {
  shapes: FarmShape[];
  effectiveEditMode: boolean;
  rotationToolsEnabled?: boolean;
  scale: number;
}

const CanvasArea = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

// Must match MapCanvas dimensions in FarmLayoutBuilder.
const CANVAS_WIDTH = 2200;
const CANVAS_HEIGHT = 1100;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const LocationCanvas: React.FC<Props> = ({
  shapes,
  effectiveEditMode,
  rotationToolsEnabled = false,
  scale,
}) => {
  const dispatch = useDispatch();

  const selectedShapeId = useSelector(
    (state: RootState) => state.farmLayout.selectedShapeId
  );

  const annotations = useSelector(
    (state: RootState) => state.farmLayout.annotations
  );

  const handleSelect = (id: string) => {
    dispatch(selectShape(id));
  };

  const handleMove = (id: string, x: number, y: number) => {
    const shape = shapes.find((s) => s.id === id);
    if (!shape) return;

    // Polygon shapes move freely
    if (shape.points) {
      const dx = x - shape.x;
      const dy = y - shape.y;

      const updatedPoints = shape.points.map((pt) => ({
        x: pt.x + dx,
        y: pt.y + dy,
      }));

      dispatch(
        updateShape({
          id,
          changes: {
            x,
            y,
            points: updatedPoints,
          },
        })
      );
      return;
    }

    // Non-polygon shapes clamp to canvas
    const width =
      shape.type === "circle"
        ? (shape.r ?? 60) * 2
        : shape.width ?? 160;

    const height =
      shape.type === "circle"
        ? (shape.r ?? 60) * 2
        : shape.height ?? 100;

    const clampedX = clamp(x, 0, CANVAS_WIDTH - width);
    const clampedY = clamp(y, 0, CANVAS_HEIGHT - height);

    dispatch(
      updateShape({
        id,
        changes: { x: clampedX, y: clampedY },
      })
    );
  };

  const handleRotate = (id: string, rotation: number) => {
    if (!rotationToolsEnabled) return;
    dispatch(updateShape({ id, changes: { rotation } }));
  };

  const handleResize = (id: string, changes: Partial<FarmShape>) => {
    dispatch(updateShape({ id, changes }));
  };

  return (
    <CanvasArea>
      {shapes.map((shape) =>
        shape.points ? (
          <LocationPolygonEditor
            key={shape.id}
            shape={shape}
            selected={shape.id === selectedShapeId}
            editMode={effectiveEditMode}
            snapToGrid={false}
            onSelect={handleSelect}
            onMove={handleMove}
            onRotate={handleRotate}
            onResize={handleResize}
            rotationToolsEnabled={rotationToolsEnabled}
            scale={scale}
          />
        ) : (
          <LocationShape
            key={shape.id}
            shape={shape}
            selected={shape.id === selectedShapeId}
            editMode={effectiveEditMode}
            onSelect={handleSelect}
            onMove={handleMove}
            onRotate={handleRotate}
            onResize={handleResize}
            rotationToolsEnabled={rotationToolsEnabled}
            scale={scale}
          />
        )
      )}

      <MapAnnotationLayer
        annotations={annotations}
        editMode={effectiveEditMode}
        scale={scale}
      />
    </CanvasArea>
  );
};



