import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  const [id, setId] = useState(localStorage.getItem("id") || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState(localStorage.getItem("name") || "");
  const [calendarUrl, setCalendarUrl] = useState("");
  const [events, setEvents] = useState({});
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("loggedIn"));
  const [registerMode, setRegisterMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userCalendarUrl, setUserCalendarUrl] = useState(""); 
  
  let logoutTimer;

  const startLogoutTimer = () => {
    clearTimeout(logoutTimer);
    logoutTimer = setTimeout(() => {
      handleLogout();
    }, 5 * 60 * 1000);
  };

  const resetLogoutTimer = () => {
    startLogoutTimer();
  };

  useEffect(() => {
    if (loggedIn) {
      startLogoutTimer();
      window.addEventListener("mousemove", resetLogoutTimer);
      window.addEventListener("keydown", resetLogoutTimer);
    }
    return () => {
      clearTimeout(logoutTimer);
      window.removeEventListener("mousemove", resetLogoutTimer);
      window.removeEventListener("keydown", resetLogoutTimer);
    };
  }, [loggedIn]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/events");
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    if (loggedIn) {
      fetchEvents();
      // Ambil URL kalender yang sudah ada
      axios.get(`http://localhost:5000/api/get_calendar?user_email=${id}`)
        .then(response => {
          // Jika ada URL kalender, simpan di state
          if (response.data.calendarUrl) {
            setUserCalendarUrl(response.data.calendarUrl);
          }
        })
        .catch(error => {
          console.error("Error fetching calendar URL", error);
        });
      const interval = setInterval(fetchEvents, 10000);
      return () => clearInterval(interval);
    }
  }, [loggedIn]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      const lowerCaseId = id.toLowerCase();
      const response = await axios.post("http://localhost:5000/api/login", { id:lowerCaseId, password });
      if (response.data.success) {
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("id", lowerCaseId);
        localStorage.setItem("name", response.data.name);
        setId(lowerCaseId);
        setName(response.data.name);
        setLoggedIn(true);
        startLogoutTimer();
      } else {
        setErrorMessage("Invalid credentials. Please try again.");
      }
    } catch (error) {
      setErrorMessage("ID or Password incorrect");
      console.error("Login error", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear(); // Bersihkan semua localStorage
    setLoggedIn(false);
    setId("");
    setPassword("");
    setName("");
    setEvents({});
    window.location.reload();
  };

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
      await axios.post("http://localhost:5000/api/register", { id: lowerCaseId, name, password });
      alert("Registration successful! You can now log in.");
      setRegisterMode(false);
    } catch (error) {
      console.error("Registration error", error);
      setErrorMessage("Failed to register.");
    }
  };

  const handleAddCalendar = async () => {
    if (calendarUrl) {
      try {
        await axios.post("http://localhost:5000/api/add_calendar", {
          calendar_url: calendarUrl,
          user_email: id,
        });
        alert("Calendar added successfully!");
        setCalendarUrl("");

        // 🔄 Ambil ulang event setelah menambahkan kalender
        fetchEvents();
      } catch (error) {
        console.error("Error adding calendar:", error);
        alert("Failed to add calendar.");
      }
    }
  };

  return (
    <div className="container mt-5">
      {!loggedIn ? (
        <div className="card p-4 shadow-sm">
          {registerMode ? (
            <>
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
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      ) : (
        <div>
          <h2>Welcome, {name}</h2>
          <button className="btn btn-danger mt-2" onClick={handleLogout}>Logout</button>
          <div className="card p-4 shadow-sm mt-3">
            <h4>Add Google Calendar URL</h4>
            {userCalendarUrl ? (
              // Jika URL kalender sudah ada, tampilkan pesan dan sembunyikan form
              <div>
                <p>Calendar URL is already added. If you want to change the URL, please contact the admin.</p>
              </div>
            ) : (
              // Jika URL kalender belum ada, tampilkan form untuk menambahkannya
              <>
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Enter Google Calendar URL"
                  value={calendarUrl}
                  onChange={(e) => setCalendarUrl(e.target.value)}
                />
                <button className="btn btn-success" onClick={handleAddCalendar}>Add Calendar</button>
              </>
            )}
          </div>
          <div className="mt-4">
            <h4>Events</h4>
            {Object.entries(events).length === 0 ? (
              <p>No events found.</p>
            ) : (
              Object.entries(events).map(([email, userEvents]) => (
                <div key={email} className="card mt-3 p-3">
                  <h5>{userEvents.name}</h5>
                  <ul>
                    {(userEvents.events || []).map((event, index) => (
                      <li key={index}>{event.summary} ({event.start} - {event.end})</li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
