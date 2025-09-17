import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import "./ManageEvent.css"; // Import styles

// Event Card Component
function EventCard({ event, onClick }) {
  const { coverImage, title, visibility, startDate, endDate, participantsCount, status } = event;

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const clickable = status === "upcoming" || status === "active";

  return (
    <div
      className={`event-card ${clickable ? "clickable" : ""}`}
      onClick={clickable ? onClick : undefined}
      tabIndex={clickable ? 0 : -1}
      role={clickable ? "button" : undefined}
      aria-disabled={!clickable}
      onKeyPress={(e) => {
        if (clickable && (e.key === "Enter" || e.key === " ")) {
          onClick();
        }
      }}
    >
      <img
        src={coverImage || "https://via.placeholder.com/140x90?text=No+Image"}
        alt={`${title} cover`}
        className="event-cover"
      />
      <div className="event-details">
        <h3 className="event-title">{title}</h3>
        <div className="event-meta">
          <span>👁 {visibility}</span> |{" "}
          <span>📅 {formatDate(startDate)} – {formatDate(endDate)}</span> |{" "}
          <span>👥 {participantsCount}</span> |{" "}
          <span className={`event-status ${status}`}>{status}</span>
        </div>
      </div>
    </div>
  );
}

// Floating Add Event Button
function AddEventButton({ onClick }) {
  return (
    <button onClick={onClick} aria-label="Add Event" className="add-event-btn">
      +
    </button>
  );
}

// Create Event Form with rounds
function CreateEventForm({ onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [registrationType, setRegistrationType] = useState("solo");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [rounds, setRounds] = useState([]);
  const [fee, setFee] = useState(0);
  const [pricePool, setPricePool] = useState(0);

  const handleAddRound = () => {
    setRounds([...rounds, { name: "", date: "", description: "" }]);
  };

  const handleRemoveRound = (index) => {
    setRounds(rounds.filter((_, i) => i !== index));
  };

  const handleRoundChange = (index, field, value) => {
    const updated = [...rounds];
    updated[index][field] = value;
    setRounds(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Event name is required");
    if (!startDate) return alert("Start date is required");
    if (endDate && new Date(endDate) < new Date(startDate)) {
      return alert("End date cannot be earlier than start date");
    }
    onSave({ title, description, registrationType, startDate, endDate, visibility, rounds });
  };

  return (
    <div className="form-overlay" onClick={onClose} aria-modal="true" role="dialog">
      <form
        className="event-form bg-white rounded shadow-lg p-4"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2 className="mb-4 text-center">✨ Create New Event</h2>

        <div className="mb-3">
          <label className="form-label">
            Event Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label">Registration Type</label>
          <select
            className="form-select"
            value={registrationType}
            onChange={(e) => setRegistrationType(e.target.value)}
          >
            <option value="solo">Solo</option>
            <option value="team">Team</option>
            <option value="both">Both</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">
            Start Date <span className="text-danger">*</span>
          </label>
          <input
            type="datetime-local"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">End Date</label>
          <input
            type="datetime-local"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label d-block">Visibility</label>
          <div className="form-check form-check-inline">
            <input
              type="radio"
              id="public"
              className="form-check-input"
              name="visibility"
              value="public"
              checked={visibility === "public"}
              onChange={() => setVisibility("public")}
            />
            <label htmlFor="public" className="form-check-label">Public</label>
          </div>
          <div className="form-check form-check-inline">
            <input
              type="radio"
              id="private"
              className="form-check-input"
              name="visibility"
              value="private"
              checked={visibility === "private"}
              onChange={() => setVisibility("private")}
            />
            <label htmlFor="private" className="form-check-label">Private</label>
          </div>
        </div>
         <div className="mb-3">
          <label className="form-label">Fee (₹)</label>
          <input
            type="number"
            className="form-control"
            value={fee}
            min={0}
            onChange={(e) => setFee(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Price Pool (₹)</label>
          <input
            type="number"
            className="form-control"
            value={pricePool}
            min={0}
            onChange={(e) => setPricePool(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <h5>Rounds</h5>
          {rounds.map((round, index) => (
            <div key={index} className="card p-3 mb-2 shadow-sm">
              <div className="mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder={`Round ${index + 1} Name`}
                  value={round.name}
                  onChange={(e) => handleRoundChange(index, "name", e.target.value)}
                />
              </div>
              <div className="mb-2">
                <input
                  type="datetime-local"
                  className="form-control"
                  value={round.date}
                  onChange={(e) => handleRoundChange(index, "date", e.target.value)}
                />
              </div>
              <div className="mb-2">
                <textarea
                  className="form-control"
                  placeholder="Description"
                  value={round.description}
                  onChange={(e) => handleRoundChange(index, "description", e.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleRemoveRound(index)}
              >
                Remove Round
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-outline-primary w-100" onClick={handleAddRound}>
            + Add Round
          </button>
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Create
          </button>
        </div>
      </form>
    </div>
  );
}

// Main Component
export default function ManageEvent() {
  const [clubId, setClubId] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("http://localhost:5000/profile", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const profile = await res.json();
        if (profile.clubs && profile.clubs.length > 0) {
          setClubId(profile.clubs[0]);
        } else throw new Error("No associated clubs found in profile");
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  useEffect(() => {
    async function fetchEvents() {
      if (!clubId) return;
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:5000/events?club=${clubId}&sort=-createdAt`);
        if (!response.ok) throw new Error("Failed to fetch events");
        const data = await response.json();

        const mapped = data.map((e) => ({
          ...e,
          participantsCount:
            (e.soloParticipants?.length || 0) +
            (Array.isArray(e.teams) ? e.teams.reduce((acc, t) => acc + (t.members?.length || 0), 0) : 0),
          visibility: e.visibility || "Public",
          status: e.status || "upcoming",
          coverImage: e.coverImage || "",
        }));

        setEvents(mapped);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [clubId]);

  const handleCreateEvent = async (eventData) => {
    if (!clubId) return alert("Club ID not available, cannot create event.");
    try {
      // Create Event
      const response = await fetch("http://localhost:5000/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...eventData, club: clubId }),
      });
      if (!response.ok) throw new Error("Failed to create event");
      const newEvent = await response.json();

      // Create rounds separately
      if (eventData.rounds && eventData.rounds.length > 0) {
        for (const round of eventData.rounds) {
          // Wait each round creation
          await fetch(`http://localhost:5000/events/${newEvent._id}/rounds`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: round.name,
              description: round.description,
              start_time: round.date,
            }),
          });
        }
      }

      setEvents([newEvent, ...events]);
      setShowForm(false);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <section className="manage-events">
      <h1>📌 Manage Events</h1>
      {events.length === 0 && <p>No events found.</p>}
      {events.map((event) => (
        <EventCard key={event._id} event={event} onClick={() => navigate(`/event/manage/${event._id}`)} />
      ))}

      <AddEventButton onClick={() => setShowForm(true)} />

      {showForm && <CreateEventForm onClose={() => setShowForm(false)} onSave={handleCreateEvent} />}
    </section>
  );
}
