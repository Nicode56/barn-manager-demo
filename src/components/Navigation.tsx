import React from "react";
import { Link } from "react-router-dom";
import { useDemoAuth } from "@/contexts/DemoAuthContext";

export const Navigation: React.FC = () => {
  const { user } = useDemoAuth();

  return (
    <nav className="w-full western-nav border-b p-4 flex justify-between">
      <Link to="/" className="font-bold text-xl western-title">Barn Manager Demo</Link>

      <div className="flex gap-4 western-nav-links">
        <Link to="/">Home</Link>
        <Link to="/animals">Animals</Link>
        <Link to="/lessons">Lessons</Link>
        <Link to="/health-schedule">Health</Link>
        <Link to="/maintenance">Maintenance</Link>
        <Link to="/farm-map">Farm Map</Link>
        <Link to="/coming-soon">Coming Soon</Link>

        {user && (
          <span className="ml-4 font-semibold western-user-name">
            {user.name}
          </span>
        )}
      </div>
    </nav>
  );
};