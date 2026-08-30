import React, { useState } from "react";
import styled from "@emotion/styled";
import { FarmShape, LocationCategory, Point } from "../../store/farmLayout/farmLayoutTypes";
import { generateAviaryTentPolygon } from "../../styles/mapGeometry";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useBarnDrillDown } from "./useBarnDrillDown";
import { useDemoAuth } from "../../contexts/DemoAuthContext";

interface Props {
  shape: FarmShape;
  editMode: boolean;
  selected: boolean;
  snapToGrid?: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onRotate: (id: string, rotation: number) => void;
  onResize?: (id: string, changes: Partial<FarmShape>) => void;
  rotationToolsEnabled?: boolean;
  scale: number;
}

const categoryColorMap: Record<string, { base: string; border: string }> = {
  Barn: { base: "#fef3c7", border: "#f59e0b" },
  Pasture: { base: "#dcfce7", border: "#22c55e" },
  Arena: { base: "#dbeafe", border: "#3b82f6" },
  "Round Pen": { base: "#ccfbf1", border: "#14b8a6" },
  "Exotic Enclosure": { base: "#f3e8ff", border: "#a855f7" },
  Storage: { base: "#e5e5e5", border: "#737373" },
  Parking: { base: "#d4d4d4", border: "#525252" },
  Road: { base: "#9ca3af", border: "#6b7280" },
  Other: { base: "#f5f5f5", border: "#a3a3a3" },
  Aviary: { base: "#fcb7fc", border: "#d830d8" },
};

const MIN_SHAPE_SIZE = 20;

type ResizeHandleId = "n" | "s" | "e" | "w" | "nw" | "ne" | "sw" | "se";

const RESIZE_HANDLES: { id: ResizeHandleId; left: string; top: string; cursor: string }[] = [
  { id: "nw", left: "0%", top: "0%", cursor: "nwse-resize" },
  { id: "n", left: "50%", top: "0%", cursor: "ns-resize" },
  { id: "ne", left: "100%", top: "0%", cursor: "nesw-resize" },
  { id: "e", left: "100%", top: "50%", cursor: "ew-resize" },
  { id: "se", left: "100%", top: "100%", cursor: "nwse-resize" },
  { id: "s", left: "50%", top: "100%", cursor: "ns-resize" },
  { id: "sw", left: "0%", top: "100%", cursor: "nesw-resize" },
  { id: "w", left: "0%", top: "50%", cursor: "ew-resize" },
];

const OCCUPANCY_FULL = 1;
const OCCUPANCY_CLOSE = 0.5;

type OccupancyLevel = "room" | "close" | "full" | null;

const occupancyTintColor: Record<Exclude<OccupancyLevel, null>, string> = {
  room: "rgba(0, 128, 0, 0.18)",
  close: "rgba(217, 119, 6, 0.22)",
  full: "rgba(255, 0, 0, 0.22)",
};

const getOccupancyLevel = (
  animalCount: number,
  capacity: number | undefined,
  category: string | null
): OccupancyLevel => {
  if (
    category === "Aviary" ||
    category === "Storage" ||
    category === "Parking" ||
    category === "Road" ||
    !category
  ) {
    return null;
  }
  const effectiveCapacity = capacity ?? 1;
  if (effectiveCapacity <= 0) return null;

  const fraction = animalCount / effectiveCapacity;
  if (fraction >= OCCUPANCY_FULL) return "full";
  if (fraction >= OCCUPANCY_CLOSE) return "close";
  return "room";
};

const ShapeBox = styled.div`
  position: absolute;
  overflow: visible;
  cursor: pointer;
`;

const NameTagWrap = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  pointer-events: none;
  z-index: 5;
  padding: 8px;
  text-align: center;
`;

const NameTag = styled.div<{ variant: "selected" | "hovered" | "default"; fontSize: number }>`
  border-radius: 9999px;
  border: 1px solid
    ${(p) =>
      p.variant === "selected" ? "#b45309" : p.variant === "hovered" ? "#94a3b8" : "#cbd5e1"};
  background: ${(p) =>
    p.variant === "selected"
      ? "#fffbeb"
      : p.variant === "hovered"
      ? "rgba(255,255,255,0.95)"
      : "rgba(255,255,255,0.85)"};
  color: ${(p) =>
    p.variant === "selected" ? "#92400e" : p.variant === "hovered" ? "#334155" : "#475569"};
  padding: ${(p) => p.fontSize * 0.4}px ${(p) => p.fontSize * 0.7}px;
  font-size: ${(p) => p.fontSize}px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  max-width: 90%;
  width: min(100%, max-content);
  white-space: normal;
  word-break: break-word;
  text-align: center;
