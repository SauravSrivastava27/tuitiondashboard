import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import api from "../api";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Badge from "../components/Badge";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/pages/AdminPanel.scss";

export default function AdminPanel() {
  const currentUsername = localStorage.getItem("username"); // stores email
  const displayName = (user) => user.name || user.email || user.username || "Unknown";
  const avatarChar = (user) => (user.name || user.email || user.username || "?")[0].toUpperCase();
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState("");

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkingUser, setLinkingUser] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const showMsg = (msg) => { setMessage(msg); setTimeout(() => setMessage(""), 3000); };

  useEffect(() => {
    Promise.all([api.get("/api/users"), api.get("/api/students?limit=1000")])
      .then(([usersRes, studentsRes]) => {
        setUsers(usersRes.data);
        setStudents(studentsRes.data.students || studentsRes.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleEditRoleClick = (user) => { setEditingUser(user); setNewRole(user.role); setShowRoleModal(true); };

  const handleSaveRole = async () => {
    try {
      await api.patch(`/api/users/${editingUser._id}/role`, { role: newRole });
      setUsers(users.map(u => u._id === editingUser._id ? { ...u, role: newRole } : u));
      setShowRoleModal(false);
      showMsg("Role updated successfully");
    } catch { showMsg("Failed to update role"); }
  };

  const handleLinkClick = (user) => { setLinkingUser(user); setSelectedStudentId(user.studentId?._id || user.studentId || ""); setShowLinkModal(true); };

  const handleSaveLink = async () => {
    if (!selectedStudentId) return showMsg("Please select a student");
    try {
      const res = await api.put("/api/student-users/link", { userId: linkingUser._id, studentId: selectedStudentId });
      const linked = students.find(s => s._id === selectedStudentId);
      setUsers(users.map(u => u._id === linkingUser._id ? { ...u, studentId: linked || selectedStudentId } : u));
      setShowLinkModal(false);
      showMsg(res.data.message);
    } catch (err) { showMsg(err.response?.data?.message || "Failed to link student"); }
  };

  const handleUnlink = async (user) => {
    if (!window.confirm(`Unlink student from "${displayName(user)}"?`)) return;
    try {
      await api.put(`/api/student-users/unlink/${user._id}`);
      setUsers(users.map(u => u._id === user._id ? { ...u, studentId: null } : u));
      showMsg(`Unlinked student from "${displayName(user)}"`);
    } catch { showMsg("Failed to unlink student"); }
  };

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`Delete user ${username}? This action cannot be undone.`)) return;
    try {
      await api.delete(`/api/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      showMsg(`User ${username} deleted`);
    } catch { showMsg("Failed to delete user"); }
  };

  const getLinkedStudent = (user) => {
    if (!user.studentId) return null;
    const id = user.studentId?._id || user.studentId;
    return students.find(s => s._id === id) || null;
  };

  return (
    <AdminLayout>
      <div>
        <h1 className="admin-panel-new__title">User Management</h1>
        <p className="admin-panel-new__subtitle">View, manage roles, and link users to student profiles</p>

        {message && (
          <div className={`admin-panel-new__banner admin-panel-new__banner--${message.toLowerCase().includes("fail") ? "error" : "success"}`}>
            {message}
          </div>
        )}

        {loading ? <LoadingSpinner /> : (
          <div className="admin-panel-new__table-wrapper">
            <table className="admin-panel-new__table">
              <thead>
                <tr>
                  {["Username", "Phone", "Role", "Linked Student", "Actions"].map(h => (
                    <th key={h} className="admin-panel-new__th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const linked = getLinkedStudent(user);
                  return (
                    <tr key={user._id}>
                      <td className="admin-panel-new__td">
                        <div className="admin-panel-new__user-cell">
                          <div className="admin-panel-new__avatar">{avatarChar(user)}</div>
                          <span>{displayName(user)}</span>
                        </div>
                      </td>
                      <td className="admin-panel-new__td">{user.phone || "—"}</td>
                      <td className="admin-panel-new__td"><Badge status={user.role}>{user.role}</Badge></td>
                      <td className="admin-panel-new__td">
                        {linked ? (
                          <div className="admin-panel-new__linked-cell">
                            <span className="admin-panel-new__linked-badge">{linked.name}</span>
                            <button onClick={() => handleUnlink(user)} title="Unlink" className="admin-panel-new__unlink-btn">✕</button>
                          </div>
                        ) : (
                          <span className="admin-panel-new__not-linked">Not linked</span>
                        )}
                      </td>
                      <td className="admin-panel-new__td">
                        <div className="admin-panel-new__row-actions">
                          <Button variant="outline" size="sm" onClick={() => handleEditRoleClick(user)} disabled={(user.email || user.username) === currentUsername} title={(user.email || user.username) === currentUsername ? "You cannot change your own role" : ""}>Edit Role</Button>
                          {user.role !== "admin" && (
                            <Button variant="primary" size="sm" onClick={() => handleLinkClick(user)}>{linked ? "Change Student" : "Link Student"}</Button>
                          )}
                          <Button variant="danger" size="sm" onClick={() => handleDelete(user._id, displayName(user))} disabled={(user.email || user.username) === currentUsername} title={(user.email || user.username) === currentUsername ? "You cannot delete your own account" : ""}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {users.length === 0 && <div className="admin-panel-new__empty">No users found</div>}
          </div>
        )}
      </div>

      <Modal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} title="Edit User Role">
        <p style={{ marginBottom: "16px", color: "#374151" }}>User: <strong>{editingUser ? displayName(editingUser) : ""}</strong></p>
        <div className="admin-panel-new__modal-field">
          <label className="admin-panel-new__modal-label">Role</label>
          <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="admin-panel-new__modal-select">
            <option value="admin">admin</option>
            <option value="student">student</option>
          </select>
        </div>
        <div className="admin-panel-new__modal-actions">
          <Button onClick={handleSaveRole}>Save Changes</Button>
          <Button variant="outline" onClick={() => setShowRoleModal(false)}>Cancel</Button>
        </div>
      </Modal>

      <Modal isOpen={showLinkModal} onClose={() => setShowLinkModal(false)} title="Link User to Student">
        <p style={{ marginBottom: "16px", color: "#374151" }}>Select the student profile to link with <strong>{linkingUser ? displayName(linkingUser) : ""}</strong>:</p>
        <div className="admin-panel-new__modal-field">
          <label className="admin-panel-new__modal-label">Student</label>
          <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} className="admin-panel-new__modal-select">
            <option value="">— Select a student —</option>
            {students.map(s => <option key={s._id} value={s._id}>{s.name} — {s.className} ({s.school})</option>)}
          </select>
        </div>
        <div className="admin-panel-new__modal-actions">
          <Button onClick={handleSaveLink}>Link Student</Button>
          <Button variant="outline" onClick={() => setShowLinkModal(false)}>Cancel</Button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
