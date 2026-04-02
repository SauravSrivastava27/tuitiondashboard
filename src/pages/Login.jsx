import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { encryptPassword } from "../utils/encryption";

const API = import.meta.env.VITE_API_URL;

export default function Login() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const encryptedPassword = await encryptPassword(password);
      const res = await axios.post(`${API}/api/auth/login`, { username, password: encryptedPassword });

      // 2FA is mandatory for all users
      setUserId(res.data.userId);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(`${API}/api/auth/verify-otp`, { userId, otp });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("studentId", res.data.studentId);

      // Show role confirmation
      setUserRole(res.data.role);
      setUserName(res.data.username);
      setStep(3);

      // Auto-redirect after 2 seconds
      setTimeout(() => {
        navigate(res.data.role === "admin" ? "/admin/dashboard" : "/dashboard");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    }
  };

  // Success Screen
  if (step === 3) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.title}>Login Successful!</h2>
          <p style={styles.successMessage}>
            Welcome, <strong>{userName}</strong>
          </p>
          <div style={styles.roleDisplay}>
            <span style={styles.roleLabel}>Your Role:</span>
            <span style={{
              ...styles.roleBadge,
              backgroundColor: userRole === "admin" ? "#4f46e5" : "#16a34a",
            }}>
              {userRole === "admin" ? "👨‍💼 Admin" : "👤 Student"}
            </span>
          </div>
          <p style={styles.redirectMessage}>Redirecting in 2 seconds...</p>
        </div>
      </div>
    );
  }

  // OTP Screen
  if (step === 2) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>🔐 Two-Factor Authentication</h2>
          <p style={styles.info}>
            Open <strong>Google Authenticator</strong> or <strong>Authy</strong> on your phone and enter the 6-digit code.
          </p>
          <form onSubmit={handleVerifyOtp} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Authenticator Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                maxLength={6}
                style={styles.otpInput}
                required
                autoFocus
              />
            </div>
            {error && <p style={styles.error}>{error}</p>}
            <button type="submit" style={styles.button}>Verify & Login</button>
            <button
              type="button"
              onClick={() => { setStep(1); setError(""); setOtp(""); }}
              style={styles.backButton}
            >
              ← Back to Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Login Screen
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>📚 Tuition Management</h2>
          <p style={styles.subtitle}>Login to Your Account</p>
        </div>
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={styles.input}
              required
            />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.button}>Login</button>
        </form>

        <div style={styles.divider}>or</div>

        <p style={styles.link}>
          Don't have an account? <Link to="/register" style={styles.linkText}>Register here</Link>
        </p>

        <p style={styles.link}>
          Forgot password? <Link to="/forgot-password" style={styles.linkText}>Reset here</Link>
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
  info: {
    textAlign: "center",
    fontSize: "14px",
    color: "#555",
    marginBottom: "24px",
    lineHeight: "1.6",
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
  otpInput: {
    padding: "16px",
    border: "2px solid #4f46e5",
    borderRadius: "8px",
    fontSize: "28px",
    textAlign: "center",
    letterSpacing: "12px",
    fontWeight: "700",
    fontFamily: "'Courier New', monospace",
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
    color: "#4f46e5",
    border: "1px solid #4f46e5",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
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
  // Success screen styles
  successIcon: {
    textAlign: "center",
    fontSize: "64px",
    color: "#16a34a",
    marginBottom: "16px",
  },
  successMessage: {
    textAlign: "center",
    fontSize: "16px",
    color: "#374151",
    marginBottom: "20px",
  },
  roleDisplay: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "20px",
    padding: "16px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
  },
  roleLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },
  roleBadge: {
    padding: "6px 16px",
    borderRadius: "20px",
    color: "#fff",
    fontWeight: "600",
    fontSize: "14px",
  },
  redirectMessage: {
    textAlign: "center",
    fontSize: "13px",
    color: "#888",
    margin: 0,
  },
};
