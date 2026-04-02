import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function First2FASetup() {
  const navigate = useNavigate();
  const location = useLocation();
  const username = location.state?.username || "";

  const [step, setStep] = useState(1);
  const [qrCode, setQrCode] = useState("");
  const [tempSecret, setTempSecret] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateQR = async () => {
    if (!username) {
      setError("Username not provided");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API}/api/auth/setup-first-2fa`, { username });
      setQrCode(res.data.qrCode);
      setTempSecret(res.data.tempSecret);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate QR code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API}/api/auth/verify-first-2fa`, {
        username,
        otp
      });

      setStep(3);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (step === 3) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.title}>2FA Setup Complete!</h2>
          <p style={styles.message}>
            Your two-factor authentication has been set up successfully.
          </p>
          <p style={styles.redirectMessage}>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // OTP verification screen
  if (step === 2) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>🔐 Verify Your Setup</h2>

          <div style={styles.qrWrapper}>
            {qrCode && <img src={qrCode} alt="2FA QR Code" style={styles.qrImage} />}
          </div>

          <p style={styles.qrHelp}>
            Scan this QR code with Google Authenticator or Authy, then enter the 6-digit code below.
          </p>

          <form onSubmit={handleVerifyOTP} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>6-digit code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                style={styles.otpInput}
                autoFocus
                required
              />
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <button type="submit" style={styles.button} disabled={loading || otp.length !== 6}>
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setQrCode("");
                setTempSecret("");
                setOtp("");
                setError("");
              }}
              style={styles.backButton}
            >
              ← Back
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Initial setup screen
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🔐 First Time Setup</h2>
        <p style={styles.subtitle}>
          Your account needs to set up Two-Factor Authentication to continue.
        </p>

        <div style={styles.infoBox}>
          <p style={styles.infoText}>
            <strong>What you need:</strong>
          </p>
          <ul style={styles.infoList}>
            <li>Google Authenticator or Authy app (install from app store)</li>
            <li>Your phone to scan the QR code</li>
            <li>2 minutes of your time</li>
          </ul>
        </div>

        <button style={styles.button} onClick={handleGenerateQR} disabled={loading}>
          {loading ? "Generating..." : "Get Started →"}
        </button>

        {error && <p style={styles.error}>{error}</p>}

        <button
          type="button"
          onClick={() => navigate("/login")}
          style={styles.backButton}
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f6fa",
    padding: "20px",
  },
  card: {
    background: "#fff",
    padding: "40px 32px",
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "420px",
  },
  title: {
    textAlign: "center",
    marginBottom: "8px",
    color: "#1a1a2e",
    fontSize: "28px",
    fontWeight: "700",
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    fontSize: "14px",
    margin: "0 0 24px 0",
  },
  infoBox: {
    backgroundColor: "#eff6ff",
    border: "1px solid #93c5fd",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "24px",
  },
  infoText: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1f2937",
    margin: "0 0 12px 0",
  },
  infoList: {
    margin: 0,
    paddingLeft: "20px",
    fontSize: "14px",
    color: "#555",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },
  otpInput: {
    padding: "12px",
    border: "2px solid #4f46e5",
    borderRadius: "6px",
    fontSize: "24px",
    textAlign: "center",
    letterSpacing: "8px",
    fontWeight: "700",
    fontFamily: "'Courier New', monospace",
  },
  button: {
    padding: "12px",
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  backButton: {
    padding: "10px",
    backgroundColor: "transparent",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "8px",
  },
  error: {
    color: "#ef4444",
    fontSize: "13px",
    margin: 0,
    padding: "8px 12px",
    backgroundColor: "#fee2e2",
    borderRadius: "6px",
    border: "1px solid #fecaca",
  },
  qrWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  },
  qrImage: {
    maxWidth: "200px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    padding: "8px",
    backgroundColor: "#fff",
  },
  qrHelp: {
    textAlign: "center",
    fontSize: "14px",
    color: "#555",
    marginBottom: "20px",
    lineHeight: "1.5",
  },
  successIcon: {
    textAlign: "center",
    fontSize: "64px",
    color: "#16a34a",
    marginBottom: "16px",
  },
  message: {
    textAlign: "center",
    fontSize: "16px",
    color: "#374151",
    marginBottom: "8px",
  },
  redirectMessage: {
    textAlign: "center",
    fontSize: "14px",
    color: "#666",
  },
};
