// src/components/Sidebar.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaUser,
  FaUsers,
  FaCalendarAlt,
  FaStar,
  FaDoorOpen,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import "./Sidebar.css";

function Sidebar({ userRole }) {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Toggle Button (Mobile) */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      <aside className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
        <h2 className="sidebar-logo">ClubApp</h2>
        <nav className="sidebar-nav">
          <Link
            to="/profile"
            className={`nav-btn ${
              location.pathname === "/profile" ? "active" : ""
            }`}
          >
            <FaUser className="nav-icon" /> <span>Profile</span>
          </Link>
          <Link
            to="/clubs"
            className={`nav-btn ${
              location.pathname === "/clubs" ? "active" : ""
            }`}
          >
            <FaUsers className="nav-icon" /> <span>Clubs</span>
          </Link>
          <Link
            to="/events"
            className={`nav-btn ${
              location.pathname === "/events" ? "active" : ""
            }`}
          >
            <FaCalendarAlt className="nav-icon" /> <span>Events</span>
          </Link>
          <Link
            to="/myevents"
            className={`nav-btn ${
              location.pathname === "/myevents" ? "active" : ""
            }`}
          >
            <FaStar className="nav-icon" /> <span>My Events</span>
          </Link>
          {userRole === "club_admin" && (
            <Link
              to="/studio"
              className={`nav-btn ${
                location.pathname === "/studio" ? "active" : ""
              }`}
            >
              <FaUsers className="nav-icon" /> <span>Studio</span>
            </Link>
          )}
          <Link to="/login" className="nav-btn logout">
            <FaDoorOpen className="nav-icon" /> <span>Logout</span>
          </Link>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
