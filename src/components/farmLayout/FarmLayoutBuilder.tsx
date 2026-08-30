import React, { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import { useSelector, useDispatch } from "react-redux";
import {
  setEditMode,
  toggleRotationTools,
  addShape,
  straightenShape,
  deleteShape,
  renameShape,
  setCategory,
  startPointEdit,
  snapShapeToStandard,
  addAnnotation,
  setCapacity,
} from "../../store/farmLayout/farmLayoutSlice";
import { RootState } from "../../store/store";
import {
  ShapeType,
  LocationCategory,
} from "../../store/farmLayout/farmLayoutTypes";
import { LocationCanvas } from "./LocationCanvas";
import { useBarnDrillDown } from "./useBarnDrillDown";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import { useCanEditLayout } from "../../hooks/useCanEditLayout";
import { SaveMapButton } from "../shared/SaveMapButton";
import { saveToStorage } from "../../utils/localStoragePersistence";
import  AnimalAssignPicker  from "../shared/AnimalAssignPicker";


// Logical design space shapes/annotations are positioned in. The canvas is
// scaled to fit the available window via CSS transform (see `scale` state
// below) rather than ever changing this coordinate system. Sized well past
// a single screen's worth of room (editing only happens on desktop, see
// useCanEditLayout) so there's real room to lay out a whole farm; view mode
// uses this same fixed space, just scaled smaller to fit, so nothing built
// near its edges ends up somewhere a viewer's device can't reach.
const CANVAS_WIDTH = 2200;
const CANVAS_HEIGHT = 1100;
// Kept in sync with MapPane's CSS padding below, so the fit-to-window scale
// calculation always leaves a real, visible margin of pane background around
// the canvas instead of letting the canvas grow to cover it edge-to-edge.
const PANE_PADDING = 48;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

type DraggedTool =
  | { kind: "shape"; type: ShapeType; category: LocationCategory | null }
  | { kind: "annotation"; type: "arrow" | "label" };

// -------------------- Styled Components --------------------

const Layout = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

const MapPane = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${PANE_PADDING}px;
  min-width: 0;
  min-height: 0;
`;

const MapViewport = styled.div`
  position: relative;
  overflow: hidden;
`;

const MapCanvas = styled.div`
  position: relative;
  width: ${CANVAS_WIDTH}px;
  height: ${CANVAS_HEIGHT}px;
  transform-origin: top left;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid #334155;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.4);
  background-color: #115821;
`;

const Sidebar = styled.aside`
  width: clamp(240px, 22vw, 340px);
  border-left: 1px solid #d4d4d4;
  background: #cfcfcf;
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.03);
  overflow-y: auto;
`;

const SidebarHeader = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #262626;
`;

const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #404040;
`;

const Section = styled.section`
  padding: 12px 16px;
  border-bottom: 1px solid #e5e5e5;
`;

const SectionTitle = styled.h3`
  font-size: 12px;
  font-weight: 600;
  color: #b45309;
  margin-bottom: 8px;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ToolButton = styled.button`
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
  border: 1px solid #d4d4d4;
  background: white;
  cursor: pointer;

  &:hover {
    border-color: #d97706;
  }
`;

const DangerButton = styled(ToolButton)`
  border-color: #fca5a5;
  background: #fef2f2;
  color: #b91c1c;

  &:hover {
    border-color: #ef4444;
  }
`;

const BarnButton = styled(ToolButton)`
  border-color: #fcd34d;
  background: #fffbeb;
  color: #b45309;
`;

const LinkButton = styled(Link)`
  display: inline-block;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
  border: 1px solid #93c5fd;
  background: #eff6ff;
  color: #1d4ed8;
  text-align: center;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    border-color: #3b82f6;
  }
`;

const ArenaSlotList = styled.ul`
  list-style: none;
  margin: 0 0 8px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ArenaSlotRow = styled.li`
  font-size: 12px;
  color: #404040;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FieldLabel = styled.label`
  font-size: 12px;
  color: #404040;
`;

const TextInput = styled.input`
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid #d4d4d4;
  border-radius: 4px;
`;

const Select = styled.select`
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid #d4d4d4;
  border-radius: 4px;
`;

const EmptyState = styled.p`
  font-size: 12px;
  color: #737373;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;


// -------------------- Component --------------------

