import React, { useState, useEffect } from "react";
import axios from "axios";
import CalendarView from "./calendar";

const Dashboard = ({ setLoggedIn }) => {
  const [name, setName] = useState(localStorage.getItem("name") || "");
  const [calendarUrl, setCalendarUrl] = useState("");
  const [userCalendarUrl, setUserCalendarUrl] = useState("");
  const [events, setEvents] = useState({});
  const [idleTime, setIdleTime] = useState(0);
  const [filter, setFilter] = useState("date"); // 'name' atau 'date'
  const [selectedCategories, setSelectedCategories] = useState(["請假", "遠端", "現場"]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);


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

  const calculateDuration = (start, end) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    return Math.floor((endTime - startTime) / 60000); // Hasil dalam menit
  };

  const formatTime = (dateTime) => {
    const date = new Date(dateTime);
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  const formatDate = (dateTime) => {
    return new Date(dateTime).toLocaleDateString("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  

  const groupEventsByName = () => {
    const grouped = {};
    Object.entries(events).forEach(([email, userEvents]) => {
      if (!userEvents.events) return; // Mencegah error
      userEvents.events.forEach((event) => {
        if (!grouped[event.summary]) {
          grouped[event.summary] = [];
        }
        grouped[event.summary].push({
          ...event,
          userName: userEvents.name,
          duration: calculateDuration(event.start, event.end),
        });
      });
    });
    return grouped;
  };
    

  const groupEventsByDate = () => {
    const grouped = {};
    Object.entries(events).forEach(([email, userEvents]) => {
      userEvents.events.forEach((event) => {
        const date = new Date(event.start).toISOString().split("T")[0].replace(/-/g, "/");
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push({
          ...event,
          userName: userEvents.name,
        });
      });
    });
    return grouped;
  };

  const groupEventsByUser = () => {
    const grouped = {};
    Object.entries(events).forEach(([email, userEvents]) => {
      if (!grouped[userEvents.name]) {
        grouped[userEvents.name] = {
          totalRemoteDuration: 0,
          totalOnsiteDuration: 0,
          details: [],
        };
      }
      userEvents.events.forEach((event) => {
        const eventMonth = new Date(event.start).getMonth() + 1;
        if (eventMonth === selectedMonth) { // Filter event hanya untuk bulan yang dipilih
          const duration = calculateDuration(event.start, event.end);
          if (event.summary.includes("遠端")) {
            grouped[userEvents.name].totalRemoteDuration += duration;
          } else if (event.summary.includes("現場")) {
            grouped[userEvents.name].totalOnsiteDuration += duration;
          }
          grouped[userEvents.name].details.push({
            ...event,
            userName: userEvents.name,
            duration: `${Math.floor(duration / 60)}h ${duration % 60}m`,
          });
        }
      });
    });
    return grouped;
  };

  const handleFilterChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const filteredEvents = (eventList) => {
    return eventList.filter((event) =>
      selectedCategories.some((category) => event.summary.includes(category)) &&
      new Date(event.start).getMonth() + 1 === selectedMonth
    );
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

        <div>
          <label>Filter by: </label>
          <select onChange={(e) => setFilter(e.target.value)} value={filter}>
            <option value="date">Date</option>
            <option value="name">Event Name</option>
            <option value="user">User</option>
          </select>
        </div>

        {filter !== "date" && (
          <>
            <div className="mt-3">
              <label>Select month: </label>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} 月
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3">
              <label>Show only: </label>
              {["請假", "遠端", "現場"].map((category) => (
                <label key={category} className="mx-2">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleFilterChange(category)}
                  />
                  {category}
                </label>
              ))}
            </div>
          </>
        )}

        {filter === "name" ? (
          <div>
            {Object.entries(groupEventsByName()).map(([eventName, details]) => (
              <div key={eventName} className="card mt-3 p-3">
                <h5>{eventName}</h5>
                <ul>
                  {filteredEvents(details).map((event, index) => (
                    <li key={index}>
                      <strong>{event.userName}</strong>: {formatDate(event.start)} {formatTime(event.start)} - {formatTime(event.end)} ({formatDuration(event.duration)})
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : filter === "user" ? (
          <div>
            {Object.entries(groupEventsByUser()).map(([userName, data]) => (
              <div key={userName} className="card mt-3 p-3">
                <h5>{userName}</h5>
                <p>
                  遠端: {Math.floor(data.totalRemoteDuration / 60)}h {data.totalRemoteDuration % 60}m, 
                  現場: {Math.floor(data.totalOnsiteDuration / 60)}h {data.totalOnsiteDuration % 60}m
                </p>
                <ul>
                  {filteredEvents(data.details).map((event, index) => (
                    <li key={index}>
                      {event.summary}: {formatDate(event.start)} {formatTime(event.start)} - {formatTime(event.end)} ({event.duration})
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <CalendarView events={events} />
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
