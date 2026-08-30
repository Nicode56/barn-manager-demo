import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import {
  markCompleteOptimistic,
  scheduleTaskOptimistic,
  addMaintenanceTask,
  updateMaintenanceTask
} from "@/store/maintenanceSlice";
import { toast } from "sonner";

import { NotesField } from "@/components/NotesField";
import { RusticInput } from "@/components/RusticInput";

export const MaintenanceBoardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const tasks = useSelector((state: RootState) => state.maintenance.tasks);
  const completedTasks = useSelector(
    (state: RootState) => state.maintenance.completedTasks
  );
  const archivedTasks = useSelector(
    (state: RootState) => (state.maintenance as any).archivedTasks || []
  );

  const isLoading = useSelector(
    (state: RootState) => state.loading.activeRequests > 0
  );

  const [showAddTask, setShowAddTask] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedCompletedId, setExpandedCompletedId] = useState<string | null>(null);
  const [expandedArchivedId, setExpandedArchivedId] = useState<string | null>(null);

  // New task fields
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskNotes, setNewTaskNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [repairCost, setRepairCost] = useState<number | undefined>(undefined);

  // Edit modal fields
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editAssignedTo, setEditAssignedTo] = useState("");
  const [editRepairCost, setEditRepairCost] = useState<number | undefined>(undefined);

  const openEditModal = (task: any) => {
    setEditingTask(task);
    setEditTitle(task.title ?? "");
    setEditNotes(task.notes ?? "");
    setEditDueDate(task.dueDate ?? "");
    setEditAssignedTo(task.assignedTo ?? "");
    setEditRepairCost(task.repairCost ?? undefined);
  };

  const handleSaveEdit = () => {
    if (!editingTask) return;

    dispatch(
      updateMaintenanceTask({
        id: editingTask.id,
        title: editTitle,
        notes: editNotes,
        dueDate: editDueDate,
        assignedTo: editAssignedTo,
        repairCost: editRepairCost
      })
    );

    toast.success("Maintenance task updated");
    setEditingTask(null);
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    dispatch(
      addMaintenanceTask({
        title: newTaskTitle,
        notes: newTaskNotes,
        dueDate,
        assignedTo,
        repairCost
      })
    );

    toast.success("New maintenance task added");

    setNewTaskTitle("");
    setNewTaskNotes("");
    setDueDate("");
    setAssignedTo("");
    setRepairCost(undefined);
    setShowAddTask(false);
  };

  return (
    <div className="p-8 space-y-10">
      <h1 className="text-3xl font-bold text-amber-900 mb-6 page-title-banner">Maintenance Orders</h1>

      {isLoading && <p className="text-blue-600 mb-4 wood-text-box">Updating…</p>}

      {/* New Maintenance Task button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowAddTask(true)}
          className="new-maint-btn px-4 py-2 rounded-md text-white font-semibold shadow-md"
        >
          New Maintenance Task
        </button>
      </div>

      {/* ACTIVE TASKS */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-amber-900 page-title-banner">Active Maintenance</h2>

        <ul className="space-y-4">
          {tasks.map(task => (
            <li key={task.id} className="bulletin-item">
              <div className="w-full">
                <div
                  className="cursor-pointer flex justify-between items-center"
                  onClick={() =>
                    setExpandedId(expandedId === task.id ? null : task.id)
                  }
                >
                  <div>
                    <strong className="text-amber-900">{task.title}</strong>
                    <strong className="status ml-2 text-green-700 font-semibold">
                      {task.status}
                    </strong>
                  </div>

                  <div className="flex gap-2">
                    {task.status !== "Completed" && (
                      <button
                        className="new-complete-btn px-3 py-1 bg-green-700 hover:bg-green-800 text-white rounded-md shadow-sm"
                        onClick={e => {
                          e.stopPropagation();
                          dispatch(markCompleteOptimistic(task.id));
                          toast.success("Maintenance marked complete");
                        }}
                      >
                        Mark Complete
                      </button>
                    )}

                    {task.status === "Pending" && (
                      <button
                        className="new-schedule-btn px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-md shadow-sm"
                        onClick={e => {
                          e.stopPropagation();
                          dispatch(scheduleTaskOptimistic(task.id));
                          toast.success("Maintenance scheduled");
                        }}
                      >
                        Schedule
                      </button>
                    )}
                  </div>
                </div>

                <div
                  className={`
                    overflow-hidden transition-[max-height] duration-300 ease-in-out
                    ${expandedId === task.id ? "max-h-[500px] mt-3" : "max-h-0"}
                  `}
                >
                  <div className="p-4 bg-amber-50 border border-amber-300 rounded-md space-y-2">
                    <p><strong>Notes:</strong> {task.notes || "No notes provided"}</p>
                    <p><strong>Due Date:</strong> {task.dueDate || "Not set"}</p>
                    <p><strong>Assigned To:</strong> {task.assignedTo || "Unassigned"}</p>
                    <p>
                      <strong>Repair Cost:</strong>{" "}
                      {task.repairCost != null ? `$${task.repairCost}` : "Not recorded"}
                    </p>

                    <div className="flex gap-2 mt-3">
                      <button
                        className="px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-md shadow-sm"
                        onClick={e => {
                          e.stopPropagation();
                          openEditModal(task);
                        }}
                      >
                        Edit Task
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* RECORDED MAINTENANCE */}
      <section>
        <h2 className="text-xl font-semibold mb-3 text-amber-900 page-title-banner">Recorded Maintenance</h2>
        <p className="user-notes text-gray-600 mb-4">
          Completed within the last 30 days. You can view details or edit records as needed.
        </p>

        {completedTasks.length === 0 && (
          <p className="text-gray-500 wood-text-box">No recorded maintenance yet.</p>
        )}

        <ul className="space-y-4">
          {completedTasks.map(task => (
            <li key={task.id} className="bulletin-item">
              <div className="w-full">
                <div
                  className="cursor-pointer flex justify-between items-center"
                  onClick={() =>
                    setExpandedCompletedId(
                      expandedCompletedId === task.id ? null : task.id
                    )
                  }
                >
                  <div className="text-amber-900 font-medium">
                    <strong>{task.title}</strong>
                    <span className="status-complete ml-2 text-green-700 font-semibold">
                      Completed
                    </span>
                  </div>
                </div>

                <div
                  className={`
                    overflow-hidden transition-[max-height] duration-300 ease-in-out
                    ${expandedCompletedId === task.id ? "max-h-[500px] mt-3" : "max-h-0"}
                  `}
                >
                  <div className="p-4 bg-amber-50 border border-amber-300 rounded-md space-y-2">
                    <p><strong>Notes:</strong> {task.notes || "No notes provided"}</p>
                    <p>
                      <strong>Completed At:</strong>{" "}
                      {task.completedAt
                        ? new Date(task.completedAt).toLocaleString()
                        : "Unknown"}
                    </p>
                    <p><strong>Assigned To:</strong> {task.assignedTo || "Unassigned"}</p>
                    <p>
                      <strong>Repair Cost:</strong>{" "}
                      {task.repairCost != null ? `$${task.repairCost}` : "Not recorded"}
                    </p>

                    <div className="flex gap-2 mt-3">
                      <button
                        className="px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-md shadow-sm"
                        onClick={e => {
                          e.stopPropagation();
                          openEditModal(task);
                        }}
                      >
                        Edit Record
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ARCHIVED MAINTENANCE */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-3 text-amber-900 page-title-banner">Archived Maintenance</h2>
        <p className="user-notes text-gray-600 mb-4">
          Completed more than 30 days ago. You can view details or edit records as needed.
        </p>

        {archivedTasks.length === 0 ? (
          <p className="text-gray-500 wood-text-box">No archived maintenance yet.</p>
        ) : (
          <ul className="space-y-4">
            {archivedTasks.map((task: any) => (
              <li key={task.id} className="bulletin-item">
                <div className="w-full">
                  <div
                    className="cursor-pointer flex justify-between items-center"
                    onClick={() =>
                      setExpandedArchivedId(
                        expandedArchivedId === task.id ? null : task.id
                      )
                    }
                  >
                    <div className="text-gray-800 font-medium">
                      <strong>{task.title}</strong>
                      <span className="ml-2 text-gray-600 font-semibold">
                        Archived
                      </span>
                    </div>
                  </div>

                  <div
                    className={`
                      overflow-hidden transition-[max-height] duration-300 ease-in-out
                      ${expandedArchivedId === task.id ? "max-h-[500px] mt-3" : "max-h-0"}
                    `}
                  >
                    <div className="p-4 bg-gray-100 border border-gray-300 rounded-md space-y-2">
                      <p><strong>Notes:</strong> {task.notes || "No notes provided"}</p>
                      <p>
                        <strong>Completed At:</strong>{" "}
                        {task.completedAt
                          ? new Date(task.completedAt).toLocaleString()
                          : "Unknown"}
                      </p>
                      <p><strong>Assigned To:</strong> {task.assignedTo || "Unassigned"}</p>
                      <p>
                        <strong>Repair Cost:</strong>{" "}
                        {task.repairCost != null ? `$${task.repairCost}` : "Not recorded"}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ADD TASK MODAL */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-[#fdf8f3] border border-amber-900 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h2 className="text-2xl font-bold text-amber-900">
              New Maintenance Task
            </h2>

            <input
              type="text"
              placeholder="Task title"
              className="rustic-input"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
            />

            <NotesField
              value={newTaskNotes}
              onChange={setNewTaskNotes}
              placeholder="Add details, location, urgency..."
              rows={4}
            />

            <input
              type="date"
              className="rustic-input"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />

            <input
              type="number"
              placeholder="Repair cost ($)"
              className="rustic-input"
              value={repairCost ?? ""}
              onChange={e =>
                setRepairCost(
                  e.target.value === "" ? undefined : Number(e.target.value)
                )
              }
            />

            <input
              type="text"
              placeholder="Assigned to"
              className="rustic-input"
              value={assignedTo}
              onChange={e => setAssignedTo(e.target.value)}
            />

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowAddTask(false)}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                Cancel
              </button>

              <button
                onClick={handleAddTask}
                className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-md"
              >
                Add Maintenance Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT TASK MODAL */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-[#fdf8f3] border border-amber-900 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h2 className="text-2xl font-bold text-amber-900">
              Edit Maintenance Task
            </h2>

            <RusticInput
              label="Task Title"
              value={editTitle}
              onChange={setEditTitle}
            />

            <NotesField
              label="Task Notes"
              value={editNotes}
              onChange={setEditNotes}
              rows={4}
            />

            <RusticInput
              label="Due Date"
              value={editDueDate}
              onChange={setEditDueDate}
            />

            <RusticInput
              label="Repair Cost ($)"
              value={editRepairCost?.toString() ?? ""}
              onChange={(v) =>
                setEditRepairCost(v === "" ? undefined : Number(v))
              }
            />

            <RusticInput
              label="Assigned To"
              value={editAssignedTo}
              onChange={setEditAssignedTo}
            />

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setEditingTask(null)}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-md shadow-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


