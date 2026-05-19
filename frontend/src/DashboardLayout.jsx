import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Home, Users, Calendar, LogOut, LayoutDashboard, User } from "lucide-react";

export default function DashboardLayout({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const current = location.pathname;

  return (
    <div
      className="dashboard-page d-flex"
      style={{
        width: "100%",
        height: "100vh",
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Sidebar */}
      <aside
        className="d-flex flex-column align-items-center py-4 px-2"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "180px",
          background: "#222326",
          minHeight: "100vh",
          height: "100vh",
          boxShadow: "2px 0 8px rgba(0,0,0,0.12)",
          zIndex: 1100,
        }}
      >
        {/* Profile */}
        <div className="profile-sidebar mb-4 d-flex flex-column align-items-center w-100">
          <div
            className="bg-dark text-white px-2 py-2 rounded w-100 d-flex flex-column align-items-center"
            style={{
              borderRadius: "10px",
              border: "1px solid #333",
              boxShadow: "0 0 8px #222",
              gap: "8px",
            }}
          >
            <img
              src={user?.profilePic || "/default-profile.png"}
              alt={user?.name || "User"}
              className="rounded-circle"
              style={{ width: "48px", height: "48px", border: "2px solid #444" }}
            />
            <span style={{ fontSize: "1rem", fontWeight: 500, letterSpacing: "0.5px" }}>{user?.name || "User"}</span>
          </div>
        </div>
        {/* Nav Buttons with active state */}
        <button
          className={`btn w-100 mb-3 d-flex align-items-center justify-content-start sidebar-btn${current === "/dashboard" ? " sidebar-btn-active" : ""}`}
          style={{
            color: "#fff",
            background: current === "/dashboard" ? "#444" : "#222",
            fontWeight: 600,
            border: current === "/dashboard" ? "2px solid #00c6ff" : "2px solid #222",
            borderRadius: "8px",
            boxShadow: "0 0 4px #222",
            gap: "10px",
            position: "relative",
          }}
          onClick={() => navigate("/dashboard")}
          title="Dashboard"
        >
          <LayoutDashboard size={20} /> Dashboard
        </button>
        <button
          className={`btn w-100 mb-3 d-flex align-items-center justify-content-start sidebar-btn${current === "/dashboard/profile" ? " sidebar-btn-active" : ""}`}
          style={{
            color: "#fff",
            background: current === "/dashboard/profile" ? "#444" : "#222",
            fontWeight: 600,
            border: current === "/dashboard/profile" ? "2px solid #00c6ff" : "2px solid #222",
            borderRadius: "8px",
            boxShadow: "0 0 4px #222",
            gap: "10px",
            position: "relative",
          }}
          onClick={() => navigate("/dashboard/profile")}
          title="Profile"
        >
          <User size={20} /> Profile
        </button>
        <button
          className={`btn btn-dark w-100 mb-3 d-flex align-items-center justify-content-start sidebar-btn${current === "/dashboard/events" ? " sidebar-btn-active" : ""}`}
          style={{ color: "#fff", gap: "10px", background: current === "/dashboard/events" ? "#444" : "#222" }}
          onClick={() => navigate("/dashboard/events")}
          title="Events"
        >
          <Calendar size={20} /> Events
        </button>
        <button
          className={`btn btn-dark w-100 mb-3 d-flex align-items-center justify-content-start sidebar-btn${current === "/dashboard/communities" ? " sidebar-btn-active" : ""}`}
          style={{ color: "#fff", gap: "10px", background: current === "/dashboard/communities" ? "#444" : "#222" }}
          onClick={() => navigate("/dashboard/communities")}
          title="Communities"
        >
          <Users size={20} /> Communities
        </button>
        <button
          className="btn w-100 mt-auto d-flex align-items-center justify-content-start sidebar-btn"
          style={{
            background: "#d32f2f",
            color: "#fff",
            fontSize: "0.85rem",
            padding: "4px 0",
            borderRadius: "8px",
            width: "70%",
            margin: "0 auto 8px auto",
            gap: "10px",
          }}
          onClick={() => {
            if (setUser) setUser(null);
            localStorage.removeItem("token");
            localStorage.removeItem("user_id");
            localStorage.removeItem("user");
            navigate("/login");
          }}
          title="Logout"
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>
      {/* Main Content */}
      <div
        className="flex-grow-1 position-relative"
        style={{
          marginLeft: "180px",
          height: "100vh",
          width: "calc(100% - 180px)",
          overflow: "auto",
        }}
      >
        {/* Top Navbar */}
        <nav
          className="navbar navbar-dark shadow-sm px-3 d-flex justify-content-between align-items-center"
          style={{
            position: "fixed",
            top: 0,
            left: "180px",
            width: "calc(100% - 180px)",
            zIndex: 1000,
            boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
            borderBottom: "1px solid #333",
            background: "linear-gradient(90deg, #232526 0%, #1a1a1a 100%)",
          }}
        >
          <span
            className="navbar-brand mb-0 h4 fw-bold d-flex align-items-center gap-2"
            style={{
              color: "#fff",
              fontSize: "1.5rem",
              letterSpacing: "1px",
              textShadow: "0 2px 8px rgba(0,0,0,0.18)",
            }}
          >
            <Home size={22} style={{ marginRight: "8px" }} /> Campus Buzz 🚀
          </span>
        </nav>
        <div style={{ position: "relative", width: "100%", height: "100vh", margin: 0, padding: 0, paddingTop: "60px" }}>
          <Outlet />
        </div>
      </div>
      <style>{`
        .sidebar-btn {
          transition: background 0.2s, color 0.2s;
        }
        .sidebar-btn:hover {
          background: #333;
          color: #00c6ff;
        }
        .sidebar-btn-active {
          background: #222;
          color: #00c6ff;
          border-color: #00c6ff;
        }
      `}</style>
    </div>
  );
}
