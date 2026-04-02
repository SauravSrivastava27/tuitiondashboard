import React, { useState } from "react";

const CredentialsModal = ({ isOpen, onClose, credentials, studentName, studentId }) => {
  const [copied, setCopied] = useState(null);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>✓ User Created Successfully</h2>
            <p style={styles.subtitle}>for {studentName}</p>
          </div>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          <p style={styles.instruction}>
            Share these credentials with the student. Student can login with these right away.
          </p>

          {/* Student Info */}
          {studentId && (
            <div style={styles.studentInfoBox}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Student ID:</span>
                <code style={styles.infoValue}>{studentId}</code>
              </div>
            </div>
          )}

          {/* Credentials Box */}
          <div style={styles.credentialsBox}>
            <div style={styles.credentialField}>
              <label style={styles.label}>Username</label>
              <div style={styles.fieldWithCopy}>
                <code style={styles.credentialValue}>{credentials?.username}</code>
                <button
                  onClick={() => handleCopy(credentials?.username, "username")}
                  style={{
                    ...styles.copyButton,
                    backgroundColor: copied === "username" ? "#10b981" : "#3b82f6"
                  }}
                >
                  {copied === "username" ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div style={styles.credentialField}>
              <label style={styles.label}>Password</label>
              <div style={styles.fieldWithCopy}>
                <code style={styles.credentialValue}>{credentials?.password}</code>
                <button
                  onClick={() => handleCopy(credentials?.password, "password")}
                  style={{
                    ...styles.copyButton,
                    backgroundColor: copied === "password" ? "#10b981" : "#3b82f6"
                  }}
                >
                  {copied === "password" ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>

          {/* 2FA QR Code - Not shown on initial creation */}
          {/* Users can enable 2FA from their profile settings */}

          {/* Setup Instructions */}
          <div style={styles.instructions}>
            <h3 style={styles.instructionTitle}>Next Steps:</h3>
            <ol style={styles.instructionList}>
              <li>Share username and password with student</li>
              <li>Student logs in with these credentials</li>
              <li>Student can change password if desired</li>
              <li>Optional: Student can enable 2FA from profile settings for extra security</li>
            </ol>
          </div>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button onClick={onClose} style={styles.primaryButton}>
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "24px",
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "#f0fdf4",
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: "20px",
    fontWeight: "600",
    color: "#059669",
  },
  subtitle: {
    margin: 0,
    fontSize: "14px",
    color: "#666",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#9ca3af",
    padding: "0",
    marginLeft: "12px",
    transition: "color 0.2s",
  },
  content: {
    padding: "24px",
  },
  instruction: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "20px",
    marginTop: 0,
  },
  studentInfoBox: {
    backgroundColor: "#eff6ff",
    border: "1px solid #93c5fd",
    borderRadius: "6px",
    padding: "12px",
    marginBottom: "20px",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },
  infoLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1e40af",
  },
  infoValue: {
    fontSize: "13px",
    fontFamily: "monospace",
    backgroundColor: "#fff",
    padding: "4px 8px",
    borderRadius: "3px",
    border: "1px solid #93c5fd",
  },
  credentialsBox: {
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    padding: "16px",
    marginBottom: "24px",
  },
  credentialField: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    color: "#374151",
    textTransform: "uppercase",
    marginBottom: "6px",
  },
  fieldWithCopy: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  credentialValue: {
    flex: 1,
    padding: "8px 12px",
    backgroundColor: "#fff",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    fontSize: "13px",
    fontFamily: "monospace",
    margin: 0,
    wordBreak: "break-all",
  },
  copyButton: {
    padding: "6px 12px",
    border: "none",
    borderRadius: "4px",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
    whiteSpace: "nowrap",
  },
  qrSection: {
    textAlign: "center",
    marginBottom: "24px",
    padding: "16px",
    backgroundColor: "#f3f4f6",
    borderRadius: "6px",
  },
  qrTitle: {
    margin: "0 0 12px 0",
    fontSize: "14px",
    fontWeight: "600",
    color: "#1f2937",
  },
  qrImage: {
    maxWidth: "200px",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    marginBottom: "12px",
  },
  qrHelp: {
    margin: 0,
    fontSize: "12px",
    color: "#666",
  },
  instructions: {
    backgroundColor: "#eff6ff",
    border: "1px solid #93c5fd",
    borderRadius: "6px",
    padding: "16px",
    marginBottom: "20px",
  },
  instructionTitle: {
    margin: "0 0 12px 0",
    fontSize: "13px",
    fontWeight: "600",
    color: "#1e40af",
  },
  instructionList: {
    margin: 0,
    paddingLeft: "20px",
    fontSize: "13px",
    color: "#1f2937",
  },
  actions: {
    padding: "16px 24px",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
  },
  primaryButton: {
    padding: "10px 24px",
    backgroundColor: "#059669",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background-color 0.2s",
  },
};

export default CredentialsModal;
