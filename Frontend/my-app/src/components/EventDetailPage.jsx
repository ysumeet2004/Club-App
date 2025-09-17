import React, { useEffect, useState, useRef } from "react";
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

  // announcements
  const [announcements, setAnnouncements] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const messageListRef = useRef(null);

  // editing state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editingSaving, setEditingSaving] = useState(false);

  useEffect(() => {
    fetchEvent();
    fetchRounds();
    fetchAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("coverImage", file);

    try {
      const res = await axios.post(`/event/manage/${id}/upload-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setEvent(res.data); // Updated event with new coverImage path
      alert("Image uploaded successfully!");
    } catch (err) {
      console.error("Error uploading image", err);
      alert("Failed to upload image");
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

  // ---------------- Announcements ----------------
  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get(`/announcements/${id}`);
      // expecting newest-first from backend; if not, sort here by createdAt desc
      setAnnouncements(res.data || []);
      // auto-scroll to top (newest)
      setTimeout(() => {
        if (messageListRef.current) messageListRef.current.scrollTop = 0;
      }, 50);
    } catch (err) {
      console.error("Error fetching announcements", err);
    }
  };

  // Send announcement. Title is required.
  const handleSendAnnouncement = async (e) => {
    e?.preventDefault();
    setErrorMessage("");
    if (!newTitle.trim()) {
      setErrorMessage("Title is required");
      return;
    }
    if (!newMessage.trim()) {
      setErrorMessage("Message is required");
      return;
    }

    setSending(true);
    try {
      const res = await axios.post("/announcements", {
        event: id,
        title: newTitle.trim(),
        message: newMessage.trim(),
        type: "general",
      });
      // prepend
      setAnnouncements((prev) => [res.data, ...prev]);
      setNewMessage("");
      setNewTitle("");
      setErrorMessage("");
      // keep focus on message
      setTimeout(() => {
        if (messageListRef.current) messageListRef.current.scrollTop = 0;
      }, 50);
    } catch (err) {
      console.error("Error sending announcement", err);
      setErrorMessage("Failed to send announcement");
    } finally {
      setSending(false);
    }
  };

  // Key handling in message textarea: Shift+Enter -> newline, Enter -> send
  const handleMessageKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendAnnouncement();
    }
    // else default: allow newline on Shift+Enter
  };

  // Start editing announcement inline
  const startEdit = (ann) => {
    setEditingId(ann._id);
    setEditTitle(ann.title || "");
    setEditMessage(ann.message || "");
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditMessage("");
  };

  // Save edited announcement
  const saveEdit = async () => {
    if (!editTitle.trim()) {
      alert("Title is required");
      return;
    }
    if (!editMessage.trim()) {
      alert("Message is required");
      return;
    }
    setEditingSaving(true);
    try {
      const res = await axios.put(`/announcements/${editingId}`, {
        title: editTitle.trim(),
        message: editMessage.trim(),
      });
      // optimistic update: replace in list
      setAnnouncements((prev) => prev.map((a) => (a._id === res.data._id ? res.data : a)));
      cancelEdit();
    } catch (err) {
      console.error("Error updating announcement", err);
      alert("Failed to update announcement");
    } finally {
      setEditingSaving(false);
    }
  };

  // Delete announcement
  const deleteAnnouncement = async (annId) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await axios.delete(`/announcements/${annId}`);
      setAnnouncements((prev) => prev.filter((a) => a._id !== annId));
    } catch (err) {
      console.error("Error deleting announcement", err);
      alert("Failed to delete announcement");
    }
  };

  // small helper: bubble style based on index or other logic (currently all left)
  const bubbleStyle = {
    background: "#ffffff",
    border: "1px solid #e6e6e6",
    padding: "10px 12px",
    borderRadius: "12px",
    boxShadow: "0 1px 2px rgba(16,24,40,0.03)",
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
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "announcements" ? "active" : ""}`}
            onClick={() => setActiveTab("announcements")}
          >
            Announcements
          </button>
        </li>
      </ul>

      <div className="tab-content">
        {/* Edit Tab */}
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

              {/* Fee input */}
              <div className="mb-3">
                <label className="form-label">Fee (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  min={0}
                  value={event.fee || 0}
                  onChange={(e) => setEvent({ ...event, fee: Number(e.target.value) })}
                />
              </div>

              {/* Prize Pool input */}
              <div className="mb-3">
                <label className="form-label">Price Pool (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  min={0}
                  value={event.pricePool || 0}
                  onChange={(e) => setEvent({ ...event, pricePool: Number(e.target.value) })}
                />
              </div>

              {/* Cover Image */}
              <div className="mb-3">
                <label className="form-label">Cover Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={handleImageUpload}
                />
                {event.coverImage && (
                  <img
                    src={`http://localhost:5000${event.coverImage}`}
                    alt="Cover"
                    className="mt-2"
                    style={{ maxWidth: "200px", borderRadius: "8px" }}
                  />
                )}
              </div>

              <button className="btn btn-primary">Save Changes</button>
            </form>
          </div>
        )}

        {/* Rounds Tab */}
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
                        <button className="btn btn-sm btn-primary" onClick={() => handleMove(p._id)}>
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

        {/* Announcements Tab */}
        {activeTab === "announcements" && (
          <div className="tab-pane show active" id="announcements">
            <div
              className="card shadow"
              style={{
                height: "620px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Messages area */}
              <div
                ref={messageListRef}
                className="flex-grow-1 p-3 overflow-auto"
                style={{
                  background: "#f6f7fb",
                  borderBottom: "1px solid #e9ecef",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {announcements.length === 0 && (
                  <p className="text-center text-muted mt-4">No announcements yet</p>
                )}

                {announcements.map((a) => (
                  <div
                    key={a._id}
                    className="position-relative"
                    onMouseEnter={(e) => {
                      const el = e.currentTarget;
                      const ctl = el.querySelector(".msg-controls");
                      if (ctl) ctl.style.opacity = 1;
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget;
                      const ctl = el.querySelector(".msg-controls");
                      if (ctl) ctl.style.opacity = 0;
                    }}
                  >
                    {/* if this is being edited */}
                    {editingId === a._id ? (
                      <div style={{ display: "flex", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <input
                            className="form-control mb-2"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Title"
                          />
                          <textarea
                            className="form-control"
                            rows={3}
                            value={editMessage}
                            onChange={(e) => setEditMessage(e.target.value)}
                          />
                          <div className="mt-2 d-flex gap-2">
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={saveEdit}
                              disabled={editingSaving}
                            >
                              {editingSaving ? "Saving..." : "Save"}
                            </button>
                            <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // normal bubble
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                        <div style={{ flex: 1, maxWidth: "100%" }}>
                          <div style={bubbleStyle}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                              <strong style={{ fontSize: 14 }}>{a.title}</strong>
                              <span style={{ fontSize: 12, color: "#6b7280" }}>
                                {new Date(a.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p style={{ marginTop: 6, whiteSpace: "pre-wrap", marginBottom: 6 }}>
                              {a.message}
                            </p>
                            {/* optional meta */}
                          </div>
                        </div>

                        {/* controls shown on hover */}
                        <div
                          className="msg-controls"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                            opacity: 0,
                            transition: "opacity 120ms ease",
                          }}
                        >
                          {/* pen (edit) */}
                          <button
                            title="Edit"
                            className="btn btn-sm"
                            style={{
                              border: "1px solid #e6e6e6",
                              background: "#fff",
                              padding: "6px",
                              borderRadius: 8,
                            }}
                            onClick={() => startEdit(a)}
                          >
                            {/* simple pen svg */}
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="#374151" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" stroke="#374151" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>

                          {/* trash (delete) */}
                          <button
                            title="Delete"
                            className="btn btn-sm"
                            style={{
                              border: "1px solid #fde2e2",
                              background: "#fff",
                              padding: "6px",
                              borderRadius: 8,
                            }}
                            onClick={() => deleteAnnouncement(a._id)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 6h18" stroke="#ef4444" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="#ef4444" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M10 11v6M14 11v6M9 6l1-2h4l1 2" stroke="#ef4444" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Input area */}
              <form onSubmit={handleSendAnnouncement} className="p-3" style={{ background: "#fff" }}>
                <div className="d-flex gap-2 align-items-start">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Title"
                    value={newTitle}
                    onChange={(e) => {
                      setNewTitle(e.target.value);
                      if (e.target.value.trim()) setErrorMessage("");
                    }}
                    style={{ maxWidth: 260 }}
                    required
                  />
                  <textarea
                    className="form-control"
                    placeholder="Type a message... (Shift+Enter for newline, Enter to send)"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleMessageKeyDown}
                    rows={2}
                    style={{ resize: "vertical" }}
                  />
                  <div style={{ minWidth: 110, display: "flex", gap: 8 }}>
                    <button
                      className="btn btn-primary"
                      type="submit"
                      disabled={sending}
                      style={{ width: "100%" }}
                    >
                      {sending ? "Sending..." : "Send"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setNewMessage("");
                        setNewTitle("");
                        setErrorMessage("");
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                {errorMessage && <div className="text-danger mt-2">{errorMessage}</div>}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventDetailPage;
