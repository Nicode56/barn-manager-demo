import React, { useState } from "react";
import styled from "@emotion/styled";
import { useDispatch } from "react-redux";
import { MapAnnotation, Point } from "../../store/farmLayout/farmLayoutTypes";
import { updateAnnotation, updateAnnotationPoint, deleteAnnotation } from "../../store/farmLayout/farmLayoutSlice";

interface Props {
  annotations: MapAnnotation[];
  editMode: boolean;
  scale: number;
}

const MIN_THICKNESS = 6;
const MAX_THICKNESS = 60;
const MIN_FONT_SIZE = 10;
const MAX_FONT_SIZE = 48;
const SVG_PADDING = 24; // headroom so wide arrow heads never clip

const AnnotationLayer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`;

const AnnotationItem = styled.div`
  position: absolute;
  pointer-events: auto;
`;

const LabelText = styled.div<{ fontSize: number }>`
  position: relative;
  display: inline-block;
  padding: 8px 18px;
  border-radius: 4px;
  background: linear-gradient(180deg, #9c6a3d 0%, #7a4d28 100%);
  border: 3px solid #4a2f18;
  color: #fdf3e0;
  font-size: ${(p) => p.fontSize}px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.35);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15);
  white-space: nowrap;
  cursor: text;

  /* Post nub - suggests the sign is staked into the ground */
  &::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: -9px;
    transform: translateX(-50%);
    width: 6px;
    height: 9px;
    background: #4a2f18;
  }
`;

const LabelInput = styled.input<{ fontSize: number }>`
  padding: 8px 18px;
  border-radius: 4px;
  background: #fdf3e0;
  border: 3px solid #2563eb;
  color: #2f2013;
  font-size: ${(p) => p.fontSize}px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  outline: none;
`;

const PointHandle = styled.div`
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #2563eb;
  border: 2px solid white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transform: translate(-50%, -50%);
  cursor: grab;
`;

const ThicknessHandle = styled.div`
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 3px;
  background: #dc2626;
  border: 2px solid white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transform: translate(-50%, -50%);
  cursor: ns-resize;
`;

const ResizeHandle = styled.div`
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: #b45309;
  border: 2px solid white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  bottom: -5px;
  right: -5px;
  cursor: nwse-resize;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: -10px;
  right: -10px;
  width: 20px;
  height: 20px;
  min-height: 0;
  padding: 0;
  border-radius: 50%;
  border: 2px solid white;
  background: #dc2626;
  color: white;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
  transition: background 0.15s ease, transform 0.15s ease;

  &:hover {
    background: #b91c1c;
    transform: scale(1.08);
  }
