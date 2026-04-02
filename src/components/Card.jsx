import React from "react";

export default function Card({ title, children, icon }) {
  const cardStyle = {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 1px 6px rgba(0, 0, 0, 0.07)",
    marginBottom: "16px",
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
  };

  const iconStyle = {
    fontSize: "24px",
  };

  const titleStyle = {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1a1a2e",
    margin: 0,
  };

  return (
    <div style={cardStyle}>
      {title && (
        <div style={headerStyle}>
          {icon && <span style={iconStyle}>{icon}</span>}
          <h3 style={titleStyle}>{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}
