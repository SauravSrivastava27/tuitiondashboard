import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import api from "../api";
import Button from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";
import Badge from "../components/Badge";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AdminStudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({});
  const [userStatuses, setUserStatuses] = useState({});
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [selectedUserData, setSelectedUserData] = useState(null);

  const LIMIT = 10;

  const loadStudents = () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: currentPage,
      limit: LIMIT,
      ...(search && { search }),
      ...(status && { status })
    });

    api.get(`/api/students?${params}`)
      .then(res => {
        setStudents(res.data.students);
        setTotalPages(res.data.pagination.pages);

        // Check user status for each student
        const statuses = {};
        res.data.students.forEach(student => {
          api.get(`/api/student-users/student/${student._id}/user-status`)
            .then(statusRes => {
              statuses[student._id] = statusRes.data.user;
              setUserStatuses(prev => ({ ...prev, [student._id]: statusRes.data.user }));
            })
            .catch(err => console.error("Failed to check user status:", err));
        });
      })
      .catch(err => console.error("Failed to load students:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStudents();
  }, [currentPage, search, status]);

  const handleAddClick = () => {
    setEditingStudent(null);
    setFormData({
      name: "",
      address: "",
      guardianName: "",
      school: "",
      className: "",
      contactNo: "",
      fee: "",
      status: "active"
    });
    setShowModal(true);
  };

  const handleEditClick = (student) => {
    setEditingStudent(student);
    setFormData(student);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingStudent) {
        await api.put(`/api/students/${editingStudent._id}`, formData);
      } else {
        await api.post("/api/students", formData);
      }
      setShowModal(false);
      loadStudents();
    } catch (err) {
      console.error("Failed to save student:", err);
      alert("Error saving student");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    try {
      await api.delete(`/api/students/${id}`);
      loadStudents();
    } catch (err) {
      console.error("Failed to delete student:", err);
      alert("Error deleting student");
    }
  };

  const handleShowCredentials = (student, userData) => {
    setSelectedUserData({
      studentName: student.name,
      ...userData
    });
    setShowCredentialsModal(true);
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
    overflow: "hidden",
  };

  const thStyle = {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  const tdStyle = {
    padding: "14px 16px",
    fontSize: "14px",
    color: "#374151",
    borderBottom: "1px solid #f3f4f6",
    verticalAlign: "middle",
  };

  const actionsStyle = {
    display: "flex",
    gap: "6px",
  };

  const filterStyle = {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
    flexWrap: "wrap",
  };

  return (
    <AdminLayout>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1a1a2e", margin: 0, marginBottom: "4px" }}>
              Student Management
            </h1>
            <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
              View, add, and manage all students in the system
            </p>
          </div>
          <Button onClick={handleAddClick}>+ Add Student</Button>
        </div>

        <div style={filterStyle}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              backgroundColor: "#fff",
              cursor: "pointer",
              minWidth: "150px"
            }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div style={{ backgroundColor: "#fff", borderRadius: "10px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", overflow: "hidden" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Guardian</th>
                  <th style={thStyle}>Address</th>
                  <th style={thStyle}>School</th>
                  <th style={thStyle}>Class</th>
                  <th style={thStyle}>Fee</th>
                  <th style={thStyle}>Student ID</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student._id}>
                    <td style={tdStyle}>{student.name}</td>
                    <td style={tdStyle}>{student.guardianName}</td>
                    <td style={tdStyle}>{student.address}</td>
                    <td style={tdStyle}>{student.school}</td>
                    <td style={tdStyle}>{student.className}</td>
                    <td style={tdStyle}>₹{student.fee}</td>
                    <td style={tdStyle}>{student._id}</td>
                    <td style={tdStyle}>
                      <Badge status={student.status}>{student.status}</Badge>
                    </td>
                    <td style={tdStyle}>
                      <div style={actionsStyle}>
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(student)}>
                          Edit
                        </Button>
                        {userStatuses[student._id] ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              // Get user data from the user statuses
                              const userData = userStatuses[student._id];
                              handleShowCredentials(student, userData);
                            }}
                          >
                            👤 Show Credentials
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" disabled>
                            No User Created
                          </Button>
                        )}
                        <Button variant="danger" size="sm" onClick={() => handleDelete(student._id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {students.length === 0 && (
              <div style={{ padding: "40px", textAlign: "center", color: "#aaa" }}>
                No students found
              </div>
            )}
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "20px" }}>
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              Previous
            </Button>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingStudent ? "Edit Student" : "Add Student"}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Input
            label="Name"
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Address"
            value={formData.address || ""}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />
          <Input
            label="Guardian Name"
            value={formData.guardianName || ""}
            onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
            required
          />
          <Input
            label="School"
            value={formData.school || ""}
            onChange={(e) => setFormData({ ...formData, school: e.target.value })}
            required
          />
          <Input
            label="Class"
            value={formData.className || ""}
            onChange={(e) => setFormData({ ...formData, className: e.target.value })}
            required
          />
          <Input
            label="Contact"
            value={formData.contactNo || ""}
            onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
            required
          />
          <Input
            label="Fee"
            type="number"
            value={formData.fee || ""}
            onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
            required
          />
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
              Status
            </label>
            <select
              value={formData.status || "active"}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "#fff",
                cursor: "pointer",
                boxSizing: "border-box",
                color: '#000000'
              }}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <Button onClick={handleSave}>Save</Button>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Credentials Modal - Display existing user credentials */}
      <Modal isOpen={showCredentialsModal} onClose={() => setShowCredentialsModal(false)} title={`Login Credentials - ${selectedUserData?.studentName}`}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{
            backgroundColor: "#f0f2f5",
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid #d1d5db"
          }}>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#666", marginBottom: "4px" }}>
                Username
              </label>
              <div style={{
                backgroundColor: "#fff",
                padding: "10px 12px",
                borderRadius: "6px",
                fontSize: "14px",
                fontFamily: "monospace",
                color: "#1a1a2e",
                border: "1px solid #d1d5db",
                wordBreak: "break-all"
              }}>
                {selectedUserData?.username || "N/A"}
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#666", marginBottom: "4px" }}>
                Password
              </label>
              <div style={{
                backgroundColor: "#fff",
                padding: "10px 12px",
                borderRadius: "6px",
                fontSize: "14px",
                color: "#999",
                border: "1px solid #d1d5db",
                fontStyle: "italic"
              }}>
                ••••••• (Hashed - Not retrievable)
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: "#fef3c7",
            padding: "12px",
            borderRadius: "6px",
            border: "1px solid #fcd34d",
            fontSize: "13px",
            color: "#92400e"
          }}>
            <strong>ℹ️ Note:</strong> Passwords are securely hashed and cannot be retrieved. The user must use the password they set during registration.
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <Button variant="outline" onClick={() => setShowCredentialsModal(false)}>Close</Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
