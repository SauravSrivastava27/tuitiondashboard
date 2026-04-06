import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { encryptPassword } from "../utils/encryption";
import Button from "../components/Button";

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
      <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center p-8">
        <div className="nb-card max-w-[420px] w-full text-center">
          <div className="text-6xl mb-6 filter drop-shadow-[3px_3px_0px_black] animate-bounce">✅</div>
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Welcome Back!</h2>
          <p className="font-bold text-nb-black/70 mb-8 italic">
            Logged in as <strong className="text-nb-black">{userName}</strong>
          </p>
          <div className="nb-card bg-nb-yellow/5 border-2 shadow-[4px_4px_0px_black] mb-8 py-4 flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-nb-black/50 mb-2">Authenticated As</span>
            <span className={`px-4 py-1 border-2 border-nb-black font-black uppercase tracking-tighter shadow-[2px_2px_0px_black] ${userRole === "admin" ? "bg-nb-pink text-white" : "bg-nb-green text-black"}`}>
              {userRole === "admin" ? "👨‍💼 System Admin" : "👤 Student User"}
            </span>
          </div>
          <p className="text-xs font-black uppercase tracking-widest animate-pulse text-nb-black/40">Redirecting to Dashboard...</p>
        </div>
      </div>
    );
  }

  // OTP Screen
  if (step === 2) {
    return (
      <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center p-8">
        <div className="nb-card max-w-[420px] w-full">
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">🔐 Identity Check</h2>
          <p className="font-bold text-sm text-nb-black/70 mb-8 border-l-4 border-nb-blue pl-4">
            Enter the 6-digit verification code from your <strong className="text-nb-blue">Authenticator</strong> app.
          </p>
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-nb-black/60">Verification Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="nb-input text-center text-4xl font-black tracking-[12px] bg-nb-blue/5 border-nb-blue ring-nb-blue/20 ring-4 focus:ring-nb-blue/40"
                required
                autoFocus
              />
            </div>
            {error && <p className="nb-card border-2 bg-nb-pink text-white font-bold text-xs p-3 shadow-none uppercase">{error}</p>}
            <Button type="submit" variant="accent" size="lg" className="w-full uppercase tracking-widest">Verify & Access</Button>
            <button
              type="button"
              onClick={() => { setStep(1); setError(""); setOtp(""); }}
              className="text-xs font-black uppercase tracking-widest text-nb-black/40 hover:text-nb-pink transition-colors"
            >
              ← Back to login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Login Screen
  return (
    <div className="min-h-screen bg-nb-yellow flex items-center justify-center p-8 selection:bg-nb-pink selection:text-white">
      <div className="nb-card max-w-[420px] w-full bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-black uppercase tracking-tighter m-0 [text-shadow:2px_2px_0_#FFE600]">Login</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-nb-black/40 mt-2 italic">Access your dashboard</p>
        </div>
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-nb-black/60">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              className="nb-input bg-nb-yellow/5"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-nb-black/60">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="nb-input bg-nb-pink/5 focus:bg-nb-pink/5"
              required
            />
          </div>
          {error && <p className="nb-card border-2 bg-nb-pink text-white font-bold text-xs p-3 shadow-none uppercase">{error}</p>}
          <Button type="submit" variant="primary" size="lg" className="w-full uppercase tracking-widest !text-lg">Authorize Access</Button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t-2 border-nb-black/10"></span></div>
          <div className="relative flex justify-center text-[10px] uppercase font-black"><span className="bg-white px-4 text-nb-black/30 tracking-widest">Security Gateway</span></div>
        </div>

        <div className="flex flex-col gap-3 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-nb-black/60">
            No account? <Link to="/register" className="text-nb-blue hover:underline">Register</Link>
          </p>
          <p className="text-xs font-bold uppercase tracking-widest text-nb-black/60">
            Lost key? <Link to="/forgot-password" className="text-nb-pink hover:underline">Reset</Link>
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-nb-black/40 hover:text-nb-black hover:tracking-[0.3em] transition-all"
          >
            ← Exit System
          </button>
        </div>
      </div>
    </div>
  );
}

