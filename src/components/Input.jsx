import React from "react";

export default function Input({
  label,
  type = "text",
  value,
  onChange,
  error = null,
  required = false,
  placeholder = "",
  ...props
}) {
  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: error ? "1px solid #ef4444" : "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "'Segoe UI', Roboto, sans-serif",
    boxSizing: "border-box",
    transition: "border-color 0.2s ease",
  };

  const labelStyle = {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "6px",
  };

  const errorStyle = {
    fontSize: "12px",
    color: "#ef4444",
    marginTop: "4px",
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      {label && (
        <label style={labelStyle}>
          {label}
          {required && <span style={{ color: "#ef4444" }}>*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={inputStyle}
        required={required}
        {...props}
      />
      {error && <div style={errorStyle}>{error}</div>}
    </div>
  );
}
