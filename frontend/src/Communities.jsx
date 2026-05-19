import React, { useState } from "react";

export default function Communities() {
  const [community, setCommunity] = useState({ name: "", description: "", department: "" });
  const [communities, setCommunities] = useState([
    { name: "Coding Club", department: "CSE", description: "For coding enthusiasts" },
    { name: "Art Society", department: "Arts", description: "Creative minds unite" },
    { name: "Sports Squad", department: "PE", description: "All about sports" }
  ]);
  const handleChange = (e) => {
    setCommunity({ ...community, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setCommunities([{ name: community.name, department: community.department, description: community.description }, ...communities]);
    setCommunity({ name: "", description: "", department: "" });
  };
  return (
    <div style={{ minHeight: "100vh", background: "#222326", padding: "32px" }}>
      <div className="container" style={{ maxWidth: "380px", background: "#18191a", borderRadius: "12px", boxShadow: "0 2px 12px #111", padding: "24px", marginBottom: "32px" }}>
        <h2 style={{ color: "#00c6ff", marginBottom: "18px", fontSize: "1.3rem" }}>Create Student Community</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="form-label text-light">Community Name</label>
            <input type="text" className="form-control bg-dark text-light" name="name" value={community.name} onChange={handleChange} required />
          </div>
          <div className="mb-2">
            <label className="form-label text-light">Description</label>
            <textarea className="form-control bg-dark text-light" name="description" value={community.description} onChange={handleChange} required rows={2} />
          </div>
          <div className="mb-2">
            <label className="form-label text-light">Department</label>
            <input type="text" className="form-control bg-dark text-light" name="department" value={community.department} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary w-100 mt-2">Create Community</button>
        </form>
      </div>
      <div className="d-flex flex-wrap" style={{ gap: "16px", justifyContent: "flex-start" }}>
        {communities.map((com, idx) => (
          <div key={idx} style={{ flex: "1 1 260px", minWidth: "260px", maxWidth: "320px" }}>
            <div className="card bg-dark text-light mb-3" style={{ borderRadius: "10px", boxShadow: "0 2px 8px #111", border: "1px solid #333" }}>
              <div className="card-body">
                <h5 className="card-title" style={{ color: "#00c6ff", fontSize: "1.1rem" }}>{com.name}</h5>
                <p className="card-text mb-1" style={{ fontSize: "0.95rem" }}><strong>Department:</strong> {com.department}</p>
                <p className="card-text" style={{ fontSize: "0.95rem" }}><strong>Description:</strong> {com.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
