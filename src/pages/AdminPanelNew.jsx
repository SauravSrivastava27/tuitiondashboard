import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import api from "../api";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Badge from "../components/Badge";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AdminPanelNew() {
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Edit role modal
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState("");

  // Link student modal
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkingUser, setLinkingUser] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const showMsg = (msg) => { setMessage(msg); setTimeout(() => setMessage(""), 3000); };

  useEffect(() => {
    Promise.all([
      api.get("/api/users"),
      api.get("/api/students?limit=1000"),
    ]).then(([usersRes, studentsRes]) => {
      setUsers(usersRes.data);
      // students route returns { students: [...], total, pages }
      setStudents(studentsRes.data.students || studentsRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // ---------- Role ----------
  const handleEditRoleClick = (user) => {
    setEditingUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const handleSaveRole = async () => {
    try {
      await api.patch(`/api/users/${editingUser._id}/role`, { role: newRole });
      setUsers(users.map(u => u._id === editingUser._id ? { ...u, role: newRole } : u));
      setShowRoleModal(false);
      showMsg("Role updated successfully");
    } catch {
      showMsg("Failed to update role");
    }
  };

  // ---------- Link Student ----------
  const handleLinkClick = (user) => {
    setLinkingUser(user);
    setSelectedStudentId(user.studentId?._id || user.studentId || "");
    setShowLinkModal(true);
  };

  const handleSaveLink = async () => {
    if (!selectedStudentId) return showMsg("Please select a student");
    try {
      const res = await api.put("/api/student-users/link", {
        userId: linkingUser._id,
        studentId: selectedStudentId,
      });
      const linked = students.find(s => s._id === selectedStudentId);
      setUsers(users.map(u =>
        u._id === linkingUser._id ? { ...u, studentId: linked || selectedStudentId } : u
      ));
      setShowLinkModal(false);
      showMsg(res.data.message);
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to link student");
    }
  };

  const handleUnlink = async (user) => {
    if (!window.confirm(`Unlink student from "${user.username}"?`)) return;
    try {
      await api.put(`/api/student-users/unlink/${user._id}`);
      setUsers(users.map(u => u._id === user._id ? { ...u, studentId: null } : u));
      showMsg(`Unlinked student from "${user.username}"`);
    } catch {
      showMsg("Failed to unlink student");
    }
  };

  // ---------- Delete ----------
  const handleDelete = async (userId, username) => {
    if (!window.confirm(`Delete user ${username}? This action cannot be undone.`)) return;
    try {
      await api.delete(`/api/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      showMsg(`User ${username} deleted`);
    } catch {
      showMsg("Failed to delete user");
    }
  };

  // ---------- Linked student name helper ----------
  const getLinkedStudent = (user) => {
    if (!user.studentId) return null;
    const id = user.studentId?._id || user.studentId;
    return students.find(s => s._id === id) || null;
  };

  const th = {
    padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600",
    color: "#6b7280", backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb",
    textTransform: "uppercase", letterSpacing: "0.5px",
  };
  const td = {
    padding: "14px 16px", fontSize: "14px", color: "#374151", borderBottom: "1px solid #f3f4f6",
  };

  return (
    <AdminLayout>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 6px" }}>
          User Management
        </h1>
        <p style={{ fontSize: "14px", color: "#666", margin: "0 0 20px" }}>
          View, manage roles, and link users to student profiles
        </p>

        {message && (
          <div style={{
            backgroundColor: message.toLowerCase().includes("fail") ? "#fee2e2" : "#d1fae5",
            color: message.toLowerCase().includes("fail") ? "#991b1b" : "#065f46",
            padding: "10px 16px", borderRadius: "6px", marginBottom: "16px",
            fontSize: "14px", fontWeight: "500",
          }}>
            {message}
          </div>
        )}

        {loading ? <LoadingSpinner /> : (
          <div style={{ backgroundColor: "#fff", borderRadius: "10px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Username</th>
                  <th style={th}>Phone</th>
                  <th style={th}>Role</th>
                  <th style={th}>Linked Student</th>
                  <th style={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const linked = getLinkedStudent(user);
                  return (
                    <tr key={user._id}>
                      <td style={td}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            width: "32px", height: "32px", borderRadius: "50%",
                            backgroundColor: "#4f46e5", color: "#fff", display: "flex",
                            alignItems: "center", justifyContent: "center",
                            fontWeight: "700", fontSize: "14px", flexShrink: 0,
                          }}>
                            {user.username[0]?.toUpperCase()}
                          </div>
                          <span>{user.username}</span>
                        </div>
                      </td>
                      <td style={td}>{user.phone || "—"}</td>
                      <td style={td}><Badge status={user.role}>{user.role}</Badge></td>
                      <td style={td}>
                        {linked ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{
                              backgroundColor: "#d1fae5", color: "#065f46",
                              padding: "3px 10px", borderRadius: "12px",
                              fontSize: "12px", fontWeight: "600",
                            }}>
                              {linked.name}
                            </span>
                            <button
                              onClick={() => handleUnlink(user)}
                              title="Unlink"
                              style={{
                                background: "none", border: "none", cursor: "pointer",
                                color: "#9ca3af", fontSize: "16px", padding: "0 2px",
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: "#aaa", fontSize: "13px" }}>Not linked</span>
                        )}
                      </td>
                      <td style={td}>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          <Button variant="outline" size="sm" onClick={() => handleEditRoleClick(user)}>
                            Edit Role
                          </Button>
                          {user.role !== "admin" && (
                            <Button variant="primary" size="sm" onClick={() => handleLinkClick(user)}>
                              {linked ? "Change Student" : "Link Student"}
                            </Button>
                          )}
                          <Button variant="danger" size="sm" onClick={() => handleDelete(user._id, user.username)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {users.length === 0 && (
              <div style={{ padding: "40px", textAlign: "center", color: "#aaa" }}>No users found</div>
            )}
          </div>
        )}
      </div>

      {/* Edit Role Modal */}
      <Modal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} title="Edit User Role">
        <p style={{ marginBottom: "16px", color: "#374151" }}>
          User: <strong>{editingUser?.username}</strong>
        </p>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
            Role
          </label>
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", backgroundColor: "#fff", boxSizing: "border-box" }}
          >
            <option value="admin">admin</option>
            <option value="student">student</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Button onClick={handleSaveRole}>Save Changes</Button>
          <Button variant="outline" onClick={() => setShowRoleModal(false)}>Cancel</Button>
        </div>
      </Modal>

      {/* Link Student Modal */}
      <Modal isOpen={showLinkModal} onClose={() => setShowLinkModal(false)} title="Link User to Student">
        <p style={{ marginBottom: "16px", color: "#374151" }}>
          Select the student profile to link with <strong>{linkingUser?.username}</strong>:
        </p>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
            Student
          </label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", backgroundColor: "#fff", boxSizing: "border-box", color: selectedStudentId ? "#374151" : "#000" }}
          >
            <option value="">— Select a student —</option>
            {students.map(s => (
              <option key={s._id} value={s._id}>
                {s.name} — {s.className} ({s.school})
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Button onClick={handleSaveLink}>Link Student</Button>
          <Button variant="outline" onClick={() => setShowLinkModal(false)}>Cancel</Button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
