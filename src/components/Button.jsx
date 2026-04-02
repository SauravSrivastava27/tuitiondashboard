import React from "react";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  ...props
}) {
  const baseStyle = {
    fontWeight: "600",
    border: "none",
    borderRadius: " 6px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: size === "sm" ? "12px" : size === "lg" ? "16px" : "14px",
    padding: size === "sm" ? "6px 12px" : size === "lg" ? "12px 20px" : "8px 16px",
    transition: "all 0.2s ease",
    opacity: disabled ? 0.6 : 1,
  };

  const variants = {
    primary: {
      ...baseStyle,
      backgroundColor: "#4f46e5",
      color: "#fff",
    },
    secondary: {
      ...baseStyle,
      backgroundColor: "transparent",
      color: "#4f46e5",
      border: "1px solid #4f46e5",
    },
    danger: {
      ...baseStyle,
      backgroundColor: "#ef4444",
      color: "#fff",
    },
    outline: {
      ...baseStyle,
      backgroundColor: "transparent",
      color: "#374151",
      border: "1px solid #d1d5db",
    },
  };

  return (
    <button
      style={variants[variant]}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
