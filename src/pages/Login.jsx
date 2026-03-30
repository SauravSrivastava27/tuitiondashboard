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
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const encryptedPassword = await encryptPassword(password);
      const res = await axios.post(`${API}/api/auth/login`, { username, password: encryptedPassword });
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
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    }
  };

  if (step === 2) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Two-Factor Authentication</h2>
          <p style={styles.info}>
            Open <strong>Google Authenticator</strong> or <strong>Authy</strong> on your phone and enter the 6-digit code.
          </p>
          <form onSubmit={handleVerifyOtp} style={styles.form}>
            <div style={styles.field}>
              <label>Authenticator Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit code"
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
              Back
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Tuition Management Login</h2>
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.field}>
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.field}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.button}>Login</button>
        </form>
        <p style={styles.link}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex", justifyContent: "center", alignItems: "center",
    height: "100vh", backgroundColor: "#f0f2f5",
  },
  card: {
    background: "#fff", padding: "2rem", borderRadius: "8px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.15)", width: "360px",
  },
  title: { textAlign: "center", marginBottom: "1.5rem", color: "#333" },
  info: { textAlign: "center", fontSize: "14px", color: "#555", marginBottom: "1.5rem" },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  field: { display: "flex", flexDirection: "column", gap: "4px" },
  input: {
    padding: "8px 12px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "14px",
  },
  otpInput: {
    padding: "12px", border: "2px solid #4f46e5", borderRadius: "6px",
    fontSize: "22px", textAlign: "center", letterSpacing: "10px", fontWeight: "700",
  },
  error: { color: "red", fontSize: "13px", margin: 0 },
  button: {
    padding: "10px", backgroundColor: "#4f46e5", color: "#fff",
    border: "none", borderRadius: "4px", fontSize: "15px", cursor: "pointer",
  },
  backButton: {
    padding: "8px", backgroundColor: "transparent", color: "#4f46e5",
    border: "1px solid #4f46e5", borderRadius: "4px", fontSize: "14px", cursor: "pointer",
  },
  link: { textAlign: "center", marginTop: "1rem", fontSize: "13px", color: "#555" },
};
