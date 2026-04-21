import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function GoogleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const username = params.get("username");
    const name = params.get("name");
    const role = params.get("role");
    const studentId = params.get("studentId");

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("username", username || "");
      localStorage.setItem("name", name || username || "");
      localStorage.setItem("role", role || "student");
      localStorage.setItem("studentId", studentId || "");
      navigate(role === "admin" ? "/admin/dashboard" : "/dashboard");
    } else {
      navigate("/login?error=google_failed");
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center">
      <p className="font-black uppercase tracking-widest text-nb-black/40 animate-pulse">Signing you in...</p>
    </div>
  );
}
