import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { API_BASE_URL } from "./api";
import Home from "./Home";
import Signup from "./Signup";
import Login from "./Login";
import DashboardLayout from "./DashboardLayout";
import Dashboard from "./Dashboard";
import Events from "./Events";
import Communities from "./Communities";
import Profile from "./Profile";
import './App.css';

export default function App() {
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem("posts");
    return saved ? JSON.parse(saved) : [];
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    localStorage.setItem("posts", JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    // Refetch user profile whenever token changes
    const token = localStorage.getItem("token");  
    if (!token) {
      setUser(null);
      return;
    }
    fetch(`${API_BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject("Failed to fetch profile")))
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, [localStorage.getItem("token")]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
  <Route path="/login" element={<Login onLogin={setUser} />} />
      <Route path="/dashboard/*" element={<DashboardLayout user={user} setUser={setUser} />}> 
        <Route index element={<Dashboard posts={posts} setPosts={setPosts} user={user} />} />
        <Route path="profile" element={<Profile posts={posts} setPosts={setPosts} user={user} setUser={setUser} />} />
        <Route path="events" element={<Events />} />
        <Route path="communities" element={<Communities />} />
      </Route>
      <Route path="*" element={<div style={{color: 'white', padding: '2rem'}}>Page not found</div>} />
    </Routes>
  );
}