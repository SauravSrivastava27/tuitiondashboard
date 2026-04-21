import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { encryptPassword } from "../utils/encryption";
import { validatePassword, PASSWORD_HINT } from "../utils/validation";
import "../styles/pages/Register.scss";

const API = import.meta.env.VITE_API_URL;

export default function Setup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API}/api/auth/setup-status`)
      .then(res => {
        if (!res.data.setupRequired) navigate("/login", { replace: true });
        else setChecking(false);
      })
      .catch(() => navigate("/login", { replace: true }));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSetup = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^\d{10}$/.test(form.phone)) { setError("Phone must be exactly 10 digits"); return; }
    const pwError = validatePassword(form.password);
    if (pwError) { setError(pwError); return; }
    setLoading(true);
    try {
      const encryptedPassword = await encryptPassword(form.password);
      await axios.post(`${API}/api/auth/setup`, {
        name: form.name,
        email: form.email,
        password: encryptedPassword,
        phone: form.phone,
      });
      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || "Setup failed";
      if (err.response?.status === 403) navigate("/login", { replace: true });
      else setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (checking) return null;

  if (done) {
    return (
      <div className="register">
        <div className="register__card">
          <div className="register__success-icon">✓</div>
          <h2 className="register__title">Admin Account Created!</h2>
          <p className="register__info">Your admin account has been set up. Redirecting to login...</p>
          <button className="register__button" onClick={() => navigate("/login")}>→ Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="register">
      <div className="register__card">
        <div className="register__header">
          <h2 className="register__title">⚙️ Admin Setup</h2>
          <p className="register__subtitle">Create the first admin account</p>
        </div>
        <form onSubmit={handleSetup} className="register__form">
          <div className="register__field">
            <label className="register__label">Full Name</label>
            <input name="name" type="text" value={form.name} onChange={handleChange} placeholder="Your full name" className="register__input" required />
          </div>
          <div className="register__field">
            <label className="register__label">Email Address</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="admin@example.com" className="register__input" required />
          </div>
          <div className="register__field">
            <label className="register__label">Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Enter a strong password" className="register__input" required />
            <p className="register__hint">{PASSWORD_HINT}</p>
          </div>
          <div className="register__field">
            <label className="register__label">Phone Number</label>
            <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="10-digit mobile number" maxLength={10} className="register__input" required />
          </div>
          {error && <p className="register__error">{error}</p>}
          <button type="submit" className="register__button" disabled={loading}>
            {loading ? "Creating Admin..." : "Create Admin Account"}
          </button>
        </form>
        <div className="register__divider">or</div>
        <p className="register__link">
          Regular user? <Link to="/register" className="register__link-text">Register here</Link>
        </p>
        <button type="button" onClick={() => navigate("/")} className="register__back-btn">← Back to Home</button>
      </div>
    </div>
  );
}
