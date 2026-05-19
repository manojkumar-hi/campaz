import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "./api";

axios.defaults.baseURL = API_BASE_URL;

export default function Signup() {
  const [form, setForm] = useState({ name: "", bio: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1: signup, 2: OTP
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(0); // seconds
  const [otpExpired, setOtpExpired] = useState(false);
  const navigate = useNavigate();

  const OTP_DURATION = 300; // 5 minutes

  const validate = () => {
    let errs = {};
    if (!form.name) errs.name = "Name required";
    if (!form.bio) errs.bio = "Bio required";
    if (!form.email) errs.email = "Email required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email";
    if (!form.password) errs.password = "Password required";
    else if (form.password.length < 6) errs.password = "Min 6 characters";
    if (!form.confirmPassword) errs.confirmPassword = "Confirm password";
    else if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const startTimer = () => {
    setTimer(OTP_DURATION);
    setOtpExpired(false);
  };

  // Countdown effect
  useEffect(() => {
    if (timer <= 0) {
      setOtpExpired(true);
      return;
    }
    const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleSignup = async () => {
    if (!validate()) return;
    try {
      const res = await axios.post("/auth/signup", {
        name: form.name,
        bio: form.bio,
        email: form.email,
        password: form.password
      });
      setMessage(res.data.message);
      setStep(2);
      startTimer();
    } catch (err) {
      setMessage(err.response?.data?.detail || "Signup failed");
    }
  };

  const handleVerify = async () => {
    if (otpExpired) {
      setMessage("OTP expired. Please resend.");
      return;
    }
    try {
      const res = await axios.post("/auth/verify-email", { email: form.email, otp });
      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.detail || "Invalid OTP, try again.");
    }
  };

  const handleResend = async () => {
    try {
      const res = await axios.post("/auth/signup", {
        name: form.name,
        bio: form.bio,
        email: form.email,
        password: form.password
      });
      setMessage("OTP resent. Check your email.");
      startTimer();
    } catch (err) {
      setMessage(err.response?.data?.detail || "Failed to resend OTP.");
    }
  };

  return (
    <div className="signup-page">
      <div className="falling-icons">
        <span>🎓</span><span>📚</span><span>📝</span><span>🎓</span><span>📖</span>
        <span>✏️</span><span>📚</span><span>🎓</span><span>📖</span><span>📝</span>
      </div>

      <div className="signup-box">
        <h2 className="text-center mb-3">Join StudentHub</h2>
        <p className="text-center tagline">Empowering students with knowledge and responsibility ✨</p>

        {message && <div className={`alert ${step === 1 ? "alert-info" : "alert-success"}`}>{message}</div>}

        {step === 1 && (
          <div>
            <input className="form-control mb-2" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            {errors.name && <div className="error-msg">{errors.name}</div>}

            <input className="form-control mb-2" placeholder="Bio" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
            {errors.bio && <div className="error-msg">{errors.bio}</div>}

            <input className="form-control mb-2" type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            {errors.email && <div className="error-msg">{errors.email}</div>}

            <input className="form-control mb-2" type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            {errors.password && <div className="error-msg">{errors.password}</div>}

            <input className="form-control mb-3" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
            {errors.confirmPassword && <div className="error-msg">{errors.confirmPassword}</div>}

            <button className="btn btn-primary w-100" onClick={handleSignup}>Signup</button>
          </div>
        )}

        {step === 2 && (
          <div className="otp-box">
            <input className="form-control mb-3" placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} />
            <div className="timer mb-2">
              Time left: {`${Math.floor(timer / 60).toString().padStart(2, "0")}:${(timer % 60).toString().padStart(2, "0")}`}
            </div>
            <button className="btn btn-success w-100 mb-2" onClick={handleVerify} disabled={otpExpired}>Verify OTP</button>
            {otpExpired && <button className="btn btn-warning w-100" onClick={handleResend}>Resend OTP</button>}
          </div>
        )}

        <div className="text-center mt-3">
          <span
            style={{
              color: '#00c6ff',
              fontStyle: 'italic',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: 500,
            }}
            onClick={() => navigate('/login')}
          >
            Already have an account? Login
          </span>
        </div>
      </div>
    </div>
  );
}
