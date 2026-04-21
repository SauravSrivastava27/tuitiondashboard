const overlayStyle = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
  zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
};
const cardStyle = {
  background: "#fff", padding: "32px 40px", border: "3px solid #000",
  boxShadow: "6px 6px 0 #000", textAlign: "center", borderRadius: "4px",
};
const spinnerStyle = {
  width: 40, height: 40, border: "4px solid #e5e7eb", borderTop: "4px solid #1a1a2e",
  borderRadius: "50%", animation: "lo-spin 0.75s linear infinite", margin: "0 auto 16px",
};

export default function LoadingOverlay({ message = "Processing..." }) {
  return (
    <>
      <style>{`@keyframes lo-spin { to { transform: rotate(360deg); } }`}</style>
      <div style={overlayStyle}>
        <div style={cardStyle}>
          <div style={spinnerStyle} />
          <p style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 2, margin: 0, color: "#1a1a2e" }}>
            {message}
          </p>
        </div>
      </div>
    </>
  );
}
