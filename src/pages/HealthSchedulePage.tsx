import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import {
  addAppointmentOptimistic,
  addAppointmentsOptimistic,
  asyncAddAppointment,
  asyncAddAppointments,
  isAppointmentPast,
  groupAppointments,
} from "@/store/healthSlice";
import { HealthAppointmentType, HealthEvent } from "@/demo-data/health";
import { toast } from "sonner";
import { useDemoAuth } from "@/contexts/DemoAuthContext";

const APPOINTMENT_TYPES: { type: HealthAppointmentType; label: string }[] = [
  { type: "Vet check", label: "Add Vet Appointment" },
  { type: "Dental cleaning", label: "Add Dentist Appointment" },
  { type: "Farrier visit", label: "Add Farrier Appointment" },
  { type: "Chiropractor", label: "Add Chiropractor Appointment" },
];

export const HealthSchedulePage: React.FC = () => {
  const events = useSelector((state: RootState) => state.health.events);
  const allAnimals = useSelector((state: RootState) => state.farm.animals);
  const isLoading = useSelector((state: RootState) => state.loading.activeRequests > 0);
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useDemoAuth();

  // Only managers can schedule appointments for any animal on the farm;
  // staff and clients can only schedule for the animal(s) they own.
  const animals =
    user?.role === "manager"
      ? allAnimals
      : allAnimals.filter(a => a.ownerId === user?.clientId);

  const [addingType, setAddingType] = useState<HealthAppointmentType | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [providerName, setProviderName] = useState("");
  const [animalId, setAnimalId] = useState("");

  // Farrier visits see a whole list of animals in one session, so they get a
  // multi-select checklist instead of the single-animal dropdown.
  const isFarrier = addingType === "Farrier visit";
  const [farrierSelected, setFarrierSelected] = useState<Record<number, boolean>>({});
  const [ownerPresent, setOwnerPresent] = useState<Record<number, boolean>>({});
  const selectedFarrierCount = Object.values(farrierSelected).filter(Boolean).length;

  const activeEvents = events.filter(e => !isAppointmentPast(e));
  const activeGroups = groupAppointments(activeEvents);

  const closeModal = () => {
    setAddingType(null);
    setDate("");
    setTime("");
    setProviderName("");
    setAnimalId("");
    setFarrierSelected({});
    setOwnerPresent({});
  };

  const toggleFarrierAnimal = (id: number) => {
    setFarrierSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleOwnerPresent = (id: number) => {
    setOwnerPresent(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = () => {
    if (!addingType || !date || !time) return;

    if (isFarrier) {
      const selectedAnimals = animals.filter(a => farrierSelected[a.id]);
      if (selectedAnimals.length === 0) return;

      // Owner-present animals are worked to the front of the farrier's list;
      // relative order within each group follows the order animals appear
      // in the list, matching how the farrier would actually go down it.
      const ordered = [
        ...selectedAnimals.filter(a => ownerPresent[a.id]),
        ...selectedAnimals.filter(a => !ownerPresent[a.id]),
      ];

      const newAppointments: HealthEvent[] = ordered.map(animal => ({
        id: crypto.randomUUID(),
        type: "Farrier visit",
        date,
        time,
        horse: animal.name,
        animalId: animal.id,
        vet: providerName.trim() || undefined,
        ownerPresent: !!ownerPresent[animal.id],
      }));

      dispatch(addAppointmentsOptimistic(newAppointments));
      dispatch(asyncAddAppointments(newAppointments));
      toast.success(
        `${newAppointments.length} farrier appointment${newAppointments.length > 1 ? "s" : ""} added`
      );
      closeModal();
      return;
    }

    if (!animalId) return;
    const animal = animals.find(a => a.id === Number(animalId));
    if (!animal) return;

    const newAppointment: HealthEvent = {
      id: crypto.randomUUID(),
      type: addingType,
      date,
      time,
      horse: animal.name,
      animalId: animal.id,
      vet: providerName.trim() || undefined,
    };

    dispatch(addAppointmentOptimistic(newAppointment));
    dispatch(asyncAddAppointment(newAppointment));
    toast.success("Appointment added");
    closeModal();
  };

  const canSave = isFarrier
    ? Boolean(date && time && selectedFarrierCount > 0)
    : Boolean(date && time && animalId);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 page-title-banner">Health & Maintenance Schedule</h1>
      {isLoading && <p className="text-blue-600 mb-4 wood-text-box">Adding appointment…</p>}

      <div className="flex flex-wrap gap-3 mb-6">
        {APPOINTMENT_TYPES.map(({ type, label }) => (
          <button
            key={type}
            className="text-stone-600 font-semibold no-underline"
            onClick={() => setAddingType(type)}
          >
            {label}
          </button>
        ))}
      </div>

      <ul className="space-y-4">
        {activeGroups.map(group => {
          const isSingle = group.events.length === 1;
          return (
            <li key={group.key} className="bulletin-item">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold">{group.type}</p>
                  <p className="text-md text-slate-900">
                    {group.date}
                    {group.time ? ` · ${group.time}` : ""}
                    {group.vet ? ` · ${group.vet}` : ""}
                    {isSingle
                      ? ` · ${group.events[0].horse}${group.events[0].ownerPresent ? " · Owner present" : ""}`
                      : ""}
                  </p>
                </div>
              </div>

              {!isSingle && (
                <ul className="mt-2 ml-4 space-y-1 list-disc">
                  {group.events.map(e => (
                    <li key={e.id} className="text-sm text-slate-800">
                      {e.horse}
                      {e.ownerPresent ? " · Owner present" : ""}
                    </li>
                  ))}
                </ul>
              )}

              {group.events.map(e => (
                <React.Fragment key={e.id}>
                  {e.notes && <p className="mt-3 text-sm text-gray-700">{e.notes}</p>}

                  {e.ownerUnavailable && e.relayNotes && (
                    <div className="owner-note-card mt-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-600 mb-2">
                        Owner relay notes
                      </p>
                      <p className="text-md text-slate-900">{e.relayNotes}</p>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </li>
          );
        })}
      </ul>

      {addingType && (
        <div className="fixed inset-0 z-[1100] bg-black/40 flex items-start justify-center p-4 pt-10 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6 space-y-4">
            <h2 className="text-2xl font-bold text-amber-900">
              {APPOINTMENT_TYPES.find(t => t.type === addingType)?.label}
            </h2>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full rounded-md border border-amber-300 p-3 text-gray-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Time</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full rounded-md border border-amber-300 p-3 text-gray-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">
                Provider Name <span className="font-normal text-gray-500">(if known)</span>
              </label>
              <input
                type="text"
                value={providerName}
                onChange={e => setProviderName(e.target.value)}
                placeholder="e.g. Dr. Ellis"
                className="w-full rounded-md border border-amber-300 p-3 text-gray-900"
              />
            </div>

            {isFarrier ? (
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Animals ({selectedFarrierCount} selected)
                </label>
                <p className="text-xs text-gray-500">
                  Check each animal the farrier will see. Owner-present animals move to the
                  front of the list.
                </p>
                <div className="max-h-56 overflow-y-auto space-y-1 border border-amber-200 rounded-md p-2">
                  {animals.map(a => (
                    <div key={a.id} className="flex items-center justify-between gap-3 py-1">
                      <label className="flex items-center gap-2 text-sm text-gray-800">
                        <input
                          type="checkbox"
                          checked={!!farrierSelected[a.id]}
                          onChange={() => toggleFarrierAnimal(a.id)}
                        />
                        {a.name}
                      </label>
                      {farrierSelected[a.id] && (
                        <label className="flex items-center gap-2 text-xs text-gray-600">
                          <input
                            type="checkbox"
                            checked={!!ownerPresent[a.id]}
                            onChange={() => toggleOwnerPresent(a.id)}
                          />
                          Owner present
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Animal</label>
                <select
                  value={animalId}
                  onChange={e => setAnimalId(e.target.value)}
                  className="w-full rounded-md border border-amber-300 p-3 text-gray-900"
                >
                  <option value="">Select an animal…</option>
                  {animals.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={closeModal} className="px-4 py-2 bg-gray-300 rounded-md">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!canSave}
                className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-[#422f22] rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
