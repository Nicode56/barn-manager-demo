import React from "react";
import styled from "@emotion/styled";
import { FarmShape } from "../../store/farmLayout/farmLayoutTypes";

export const MIN_SHAPE_SIZE = 20;

export type ResizeHandleId = "n" | "s" | "e" | "w" | "nw" | "ne" | "sw" | "se";

export const RESIZE_HANDLES: { id: ResizeHandleId; left: string; top: string }[] = [
  { id: "nw", left: "0%", top: "0%" },
  { id: "n", left: "50%", top: "0%" },
  { id: "ne", left: "100%", top: "0%" },
  { id: "e", left: "100%", top: "50%" },
  { id: "se", left: "100%", top: "100%" },
  { id: "s", left: "50%", top: "100%" },
  { id: "sw", left: "0%", top: "100%" },
  { id: "w", left: "0%", top: "50%" },
];

// Each handle's compass bearing in the shape's own unrotated local frame
// (clockwise from north, matching CSS `rotate(deg)`). A handle's cursor
// icon needs to reflect where it actually sits ON SCREEN, not where it
// started out - once the shape is rotated, a handle drawn at the local
// "north" position can end up sitting on the shape's visual side, and an
// unrotated "ns-resize" cursor there would point the wrong way and make
// dragging it feel backwards. Rotation is always snapped to 45deg
// increments (see createRotateMouseDownHandler), so bearing + rotation is
// always an exact multiple of 45 - no rounding needed.
const HANDLE_BEARINGS: Record<ResizeHandleId, number> = {
  n: 0,
  ne: 45,
  e: 90,
  se: 135,
  s: 180,
  sw: 225,
  w: 270,
  nw: 315,
};

function cursorForHandle(id: ResizeHandleId, rotationDeg: number): string {
  const bearing = (((HANDLE_BEARINGS[id] + rotationDeg) % 180) + 180) % 180;
  if (bearing === 45) return "nesw-resize";
  if (bearing === 90) return "ew-resize";
  if (bearing === 135) return "nwse-resize";
  return "ns-resize";
}

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

// The handles visually rotate with the shape (they're children of the
// rotated box), but a shape's own width/height/x/y are always stored in its
// unrotated local frame. So a screen-space drag delta has to be rotated by
// -rotation into that local frame first - otherwise "east" stops meaning
// "east" once the shape is turned. Shared by every shape type (rect,
// stadium, freeform polygon) so they all resize identically.
export function computeResizedBox(
  handle: ResizeHandleId,
  initial: Box,
  cos: number,
  sin: number,
  rawDx: number,
  rawDy: number,
  minSize: number = MIN_SHAPE_SIZE
): Box {
  const dx = rawDx * cos + rawDy * sin;
  const dy = -rawDx * sin + rawDy * cos;

  let nextX = initial.x;
  let nextY = initial.y;
  let nextWidth = initial.width;
  let nextHeight = initial.height;

  if (handle.includes("e")) {
    nextWidth = Math.max(minSize, initial.width + dx);
  }
  if (handle.includes("w")) {
    nextWidth = Math.max(minSize, initial.width - dx);
    nextX = initial.x + (initial.width - nextWidth);
  }
  if (handle.includes("s")) {
    nextHeight = Math.max(minSize, initial.height + dy);
  }
  if (handle.includes("n")) {
    nextHeight = Math.max(minSize, initial.height - dy);
    nextY = initial.y + (initial.height - nextHeight);
  }

  return { x: nextX, y: nextY, width: nextWidth, height: nextHeight };
}

