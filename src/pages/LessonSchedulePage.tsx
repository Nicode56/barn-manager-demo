import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { bookSlotOptimistic, cancelSlotOptimistic, asyncBookSlot, asyncCancelSlot } from "@/store/lessonSlice";
import { toast } from "sonner";

export const LessonSchedulePage: React.FC = () => {
  const slots = useSelector((state: RootState) => state.lessons.slots);
  const isLoading = useSelector((state: RootState) => state.loading.activeRequests > 0);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 page-title-banner">Lesson Scheduling</h1>
      {isLoading && <p className="text-blue-600 mb-4 wood-text-box">Saving lesson…</p>}

      <ul className="space-y-4">
        {slots.map(slot => (
          <li key={slot.id} className="bulletin-item">
            <div>
              {slot.time} —{" "}
              {slot.blocked
                ? `Blocked${slot.blockReason ? ` (${slot.blockReason})` : ""}`
                : slot.available
                ? "Available"
                : "Booked"}
            </div>

            <div className="ml-auto">
              {slot.blocked ? null : slot.available ? (
                <button
                  className="text-blue-600"
                  onClick={() => {
                    dispatch(bookSlotOptimistic(slot.id));
                    dispatch(asyncBookSlot(slot.id));
                    toast.success("Lesson booked!");
                  }}
                >
                  Book
                </button>
              ) : (
                <button
                  className="text-red-600"
                  onClick={() => {
                    dispatch(cancelSlotOptimistic(slot.id));
                    dispatch(asyncCancelSlot(slot.id));
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
