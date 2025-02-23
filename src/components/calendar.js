import React, { useState } from "react";
import dayjs from "dayjs";
import "bootstrap/dist/css/bootstrap.min.css";

const CalendarView = ({ events }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const today = dayjs();
  const [currentMonth, setCurrentMonth] = useState(today);

  const daysInMonth = currentMonth.daysInMonth();
  const startDay = currentMonth.startOf("month").day();

  const prevMonth = () => setCurrentMonth(currentMonth.subtract(1, "month"));
  const nextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));

  const formatDate = (date) => date.format("YYYY-MM-DD");

  const getEventsForDate = (date) => {
    return Object.values(events)
      .flatMap(user => user.events.map(event => ({
        ...event,
        userName: user.name
      })))
      .filter(event => formatDate(dayjs(event.start)) === formatDate(date));
  };

  if (selectedDate) {
    const eventList = getEventsForDate(selectedDate);
    return (
      <div className="container mt-4">
        <button onClick={() => setSelectedDate(null)} className="btn btn-secondary mb-4">
          Back
        </button>
        <h3 className="fw-bold">{formatDate(selectedDate)}</h3>
        {eventList.length > 0 ? (
          eventList.map((event, index) => (
            <p key={index} className="mt-2">
              <strong>{event.userName}</strong>: {event.summary} ({dayjs(event.start).format("HH:mm")} - {dayjs(event.end).format("HH:mm")}) ({Math.floor((dayjs(event.end) - dayjs(event.start)) / 60000 / 60)}h {((dayjs(event.end) - dayjs(event.start)) / 60000) % 60}m)
            </p>
          ))
        ) : (
          <p>No event.</p>
        )}
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button onClick={prevMonth} className="btn btn-secondary">{"<"}</button>
        <h2 className="fw-bold">{currentMonth.format("YYYY MMMM")}</h2>
        <button onClick={nextMonth} className="btn btn-secondary">{">"}</button>
      </div>

      {/* Header Hari */}
      <div className="row text-center fw-bold bg-light border">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="col border py-2">{day}</div>
        ))}
      </div>

      {/* Grid Kalender per Minggu */}
      <div className="border rounded overflow-hidden">
        {Array.from({ length: Math.ceil((startDay + daysInMonth) / 7) }).map((_, weekIndex) => (
          <div key={weekIndex} className="row">
            {Array.from({ length: 7 }).map((_, dayIndex) => {
              const dayNumber = weekIndex * 7 + dayIndex - startDay + 1;
              if (dayNumber < 1 || dayNumber > daysInMonth) {
                return <div key={`empty-${weekIndex}-${dayIndex}`} className="col border bg-light p-4"></div>;
              }
              const date = currentMonth.date(dayNumber);
              const eventList = getEventsForDate(date);
              const hasEvent = eventList.length > 0;

              return (
                <div
                  key={dayNumber}
                  onClick={() => setSelectedDate(date)}
                  className="col border p-4 text-center bg-white rounded-3 position-relative"
                  style={{ cursor: "pointer" }}
                >
                  <span className="fw-semibold">{dayNumber}</span>
                  {hasEvent && <div className="bg-danger rounded-circle position-absolute" style={{ width: "8px", height: "8px", bottom: "5px", right: "5px" }}></div>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;
