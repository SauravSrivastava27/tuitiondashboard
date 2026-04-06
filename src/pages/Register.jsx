import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { encryptPassword } from "../utils/encryption";
import Button from "../components/Button";

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
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Success screen after registration
  if (registeredRole && !qrCode) {
    return (
      <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center p-8">
        <div className="nb-card max-w-[420px] w-full text-center">
          <div className="text-6xl mb-6 filter drop-shadow-[3px_3px_0px_black] animate-bounce">✨</div>
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Registration Success!</h2>
          
          <div className="nb-card bg-nb-blue/5 border-2 shadow-[4px_4px_0px_black] my-8 py-4 flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-nb-black/50 mb-2">Account Type Assigned</span>
            <span className={`px-4 py-1 border-2 border-nb-black font-black uppercase tracking-tighter shadow-[2px_2px_0px_black] ${registeredRole === "admin" ? "bg-nb-pink text-white" : "bg-nb-green text-black"}`}>
              {registeredRole === "admin" ? "👨‍💼 System Admin" : "👤 Student User"}
            </span>
          </div>

          <p className="font-bold text-nb-black/70 mb-8 italic">
            Your account has been created successfully with <strong className="text-nb-blue">2FA Security</strong> enabled!
          </p>

          <Button variant="primary" size="lg" className="w-full uppercase tracking-widest mb-4" onClick={() => navigate("/login")}>
            → Proceed to Login
          </Button>
          <button 
            onClick={() => navigate("/")}
            className="text-xs font-black uppercase tracking-widest text-nb-black/40 hover:text-nb-black transition-all"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  // 2FA verification screen
  if (qrCode && tempSecret) {
    return (
      <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center p-8">
        <div className="nb-card max-w-[450px] w-full">
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">🔐 Setup 2FA</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-nb-black/40 mb-8 italic">Mandatory Security Step</p>

          <div className="flex flex-col items-center">
            <div className="nb-card p-4 bg-white border-3 shadow-[8px_8px_0px_black] mb-6">
              <img src={qrCode} alt="2FA QR Code" className="w-[180px] h-[180px]" />
            </div>

            <p className="text-sm font-bold text-center text-nb-black/70 mb-8 border-y-2 border-nb-black/5 py-4 w-full uppercase tracking-tight">
              Scan with <strong className="text-nb-blue">Google Authenticator</strong> or <strong className="text-nb-pink">Authy</strong>
            </p>

            <div className="w-full flex flex-col gap-2 mb-8">
              <label className="text-[10px] font-black uppercase tracking-widest text-nb-black/60">Verification Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="nb-input text-center text-3xl font-black tracking-[8px] bg-nb-blue/5 border-nb-blue"
                required
              />
            </div>

            {error && <p className="nb-card border-2 bg-nb-pink text-white font-bold text-xs p-3 shadow-none uppercase mb-6 w-full">{error}</p>}

            <Button
              onClick={handleVerify2FA}
              disabled={otp.length !== 6 || loading}
              variant="primary"
              size="lg"
              className="w-full uppercase tracking-widest"
            >
              {loading ? "Activating..." : "Complete Registration"}
            </Button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-6 text-[10px] font-black uppercase tracking-widest text-nb-black/40 hover:text-nb-black transition-all"
            >
              ← Cancel & Exit
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Initial registration form
  return (
    <div className="min-h-screen bg-nb-blue flex items-center justify-center p-8 selection:bg-nb-yellow selection:text-nb-black">
      <div className="nb-card max-w-[440px] w-full bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-black uppercase tracking-tighter m-0 [text-shadow:2px_2px_0_#A3E635]">Join Us</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-nb-black/40 mt-2 italic">Tuition Management System</p>
        </div>
        
        <form onSubmit={handleRegister} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-nb-black/60">Choose Username</label>
            <input
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              placeholder="Username"
              className="nb-input bg-nb-blue/5"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-nb-black/60">Secure Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="nb-input bg-nb-pink/5"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-nb-black/60">Phone Contact</label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="10-digit number"
              maxLength={10}
              className="nb-input bg-nb-green/5"
              required
            />
          </div>

          {/* Admin Code Section */}
          <div className="nb-card bg-nb-black p-4 shadow-none">
            <label className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-white cursor-pointer">
              <input
                type="checkbox"
                checked={showAdminCode}
                onChange={(e) => setShowAdminCode(e.target.checked)}
                className="w-4 h-4 border-2 border-white bg-transparent appearance-none checked:bg-nb-yellow transition-all cursor-pointer"
              />
              <span>I am an Administrator</span>
            </label>
            {showAdminCode && (
              <div className="mt-4 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/60">Verification Code</label>
                <input
                  name="adminCode"
                  type="password"
                  value={form.adminCode}
                  onChange={handleChange}
                  placeholder="Enter Key"
                  className="nb-input !bg-white/10 !border-white/20 !text-white !shadow-none focus:!border-nb-yellow"
                />
              </div>
            )}
          </div>

          {error && <p className="nb-card border-2 bg-nb-pink text-white font-bold text-xs p-3 shadow-none uppercase">{error}</p>}
          
          <Button type="submit" variant="accent" size="lg" className="w-full uppercase tracking-[0.2em] !text-lg !bg-nb-green font-black" disabled={loading}>
            {loading ? "Processing..." : "Create Identity"}
          </Button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t-2 border-nb-black/10"></span></div>
          <div className="relative flex justify-center text-[10px] uppercase font-black"><span className="bg-white px-4 text-nb-black/30 tracking-widest">Registration Portal</span></div>
        </div>

        <div className="flex flex-col gap-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-nb-black/60">
            Have an account? <Link to="/login" className="text-nb-blue hover:underline">Login</Link>
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-nb-black/40 hover:text-nb-black transition-all"
          >
            ← Return to Hub
          </button>
        </div>
      </div>
    </div>
  );
}