`;

const CapacityTag = styled.div`
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.85);
  color: #262626;
  padding: 1px 6px;
  font-size: 9px;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
`;

const ResizeHandle = styled.div<{ cursor: string }>`
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

const OccupantNames = styled.div`
  font-size: 9px;
  font-weight: 500;
  color: #1f2937;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 6px;
  padding: 1px 6px;
  max-width: 100%;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const LocationShape: React.FC<Props> = ({
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
  const [hovered, setHovered] = useState(false);
  const animals = useSelector((state: RootState) => state.farm.animals);
  const { user } = useDemoAuth();
  const isManager = user?.role === "manager";

  const categoryColors =
    (shape.category && categoryColorMap[shape.category]) || categoryColorMap["Other"];

  const borderColor = selected ? "#b45309" : hovered ? categoryColors.border : "#d4d4d4";
  const nameTagVariant = selected ? "selected" : hovered ? "hovered" : "default";

  const width = shape.width ?? 160;
  const height = shape.height ?? 100;

  // Scale the name label with the shape's size - a tiny resized stall-style
  // pasture shouldn't carry the same label size as a full-size barn.
  const nameFontSize = Math.max(8, Math.min(16, Math.min(width, height) * 0.11));

  const animalCount = shape.animalId?.length ?? 0;
  const occupancyLevel = getOccupancyLevel(animalCount, shape.capacity, shape.category);

  const occupantNames = shape.animalId
    .map((id) => animals.find((a) => a.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  const MAX_INLINE_NAMES = 3;
  const displayedNames = occupantNames.slice(0, MAX_INLINE_NAMES).join(", ");
  const overflowCount = occupantNames.length - MAX_INLINE_NAMES;
  const occupantSummary =
    overflowCount > 0 ? `${displayedNames} +${overflowCount} more` : displayedNames;

  const showOccupantKey =
    shape.category !== "Aviary" && (!editMode || hovered);

  const style: React.CSSProperties = {
    left: shape.x,
    top: shape.y,
    width,
    height,
    transform: `rotate(${shape.rotation}deg)`,
    transformOrigin: "center center",
  };

  const { openBarn } = useBarnDrillDown();

  const handleClick = () => {
    onSelect(shape.id);

    if (!editMode && shape.category === "Barn") {
      openBarn(shape);
    }
  };

  const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!editMode) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = shape.x;
    const initialY = shape.y;

    const onMoveHandler = (ev: MouseEvent) => {
      const dx = (ev.clientX - startX) / scale;
      const dy = (ev.clientY - startY) / scale;

      const newX = snapToGrid ? Math.round((initialX + dx) / 10) * 10 : initialX + dx;
      const newY = snapToGrid ? Math.round((initialY + dy) / 10) * 10 : initialY + dy;

      onMove(shape.id, newX, newY);
    };

    const onUpHandler = () => {
      window.removeEventListener("mousemove", onMoveHandler);
      window.removeEventListener("mouseup", onUpHandler);
    };

    window.addEventListener("mousemove", onMoveHandler);
    window.addEventListener("mouseup", onUpHandler);
  };

  const handleResizeMouseDown =
    (handle: ResizeHandleId): React.MouseEventHandler<HTMLDivElement> =>
    (e) => {
      e.stopPropagation();
      if (!onResize) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const initial = { x: shape.x, y: shape.y, width, height };

      // The handles visually rotate with the shape (they're children of the
      // rotated box), but the shape's own width/height/x/y are always
      // stored in its unrotated local frame. So a screen-space drag delta
      // has to be rotated by -rotation into that local frame first -
      // otherwise "east" stops meaning "east" once the shape is turned.
      const angleRad = (shape.rotation * Math.PI) / 180;
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);

      const onMoveHandler = (ev: MouseEvent) => {
        const rawDx = (ev.clientX - startX) / scale;
        const rawDy = (ev.clientY - startY) / scale;

        const dx = rawDx * cos + rawDy * sin;
        const dy = -rawDx * sin + rawDy * cos;

        let nextX = initial.x;
        let nextY = initial.y;
        let nextWidth = initial.width;
        let nextHeight = initial.height;

        if (handle.includes("e")) {
          nextWidth = Math.max(MIN_SHAPE_SIZE, initial.width + dx);
        }
        if (handle.includes("w")) {
          nextWidth = Math.max(MIN_SHAPE_SIZE, initial.width - dx);
          nextX = initial.x + (initial.width - nextWidth);
        }
        if (handle.includes("s")) {
          nextHeight = Math.max(MIN_SHAPE_SIZE, initial.height + dy);
        }
        if (handle.includes("n")) {
          nextHeight = Math.max(MIN_SHAPE_SIZE, initial.height - dy);
          nextY = initial.y + (initial.height - nextHeight);
        }

        onResize(shape.id, { x: nextX, y: nextY, width: nextWidth, height: nextHeight });
      };

      const onUpHandler = () => {
        window.removeEventListener("mousemove", onMoveHandler);
        window.removeEventListener("mouseup", onUpHandler);
      };

      window.addEventListener("mousemove", onMoveHandler);
      window.addEventListener("mouseup", onUpHandler);
    };

  const showResizeHandles =
    editMode && selected && shape.type === "rect" && !shape.points && !!onResize;

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

    // Angle math is scale-invariant, so no /scale correction is needed here
    // (unlike move/resize, which operate on screen-pixel distances).
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
    <ShapeBox
      data-shape-root
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      {/* ⭐ AVIARY (octagon) */}
      {shape.category === "Aviary" && !shape.points && (
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <defs>
            <radialGradient id="aviaryShadeStatic" cx="50%" cy="50%" r="75%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="100%" stopColor="#d1d5db" stopOpacity="0.55" />
            </radialGradient>
          </defs>

          <polygon
            points={generateAviaryTentPolygon(width, height)
              .map((p: { x: number; y: number }) => `${p.x},${p.y}`)
              .join(" ")}
            fill="url(#aviaryShadeStatic)"
            stroke={borderColor}
            strokeWidth={1}
          />
        </svg>
      )}

      {/* ⭐ RECTANGLE */}
      {shape.type === "rect" && !shape.points && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: categoryColors.base,
            border: `1px solid ${borderColor}`,
            boxShadow:
              occupancyLevel && shape.category !== "Aviary"
                ? `inset 0 0 0 1000px ${occupancyTintColor[occupancyLevel]}`
                : undefined,
          }}
        />
      )}

      {/* ⭐ CIRCLE */}
      {shape.type === "circle" && !shape.points && (
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{ position: "absolute", inset: 0 }}
        >
          <circle
            cx={width / 2}
            cy={height / 2}
            r={shape.r ?? Math.min(width, height) / 2}
            fill={categoryColors.base}
            stroke={borderColor}
            strokeWidth={1}
          />
        </svg>
      )}

      {/* ⭐ STADIUM */}
      {shape.type === "stadium" && !shape.points && (
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{ position: "absolute", inset: 0 }}
        >
          <rect
            x={height / 2}
            y={0}
            width={width - height}
            height={height}
            fill={categoryColors.base}
            stroke={borderColor}
            strokeWidth={1}
            rx={height / 2}
          />
        </svg>
      )}

      {/* ⭐ POLYGON */}
      {shape.points && (
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{ position: "absolute", inset: 0 }}
        >
          <polygon
            points={shape.points
              .map((p: Point) => `${p.x - shape.x},${p.y - shape.y}`)
              .join(" ")}
            fill={categoryColors.base}
            stroke={borderColor}
            strokeWidth={1}
          />
        </svg>
      )}

      {/* ⭐ LABELS - counter-rotated so text always stays upright/centered,
          regardless of the shape's own rotation. */}
      <NameTagWrap style={{ transform: `rotate(${-shape.rotation}deg)`, transformOrigin: "center center" }}>
        <NameTag variant={nameTagVariant} fontSize={nameFontSize}>
          {shape.name}
        </NameTag>

        {/* Capacity + occupant key: manager view only, not for aviary */}
        {isManager && shape.category !== "Aviary" && (
          <CapacityTag>
            {animalCount}/{shape.capacity ?? 0}
          </CapacityTag>
        )}

        {isManager && shape.category !== "Aviary" && showOccupantKey && occupantSummary && (
          <OccupantNames>{occupantSummary}</OccupantNames>
        )}
      </NameTagWrap>

      {/* ⭐ RESIZE HANDLES (plain rectangles only, while selected + editing) */}
      {showResizeHandles &&
        RESIZE_HANDLES.map(({ id, left, top, cursor }) => (
          <ResizeHandle
            key={id}
            cursor={cursor}
            style={{ left, top }}
            onMouseDown={handleResizeMouseDown(id)}
          />
        ))}

      {/* ⭐ ROTATE HANDLE (only while Rotation Tools is enabled) */}
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
    </ShapeBox>
  );
};