export const FarmLayoutBuilder: React.FC = () => {
  const dispatch = useDispatch();

  const { shapes, annotations, editMode, rotationToolsEnabled, selectedShapeId } =
    useSelector((state: RootState) => state.farmLayout);

  const animals = useSelector((state: RootState) => state.farm.animals);
  const farmId = useSelector((state: RootState) => state.farm.farmId);
  const lessonSlots = useSelector((state: RootState) => state.lessons.slots);

  const selectedShape = shapes.find((s) => s.id === selectedShapeId);

  const selectedAnimalNames = selectedShape
    ? selectedShape.animalId
        .map((id) => animals.find((a) => a.id === id)?.name)
        .filter((name): name is string => Boolean(name))
    : [];

  const openArenaSlots = lessonSlots.filter((s) => s.available && !s.blocked);

  const { openBarn } = useBarnDrillDown();
  const isDesktop = useIsDesktop();
  const canEditLayout = useCanEditLayout();

  const effectiveEditMode = editMode && canEditLayout;

  const mapPaneRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [draggedTool, setDraggedTool] = useState<DraggedTool | null>(null);

  useLayoutEffect(() => {
    const node = mapPaneRef.current;
    if (!node) return;

    // `width`/`height` here are always the pane's content box (padding
    // already excluded), so the fit calculation below leaves a real,
    // consistent margin around the canvas instead of letting it grow edge
    // to edge and hide the pane background.
    const updateScale = (width: number, height: number) => {
      if (width <= 0 || height <= 0) return;
      // No lower clamp: on a small phone the "true fit" scale can dip below
      // what used to be the 0.4 floor, but forcing it back up there made the
      // canvas wider than the screen and silently cut off whatever fell
      // outside it. Always fitting fully - however small - is what actually
      // keeps the whole map reachable on every device.
      const nextScale = Math.min(width / CANVAS_WIDTH, height / CANVAS_HEIGHT);
      setScale(nextScale);
    };

    // clientWidth/clientHeight include padding, unlike ResizeObserver's
    // contentRect below, so the initial measurement subtracts it to match.
    updateScale(
      node.clientWidth - PANE_PADDING * 2,
      node.clientHeight - PANE_PADDING * 2
    );

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      updateScale(entry.contentRect.width, entry.contentRect.height);
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const handleSaveMap = () => {
    saveToStorage("farmLayoutMap", { shapes, annotations });
  };

  const handleAddShape = (
    type: ShapeType,
    category: LocationCategory | null,
    dropPoint?: { x: number; y: number }
  ) => {
    let resolvedCategory = category;

    if (!resolvedCategory) {
      switch (type) {
        case "aviary":
          resolvedCategory = "Aviary";
          break;
        case "stadium":
          resolvedCategory = "Arena";
          break;
        case "rect":
        case "polygon":
          resolvedCategory = "Barn";
          break;
        case "circle":
          resolvedCategory = "Pasture";
          break;
        default:
          resolvedCategory = "Other";
      }
    }

    const resolvedType = resolvedCategory === "Arena" ? "stadium" : type;

    const categoryCount =
      shapes.filter((shape) => shape.category === resolvedCategory).length + 1;

    const defaultWidth =
      resolvedCategory === "Road"
        ? 260
        : resolvedType === "rect" || resolvedType === "stadium"
        ? 220
        : undefined;

    const defaultHeight =
      resolvedCategory === "Road"
        ? 60
        : resolvedType === "rect"
        ? 120
        : resolvedType === "stadium"
        ? 90
        : undefined;

    const width = defaultWidth ?? 120;
    const height = defaultHeight ?? 120;

    let x = 300;
    let y = 200;
    if (dropPoint) {
      x = clamp(dropPoint.x - width / 2, 0, CANVAS_WIDTH - width);
      y = clamp(dropPoint.y - height / 2, 0, CANVAS_HEIGHT - height);
    }

    dispatch(
      addShape({
        farmId: crypto.randomUUID(), // Assuming farmId is generated here; adjust as needed
        type: resolvedType,
        name: `${resolvedCategory} ${categoryCount}`,
        category: resolvedCategory,
        x,
        y,
        width: defaultWidth,
        height: defaultHeight,
        r: resolvedType === "circle" ? 60 : undefined,
      })
    );
  };

  const handleAddAnnotation = (
    type: "arrow" | "label",
    dropPoint?: { x: number; y: number }
  ) => {
    const origin = dropPoint ?? { x: 320, y: 240 };

    dispatch(
      addAnnotation({
        id: crypto.randomUUID(),
        type,
        points:
          type === "arrow"
            ? [
                origin,
                { x: origin.x + 100, y: origin.y + 80 },
              ]
            : [origin],
        text: type === "label" ? "New Label" : undefined,
      })
    );
  };

  const handleToolDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggedTool) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const dropPoint = {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    };

    if (draggedTool.kind === "shape") {
      handleAddShape(draggedTool.type, draggedTool.category, dropPoint);
    } else {
      handleAddAnnotation(draggedTool.type, dropPoint);
    }

    setDraggedTool(null);
  };

  return (
    <Layout>
      <MapPane ref={mapPaneRef}>
        <MapViewport
          style={{ width: CANVAS_WIDTH * scale, height: CANVAS_HEIGHT * scale }}
        >
          <MapCanvas
            data-canvas-root
            style={{ transform: `scale(${scale})` }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleToolDrop}
          >
            <LocationCanvas
              shapes={shapes}
              effectiveEditMode={effectiveEditMode && isDesktop}
              rotationToolsEnabled={rotationToolsEnabled}
              scale={scale}
            />
          </MapCanvas>
        </MapViewport>
      </MapPane>

      {isDesktop && (
        <Sidebar>
          <SidebarHeader>
            <HeaderLabel>Farm Layout Tools</HeaderLabel>
            {canEditLayout && (
              <ToolButton onClick={() => dispatch(setEditMode(!editMode))}>
                {effectiveEditMode ? "Exit Edit Mode" : "Edit Mode"}
              </ToolButton>
            )}
          </SidebarHeader>

          {effectiveEditMode && (
            <>
              <section>
                <SaveMapButton onSave={handleSaveMap} />
              </section>

              <Section>
                <SectionTitle>Layout</SectionTitle>
                <ButtonRow>
                  {(
                    [
                      { label: "Add Barn", type: "rect", category: "Barn" },
                      { label: "Add Pasture", type: "rect", category: "Pasture" },
                      { label: "Add Arena", type: "stadium", category: "Arena" },
                      { label: "Add Round Pen", type: "circle", category: "Round Pen" },
                      { label: "Add Road", type: "rect", category: "Road" },
                      { label: "Add Aviary", type: "aviary", category: "Aviary" },
                      {
                        label: "Add Exotic Enclosure",
                        type: "polygon",
                        category: "Exotic Enclosure",
                      },
                    ] as {
                      label: string;
                      type: ShapeType;
                      category: LocationCategory;
                    }[]
                  ).map(({ label, type, category }) => (
                    <ToolButton
                      key={label}
                      draggable
                      onDragStart={() =>
                        setDraggedTool({ kind: "shape", type, category })
                      }
                      onDragEnd={() => setDraggedTool(null)}
                      onClick={() => handleAddShape(type, category)}
                    >
                      {label}
                    </ToolButton>
                  ))}
                </ButtonRow>
              </Section>

              <Section>
                <SectionTitle>Markers</SectionTitle>
                <ButtonRow>
                  <ToolButton
                    draggable
                    onDragStart={() =>
                      setDraggedTool({ kind: "annotation", type: "arrow" })
                    }
                    onDragEnd={() => setDraggedTool(null)}
                    onClick={() => handleAddAnnotation("arrow")}
                  >
                    Add Arrow
                  </ToolButton>
                  <ToolButton
                    draggable
                    onDragStart={() =>
                      setDraggedTool({ kind: "annotation", type: "label" })
                    }
                    onDragEnd={() => setDraggedTool(null)}
                    onClick={() => handleAddAnnotation("label")}
                  >
                    Add Label
                  </ToolButton>
                </ButtonRow>
              </Section>

              <Section>
                <SectionTitle>Rotation</SectionTitle>
                <ToggleLabel style={{ marginBottom: 8 }}>
                  <input
                    type="checkbox"
                    checked={rotationToolsEnabled}
                    onChange={() => dispatch(toggleRotationTools())}
                  />
                  Rotation Tools Enabled
                </ToggleLabel>

                {selectedShapeId && (
                  <ToolButton onClick={() => dispatch(straightenShape(selectedShapeId))}>
                    Straighten Selected
                  </ToolButton>
                )}
              </Section>
            </>
          )}

          <Section>
            <SectionTitle>Selected Location</SectionTitle>

            {selectedShape ? (
              <FieldGroup>
                <Field>
                  <FieldLabel>Name</FieldLabel>
                  {effectiveEditMode ? (
                    <TextInput
                      type="text"
                      value={selectedShape.name}
                      onChange={(e) =>
                        dispatch(
                          renameShape({
                            id: selectedShapeId!,
                            newName: e.target.value,
                          })
                        )
                      }
                    />
                  ) : (
                    <div>{selectedShape.name}</div>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Category</FieldLabel>
                  {effectiveEditMode ? (
                    <Select
                      value={selectedShape.category ?? ""}
                      onChange={(e) =>
                        dispatch(
                          setCategory({
                            id: selectedShapeId!,
                            category: e.target.value as LocationCategory,
                          })
                        )
                      }
                    >
                      <option value="Barn">Barn</option>
                      <option value="Pasture">Pasture</option>
                      <option value="Arena">Arena</option>
                      <option value="Round Pen">Round Pen</option>
                      <option value="Exotic Enclosure">Exotic Enclosure</option>
                      <option value="Storage">Storage</option>
                      <option value="Parking">Parking</option>
                      <option value="Aviary">Aviary</option>
                      <option value="Road">Road</option>
                      <option value="Other">Other</option>
                    </Select>
                  ) : (
                    <div>{selectedShape.category ?? "—"}</div>
                  )}
                </Field>

                {selectedShape.category !== "Barn" &&
                  selectedShape.category !== "Road" && (
                    <Field>
                      <FieldLabel>
                        Capacity ({selectedShape.animalId.length} /{" "}
                        {selectedShape.capacity ?? 1} filled)
                      </FieldLabel>
                      {effectiveEditMode ? (
                        <TextInput
                          type="number"
                          min={1}
                          value={selectedShape.capacity ?? 1}
                          onChange={(e) =>
                            dispatch(
                              setCapacity({
                                id: selectedShapeId!,
                                capacity: Number(e.target.value) || 1,
                              })
                            )
                          }
                        />
                      ) : (
                        <div>{selectedShape.capacity ?? 1}</div>
                      )}
                    </Field>
                  )}

                {selectedShape.category !== "Road" &&
                  selectedAnimalNames.length > 0 && (
                    <Field>
                      <FieldLabel>Assigned Animals</FieldLabel>
                      <div>{selectedAnimalNames.join(", ")}</div>
                    </Field>
                  )}

                {effectiveEditMode && selectedShape.category !== "Road" && (
                  <Field>
                    <FieldLabel>Assign Animals</FieldLabel>
                    <AnimalAssignPicker
                      animalId={animals[0]?.id ?? 0} // Assuming you want to assign the first animal; adjust as needed
                      targets={shapes
                        .filter((s) => s.id !== selectedShapeId)
                        .map((s) => ({ kind: "shape", shapeId: s.id }))}
                      onClose={() => {
                        // Handle close action if needed
                      }}
                    />
                  </Field>
                )}

                {selectedShape.category === "Barn" && (
                  <BarnButton onClick={() => openBarn(selectedShape)}>
                    Open Barn Interior
                  </BarnButton>
                )}

                {selectedShape.category === "Arena" && (
                  <Field>
                    <FieldLabel>Arena Schedule</FieldLabel>
                    {openArenaSlots.length > 0 ? (
                      <>
                        <ArenaSlotList>
                          {openArenaSlots.slice(0, 3).map((slot) => (
                            <ArenaSlotRow key={slot.id}>
                              {slot.time} — {slot.type}
                            </ArenaSlotRow>
                          ))}
                        </ArenaSlotList>
                        <LinkButton to="/lessons">
                          Book Arena Time ({openArenaSlots.length} open)
                        </LinkButton>
                      </>
                    ) : (
                      <EmptyState>
                        No open lesson slots right now — arena time can't be
                        booked at the moment.
                      </EmptyState>
                    )}
                  </Field>
                )}

                {effectiveEditMode && !selectedShape.points && (
                  <ToolButton
                    onClick={() => dispatch(startPointEdit({ id: selectedShapeId! }))}
                  >
                    Freeform Edit
                  </ToolButton>
                )}

                {effectiveEditMode && selectedShape.points && (
                  <ToolButton
                    onClick={() => dispatch(snapShapeToStandard(selectedShapeId!))}
                  >
                    Clean Up Shape
                  </ToolButton>
                )}

                {effectiveEditMode && (
                  <DangerButton
                    onClick={() => dispatch(deleteShape(selectedShapeId!))}
                  >
                    Delete Location
                  </DangerButton>
                )}
              </FieldGroup>
            ) : (
              <EmptyState>Click a location on the map.</EmptyState>
            )}
          </Section>
        </Sidebar>
      )}
    </Layout>
  );
};
