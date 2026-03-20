import React, { useEffect, useState } from "react";
import axios from "axios";
import Carousel from "react-bootstrap/Carousel";
import "bootstrap/dist/css/bootstrap.min.css";

const BACKEND_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function EventsCarousel({ events }) {
  if (!events || events.length === 0) return null;

  return (
    <Carousel className="mb-4" interval={3000} pause="hover">
      {events.slice(0, 3).map((e) => {
        const coverImageUrl =
          e.coverImage && e.coverImage.startsWith("http")
            ? e.coverImage
            : `${BACKEND_BASE}${e.coverImage || "/uploads/default.png"}`;

        return (
          <Carousel.Item key={e._id || e.id}>
            <img
              className="d-block w-100"
              src={coverImageUrl}
              alt={e.title}
              style={{ maxHeight: "340px", objectFit: "cover" }}
            />
            <Carousel.Caption>
              <h3 className="bg-dark bg-opacity-75 d-inline-block px-2 rounded">
                {e.title}
              </h3>
              <p className="bg-dark bg-opacity-75 d-inline-block px-2 rounded">
                {e.club?.name || "Club"} — Fee: ₹{e.fee} | Reward: ₹{e.pricePool}
              </p>
            </Carousel.Caption>
          </Carousel.Item>
        );
      })}
    </Carousel>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState(new Set());
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch current logged-in user profile
  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const res = await axios.get(`${BACKEND_BASE}/profile`, { withCredentials: true });
        setCurrentUserId(res.data._id);
      } catch (err) {
        console.error("Failed to fetch current user profile", err);
      }
    }
    fetchCurrentUser();
  }, []);

  // Fetch events after currentUserId is known
  useEffect(() => {
    if (currentUserId) {
      fetchEvents();
    }
  }, [currentUserId]);

  // Fetch all events
  async function fetchEvents() {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${BACKEND_BASE}/events/get/all`);
      const eventsData = res.data || [];

      setEvents(eventsData);

      // Determine which events current user is registered for
      const registeredIds = eventsData.reduce((acc, ev) => {
        const soloIds = ev.soloParticipants?.map(sp => sp._id || sp) || [];
        if (soloIds.some(id => id.toString() === currentUserId)) {
          acc.add(ev._id || ev.id);
        }
        return acc;
      }, new Set());

      setRegisteredEvents(registeredIds);
    } catch (err) {
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  }

  // On Register, fetch formId and redirect to Tally form URL
  const handleRegister = async (eventId) => {
    if (registeredEvents.has(eventId)) return;

    try {
      const formRes = await axios.get(`${BACKEND_BASE}/forms/${eventId}`);
      const formId = formRes.data?.formId;
      if (!formId) {
        alert("Registration form not found for event");
        return;
      }

      // Redirect to Tally URL with formId
      //console.log(formId);
      window.open(`https://tally.so/r/${formId}`, "_blank");

    } catch (err) {
      console.error("Failed to fetch registration form:", err);
      alert("Failed to load registration form");
    }
  };

  const applyFilter = (value) => {
    let sortedEvents = [...events];
    if (value === "fee-low") sortedEvents.sort((a, b) => a.fee - b.fee);
    else if (value === "fee-high") sortedEvents.sort((a, b) => b.fee - a.fee);
    else if (value === "reward-low") sortedEvents.sort((a, b) => a.pricePool - b.pricePool);
    else if (value === "reward-high") sortedEvents.sort((a, b) => b.pricePool - a.pricePool);

    setEvents(sortedEvents);
    setFilter(value);
  };

  return (
    <div className="container py-4 edit-club-container">
      {loading && <p>Loading events...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && (
        <>
          <EventsCarousel events={events} />

          {/* Filters */}
          <div className="row mb-4">
            <div className="col-md-3">
              <select
                className="form-select"
                value={filter}
                onChange={(e) => applyFilter(e.target.value)}
              >
                <option value="">Sort By</option>
                <option value="fee-low">Fee: Low → High</option>
                <option value="fee-high">Fee: High → Low</option>
                <option value="reward-low">Reward: Low → High</option>
                <option value="reward-high">Reward: High → Low</option>
              </select>
            </div>
          </div>

          {/* Event Cards */}
          <div className="row g-4">
            {events.map((event) => {
              const coverImageUrl =
                event.coverImage && event.coverImage.startsWith("http")
                  ? event.coverImage
                  : `${BACKEND_BASE}${event.coverImage || "/uploads/default.jpg"}`;

              const isRegistered = registeredEvents.has(event._id || event.id);

              return (
                <div key={event._id || event.id} className="col-sm-6 col-md-4 col-lg-3">
                  <div className="card h-100 shadow-sm">
                    <img
                      src={coverImageUrl}
                      className="card-img-top"
                      alt={event.title}
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{event.title}</h5>
                      <p className="card-text">{event.club?.name || "Club"}</p>
                      <p className="card-text">
                        Fee: ₹{event.fee} | Reward: ₹{event.pricePool}
                      </p>
                      <button
                        onClick={() => handleRegister(event._id || event.id)}
                        className={`btn mt-auto ${isRegistered ? "btn-success" : "btn-dark"}`}
                        disabled={isRegistered}
                      >
                        {isRegistered ? "Registered" : "Register"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* Add your CSS (edit-club-container and others) as needed */
