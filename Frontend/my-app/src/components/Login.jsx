import React, { useState } from 'react';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import './Login.css';
import loginIllustration from '../assets/6426047.jpg';
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE}/Login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
        credentials: "include", // 👉 this ensures cookies are saved in browser
      });

      const data = await res.json();

      if (res.ok) {
        alert("Login successful!");
        console.log("User data:", data.user); // optional
        // maybe redirect to dashboard
        window.location.href = "/events";
      } else {
        alert(data.message || "Login failed!");
      }
    } catch (err) {
      console.error("Error during login:", err);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="login-root">
      <div className="login-box">
        {/* Image section on the LEFT */}
        <div className="login-image-section">
          <img
            src={loginIllustration}
            alt="login illustration"
            className="login-illustration"
          />
        </div>

        {/* Form on the RIGHT */}
        <div className="login-form-section">
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            
            <div className="login-input">
              <FaEnvelope />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="login-input">
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

            <div className="login-checkbox-row">
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
              />
              <label>Remember me</label>
            </div>

            <button type="submit" className="login-btn">Login</button>
          </form>

          <div className="forgot-password">
            <a href="/forgot-password">Forgot Password?</a>
          </div>

          <div className="new-member">
            <span>Don't have an account? </span>
            <a href="/signup">Sign up</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
