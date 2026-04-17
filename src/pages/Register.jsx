import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { encryptPassword } from "../utils/encryption";
import "../styles/pages/Register.scss";

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
  const [adminCodeDaysRemaining, setAdminCodeDaysRemaining] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^\d{10}$/.test(form.phone)) { setError("Phone must be exactly 10 digits"); return; }
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
      if (res.data.daysRemaining !== undefined) setAdminCodeDaysRemaining(res.data.daysRemaining);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setError("");
    if (!otp || otp.length !== 6) { setError("OTP must be 6 digits"); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/register/verify-2fa`, { otp, tempSecret, registrationData });
      setQrCode("");
      setTempSecret("");
      setOtp("");
      setForm({ username: "", password: "", phone: "", adminCode: "" });
      setRegisteredRole(res.data.role || registrationData.userRole);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (registeredRole && !qrCode) {
    return (
      <div className="register">
        <div className="register__card">
          <div className="register__success-icon">✓</div>
          <h2 className="register__title">Registration Successful!</h2>
          <div className="register__role-info-box">
            <span className="register__role-info-label">Account Type:</span>
            <span className={`register__role-badge register__role-badge--${registeredRole === "admin" ? "admin" : "student"}`}>
              {registeredRole === "admin" ? "👨‍💼 Admin" : "👤 Student"}
            </span>
          </div>
          <p className="register__info">Your account has been created successfully with 2FA enabled!</p>
          <div>
            <h3 className="register__features-title">What's Next:</h3>
            <ul className="register__features-list">
              <li>✓ Login with your credentials</li>
              <li>✓ Use your authenticator app code on login</li>
              <li>✓ Access your dashboard</li>
            </ul>
          </div>
          <button className="register__button" onClick={() => navigate("/login")}>→ Proceed to Login</button>
          <button className="register__back-btn" onClick={() => navigate("/")}>← Back to Home</button>
        </div>
      </div>
    );
  }

  if (qrCode && tempSecret) {
    return (
      <div className="register">
        <div className="register__card">
          <h2 className="register__title">🔐 Enable Two-Factor Authentication</h2>
          <p className="register__subtitle">Complete your registration by setting up 2FA</p>
          <div className="register__2fa-section">
            <div className="register__qr-wrapper">
              <img src={qrCode} alt="2FA QR Code" className="register__qr-image" />
            </div>
            <p className="register__qr-help">Scan this QR code with Google Authenticator or Authy</p>

            {adminCodeDaysRemaining !== null && (
              <p className="register__code-expiry-note">
                Admin code valid — {adminCodeDaysRemaining} day{adminCodeDaysRemaining !== 1 ? "s" : ""} remaining
              </p>
            )}

            <div className="register__field">
              <label className="register__label">Enter 6-digit code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="register__otp-input"
                required
              />
            </div>
            {error && <p className="register__error">{error}</p>}
            <button onClick={handleVerify2FA} disabled={otp.length !== 6 || loading} className="register__button">
              {loading ? "Verifying..." : "Verify & Complete Registration"}
            </button>
            <button type="button" onClick={() => navigate("/")} className="register__back-btn">
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register">
      <div className="register__card">
        <div className="register__header">
          <h2 className="register__title">📚 Create Account</h2>
          <p className="register__subtitle">Register for Tuition Management</p>
        </div>
        <form onSubmit={handleRegister} className="register__form">
          <div className="register__field">
            <label className="register__label">Username</label>
            <input name="username" type="text" value={form.username} onChange={handleChange} placeholder="Choose a username" className="register__input" required />
          </div>
          <div className="register__field">
            <label className="register__label">Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Enter a strong password" className="register__input" required />
          </div>
          <div className="register__field">
            <label className="register__label">Phone Number</label>
            <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="10-digit mobile number" maxLength={10} className="register__input" required />
          </div>

          <div className="register__admin-section">
            <label className="register__checkbox-label">
              <input type="checkbox" checked={showAdminCode} onChange={(e) => setShowAdminCode(e.target.checked)} className="register__checkbox" />
              <span>Register as Admin</span>
            </label>
            {showAdminCode && (
              <div className="register__field">
                <label className="register__label">Admin Registration Code</label>
                <input name="adminCode" type="password" value={form.adminCode} onChange={handleChange} placeholder="Enter admin code" className="register__input" />
                <p className="register__hint">Enter the admin registration code provided by your system administrator.</p>
              </div>
            )}
          </div>

          {error && <p className="register__error">{error}</p>}
          <button type="submit" className="register__button" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="register__divider">or</div>

        <p className="register__link">
          Already have an account? <Link to="/login" className="register__link-text">Login here</Link>
        </p>

        <button type="button" onClick={() => navigate("/")} className="register__back-btn">
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
