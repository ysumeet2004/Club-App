// src/components/Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({ userRole }) {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-logo">ClubApp</h2>
      <nav className="sidebar-nav">
        <Link to="/profile" className="nav-btn">Profile</Link>
        <Link to="/clubs" className="nav-btn">Clubs</Link>
        <Link to="/events" className="nav-btn">Events</Link>
        <Link to="/myevents" className="nav-btn">My Events</Link>
        {userRole === "club_admin" && (
          <Link to="/studio" className="nav-btn">Studio</Link>
        )}
        <Link to="/login" className="nav-btn logout">Logout</Link>
      </nav>
    </aside>
  );
}

export default Sidebar;
