import React, { useState } from "react";
import styled from "@emotion/styled";
import { useAppDispatch } from "../../store/hooks";
import {
  updateStallPosition,
  snapStallToGrid,
  updateStall,
  selectStall,
  addStall,
  addTackroom,
  assignAnimalToStall,
} from "../../store/barnLayout/barnLayoutSlice";
import { StallShape, StallType } from "../../store/barnLayout/barnLayoutTypes";
import { animals } from "../../demo-data/animals";
import { SaveMapButton } from "../shared/SaveMapButton";
import { saveToStorage } from "../../utils/localStoragePersistence";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import { useCanEditLayout } from "../../hooks/useCanEditLayout";

const stallTypeColorMap: Record<StallType, { base: string; border: string }> = {
  standard: { base: "#fff7ed", border: "#d4c7b5" },
  foaling: { base: "#fce7f3", border: "#ec4899" },
  medical: { base: "#fee2e2", border: "#ef4444" },
  quarantine: { base: "#fef9c3", border: "#eab308" },
  tackroom: { base: "#e2e8f0", border: "#64748b" },
  storage: { base: "#e5e5e5", border: "#737373" },
  custom: { base: "#f3e8ff", border: "#a855f7" },
};

// Stalls need to shrink well below the default 260px for large barns with
// many rows (e.g. an equestrian center laying out hundreds of stalls).
const MIN_STALL_SIZE = 24;

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
  padding: 48px;
`;

const MapCanvas = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 600px;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid #451a03;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.4);
  background-color: #78350f;
`;

const StallBox = styled.div<{ selected: boolean; stallType: StallType }>`
  position: absolute;
  border: ${({ selected, stallType }) =>
    selected
      ? "3px solid #9a3412"
      : `2px solid ${stallTypeColorMap[stallType].border}`};
  background: ${({ stallType }) => stallTypeColorMap[stallType].base};
  border-radius: 4px;
  cursor: pointer;
`;

const StallResizeHandle = styled.div<{ cursor: string }>`
  position: absolute;
  width: 9px;
  height: 9px;
  transform: translate(-50%, -50%);
  background: #ffffff;
  border: 1px solid #78350f;
  border-radius: 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  cursor: ${(p) => p.cursor};
  z-index: 6;
`;

const StallTooltip = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: calc(100% - 12px);
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(41, 21, 8, 0.92);
  color: #fff7ed;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
  z-index: 10;
`;

const Sidebar = styled.aside`
  width: 320px;
  border-left: 1px solid #e7d9c9;
  background: #fff;
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.03);
  overflow-y: auto;
`;

const SidebarHeader = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #e7d9c9;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #262626;
`;

const Section = styled.section`
  padding: 12px 16px;
  border-bottom: 1px solid #e7d9c9;
`;

const SectionTitle = styled.h3`
  font-size: 12px;
  font-weight: 600;
  color: #9a3412;
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
    border-color: #9a3412;
  }

  &:disabled {
    background: #f5f5f5;
    color: #a3a3a3;
    cursor: not-allowed;
  }
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

const TextArea = styled.textarea`
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid #d4d4d4;
  border-radius: 4px;
  resize: vertical;
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

const AnimalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 8px;
`;

const AnimalRow = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #404040;
  padding: 2px 0;
`;

// -------------------- Component --------------------

interface Props {
  barnId: string;
  stalls: StallShape[];
  selectedStallId: string | null;
}

