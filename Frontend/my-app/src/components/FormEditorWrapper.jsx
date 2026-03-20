import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import FormEditor from "./FormEditor";
import axios from "axios";

const TALLY_BASE = "https://api.tally.so";
const BACKEND_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function FormManager({ eventId: propEventId }) {
  const location = useLocation();
  const eventId = location.state?.eventId || propEventId || "";
  const [tab, setTab] = useState("editor");

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <button onClick={() => setTab("editor")} style={tabBtn(tab === "editor")}>
          Form Editor
        </button>
        <button onClick={() => setTab("verification")} style={tabBtn(tab === "verification")}>
          Verification
        </button>
        <button onClick={() => setTab("insights")} style={tabBtn(tab === "insights")}>
          Insights
        </button>
      </div>

      {tab === "editor" && <FormEditor eventId={eventId} />}
      {tab === "verification" && <VerificationTab eventId={eventId} />}
      {tab === "insights" && <InsightsTab eventId={eventId} />}
    </div>
  );
}

/* ---------------- Verification Tab ---------------- */
function VerificationTab({ eventId }) {
  const [apiKey, setApiKey] = useState("");
  const [formId, setFormId] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [verifiedIds, setVerifiedIds] = useState(new Set());
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyingIds, setVerifyingIds] = useState(new Set());

  // load saved API key from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("tallyApiKey");
    if (saved) setApiKey(saved);
  }, []);

  const handleApiKeyChange = (val) => {
    setApiKey(val);
    localStorage.setItem("tallyApiKey", val);
  };

  const fetchSubsAndVerified = async () => {
    if (!apiKey || !eventId) {
      setMsg("Please enter API key first");
      return;
    }
    try {
      setLoading(true);
      setMsg("");

      const res = await axios.get(`${BACKEND_BASE}/forms/${eventId}`);
      if (!res.data?.formId) {
        setMsg("No form found for this event.");
        setSubmissions([]);
        setVerifiedIds(new Set());
        return;
      }
      setFormId(res.data.formId);

      const tallyRes = await fetch(
        `${TALLY_BASE}/forms/${res.data.formId}/submissions`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await tallyRes.json();
      if (!tallyRes.ok) throw new Error(data?.error || "unknown error");
      setSubmissions(data.submissions || []);

      const roundsRes = await axios.get(`${BACKEND_BASE}/event/manage/${eventId}/rounds`);
      const firstRound = roundsRes.data?.[0];
      if (!firstRound) {
        setMsg("No rounds found for this event.");
        setVerifiedIds(new Set());
        return;
      }

      const verifiedRes = await axios.get(
        `${BACKEND_BASE}/event/manage/rounds/${firstRound._id}/participants`
      );
      const verifiedParticipants = verifiedRes.data || [];

      const fetchedVerifiedIds = new Set(
        verifiedParticipants
          .map((p) => p.userData?.respondentId)
          .filter(Boolean)
      );
      setVerifiedIds(fetchedVerifiedIds);
    } catch (err) {
      setMsg("Failed to fetch: " + err.message);
      setSubmissions([]);
      setVerifiedIds(new Set());
    } finally {
      setLoading(false);
    }
  };

const verifyParticipant = async (submission) => {
  if (verifyingIds.has(submission.respondentId) || verifiedIds.has(submission.respondentId)) return;

  setVerifyingIds((prev) => new Set(prev).add(submission.respondentId));
  setMsg("");

  try {
    const rounds = await axios.get(`${BACKEND_BASE}/event/manage/${eventId}/rounds`);
    const firstRound = rounds.data?.[0];
    if (!firstRound) {
      setMsg("No rounds found for event");
      return;
    }

    const emailAnswer = submission.responses.find(
      (r) => r.answer && r.answer.toString().includes("@")
    );
    const email = emailAnswer ? emailAnswer.answer.toLowerCase() : null;
    if (!email) {
      setMsg("Email not found in submission responses");
      return;
    }

    const userRes = await axios.get(`${BACKEND_BASE}/users/byEmail`, { params: { email } });
    const user = userRes.data;
    if (!user || !user._id) {
      setMsg(`User with email ${email} not found`);
      return;
    }
    const userId = user._id;

    const userData = {
      respondentId: submission.respondentId,
      submissionId: submission.id,
      formId: submission.formId,
      submittedAt: submission.submittedAt,
      responses: submission.responses,
    };

    // Add participant to round participants
    await axios.post(
      `${BACKEND_BASE}/event/manage/rounds/${firstRound._id}/participants`,
      { userId, eventId, userData }
    );

    // Call new route to add solo participant to event
    await axios.post(
      `${BACKEND_BASE}/event/manage/${eventId}/add-solo-participant`,
      { userId }
    );

    setMsg("Verified!");
    setVerifiedIds((prev) => new Set(prev).add(submission.respondentId));
  } catch (err) {
    setMsg("Verify failed: " + err.message);
  } finally {
    setVerifyingIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(submission.respondentId);
      return newSet;
    });
  }
};



  return (
    <div>
      <h2>Verification</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          type="password"
          placeholder="Tally API Key"
          value={apiKey}
          onChange={(e) => handleApiKeyChange(e.target.value)}
          style={{ ...inputStyle, flex: 1 }}
        />
        <button style={primaryBtn} onClick={fetchSubsAndVerified} disabled={loading}>
          Load
        </button>
      </div>

      {msg && <p>{msg}</p>}
      {loading && <p>Loading...</p>}

      {submissions.length === 0 && !loading && <p>No participants found</p>}

      <div style={{ display: "grid", gap: 12 }}>
        {submissions.map((sub) => {
          const emailAnswer = sub.responses.find(
            (r) => r.answer && r.answer.toString().includes("@")
          );
          const email = emailAnswer ? emailAnswer.answer : "Unknown email";

          const isVerified = verifiedIds.has(sub.respondentId);
          const isVerifying = verifyingIds.has(sub.respondentId);

          return (
            <div key={sub.id} style={cardStyle}>
              <strong>{email}</strong>
              <button
                style={{
                  ...primaryBtn,
                  backgroundColor: isVerified ? "#22c55e" : "#111827",
                  cursor: isVerified ? "default" : "pointer",
                }}
                disabled={isVerified || isVerifying || loading}
                onClick={() => verifyParticipant(sub)}
              >
                {isVerified ? "Verified" : isVerifying ? "Verifying..." : "Verify"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Insights Tab ---------------- */
function InsightsTab({ eventId }) {
  const [questions, setQuestions] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadInsights() {
      try {
        setLoading(true);

        // ✅ Fetch the formId first
        const formRes = await axios.get(`${BACKEND_BASE}/forms/${eventId}`);
        const formId = formRes.data?.formId;
        if (!formId) {
          setQuestions([]);
          setSubmissions([]);
          return;
        }

        // ✅ Call tally submissions
        const tallyRes = await fetch(`${TALLY_BASE}/forms/${formId}/submissions`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("tallyApiKey") || ""}`,
            "Content-Type": "application/json",
          },
        });

        const data = await tallyRes.json();
        if (!tallyRes.ok) throw new Error(data?.error || "unknown error");

        setQuestions(data.questions || []);
        setSubmissions(data.submissions || []);
      } catch (err) {
        console.error("Insights fetch failed", err);
        setQuestions([]);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    }
    loadInsights();
  }, [eventId]);

  return (
    <div>
      <h2>Insights</h2>
      {loading && <p>Loading...</p>}

      {(!questions.length || !submissions.length) && !loading && (
        <p>No data available</p>
      )}

      {questions.length > 0 && submissions.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {questions.map((q) => (
                <th key={q.id} style={tableHeaderStyle}>
                  {q.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub) => (
              <tr key={sub.id} style={tableRowStyle}>
                {questions.map((q) => {
                  const resp = sub.responses.find(
                    (r) => r.questionId === q.id
                  );
                  return (
                    <td key={q.id} style={tableCellStyle}>
                      {resp?.answer || "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}


/* ---------------- Styles ---------------- */
const tabBtn = (active) => ({
  padding: "8px 14px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  background: active ? "#111827" : "white",
  color: active ? "white" : "#111827",
  cursor: "pointer",
  fontWeight: 600,
});

const inputStyle = {
  width: "100%",
  border: "1px solid #d1d5db",
  borderRadius: 10,
  padding: "10px 12px",
};

const primaryBtn = {
  border: 0,
  borderRadius: 10,
  padding: "8px 12px",
  background: "#111827",
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
};

const cardStyle = {
  border: "1px solid #e5e7eb",
  padding: 10,
  marginBottom: 8,
  borderRadius: 8,
  background: "#f9fafb",
};

const tableHeaderStyle = {
  border: "1px solid #e5e7eb",
  padding: 8,
  backgroundColor: "#f3f4f6",
  textAlign: "left",
};

const tableRowStyle = {
  borderBottom: "1px solid #e5e7eb",
};

const tableCellStyle = {
  border: "1px solid #e5e7eb",
  padding: 8,
};
