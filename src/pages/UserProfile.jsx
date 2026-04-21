import { useState, useEffect } from "react";
import api from "../api";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Badge from "../components/Badge";
import StudentLayout from "../layouts/StudentLayout";
import AdminLayout from "../layouts/AdminLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import { encryptPassword } from "../utils/encryption";
import { validatePassword } from "../utils/validation";
import "../styles/pages/UserProfile.scss";

export default function UserProfile() {
  const role = localStorage.getItem("role");
  const Layout = role === "admin" ? AdminLayout : StudentLayout;

  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [fees, setFees] = useState([]);
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", error: false });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);

  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState("");


  const showMsg = (text, error = false) => {
    setMessage({ text, error });
    setTimeout(() => setMessage({ text: "", error: false }), 4000);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const userRes = await api.get("/api/users/me");
        setUser(userRes.data);
        if (role === "student") {
          const sid = userRes.data.studentId;
          if (sid) {
            const [stuRes, feeRes, notesRes] = await Promise.all([
              api.get(`/api/students/${sid}`),
              api.get("/api/fees/my"),
              api.get(`/api/students/${sid}/notes`),
            ]);
            setStudent(stuRes.data);
            setFees(feeRes.data.fees || []);
            setNotes(notesRes.data.notes || []);
          }
        } else {
          const [statsRes, activityRes] = await Promise.all([
            api.get("/api/analytics/dashboard"),
            api.get("/api/analytics/recent-activity"),
          ]);
          setStats(statsRes.data);
          setRecentActivity(activityRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [role]);

  const handleChangePassword = async () => {
    if (pwForm.newPw !== pwForm.confirm) return showMsg("New passwords do not match", true);
    const pwError = validatePassword(pwForm.newPw);
    if (pwError) return showMsg(pwError, true);
    setPwLoading(true);
    try {
      const [encCurrent, encNew] = await Promise.all([
        encryptPassword(pwForm.current),
        encryptPassword(pwForm.newPw),
      ]);
      await api.put("/api/users/me/password", { currentPassword: encCurrent, newPassword: encNew });
      setShowPasswordModal(false);
      setPwForm({ current: "", newPw: "", confirm: "" });
      showMsg("Password changed successfully");
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to change password", true);
    } finally {
      setPwLoading(false);
    }
  };


  const handleAddNote = async () => {
    if (!noteText.trim() || !student) return;
    setNoteSaving(true);
    try {
      const res = await api.post(`/api/students/${student._id}/notes`, { text: noteText.trim() });
      setNotes(res.data.notes || []);
      setNoteText("");
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to add note", true);
    } finally {
      setNoteSaving(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const res = await api.delete(`/api/students/${student._id}/notes/${noteId}`);
      setNotes(res.data.notes || []);
    } catch (err) {
      showMsg("Failed to delete note", true);
    }
  };

  const handleEditNote = async (noteId) => {
    if (!editingNoteText.trim()) return;
    try {
      const res = await api.put(`/api/students/${student._id}/notes/${noteId}`, { text: editingNoteText.trim() });
      setNotes(res.data.notes || []);
      setEditingNoteId(null);
      setEditingNoteText("");
    } catch (err) {
      showMsg("Failed to edit note", true);
    }
  };

  const handleMarkTodayAttendance = async () => {
    try {
      const res = await api.post(`/api/students/${student._id}/attendance/today`);
      setStudent(res.data);
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to mark attendance", true);
    }
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  const attendance = student?.attendance || [];
  const sortedAttendance = [...attendance].sort((a, b) => new Date(a.date) - new Date(b.date));
  const presentDays = attendance.filter(a => a.present).length;
  const attendancePct = attendance.length > 0 ? Math.round((presentDays / attendance.length) * 100) : null;

  const todayStr = new Date().toDateString();
  const isSunday = new Date().getDay() === 0;
  const todayRecord = attendance.find(a => new Date(a.date).toDateString() === todayStr);

  const pendingFees = fees.filter(f => (f.amount - (f.paidAmount || 0)) > 0);
  const pendingTotal = pendingFees.reduce((s, f) => s + (f.amount - (f.paidAmount || 0)), 0);
  const nextDue = [...pendingFees].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
  const overdueFees = fees.filter(f => f.status === "overdue");

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <Layout>
      {message.text && (
        <div className={`user-profile__banner user-profile__banner--${message.error ? "error" : "success"}`}>
          {message.text}
        </div>
      )}

      <div className="user-profile__card">
        <div className="user-profile__account-header">
          <div className="user-profile__avatar">{(user?.name || user?.email || "?")[0].toUpperCase()}</div>
          <div>
            <div className="user-profile__username">{user?.name || user?.email}</div>
            <div className="user-profile__meta">
              <span className={`user-profile__role-badge user-profile__role-badge--${role}`}>
                {role === "admin" ? "👨‍💼 Admin" : "👤 Student"}
              </span>
              {user?.createdAt && (
                <span className="user-profile__since">
                  Member since {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                </span>
              )}
            </div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Button size="sm" variant="outline" onClick={() => setShowPasswordModal(true)}>🔑 Change Password</Button>
          </div>
        </div>
        <div className="user-profile__info-grid">
          <InfoItem label="Phone" value={user?.phone || "—"} />
          <InfoItem label="Email" value={user?.email} />
          <InfoItem label="Role" value={role} />
          <InfoItem label="Account ID" value={user?._id?.slice(-8)} mono />
        </div>
      </div>

      {role === "student" && (
        <>
          {student ? (
            <>
              {/* Greeting banner */}
              <div className="user-profile__greeting">
                <div>
                  <div className="user-profile__greeting-text">{greeting()}, {student.name?.split(" ")[0] || user?.name || "Student"} 👋</div>
                  <div className="user-profile__greeting-date">
                    {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </div>
                </div>
                <div className="user-profile__today-status">
                  {isSunday ? (
                    <span className="user-profile__today-tag user-profile__today-tag--sunday">🌤 Sunday — No Class</span>
                  ) : todayRecord ? (
                    <span className={`user-profile__today-tag ${todayRecord.present ? "user-profile__today-tag--present" : "user-profile__today-tag--absent"}`}>
                      {todayRecord.present ? "✓ Present Today" : "✗ Absent Today"}
                    </span>
                  ) : (
                    <button className="user-profile__mark-btn" onClick={handleMarkTodayAttendance}>
                      📍 Mark Present Today
                    </button>
                  )}
                </div>
              </div>

              {/* Overdue fee alert */}
              {overdueFees.length > 0 && (
                <div className="user-profile__alert">
                  ⚠️ You have {overdueFees.length} overdue fee{overdueFees.length > 1 ? "s" : ""}. Please clear dues soon.
                </div>
              )}

              <div className="user-profile__card">
                <div className="user-profile__card-title">🎓 Student Profile</div>
                <div className="user-profile__info-grid">
                  <InfoItem label="Name" value={student.name} />
                  <InfoItem label="Class" value={student.className} />
                  <InfoItem label="School" value={student.school} />
                  <InfoItem label="Guardian" value={student.guardianName} />
                  <InfoItem label="Contact" value={student.contactNo} />
                  <InfoItem label="Status" value={<Badge status={student.status}>{student.status}</Badge>} />
                  {student.progress?.academicLevel && <InfoItem label="Academic Level" value={student.progress.academicLevel} />}
                  {student.progress?.performanceGrade && <InfoItem label="Performance Grade" value={<Badge status={student.progress.performanceGrade}>{student.progress.performanceGrade}</Badge>} />}
                </div>
              </div>

              <div className="user-profile__stats-row">
                <StatBox icon="📅" label="Attendance" value={attendancePct !== null ? `${attendancePct}%` : "N/A"} sub={attendancePct !== null ? `${presentDays}/${attendance.length} days` : "No records"} color={attendancePct >= 75 ? "#16a34a" : "#f59e0b"} bar={attendancePct} />
                <StatBox icon="💰" label="Pending Dues" value={pendingTotal > 0 ? `₹${pendingTotal.toLocaleString()}` : "All Clear"} sub={nextDue ? `Next due: ${new Date(nextDue.dueDate).toLocaleDateString("en-IN")}` : `${fees.length} record(s) on file`} color={pendingTotal > 0 ? "#ef4444" : "#16a34a"} />
                <StatBox icon="💵" label="Monthly Fee" value={`₹${student.fee?.toLocaleString()}`} sub={`Status: ${student.feeStatus}`} color={student.feeStatus === "paid" ? "#16a34a" : student.feeStatus === "overdue" ? "#ef4444" : "#f59e0b"} />
                <StatBox icon="📚" label="Subjects" value={student.subjects?.length || 0} sub="enrolled" color="#4f46e5" />
              </div>

              {student.subjects?.length > 0 && (
                <div className="user-profile__card">
                  <div className="user-profile__card-title">📖 Subjects & Grades</div>
                  <table className="user-profile__table">
                    <thead><tr>{["Subject", "Grade", "Marks"].map(h => <th key={h} className="user-profile__th">{h}</th>)}</tr></thead>
                    <tbody>
                      {student.subjects.map((sub, i) => (
                        <tr key={i}>
                          <td className="user-profile__td">{sub.name}</td>
                          <td className="user-profile__td">{sub.grade ? <Badge status={sub.grade}>{sub.grade}</Badge> : "—"}</td>
                          <td className="user-profile__td">{sub.marks ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {fees.length > 0 && (
                <div className="user-profile__card">
                  <div className="user-profile__card-title">💳 Recent Fee Records</div>
                  <table className="user-profile__table">
                    <thead><tr>{["Total", "Paid", "Remaining", "Due Date", "Method"].map(h => <th key={h} className="user-profile__th">{h}</th>)}</tr></thead>
                    <tbody>
                      {fees.slice(0, 5).map(fee => {
                        const paid = fee.paidAmount || 0;
                        const rem = fee.amount - paid;
                        return (
                          <tr key={fee._id}>
                            <td className="user-profile__td" style={{ fontWeight: "600" }}>₹{fee.amount.toLocaleString()}</td>
                            <td className="user-profile__td" style={{ color: paid > 0 ? "#16a34a" : "#9ca3af", fontWeight: paid > 0 ? "600" : "400" }}>₹{paid.toLocaleString()}</td>
                            <td className="user-profile__td" style={{ fontWeight: "700", color: rem <= 0 ? "#16a34a" : "#ef4444" }}>{rem <= 0 ? "✓ Fully Paid" : `₹${rem.toLocaleString()}`}</td>
                            <td className="user-profile__td">{new Date(fee.dueDate).toLocaleDateString("en-IN")}</td>
                            <td className="user-profile__td">{fee.paymentMethod}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {sortedAttendance.length > 0 && (
                <div className="user-profile__card">
                  <div className="user-profile__card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>📅 Attendance — Last 30 Days</span>
                    <span style={{ fontSize: 12, fontWeight: 400, color: "#888" }}>← older · newer →</span>
                  </div>
                  <div className="user-profile__attendance-dots">
                    {sortedAttendance.slice(-30).map((a, i) => (
                      <div key={i} title={`${new Date(a.date).toLocaleDateString("en-IN")} — ${a.present ? "Present" : "Absent"}`}
                        className="user-profile__attendance-dot"
                        style={{ backgroundColor: a.present ? "#16a34a" : "#ef4444" }}
                      />
                    ))}
                  </div>
                  <div className="user-profile__attendance-legend">
                    <span>🟢 Present ({presentDays})</span>
                    <span>🔴 Absent ({sortedAttendance.length - presentDays})</span>
                    <span style={{ marginLeft: "auto", color: "#888" }}>{sortedAttendance.length} total records</span>
                  </div>
                </div>
              )}

              <div className="user-profile__card">
                <div className="user-profile__card-title">📝 My Notes <span style={{ fontSize: 11, fontWeight: 400, color: "#aaa", marginLeft: 8 }}>Only visible to you</span></div>
                <div className="user-profile__notes-form">
                  <textarea
                    className="user-profile__notes-input"
                    placeholder="Write a note..."
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    rows={2}
                  />
                  <Button size="sm" onClick={handleAddNote} disabled={noteSaving || !noteText.trim()}>
                    {noteSaving ? "Saving..." : "+ Add Note"}
                  </Button>
                </div>
                {notes.length === 0 ? (
                  <p className="user-profile__notes-empty">No notes yet. Add your first note above.</p>
                ) : (
                  <div className="user-profile__notes-list">
                    {[...notes].reverse().map(note => (
                      <div key={note._id} className="user-profile__note-item">
                        {editingNoteId === note._id ? (
                          <>
                            <textarea
                              className="user-profile__notes-input"
                              value={editingNoteText}
                              onChange={e => setEditingNoteText(e.target.value)}
                              rows={2}
                              autoFocus
                            />
                            <div className="user-profile__note-meta">
                              <button className="user-profile__note-save" onClick={() => handleEditNote(note._id)}>Save</button>
                              <button className="user-profile__note-delete" onClick={() => { setEditingNoteId(null); setEditingNoteText(""); }}>Cancel</button>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="user-profile__note-text">{note.text}</p>
                            <div className="user-profile__note-meta">
                              <span>{new Date(note.addedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                              <div style={{ display: "flex", gap: 8 }}>
                                <button className="user-profile__note-save" onClick={() => { setEditingNoteId(note._id); setEditingNoteText(note.text); }}>Edit</button>
                                <button className="user-profile__note-delete" onClick={() => handleDeleteNote(note._id)}>Delete</button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="user-profile__card">
              <div className="user-profile__not-linked">
                <div className="user-profile__not-linked-icon">🔗</div>
                <p>Your account is not linked to a student profile yet. Contact your admin.</p>
              </div>
            </div>
          )}
        </>
      )}

      {role === "admin" && stats && (
        <>
          <div className="user-profile__stats-row">
            <StatBox icon="👥" label="Total Students" value={stats.students.total} sub={`${stats.students.active} active`} color="#4f46e5" />
            <StatBox icon="👤" label="Total Users" value={stats.users.total} sub={`${stats.users.admin} admins · ${stats.users.student} students`} color="#0891b2" />
            <StatBox icon="💰" label="Fees Collected" value={`₹${stats.fees.paid.toLocaleString()}`} sub="paid" color="#16a34a" />
            <StatBox icon="⏳" label="Remaining Fees" value={`₹${stats.fees.remaining.toLocaleString()}`} sub="outstanding" color="#f59e0b" />
          </div>

          {recentActivity && (
            <div className="user-profile__activity-grid">
              <div className="user-profile__card">
                <div className="user-profile__card-title">🆕 Recent Students Added</div>
                {recentActivity.recentStudents.length > 0 ? (
                  recentActivity.recentStudents.map(st => (
                    <div key={st._id} className="user-profile__activity-row">
                      <div className="user-profile__activity-dot" />
                      <div>
                        <div style={{ fontWeight: "600", fontSize: "14px" }}>{st.name}</div>
                        <div style={{ fontSize: "12px", color: "#888" }}>
                          {new Date(st.createdAt).toLocaleDateString("en-IN")} · <Badge status={st.status}>{st.status}</Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : <p style={{ color: "#aaa", fontSize: "14px" }}>No recent students</p>}
              </div>
              <div className="user-profile__card">
                <div className="user-profile__card-title">💳 Recent Fee Records</div>
                {recentActivity.recentFees.length > 0 ? (
                  recentActivity.recentFees.map(fee => (
                    <div key={fee._id} className="user-profile__activity-row">
                      <div className="user-profile__activity-dot" />
                      <div>
                        <div style={{ fontWeight: "600", fontSize: "14px" }}>{fee.studentId?.name || "Unknown"} — ₹{fee.amount}</div>
                        <div style={{ fontSize: "12px", color: "#888" }}>
                          {new Date(fee.createdAt).toLocaleDateString("en-IN")} · <Badge status={fee.status}>{fee.status}</Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : <p style={{ color: "#aaa", fontSize: "14px" }}>No recent fees</p>}
              </div>
            </div>
          )}
        </>
      )}

      <Modal isOpen={showPasswordModal} onClose={() => { setShowPasswordModal(false); setPwForm({ current: "", newPw: "", confirm: "" }); }} title="🔑 Change Password">
        <div className="user-profile__modal-form">
          {["current", "newPw", "confirm"].map((field, i) => (
            <div key={field}>
              <label className="user-profile__label">{["Current Password", "New Password", "Confirm New Password"][i]}</label>
              <input type="password" value={pwForm[field]} onChange={e => setPwForm({ ...pwForm, [field]: e.target.value })} className="user-profile__input" placeholder={["Enter current password", "Min 6 characters", "Repeat new password"][i]} />
            </div>
          ))}
          <div className="user-profile__modal-actions">
            <Button onClick={handleChangePassword} disabled={pwLoading}>{pwLoading ? "Saving..." : "Change Password"}</Button>
            <Button variant="outline" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

    </Layout>
  );
}

function InfoItem({ label, value, mono }) {
  return (
    <div className="user-profile__info-item">
      <div className="user-profile__info-item-label">{label}</div>
      <div className={`user-profile__info-item-value${mono ? " user-profile__info-item-value--mono" : ""}`}>{value || "—"}</div>
    </div>
  );
}

function StatBox({ icon, label, value, sub, color, bar }) {
  return (
    <div className="user-profile__stat-box">
      <div className="user-profile__stat-icon">{icon}</div>
      <div style={{ fontSize: "24px", fontWeight: "700", color }}>{value}</div>
      <div className="user-profile__stat-label">{label}</div>
      {sub && <div className="user-profile__stat-sub">{sub}</div>}
      {bar != null && (
        <div className="user-profile__progress-track">
          <div className="user-profile__progress-fill" style={{ width: `${Math.min(bar, 100)}%`, backgroundColor: color }} />
        </div>
      )}
    </div>
  );
}
