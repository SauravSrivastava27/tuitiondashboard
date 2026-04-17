import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import api from "../api";
import Button from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";
import CredentialsModal from "../components/CredentialsModal";
import Badge from "../components/Badge";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/pages/AdminStudentManagement.scss";

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
    const params = new URLSearchParams({ page: currentPage, limit: LIMIT, ...(search && { search }), ...(status && { status }) });
    api.get(`/api/students?${params}`)
      .then(res => {
        setStudents(res.data.students);
        setTotalPages(res.data.pagination.pages);
        res.data.students.forEach(student => {
          api.get(`/api/student-users/student/${student._id}/user-status`)
            .then(statusRes => setUserStatuses(prev => ({ ...prev, [student._id]: statusRes.data.user })))
            .catch(err => console.error("Failed to check user status:", err));
        });
      })
      .catch(err => console.error("Failed to load students:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadStudents(); }, [currentPage, search, status]);

  const handleAddClick = () => {
    setEditingStudent(null);
    setFormData({ name: "", address: "", guardianName: "", school: "", className: "", contactNo: "", fee: "", status: "active" });
    setShowModal(true);
  };

  const handleEditClick = (student) => { setEditingStudent(student); setFormData(student); setShowModal(true); };

  const handleSave = async () => {
    try {
      if (editingStudent) { await api.put(`/api/students/${editingStudent._id}`, formData); }
      else { await api.post("/api/students", formData); }
      setShowModal(false);
      loadStudents();
    } catch (err) { console.error("Failed to save student:", err); alert("Error saving student"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    try { await api.delete(`/api/students/${id}`); loadStudents(); }
    catch (err) { console.error("Failed to delete student:", err); alert("Error deleting student"); }
  };

  const handleShowCredentials = (student, userData) => {
    setSelectedUserData({ studentName: student.name, studentId: student._id, ...userData });
    setShowCredentialsModal(true);
  };

  return (
    <AdminLayout>
      <div>
        <div className="admin-student-mgmt__header">
          <div>
            <h1 className="admin-student-mgmt__title">Student Management</h1>
            <p className="admin-student-mgmt__subtitle">View, add, and manage all students in the system</p>
          </div>
          <Button onClick={handleAddClick}>+ Add Student</Button>
        </div>

        <div className="admin-student-mgmt__filters">
          <div className="admin-student-mgmt__search-wrap">
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="admin-student-mgmt__search-input"
            />
          </div>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }} className="admin-student-mgmt__status-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="admin-student-mgmt__table-wrapper">
            <table className="admin-student-mgmt__table">
              <thead>
                <tr>
                  {["Name", "Guardian", "Address", "School", "Class", "Fee", "Student ID", "Status", "Actions"].map(h => (
                    <th key={h} className="admin-student-mgmt__th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student._id}>
                    <td className="admin-student-mgmt__td">{student.name}</td>
                    <td className="admin-student-mgmt__td">{student.guardianName}</td>
                    <td className="admin-student-mgmt__td">{student.address}</td>
                    <td className="admin-student-mgmt__td">{student.school}</td>
                    <td className="admin-student-mgmt__td">{student.className}</td>
                    <td className="admin-student-mgmt__td">₹{student.fee}</td>
                    <td className="admin-student-mgmt__td">{student._id}</td>
                    <td className="admin-student-mgmt__td"><Badge status={student.status}>{student.status}</Badge></td>
                    <td className="admin-student-mgmt__td">
                      <div className="admin-student-mgmt__actions">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(student)}>Edit</Button>
                        {userStatuses[student._id] ? (
                          <Button variant="secondary" size="sm" onClick={() => handleShowCredentials(student, userStatuses[student._id])}>
                            👤 Show Details
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" disabled>No User Created</Button>
                        )}
                        <Button variant="danger" size="sm" onClick={() => handleDelete(student._id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {students.length === 0 && <div className="admin-student-mgmt__empty">No students found</div>}
          </div>
        )}

        {totalPages > 1 && (
          <div className="admin-student-mgmt__pagination">
            <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</Button>
            <div className="admin-student-mgmt__page-info">Page {currentPage} of {totalPages}</div>
            <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingStudent ? "Edit Student" : "Add Student"}>
        <div className="admin-student-mgmt__modal-form">
          <Input label="Name" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="Address" value={formData.address || ""} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required />
          <Input label="Guardian Name" value={formData.guardianName || ""} onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })} required />
          <Input label="School" value={formData.school || ""} onChange={(e) => setFormData({ ...formData, school: e.target.value })} required />
          <Input label="Class" value={formData.className || ""} onChange={(e) => setFormData({ ...formData, className: e.target.value })} required />
          <Input label="Contact" value={formData.contactNo || ""} onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })} required />
          <Input label="Fee" type="number" value={formData.fee || ""} onChange={(e) => setFormData({ ...formData, fee: e.target.value })} required />
          <div className="admin-student-mgmt__modal-status-wrap">
            <label className="admin-student-mgmt__modal-status-label">Status</label>
            <select value={formData.status || "active"} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="admin-student-mgmt__modal-select">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="admin-student-mgmt__modal-actions">
            <Button onClick={handleSave}>Save</Button>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      <CredentialsModal
        isOpen={showCredentialsModal}
        onClose={() => setShowCredentialsModal(false)}
        credentials={{ username: selectedUserData?.username }}
        studentId={selectedUserData?.studentId}
      />
    </AdminLayout>
  );
}
