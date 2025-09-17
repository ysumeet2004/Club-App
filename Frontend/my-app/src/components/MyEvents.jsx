// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "./MyEvents.css";

// const BACKEND_BASE = "http://localhost:5000";

// export default function MyEvents() {
//   const [myEvents, setMyEvents] = useState([]);
//   const [userId, setUserId] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // ✅ Fetch logged-in user profile
//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const { data: user } = await axios.get(`${BACKEND_BASE}/profile`, {
//           withCredentials: true,
//         });
//         setUserId(user._id);
//       } catch (err) {
//         console.error("Error fetching profile:", err);
//       }
//     };
//     fetchProfile();
//   }, []);

//   // ✅ Fetch user-related events + round statuses
//   useEffect(() => {
//     if (!userId) return;

//     const fetchEvents = async () => {
//       try {
//         const { data: events } = await axios.get(
//           `${BACKEND_BASE}/events/get/all`
//         );
//         const userEvents = [];

//         for (let ev of events) {
//           const isSolo = ev.soloParticipants?.some((p) => p._id === userId);
//           const isTeam = ev.teams?.some((team) =>
//             team.members?.some((m) => m._id === userId)
//           );

//           if (isSolo || isTeam) {
//             const { data: rounds } = await axios.get(
//               `${BACKEND_BASE}/event/manage/${ev._id}/rounds`
//             );
//             const roundsWithStatus = [];

//             for (let round of rounds) {
//               const { data: participants } = await axios.get(
//                 `${BACKEND_BASE}/event/manage/rounds/${round._id}/participants`
//               );

//               const isInRound = participants.some(
//                 (p) =>
//                   p.user?._id === userId ||
//                   p.team?.members?.some((m) => m._id === userId)
//               );

//               roundsWithStatus.push({
//                 ...round,
//                 isInRound,
//               });
//             }

//             userEvents.push({ ...ev, rounds: roundsWithStatus });
//           }
//         }

//         setMyEvents(userEvents);
//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching my events:", err);
//         setLoading(false);
//       }
//     };

//     fetchEvents();
//   }, [userId]);

//   // ✅ Green for current & previous rounds
//   const getRoundStatus = (rounds, index) => {
//     const currentRoundIndex = rounds.findIndex((r) => r.isInRound);
//     if (currentRoundIndex === -1) return "white"; // Not in any round
//     if (index <= currentRoundIndex) return "green"; // Current + previous
//     return "white"; // Upcoming
//   };

//   if (loading) return <p className="text-center mt-5">Loading...</p>;

//   return (
//     <div className="container my-5 fade-in">
//       {myEvents.length === 0 && (
//         <p className="text-center">No events found.</p>
//       )}
//       <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
//         {myEvents.map((event) => (
//           <div key={event._id} className="col">
//             <div className="card h-100 shadow-sm event-card">
//               <div className="card-img-top-container">
//                 <img
//                   src={
//                     event.coverImage
//                       ? `${BACKEND_BASE}${event.coverImage}`
//                       : "https://via.placeholder.com/400x200?text=Event+Image"
//                   }
//                   className="card-img-top"
//                   alt={event.title}
//                 />
//                 <div className="event-overlay">
//                   <div className="d-flex justify-content-between align-items-start p-3">
//                     <h5 className="card-title text-white mb-0">
//                       {event.title}
//                     </h5>
//                     {event.announcements?.length > 0 && (
//                       <div className="announcement-badge ms-auto">
//                         <span className="pulse-badge">!</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//               <div className="card-body d-flex flex-column">
//                 <p className="card-subtitle mb-2 text-muted d-flex align-items-center">
//                   <span className="club-logo">{event.club?.name?.[0]}</span>
//                   {event.club?.name}
//                 </p>
//                 <div className="mt-auto d-flex align-items-center">
//                   <span
//                     className={`badge rounded-pill ${
//                       event.status === "Upcoming"
//                         ? "bg-primary-custom"
//                         : "bg-info-custom"
//                     }`}
//                   >
//                     {event.status}
//                   </span>
//                   <div className="round-progress ms-auto">
//                     {event.rounds.map((round, i) => (
//                       <span
//                         key={round._id}
//                         className={`round-dot ${getRoundStatus(
//                           event.rounds,
//                           i
//                         )}`}
//                       />
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// src/pages/MyEvents.jsx
// src/pages/MyEvents.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./MyEvents.css";

