import React, { useEffect, useState } from "react";
import "./Profile.css";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/profile`, {
      method: "GET",
      credentials: "include", // 👈 send cookies
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error("Error fetching profile:", err));
  }, []);

  if (!user) {
    return <p style={{ color: "#fff" }}>Loading profile...</p>;
  }

  return (
    <div className="profile-container">
      <h2 className="profile-title">Profile</h2>

      {/* User Info Section */}
      <div className="profile-info">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Account Type:</strong> {user.role}</p>
      </div>

      {/* Stats Section */}
      <div className="profile-stats">
        <div className="stat-card">
          <h3>{user.participationCount || 0}</h3>
          <p>Events Participated</p>
        </div>
        <div className="stat-card">
          <h3>{user.eventsWon || 0}</h3>
          <p>Events Won</p>
        </div>
        <div className="stat-card">
          <h3>{user.clubsJoined || 0}</h3>
          <p>Clubs Joined</p>
        </div>
      </div>

      {/* Edit Button */}
      <button className="edit-btn">Edit Profile</button>
    </div>
  );
}

export default Profile;
