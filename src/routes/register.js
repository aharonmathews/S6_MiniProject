import React, { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./register.css"; // Import the CSS file

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Registration successful!");
      navigate("/login"); // Redirect to login page after registration
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <div className="register-content">
          <h2 className="register-title">Create an Account</h2>
          <p className="register-subtitle">Sign up to get started</p>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleRegister} className="register-form">
            <input
              type="email"
              placeholder="Email"
              className="register-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="register-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              className="register-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit" className="register-button">
              Register
            </button>
          </form>
          <p className="login-text">
            Already have an account ?{' '}
            <span onClick={() => navigate("/")} className="login-account">
              Create an Account
            </span>
          </p>
        </div>
        <div className="image-section">
          <p>Image Placeholder</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
