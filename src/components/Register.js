import React, { useState } from "react";
import axios from "axios";

const Register = ({ setRegisterMode }) => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validatePassword = (password) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*]/.test(password)
    );
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validatePassword(password)) {
      setErrorMessage("Password must be at least 8 characters, include a number, uppercase letter, and a special character.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      const lowerCaseId = id.toLowerCase();
      await axios.post("https://calendar-api-backend.onrender.com/api/register", { id: lowerCaseId, name, password });
      alert("Registration successful! You can now log in.");
      setRegisterMode(false);
    } catch (error) {
      console.error("Registration error", error);
      setErrorMessage("Failed to register.");
    }
  };

  return (
    <div className="card p-4 shadow-sm">
      <h2 className="mb-3">Register</h2>
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      <form onSubmit={handleRegister}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">ID</label>
          <input
            type="text"
            className="form-control"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Confirm Password</label>
          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>
        <button type="submit" className="btn btn-success w-100">Register</button>
        <button className="btn btn-link mt-2" onClick={() => setRegisterMode(false)}>Back to Login</button>
      </form>
    </div>
  );
};

export default Register;
