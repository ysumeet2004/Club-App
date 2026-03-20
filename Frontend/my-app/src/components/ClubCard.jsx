import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ClubCard.css";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function ClubCard({ clubName, logoUrl, coverUrl, onClick }) {
  return (
    <div
      className="club-card"
      onClick={onClick}
      tabIndex={0}
      role="button"
      onKeyPress={(e) => {
        if (e.key === "Enter") onClick();
      }}
    >
      <div className="club-card-header">
        <img src={logoUrl} alt={`${clubName} logo`} className="club-logo" />
        <h3 className="club-name">{clubName}</h3>
      </div>
      <div className="club-card-cover">
        <img src={coverUrl} alt={`${clubName} cover`} className="club-cover-image" />
      </div>
      <div className="club-card-footer">
        <button className="view-details">View Details</button>
      </div>
    </div>
  );
}

export default function ClubsPage() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchClubs() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/allClub`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch clubs: ${res.statusText}`);
        }

        const data = await res.json();

        const transformedData = data.map((club) => {
          const logoUrl = club.logo
            ? club.logo.startsWith("http")
              ? club.logo
              : `${API_BASE}${club.logo}`
            : "";

          const coverImageUrl = club.coverImage
            ? club.coverImage.startsWith("http")
              ? club.coverImage
              : `${API_BASE}${club.coverImage}`
            : "";

          return {
            id: club._id || club.id,
            name: club.name,
            logoUrl,
            coverImageUrl,
            ...club,
          };
        });

        setClubs(transformedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchClubs();
  }, []);

  const handleClubClick = (clubId) => {
    navigate(`/test-editor/${clubId}`);
  };

  if (loading) return <div className="loading">Loading clubs...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="clubs-container">
      {clubs.length === 0 ? (
        <div className="no-clubs">No clubs found.</div>
      ) : (
        clubs.map((club) => (
          <ClubCard
            key={club.id}
            clubName={club.name}
            logoUrl={club.logoUrl}
            coverUrl={club.coverImageUrl}
            onClick={() => handleClubClick(club.id)}
          />
        ))
      )}
    </div>
  );
}
