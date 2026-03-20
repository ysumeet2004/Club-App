// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaEye, FaSave, FaUpload } from "react-icons/fa";
// import "./EditClub.css";

// function EditClub() {
//   const navigate = useNavigate();
//   const [clubId, setClubId] = useState(null);
//   const [clubName, setClubName] = useState("");
//   const [description, setDescription] = useState("");
//   const [originalName, setOriginalName] = useState("");
//   const [originalDescription, setOriginalDescription] = useState("");
//   const [logoFile, setLogoFile] = useState(null);
//   const [coverFile, setCoverFile] = useState(null);
//   const [logoUrl, setLogoUrl] = useState("");
//   const [coverUrl, setCoverUrl] = useState("");

//   useEffect(() => {
//     async function fetchProfileAndDetails() {
//       try {
//         const profileRes = await fetch(`${API_BASE}/profile`, {
          
//           credentials: "include",
//         });

//         if (!profileRes.ok) throw new Error("Failed to fetch profile");
//         const profileData = await profileRes.json();
//         const id = profileData.clubs[0];
//         setClubId(id);

//         const clubRes = await fetch(`${API_BASE}/clubs/${id}`);
//         if (!clubRes.ok) throw new Error("Failed to fetch club details");
//         const clubData = await clubRes.json();

//         setOriginalName(clubData.name || "");
//         setOriginalDescription(clubData.description || "");
//         setLogoUrl(clubData.logo || "");
//         setCoverUrl(clubData.coverImage || "");
//       } catch (err) {
//         console.error("Error fetching profile or club details:", err);
//       }
//     }

//     fetchProfileAndDetails();
//   }, []);

//   const handleUpdateName = async () => {
//     if (!clubId) return;
//     await fetch(`${API_BASE}/clubs/update/${clubId}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ name: clubName }),
//     });
//     alert("Club name updated!");
//     setOriginalName(clubName); // update placeholder
//     setClubName("");
//   };

//   const handleUpdateDescription = async () => {
//     if (!clubId) return;
//     await fetch(`${API_BASE}/clubs/update/${clubId}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ description }),
//     });
//     alert("Club description updated!");
//     setOriginalDescription(description);
//     setDescription("");
//   };

//   const handleLogoUpload = async () => {
//     if (!logoFile || !clubId) return;
//     const formData = new FormData();
//     formData.append("image", logoFile);
//     await fetch(`${API_BASE}/clubs/${clubId}/logo`, {
//       method: "PUT",
//       body: formData,
//     });
//     alert("Logo updated!");
//     setLogoUrl(URL.createObjectURL(logoFile)); // update preview to new local file
//     setLogoFile(null);
//   };

//   const handleCoverUpload = async () => {
//     if (!coverFile || !clubId) return;
//     const formData = new FormData();
//     formData.append("image", coverFile);
//     await fetch(`${API_BASE}/clubs/${clubId}/cover`, {
//       method: "PUT",
//       body: formData,
//     });
//     alert("Cover updated!");
//     setCoverUrl(URL.createObjectURL(coverFile)); // update preview to new local file
//     setCoverFile(null);
//   };

//   const previewImage = (url) => {
//     if (url) window.open(url, "_blank");
//     else alert("No image available to preview");
//   };

//   return (
//     <div className="edit-club-container">
//       <h2 className="edit-club-title">Edit Club Details</h2>

//       <form className="edit-club-form" onSubmit={(e) => e.preventDefault()}>
//         <label className="form-group">
//           <span>Club Name</span>
//           <input
//             type="text"
//             placeholder={originalName || "Enter club name"}
//             value={clubName}
//             onChange={(e) => setClubName(e.target.value)}
//             style={{ opacity: clubName ? 1 : 0.5 }}
//           />
//           <button type="button" onClick={handleUpdateName} className="small-update-btn">
//             Update Name
//           </button>
//         </label>

//         <label className="form-group">
//           <span>Description</span>
//           <textarea
//             placeholder={originalDescription || "Write about your club..."}
//             rows={4}
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             style={{ opacity: description ? 1 : 0.5 }}
//           />
//           <button type="button" onClick={handleUpdateDescription} className="small-update-btn">
//             Update Description
//           </button>
//         </label>

//         <label className="form-group">
//           <span>Logo</span>
//           <div className="file-input-wrapper">
//             <FaUpload className="upload-icon" />
//             <input type="file" onChange={(e) => setLogoFile(e.target.files[0])} />
//             <button
//               type="button"
//               className="preview-btn"
//               onClick={() => previewImage(logoUrl)}
//               title="Preview Logo"
//             >
//               <FaEye />
//             </button>
//           </div>
//           <button type="button" onClick={handleLogoUpload}>
//             Upload Logo
//           </button>
//         </label>

//         <label className="form-group">
//           <span>Cover Image</span>
//           <div className="file-input-wrapper">
//             <FaUpload className="upload-icon" />
//             <input type="file" onChange={(e) => setCoverFile(e.target.files[0])} />
//             <button
//               type="button"
//               className="preview-btn"
//               onClick={() => previewImage(coverUrl)}
//               title="Preview Cover Image"
//             >
//               <FaEye />
//             </button>
//           </div>
//           <button type="button" onClick={handleCoverUpload}>
//             Upload Cover
//           </button>
//         </label>
//       </form>

