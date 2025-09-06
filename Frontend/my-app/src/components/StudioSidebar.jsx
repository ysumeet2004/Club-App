import React from "react";
import { NavLink } from "react-router-dom";
import "./Studio.css";

function StudioSidebar() {
  return (
    <div className="studio-sidebar">
      <h2 className="studio-logo">Club Studio</h2>
      <nav>
        <NavLink
          to="/studio/club-details"
          className={({ isActive }) =>
            isActive ? "studio-link active" : "studio-link"
          }
        >
          Edit Club Details
        </NavLink>
        <NavLink
          to="/studio/manage-events"
          className={({ isActive }) =>
            isActive ? "studio-link active" : "studio-link"
          }
        >
          Manage Events
        </NavLink>
        <NavLink
          to="/studio/analytics"
          className={({ isActive }) =>
            isActive ? "studio-link active" : "studio-link"
          }
        >
          Analytics
        </NavLink>
      </nav>
    </div>
  );
}

export default StudioSidebar;
