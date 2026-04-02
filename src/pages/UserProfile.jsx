import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Button from "../components/Button";
import Modal from "../components/Modal";
import StudentLayout from "../layouts/StudentLayout";
import AdminLayout from "../layouts/AdminLayout";

export default function UserProfile() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  const [showRegenerate2FAModal, setShowRegenerate2FAModal] = useState(false);

  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const userId = localStorage.getItem("userId");

  const handleRegenerate2FA = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await api.post("/api/auth/regenerate-2fa", {});
      setQrCode(res.data.qrCode);
      setSecret(res.data.secret);
      setMessage("2FA regenerated. Scan the new QR code with your authenticator app.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to regenerate 2FA");
    } finally {
      setLoading(false);
    }
  };

  const Layout = role === "admin" ? AdminLayout : StudentLayout;

  return (
    <Layout>
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>👤 User Profile</h1>
        </div>

        {/* Profile Info Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Account Information</h2>
          <div style={styles.infoBox}>
            <div style={styles.infoRow}>
              <span style={styles.label}>Username:</span>
              <span style={styles.value}>{username}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Account Type:</span>
              <span style={{
                ...styles.value,
                ...styles.badge,
                backgroundColor: role === "admin" ? "#4f46e5" : "#10b981"
              }}>
                {role === "admin" ? "👨‍💼 Admin" : "👤 Student"}
              </span>
            </div>
          </div>
        </div>

        {/* 2FA Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>🔐 Two-Factor Authentication</h2>
          <div style={styles.twoFABox}>
            <div style={styles.twoFAStatus}>
              <div>
                <p style={styles.twoFAStatusLabel}>
                  Status: <strong>✓ Enabled (Mandatory)</strong>
                </p>
                <p style={styles.twoFAHelp}>
                  Two-Factor Authentication is required for all accounts. You'll need your authenticator app to login securely.
                </p>
              </div>
            </div>

            <div style={styles.twoFAActions}>
              <Button
                onClick={() => { setShowRegenerate2FAModal(true); handleRegenerate2FA(); }}
                variant="secondary"
              >
                🔄 Regenerate 2FA (Lost Phone)
              </Button>
            </div>
          </div>
        </div>

      </div>

      {/* Regenerate 2FA Modal */}
      <Modal
        isOpen={showRegenerate2FAModal && qrCode}
        onClose={() => {
          setShowRegenerate2FAModal(false);
          setQrCode("");
          setSecret("");
          setMessage("");
        }}
        title="🔄 Regenerate 2FA"
      >
        <div style={styles.modalContent}>
          <p>Your new 2FA code has been generated. Scan this QR code with your authenticator app:</p>
          {qrCode && <img src={qrCode} alt="New 2FA QR Code" style={styles.qrImage} />}

          {secret && (
            <div style={styles.secretBox}>
              <p style={styles.secretLabel}>Can't scan? Enter this code manually:</p>
              <code style={styles.secretCode}>{secret}</code>
            </div>
          )}

          {message && (
            <div style={{
              backgroundColor: "#eff6ff",
              color: "#1e40af",
              padding: "12px",
              borderRadius: "6px",
              fontSize: "13px",
              marginBottom: "12px"
            }}>
              {message}
            </div>
          )}

          <div style={styles.modalActions}>
            <Button
              onClick={() => {
                setShowRegenerate2FAModal(false);
                setQrCode("");
                setSecret("");
                setMessage("");
              }}
            >
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </div>
    </Layout>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    maxWidth: "600px",
    width: "100%",
    padding: "32px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
    paddingBottom: "16px",
    borderBottom: "1px solid #e5e7eb",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1a1a2e",
    margin: 0,
  },
  backButton: {
    padding: "8px 16px",
    backgroundColor: "transparent",
    color: "#4f46e5",
    border: "1px solid #4f46e5",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  section: {
    marginBottom: "32px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: "16px",
    marginTop: 0,
  },
  infoBox: {
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    padding: "16px",
    border: "1px solid #e5e7eb",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #e5e7eb",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },
  value: {
    fontSize: "14px",
    color: "#1f2937",
    fontWeight: "500",
  },
  badge: {
    padding: "6px 14px",
    borderRadius: "20px",
    color: "#fff",
    fontSize: "13px",
  },
  twoFABox: {
    backgroundColor: "#eff6ff",
    border: "1px solid #93c5fd",
    borderRadius: "8px",
    padding: "20px",
  },
  twoFAStatus: {
    marginBottom: "16px",
  },
  twoFAStatusLabel: {
    fontSize: "15px",
    color: "#1f2937",
    marginBottom: "8px",
    margin: "0 0 8px 0",
  },
  twoFAHelp: {
    fontSize: "13px",
    color: "#666",
    margin: 0,
    marginTop: "4px",
  },
  twoFAActions: {
    display: "flex",
    gap: "12px",
    flexDirection: "column",
  },
  modalContent: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  modalField: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  qrImage: {
    maxWidth: "250px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    padding: "8px",
    backgroundColor: "#fff",
  },
  secretBox: {
    backgroundColor: "#f5f6fa",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    padding: "12px",
    textAlign: "center",
  },
  secretLabel: {
    fontSize: "12px",
    color: "#666",
    display: "block",
    marginBottom: "8px",
  },
  secretCode: {
    display: "block",
    fontSize: "14px",
    fontFamily: "monospace",
    backgroundColor: "#fff",
    padding: "8px",
    borderRadius: "4px",
    wordBreak: "break-all",
  },
  otpInput: {
    padding: "12px",
    border: "2px solid #4f46e5",
    borderRadius: "6px",
    fontSize: "20px",
    textAlign: "center",
    letterSpacing: "6px",
    fontWeight: "700",
    fontFamily: "'Courier New', monospace",
  },
  warningText: {
    backgroundColor: "#fee2e2",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    padding: "12px",
    color: "#991b1b",
    fontSize: "14px",
    marginBottom: "16px",
  },
  note: {
    fontSize: "13px",
    color: "#666",
    padding: "12px",
    backgroundColor: "#f9fafb",
    borderRadius: "6px",
    marginBottom: "16px",
  },
  modalActions: {
    display: "flex",
    gap: "12px",
  },
};
