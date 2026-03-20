// src/pages/UserChat.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Megaphone, AlertCircle, Calendar } from "lucide-react";

const API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/announcements`;

export default function UserChat() {
  const { eventId } = useParams();
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get(`${API_BASE}/${eventId}`);
        setAnnouncements(res.data);
      } catch (err) {
        console.error("Error fetching announcements:", err);
      }
    };
    fetchAnnouncements();
  }, [eventId]);

  const typeStyles = {
    general: { border: "border-primary", icon: <Megaphone size={24} className="text-primary" />, badge: "primary" },
    event: { border: "border-success", icon: <Calendar size={24} className="text-success" />, badge: "success" },
    urgent: { border: "border-danger", icon: <AlertCircle size={24} className="text-danger" />, badge: "danger" },
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hr ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="py-5" style={{ background: "linear-gradient(180deg,#f8f9fa,#ffffff)" }}>
      <div className="container" style={{ maxWidth: "800px" }}>
        <h1 className="text-center mb-4 fw-bold text-dark">
          <Megaphone className="me-2 text-primary" size={32} />
          Announcements
        </h1>

        {announcements.length === 0 ? (
          <div className="text-center p-5">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4076/4076505.png"
              alt="Empty"
              style={{ width: "100px", opacity: 0.7 }}
            />
            <p className="text-muted mt-3">No announcements yet. Stay tuned!</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {announcements.map((a) => {
              const style = typeStyles[a.type] || typeStyles.general;
              return (
                <div
                  key={a._id}
                  className={`card shadow-sm ${style.border} position-relative`}
                  style={{
                    transition: "transform 0.2s, box-shadow 0.2s",
                    borderLeftWidth: "6px",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "0 3px 8px rgba(0,0,0,0.1)";
                  }}
                >
                  {/* Badge */}
                  <span
                    className={`badge bg-${style.badge} position-absolute`}
                    style={{ top: "12px", right: "12px" }}
                  >
                    {a.type.toUpperCase()}
                  </span>

                  <div className="card-body d-flex align-items-start">
                    <div className="me-3">{style.icon}</div>
                    <div>
                      <h5 className="card-title mb-1 fw-semibold">{a.title}</h5>
                      <p className="card-text small text-secondary">{a.message}</p>
                      <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
                        {timeAgo(a.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
