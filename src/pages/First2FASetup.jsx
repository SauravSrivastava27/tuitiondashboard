import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/pages/First2FASetup.scss";

const API = import.meta.env.VITE_API_URL;

export default function First2FASetup() {
  const navigate = useNavigate();
  const location = useLocation();
  const username = location.state?.username || "";

  const [step, setStep] = useState(1);
  const [qrCode, setQrCode] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateQR = async () => {
    if (!username) { setError("Username not provided"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API}/api/auth/setup-first-2fa`, { username });
      setQrCode(res.data.qrCode);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate QR code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) { setError("OTP must be 6 digits"); return; }
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API}/api/auth/verify-first-2fa`, { username, otp });
      setStep(3);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="first-2fa">
        <div className="first-2fa__card">
          <div className="first-2fa__success-icon">✓</div>
          <h2 className="first-2fa__title">2FA Setup Complete!</h2>
          <p className="first-2fa__message">Your two-factor authentication has been set up successfully.</p>
          <p className="first-2fa__redirect-message">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="first-2fa">
        <div className="first-2fa__card">
          <h2 className="first-2fa__title">🔐 Verify Your Setup</h2>
          <div className="first-2fa__qr-wrapper">
            {qrCode && <img src={qrCode} alt="2FA QR Code" className="first-2fa__qr-image" />}
          </div>
          <p className="first-2fa__qr-help">Scan this QR code with Google Authenticator or Authy, then enter the 6-digit code below.</p>
          <form onSubmit={handleVerifyOTP} className="first-2fa__form">
            <div className="first-2fa__field">
              <label className="first-2fa__label">6-digit code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="first-2fa__otp-input"
                autoFocus
                required
              />
            </div>
            {error && <p className="first-2fa__error">{error}</p>}
            <button type="submit" className="first-2fa__button" disabled={loading || otp.length !== 6}>
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
            <button type="button" onClick={() => { setStep(1); setQrCode(""); setOtp(""); setError(""); }} className="first-2fa__back-btn">
              ← Back
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="first-2fa">
      <div className="first-2fa__card">
        <h2 className="first-2fa__title">🔐 First Time Setup</h2>
        <p className="first-2fa__subtitle">Your account needs to set up Two-Factor Authentication to continue.</p>
        <div className="first-2fa__info-box">
          <p className="first-2fa__info-text"><strong>What you need:</strong></p>
          <ul className="first-2fa__info-list">
            <li>Google Authenticator or Authy app (install from app store)</li>
            <li>Your phone to scan the QR code</li>
            <li>2 minutes of your time</li>
          </ul>
        </div>
        <button className="first-2fa__button" onClick={handleGenerateQR} disabled={loading}>
          {loading ? "Generating..." : "Get Started →"}
        </button>
        {error && <p className="first-2fa__error">{error}</p>}
        <button type="button" onClick={() => navigate("/login")} className="first-2fa__back-btn">
          ← Back to Login
        </button>
      </div>
    </div>
  );
}
