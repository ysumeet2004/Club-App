import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import StudioSidebar from "./StudioSidebar";
import EditClub from "./EditClub";
import ClubEditor from "./ClubEditor";
function Studio() {
  return (
    <div className="studio-container">
      <StudioSidebar />
      <div className="studio-main">
        <Routes>
          <Route path="/" element={<Navigate to="/studio/club-details" />} />
          <Route path="/club-details" element={<EditClub />} />
          <Route path="editor/:id" element={<ClubEditor />} />
          <Route path="/manage-events" element={<h2>Manage Events (Coming Soon)</h2>} />
          <Route path="/analytics" element={<h2>Analytics (Coming Soon)</h2>} />
        </Routes>
      </div>
    </div>
  );
}

export default Studio;
