import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUsername, clearAuth } from "../utils/auth";
import Button from "./Button";

const navItems = [
  { label: "Dashboard", path: "/dashboard",  icon: "🏠" },
  { label: "Fees",      path: "/fees",        icon: "💳" },
  { label: "Profile",   path: "/profile",     icon: "👤" },
];

export default function StudentNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-[100] flex items-center gap-1 bg-white border-b-5 border-nb-black px-6 h-20 shadow-[0_8px_0_0_rgba(0,0,0,1)]">
      {/* Logo */}
      <div 
        className="flex items-center gap-3 cursor-pointer mr-10 shrink-0 group" 
        onClick={() => navigate("/dashboard")}
      >
        <div className="w-12 h-12 border-3 border-nb-black bg-nb-blue flex items-center justify-center rotate-[4deg] group-hover:rotate-0 transition-all duration-300 shadow-[3px_3px_0px_black]">
          <span className="text-2xl filter drop-shadow-[2px_2px_0px_white]">🎓</span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black uppercase tracking-tighter text-nb-black leading-none">Bright</span>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-nb-blue leading-none mt-1">Portal</span>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex items-center gap-1 flex-1">
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                relative flex items-center gap-2 px-6 h-20 bg-transparent border-none cursor-pointer transition-all duration-200
                font-black uppercase text-[10px] tracking-widest group
                ${active ? 'text-nb-blue bg-nb-blue/5' : 'text-nb-black/60 hover:text-nb-black hover:bg-nb-black/5'}
              `}
            >
              <span className="group-hover:scale-125 transition-transform">{item.icon}</span>
              <span className="hidden lg:block">{item.label}</span>
              {active && <span className="absolute bottom-0 left-0 right-0 h-2 bg-nb-blue animate-pulse" />}
            </button>
          );
        })}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6 ml-auto shrink-0">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[9px] font-black text-nb-black/40 uppercase tracking-widest">LOGGED_IN</span>
          <span className="text-sm font-black text-nb-black uppercase tracking-tighter">{getUsername()}</span>
        </div>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={handleLogout}
          className="!py-2 !px-4 !text-[10px] !bg-nb-pink !border-nb-black !shadow-none hover:rotate-2 transition-transform"
        >
          SIGNOUT
        </Button>
      </div>
    </nav>

  );
}

