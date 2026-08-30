import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { closeStallModal, updateStallDetails } from "../../store/stall/stallSlice";
import { useCanEditLayout } from "../../hooks/useCanEditLayout";

export const StallDetailModal: React.FC = () => {
  const dispatch = useDispatch();
  const canEditLayout = useCanEditLayout();

  const stallId = useSelector((state: RootState) => state.stall.openModalStallId);
  const stallDetails = useSelector((state: RootState) =>
    state.stall.details.find(d => d.stallId === stallId)
  );

  if (!stallId || !stallDetails) return null;

  const handleUpdate = (field: keyof typeof stallDetails, value: any) => {
    dispatch(updateStallDetails({ stallId, changes: { [field]: value } }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-neutral-50 w-[420px] rounded-lg shadow-xl border border-neutral-300">
        {/* Header */}
        <div className="px-4 py-3 border-b border-neutral-300 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-amber-700">
            Stall Details
          </h2>
          <button
            className="text-xs text-neutral-600 hover:text-neutral-800"
            onClick={() => dispatch(closeStallModal())}
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-4 space-y-4">
          {/* Assigned Horse */}
          <div>
            <label className="text-xs font-semibold text-neutral-700">
              Assigned Horse
            </label>
            <input
              type="text"
              value={stallDetails.animalId ?? ""}
              disabled={!canEditLayout}
              onChange={e => handleUpdate("animalId", e.target.value)}
              className="w-full mt-1 px-2 py-1 text-xs border border-neutral-300 rounded disabled:bg-neutral-100"
              placeholder="Horse ID or name"
            />
          </div>

          {/* Medical Notes */}
          <div>
            <label className="text-xs font-semibold text-neutral-700">
              Medical Notes
            </label>
            <textarea
              value={stallDetails.medicalNotes.join("\n")}
              disabled={!canEditLayout}
              onChange={e =>
                handleUpdate("medicalNotes", e.target.value.split("\n"))
              }
              className="w-full mt-1 px-2 py-1 text-xs border border-neutral-300 rounded h-20 disabled:bg-neutral-100"
            />
          </div>

          {/* Feed Schedule */}
          <div>
            <label className="text-xs font-semibold text-neutral-700">
              Feed Schedule
            </label>
            <textarea
              value={stallDetails.feedSchedule.join("\n")}
              disabled={!canEditLayout}
              onChange={e =>
                handleUpdate("feedSchedule", e.target.value.split("\n"))
              }
              className="w-full mt-1 px-2 py-1 text-xs border border-neutral-300 rounded h-20 disabled:bg-neutral-100"
            />
          </div>

          {/* Staff Notes */}
          <div>
            <label className="text-xs font-semibold text-neutral-700">
              Staff Notes
            </label>
            <textarea
              value={stallDetails.staffNotes.join("\n")}
              disabled={!canEditLayout}
              onChange={e =>
                handleUpdate("staffNotes", e.target.value.split("\n"))
              }
              className="w-full mt-1 px-2 py-1 text-xs border border-neutral-300 rounded h-20 disabled:bg-neutral-100"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-neutral-300 flex justify-end">
          <button
            className="px-3 py-1 text-xs rounded bg-amber-600 text-white hover:bg-amber-700"
            onClick={() => dispatch(closeStallModal())}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};