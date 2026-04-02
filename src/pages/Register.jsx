import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { encryptPassword } from "../utils/encryption";

const API = import.meta.env.VITE_API_URL;

export default function Register() {
  const [form, setForm] = useState({ username: "", password: "", phone: "", adminCode: "" });
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [tempSecret, setTempSecret] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [registeredRole, setRegisteredRole] = useState("");
  const [registrationData, setRegistrationData] = useState(null);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    try {
      const encryptedPassword = await encryptPassword(form.password);
      const res = await axios.post(`${API}/api/auth/register`, {
        username: form.username,
        password: encryptedPassword,
        phone: form.phone,
        adminCode: form.adminCode || undefined
      });
      setQrCode(res.data.qrCode);
      setTempSecret(res.data.tempSecret);
      setRegistrationData(res.data.registrationData);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setError("");
    if (!otp || otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/register/verify-2fa`, {
        otp,
        tempSecret,
        registrationData
      });
      setQrCode("");
      setTempSecret("");
      setOtp("");
      setForm({ username: "", password: "", phone: "", adminCode: "" });
      setRegisteredRole(res.data.role || registrationData.userRole);
      // Show success state
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Success screen after registration
  if (registeredRole && !qrCode) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.title}>Registration Successful!</h2>

          <div style={styles.roleInfoBox}>
            <span style={styles.roleInfoLabel}>Account Type:</span>
            <span style={{
              ...styles.roleBadge,
              backgroundColor: registeredRole === "admin" ? "#4f46e5" : "#10b981"
            }}>
              {registeredRole === "admin" ? "👨‍💼 Admin" : "👤 Student"}
            </span>
          </div>

          <p style={styles.info}>
            Your account has been created successfully with 2FA enabled!
          </p>

          <div style={styles.featuresList}>
            <h3 style={styles.featuresTitle}>What's Next:</h3>
            <ul style={styles.featuresList}>
              <li>✓ Login with your credentials</li>
              <li>✓ Use your authenticator app code on login</li>
              <li>✓ Access your dashboard</li>
            </ul>
          </div>

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

  // 2FA verification screen
  if (qrCode && tempSecret) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>🔐 Enable Two-Factor Authentication</h2>
          <p style={styles.subtitle}>Complete your registration by setting up 2FA</p>

          <div style={styles.twoFASection}>
            <div style={styles.qrWrapper}>
              <img src={qrCode} alt="2FA QR Code" style={styles.qrImage} />
            </div>

            <p style={styles.qrHelp}>
              Scan this QR code with Google Authenticator or Authy
            </p>

            <div style={styles.field}>
              <label style={styles.label}>Enter 6-digit code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                style={styles.otpInput}
                required
              />
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <button
              onClick={handleVerify2FA}
              disabled={otp.length !== 6 || loading}
              style={styles.button}
            >
              {loading ? "Verifying..." : "Verify & Complete Registration"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              style={styles.backHomeButton}
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Initial registration form
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>📚 Create Account</h2>
          <p style={styles.subtitle}>Register for Tuition Management</p>
        </div>
        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              placeholder="Choose a username"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter a strong password"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Phone Number</label>
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

          {/* Admin Code Section */}
          <div style={styles.adminSection}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={showAdminCode}
                onChange={(e) => setShowAdminCode(e.target.checked)}
                style={styles.checkbox}
              />
              <span>Register as Admin</span>
            </label>
            {showAdminCode && (
              <div style={styles.field}>
                <label style={styles.label}>Admin Registration Code</label>
                <input
                  name="adminCode"
                  type="password"
                  value={form.adminCode}
                  onChange={handleChange}
                  placeholder="Enter admin code"
                  style={styles.input}
                />
                <p style={styles.hint}>
                  Enter the admin registration code provided by your system administrator.
                </p>
              </div>
            )}
          </div>

          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div style={styles.divider}>or</div>

        <p style={styles.link}>
          Already have an account? <Link to="/login" style={styles.linkText}>Login here</Link>
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
  qrWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "24px",
  },
  qr: {
    width: "200px",
    height: "200px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
  },
  secretBox: {
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  secretLabel: {
    fontSize: "12px",
    color: "#666",
    fontWeight: "500",
  },
  secretCode: {
    fontSize: "13px",
    wordBreak: "break-all",
    color: "#1a1a2e",
    fontFamily: "monospace",
    backgroundColor: "#fff",
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #e5e7eb",
  },
  note: {
    fontSize: "13px",
    color: "#666",
    textAlign: "center",
    marginBottom: "20px",
    lineHeight: "1.5",
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
  roleInfoBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "12px",
    backgroundColor: "#f9fafb",
    borderRadius: "6px",
    marginBottom: "16px",
  },
  roleInfoLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
  },
  roleBadge: {
    padding: "4px 12px",
    borderRadius: "12px",
    color: "#fff",
    fontWeight: "600",
    fontSize: "12px",
  },
  adminSection: {
    padding: "12px",
    backgroundColor: "#f0f2f5",
    borderRadius: "6px",
    marginBottom: "16px",
    border: "1px solid #ddd",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    cursor: "pointer",
  },
  checkbox: {
    cursor: "pointer",
    width: "16px",
    height: "16px",
  },
  hint: {
    fontSize: "12px",
    color: "#666",
    marginTop: "8px",
    marginBottom: 0,
  },
};
