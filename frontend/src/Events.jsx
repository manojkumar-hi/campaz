import React, { useState } from "react";

export default function Events() {
  const [event, setEvent] = useState({ name: "", department: "", date: "", location: "" });
  const [events, setEvents] = useState([
    { name: "Tech Talk", department: "CSE", date: "2025-09-10" },
    { name: "Sports Meet", department: "PE", date: "2025-09-15" },
    { name: "Art Expo", department: "Arts", date: "2025-09-20" }
  ]);
  const handleChange = (e) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setEvents([{ name: event.name, department: event.department, date: event.date }, ...events]);
    setEvent({ name: "", department: "", date: "", location: "" });
  };
  return (
    <div style={{ minHeight: "100vh", background: "#222326", padding: "32px" }}>
      <div className="container" style={{ maxWidth: "380px", background: "#18191a", borderRadius: "12px", boxShadow: "0 2px 12px #111", padding: "24px", marginBottom: "32px" }}>
        <h2 style={{ color: "#00c6ff", marginBottom: "18px", fontSize: "1.3rem" }}>Create Event</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="form-label text-light">Event Name</label>
            <input type="text" className="form-control bg-dark text-light" name="name" value={event.name} onChange={handleChange} required />
          </div>
          <div className="mb-2">
            <label className="form-label text-light">Department</label>
            <input type="text" className="form-control bg-dark text-light" name="department" value={event.department} onChange={handleChange} required />
          </div>
          <div className="mb-2">
            <label className="form-label text-light">Date</label>
            <input type="date" className="form-control bg-dark text-light" name="date" value={event.date} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary w-100 mt-2">Create Event</button>
        </form>
      </div>
      <div className="d-flex flex-wrap" style={{ gap: "16px", justifyContent: "flex-start" }}>
        {events.map((ev, idx) => (
          <div key={idx} style={{ flex: "1 1 260px", minWidth: "260px", maxWidth: "320px" }}>
            <div className="card bg-dark text-light mb-3" style={{ borderRadius: "10px", boxShadow: "0 2px 8px #111", border: "1px solid #333" }}>
              <div className="card-body">
                <h5 className="card-title" style={{ color: "#00c6ff", fontSize: "1.1rem" }}>{ev.name}</h5>
                <p className="card-text mb-1" style={{ fontSize: "0.95rem" }}><strong>Department:</strong> {ev.department}</p>
                <p className="card-text" style={{ fontSize: "0.95rem" }}><strong>Date:</strong> {ev.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