// Drives the full resize-drag lifecycle (mousedown -> window mousemove/up)
// for any shape type. `computeExtraChanges` lets a caller layer on
// type-specific side effects (e.g. rescaling polygon vertices) on top of the
// shared box math without duplicating the drag plumbing.
export function createResizeMouseDownHandler(options: {
  shapeId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scale: number;
  onResize?: (id: string, changes: Partial<FarmShape>) => void;
  computeExtraChanges?: (box: Box) => Partial<FarmShape>;
}) {
  const { shapeId, x, y, width, height, rotation, scale, onResize, computeExtraChanges } = options;

  return (handle: ResizeHandleId): React.MouseEventHandler<HTMLDivElement> =>
    (e) => {
      e.stopPropagation();
      if (!onResize) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const initial: Box = { x, y, width, height };

      const angleRad = (rotation * Math.PI) / 180;
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);

      const onMoveHandler = (ev: MouseEvent) => {
        const rawDx = (ev.clientX - startX) / scale;
        const rawDy = (ev.clientY - startY) / scale;

        const box = computeResizedBox(handle, initial, cos, sin, rawDx, rawDy);
        const extra = computeExtraChanges ? computeExtraChanges(box) : {};

        onResize(shapeId, { ...box, ...extra });
      };

      const onUpHandler = () => {
        window.removeEventListener("mousemove", onMoveHandler);
        window.removeEventListener("mouseup", onUpHandler);
      };

      window.addEventListener("mousemove", onMoveHandler);
      window.addEventListener("mouseup", onUpHandler);
    };
}

// Shared rotation-drag lifecycle - identical for every shape type, so a
// rect, a stadium and a freeform polygon all snap to the same 45deg steps
// around the same center-of-shape pivot.
export function createRotateMouseDownHandler(options: {
  shapeId: string;
  onRotate: (id: string, rotation: number) => void;
}): React.MouseEventHandler<HTMLDivElement> {
  const { shapeId, onRotate } = options;

  return (e) => {
    e.stopPropagation();

    const shapeEl = (e.currentTarget as HTMLElement).closest(
      "[data-shape-root]"
    ) as HTMLElement | null;
    if (!shapeEl) return;

    const rect = shapeEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Angle math is scale-invariant, so no /scale correction is needed here
    // (unlike move/resize, which operate on screen-pixel distances).
    const angleFrom = (clientX: number, clientY: number) => {
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      return (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    };

    const onMoveHandler = (ev: MouseEvent) => {
      const angle = angleFrom(ev.clientX, ev.clientY);
      onRotate(shapeId, Math.round(angle / 45) * 45);
    };

    const onUpHandler = () => {
      window.removeEventListener("mousemove", onMoveHandler);
      window.removeEventListener("mouseup", onUpHandler);
    };

    window.addEventListener("mousemove", onMoveHandler);
    window.addEventListener("mouseup", onUpHandler);
  };
}

export const ResizeHandle = styled.div<{ cursor: string }>`
  position: absolute;
  width: 9px;
  height: 9px;
  transform: translate(-50%, -50%);
  background: #ffffff;
  border: 1px solid #374151;
  border-radius: 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
  cursor: ${(p) => p.cursor};
  z-index: 6;
`;

export const ResizeHandlesOverlay: React.FC<{
  onHandleMouseDown: (handle: ResizeHandleId) => React.MouseEventHandler<HTMLDivElement>;
  rotation?: number;
}> = ({ onHandleMouseDown, rotation = 0 }) => (
  <>
    {RESIZE_HANDLES.map(({ id, left, top }) => (
      <ResizeHandle
        key={id}
        cursor={cursorForHandle(id, rotation)}
        style={{ left, top }}
        onMouseDown={onHandleMouseDown(id)}
      />
    ))}
  </>
);

// Sized to match the 20px marker DeleteButton (see MapAnnotationLayer.tsx)
// so rotate/delete handles read as the same "size class" of control.
const RotateHandleButton = styled.div`
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

export const ShapeRotateControl: React.FC<{
  onMouseDown: React.MouseEventHandler<HTMLDivElement>;
}> = ({ onMouseDown }) => (
  <RotateHandleButton onMouseDown={onMouseDown} title="Drag to rotate">
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
  </RotateHandleButton>
);
