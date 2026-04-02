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

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 32px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #e5e7eb",
    position: "sticky",
    top: 0,
    zIndex: 10,
  };

  const leftStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  };

  const logoStyle = {
    fontSize: "28px",
  };

  const textStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  };

  const titleStyle = {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1a1a2e",
  };

  const subStyle = {
    fontSize: "11px",
    color: "#888",
  };

  const rightStyle = {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  };

  return (
    <div style={headerStyle}>
      <div style={{ ...leftStyle, cursor: "pointer" }} onClick={handleHome}>
        <span style={logoStyle}>📚</span>
        <div style={textStyle}>
          <div style={titleStyle}>Tuition System</div>
          <div style={subStyle}>Welcome, <strong>{getUsername()}</strong></div>
        </div>
      </div>
      <div style={rightStyle}>
        <Button variant="outline" size="sm" onClick={() => navigate("/profile")}>
          👤 Profile
        </Button>
{showAdminButton && isAdmin() && (
          <Button variant="secondary" size="sm" onClick={() => navigate("/admin/dashboard")}>
            {adminLabel || "Admin"}
          </Button>
        )}
        <Button variant="danger" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
}