//       <div className="edit-club-actions">
//         <button
//           className="open-editor-btn"
//           disabled={!clubId}
//           onClick={() => navigate(`/studio/editor/${clubId}`)}
//         >
//           <FaEye style={{ marginRight: "8px" }} />
//           Open Club Page Editor
//         </button>
//       </div>
//     </div>
//   );
// }

// export default EditClub;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaSave, FaUpload } from "react-icons/fa";
import "./EditClub.css";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function EditClub() {
  const navigate = useNavigate();
  const [clubId, setClubId] = useState(null);
  const [clubName, setClubName] = useState("");
  const [description, setDescription] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [originalDescription, setOriginalDescription] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");

  useEffect(() => {
    async function fetchProfileAndDetails() {
      try {
        const profileRes = await fetch(`${API_BASE}/profile`, {
          credentials: "include",
        });

        if (!profileRes.ok) throw new Error("Failed to fetch profile");
        const profileData = await profileRes.json();
        const id = profileData.clubs[0];
        setClubId(id);

        const clubRes = await fetch(`${API_BASE}/clubs/${id}`);
        if (!clubRes.ok) throw new Error("Failed to fetch club details");
        const clubData = await clubRes.json();

        setOriginalName(clubData.name || "");
        setOriginalDescription(clubData.description || "");
        setLogoUrl(clubData.logo ? `${API_BASE}${clubData.logo}` : "");
        setCoverUrl(clubData.coverImage ? `${API_BASE}${clubData.coverImage}` : "");
      } catch (err) {
        console.error("Error fetching profile or club details:", err);
      }
    }

    fetchProfileAndDetails();
  }, []);

  const handleUpdateName = async () => {
    if (!clubId) return;
    await fetch(`${API_BASE}/clubs/update/${clubId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: clubName }),
    });
    alert("Club name updated!");
    setOriginalName(clubName);
    setClubName("");
  };

  const handleUpdateDescription = async () => {
    if (!clubId) return;
    await fetch(`${API_BASE}/clubs/update/${clubId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });
    alert("Club description updated!");
    setOriginalDescription(description);
    setDescription("");
  };

  const handleLogoUpload = async () => {
    if (!logoFile || !clubId) return;
    const formData = new FormData();
    formData.append("image", logoFile);
    await fetch(`${API_BASE}/clubs/${clubId}/logo`, {
      method: "PUT",
      body: formData,
    });
    alert("Logo updated!");
    setLogoUrl(URL.createObjectURL(logoFile));
    setLogoFile(null);
  };

  const handleCoverUpload = async () => {
    if (!coverFile || !clubId) return;
    const formData = new FormData();
    formData.append("image", coverFile);
    await fetch(`${API_BASE}/clubs/${clubId}/cover`, {
      method: "PUT",
      body: formData,
    });
    alert("Cover updated!");
    setCoverUrl(URL.createObjectURL(coverFile));
    setCoverFile(null);
  };

  const previewImage = (url) => {
    if (url) window.open(url, "_blank");
    else alert("No image available to preview");
  };

  return (
    <div className="edit-club-container">
      <h2 className="edit-club-title">Edit Club Details</h2>

      <form className="edit-club-form" onSubmit={(e) => e.preventDefault()}>
        <label className="form-group">
          <span>Club Name</span>
          <input
            type="text"
            placeholder={originalName || "Enter club name"}
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            style={{ opacity: clubName ? 1 : 0.5 }}
          />
          <button type="button" onClick={handleUpdateName} className="small-update-btn">
            Update Name
          </button>
        </label>

        <label className="form-group">
          <span>Description</span>
          <textarea
            placeholder={originalDescription || "Write about your club..."}
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ opacity: description ? 1 : 0.5 }}
          />
          <button type="button" onClick={handleUpdateDescription} className="small-update-btn">
            Update Description
          </button>
        </label>

        <label className="form-group">
          <span>Logo</span>
          <div className="file-input-wrapper">
            <FaUpload className="upload-icon" />
            <input type="file" onChange={(e) => setLogoFile(e.target.files[0])} />
            <button
              type="button"
              className="preview-btn"
              onClick={() => previewImage(logoUrl)}
              title="Preview Logo"
            >
              <FaEye />
            </button>
          </div>
          <button type="button" onClick={handleLogoUpload}>
            Upload Logo
          </button>
        </label>

        <label className="form-group">
          <span>Cover Image</span>
          <div className="file-input-wrapper">
            <FaUpload className="upload-icon" />
            <input type="file" onChange={(e) => setCoverFile(e.target.files[0])} />
            <button
              type="button"
              className="preview-btn"
              onClick={() => previewImage(coverUrl)}
              title="Preview Cover Image"
            >
              <FaEye />
            </button>
          </div>
          <button type="button" onClick={handleCoverUpload}>
            Upload Cover
          </button>
        </label>
      </form>

      <div className="edit-club-actions">
        <button
          className="open-editor-btn"
          disabled={!clubId}
          onClick={() => navigate(`/studio/editor/${clubId}`)}
        >
          <FaEye style={{ marginRight: "8px" }} />
          Open Club Page Editor
        </button>
      </div>
    </div>
  );
}

export default EditClub;
