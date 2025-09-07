// App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Events from "./components/Events";
import Profile from "./components/Profile";
import Clubs from "./components/Clubs";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Studio from "./components/Studio";
import TestEditor from "./components/testEditor";
import ClubCard from './components/ClubCard';
import "./App.css"; // make sure global layout styles are here

function App() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const res = await fetch("http://localhost:5000/profile", {
          method: "GET",
          credentials: "include", // ✅ ensures cookie is sent with request
        });

        if (!res.ok) {
          setUserRole(null);
          return;
        }

        const data = await res.json();
        setUserRole(data.role); // role from backend (student / club_admin / super_admin)
      } catch (e) {
        console.error("Error fetching user profile", e);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes (only if logged in) */}
        <Route
          path="/*"
          element={
            userRole ? (
              <div className="app-layout">
                <Sidebar userRole={userRole} />
                <div className="content">
                  <Routes>
                    {/* Default → Events */}
                    <Route path="/" element={<Navigate to="/events" />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/clubs" element={<ClubCard />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/myevents" element={<h1>My Events Page</h1>} />
                    <Route path="/test-editor/:id" element={<TestEditor />} />

                    {/* Studio → only for club_admin */}
                    {userRole === "club_admin" && (
                      <Route path="/studio/*" element={<Studio />} />
                    )}

                    {/* Catch-all → go home */}
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
