import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
axios.defaults.baseURL = "http://localhost:5000";

function EventDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // eventId from route '/events/manage/:id'
  const [event, setEvent] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [activeRound, setActiveRound] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [activeTab, setActiveTab] = useState("edit"); // Track active tab

  // Fetch event + rounds
  useEffect(() => {
    fetchEvent();
    fetchRounds();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await axios.get(`/event/manage/${id}`);
      setEvent(res.data);
    } catch (err) {
      console.error("Error fetching event", err);
    }
  };

  const fetchRounds = async () => {
    try {
      const res = await axios.get(`/event/manage/${id}/rounds`);
      setRounds(res.data);
      if (res.data.length > 0) {
        setActiveRound(res.data[0]._id);
        fetchParticipants(res.data[0]._id);
      }
    } catch (err) {
      console.error("Error fetching rounds", err);
    }
  };

  const fetchParticipants = async (roundId) => {
    try {
      const res = await axios.get(`/event/manage/rounds/${roundId}/participants`);
      setParticipants(res.data);
    } catch (err) {
      console.error("Error fetching participants", err);
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/event/manage/${id}`, event);
      alert("Event updated successfully!");
    } catch (err) {
      console.error("Error updating event", err);
    }
  };

  const handleMove = async (participantId) => {
    const currentIndex = rounds.findIndex((r) => r._id === activeRound);
    if (currentIndex === -1 || currentIndex === rounds.length - 1) {
      alert("No next round available!");
      return;
    }

    try {
      await axios.post(`/event/manage/rounds/${activeRound}/move`, {
        participantId,
        nextRoundId: rounds[currentIndex + 1]._id,
      });
      fetchParticipants(activeRound);
      alert("Moved to next round!");
    } catch (err) {
      console.error("Error moving participant", err);
    }
  };

  const downloadExcel = () => {
    window.location.href = `http://localhost:5000/event/manage/${id}/export`;
  };

  if (!event) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="mb-0">{event.title}</h2>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/form-edit", { state: { eventId: id } })}
        >
          Form
        </button>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "edit" ? "active" : ""}`}
            onClick={() => setActiveTab("edit")}
          >
            Edit Details
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "rounds" ? "active" : ""}`}
            onClick={() => setActiveTab("rounds")}
          >
            Round Manager
          </button>
        </li>
      </ul>

      <div className="tab-content">
        {/* Edit Details Tab */}
        {activeTab === "edit" && (
          <div className="tab-pane show active" id="edit">
            <form onSubmit={handleUpdateEvent} className="card p-4 shadow">
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={event.title}
                  onChange={(e) => setEvent({ ...event, title: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  value={event.description}
                  onChange={(e) => setEvent({ ...event, description: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={event.startDate?.slice(0, 10)}
                  onChange={(e) => setEvent({ ...event, startDate: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={event.endDate?.slice(0, 10)}
                  onChange={(e) => setEvent({ ...event, endDate: e.target.value })}
                />
              </div>

              <button className="btn btn-primary">Save Changes</button>
            </form>
          </div>
        )}

        {/* Round Manager Tab */}
        {activeTab === "rounds" && (
          <div className="tab-pane show active" id="rounds">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <label className="me-2 fw-bold">Select Round:</label>
                <select
                  className="form-select d-inline-block w-auto"
                  value={activeRound || ""}
                  onChange={(e) => {
                    setActiveRound(e.target.value);
                    fetchParticipants(e.target.value);
                  }}
                >
                  {rounds.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name || "Round"}
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn btn-success" onClick={downloadExcel}>
                Export to Excel
              </button>
            </div>

            <table className="table table-bordered shadow">
              <thead className="table-dark">
                <tr>
                  <th>Participant/Team</th>
                  <th>Status</th>
                  <th>Move</th>
                </tr>
              </thead>
              <tbody>
                {participants.length > 0 ? (
                  participants.map((p) => (
                    <tr key={p._id}>
                      <td>{p.user?.name || p.team?.name}</td>
                      <td>{p.status}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleMove(p._id)}
                        >
                          Move →
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center">
                      No participants
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventDetailPage;
