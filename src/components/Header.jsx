import React from "react";
import { useNavigate } from "react-router-dom";
import { getUsername, clearAuth, isAdmin } from "../utils/auth";
import Button from "./Button";

export default function Header({ showAdminButton, adminLabel }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    clearAuth();
    navigate("/");
  };

  const handleHome = () => {
    navigate("/");
  };

  return (
    <div className="flex justify-between items-center px-8 py-4 bg-nb-yellow border-b-5 border-nb-black sticky top-0 z-50 shadow-[0_4px_0_0_rgba(0,0,0,1)]">
      <div className="flex items-center gap-4 cursor-pointer group" onClick={handleHome}>
        <span className="text-4xl filter drop-shadow-[2px_2px_0px_black] group-hover:scale-110 transition-transform">📚</span>
        <div className="flex flex-col">
          <div className="text-xl font-black uppercase tracking-tighter text-nb-black leading-none">Tuition System</div>
          <div className="text-xs font-bold uppercase text-nb-black/60 mt-1">
            Welcome, <strong className="text-nb-black">{getUsername()}</strong>
          </div>
        </div>
      </div>
      <div className="flex gap-3 items-center">
        <Button variant="outline" size="sm" onClick={() => navigate("/profile")} className="bg-white">
          👤 Profile
        </Button>
        {showAdminButton && isAdmin() && (
          <Button variant="accent" size="sm" onClick={() => navigate("/admin/dashboard")}>
            {adminLabel || "Admin"}
          </Button>
        )}
        <Button variant="secondary" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
}

