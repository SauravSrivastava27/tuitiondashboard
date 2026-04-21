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
  const [managingStudent, setManagingStudent] = useState(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showSubjectsModal, setShowSubjectsModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);

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
            .catch(() => {});
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

  const handleOpenAttendance = (student) => { setManagingStudent(student); setShowAttendanceModal(true); };
  const handleOpenSubjects = (student) => { setManagingStudent(student); setShowSubjectsModal(true); };
  const handleOpenProgress = (student) => { setManagingStudent(student); setShowProgressModal(true); };

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
            <input type="text" placeholder="Search by name..." value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="admin-student-mgmt__search-input" />
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
                  {["Name", "Guardian", "School", "Class", "Fee", "Status", "Actions"].map(h => (
                    <th key={h} className="admin-student-mgmt__th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student._id}>
                    <td className="admin-student-mgmt__td">{student.name}</td>
                    <td className="admin-student-mgmt__td">{student.guardianName}</td>
                    <td className="admin-student-mgmt__td">{student.school}</td>
                    <td className="admin-student-mgmt__td">{student.className}</td>
                    <td className="admin-student-mgmt__td">₹{student.fee}</td>
                    <td className="admin-student-mgmt__td"><Badge status={student.status}>{student.status}</Badge></td>
                    <td className="admin-student-mgmt__td">
                      <div className="admin-student-mgmt__actions">
                        <IconBtn title="Edit" onClick={() => handleEditClick(student)}>✏️</IconBtn>
                        <IconBtn title="Attendance" onClick={() => handleOpenAttendance(student)}>📅</IconBtn>
                        <IconBtn title="Subjects" onClick={() => handleOpenSubjects(student)}>📚</IconBtn>
                        <IconBtn title="Progress" onClick={() => handleOpenProgress(student)}>📊</IconBtn>
                        {userStatuses[student._id] ? (
                          <IconBtn title="Show Details" onClick={() => handleShowCredentials(student, userStatuses[student._id])}>👁️</IconBtn>
                        ) : (
                          <IconBtn title="No user linked" disabled>👤</IconBtn>
                        )}
                        <IconBtn title="Delete" onClick={() => handleDelete(student._id)} danger>🗑️</IconBtn>
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
        credentials={selectedUserData}
        studentId={selectedUserData?.studentId}
      />

      <AttendanceModal
        isOpen={showAttendanceModal}
        student={managingStudent}
        onClose={() => { setShowAttendanceModal(false); loadStudents(); }}
      />

      <SubjectsModal
        isOpen={showSubjectsModal}
        student={managingStudent}
        onClose={() => { setShowSubjectsModal(false); loadStudents(); }}
      />

      <ProgressModal
        isOpen={showProgressModal}
        student={managingStudent}
        onClose={() => { setShowProgressModal(false); loadStudents(); }}
      />
    </AdminLayout>
  );
}

function ProgressModal({ isOpen, student, onClose }) {
  const [academicLevel, setAcademicLevel] = useState("");
  const [performanceGrade, setPerformanceGrade] = useState("");
  const [lastReview, setLastReview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (isOpen && student) {
      api.get(`/api/students/${student._id}`)
        .then(res => {
          const p = res.data.progress || {};
          setAcademicLevel(p.academicLevel || "");
          setPerformanceGrade(p.performanceGrade || "");
          setLastReview(p.lastReviewDate || null);
          setMsg("");
        });
    }
  }, [isOpen, student]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.post(`/api/students/${student._id}/progress`, { academicLevel, performanceGrade });
      const p = res.data.progress || {};
      setAcademicLevel(p.academicLevel || "");
      setPerformanceGrade(p.performanceGrade || "");
      setLastReview(p.lastReviewDate || null);
      setMsg("Progress saved!");
      setTimeout(() => setMsg(""), 2500);
    } catch {
      setMsg("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const gradeColor = { A: "#16a34a", B: "#0891b2", C: "#f59e0b", D: "#f97316", F: "#ef4444" };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`📊 ${student?.name} — Academic Progress`}>
      <div className="admin-student-mgmt__mgmt-form">
        {lastReview && (
          <p className="admin-student-mgmt__mgmt-last-review">
            Last reviewed: {new Date(lastReview).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        )}

        <div className="admin-student-mgmt__progress-field">
          <label className="admin-student-mgmt__modal-status-label">Academic Level / Stream</label>
          <input
            type="text"
            className="admin-student-mgmt__mgmt-input"
            style={{ width: "100%" }}
            placeholder="e.g. Class 10, JEE Foundation, Science Stream"
            value={academicLevel}
            onChange={e => setAcademicLevel(e.target.value)}
          />
        </div>

        <div className="admin-student-mgmt__progress-field">
          <label className="admin-student-mgmt__modal-status-label">Performance Grade</label>
          <div className="admin-student-mgmt__grade-options">
            {["A", "B", "C", "D", "F"].map(g => (
              <button
                key={g}
                onClick={() => setPerformanceGrade(g)}
                className={`admin-student-mgmt__grade-btn${performanceGrade === g ? " admin-student-mgmt__grade-btn--active" : ""}`}
                style={performanceGrade === g ? { background: gradeColor[g], borderColor: gradeColor[g], color: "#fff" } : {}}
              >
                {g}
              </button>
            ))}
            <button
              onClick={() => setPerformanceGrade("")}
              className={`admin-student-mgmt__grade-btn${performanceGrade === "" ? " admin-student-mgmt__grade-btn--active" : ""}`}
              style={performanceGrade === "" ? { background: "#6b7280", borderColor: "#6b7280", color: "#fff" } : {}}
            >
              —
            </button>
          </div>
        </div>

        {msg && <p style={{ color: msg.includes("Failed") ? "#ef4444" : "#16a34a", fontSize: 13, fontWeight: 600, margin: 0 }}>{msg}</p>}

        <div className="admin-student-mgmt__modal-actions">
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Progress"}</Button>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}

function IconBtn({ children, onClick, title, danger, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`admin-student-mgmt__icon-btn${danger ? " admin-student-mgmt__icon-btn--danger" : ""}${disabled ? " admin-student-mgmt__icon-btn--disabled" : ""}`}
    >
      {children}
    </button>
  );
}

function AttendanceModal({ isOpen, student, onClose }) {
  const [attendance, setAttendance] = useState([]);
  const [date, setDate] = useState("");
  const [present, setPresent] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && student) {
      api.get(`/api/students/${student._id}`)
        .then(res => setAttendance(res.data.attendance || []));
    }
  }, [isOpen, student]);

  const handleMark = async () => {
    if (!date) return;
    setSaving(true);
    try {
      const res = await api.post(`/api/students/${student._id}/attendance`, { date, present });
      setAttendance(res.data.attendance || []);
      setDate("");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (attendanceId) => {
    const res = await api.delete(`/api/students/${student._id}/attendance/${attendanceId}`);
    setAttendance(res.data.attendance || []);
  };

  const sorted = [...attendance].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`📅 ${student?.name} — Attendance`}>
      <div className="admin-student-mgmt__mgmt-form">
        <div className="admin-student-mgmt__mgmt-row">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="admin-student-mgmt__mgmt-input" />
          <select value={present} onChange={e => setPresent(e.target.value === "true")} className="admin-student-mgmt__mgmt-select">
            <option value="true">Present</option>
            <option value="false">Absent</option>
          </select>
          <Button onClick={handleMark} disabled={saving || !date} size="sm">Mark</Button>
        </div>
        <div className="admin-student-mgmt__mgmt-summary">
          {attendance.length > 0 && (
            <span className="admin-student-mgmt__mgmt-badge">
              {attendance.filter(a => a.present).length}/{attendance.length} present
            </span>
          )}
        </div>
        <div className="admin-student-mgmt__mgmt-list">
          {sorted.length === 0 && <p className="admin-student-mgmt__mgmt-empty">No attendance records yet.</p>}
          {sorted.map(a => (
            <div key={a._id} className="admin-student-mgmt__mgmt-item">
              <span className={`admin-student-mgmt__mgmt-status admin-student-mgmt__mgmt-status--${a.present ? "present" : "absent"}`}>
                {a.present ? "✓" : "✗"}
              </span>
              <span className="admin-student-mgmt__mgmt-date">{new Date(a.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
              <span className="admin-student-mgmt__mgmt-label">{a.present ? "Present" : "Absent"}</span>
              <button className="admin-student-mgmt__mgmt-delete" onClick={() => handleDelete(a._id)}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

function SubjectsModal({ isOpen, student, onClose }) {
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [marks, setMarks] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && student) {
      api.get(`/api/students/${student._id}`)
        .then(res => setSubjects(res.data.subjects || []));
    }
  }, [isOpen, student]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await api.post(`/api/students/${student._id}/subjects`, { name: name.trim(), grade, marks: marks === "" ? 0 : Number(marks) });
      setSubjects(res.data.subjects || []);
      setName(""); setGrade(""); setMarks("");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (subjectId) => {
    const res = await api.delete(`/api/students/${student._id}/subjects/${subjectId}`);
    setSubjects(res.data.subjects || []);
  };

  const handleEdit = (sub) => { setName(sub.name); setGrade(sub.grade || ""); setMarks(sub.marks ?? ""); };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`📚 ${student?.name} — Subjects`}>
      <div className="admin-student-mgmt__mgmt-form">
        <div className="admin-student-mgmt__mgmt-row">
          <input placeholder="Subject name" value={name} onChange={e => setName(e.target.value)} className="admin-student-mgmt__mgmt-input" style={{ flex: 2 }} />
          <select value={grade} onChange={e => setGrade(e.target.value)} className="admin-student-mgmt__mgmt-select">
            <option value="">Grade</option>
            {["A", "B", "C", "D", "F"].map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <input type="number" placeholder="Marks" value={marks} onChange={e => setMarks(e.target.value)} className="admin-student-mgmt__mgmt-input" style={{ width: 70 }} />
          <Button onClick={handleSave} disabled={saving || !name.trim()} size="sm">
            {subjects.find(s => s.name === name) ? "Update" : "Add"}
          </Button>
        </div>
        <div className="admin-student-mgmt__mgmt-list">
          {subjects.length === 0 && <p className="admin-student-mgmt__mgmt-empty">No subjects added yet.</p>}
          {subjects.map(sub => (
            <div key={sub._id} className="admin-student-mgmt__mgmt-item">
              <span className="admin-student-mgmt__mgmt-label" style={{ flex: 2, fontWeight: 600 }}>{sub.name}</span>
              {sub.grade && <Badge status={sub.grade}>{sub.grade}</Badge>}
              <span className="admin-student-mgmt__mgmt-date">{sub.marks ?? 0} marks</span>
              <button className="admin-student-mgmt__mgmt-edit" onClick={() => handleEdit(sub)}>✏️</button>
              <button className="admin-student-mgmt__mgmt-delete" onClick={() => handleDelete(sub._id)}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
