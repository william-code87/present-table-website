import React, { useState } from "react";
import axios from "axios";

const Login = ({ setLoggedIn, setRegisterMode }) => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const lowerCaseId = id.toLowerCase();
      const response = await axios.post("http://localhost:5000/api/login", {
        id: lowerCaseId,
        password,
      });

      if (response.data.success) {
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("id", lowerCaseId);
        localStorage.setItem("name", response.data.name);
        setLoggedIn(true);
      } else {
        setErrorMessage("Invalid credentials. Please try again.");
      }
    } catch (error) {
      setErrorMessage("ID or Password incorrect");
      console.error("Login error", error);
    }
  };

  return (
    <div className="card p-4 shadow-sm">
      <h2 className="mb-3">Login</h2>
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      <form onSubmit={handleLogin}>
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
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">Login</button>
        <button className="btn btn-link mt-2" onClick={() => setRegisterMode(true)}>Register</button>
      </form>
    </div>
  );
};

export default Login;
