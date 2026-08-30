import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useDemoAuth } from "@/contexts/DemoAuthContext";

export const Navigation: React.FC = () => {
  const { user } = useDemoAuth();
  const location = useLocation();

  const role = user?.role;

  const navClass = (path: string) =>
    location.pathname.startsWith(path) ? "nav-link active" : "nav-link";

  return (
    <nav className="nav-bar">
      <Link to="/" className="brand">
        Farm Flow
      </Link>

      <div className="nav-links">
        <Link to="/farm-map" className={navClass("/farm-map")}>
          Farm Map
        </Link>
        <Link to="/animals" className={navClass("/animals")}>
          Animals
        </Link>

        {role === "manager" && (
          <>
            <Link to="/demo/manager/dashboard" className={navClass("/demo/manager")}>
              Dashboard
            </Link>
            <Link to="/maintenance" className={navClass("/maintenance")}>
              Maintenance
            </Link>
            <Link to="/lessons" className={navClass("/lessons")}>
              Lessons
            </Link>
            <Link to="/health-schedule" className={navClass("/health-schedule")}>
              Health
            </Link>
          </>
        )}

        {role === "staff" && (
          <>
            <Link to="/demo/staff/dashboard" className={navClass("/demo/staff")}>
              Dashboard
            </Link>
            <Link to="/maintenance" className={navClass("/maintenance")}>
              Maintenance
            </Link>
            <Link to="/lessons" className={navClass("/lessons")}>
              Lessons
            </Link>
          </>
        )}

        {role === "client" && (
          <>
            <Link to="/demo/client/dashboard" className={navClass("/demo/client")}>
              Dashboard
            </Link>
            <Link to="/lessons" className={navClass("/lessons")}>
              Lessons
            </Link>
            <Link to="/health-schedule" className={navClass("/health-schedule")}>
              Health
            </Link>
          </>
        )}

        {!role && (
          <Link to="/demo/manager/dashboard" className={navClass("/demo/manager")}>
            Demo Dashboard
          </Link>
        )}

        <Link to="/coming-soon" className={navClass("/coming-soon")}>
          Coming Soon
        </Link>

        <span className="user-pill">{user ? user.name : "Guest"}</span>
      </div>
    </nav>
  );
};
