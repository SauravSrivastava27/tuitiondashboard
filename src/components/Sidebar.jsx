import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getName, clearAuth } from "../utils/auth";
import Button from "./Button";

const manageItems = [
  { label: "Users",    path: "/admin/users",    icon: "👥" },
  { label: "Students", path: "/admin/students", icon: "📚" },
  { label: "Fees",     path: "/admin/fees",     icon: "💰" },
  { label: "Reports",  path: "/admin/reports",  icon: "📈" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isManageActive = manageItems.some(i => location.pathname === i.path);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); setDropdownOpen(false); }, [location.pathname]);

  const handleLogout = () => { clearAuth(); navigate("/"); };

  const NavLink = ({ path, icon, label }) => {
    const active = location.pathname === path;
    return (
      <button
        onClick={() => navigate(path)}
        className={`
          relative flex items-center gap-2 px-5 h-20 border-none cursor-pointer transition-all duration-200
          font-black uppercase text-[10px] tracking-widest group bg-transparent
          ${active ? "text-nb-yellow bg-white/10" : "text-white/60 hover:text-white hover:bg-white/5"}
        `}
      >
        <span className="group-hover:scale-125 transition-transform text-sm">{icon}</span>
        <span className="hidden lg:block">{label}</span>
        {active && <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-nb-yellow" />}
      </button>
    );
  };

  return (
    <>
      {/* ── Main nav bar ── */}
      <nav className="sticky top-0 z-[100] flex items-center gap-1 bg-nb-black px-4 md:px-6 h-20 border-b-4 border-nb-black shadow-[0_6px_0_0_rgba(0,0,0,0.4)]">

        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer mr-6 shrink-0 group" onClick={() => navigate("/admin/dashboard")}>
          <div className="w-10 h-10 border-2 border-white bg-nb-yellow flex items-center justify-center rotate-[-4deg] group-hover:rotate-0 transition-all duration-300 shadow-[3px_3px_0px_white]">
            <span className="text-xl">🏠</span>
          </div>
          <div className="flex-col hidden sm:flex">
            <span className="text-base font-black uppercase tracking-tighter text-white leading-none">Tuition</span>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-nb-yellow leading-none mt-1">Command</span>
          </div>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          <NavLink path="/admin/dashboard" icon="📊" label="Dashboard" />

          {/* Manage dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(o => !o)}
              className={`
                relative flex items-center gap-2 px-5 h-20 border-none cursor-pointer transition-all duration-200
                font-black uppercase text-[10px] tracking-widest group bg-transparent
                ${isManageActive ? "text-nb-yellow bg-white/10" : "text-white/60 hover:text-white hover:bg-white/5"}
              `}
            >
              <span className="group-hover:scale-125 transition-transform text-sm">⚙️</span>
              <span className="hidden lg:block">Manage</span>
              <span className={`text-[8px] ml-1 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}>▼</span>
              {isManageActive && <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-nb-yellow" />}
            </button>

            {dropdownOpen && (
              <div className="absolute top-[80px] left-0 bg-nb-black border-2 border-white/20 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] min-w-[160px] z-50">
                {manageItems.map(item => {
                  const active = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => { navigate(item.path); setDropdownOpen(false); }}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 border-none cursor-pointer text-left
                        font-black uppercase text-[10px] tracking-widest transition-all
                        ${active ? "bg-nb-yellow text-nb-black" : "text-white/70 hover:bg-white/10 hover:text-white"}
                      `}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <NavLink path="/profile" icon="👤" label="Profile" />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 ml-auto shrink-0">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">LOGGED_IN_AS</span>
            <span className="text-sm font-black text-nb-blue uppercase tracking-tighter">{getName()}</span>
          </div>
          <Button
            variant="secondary" size="sm" onClick={handleLogout}
            className="!py-2 !px-3 !text-[10px] !bg-nb-pink !border-white !shadow-none hover:rotate-2 transition-transform hidden sm:block"
          >
            TERMINATE
          </Button>

          {/* Hamburger */}
          <button
            className="md:hidden flex flex-col gap-[5px] cursor-pointer p-2 bg-transparent border-none"
            onClick={() => setMobileOpen(o => !o)}
          >
            <span className={`block w-6 h-[2px] bg-white transition-all duration-200 ${mobileOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
            <span className={`block w-6 h-[2px] bg-white transition-all duration-200 ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-[2px] bg-white transition-all duration-200 ${mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[99] flex" onClick={() => setMobileOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" />

          {/* Drawer */}
          <div className="relative bg-nb-black w-72 max-w-[85vw] h-full flex flex-col shadow-[8px_0_0_rgba(0,0,0,0.4)]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 h-20 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-nb-yellow border-2 border-white flex items-center justify-center">
                  <span className="text-base">🏠</span>
                </div>
                <span className="text-white font-black uppercase tracking-tighter">Menu</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-white/60 hover:text-white text-xl bg-transparent border-none cursor-pointer">✕</button>
            </div>

            <div className="flex flex-col py-4 flex-1 overflow-y-auto">
              {[{ label: "Dashboard", path: "/admin/dashboard", icon: "📊" }, ...manageItems, { label: "Profile", path: "/profile", icon: "👤" }].map(item => {
                const active = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-4 px-6 py-4 border-none cursor-pointer text-left font-black uppercase text-[11px] tracking-widest transition-all border-b border-white/5
                      ${active ? "bg-nb-yellow text-nb-black" : "text-white/70 hover:bg-white/10 hover:text-white bg-transparent"}`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="px-6 py-4 border-t border-white/10">
              <div className="mb-3">
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest block">Logged in as</span>
                <span className="text-sm font-black text-nb-blue uppercase tracking-tighter">{getName()}</span>
              </div>
              <button onClick={handleLogout} className="w-full py-3 bg-nb-pink border-2 border-white text-white font-black uppercase text-[11px] tracking-widest cursor-pointer hover:opacity-90 transition-opacity">
                TERMINATE SESSION
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
