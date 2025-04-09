import React, { useState } from "react";
import { auth } from "../firebase.js";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./login.css"; // Import the CSS file
import loginimage from "../assets/login.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful!");
      navigate("/block"); // Redirect after login
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-content">
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Login to access your account</p>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="email"
              placeholder="Email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="login-button">
              Login
            </button>
          </form>
          <p className="register-text">
            Don't have an account ?{' '}
            <span onClick={() => navigate("/register")} className="create-account">
              Create an Account
            </span>
          </p>
          
        </div>
        <div className="image-section">
          <img src={loginimage} className="login-image"></img>
        </div>
      </div>
    </div>
  );
};

export default Login;
