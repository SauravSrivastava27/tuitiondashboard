import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { getUsername, clearAuth } from "../utils/auth";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null); // userId being saved
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/users")
      .then(res => setUsers(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = (userId, newRole) => {
    setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
  };

  const handleSaveRole = async (userId) => {
    const user = users.find(u => u._id === userId);
    setSaving(userId);
    setMessage("");
    try {
      await api.put(`/api/users/${userId}/role`, { role: user.role });
      setMessage(`Role updated for ${user.username}`);
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("Failed to update role");
    } finally {
      setSaving(null);
    }
  };

  const handleLogout = async () => {
    try { await api.post("/api/auth/logout"); } finally {
      clearAuth();
      navigate("/login");
    }
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.logo}>📚</span>
          <div>
            <div style={styles.headerTitle}>Admin Panel</div>
            <div style={styles.headerSub}>Logged in as <strong>{getUsername()}</strong></div>
          </div>
        </div>
        <div style={styles.headerRight}>
          <button onClick={() => navigate("/dashboard")} style={styles.secondaryBtn}>Student Dashboard</button>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.pageHeader}>
          <h2 style={styles.pageTitle}>User Management</h2>
          <p style={styles.pageDesc}>View all registered users and manage their roles.</p>
        </div>

        {message && (
          <div style={message.includes("Failed") ? styles.errorBanner : styles.successBanner}>
            {message}
          </div>
        )}

        {loading ? (
          <div style={styles.loading}>Loading users...</div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Username</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Current Role</th>
                  <th style={styles.th}>Change Role</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <div style={styles.avatar}>{user.username[0].toUpperCase()}</div>
                        <span>{user.username}</span>
                      </div>
                    </td>
                    <td style={styles.td}>{user.phone || "—"}</td>
                    <td style={styles.td}>
                      <span style={user.role === "admin" ? styles.badgeAdmin : styles.badgeUser}>
                        {user.role || "user"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <select
                        value={user.role || "user"}
                        onChange={e => handleRoleChange(user._id, e.target.value)}
                        style={styles.select}
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() => handleSaveRole(user._id)}
                        disabled={saving === user._id}
                        style={saving === user._id ? styles.saveBtnDisabled : styles.saveBtn}
                      >
                        {saving === user._id ? "Saving..." : "Save"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div style={styles.empty}>No users found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#f5f6fa", fontFamily: "'Segoe UI', Roboto, sans-serif" },

  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "14px 32px", backgroundColor: "#fff", borderBottom: "1px solid #e5e7eb",
    position: "sticky", top: 0, zIndex: 10,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "12px" },
  logo: { fontSize: "28px" },
  headerTitle: { fontSize: "18px", fontWeight: "700", color: "#1a1a2e" },
  headerSub: { fontSize: "12px", color: "#888" },
  headerRight: { display: "flex", gap: "10px" },
  secondaryBtn: {
    padding: "8px 16px", border: "1px solid #4f46e5", borderRadius: "6px",
    backgroundColor: "transparent", color: "#4f46e5", fontWeight: "600", cursor: "pointer", fontSize: "13px",
  },
  logoutBtn: {
    padding: "8px 16px", border: "none", borderRadius: "6px",
    backgroundColor: "#ef4444", color: "#fff", fontWeight: "600", cursor: "pointer", fontSize: "13px",
  },

  content: { maxWidth: "1000px", margin: "0 auto", padding: "32px 24px" },
  pageHeader: { marginBottom: "24px" },
  pageTitle: { fontSize: "24px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 6px" },
  pageDesc: { fontSize: "14px", color: "#666", margin: 0 },

  successBanner: {
    backgroundColor: "#d1fae5", color: "#065f46", padding: "10px 16px",
    borderRadius: "6px", marginBottom: "16px", fontSize: "14px", fontWeight: "500",
  },
  errorBanner: {
    backgroundColor: "#fee2e2", color: "#991b1b", padding: "10px 16px",
    borderRadius: "6px", marginBottom: "16px", fontSize: "14px", fontWeight: "500",
  },

  loading: { textAlign: "center", padding: "60px", color: "#888", fontSize: "15px" },
  empty: { textAlign: "center", padding: "40px", color: "#aaa", fontSize: "14px" },

  tableWrapper: { backgroundColor: "#fff", borderRadius: "10px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600",
    color: "#6b7280", backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb",
    textTransform: "uppercase", letterSpacing: "0.5px",
  },
  tr: { borderBottom: "1px solid #f3f4f6" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#374151", verticalAlign: "middle" },

  userCell: { display: "flex", alignItems: "center", gap: "10px" },
  avatar: {
    width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#4f46e5",
    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: "700", fontSize: "14px", flexShrink: 0,
  },

  badgeAdmin: {
    display: "inline-block", padding: "3px 10px", borderRadius: "100px",
    backgroundColor: "#ede9fe", color: "#4f46e5", fontSize: "12px", fontWeight: "600",
  },
  badgeUser: {
    display: "inline-block", padding: "3px 10px", borderRadius: "100px",
    backgroundColor: "#f0fdf4", color: "#16a34a", fontSize: "12px", fontWeight: "600",
  },

  select: {
    padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: "6px",
    fontSize: "13px", color: "#374151", backgroundColor: "#fff", cursor: "pointer",
  },
  saveBtn: {
    padding: "6px 16px", border: "none", borderRadius: "6px",
    backgroundColor: "#4f46e5", color: "#fff", fontWeight: "600", cursor: "pointer", fontSize: "13px",
  },
  saveBtnDisabled: {
    padding: "6px 16px", border: "none", borderRadius: "6px",
    backgroundColor: "#a5b4fc", color: "#fff", fontWeight: "600", cursor: "not-allowed", fontSize: "13px",
  },
};
