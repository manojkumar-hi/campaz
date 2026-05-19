import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "./api";

axios.defaults.baseURL = API_BASE_URL;

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.access_token); // store token
      localStorage.setItem("user_id", res.data.user._id); // store user id for like/unlike
      if (onLogin) onLogin(res.data.user); // send user info to parent
      navigate("/dashboard");
    } catch (err) {
      setMessage(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="login-page">
      <div className="falling-icons">
        <span>📘</span><span>💡</span><span>🎓</span><span>📝</span>
        <span>📚</span><span>⚡</span><span>✨</span><span>🚀</span>
        <span>🔑</span><span>🌟</span>
      </div>

      <div className="login-box">
        <h2>Login</h2>
        <p className="tagline">Welcome back! Please login to continue 🚀</p>

        {message && <div className="error-msg">{message}</div>}

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>Login</button>

        <div className="text-center mt-3">
          <span
            style={{
              color: '#00c6ff',
              fontStyle: 'italic',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: 500,
            }}
            onClick={() => navigate('/signup')}
          >
            Don't have an account? Sign up
          </span>
        </div>
      </div>
    </div>
  );
}
