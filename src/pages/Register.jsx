import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { encryptPassword } from "../utils/encryption";

const API = import.meta.env.VITE_API_URL;

export default function Register() {
  const [form, setForm] = useState({ username: "", password: "", phone: "" });
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^\d{10}$/.test(form.phone)) {
      setError("Phone must be exactly 10 digits");
      return;
    }
    try {
      const encryptedPassword = await encryptPassword(form.password);
      const res = await axios.post(`${API}/api/auth/register`, { ...form, password: encryptedPassword });
      setQrCode(res.data.qrCode);
      setSecret(res.data.secret);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  if (qrCode) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Setup Authenticator</h2>
          <p style={styles.info}>
            Scan this QR code with <strong>Google Authenticator</strong> or <strong>Authy</strong> on your phone.
          </p>
          <div style={styles.qrWrapper}>
            <img src={qrCode} alt="2FA QR Code" style={styles.qr} />
          </div>
          <div style={styles.secretBox}>
            <span style={styles.secretLabel}>Can't scan? Enter this key manually:</span>
            <code style={styles.secretCode}>{secret}</code>
          </div>
          <p style={styles.note}>
            After scanning, the app will show a 6-digit code. Use that to login.
          </p>
          <button style={styles.button} onClick={() => navigate("/login")}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.field}>
            <label>Username</label>
            <input
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.field}>
            <label>Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.field}>
            <label>Phone Number</label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              maxLength={10}
              style={styles.input}
              required
            />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.button}>Register</button>
        </form>
        <p style={styles.link}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex", justifyContent: "center", alignItems: "center",
    minHeight: "100vh", backgroundColor: "#f0f2f5",
  },
  card: {
    background: "#fff", padding: "2rem", borderRadius: "8px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.15)", width: "380px",
  },
  title: { textAlign: "center", marginBottom: "1rem", color: "#333" },
  info: { textAlign: "center", fontSize: "14px", color: "#555", marginBottom: "1rem" },
  qrWrapper: { display: "flex", justifyContent: "center", marginBottom: "1rem" },
  qr: { width: "180px", height: "180px", border: "1px solid #ddd", borderRadius: "6px" },
  secretBox: {
    backgroundColor: "#f8f8f8", border: "1px solid #ddd", borderRadius: "6px",
    padding: "10px", marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "4px",
  },
  secretLabel: { fontSize: "11px", color: "#666" },
  secretCode: { fontSize: "13px", wordBreak: "break-all", color: "#333", fontFamily: "monospace" },
  note: { fontSize: "12px", color: "#888", textAlign: "center", marginBottom: "1rem" },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  field: { display: "flex", flexDirection: "column", gap: "4px" },
  input: {
    padding: "8px 12px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "14px",
  },
  error: { color: "red", fontSize: "13px", margin: 0 },
  button: {
    padding: "10px", backgroundColor: "#4f46e5", color: "#fff",
    border: "none", borderRadius: "4px", fontSize: "15px", cursor: "pointer", width: "100%",
  },
  link: { textAlign: "center", marginTop: "1rem", fontSize: "13px", color: "#555" },
};
