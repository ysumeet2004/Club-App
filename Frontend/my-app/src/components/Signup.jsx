import React, { useState } from 'react';
import { FaUser, FaPhone, FaEnvelope, FaCodeBranch, FaRegIdBadge, FaLock } from 'react-icons/fa';
import { MdOutlineSchool } from 'react-icons/md';
import { BsFillImageFill, BsInstagram, BsFacebook, BsGlobe2 } from 'react-icons/bs';
import './Signup.css';
import signupIllustration from '../assets/6426047.jpg';
import { Link } from 'react-router-dom';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    branch: '',
    year: '',
    role: 'student',
    clubName: '',
    description: '',
    logo: '',
    coverImage: '',
    facebook: '',
    instagram: '',
    website: '',
    password: '',   // ✅ password field included
    agree: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // ✅ Updated to actually POST data to backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/Signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("Response:", data);

      if (response.ok) {
        alert("Signup successful!");
      } else {
        alert(data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to connect to server.");
    }
  };

  return (
    <div className="signup-root">
      <div className="signup-box">
        <div className="signup-form-section">
          <h2>Sign up</h2>
          <form onSubmit={handleSubmit}>
            <div className="signup-input">
              <FaUser />
              <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="signup-input">
              <FaEnvelope />
              <input type="email" name="email" placeholder="Your Email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="signup-input">
              <FaPhone />
              <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className="signup-input">
              <FaCodeBranch />
              <input type="text" name="branch" placeholder="Branch" value={formData.branch} onChange={handleChange} />
            </div>
            <div className="signup-input">
              <MdOutlineSchool />
              <input type="text" name="year" placeholder="Year" value={formData.year} onChange={handleChange} />
            </div>

            {/* ✅ Password Field */}
            <div className="signup-input">
              <FaLock />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Role */}
            <div className="signup-input">
              <FaRegIdBadge />
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="student">Student</option>
                <option value="club_admin">Club Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            {formData.role === "club_admin" && (
              <>
                <div className="signup-input">
                  <FaUser />
                  <input type="text" name="clubName" placeholder="Club Name" value={formData.clubName} onChange={handleChange} required />
                </div>
                <div className="signup-input">
                  <textarea
                    name="description"
                    placeholder="Club Description"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
                <div className="signup-input">
                  <BsFillImageFill />
                  <input type="url" name="logo" placeholder="Logo URL" value={formData.logo} onChange={handleChange} />
                </div>
                <div className="signup-input">
                  <BsFillImageFill />
                  <input type="url" name="coverImage" placeholder="Cover Image URL" value={formData.coverImage} onChange={handleChange} />
                </div>
                <div className="signup-input">
                  <BsFacebook />
                  <input type="url" name="facebook" placeholder="Facebook" value={formData.facebook} onChange={handleChange} />
                </div>
                <div className="signup-input">
                  <BsInstagram />
                  <input type="url" name="instagram" placeholder="Instagram" value={formData.instagram} onChange={handleChange} />
                </div>
                <div className="signup-input">
                  <BsGlobe2 />
                  <input type="url" name="website" placeholder="Website" value={formData.website} onChange={handleChange} />
                </div>
              </>
            )}

            <div className="signup-checkbox-row">
              <input type="checkbox" name="agree" checked={formData.agree} onChange={handleChange} required />
              <label>
                I agree all statements in&nbsp;
                <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of service</a>
              </label>
            </div>

            <button type="submit" className="signup-btn" disabled={!formData.agree}>Register</button>
          </form>
        </div>

        <div className="signup-image-section">
          <img
            src={signupIllustration}
            alt="signup illustration"
            className="signup-illustration"
          />
          <div className="already-member">
            <Link to="/login">I am already member</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
