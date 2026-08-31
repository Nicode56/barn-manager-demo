import React, { useState } from "react";
import styled from "@emotion/styled";
import { FarmShape, LocationCategory, Point } from "../../store/farmLayout/farmLayoutTypes";
import { generateAviaryTentPolygon } from "../../styles/mapGeometry";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useBarnDrillDown } from "./useBarnDrillDown";
import { useDemoAuth } from "../../contexts/DemoAuthContext";
import {
  createResizeMouseDownHandler,
  createRotateMouseDownHandler,
  MIN_SHAPE_SIZE,
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

  // Any shape that isn't rendered as freeform polygon points (those are
  // handled entirely by LocationPolygonEditor) shares this exact resize
  // math: rect, stadium, and a points-less "polygon" shape (e.g. a fresh
  // Exotic Enclosure) all resize identically, corrected for rotation.
  const boxResizeMouseDown = createResizeMouseDownHandler({
    shapeId: shape.id,
    x: shape.x,
    y: shape.y,
    width,
    height,
    rotation: shape.rotation,
    scale,
    onResize,
  });

  // A circle has no meaningful "width handle" vs "height handle" - it's
  // defined purely by its radius, and stays round regardless of rotation.
  // So every handle does the same thing: the new radius tracks the
  // handle's live distance from the shape's own center, in canvas units.
  // This sidesteps the rotation-correction math entirely (a circle looks
  // identical at any rotation), unlike the box resize above.
  const handleCircleResizeMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
    if (!onResize) return;

    const canvasEl = document.querySelector("[data-canvas-root]") as HTMLElement | null;
    const canvasRect = canvasEl?.getBoundingClientRect();
    const offsetX = canvasRect?.left ?? 0;
    const offsetY = canvasRect?.top ?? 0;
    const centerX = shape.x + width / 2;
    const centerY = shape.y + height / 2;

    const onMoveHandler = (ev: MouseEvent) => {
      const mouseX = (ev.clientX - offsetX) / scale;
      const mouseY = (ev.clientY - offsetY) / scale;
      const newR = Math.max(MIN_SHAPE_SIZE / 2, Math.hypot(mouseX - centerX, mouseY - centerY));

      onResize(shape.id, {
        r: newR,
        width: newR * 2,
        height: newR * 2,
        x: centerX - newR,
        y: centerY - newR,
      });
    };

    const onUpHandler = () => {
      window.removeEventListener("mousemove", onMoveHandler);
      window.removeEventListener("mouseup", onUpHandler);
    };

    window.addEventListener("mousemove", onMoveHandler);
    window.addEventListener("mouseup", onUpHandler);
  };

  const handleResizeMouseDown =
    shape.type === "circle" ? () => handleCircleResizeMouseDown : boxResizeMouseDown;

  const showResizeHandles =
    editMode &&
    selected &&
    !shape.points &&
    (shape.type === "rect" ||
      shape.type === "stadium" ||
      shape.type === "polygon" ||
      shape.type === "circle") &&
    !!onResize;

  const showRotateHandle = editMode && selected && !!rotationToolsEnabled;

  const handleRotateMouseDown = createRotateMouseDownHandler({
    shapeId: shape.id,
    onRotate,
  });

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

      {/* ⭐ RECTANGLE (also the fallback box for a "polygon"-typed shape,
          e.g. an Exotic Enclosure, before it has real freeform points) */}
      {(shape.type === "rect" || shape.type === "polygon") && !shape.points && (
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
          {/* rx rounds the corners INTO the rect's own box rather than
              extending past it, so the rect must span the full width/height
              for the pill to fill its bounding box - insetting x/width by
              height/2 (as this used to) left a gap on both ends and could
              go negative once height caught up to width during a resize. */}
          <rect
            x={0}
            y={0}
            width={width}
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

      {/* ⭐ RESIZE HANDLES (rect, stadium, and points-less polygon shapes,
          while selected + editing - shared with LocationPolygonEditor) */}
      {showResizeHandles && (
        <ResizeHandlesOverlay onHandleMouseDown={handleResizeMouseDown} rotation={shape.rotation} />
      )}

      {/* ⭐ ROTATE HANDLE (only while Rotation Tools is enabled) */}
      {showRotateHandle && <ShapeRotateControl onMouseDown={handleRotateMouseDown} />}
    </ShapeBox>
  );
};

