import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [userPhone, setUserPhone] = useState("");
  const navigate = useNavigate();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/forgot-password`, { username });
      setResetCode(res.data.resetCode);
      setUserPhone(res.data.userPhone);
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
    setMessage("");

    if (!resetCode.trim()) {
      setError("Reset code is required");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { encryptPassword } = await import("../utils/encryption");
      const encryptedPassword = await encryptPassword(newPassword);

      const res = await axios.post(`${API}/api/auth/reset-password`, {
        username,
        resetToken: resetCode,
        newPassword: encryptedPassword
      });

      setMessage(res.data.message);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // Success Screen
  if (step === 3) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.title}>Password Reset Successful!</h2>
          <p style={styles.message}>{message}</p>

          <button style={styles.button} onClick={() => navigate("/login")}>
            → Proceed to Login
          </button>
          <button style={styles.backHomeButton} onClick={() => navigate("/")}>
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Reset Password Step
  if (step === 2) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>🔐 Reset Your Password</h2>
          <p style={styles.subtitle}>
            Enter the reset code sent and create a new password
          </p>

          <div style={styles.phoneBox}>
            <span style={styles.phoneLabel}>Verification:</span>
            <span style={styles.phoneValue}>Account ending in ****{userPhone}</span>
          </div>

          <form onSubmit={handleResetPassword} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Reset Code</label>
              <input
                type="text"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="Enter 6-digit code"
                style={styles.input}
                maxLength={6}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                style={styles.input}
                required
              />
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setResetCode("");
                setError("");
                setMessage("");
              }}
              style={styles.backButton}
            >
              ← Back to Username
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Forgot Password Step
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>🔑 Forgot Password</h2>
          <p style={styles.subtitle}>Enter your username to reset your password</p>
        </div>

        <form onSubmit={handleRequestReset} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              style={styles.input}
              required
              autoFocus
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}
          {message && <p style={styles.message}>{message}</p>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Sending Code..." : "Get Reset Code"}
          </button>
        </form>

        <div style={styles.divider}>or</div>

        <p style={styles.link}>
          Remember your password? <Link to="/login" style={styles.linkText}>Login here</Link>
        </p>

        <button
          type="button"
          onClick={() => navigate("/")}
          style={styles.backHomeButton}
        >
          ← Back to Home
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
  header: {
    marginBottom: "32px",
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
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
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
  input: {
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "'Segoe UI', Roboto, sans-serif",
    transition: "border-color 0.2s",
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
  message: {
    color: "#059669",
    fontSize: "13px",
    margin: 0,
    padding: "8px 12px",
    backgroundColor: "#d1fae5",
    borderRadius: "6px",
    border: "1px solid #a7f3d0",
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
    transition: "all 0.2s",
  },
  backHomeButton: {
    width: "100%",
    padding: "10px",
    backgroundColor: "transparent",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "8px",
    transition: "all 0.2s",
  },
  divider: {
    textAlign: "center",
    color: "#aaa",
    fontSize: "12px",
    margin: "20px 0",
    fontWeight: "500",
  },
  link: {
    textAlign: "center",
    fontSize: "14px",
    color: "#555",
    margin: "12px 0 0 0",
  },
  linkText: {
    color: "#4f46e5",
    textDecoration: "none",
    fontWeight: "600",
  },
  successIcon: {
    textAlign: "center",
    fontSize: "64px",
    color: "#16a34a",
    marginBottom: "16px",
  },
  phoneBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px",
    backgroundColor: "#f0f2f5",
    borderRadius: "6px",
    marginBottom: "20px",
    border: "1px solid #ddd",
  },
  phoneLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
  },
  phoneValue: {
    fontSize: "13px",
    color: "#666",
    fontFamily: "monospace",
  },
};
