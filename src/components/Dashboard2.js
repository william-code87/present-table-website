import React, { useState, useEffect } from "react";
import axios from "axios";

const Dashboard = ({ setLoggedIn }) => {
  const [name, setName] = useState(localStorage.getItem("name") || "");
  const [calendarUrl, setCalendarUrl] = useState("");
  const [userCalendarUrl, setUserCalendarUrl] = useState("");
  const [events, setEvents] = useState({});
  const [idleTime, setIdleTime] = useState(0);

  // Fungsi logout otomatis jika idle lebih dari 5 menit
  useEffect(() => {
    const resetIdleTime = () => setIdleTime(0);

    const interval = setInterval(() => {
      setIdleTime((prev) => prev + 1);
      if (idleTime >= 5 * 60) {
        handleLogout();
      }
    }, 1000);

    window.addEventListener("mousemove", resetIdleTime);
    window.addEventListener("keydown", resetIdleTime);

    return () => {
      clearInterval(interval);
      window.removeEventListener("mousemove", resetIdleTime);
      window.removeEventListener("keydown", resetIdleTime);
    };
  }, [idleTime]);

  // Ambil data kalender & event saat komponen pertama kali dirender
  useEffect(() => {
    fetchCalendar();
    fetchEvents();
    
    // Update events setiap 30 detik
    const eventInterval = setInterval(fetchEvents, 30000);

    return () => clearInterval(eventInterval);
  }, []);

  const fetchCalendar = async () => {
    const userEmail = localStorage.getItem("id");
    if (!userEmail) {
      console.error("User email is missing in localStorage");
      return;
    }
  
    try {
      const response = await axios.get(`http://localhost:5000/api/get_calendar?user_email=${userEmail}`);
      if (response.data && response.data.calendarUrl) {
        setUserCalendarUrl(response.data.calendarUrl);
      }
    } catch (error) {
      console.error("Error fetching calendar URL", error);
    }
  };
  

  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/events");
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setLoggedIn(false);
    window.location.reload();
  };

  const handleAddCalendar = async () => {
    if (calendarUrl) {
      try {
        await axios.post("http://localhost:5000/api/add_calendar", {
          calendar_url: calendarUrl,
          user_email: localStorage.getItem("id"),
        });
        alert("Calendar added successfully!");
        setCalendarUrl("");
        fetchCalendar();
        fetchEvents();
      } catch (error) {
        console.error("Error adding calendar:", error);
        alert("Failed to add calendar.");
      }
    }
  };

  return (
    <div>
      <h2>Welcome, {name}</h2>
      <button className="btn btn-danger mt-2" onClick={handleLogout}>Logout</button>
      <div className="card p-4 shadow-sm mt-3">
        <h4>Add Google Calendar URL</h4>
        {userCalendarUrl ? <p>Calendar already added.</p> : (
          <>
            <input type="text" className="form-control mb-2" placeholder="Enter URL" value={calendarUrl} onChange={(e) => setCalendarUrl(e.target.value)} />
            <button className="btn btn-success" onClick={handleAddCalendar}>Add</button>
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
  );
};

export default Dashboard;
