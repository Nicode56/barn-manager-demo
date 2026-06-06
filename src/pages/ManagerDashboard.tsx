import React from "react";
import { Link } from "react-router-dom";
import { animals } from "@/demo-data/animals";
import { clients } from "@/demo-data/clients";
import { maintenanceTasks } from "@/demo-data/maintenance";
import { lessonSlots } from "@/demo-data/lessons";

export const ManagerDashboard: React.FC = () => {
  const totalAnimals = animals.length;
  const totalClients = clients.length;
  const activeMaintenance = maintenanceTasks.filter(t => t.status !== "Completed").length;
  const availableLessons = lessonSlots.filter(s => s.available).length;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Barn Manager Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="demo-card">Animals: {totalAnimals}</div>
        <div className="demo-card">Clients: {totalClients}</div>
        <div className="demo-card">Active Repairs: {activeMaintenance}</div>
        <div className="demo-card">Open Lesson Slots: {availableLessons}</div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/animals" className="demo-card">View All Animals</Link>
        <Link to="/farm-map" className="demo-card">Assign Pastures & Stalls</Link>
        <Link to="/maintenance" className="demo-card">Manage Maintenance Orders</Link>
        <Link to="/lessons" className="demo-card">Set Lesson Schedule</Link>
        <Link to="/health-schedule" className="demo-card">Set Health Appointments</Link>
        <Link to="/coming-soon" className="demo-card">QuickBooks (Coming Soon)</Link>
        <Link to="/coming-soon" className="demo-card">Messaging (Coming Soon)</Link>
      </div>
    </div>
  );
};
