import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUsername, clearAuth } from "../utils/auth";

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
    <nav style={styles.nav}>
      {/* Logo */}
      <div style={styles.logo} onClick={() => navigate("/admin/dashboard")}>
        <span style={{ fontSize: "22px" }}>📚</span>
        <span style={styles.logoText}>Tuition Admin</span>
      </div>

      {/* Nav items */}
      <div style={styles.items}>
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{ ...styles.item, ...(active ? styles.itemActive : {}) }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {active && <span style={styles.activeBar} />}
            </button>
          );
        })}
      </div>

      {/* Right side */}
      <div style={styles.right}>
        <span style={styles.username}>👤 {getUsername()}</span>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    gap: "4px",
    backgroundColor: "#1e1b4b",
    padding: "0 24px",
    height: "60px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    marginRight: "24px",
    flexShrink: 0,
  },
  logoText: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#fff",
    whiteSpace: "nowrap",
  },
  items: {
    display: "flex",
    alignItems: "center",
    gap: "2px",
    flex: 1,
  },
  item: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "0 14px",
    height: "60px",
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.7)",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "color 0.15s",
    whiteSpace: "nowrap",
  },
  itemActive: {
    color: "#fff",
    fontWeight: "600",
  },
  activeBar: {
    position: "absolute",
    bottom: 0,
    left: "14px",
    right: "14px",
    height: "3px",
    backgroundColor: "#818cf8",
    borderRadius: "3px 3px 0 0",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginLeft: "auto",
    flexShrink: 0,
  },
  username: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
  },
  logoutBtn: {
    padding: "6px 14px",
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
};
