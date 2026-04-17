import { useState, useEffect } from "react";
import api from "../api";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Badge from "../components/Badge";
import StudentLayout from "../layouts/StudentLayout";
import AdminLayout from "../layouts/AdminLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import { encryptPassword } from "../utils/encryption";
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

  const [showRegenerate2FAModal, setShowRegenerate2FAModal] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [tfaLoading, setTfaLoading] = useState(false);

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
            const [stuRes, feeRes] = await Promise.all([
              api.get(`/api/students/${sid}`),
              api.get("/api/fees/my"),
            ]);
            setStudent(stuRes.data);
            setFees(feeRes.data.fees || []);
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
    if (pwForm.newPw.length < 6) return showMsg("Password must be at least 6 characters", true);
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

  const handleRegenerate2FA = async () => {
    setTfaLoading(true);
    try {
      const res = await api.post("/api/auth/regenerate-2fa", {});
      setQrCode(res.data.qrCode);
      setSecret(res.data.secret);
      setShowRegenerate2FAModal(true);
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to regenerate 2FA", true);
    } finally {
      setTfaLoading(false);
    }
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  const attendance = student?.attendance || [];
  const presentDays = attendance.filter(a => a.present).length;
  const attendancePct = attendance.length > 0 ? Math.round((presentDays / attendance.length) * 100) : null;

  const pendingFees = fees.filter(f => (f.amount - (f.paidAmount || 0)) > 0);
  const pendingTotal = pendingFees.reduce((s, f) => s + (f.amount - (f.paidAmount || 0)), 0);
  const nextDue = [...pendingFees].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];

  return (
    <Layout>
      {message.text && (
        <div className={`user-profile__banner user-profile__banner--${message.error ? "error" : "success"}`}>
          {message.text}
        </div>
      )}

      <div className="user-profile__card">
        <div className="user-profile__account-header">
          <div className="user-profile__avatar">{(user?.username || "?")[0].toUpperCase()}</div>
          <div>
            <div className="user-profile__username">{user?.username}</div>
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
          <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
            <Button size="sm" variant="outline" onClick={() => setShowPasswordModal(true)}>🔑 Change Password</Button>
            <Button size="sm" variant="secondary" onClick={handleRegenerate2FA} disabled={tfaLoading}>
              {tfaLoading ? "..." : "🔄 Regen 2FA"}
            </Button>
          </div>
        </div>
        <div className="user-profile__info-grid">
          <InfoItem label="Phone" value={user?.phone || "—"} />
          <InfoItem label="2FA" value="✓ Enabled" />
          <InfoItem label="Role" value={role} />
          <InfoItem label="Account ID" value={user?._id?.slice(-8)} mono />
        </div>
      </div>

      {role === "student" && (
        <>
          {student ? (
            <>
              <div className="user-profile__card">
                <div className="user-profile__card-title">🎓 Student Profile</div>
                <div className="user-profile__info-grid">
                  <InfoItem label="Name" value={student.name} />
                  <InfoItem label="Class" value={student.className} />
                  <InfoItem label="School" value={student.school} />
                  <InfoItem label="Guardian" value={student.guardianName} />
                  <InfoItem label="Contact" value={student.contactNo} />
                  <InfoItem label="Status" value={<Badge status={student.status}>{student.status}</Badge>} />
                </div>
              </div>

              <div className="user-profile__stats-row">
                <StatBox icon="📅" label="Attendance" value={attendancePct !== null ? `${attendancePct}%` : "N/A"} sub={attendancePct !== null ? `${presentDays}/${attendance.length} days` : "No records"} color={attendancePct >= 75 ? "#16a34a" : "#f59e0b"} bar={attendancePct} />
                <StatBox icon="💰" label="Pending Fees" value={`₹${pendingTotal.toLocaleString()}`} sub={nextDue ? `Due: ${new Date(nextDue.dueDate).toLocaleDateString("en-IN")}` : "All clear"} color={pendingTotal > 0 ? "#ef4444" : "#16a34a"} />
                <StatBox icon="📊" label="Fee Status" value={student.feeStatus} sub={`Monthly: ₹${student.fee?.toLocaleString()}`} color={student.feeStatus === "paid" ? "#16a34a" : "#f59e0b"} />
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

              {attendance.length > 0 && (
                <div className="user-profile__card">
                  <div className="user-profile__card-title">📅 Attendance (Last 30 Days)</div>
                  <div className="user-profile__attendance-dots">
                    {[...attendance].reverse().slice(0, 30).map((a, i) => (
                      <div key={i} title={new Date(a.date).toLocaleDateString("en-IN")}
                        className="user-profile__attendance-dot"
                        style={{ backgroundColor: a.present ? "#16a34a" : "#ef4444" }}
                      />
                    ))}
                  </div>
                  <div className="user-profile__attendance-legend">
                    <span>🟢 Present</span><span>🔴 Absent</span>
                  </div>
                </div>
              )}
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

      <Modal isOpen={showRegenerate2FAModal} onClose={() => { setShowRegenerate2FAModal(false); setQrCode(""); setSecret(""); }} title="🔄 Regenerate 2FA">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ fontSize: "14px", color: "#374151" }}>Scan the new QR code with your authenticator app. The old code will stop working.</p>
          {qrCode && <img src={qrCode} alt="2FA QR Code" className="user-profile__qr-image" />}
          {secret && (
            <div className="user-profile__secret-box">
              <div className="user-profile__secret-label">Manual entry code:</div>
              <code style={{ fontSize: "13px", wordBreak: "break-all" }}>{secret}</code>
            </div>
          )}
          <Button onClick={() => { setShowRegenerate2FAModal(false); setQrCode(""); setSecret(""); }}>Done</Button>
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
