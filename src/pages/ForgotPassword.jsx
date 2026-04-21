import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { validatePassword } from "../utils/validation";
import "../styles/pages/ForgotPassword.scss";

const API = import.meta.env.VITE_API_URL;

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/forgot-password`, { email });
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }
    const pwError = validatePassword(newPassword);
    if (pwError) { setError(pwError); return; }
    setLoading(true);
    try {
      const { encryptPassword } = await import("../utils/encryption");
      const encryptedPassword = await encryptPassword(newPassword);
      const res = await axios.post(`${API}/api/auth/reset-password`, {
        email,
        resetToken: resetCode,
        newPassword: encryptedPassword,
      });
      setMessage(res.data.message);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="forgot-password">
        <div className="forgot-password__card">
          <div className="forgot-password__success-icon">✓</div>
          <h2 className="forgot-password__title">Password Reset Successful!</h2>
          <p className="forgot-password__message">{message}</p>
          <button className="forgot-password__button" onClick={() => navigate("/login")}>→ Proceed to Login</button>
          <button className="forgot-password__back-btn" onClick={() => navigate("/")}>← Back to Home</button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="forgot-password">
        <div className="forgot-password__card">
          <h2 className="forgot-password__title">🔐 Reset Your Password</h2>
          <p className="forgot-password__subtitle">{message}</p>
          <form onSubmit={handleResetPassword} className="forgot-password__form">
            <div className="forgot-password__field">
              <label className="forgot-password__label">Reset Code</label>
              <input type="text" value={resetCode} onChange={(e) => setResetCode(e.target.value)}
                placeholder="Enter 6-digit code" className="forgot-password__input" maxLength={6} required autoFocus />
            </div>
            <div className="forgot-password__field">
              <label className="forgot-password__label">New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password" className="forgot-password__input" required />
            </div>
            <div className="forgot-password__field">
              <label className="forgot-password__label">Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password" className="forgot-password__input" required />
            </div>
            {error && <p className="forgot-password__error">{error}</p>}
            <button type="submit" className="forgot-password__button" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
            <button type="button" onClick={() => { setStep(1); setResetCode(""); setError(""); setMessage(""); }}
              className="forgot-password__back-btn">← Back</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password">
      <div className="forgot-password__card">
        <div className="forgot-password__header">
          <h2 className="forgot-password__title">🔑 Forgot Password</h2>
          <p className="forgot-password__subtitle">Enter your email to receive a reset code</p>
        </div>
        <form onSubmit={handleRequestReset} className="forgot-password__form">
          <div className="forgot-password__field">
            <label className="forgot-password__label">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" className="forgot-password__input" required autoFocus />
          </div>
          {error && <p className="forgot-password__error">{error}</p>}
          <button type="submit" className="forgot-password__button" disabled={loading}>
            {loading ? "Sending Code..." : "Send Reset Code"}
          </button>
        </form>
        <div className="forgot-password__divider">or</div>
        <p className="forgot-password__link">
          Remember your password? <Link to="/login" className="forgot-password__link-text">Login here</Link>
        </p>
        <button type="button" onClick={() => navigate("/")} className="forgot-password__back-btn">← Back to Home</button>
      </div>
    </div>
  );
}
