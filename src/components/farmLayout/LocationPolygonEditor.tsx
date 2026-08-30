import React from "react";
import styled from "@emotion/styled";
import { FarmShape } from "../../store/farmLayout/farmLayoutTypes";

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

// Sized to match the 20px marker DeleteButton (see MapAnnotationLayer.tsx)
// so rotate/delete handles read as the same "size class" of control.
const RotateHandle = styled.div`
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: radial-gradient(circle at 32% 28%, #ffffff 0%, #cbd5e1 55%, #94a3b8 100%);
  border: 1px solid #64748b;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.7);
  color: #374151;
  cursor: grab;
  z-index: 7;

  &:active {
    cursor: grabbing;
  }
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

  const handleRotateMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();

    const shapeEl = (e.currentTarget as HTMLElement).closest(
      "[data-shape-root]"
    ) as HTMLElement | null;
    if (!shapeEl) return;

    const rect = shapeEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const angleFrom = (clientX: number, clientY: number) => {
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      return (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    };

    const onMoveHandler = (ev: MouseEvent) => {
      const angle = angleFrom(ev.clientX, ev.clientY);
      onRotate(shape.id, Math.round(angle / 45) * 45);
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

      {showRotateHandle && (
        <RotateHandle onMouseDown={handleRotateMouseDown} title="Drag to rotate">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 12a9 9 0 1 0 3.5-7.1"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="3 3 3.5 8.9 9.5 8.4"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </RotateHandle>
      )}
    </PolygonBox>
  );
};


