import React from "react";
import { animals } from "@/demo-data/animals";
import { healthEvents } from "@/demo-data/health";

export const AnimalMaintenancePage: React.FC = () => {
  const maintenanceEvents = healthEvents.filter(event =>
    ["Vet check", "Dental cleaning", "Farrier visit"].includes(event.type)
  );

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-3 page-title-banner">Animal Maintenance</h1>
      <p className="text-gray-600 mb-8 max-w-2xl wood-text-box">
        Dedicated horse care tasks live here separately from general farm maintenance. Use this page to track farrier, vet,
        and dental work, plus special care notes that should be relayed to owners.
      </p>

      <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
        <section className="maintenance-card">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-semibold">Upcoming care</h2>
              <p className="text-sm text-slate-600">Horse-specific appointments and follow-up details.</p>
            </div>
            <span className="maintenance-pill">Animal care</span>
          </div>

          <div className="space-y-4">
            {maintenanceEvents.map(event => (
              <div key={event.id} className="maintenance-event-card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold">{event.type}</p>
                    <p className="text-base font-bold text-slate-900">
                      {event.horse}
                    </p>
                    <p className="text-sm font-bold text-slate-700 mt-1">
                      {event.date} · {event.vet}
                    </p>
                  </div>
                  <span className="maintenance-status">{event.type}</span>
                </div>
                <p className="mt-3 text-sm text-slate-800">{event.notes}</p>
                {event.ownerUnavailable && event.relayNotes && (
                  <div className="owner-note-card mt-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-600 mb-2">
                      Owner relay note
                    </p>
                    <p className="text-sm text-slate-900">{event.relayNotes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <aside className="maintenance-card">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Horse care at a glance</h2>
            <p className="text-sm text-slate-600">Next vet and farrier dates for each horse.</p>
          </div>
          <div className="space-y-4">
            {animals.map(animal => (
              <div key={animal.id} className="maintenance-summary-card">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-base font-bold text-slate-900">{animal.name}</p>
                    <p className="text-sm text-slate-600">{animal.breed}</p>
                  </div>
                  <span className="maintenance-meta">{animal.stall}</span>
                </div>
                <p className="text-sm text-slate-700 mt-3">Pasture: {animal.pasture}</p>
                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <div className="font-bold text-slate-900">Vet: {animal.health.vet}</div>
                  <div className="font-bold text-slate-900">Farrier: {animal.health.farrier}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};
