import React, { useEffect, useMemo, useState } from "react";
import './FormEditor.css'
import axios from "axios";

const TALLY_BASE = "https://api.tally.so";

const makeUUID = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : "xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });

const emptyField = () => ({
  id: makeUUID(),
  label: "Untitled question",
  type: "short_text",
  required: false,
  placeholder: "",
  options: ["Option 1", "Option 2"],
});

const BACKEND_BASE = "http://localhost:5000";

export default function FormEditor({ eventId }) {
  const [apiKey, setApiKey] = useState("");
  const [formId, setFormId] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [formName, setFormName] = useState("My Awesome Form");
  const [fields, setFields] = useState([emptyField()]);
  const [showEmbedPreview, setShowEmbedPreview] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);


 

  useEffect(() => {
    if (!showEmbedPreview) return;
    const id = "tally-embed-js";
    if (document.getElementById(id)) return;
    const s = document.createElement("script");
    s.src = "https://tally.so/widgets/embed.js";
    s.async = true;
    s.id = id;
    document.head.appendChild(s);
  }, [showEmbedPreview]);

  useEffect(() => {
    if (!eventId) return;

    async function loadForm() {
      try {
        const res = await axios.get(`${BACKEND_BASE}/forms/${eventId}`);
        const formData = res.data;
        if (formData && formData.formId) {
          setFormId(formData.formId);
          setFormName(formData.formName || "My Awesome Form");

          if (!apiKey) {
            setMessage("Please enter Tally API Key to load form fields.");
            return;
          }

          const tallyRes = await fetch(`${TALLY_BASE}/forms/${formData.formId}`, {
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
          });
          if (!tallyRes.ok) throw new Error("Failed to fetch Tally form data");
          const tallyJson = await tallyRes.json();

          const blocks = tallyJson.blocks || [];
          const rebuiltFields = [];

          let lastQuestionLabel = null;
          let currentDropdownGroupUuid = null;
          let currentDropdownOptions = [];

          blocks.forEach(block => {
            if (block.type === "TITLE" && block.groupType === "QUESTION") {
              if (lastQuestionLabel !== null) {
                if (currentDropdownGroupUuid && currentDropdownOptions.length) {
                  rebuiltFields[rebuiltFields.length - 1].options = currentDropdownOptions;
                  currentDropdownOptions = [];
                  currentDropdownGroupUuid = null;
                }
              }
              lastQuestionLabel = block.payload.html || "Untitled question";
              rebuiltFields.push({
                id: makeUUID(),
                label: lastQuestionLabel,
                type: "short_text",
                required: false,
                placeholder: "",
              });
            } else if (
              ["INPUT_TEXT", "TEXTAREA", "INPUT_EMAIL", "INPUT_NUMBER"].includes(block.type)
            ) {
              const lastField = rebuiltFields[rebuiltFields.length - 1];
              if (!lastField) return;

              let t = "short_text";
              if (block.type === "TEXTAREA") t = "long_text";
              else if (block.type === "INPUT_EMAIL") t = "email";
              else if (block.type === "INPUT_NUMBER") t = "number";

              lastField.type = t;
              lastField.placeholder = block.payload.placeholder || "";
              lastField.required = !!block.payload.required;
            } else if (block.type === "DROPDOWN_OPTION") {
              const lastField = rebuiltFields[rebuiltFields.length - 1];
              if (!lastField || lastField.type !== "dropdown") {
                if (lastField) lastField.type = "dropdown";
              }
              if (lastField) {
                lastField.options = lastField.options || [];
                lastField.options.push(block.payload.text || `Option ${block.payload.index + 1}`);
              }
            }
          });

          setFields(rebuiltFields.length ? rebuiltFields : [emptyField()]);
        } else {
          setMessage("No saved form found for this event.");
        }
      } catch (err) {
        setMessage(`Error loading form: ${err.message}`);
      }
    }
    loadForm();
  }, [eventId, apiKey]);

  const addField = () => setFields(prev => [...prev, emptyField()]);
  const removeField = id => setFields(prev => prev.filter(f => f.id !== id));
  const moveField = (id, dir) => {
    setFields(prev => {
      const i = prev.findIndex(f => f.id === id);
      if (i < 0) return prev;
      const j = dir === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= prev.length) return prev;
      const clone = [...prev];
      [clone[i], clone[j]] = [clone[j], clone[i]];
      return clone;
    });
  };
  const updateField = (id, patch) =>
    setFields(prev => prev.map(f => (f.id === id ? { ...f, ...patch } : f)));

  const buildBlocks = () => {
    const blocks = [];

    const formTitleUUID = makeUUID();
    blocks.push({
      uuid: formTitleUUID,
      type: "FORM_TITLE",
      groupUuid: makeUUID(),
      groupType: "TEXT",
      payload: {
        title: formName,
        html: formName,
      },
    });

    fields.forEach((f, idx) => {
      const qTitleUUID = makeUUID();
      blocks.push({
        uuid: qTitleUUID,
        type: "TITLE",
        groupUuid: makeUUID(),
        groupType: "QUESTION",
        payload: {
          html: f.label || `Question ${idx + 1}`,
        },
      });

      const commonPayload = {
        placeholder: f.placeholder || "",
        required: !!f.required,
      };

      const mapType = {
        short_text: "INPUT_TEXT",
        long_text: "TEXTAREA",
        email: "INPUT_EMAIL",
        number: "INPUT_NUMBER",
      };

      if (f.type === "dropdown") {
        const ddGroupUuid = makeUUID();
        (f.options || []).forEach((opt, i) => {
          blocks.push({
            uuid: makeUUID(),
            type: "DROPDOWN_OPTION",
            groupUuid: ddGroupUuid,
            groupType: "DROPDOWN",
            payload: {
              index: i,
              text: opt || `Option ${i + 1}`,
            },
          });
        });
      } else {
        const inputType = mapType[f.type] || "INPUT_TEXT";
        blocks.push({
          uuid: makeUUID(),
          type: inputType,
          groupUuid: makeUUID(),
          groupType: inputType,
          payload: commonPayload,
        });
      }
    });

    return blocks;
  };

  async function apiFetch(path, method, body) {
    if (!apiKey) throw new Error("Please provide your Tally API key.");
    const res = await fetch(`${TALLY_BASE}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch { console.log('a'); }
    if (!res.ok) {
      throw new Error(
        data?.message || data?.error || `Tally API ${method} ${path} failed (${res.status})`
      );
    }
    return data;
  }

  async function saveFormToDB(formData) {
    try {
      await axios.post(`${BACKEND_BASE}/forms/save`, formData);
    } catch (e) {
      setMessage(`Failed to save form metadata to DB: ${e.message}`);
    }
  }

  const handleSave = async () => {
    try {
      if (!eventId) {
        setMessage("eventId prop required to save form.");
        return;
      }
      setSaving(true);
      setMessage("");
      const payload = {
        name: formName,
        status,
        blocks: buildBlocks(),
      };

      let response;
      if (formId?.trim()) {
        response = await apiFetch(`/forms/${formId.trim()}`, "PATCH", payload);
      } else {
        response = await apiFetch(`/forms`, "POST", payload);
        if (response?.id) {
          setFormId(response.id);

          await saveFormToDB({
            eventId,
            formId: response.id,
            formName,
          });
        }
      }

      if (formId && formId.trim() && response?.id) {
        await saveFormToDB({
          eventId,
          formId: response.id,
          formName,
        });
      }

      setMessage(
        `Saved ✔️ Form ID: ${response?.id || formId}. ` +
        `Embed URL: https://tally.so/embed/${response?.id || formId}`
      );
      setPreviewKey(k => k + 1);
    } catch (e) {
      setMessage(`Save failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  // --- New: Delete form handler ---
  const handleDelete = async () => {
    if (!formId || !eventId) {
      setMessage("Form ID and Event ID are required to delete the form.");
      return;
    }
    if (!apiKey) {
      setMessage("Please provide your Tally API Key to delete the form.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this form? This action cannot be undone.")) {
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      // Delete form in Tally
      const res = await fetch(`${TALLY_BASE}/forms/${formId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to delete form on Tally: ${text || res.statusText}`);
      }
      // Delete form metadata in backend DB
      await axios.delete(`${BACKEND_BASE}/forms/${eventId}`);

      // Reset local form state after deletion
      setFormId("");
      setFormName("My Awesome Form");
      setFields([emptyField()]);
      setMessage("Form deleted successfully.");
      setPreviewKey(k => k + 1);
    } catch (e) {
      setMessage(`Delete failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const LivePreview = () => (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 20,
        background: "white",
      }}
    >
      <h3 style={{ margin: 0, fontSize: 18, marginBottom: 12 }}>{formName}</h3>
      <div style={{ display: "grid", gap: 14 }}>
        {fields.map((f, i) => (
          <div key={f.id} style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 600 }}>
              {i + 1}. {f.label} {f.required ? <span style={{ color: "#ef4444" }}>*</span> : null}
            </label>
            {f.type === "long_text" ? (
              <textarea
                disabled
                placeholder={f.placeholder}
                rows={4}
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  padding: "10px 12px",
                }}
              />
            ) : f.type === "dropdown" ? (
              <select
                disabled
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  padding: "10px 12px",
                  background: "white",
                }}
              >
                {(f.options || []).map((o, j) => (
                  <option key={j}>{o}</option>
                ))}
              </select>
            ) : (
              <input
                disabled
                type={
                  f.type === "email"
                    ? "email"
                    : f.type === "number"
                      ? "number"
                      : "text"
                }
                placeholder={f.placeholder}
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  padding: "10px 12px",
                }}
              />
            )}
          </div>
        ))}
        <button
          disabled
          style={{
            marginTop: 8,
            border: 0,
            borderRadius: 10,
            padding: "10px 14px",
            background: "#111827",
            color: "white",
            fontWeight: 600,
            cursor: "not-allowed",
            opacity: 0.6,
            width: 160,
          }}
        >
          Submit (preview)
        </button>
      </div>
    </div>
  );

  const embedURL = useMemo(() => {
    if (!formId) return "";
    return `https://tally.so/embed/${formId}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`;
  }, [formId]);

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "40px auto",
        padding: 16,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
        maxHeight: "90vh",
        overflowY: "auto",
        background: "#f9fafb",
      }}
    >
      <h2 style={{ marginBottom: 16 }}>Tally Form Editor & Preview</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 200px 160px 140px 140px", // added one more column for delete button
          gap: 12,
          marginBottom: 16,
        }}
      >
        <input
          type="password"
          placeholder="Tally API Key (Bearer token)"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Form ID (readonly)"
          value={formId}
          readOnly
          style={{ ...inputStyle, backgroundColor: "#e5e7eb", cursor: "not-allowed" }}
        />
        <select value={status} onChange={e => setStatus(e.target.value)} style={inputStyle}>
          <option value="PUBLISHED">PUBLISHED</option>
          <option value="DRAFT" >DRAFT</option>
        </select>
        <button onClick={handleSave} disabled={saving || !apiKey} style={primaryBtn}>
          {saving ? "Saving..." : formId ? "Update Form" : "Create Form"}
        </button>
        <button
          onClick={handleDelete}
          disabled={saving || !apiKey || !formId}
          style={dangerBtn}
        >
          {saving ? "Deleting..." : "Delete Form"}
        </button>
      </div>

      <div style={{ marginBottom: 12 }}>
        {message && (
          <div
            style={{
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              padding: "10px 12px",
              borderRadius: 10,
            }}
          >
            {message}
          </div>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          alignItems: "start",
        }}
      >
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 16,
            background: "white",
            maxHeight: "70vh",
            overflowY: "auto",
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Form title</label>
            <input
              value={formName}
              onChange={e => setFormName(e.target.value)}
              style={inputStyle}
              placeholder="Form title"
            />
          </div>

          <div style={{ display: "grid", gap: 12, maxHeight: "60vh", overflowY: "auto" }}>
            {fields.map((f, i) => (
              <div
                key={f.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: 12,
                  background: "#fcfcfc",
                }}
              >
                <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
                  <strong>Q{i + 1}</strong>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => moveField(f.id, "up")} style={ghostBtn}>
                      ↑
                    </button>
                    <button onClick={() => moveField(f.id, "down")} style={ghostBtn}>
                      ↓
                    </button>
                    <button onClick={() => removeField(f.id)} style={dangerBtn}>
                      Delete
                    </button>
                  </div>
                </div>

                <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                  <input
                    value={f.label}
                    onChange={e => updateField(f.id, { label: e.target.value })}
                    style={inputStyle}
                    placeholder="Question label"
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <select
                      value={f.type}
                      onChange={e => updateField(f.id, { type: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="short_text">Short text</option>
                      <option value="long_text">Long text</option>
                      <option value="email">Email</option>
                      <option value="number">Number</option>
                      <option value="dropdown">Dropdown</option>
                    </select>
                    <input
                      value={f.placeholder}
                      onChange={e => updateField(f.id, { placeholder: e.target.value })}
                      style={inputStyle}
                      placeholder="Placeholder (optional)"
                    />
                  </div>
                  <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="checkbox"
                      checked={f.required}
                      onChange={e => updateField(f.id, { required: e.target.checked })}
                    />
                    Required
                  </label>
                  {f.type === "dropdown" && (
                    <div style={{ display: "grid", gap: 6 }}>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>Dropdown options</div>
                      {(f.options || []).map((opt, j) => (
                        <div key={j} style={{ display: "flex", gap: 8 }}>
                          <input
                            value={opt}
                            onChange={e => {
                              const copy = [...f.options];
                              copy[j] = e.target.value;
                              updateField(f.id, { options: copy });
                            }}
                            style={inputStyle}
                          />
                          <button
                            style={ghostBtn}
                            onClick={() => {
                              const copy = (f.options || []).filter((_, k) => k !== j);
                              updateField(f.id, { options: copy });
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        style={ghostBtn}
                        onClick={() =>
                          updateField(f.id, { options: [...(f.options || []), "New option"] })
                        }
                      >
                        + Add option
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button onClick={addField} style={secondaryBtn}>
              + Add field
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <strong>Preview</strong>
            <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13 }}>
              <input
                type="checkbox"
                checked={showEmbedPreview}
                onChange={e => setShowEmbedPreview(e.target.checked)}
              />
              Show Tally embed (uses formId)
            </label>
          </div>

          <LivePreview />

          {showEmbedPreview && formId ? (
            <div
              key={previewKey}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                overflow: "hidden",
                background: "white",
                maxHeight: "70vh",
                minHeight: 600,
              }}
            >
              <iframe
                title="Tally Preview"
                data-tally-src={embedURL}
                width="100%"
                height="600"
                frameBorder="0"
                marginHeight="0"
                marginWidth="0"
                loading="lazy"
              />
            </div>
          ) : (
            <div
              style={{
                border: "1px dashed #e5e7eb",
                borderRadius: 12,
                padding: 16,
                fontSize: 13,
                color: "#6b7280",
              }}
            >
              To preview the real Tally form here, create/update the form to obtain a Form ID,
              then toggle “Show Tally embed”.
            </div>
          )}

          {formId && (
            <div
              style={{
                marginTop: 16,
                padding: 12,
                background: "#f3f4f6",
                borderRadius: 10,
                fontSize: 14,
                color: "#111827",
              }}
            >
              <div style={{ marginBottom: 6 }}>
                Edit form link:{" "}
                <a href={`https://tally.so/forms/${formId}/edit`} target="_blank" rel="noreferrer">
                  https://tally.so/forms/{formId}/edit
                </a>
              </div>
              <div>
                Share form link:{" "}
                <a href={`https://tally.so/r/${formId}`} target="_blank" rel="noreferrer">
                  https://tally.so/r/{formId}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

//  return (
//     <div>
//       {/* keep the entire UI you already had for FormEditor */}
//       {/* everything inside your big return (title, inputs, buttons, preview) stays intact */}
//       <h2>Tally Form Editor & Preview</h2>
//       {/* ... all existing editor UI ... */}
//     </div>
//   );
}

const inputStyle = {
  width: "100%",
  border: "1px solid #d1d5db",
  borderRadius: 10,
  padding: "10px 12px",
  background: "white",
  color: "black",
  appearance: "none",
};

const primaryBtn = {
  border: 0,
  borderRadius: 10,
  padding: "10px 14px",
  background: "#111827",
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryBtn = {
  border: "1px solid #111827",
  borderRadius: 10,
  padding: "10px 14px",
  background: "white",
  color: "#111827",
  fontWeight: 600,
  cursor: "pointer",
};

const ghostBtn = {
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: "6px 10px",
  background: "white",
  cursor: "pointer",
  color: "black",
};

const dangerBtn = {
  border: "1px solid #ef4444",
  color: "#ef4444",
  borderRadius: 8,
  padding: "6px 10px",
  background: "white",
  cursor: "pointer",
};
