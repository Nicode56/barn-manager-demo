import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";

import {
  markFeedLow,
  clearFeedLow,
  markSupplementLow,
  clearSupplementLow,
  addToFeedOrder
} from "@/store/farmSlice";
import { addSpecialNote } from "@/store/staffSlice";
import {
  blockSlotOptimistic,
  unblockSlotOptimistic,
  asyncBlockSlot,
  asyncUnblockSlot,
  isLessonAvailable,
} from "@/store/lessonSlice";
import { confirmAppointment, isAppointmentPast, groupAppointments } from "@/store/healthSlice";
import { toast } from "sonner";

import { clients } from "@/demo-data/clients";
import { maintenanceTasks } from "@/demo-data/maintenance";

export const ManagerDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const animals = useSelector((state: RootState) => state.farm.animals);
  const locations = useSelector((state: RootState) => state.farm.locations);
  const feedOrder = useSelector((state: RootState) => state.farm.feedOrder);
  // Live Redux-managed slots, not the static demo-data import — this is what
  // LessonSchedulePage actually reads/writes, so the dashboard needs to read
  // the same source or bookings/blocks made elsewhere never show up here.
  const lessonSlots = useSelector((state: RootState) => state.lessons.slots);
  const healthEvents = useSelector((state: RootState) => state.health.events);
  const pendingHealthConfirmations = healthEvents.filter(
    e => isAppointmentPast(e) && !e.confirmed
  );
  const pendingHealthGroups = groupAppointments(pendingHealthConfirmations);
  const [activeTab, setActiveTab] = useState<"Overview" | "Reports" | "Alerts" | "Arena Schedule">("Overview");
  const [zoomPhoto, setZoomPhoto] = useState<string | null>(null);
  const [blockReasons, setBlockReasons] = useState<Record<string, string>>({});

  const handleBlockSlot = (id: string) => {
    const reason = blockReasons[id] ?? "Maintenance";
    dispatch(blockSlotOptimistic({ id, reason }));
    dispatch(asyncBlockSlot({ id, reason }));
  };

  const handleUnblockSlot = (id: string) => {
    dispatch(unblockSlotOptimistic(id));
    dispatch(asyncUnblockSlot(id));
  };

  const handleConfirmAppointment = (id: string) => {
    dispatch(confirmAppointment(id));
    toast.success("Appointment confirmed");
  };

  const totalAnimals = animals.length;
  const totalClients = clients.length;
  const activeMaintenance = maintenanceTasks.filter(t => t.status !== "Completed").length;
  const openLessonSlots = lessonSlots.filter(s => s.available).length;
  const todaysTasks = maintenanceTasks.slice(0, 3);
  const shiftReports = useSelector((state: RootState) => state.staff.shiftReports);
  const archivedShiftReports = useSelector((state: RootState) => state.staff.archivedShiftReports);
  const managerNotifications = useSelector((state: RootState) => state.staff.managerNotifications);

  const lowFeedCount = animals.filter(horse => horse.feed.low).length;
  const lowSupplementCount = animals.reduce(
    (count, horse) => count + horse.supplements.filter(supp => supp.low).length,
    0
  );

  const managerNotes = useSelector((state: RootState) => state.staff.specialNotes);
  const activeManagerNotes = managerNotes
    .filter(note => new Date(note.expireAt).getTime() >= Date.now())
    .sort((a, b) => new Date(a.expireAt).getTime() - new Date(b.expireAt).getTime());

  const [managerNoteMessage, setManagerNoteMessage] = useState("");
  const [managerNoteAnimal, setManagerNoteAnimal] = useState("");
  const [managerNoteExpireAt, setManagerNoteExpireAt] = useState(
    (() => {
      const defaultExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);
      defaultExpire.setHours(15, 0, 0, 0);
      return defaultExpire.toISOString().slice(0, 16);
    })()
  );

  const totalCapacity = locations.reduce((sum, location) => sum + (location.capacity ?? 1), 0);
  const occupiedLocations = animals.filter(a => a.stall || a.pasture).length;
  const capacityUsage = totalCapacity > 0 ? Math.round((occupiedLocations / totalCapacity) * 100) : 0;
  const availableSlots = Math.max(totalCapacity - occupiedLocations, 0);
  const fullLocationCount = locations.filter(location => {
    const assigned = animals.filter(a => a.stall === location.name || a.pasture === location.name).length;
    return assigned >= (location.capacity ?? 1);
  }).length;

  const lowFeedItems = animals
    .filter(horse => horse.feed.low)
    .map(horse => ({
      horseId: horse.id,
      itemType: "feed" as const,
      name: horse.feed.type ?? "Feed",
      productType: horse.feed.type,
      brand: horse.feed.brand,
      quantity: 50
    }));

  const lowSupplementItems = animals.flatMap(horse =>
    horse.supplements
      .filter(supp => supp.low)
      .map(supp => ({
        horseId: horse.id,
        itemType: "supplement" as const,
        name: supp.name,
        productType: supp.type,
        brand: supp.brand,
        quantity: 1
      }))
  );

  const lowOrderItems = [...lowFeedItems, ...lowSupplementItems];
  const pendingAlertCount = lowOrderItems.length;

  const recentNotifications = managerNotifications.slice(-3).reverse();
  const clientRequests = clients.slice(0, 3);
  const lessonPreview = lessonSlots.slice(0, 3);

  const addAllLowItemsToOrder = () => {
    lowOrderItems.forEach(item => dispatch(addToFeedOrder(item)));
  };

  return (
    <div className="p-8 space-y-10">
      <h1 className="text-4xl font-bold text-amber-900 page-title-banner">Manager Dashboard</h1>

      <div className="tab-list">
        {[
          { key: "Overview", label: "Overview" },
          { key: "Reports", label: "Reports" },
          { key: "Alerts", label: "Alerts" },
          { key: "Arena Schedule", label: "Arena Schedule" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`tab-button ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="dashboard-summary-grid" style={{ display: activeTab === "Overview" ? undefined : "none" }}>
        <div className="metric-card">
          <p className="metric-label">Notifications</p>
          <p className="metric-amount">{managerNotifications.length}</p>
          <p className="metric-note">Recent activity and manager alerts</p>
        </div>

        <div className="metric-card">
          <p className="metric-label">Feed / Supplement Alerts</p>
          <p className="metric-amount">{pendingAlertCount}</p>
          <p className="metric-note">{lowFeedCount} feed, {lowSupplementCount} supplements low</p>
        </div>

        <div className="metric-card">
          <p className="metric-label">Capacity Status</p>
          <p className="metric-amount">{occupiedLocations}/{totalCapacity}</p>
          <p className="metric-note">{capacityUsage}% occupied • {availableSlots} open slots</p>
        </div>

        <div className="metric-card">
          <p className="metric-label">Animals & Clients</p>
          <p className="metric-amount">{totalAnimals} / {totalClients}</p>
          <p className="metric-note">{totalAnimals} horses tracked • {totalClients} clients served</p>
        </div>
      </div>

      <section className="space-y-6" style={{ display: activeTab === "Overview" ? undefined : "none" }}>
        <h2 className="text-2xl font-bold text-amber-900 page-title-banner">Notifications</h2>

        {managerNotifications.length === 0 ? (
          <p className="text-gray-600 wood-text-box">No notifications.</p>
        ) : (
          <ul className="space-y-3">
            {recentNotifications.map((note, idx) => (
              <li
                key={idx}
                className="p-3 bg-yellow-50 border border-yellow-600 rounded-md"
              >
                {note}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-6" style={{ display: activeTab === "Overview" ? undefined : "none" }}>
        <h2 className="text-2xl font-bold text-amber-900 page-title-banner">Pending Health Confirmations</h2>

        {pendingHealthGroups.length === 0 ? (
          <p className="text-gray-600 wood-text-box">No completed appointments waiting on confirmation.</p>
        ) : (
          <ul className="space-y-4">
            {pendingHealthGroups.map(group => (
              <li key={group.key} className="request-item space-y-3">
                <div>
                  <strong>{group.type}</strong>
                  <div className="text-sm text-gray-700">
                    {group.date}
                    {group.time ? ` · ${group.time}` : ""}
                    {group.vet ? ` · ${group.vet}` : ""}
                  </div>
                </div>

                <ul className="space-y-2">
                  {group.events.map(appt => (
                    <li
                      key={appt.id}
                      className="flex flex-wrap items-center justify-between gap-3"
                    >
                      <span>
                        {appt.horse}
                        {appt.ownerPresent ? " · Owner present" : ""}
                      </span>
                      <button
                        type="button"
                        className="new-complete-btn px-3 py-2 bg-green-700 hover:bg-green-800 text-white rounded-md shadow-sm"
                        onClick={() => handleConfirmAppointment(appt.id)}
                      >
                        Confirm Animal Seen
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="menu-tab-list" style={{ display: activeTab === "Overview" ? undefined : "none" }}>
        {[
          { label: "Animals", to: "/animals" },
          { label: "Assign Locations", to: "/farm-map" },
          { label: "Maintenance", to: "/maintenance" },
          { label: "Lessons", to: "/lessons" },
          { label: "Health", to: "/health-schedule" },
          { label: "Billing", to: "/billing" },
        ].map(item => (
          <Link key={item.label} to={item.to} className="menu-tab-button">
            {item.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center" style={{ display: activeTab === "Overview" ? undefined : "none" }}>
        <Link
          to="/feed-order"
          className={`feed-order-btn ${feedOrder.length > 0 ? "feed-order-pulse" : ""}`}
        >
          View Feed Order ({feedOrder.length})
        </Link>
      </div>

      <section className="grid gap-6 md:grid-cols-3" style={{ display: activeTab === "Overview" ? undefined : "none" }}>
        <div className="panel">
          <h2 className="panel-title">Quick Alerts</h2>
          <p className="text-gray-700 mb-4">Monitor low inventory and action items from the barn floor.</p>
          <ul className="summary-list">
            <li className="request-item">
              <strong>{lowFeedCount}</strong> horses need feed attention
            </li>
            <li className="request-item">
              <strong>{lowSupplementCount}</strong> supplement items need refill
            </li>
            <li className="request-item">
              <strong>{feedOrder.length}</strong> items waiting in feed order
            </li>
          </ul>
        </div>

        <div className="panel">
          <h2 className="panel-title">Appointment Snapshot</h2>
          <ul className="summary-list">
            {lessonPreview.map((lesson) => (
              <li key={lesson.id} className="request-item">
                <strong>{lesson.time}</strong> — {lesson.client} on {lesson.horse}
              </li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <h2 className="panel-title">Client Requests</h2>
          <ul className="summary-list">
            {clientRequests.map((client) => (
              <li key={client.id} className="request-item">
                <strong>{client.name}</strong> wants a follow-up on their boarding request
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-6" style={{ display: activeTab === "Overview" ? undefined : "none" }}>
        <div className="panel">
          <h2 className="panel-title">Manager Notes</h2>
          <div className="space-y-4">
            <textarea
              rows={3}
              value={managerNoteMessage}
              onChange={e => setManagerNoteMessage(e.target.value)}
              placeholder="Enter a manager note for staff..."
              className="w-full rounded-md border border-amber-300 p-3 text-gray-900"
            />

            <div className="grid gap-3 sm:grid-cols-3">
              <input
                type="text"
                value={managerNoteAnimal}
                onChange={e => setManagerNoteAnimal(e.target.value)}
                placeholder="Animal (optional)"
                className="rounded-md border border-amber-300 p-3 text-gray-900"
              />
              <input
                type="datetime-local"
                value={managerNoteExpireAt}
                onChange={e => setManagerNoteExpireAt(e.target.value)}
                className="rounded-md border border-amber-300 p-3 text-gray-900"
              />
              <button
                type="button"
                className="button"
                onClick={() => {
                  if (!managerNoteMessage.trim() || !managerNoteExpireAt) return;
                  const expireAt = new Date(managerNoteExpireAt).toISOString();
                  dispatch(addSpecialNote({
                    message: managerNoteMessage.trim(),
                    expireAt,
                    animal: managerNoteAnimal.trim() || undefined
                  }));
                  setManagerNoteMessage("");
                  setManagerNoteAnimal("");
                  const nextExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);
                  nextExpire.setHours(15, 0, 0, 0);
                  setManagerNoteExpireAt(nextExpire.toISOString().slice(0, 16));
                }}
              >
                Add Manager Note
              </button>
            </div>

            {activeManagerNotes.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-700">Active notes visible to staff:</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {activeManagerNotes.map(note => (
                    <div
                      key={note.id}
                      className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="text-sm font-semibold text-amber-900">
                          {note.animal ? `For ${note.animal}` : "General Note"}
                        </span>
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                          Expires {new Date(note.expireAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-amber-900 leading-6">{note.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SHIFT REPORTS */}
      <section className="space-y-10" style={{ display: activeTab === "Reports" ? undefined : "none" }}>
        <h2 className="text-2xl font-bold text-amber-900 page-title-banner">Shift Reports</h2>

        {shiftReports.length === 0 ? (
          <p className="text-gray-600 wood-text-box">No shift reports available.</p>
        ) : (
          shiftReports.map(report => (
            <div key={report.id} className="border p-4 rounded-md bg-amber-50 space-y-4">

              {/* Header */}
              <div className="flex justify-between">
                <p className="text-lg font-semibold text-amber-900">
                  {report.shift} Shift — Completed by {report.staffName}
                </p>
                <span className="text-sm text-gray-600">
                  {new Date(report.timestamp).toLocaleString()}
                </span>
              </div>

              {/* Completed Tasks */}
              <div>
                <p className="font-semibold text-amber-800">Completed Tasks:</p>
                {report.completedTasks.length === 0 ? (
                  <p className="text-gray-600">No tasks completed.</p>
                ) : (
                  <ul className="ml-4 list-disc text-amber-900">
                    {report.completedTasks.map(t => (
                      <li key={t.id}>{t.label}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Shift Notes */}
              <div>
                <p className="font-semibold text-amber-800">Shift Notes:</p>
                {report.shiftNotes.length === 0 ? (
                  <p className="text-gray-600">No shift notes added.</p>
                ) : (
                  <ul className="ml-4 list-disc text-amber-900">
                    {report.shiftNotes.map((n, idx) => (
                      <li key={idx}>{n}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <p className="font-semibold text-amber-800 mb-2">Special Notes (Manager Added):</p>
                {report.newNotes.length === 0 ? (
                  <p className="text-gray-600">No special notes.</p>
                ) : (
                  <div className="space-y-3">
                    {report.newNotes.map(n => (
                      <div
                        key={n.id}
                        className="p-3 bg-yellow-50 border border-yellow-600 rounded-md shadow-sm text-amber-900"
                      >
                        {n.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Low Feed */}
              <div>
                <p className="font-semibold text-amber-800">Low Feed & Supplements:</p>
                {report.lowFeed.length === 0 ? (
                  <p className="text-gray-600">None marked low.</p>
                ) : (
                  <div className="space-y-4">
                    <button
                      type="button"
                      className="feed-order-btn"
                      onClick={addAllLowItemsToOrder}
                    >
                      Add all low items to order ({lowOrderItems.length})
                    </button>
                    <ul className="space-y-3">
                      {report.lowFeed.map(item => (
                        <li key={item.id} className="text-red-700 font-semibold">
                          {item.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Photos */}
              {report.shiftPhotos.length > 0 && (
                <div className="flex flex-col items-center">
                  <p className="font-semibold text-amber-800 mb-2">Photos:</p>
                  <div className="mx-auto" style={{ width: "50vw" }}>
                    {report.shiftPhotos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt="Shift attachment"
                        onClick={() => setZoomPhoto(photo)}
                        className="w-full rounded-md border border-amber-300 shadow mb-4 cursor-pointer object-cover h-[20rem]"
                        style={{ maxWidth: "60%", maxHeight: "40%"}}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </section>

      {zoomPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setZoomPhoto(null)}
        >
          <img
            src={zoomPhoto}
            alt="Zoomed shift attachment"
            className="max-h-[85vh] max-w-[85vw] rounded-2xl border border-white shadow-2xl object-contain"
          />
        </div>
      )}

      {/* ARCHIVED REPORTS */}
      <section className="space-y-10" style={{ display: activeTab === "Reports" ? undefined : "none" }}>
        <h2 className="text-2xl font-bold text-amber-900 page-title-banner">Archived Reports</h2>

        {archivedShiftReports.length === 0 ? (
          <p className="text-gray-600 wood-text-box">No archived reports.</p>
        ) : (
          archivedShiftReports.map(report => (
            <div key={report.id} className="border p-4 rounded-md bg-gray-100 space-y-2">
              <p className="font-semibold text-gray-800">
                {report.shift} Shift — {report.staffName}
              </p>
              <p className="text-sm text-gray-600">
                {new Date(report.timestamp).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </section>

      {/* ARENA SCHEDULE */}
      <section className="space-y-6" style={{ display: activeTab === "Arena Schedule" ? undefined : "none" }}>
        <h2 className="text-2xl font-bold text-amber-900 page-title-banner">Arena Schedule</h2>
        <p className="text-gray-700 wood-text-box wood-text-box--full">
          Review the lesson schedule, see which times are open or filled, and block out arena
          time for maintenance or personal use.
        </p>

        <ul className="space-y-3">
          {lessonSlots.map(slot => {
            const isGroup = slot.format === "group";
            const bookedCount = slot.bookedCount ?? 0;
            const capacity = slot.capacity ?? 0;
            // Only offer Block on a slot with zero bookings - a group lesson
            // that already has riders in it shouldn't be blocked out from here.
            const isEmpty = !slot.blocked && (isGroup ? bookedCount === 0 : slot.available);

            return (
              <li key={slot.id} className="request-item flex flex-wrap items-center justify-between gap-3">
                <div>
                  <strong>{slot.time}</strong>{" "}
                  {slot.blocked ? (
                    <span className="status">
                      Blocked{slot.blockReason ? ` — ${slot.blockReason}` : ""}
                    </span>
                  ) : isGroup ? (
                    <span className={isLessonAvailable(slot) ? "status-complete" : "status"}>
                      {bookedCount}/{capacity} booked (Group){isLessonAvailable(slot) ? "" : " · Full"}
                    </span>
                  ) : slot.available ? (
                    <span className="status-complete">Open</span>
                  ) : (
                    <span className="status">Booked — {slot.client} on {slot.horse}</span>
                  )}
                </div>

                {isEmpty && (
                  <div className="flex items-center gap-2">
                    <select
                      value={blockReasons[slot.id] ?? "Maintenance"}
                      onChange={(e) =>
                        setBlockReasons(prev => ({ ...prev, [slot.id]: e.target.value }))
                      }
                      className="rounded-md border border-amber-300 p-2 text-sm text-gray-900"
                    >
                      <option value="Maintenance">Maintenance</option>
                      <option value="Personal Use">Personal Use</option>
                      <option value="Other">Other</option>
                    </select>
                    <button
                      type="button"
                      className="alert-btn mark"
                      onClick={() => handleBlockSlot(slot.id)}
                    >
                      Block
                    </button>
                  </div>
                )}

                {slot.blocked && (
                  <button
                    type="button"
                    className="alert-btn clear"
                    onClick={() => handleUnblockSlot(slot.id)}
                  >
                    Unblock
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>



      {/* ---------------------------------------------------------
         MOBILE COLLAPSIBLE ALERTS (ONLY ON MOBILE)
      --------------------------------------------------------- */}
      <div className="md:hidden space-y-6" style={{ display: activeTab === "Alerts" ? undefined : "none" }}>

        {/* Feed Alerts Accordion */}
        <details className="panel">
          <summary className="panel-title cursor-pointer">Feed Alerts</summary>
          <div className="space-y-4 mt-4">
            {lowFeedItems.length > 0 && (
              <button
                type="button"
                className="feed-order-btn"
                onClick={addAllLowItemsToOrder}
              >
                Add all low feed/supplement items to order ({lowOrderItems.length})
              </button>
            )}
            <div className="space-y-3">
              {animals.map(horse => (
                <div
                  key={horse.id}
                  className={`alert-row ${horse.feed.low ? "alert-low" : ""}`}
                >
                  <div>
                    <strong>{horse.name}</strong> — {horse.feed.level} lbs
                    {horse.feed.low && <span className="alert-tag">LOW</span>}
                  </div>

                  <div className="flex gap-3">
                    {!horse.feed.low && (
                      <button
                        className="alert-btn mark"
                        onClick={() => dispatch(markFeedLow({ horseId: horse.id }))}
                      >
                        Mark Low
                      </button>
                    )}

                    {horse.feed.low && (
                      <>
                        <button
                          className="alert-btn clear"
                          onClick={() => dispatch(clearFeedLow({ horseId: horse.id }))}
                        >
                          Clear
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </details>

        {/* Supplement Alerts Accordion */}
        <details className="panel">
          <summary className="panel-title cursor-pointer">Supplement Alerts</summary>
          <div className="space-y-3 mt-4">
            {animals.map(horse =>
              horse.supplements.map(supp => (
                <div
                  key={`${horse.id}-${supp.name}`}
                  className={`alert-row ${supp.low ? "alert-low" : ""}`}
                >
                  <div>
                    <strong>{horse.name}</strong> — {supp.name} ({supp.level})
                    {supp.low && <span className="alert-tag">LOW</span>}
                  </div>

                  <div className="flex gap-3">
                    {!supp.low && (
                      <button
                        className="alert-btn mark"
                        onClick={() =>
                          dispatch(
                            markSupplementLow({
                              horseId: horse.id,
                              supplementName: supp.name
                            })
                          )
                        }
                      >
                        Mark Low
                      </button>
                    )}

                    {supp.low && (
                      <button
                        className="alert-btn clear"
                        onClick={() =>
                          dispatch(
                            clearSupplementLow({
                              horseId: horse.id,
                              supplementName: supp.name
                            })
                          )
                        }
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </details>

      </div>

      {/* ---------------------------------------------------------
         DESKTOP FULL ALERT LISTS (ONLY ON DESKTOP)
      --------------------------------------------------------- */}
      <div className="hidden md:block space-y-10" style={{ display: activeTab === "Alerts" ? undefined : "none" }}>

        {/* Feed Alerts Panel */}
        <div className="panel">
          <h2 className="panel-title">Feed Alerts</h2>
          <div className="space-y-3">
            {animals.map(horse => (
              <div
                key={horse.id}
                className={`alert-row ${horse.feed.low ? "alert-low" : ""}`}
              >
                <div>
                  <strong>{horse.name}</strong> — {horse.feed.level} lbs
                  {horse.feed.low && <span className="alert-tag">LOW</span>}
                </div>

                <div className="flex gap-3">
                  {!horse.feed.low && (
                    <button
                      className="alert-btn mark"
                      onClick={() => dispatch(markFeedLow({ horseId: horse.id }))}
                    >
                      Mark Low
                    </button>
                  )}

                  {horse.feed.low && (
                    <>
                      <button
                        className="alert-btn clear"
                        onClick={() => dispatch(clearFeedLow({ horseId: horse.id }))}
                      >
                        Clear
                      </button>

                      <button
                        className="alert-btn order"
                        onClick={() =>
                          dispatch(
                            addToFeedOrder({
                              horseId: horse.id,
                              itemType: "feed",
                              name: horse.feed.type ?? "Feed",
                              productType: horse.feed.type,
                              brand: horse.feed.brand,
                              quantity: 50
                            })
                          )
                        }
                      >
                        Add to Order
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supplement Alerts Panel */}
        <div className="panel">
          <h2 className="panel-title">Supplement Alerts</h2>
          <div className="space-y-3">
            {animals.map(horse =>
              horse.supplements.map(supp => (
                <div
                  key={`${horse.id}-${supp.name}`}
                  className={`alert-row ${supp.low ? "alert-low" : ""}`}
                >
                  <div>
                    <strong>{horse.name}</strong> — {supp.name} ({supp.level})
                    {supp.low && <span className="alert-tag">LOW</span>}
                  </div>

                  <div className="flex gap-3">
                    {!supp.low && (
                      <button
                        className="alert-btn mark"
                        onClick={() =>
                          dispatch(
                            markSupplementLow({
                              horseId: horse.id,
                              supplementName: supp.name
                            })
                          )
                        }
                      >
                        Mark Low
                      </button>
                    )}

                    {supp.low && (
                      <>
                        <button
                          className="alert-btn clear"
                          onClick={() =>
                            dispatch(
                              clearSupplementLow({
                                horseId: horse.id,
                                supplementName: supp.name
                              })
                            )
                          }
                        >
                          Clear
                        </button>

                          <button
                            className="alert-btn order"
                            onClick={() =>
                              dispatch(
                                addToFeedOrder({
                                  horseId: horse.id,
                                  itemType: "supplement",
                                  name: supp.name,
                                  productType: supp.type,
                                  brand: supp.brand,
                                  quantity: 1
                                })
                              )
                            }
                          >
                            Add to Order
                          </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* MAINTENANCE & LESSON SNAPSHOT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ display: activeTab === "Overview" ? undefined : "none" }}>
        <div className="panel">
          <h2 className="panel-title">Upcoming Maintenance</h2>
          <ul className="space-y-3">
            {todaysTasks.map(task => (
              <li key={task.id} className="bulletin-item">
                <strong>{task.title}</strong> — {task.assignedTo}
                <div className="text-sm text-gray-700">Due: {task.dueDate}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <h2 className="panel-title">Lesson Snapshot</h2>
          <p className="text-sm text-gray-700">
            {lessonPreview.length} upcoming lesson slots, {openLessonSlots} still available
          </p>
          <ul className="summary-list mt-4">
            {lessonPreview.map(lesson => (
              <li key={lesson.id} className="request-item">
                <strong>{lesson.time}</strong> — {lesson.client} on {lesson.horse}
              </li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  );
};


