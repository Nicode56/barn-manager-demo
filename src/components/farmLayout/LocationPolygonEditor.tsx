import React from "react";
import styled from "@emotion/styled";
import { FarmShape, Point } from "../../store/farmLayout/farmLayoutTypes";
import {
  computeResizedBox,
  createRotateMouseDownHandler,
  ResizeHandleId,
  ResizeHandlesOverlay,
  ShapeRotateControl,
} from "./shapeControls";

interface Props {
  shape: FarmShape;
  editMode: boolean;
  selected: boolean;
  snapToGrid?: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onRotate: (id: string, rotation: number) => void;
  onResize: (id: string, changes: Partial<FarmShape>) => void;
  rotationToolsEnabled?: boolean;
  scale: number;
}

const PolygonBox = styled.div`
  position: absolute;
  overflow: visible;
  cursor: pointer;
`;

const VertexHandle = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid #374151;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
  cursor: pointer;
`;

const recomputeBounds = (points: { x: number; y: number }[]) => {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

export const LocationPolygonEditor: React.FC<Props> = ({
  shape,
  editMode,
  selected,
  snapToGrid,
  onSelect,
  onMove,
  onRotate,
  onResize,
  rotationToolsEnabled,
  scale,
}) => {
  const width = shape.width ?? 160;
  const height = shape.height ?? 100;

  const style: React.CSSProperties = {
    left: shape.x,
    top: shape.y,
    width,
    height,
    transform: `rotate(${shape.rotation}deg)`,
    transformOrigin: "center center",
  };

  const localPoints =
    shape.points?.map((p) => ({
      x: p.x - shape.x,
      y: p.y - shape.y,
    })) ?? [];

  const polygonAttr = localPoints.map((p) => `${p.x},${p.y}`).join(" ");

  const handleRootMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!editMode || !shape.points) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = shape.x;
    const initialY = shape.y;
    const initialPoints = shape.points.map((p) => ({ ...p }));

    const onMoveHandler = (ev: MouseEvent) => {
      const dx = (ev.clientX - startX) / scale;
      const dy = (ev.clientY - startY) / scale;

      const newX = snapToGrid ? Math.round((initialX + dx) / 10) * 10 : initialX + dx;
      const newY = snapToGrid ? Math.round((initialY + dy) / 10) * 10 : initialY + dy;

      const offsetX = newX - initialX;
      const offsetY = newY - initialY;

      const updatedPoints = initialPoints.map((pt) => ({
        x: pt.x + offsetX,
        y: pt.y + offsetY,
      }));

      const bounds = recomputeBounds(updatedPoints);
      onResize(shape.id, {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        points: updatedPoints,
      });
    };

    const onUpHandler = () => {
      window.removeEventListener("mousemove", onMoveHandler);
      window.removeEventListener("mouseup", onUpHandler);
    };

    window.addEventListener("mousemove", onMoveHandler);
    window.addEventListener("mouseup", onUpHandler);
  };

  const handleVertexMouseDown =
    (index: number) => (e: React.MouseEvent<HTMLDivElement>) => {
      if (!editMode || !shape.points) return;
      e.stopPropagation();
      e.preventDefault();

      const startX = e.clientX;
      const startY = e.clientY;
      const startPoints = shape.points.map((p) => ({ ...p }));

      // Vertex positions are stored in the shape's unrotated local frame,
      // but the handles visually rotate with the shape - so a screen-space
      // drag delta has to be rotated by -rotation before it's added to the
      // point's local coordinates, same as the rect resize handles.
      const angleRad = (shape.rotation * Math.PI) / 180;
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);

      const onMoveHandler = (ev: MouseEvent) => {
        const rawDx = (ev.clientX - startX) / scale;
        const rawDy = (ev.clientY - startY) / scale;

        const dx = rawDx * cos + rawDy * sin;
        const dy = -rawDx * sin + rawDy * cos;

        const newAbsX = startPoints[index].x + dx;
        const newAbsY = startPoints[index].y + dy;

        const newPoints = startPoints.map((pt, i) =>
          i === index ? { x: newAbsX, y: newAbsY } : pt
        );

        const bounds = recomputeBounds(newPoints);
        onResize(shape.id, {
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
          points: newPoints,
        });
      };

      const onUpHandler = () => {
        window.removeEventListener("mousemove", onMoveHandler);
        window.removeEventListener("mouseup", onUpHandler);
      };

      window.addEventListener("mousemove", onMoveHandler);
      window.addEventListener("mouseup", onUpHandler);
    };

  const handlePolygonClick: React.MouseEventHandler<SVGElement> = (e) => {
    if (!editMode || !selected || !shape.points) return;

    const svg = e.currentTarget.getBoundingClientRect();
    const localX = (e.clientX - svg.left) / scale;
    const localY = (e.clientY - svg.top) / scale;

    const absX = localX + shape.x;
    const absY = localY + shape.y;

    const pts = shape.points;
    let insertIndex = -1;
    let bestDist = Infinity;
    const threshold = 8;

    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];

      const vx = b.x - a.x;
      const vy = b.y - a.y;
      const wx = absX - a.x;
      const wy = absY - a.y;

      const lenSq = vx * vx + vy * vy;
      if (lenSq === 0) continue;

      const t = Math.max(0, Math.min(1, (vx * wx + vy * wy) / lenSq));
      const projX = a.x + t * vx;
      const projY = a.y + t * vy;

      const dist = Math.hypot(absX - projX, absY - projY);
      if (dist < threshold && dist < bestDist) {
        bestDist = dist;
        insertIndex = i + 1;
      }
    }

    if (insertIndex === -1) return;

    const newPoints = [...pts];
    newPoints.splice(insertIndex, 0, { x: absX, y: absY });

    const bounds = recomputeBounds(newPoints);
    onResize(shape.id, {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      points: newPoints,
    });
  };

  const showRotateHandle = editMode && selected && !!rotationToolsEnabled;

  const handleRotateMouseDown = createRotateMouseDownHandler({
    shapeId: shape.id,
    onRotate,
  });

  // Bounding-box resize for freeform shapes (e.g. the Aviary octagon, or any
  // shape after "Freeform Edit"): every vertex keeps its fractional position
  // within the box, so dragging a corner/edge handle scales the whole
  // outline the same way rect/stadium resizing does, on top of - not
  // instead of - per-vertex dragging.
  const showResizeHandles = editMode && selected && !!shape.points && !!onResize;

  const handleBoxResizeMouseDown =
    (handle: ResizeHandleId): React.MouseEventHandler<HTMLDivElement> =>
    (e) => {
      e.stopPropagation();
      if (!onResize || !shape.points) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const initialBox = { x: shape.x, y: shape.y, width, height };
      const initialPoints = shape.points.map((p) => ({ ...p }));

      const angleRad = (shape.rotation * Math.PI) / 180;
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);

      const onMoveHandler = (ev: MouseEvent) => {
        const rawDx = (ev.clientX - startX) / scale;
        const rawDy = (ev.clientY - startY) / scale;

        const box = computeResizedBox(handle, initialBox, cos, sin, rawDx, rawDy);

        const newPoints: Point[] = initialPoints.map((p) => {
          const fracX = initialBox.width === 0 ? 0 : (p.x - initialBox.x) / initialBox.width;
          const fracY = initialBox.height === 0 ? 0 : (p.y - initialBox.y) / initialBox.height;
          return {
            x: box.x + fracX * box.width,
            y: box.y + fracY * box.height,
          };
        });

        onResize(shape.id, { ...box, points: newPoints });
      };

      const onUpHandler = () => {
        window.removeEventListener("mousemove", onMoveHandler);
        window.removeEventListener("mouseup", onUpHandler);
      };

      window.addEventListener("mousemove", onMoveHandler);
      window.addEventListener("mouseup", onUpHandler);
    };

  return (
    <PolygonBox
      data-shape-root
      style={style}
      onMouseDown={handleRootMouseDown}
      onClick={() => onSelect(shape.id)}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: "absolute", inset: 0 }}
        onClick={handlePolygonClick}
      >
        <defs>
          <radialGradient id="aviaryShade" cx="50%" cy="50%" r="75%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#d1d5db" stopOpacity="0.55" />
          </radialGradient>
        </defs>

        {/* soft shadow */}
        <polygon
          points={polygonAttr}
          fill="rgba(0,0,0,0.22)"
          stroke="none"
          transform="translate(0, 3)"
          style={{ filter: "blur(3px)" }}
        />

        {/* main octagon */}
        <polygon
          points={polygonAttr}
          fill="url(#aviaryShade)"
          stroke="#374151"
          strokeWidth={1}
        />
      </svg>

      {editMode &&
        selected &&
        localPoints.map((p, idx) => (
          <VertexHandle
            key={idx}
            style={{ left: p.x - 4, top: p.y - 4 }}
            onMouseDown={handleVertexMouseDown(idx)}
          />
        ))}

      {/* Bounding-box resize handles - same shared control as
          rect/stadium shapes, layered on top of the freeform vertex
          handles above. */}
      {showResizeHandles && (
        <ResizeHandlesOverlay onHandleMouseDown={handleBoxResizeMouseDown} rotation={shape.rotation} />
      )}

      {showRotateHandle && <ShapeRotateControl onMouseDown={handleRotateMouseDown} />}
    </PolygonBox>
  );
};


