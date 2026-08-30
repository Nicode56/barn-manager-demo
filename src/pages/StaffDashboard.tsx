import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import {
  markRoutineTaskComplete,
  markFeedLow,
  completeShift,
  addShiftNote,
  addShiftPhoto,
  setCurrentStaffName
} from "@/store/staffSlice";
import { useDemoAuth } from "@/contexts/DemoAuthContext";
import { NotesField } from "@/components/NotesField";
import { NoteCard } from "@/components/NoteCard";

export const StaffDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useDemoAuth();

  const staffName = user?.name || "Unknown Staff";

  useEffect(() => {
    dispatch(setCurrentStaffName(staffName));
  }, [staffName]);

  const now = new Date();
  const hour = now.getHours();
  const isAM = hour < 12;
  const currentShift = isAM ? "AM" : "PM";

  const routine = useSelector((state: RootState) => state.staff.routine);
  const notes = useSelector((state: RootState) => state.staff.specialNotes);
  const shiftNotes = useSelector((state: RootState) => state.staff.shiftNotes);
  const shiftPhotos = useSelector((state: RootState) => state.staff.shiftPhotos);
  const feedLevels = useSelector((state: RootState) => state.staff.feedLevels);
  const assignedAnimals = useSelector((state: RootState) => state.staff.assignedAnimals);
  const maintenanceTasks = useSelector((state: RootState) => state.staff.maintenanceTasks);
  const lessons = useSelector((state: RootState) => state.staff.upcomingLessons);
  const animals = useSelector((state: RootState) => state.farm.animals);

  const lowFeedCount = animals.filter(horse => horse.feed.low).length;
  const lowSupplementCount = animals.reduce(
    (count, horse) => count + horse.supplements.filter(supp => supp.low).length,
    0
  );

  const [newShiftNote, setNewShiftNote] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const activeManagerNotes = notes
    .filter(note => new Date(note.expireAt).getTime() >= Date.now())
    .sort((a, b) => new Date(a.expireAt).getTime() - new Date(b.expireAt).getTime());

  const visibleRoutine = routine.filter(t => t.shift === currentShift);

  return (
    <div className="p-8 space-y-10">
      <h1 className="text-3xl font-bold text-amber-900 page-title-banner">Staff Daily Dashboard</h1>

      <h2 className="text-2xl font-semibold text-amber-800 mb-4 page-title-banner">
        {currentShift} Shift Checklist
      </h2>

      {activeManagerNotes.length > 0 && (
        <section className="panel">
          <h2 className="panel-title">Manager Notes</h2>
          <div className="space-y-3">
            {activeManagerNotes.map(note => (
              <article key={note.id} className="staff-note-card">
                <div className="staff-note-card__meta">
                  <span className="staff-note-card__label">
                    {note.animal ? `For ${note.animal}` : "General note"}
                  </span>
                  <span className="staff-note-card__badge">
                    Expires {new Date(note.expireAt).toLocaleString()}
                  </span>
                </div>
                <p>{note.message}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* DAILY ROUTINE */}
      <section>
        <ul className="space-y-2">
          {visibleRoutine.map(task => (
            <li
              key={task.id}
              className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-300 rounded-md"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => dispatch(markRoutineTaskComplete(task.id))}
                className="h-5 w-5 accent-amber-700"
              />
              <span className="text-amber-900">{task.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="p-6 bg-amber-50 border border-amber-300 rounded-md">
        <h2 className="text-2xl font-semibold text-amber-800 mb-3 page-title-banner">Feed & Supplement Review</h2>
        <p className="text-gray-700 mb-4">
          Review the animal list and flag low feed or supplements before you submit the shift report.
          These flags become visible on the manager dashboard once the shift is completed.
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-gray-700">
            {lowFeedCount} animals with low feed · {lowSupplementCount} supplement alerts
          </div>
          <Link
            to="/animals"
            state={{ from: "checklist" }}
            className="
              review-animals-link
              inline-flex items-center justify-center
              px-4 py-2
              bg-amber-700
              hover:bg-amber-800
              text-white
              rounded-md
              font-semibold
              text-sm
              shadow-md
              transition-colors duration-150
              focus:outline-none
              "
            >
              Review Animals
          </Link>
        </div>
      </section>

      {/* SHIFT NOTES */}
      <section>
        <h2 className="text-2xl font-semibold text-amber-800 mb-4 page-title-banner">Shift Notes</h2>
        
              
          <NotesField
          value={newShiftNote}
          onChange={setNewShiftNote}
          placeholder="Add a note about your shift..."
          rows={4}
        />
        

        <button
          onClick={() => {
            if (newShiftNote.trim().length > 0) {
              dispatch(addShiftNote(newShiftNote));
              setNewShiftNote("");
            }
          }}
          className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-md"
        >
          Add Note
        </button>
      

        {shiftNotes.length > 0 && (
          <div className="space-y-3 mt-4">
            {shiftNotes.map((note, idx) => (
              <NoteCard key={idx}>{note}</NoteCard>
            ))}
          </div>
        )}
      </section>   

      {/* SHIFT PHOTOS */}
      <section>
        <h2 className="text-2xl font-semibold text-amber-800 mb-4 page-title-banner">Shift Photos</h2>

        <div>
          <input
            id="shift-photo-input"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              const reader = new FileReader();
              reader.onload = () => {
                dispatch(addShiftPhoto(reader.result as string));
              };
              reader.readAsDataURL(file);
            }}
            style={{ display: "none" }}
          />
          
            <label
              htmlFor="shift-photo-input"
              className="inline-block mb-3 px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-md font-semibold text-sm cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              Choose File
            </label>
          
        </div>

        {shiftPhotos.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 max-w-3xl">
            {shiftPhotos.map((photo, idx) => (
              <img
                key={idx}
                src={photo}
                alt="Shift attachment"
                onClick={() => setSelectedPhoto(photo)}
                className="rounded-md border border-amber-300 shadow object-cover cursor-pointer"
                style={{ width: 240, height: 180 }}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-600 wood-text-box">No photo has been added yet.</p>
        )}

        {selectedPhoto && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <img
              src={selectedPhoto}
              alt="Selected shift attachment"
              className="max-h-[85vh] max-w-[85vw] rounded-2xl border border-white shadow-2xl object-contain"
            />
          </div>
        )}
      </section>

      {/* COMPLETE SHIFT BUTTON */}
      <div>
        <button
          onClick={() => dispatch(completeShift())}
          className="new-complete-btn px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-md shadow-lg w-full"
        >
          Complete Shift
        </button>
      </div>
    </div>
  );
};



