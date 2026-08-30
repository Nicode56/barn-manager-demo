import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export const ManagerShiftReports: React.FC = () => {
  const shiftReports = useSelector((state: RootState) => state.staff.shiftReports);

  return (
    <section className="p-8 space-y-8">
      <h2 className="text-3xl font-bold text-amber-900">Shift Reports</h2>

      {shiftReports.length === 0 ? (
        <p className="text-gray-600">No completed shifts yet.</p>
      ) : (
        <div className="space-y-6">
          {shiftReports.map(report => (
            <div
              key={report.id}
              className="p-6 bg-amber-50 border border-amber-300 rounded-lg shadow-md"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold text-amber-800">
                  {report.shift} Shift
                </h3>
                <span className="text-sm text-gray-700">
                  {new Date(report.timestamp).toLocaleString()}
                </span>
              </div>

              {/* Completed Tasks */}
              <div className="mb-4">
                <h4 className="text-xl font-semibold text-amber-900 mb-2">
                  Completed Tasks
                </h4>
                {report.completedTasks.length === 0 ? (
                  <p className="text-gray-600">No tasks completed.</p>
                ) : (
                  <ul className="ml-4 list-disc text-amber-900">
                    {report.completedTasks.map(task => (
                      <li key={task.id}>{task.label}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Shift Notes */}
              <div className="mb-4">
                <h4 className="text-xl font-semibold text-amber-900 mb-2">
                  Shift Notes
                </h4>
                {report.shiftNotes.length === 0 ? (
                  <p className="text-gray-600">No shift notes added.</p>
                ) : (
                  <ul className="ml-4 list-disc text-amber-900">
                    {report.shiftNotes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Special Notes */}
              <div className="mb-4">
                <h4 className="text-xl font-semibold text-amber-900 mb-2">
                  Special Notes (Manager Added)
                </h4>
                {report.newNotes.length === 0 ? (
                  <p className="text-gray-600">No special notes.</p>
                ) : (
                  <ul className="ml-4 list-disc text-amber-900">
                    {report.newNotes.map(note => (
                      <li key={note.id}>{note.message}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Low Feed / Supplements */}
              <div>
                <h4 className="text-xl font-semibold text-amber-900 mb-2">
                  Low Feed & Supplements
                </h4>
                {report.lowFeed.length === 0 ? (
                  <p className="text-gray-600">No low feed or supplements.</p>
                ) : (
                  <ul className="ml-4 list-disc text-red-700 font-semibold">
                    {report.lowFeed.map(item => (
                      <li key={item.id}>{item.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
