import { useEffect, useState } from "react";
import api from "../api";
import { Link, useNavigate } from "react-router-dom";
import { getUsername, isAdmin, clearAuth } from "../utils/auth";

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/students").then(res => setStudents(res.data));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    await api.delete(`/api/students/${id}`);
    setStudents(students.filter(s => s._id !== id));
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
            <div style={styles.headerTitle}>Student Dashboard</div>
            <div style={styles.headerSub}>Welcome, <strong>{getUsername()}</strong></div>
          </div>
        </div>
        <div style={styles.headerRight}>
          {isAdmin() && (
            <button onClick={() => navigate("/admin")} style={styles.adminBtn}>Admin Panel</button>
          )}
          <Link to="/add" style={styles.addBtn}>+ Add Student</Link>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.pageHeader}>
          <h2 style={styles.pageTitle}>Students</h2>
          <span style={styles.count}>{students.length} total</span>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["Name", "School", "Class", "Guardian", "Contact", "Fee", "Actions"].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s._id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.nameCell}>
                      <div style={styles.avatar}>{s.name[0]?.toUpperCase()}</div>
                      <div>
                        <div style={styles.studentName}>{s.name}</div>
                        <div style={styles.address}>{s.address}</div>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>{s.school}</td>
                  <td style={styles.td}>{s.className}</td>
                  <td style={styles.td}>{s.guardianName}</td>
                  <td style={styles.td}>{s.contactNo}</td>
                  <td style={styles.td}><span style={styles.fee}>₹{s.fee}</span></td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <Link to={`/edit/${s._id}`} style={styles.editBtn}>Edit</Link>
                      <button onClick={() => handleDelete(s._id)} style={styles.deleteBtn}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length === 0 && (
            <div style={styles.empty}>No students yet. <Link to="/add">Add one</Link>.</div>
          )}
        </div>
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
  headerRight: { display: "flex", gap: "10px", alignItems: "center" },
  adminBtn: {
    padding: "8px 16px", border: "1px solid #4f46e5", borderRadius: "6px",
    backgroundColor: "transparent", color: "#4f46e5", fontWeight: "600", cursor: "pointer", fontSize: "13px",
  },
  addBtn: {
    padding: "8px 16px", border: "none", borderRadius: "6px",
    backgroundColor: "#4f46e5", color: "#fff", fontWeight: "600", fontSize: "13px",
    textDecoration: "none", display: "inline-block",
  },
  logoutBtn: {
    padding: "8px 16px", border: "none", borderRadius: "6px",
    backgroundColor: "#ef4444", color: "#fff", fontWeight: "600", cursor: "pointer", fontSize: "13px",
  },

  content: { maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" },
  pageHeader: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" },
  pageTitle: { fontSize: "24px", fontWeight: "700", color: "#1a1a2e", margin: 0 },
  count: { backgroundColor: "#ede9fe", color: "#4f46e5", padding: "3px 10px", borderRadius: "100px", fontSize: "13px", fontWeight: "600" },

  tableWrapper: { backgroundColor: "#fff", borderRadius: "10px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600",
    color: "#6b7280", backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb",
    textTransform: "uppercase", letterSpacing: "0.5px",
  },
  tr: { borderBottom: "1px solid #f3f4f6" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#374151", verticalAlign: "middle" },

  nameCell: { display: "flex", alignItems: "center", gap: "10px" },
  avatar: {
    width: "34px", height: "34px", borderRadius: "50%", backgroundColor: "#4f46e5",
    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: "700", fontSize: "14px", flexShrink: 0,
  },
  studentName: { fontWeight: "600", color: "#1a1a2e", fontSize: "14px" },
  address: { fontSize: "12px", color: "#9ca3af", marginTop: "2px" },
  fee: { fontWeight: "600", color: "#16a34a" },

  actions: { display: "flex", gap: "8px", alignItems: "center" },
  editBtn: {
    padding: "5px 12px", border: "1px solid #4f46e5", borderRadius: "4px",
    color: "#4f46e5", fontSize: "12px", fontWeight: "600", textDecoration: "none",
  },
  deleteBtn: {
    padding: "5px 12px", border: "none", borderRadius: "4px",
    backgroundColor: "#fee2e2", color: "#ef4444", fontSize: "12px", fontWeight: "600", cursor: "pointer",
  },

  empty: { textAlign: "center", padding: "48px", color: "#aaa", fontSize: "14px" },
};
