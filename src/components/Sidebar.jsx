import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUsername, clearAuth } from "../utils/auth";
import Button from "./Button";

const navItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
  { label: "Users",     path: "/admin/users",     icon: "👥" },
  { label: "Students",  path: "/admin/students",  icon: "📚" },
  { label: "Fees",      path: "/admin/fees",      icon: "💰" },
  { label: "Reports",   path: "/admin/reports",   icon: "📈" },
  { label: "Profile",   path: "/profile",         icon: "👤" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-[100] flex items-center gap-1 bg-nb-black px-6 h-20 border-b-5 border-nb-black shadow-[0_8px_0_0_rgba(0,0,0,1)]">
      {/* Logo */}
      <div 
        className="flex items-center gap-3 cursor-pointer mr-10 shrink-0 group" 
        onClick={() => navigate("/admin/dashboard")}
      >
        <div className="w-12 h-12 border-3 border-white bg-nb-yellow flex items-center justify-center rotate-[-4deg] group-hover:rotate-0 transition-all duration-300 shadow-[3px_3px_0px_white]">
          <span className="text-2xl filter drop-shadow-[2px_2px_0px_black]">🏠</span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black uppercase tracking-tighter text-white leading-none">Tuition</span>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-nb-yellow leading-none mt-1">Command</span>
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
                ${active ? 'text-nb-yellow bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'}
              `}
            >
              <span className="group-hover:scale-125 transition-transform">{item.icon}</span>
              <span className="hidden lg:block">{item.label}</span>
              {active && <span className="absolute bottom-0 left-0 right-0 h-2 bg-nb-yellow animate-pulse" />}
            </button>
          );
        })}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6 ml-auto shrink-0">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">LOGGED_IN_AS</span>
          <span className="text-sm font-black text-nb-blue uppercase tracking-tighter">{getUsername()}</span>
        </div>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={handleLogout}
          className="!py-2 !px-4 !text-[10px] !bg-nb-pink !border-white !shadow-none hover:rotate-2 transition-transform"
        >
          TERMINATE
        </Button>
      </div>
    </nav>

  );
}

