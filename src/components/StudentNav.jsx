import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getName, clearAuth } from "../utils/auth";
import Button from "./Button";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: "🏠" },
  { label: "Fees",      path: "/fees",       icon: "💳" },
  { label: "Profile",   path: "/profile",    icon: "👤" },
];

export default function StudentNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => { clearAuth(); navigate("/"); };

  return (
    <>
      <nav className="sticky top-0 z-[100] flex items-center gap-1 bg-white border-b-4 border-nb-black px-4 md:px-6 h-20 shadow-[0_6px_0_0_rgba(0,0,0,1)]">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer mr-6 shrink-0 group" onClick={() => navigate("/dashboard")}>
          <div className="w-10 h-10 border-2 border-nb-black bg-nb-blue flex items-center justify-center rotate-[4deg] group-hover:rotate-0 transition-all duration-300 shadow-[3px_3px_0px_black]">
            <span className="text-xl filter drop-shadow-[2px_2px_0px_white]">🎓</span>
          </div>
          <div className="flex-col hidden sm:flex">
            <span className="text-base font-black uppercase tracking-tighter text-nb-black leading-none">Bright</span>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-nb-blue leading-none mt-1">Portal</span>
          </div>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  relative flex items-center gap-2 px-5 h-20 bg-transparent border-none cursor-pointer transition-all duration-200
                  font-black uppercase text-[10px] tracking-widest group
                  ${active ? "text-nb-blue bg-nb-blue/5" : "text-nb-black/60 hover:text-nb-black hover:bg-nb-black/5"}
                `}
              >
                <span className="group-hover:scale-125 transition-transform">{item.icon}</span>
                <span className="hidden lg:block">{item.label}</span>
                {active && <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-nb-blue" />}
              </button>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 ml-auto shrink-0">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-[9px] font-black text-nb-black/40 uppercase tracking-widest">STUDENT</span>
            <span className="text-sm font-black text-nb-black uppercase tracking-tighter">{getName()}</span>
          </div>
          <Button
            variant="secondary" size="sm" onClick={handleLogout}
            className="!py-2 !px-3 !text-[10px] !bg-nb-pink !border-nb-black !shadow-none hover:rotate-2 transition-transform hidden sm:block"
          >
            SIGNOUT
          </Button>

          {/* Hamburger */}
          <button
            className="md:hidden flex flex-col gap-[5px] cursor-pointer p-2 bg-transparent border-none"
            onClick={() => setMobileOpen(o => !o)}
          >
            <span className={`block w-6 h-[2px] bg-nb-black transition-all duration-200 ${mobileOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
            <span className={`block w-6 h-[2px] bg-nb-black transition-all duration-200 ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-[2px] bg-nb-black transition-all duration-200 ${mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[99] flex" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white w-64 max-w-[85vw] h-full flex flex-col border-r-4 border-nb-black shadow-[6px_0_0_rgba(0,0,0,1)]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 h-20 border-b-2 border-nb-black">
              <span className="font-black uppercase tracking-tighter text-nb-black">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="text-nb-black/60 hover:text-nb-black text-xl bg-transparent border-none cursor-pointer">✕</button>
            </div>
            <div className="flex flex-col py-4 flex-1">
              {navItems.map(item => {
                const active = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-4 px-6 py-4 border-none cursor-pointer font-black uppercase text-[11px] tracking-widest transition-all border-b border-nb-black/10
                      ${active ? "bg-nb-blue text-white" : "text-nb-black/70 hover:bg-nb-black/5 bg-transparent"}`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="px-6 py-4 border-t-2 border-nb-black">
              <div className="mb-3">
                <span className="text-[9px] font-black text-nb-black/40 uppercase tracking-widest block">Student</span>
                <span className="text-sm font-black text-nb-black uppercase tracking-tighter">{getName()}</span>
              </div>
              <button onClick={handleLogout} className="w-full py-3 bg-nb-pink border-2 border-nb-black text-white font-black uppercase text-[11px] tracking-widest cursor-pointer">
                SIGN OUT
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
