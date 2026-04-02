import React from "react";

export default function LoadingSpinner() {
  const spinnerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
  };

  const spinnerAnimationStyle = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e5e7eb;
      border-top: 4px solid #4f46e5;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
  `;

  return (
    <>
      <style>{spinnerAnimationStyle}</style>
      <div style={spinnerStyle}>
        <div className="spinner" />
      </div>
    </>
  );
}
