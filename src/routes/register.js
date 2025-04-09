import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./register.css";
import registerimage from "../assets/login.jpg";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Connect to MetaMask and get wallet address
  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      return accounts[0];
    } else {
      throw new Error("MetaMask not detected. Please install MetaMask.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const walletAddress = await connectWallet();

      // Check if this wallet is already registered
      const walletRef = doc(db, "wallets", walletAddress);
      const walletSnap = await getDoc(walletRef);

      if (walletSnap.exists()) {
        setError("This wallet address is already linked to another account. Try logging in.");
        return;
      }

      // Register with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Save wallet info to Firestore
      await setDoc(walletRef, {
        uid: userCredential.user.uid,
        email: email,
        createdAt: new Date(),
      });

      alert("Registration successful!");
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.message || "Registration failed.");
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
            Already have an account?{" "}
            <span onClick={() => navigate("/")} className="login-account">
              Log in
            </span>
          </p>
        </div>
        <div className="image-section">
        <img src={registerimage} className="register-image"></img>
        </div>
      </div>
    </div>
  );
};

export default Register;
