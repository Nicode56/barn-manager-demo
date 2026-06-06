import React from "react";
import { Link } from "react-router-dom";

export const DemoHome: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Barn Manager Demo</h1>

      <p className="text-lg mb-4">
        Explore the app as a Barn Manager, Staff Member, or Client.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        <Link to="/demo/manager" className="demo-card">Manager Demo</Link>
        <Link to="/demo/staff" className="demo-card">Staff Demo</Link>
        <Link to="/demo/client" className="demo-card">Client Demo</Link>
      </div>

      <h2 className="text-2xl font-semibold mt-12 mb-4">Farm Bulletin Board</h2>

      <div className="space-y-4">
        <Link to="/lessons" className="bulletin-item">Upcoming Lessons</Link>
        <Link to="/health-schedule" className="bulletin-item">Health & Maintenance Schedule</Link>
        <Link to="/maintenance" className="bulletin-item">Farm Repairs & Improvements</Link>
        <Link to="/animals" className="bulletin-item">View Horses & Profiles</Link>
        <Link to="/coming-soon" className="bulletin-item">Local Events & Clinics</Link>
      </div>
    </div>
  );
};