const BACKEND_BASE = "http://localhost:5000";

export default function MyEvents() {
  const [myEvents, setMyEvents] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Fetch logged-in user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: user } = await axios.get(`${BACKEND_BASE}/profile`, {
          withCredentials: true,
        });
        setUserId(user._id);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, []);

  // ✅ Fetch user-related events + round statuses
  useEffect(() => {
    if (!userId) return;

    const fetchEvents = async () => {
      try {
        const { data: events } = await axios.get(
          `${BACKEND_BASE}/events/get/all`
        );
        const userEvents = [];

        for (let ev of events) {
          const isSolo = ev.soloParticipants?.some((p) => p._id === userId);
          const isTeam = ev.teams?.some((team) =>
            team.members?.some((m) => m._id === userId)
          );

          if (isSolo || isTeam) {
            const { data: rounds } = await axios.get(
              `${BACKEND_BASE}/event/manage/${ev._id}/rounds`
            );
            const roundsWithStatus = [];

            for (let round of rounds) {
              const { data: participants } = await axios.get(
                `${BACKEND_BASE}/event/manage/rounds/${round._id}/participants`
              );

              const isInRound = participants.some(
                (p) =>
                  p.user?._id === userId ||
                  p.team?.members?.some((m) => m._id === userId)
              );

              roundsWithStatus.push({
                ...round,
                isInRound,
              });
            }

            userEvents.push({ ...ev, rounds: roundsWithStatus });
          }
        }

        setMyEvents(userEvents);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching my events:", err);
        setLoading(false);
      }
    };

    fetchEvents();
  }, [userId]);

  // ✅ Green for current & previous rounds
  const getRoundStatus = (rounds, index) => {
    const currentRoundIndex = rounds.findIndex((r) => r.isInRound);
    if (currentRoundIndex === -1) return "white"; // Not in any round
    if (index <= currentRoundIndex) return "green"; // Current + previous
    return "white"; // Upcoming
  };

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="container my-5 fade-in">
      {myEvents.length === 0 && (
        <p className="text-center">No events found.</p>
      )}
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {myEvents.map((event) => (
          <div key={event._id} className="col">
            {/* ✅ Entire card clickable */}
            <div
              className="card h-100 shadow-sm event-card clickable-card"
              onClick={() => navigate(`/userchat/${event._id}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="card-img-top-container">
                <img
                  src={
                    event.coverImage
                      ? `${BACKEND_BASE}${event.coverImage}`
                      : "https://via.placeholder.com/400x200?text=Event+Image"
                  }
                  className="card-img-top"
                  alt={event.title}
                />
                <div className="event-overlay">
                  <div className="d-flex justify-content-between align-items-start p-3">
                    <h5 className="card-title text-white mb-0">
                      {event.title}
                    </h5>
                    {event.announcements?.length > 0 && (
                      <div className="announcement-badge ms-auto">
                        <span className="pulse-badge">!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="card-body d-flex flex-column">
                <p className="card-subtitle mb-2 text-muted d-flex align-items-center">
                  <span className="club-logo">{event.club?.name?.[0]}</span>
                  {event.club?.name}
                </p>
                <div className="mt-auto d-flex align-items-center">
                  <span
                    className={`badge rounded-pill ${
                      event.status === "Upcoming"
                        ? "bg-primary-custom"
                        : "bg-info-custom"
                    }`}
                  >
                    {event.status}
                  </span>
                  <div className="round-progress ms-auto">
                    {event.rounds.map((round, i) => (
                      <span
                        key={round._id}
                        className={`round-dot ${getRoundStatus(
                          event.rounds,
                          i
                        )}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