`;

const LabelWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const ArrowWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

/** Builds an SVG polygon path for a solid block-style arrow (rectangular
 * shaft + wide triangular head), in the arrow's own local coordinate space
 * (i.e. relative to the padded bounding box the caller sizes the SVG to). */
const buildBlockArrowPoints = (
  start: Point,
  end: Point,
  thickness: number
): string => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.max(Math.hypot(dx, dy), 1);
  const ux = dx / length;
  const uy = dy / length;
  // Perpendicular unit vector
  const px = -uy;
  const py = ux;

  const shaftHalf = thickness / 2;
  const headHalf = thickness * 1.1;
  const headLength = Math.min(headHalf * 1.6, length * 0.5);
  const headStartX = end.x - ux * headLength;
  const headStartY = end.y - uy * headLength;

  const pt = (x: number, y: number) => `${x},${y}`;

  const points = [
    pt(start.x + px * shaftHalf, start.y + py * shaftHalf),
    pt(headStartX + px * shaftHalf, headStartY + py * shaftHalf),
    pt(headStartX + px * headHalf, headStartY + py * headHalf),
    pt(end.x, end.y),
    pt(headStartX - px * headHalf, headStartY - py * headHalf),
    pt(headStartX - px * shaftHalf, headStartY - py * shaftHalf),
    pt(start.x - px * shaftHalf, start.y - py * shaftHalf),
  ];

  return points.join(" ");
};

export const MapAnnotationLayer: React.FC<Props> = ({ annotations, editMode, scale }) => {
  const dispatch = useDispatch();
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState("");

  const getCanvasOffset = () => {
    const canvasEl = document.querySelector("[data-canvas-root]") as HTMLElement | null;
    const rect = canvasEl?.getBoundingClientRect();
    return { x: rect?.left ?? 0, y: rect?.top ?? 0 };
  };

  const handleDragPoint = (id: string, index: number, clientX: number, clientY: number) => {
    const offset = getCanvasOffset();
    dispatch(
      updateAnnotationPoint({
        id,
        index,
        x: (clientX - offset.x) / scale,
        y: (clientY - offset.y) / scale,
      })
    );
  };

  const startPointDrag = (annotationId: string, index: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    const onMove = (ev: MouseEvent) => handleDragPoint(annotationId, index, ev.clientX, ev.clientY);
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // Drags the whole arrow (both endpoints together) rather than reshaping it -
  // the endpoint/thickness handles stop propagation so they take precedence
  // over this when a drag starts directly on one of them.
  const startArrowMoveDrag = (annotation: MapAnnotation) => (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const initialPoints = annotation.points.map((p) => ({ ...p }));

    const onMove = (ev: MouseEvent) => {
      const dx = (ev.clientX - startX) / scale;
      const dy = (ev.clientY - startY) / scale;
      const newPoints = initialPoints.map((p) => ({ x: p.x + dx, y: p.y + dy }));
      dispatch(updateAnnotation({ id: annotation.id, changes: { points: newPoints } }));
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const startThicknessDrag = (annotation: MapAnnotation, start: Point, end: Point) => (
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const offset = getCanvasOffset();
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.max(Math.hypot(dx, dy), 1);
    const px = -dy / length;
    const py = dx / length;

    const onMove = (ev: MouseEvent) => {
      const localX = (ev.clientX - offset.x) / scale;
      const localY = (ev.clientY - offset.y) / scale;
      // Project (localX,localY) - midpoint onto the perpendicular axis to
      // get signed distance, then thickness = 2x that distance.
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;
      const relX = localX - midX;
      const relY = localY - midY;
      const distance = relX * px + relY * py;
      const newThickness = Math.min(
        MAX_THICKNESS,
        Math.max(MIN_THICKNESS, Math.abs(distance) * 2)
      );
      dispatch(updateAnnotation({ id: annotation.id, changes: { thickness: newThickness } }));
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const startFontResizeDrag = (annotation: MapAnnotation) => (e: React.MouseEvent) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startFontSize = annotation.fontSize ?? 14;

    const onMove = (ev: MouseEvent) => {
      const dx = (ev.clientX - startX) / scale;
      const newFontSize = Math.min(
        MAX_FONT_SIZE,
        Math.max(MIN_FONT_SIZE, startFontSize + dx * 0.3)
      );
      dispatch(updateAnnotation({ id: annotation.id, changes: { fontSize: newFontSize } }));
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const commitLabelEdit = (annotationId: string) => {
    dispatch(updateAnnotation({ id: annotationId, changes: { text: draftText || "Label" } }));
    setEditingLabelId(null);
  };

  return (
    <AnnotationLayer>
      {annotations.map((annotation) => {
        if (annotation.type === "arrow") {
          const start = annotation.points[0];
          const end = annotation.points[1] ?? annotation.points[0];
          const thickness = annotation.thickness ?? 16;

          const minX = Math.min(start.x, end.x) - SVG_PADDING - thickness;
          const minY = Math.min(start.y, end.y) - SVG_PADDING - thickness;
          const maxX = Math.max(start.x, end.x) + SVG_PADDING + thickness;
          const maxY = Math.max(start.y, end.y) + SVG_PADDING + thickness;
          const svgWidth = maxX - minX;
          const svgHeight = maxY - minY;

          const localStart = { x: start.x - minX, y: start.y - minY };
          const localEnd = { x: end.x - minX, y: end.y - minY };
          const midLocal = {
            x: (localStart.x + localEnd.x) / 2,
            y: (localStart.y + localEnd.y) / 2,
          };
          const dx = localEnd.x - localStart.x;
          const dy = localEnd.y - localStart.y;
          const len = Math.max(Math.hypot(dx, dy), 1);
          const ux = dx / len;
          const uy = dy / len;
          const px = -dy / len;
          const py = dx / len;
          const thicknessHandlePos = {
            x: midLocal.x + px * (thickness / 2 + 10),
            y: midLocal.y + py * (thickness / 2 + 10),
          };

          // Glossy highlight stripe running along the top of the shaft,
          // from near the tail to partway into the shaft (cartoon/3D look).
          const highlightOffset = Math.max(2, thickness * 0.2);
          const highlightP1 = {
            x: localStart.x + ux * (thickness * 0.6) - px * highlightOffset,
            y: localStart.y + uy * (thickness * 0.6) - py * highlightOffset,
          };
          const highlightP2 = {
            x: localStart.x + dx * 0.55 - px * highlightOffset,
            y: localStart.y + dy * 0.55 - py * highlightOffset,
          };

          const arrowGradientId = `arrowGradient-${annotation.id}`;

          return (
            <AnnotationItem key={annotation.id} style={{ left: minX, top: minY }}>
              <ArrowWrapper>
                <svg
                  width={svgWidth}
                  height={svgHeight}
                  style={{ display: "block", cursor: editMode ? "grab" : "default" }}
                  onMouseDown={editMode ? startArrowMoveDrag(annotation) : undefined}
                >
                  <defs>
                    <linearGradient
                      id={arrowGradientId}
                      gradientUnits="userSpaceOnUse"
                      x1={midLocal.x - px * (thickness / 2)}
                      y1={midLocal.y - py * (thickness / 2)}
                      x2={midLocal.x + px * (thickness / 2)}
                      y2={midLocal.y + py * (thickness / 2)}
                    >
                      <stop offset="0%" stopColor="#fca5a5" />
                      <stop offset="45%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#a31515" />
                    </linearGradient>
                  </defs>

                  {/* drop shadow - gives the arrow a floating look */}
                  <polygon
                    points={buildBlockArrowPoints(localStart, localEnd, thickness)}
                    fill="rgba(20, 10, 5, 0.35)"
                    stroke="none"
                    transform="translate(3, 6)"
                    style={{ filter: "blur(4px)" }}
                  />

                  {/* cartoon 3D body */}
                  <polygon
                    points={buildBlockArrowPoints(localStart, localEnd, thickness)}
                    fill={`url(#${arrowGradientId})`}
                    stroke="#7f1d1d"
                    strokeWidth={2.5}
                    strokeLinejoin="round"
                  />

                  {/* glossy highlight */}
                  <line
                    x1={highlightP1.x}
                    y1={highlightP1.y}
                    x2={highlightP2.x}
                    y2={highlightP2.y}
                    stroke="rgba(255, 255, 255, 0.6)"
                    strokeWidth={Math.max(2, thickness * 0.18)}
                    strokeLinecap="round"
                  />
                </svg>

                {editMode && (
                  <>
                    <PointHandle
                      style={{ left: localStart.x, top: localStart.y, position: "absolute" }}
                      onMouseDown={startPointDrag(annotation.id, 0)}
                    />
                    <PointHandle
                      style={{ left: localEnd.x, top: localEnd.y, position: "absolute" }}
                      onMouseDown={startPointDrag(annotation.id, 1)}
                    />
                    <ThicknessHandle
                      style={{
                        left: thicknessHandlePos.x,
                        top: thicknessHandlePos.y,
                        position: "absolute",
                      }}
                      onMouseDown={startThicknessDrag(annotation, start, end)}
                    />
                    <DeleteButton
                      style={{ left: localStart.x - 10, top: localStart.y - 10, right: "auto" }}
                      onClick={() => dispatch(deleteAnnotation(annotation.id))}
                    >
                      ×
                    </DeleteButton>
                  </>
                )}
              </ArrowWrapper>
            </AnnotationItem>
          );
        }

        // --- Label ---
        const position = annotation.points[0] ?? { x: 0, y: 0 };
        const fontSize = annotation.fontSize ?? 14;
        const isEditing = editingLabelId === annotation.id;

        return (
          <AnnotationItem key={annotation.id} style={{ left: position.x, top: position.y }}>
            <LabelWrapper>
              {isEditing ? (
                <LabelInput
                  autoFocus
                  fontSize={fontSize}
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  onBlur={() => commitLabelEdit(annotation.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitLabelEdit(annotation.id);
                    if (e.key === "Escape") setEditingLabelId(null);
                  }}
                />
              ) : (
                <LabelText
                  fontSize={fontSize}
                  onDoubleClick={() => {
                    if (!editMode) return;
                    setDraftText(annotation.text ?? "Label");
                    setEditingLabelId(annotation.id);
                  }}
                  onMouseDown={editMode ? startPointDrag(annotation.id, 0) : undefined}
                >
                  {annotation.text ?? "Label"}
                </LabelText>
              )}

              {editMode && !isEditing && (
                <>
                  <ResizeHandle onMouseDown={startFontResizeDrag(annotation)} />
                  <DeleteButton onClick={() => dispatch(deleteAnnotation(annotation.id))}>
                    ×
                  </DeleteButton>
                </>
              )}
            </LabelWrapper>
          </AnnotationItem>
        );
      })}
    </AnnotationLayer>
  );
};