const BarnLayoutBuilder: React.FC<Props> = ({
  barnId,
  stalls,
  selectedStallId,
}) => {
  const dispatch = useAppDispatch();
  const isDesktop = useIsDesktop();
  const canEditLayout = useCanEditLayout();

  const [editMode, setEditMode] = useState(false);
  const effectiveEditMode = editMode && canEditLayout;
  const [checkedAnimalId, setCheckedAnimalId] = useState<number | null>(null);
  const [hoveredStallId, setHoveredStallId] = useState<string | null>(null);
  const [draggedTool, setDraggedTool] = useState<"stall" | "tackroom" | null>(null);

  const selectedStall = stalls.find((s) => s.id === selectedStallId);

  const handleSelectStall = (stallId: string) => {
    dispatch(selectStall(stallId));
    setCheckedAnimalId(null);
  };

  const handleSaveMap = () => {
    saveToStorage("barnLayoutMap", { stalls });
    setEditMode(false);
  };

  const handleAssignAnimal = () => {
    if (!selectedStall || checkedAnimalId === null) return;

    dispatch(
      assignAnimalToStall({
        animalId: checkedAnimalId,
        stallId: selectedStall.id,
        barnId,
        keepPasture: false,
      })
    );

    setCheckedAnimalId(null);
  };

  const stallToolSize: Record<"stall" | "tackroom", number> = {
    stall: 260,
    tackroom: 180,
  };

  const handleToolDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggedTool) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const size = stallToolSize[draggedTool];
    const x = Math.min(
      Math.max(e.clientX - rect.left - size / 2, 0),
      Math.max(rect.width - size, 0)
    );
    const y = Math.min(
      Math.max(e.clientY - rect.top - size / 2, 0),
      Math.max(rect.height - size, 0)
    );

    if (draggedTool === "stall") {
      dispatch(addStall({ x, y }));
    } else {
      dispatch(addTackroom({ x, y }));
    }

    setDraggedTool(null);
  };

  // -----------------------------
  // DRAG HANDLERS
  // -----------------------------
  const handlePointerDown = (e: React.PointerEvent, stall: StallShape) => {
    if (!effectiveEditMode) return;
    const startX = e.clientX;
    const startY = e.clientY;

    const origX = stall.x;
    const origY = stall.y;

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      dispatch(
        updateStallPosition({
          id: stall.id,
          x: origX + dx,
          y: origY + dy,
        })
      );
    };

    const up = (ev: PointerEvent) => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);

      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      const snappedX = Math.round((origX + dx) / 20) * 20;
      const snappedY = Math.round((origY + dy) / 20) * 20;

      dispatch(
        snapStallToGrid({
          id: stall.id,
          x: snappedX,
          y: snappedY,
        })
      );
    };

    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  };

  // -----------------------------
  // RESIZE HANDLERS
  // -----------------------------
  const handleResizePointerDown =
    (handle: ResizeHandleId, stall: StallShape) => (e: React.PointerEvent) => {
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      const initial = { x: stall.x, y: stall.y, width: stall.width, height: stall.height };

      const move = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        let nextX = initial.x;
        let nextY = initial.y;
        let nextWidth = initial.width;
        let nextHeight = initial.height;

        if (handle.includes("e")) {
          nextWidth = Math.max(MIN_STALL_SIZE, initial.width + dx);
        }
        if (handle.includes("w")) {
          nextWidth = Math.max(MIN_STALL_SIZE, initial.width - dx);
          nextX = initial.x + (initial.width - nextWidth);
        }
        if (handle.includes("s")) {
          nextHeight = Math.max(MIN_STALL_SIZE, initial.height + dy);
        }
        if (handle.includes("n")) {
          nextHeight = Math.max(MIN_STALL_SIZE, initial.height - dy);
          nextY = initial.y + (initial.height - nextHeight);
        }

        dispatch(
          updateStall({
            id: stall.id,
            x: nextX,
            y: nextY,
            width: nextWidth,
            height: nextHeight,
          })
        );
      };

      const up = () => {
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", up);
      };

      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up);
    };

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <Layout>
      <MapPane>
        <MapCanvas
          data-canvas-root
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleToolDrop}
        >
          {stalls.map((stall) => {
            const assignedAnimal = stall.assignedAnimalId
              ? animals.find((a) => a.id === stall.assignedAnimalId)
              : undefined;

            const showTooltip =
              !!assignedAnimal &&
              (isDesktop
                ? hoveredStallId === stall.id
                : selectedStallId === stall.id);

            return (
              <StallBox
                key={stall.id}
                selected={stall.id === selectedStallId}
                stallType={stall.stallType}
                style={{
                  left: stall.x,
                  top: stall.y,
                  width: stall.width,
                  height: stall.height,
                }}
                onClick={() => handleSelectStall(stall.id)}
                onPointerDown={(e) => handlePointerDown(e, stall)}
                onMouseEnter={() => isDesktop && setHoveredStallId(stall.id)}
                onMouseLeave={() => isDesktop && setHoveredStallId(null)}
              >
                {showTooltip && (
                  <StallTooltip>{assignedAnimal!.name}</StallTooltip>
                )}

                {effectiveEditMode && stall.id === selectedStallId &&
                  RESIZE_HANDLES.map(({ id, left, top, cursor }) => (
                    <StallResizeHandle
                      key={id}
                      cursor={cursor}
                      style={{ left, top }}
                      onPointerDown={handleResizePointerDown(id, stall)}
                    />
                  ))}
              </StallBox>
            );
          })}
        </MapCanvas>
      </MapPane>

      <Sidebar>
        <SidebarHeader>
          <HeaderLabel>Barn Interior Tools</HeaderLabel>
          {canEditLayout && (
            <ToolButton onClick={() => setEditMode(!editMode)}>
              {effectiveEditMode ? "Exit Edit Mode" : "Edit Mode"}
            </ToolButton>
          )}
        </SidebarHeader>

        {effectiveEditMode && (
          <Section>
            <SaveMapButton onSave={handleSaveMap} />
          </Section>
        )}

        {effectiveEditMode && (
          <Section>
            <SectionTitle>Layout</SectionTitle>
            <ButtonRow>
              <ToolButton
                draggable
                onDragStart={() => setDraggedTool("stall")}
                onDragEnd={() => setDraggedTool(null)}
                onClick={() => dispatch(addStall())}
              >
                Add Stall
              </ToolButton>
              <ToolButton
                draggable
                onDragStart={() => setDraggedTool("tackroom")}
                onDragEnd={() => setDraggedTool(null)}
                onClick={() => dispatch(addTackroom())}
              >
                Add Tackroom
              </ToolButton>
            </ButtonRow>
          </Section>
        )}

        <Section>
          <SectionTitle>Selected Stall</SectionTitle>

          {selectedStall ? (
            <FieldGroup>
              <Field>
                <FieldLabel>Stall Type</FieldLabel>
                {effectiveEditMode ? (
                  <Select
                    value={selectedStall.stallType}
                    onChange={(e) =>
                      dispatch(
                        updateStall({
                          id: selectedStall.id,
                          stallType: e.target.value,
                        })
                      )
                    }
                  >
                    <option value="standard">Standard</option>
                    <option value="foaling">Foaling</option>
                    <option value="medical">Medical</option>
                    <option value="quarantine">Quarantine</option>
                    <option value="tackroom">Tackroom</option>
                    <option value="storage">Storage</option>
                    <option value="custom">Custom</option>
                  </Select>
                ) : (
                  <div>{selectedStall.stallType}</div>
                )}
              </Field>

              <Field>
                <FieldLabel>Size (Width × Height)</FieldLabel>
                {effectiveEditMode ? (
                  <ButtonRow>
                    <TextInput
                      type="number"
                      min={MIN_STALL_SIZE}
                      value={selectedStall.width}
                      style={{ flex: 1 }}
                      onChange={(e) =>
                        dispatch(
                          updateStall({
                            id: selectedStall.id,
                            width: Math.max(
                              MIN_STALL_SIZE,
                              Number(e.target.value) || MIN_STALL_SIZE
                            ),
                          })
                        )
                      }
                    />
                    <TextInput
                      type="number"
                      min={MIN_STALL_SIZE}
                      value={selectedStall.height}
                      style={{ flex: 1 }}
                      onChange={(e) =>
                        dispatch(
                          updateStall({
                            id: selectedStall.id,
                            height: Math.max(
                              MIN_STALL_SIZE,
                              Number(e.target.value) || MIN_STALL_SIZE
                            ),
                          })
                        )
                      }
                    />
                  </ButtonRow>
                ) : (
                  <div>
                    {selectedStall.width} × {selectedStall.height}
                  </div>
                )}
              </Field>

              <Field>
                <FieldLabel>Capacity</FieldLabel>
                {effectiveEditMode ? (
                  <TextInput
                    type="number"
                    min={0}
                    value={selectedStall.capacity}
                    onChange={(e) =>
                      dispatch(
                        updateStall({
                          id: selectedStall.id,
                          capacity: Number(e.target.value),
                        })
                      )
                    }
                  />
                ) : (
                  <div>{selectedStall.capacity}</div>
                )}
              </Field>

              <Field>
                <FieldLabel>Notes</FieldLabel>
                {effectiveEditMode ? (
                  <TextArea
                    value={selectedStall.notes ?? ""}
                    onChange={(e) =>
                      dispatch(
                        updateStall({
                          id: selectedStall.id,
                          notes: e.target.value,
                        })
                      )
                    }
                  />
                ) : (
                  <div>{selectedStall.notes || "—"}</div>
                )}
              </Field>
            </FieldGroup>
          ) : (
            <EmptyState>Click a stall on the map.</EmptyState>
          )}
        </Section>

        {effectiveEditMode && selectedStall && selectedStall.stallType !== "tackroom" && (
          <Section>
            <SectionTitle>Assign Animal</SectionTitle>

            <AnimalList>
              {animals.map((animal) => {
                const alreadyHere = selectedStall.assignedAnimalId === animal.id;

                return (
                  <AnimalRow key={animal.id}>
                    <input
                      type="checkbox"
                      checked={checkedAnimalId === animal.id}
                      onChange={() =>
                        setCheckedAnimalId(
                          checkedAnimalId === animal.id ? null : animal.id
                        )
                      }
                    />
                    {animal.name} ({animal.breed})
                    {alreadyHere && " — currently here"}
                  </AnimalRow>
                );
              })}
            </AnimalList>

            <ToolButton
              onClick={handleAssignAnimal}
              disabled={checkedAnimalId === null}
            >
              Assign Animal
            </ToolButton>
          </Section>
        )}
      </Sidebar>
    </Layout>
  );
};

export default BarnLayoutBuilder;
