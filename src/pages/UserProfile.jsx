import React, { useState, useEffect } from "react";
import api from "../api";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Badge from "../components/Badge";
import StudentLayout from "../layouts/StudentLayout";
import AdminLayout from "../layouts/AdminLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import { encryptPassword } from "../utils/encryption";

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

  // Change password state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);

  // 2FA state
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
    if (pwForm.newPw !== pwForm.confirm)
      return showMsg("New passwords do not match", true);
    if (pwForm.newPw.length < 6)
      return showMsg("Password must be at least 6 characters", true);
    setPwLoading(true);
    try {
      const [encCurrent, encNew] = await Promise.all([
        encryptPassword(pwForm.current),
        encryptPassword(pwForm.newPw),
      ]);
      await api.put("/api/users/me/password", {
        currentPassword: encCurrent,
        newPassword: encNew,
      });
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

  // ---- attendance calc ----
  const attendance = student?.attendance || [];
  const presentDays = attendance.filter(a => a.present).length;
  const attendancePct = attendance.length > 0
    ? Math.round((presentDays / attendance.length) * 100) : null;

  // ---- fee calc ----
  const pendingFees = fees.filter(f => (f.amount - (f.paidAmount || 0)) > 0);
  const pendingTotal = pendingFees.reduce((s, f) => s + (f.amount - (f.paidAmount || 0)), 0);
  const nextDue = [...pendingFees].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];

  return (
    <Layout>
      {message.text && (
        <div style={{
          backgroundColor: message.error ? "#fee2e2" : "#d1fae5",
          color: message.error ? "#991b1b" : "#065f46",
          padding: "12px 16px", borderRadius: "8px", marginBottom: "20px",
          fontSize: "14px", fontWeight: "500",
        }}>
          {message.text}
        </div>
      )}

      {/* ===== ACCOUNT CARD ===== */}
      <div style={s.card}>
        <div style={s.accountHeader}>
          <div style={s.avatar}>{(user?.username || "?")[0].toUpperCase()}</div>
          <div>
            <div style={s.username}>{user?.username}</div>
            <div style={s.meta}>
              <span style={{
                ...s.roleBadge,
                backgroundColor: role === "admin" ? "#4f46e5" : "#16a34a",
              }}>
                {role === "admin" ? "👨‍💼 Admin" : "👤 Student"}
              </span>
              {user?.createdAt && (
                <span style={s.since}>
                  Member since {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                </span>
              )}
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
            <Button size="sm" variant="outline" onClick={() => setShowPasswordModal(true)}>
              🔑 Change Password
            </Button>
            <Button size="sm" variant="secondary" onClick={handleRegenerate2FA} disabled={tfaLoading}>
              {tfaLoading ? "..." : "🔄 Regen 2FA"}
            </Button>
          </div>
        </div>
        <div style={s.infoGrid}>
          <InfoItem label="Phone" value={user?.phone || "—"} />
          <InfoItem label="2FA" value="✓ Enabled" />
          <InfoItem label="Role" value={role} />
          <InfoItem label="Account ID" value={user?._id?.slice(-8)} mono />
        </div>
      </div>

      {/* ===== STUDENT SECTION ===== */}
      {role === "student" && (
        <>
          {student ? (
            <>
              {/* Student Info */}
              <div style={s.card}>
                <div style={s.cardTitle}>🎓 Student Profile</div>
                <div style={s.infoGrid}>
                  <InfoItem label="Name" value={student.name} />
                  <InfoItem label="Class" value={student.className} />
                  <InfoItem label="School" value={student.school} />
                  <InfoItem label="Guardian" value={student.guardianName} />
                  <InfoItem label="Contact" value={student.contactNo} />
                  <InfoItem label="Status" value={<Badge status={student.status}>{student.status}</Badge>} />
                </div>
              </div>

              {/* Stats Row */}
              <div style={s.statsRow}>
                <StatBox
                  icon="📅"
                  label="Attendance"
                  value={attendancePct !== null ? `${attendancePct}%` : "N/A"}
                  sub={attendancePct !== null ? `${presentDays}/${attendance.length} days` : "No records"}
                  color={attendancePct >= 75 ? "#16a34a" : "#f59e0b"}
                  bar={attendancePct}
                />
                <StatBox
                  icon="💰"
                  label="Pending Fees"
                  value={`₹${pendingTotal.toLocaleString()}`}
                  sub={nextDue ? `Due: ${new Date(nextDue.dueDate).toLocaleDateString("en-IN")}` : "All clear"}
                  color={pendingTotal > 0 ? "#ef4444" : "#16a34a"}
                />
                <StatBox
                  icon="📊"
                  label="Fee Status"
                  value={student.feeStatus}
                  sub={`Monthly: ₹${student.fee?.toLocaleString()}`}
                  color={student.feeStatus === "paid" ? "#16a34a" : "#f59e0b"}
                />
                <StatBox
                  icon="📚"
                  label="Subjects"
                  value={student.subjects?.length || 0}
                  sub="enrolled"
                  color="#4f46e5"
                />
              </div>

              {/* Subjects */}
              {student.subjects?.length > 0 && (
                <div style={s.card}>
                  <div style={s.cardTitle}>📖 Subjects & Grades</div>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        {["Subject", "Grade", "Marks"].map(h => <th key={h} style={s.th}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {student.subjects.map((sub, i) => (
                        <tr key={i}>
                          <td style={s.td}>{sub.name}</td>
                          <td style={s.td}>{sub.grade ? <Badge status={sub.grade}>{sub.grade}</Badge> : "—"}</td>
                          <td style={s.td}>{sub.marks ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Recent Fees */}
              {fees.length > 0 && (
                <div style={s.card}>
                  <div style={s.cardTitle}>💳 Recent Fee Records</div>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        {["Total", "Paid", "Remaining", "Due Date", "Method"].map(h => <th key={h} style={s.th}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {fees.slice(0, 5).map(fee => {
                        const paid = fee.paidAmount || 0;
                        const rem  = fee.amount - paid;
                        return (
                          <tr key={fee._id}>
                            <td style={{ ...s.td, fontWeight: "600" }}>₹{fee.amount.toLocaleString()}</td>
                            <td style={{ ...s.td, color: paid > 0 ? "#16a34a" : "#9ca3af", fontWeight: paid > 0 ? "600" : "400" }}>₹{paid.toLocaleString()}</td>
                            <td style={{ ...s.td, fontWeight: "700", color: rem <= 0 ? "#16a34a" : "#ef4444" }}>
                              {rem <= 0 ? "✓ Fully Paid" : `₹${rem.toLocaleString()}`}
                            </td>
                            <td style={s.td}>{new Date(fee.dueDate).toLocaleDateString("en-IN")}</td>
                            <td style={s.td}>{fee.paymentMethod}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Attendance */}
              {attendance.length > 0 && (
                <div style={s.card}>
                  <div style={s.cardTitle}>📅 Attendance (Last 30 Days)</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
                    {[...attendance].reverse().slice(0, 30).map((a, i) => (
                      <div
                        key={i}
                        title={new Date(a.date).toLocaleDateString("en-IN")}
                        style={{
                          width: "14px", height: "14px", borderRadius: "3px",
                          backgroundColor: a.present ? "#16a34a" : "#ef4444",
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ fontSize: "12px", color: "#888", display: "flex", gap: "16px" }}>
                    <span>🟢 Present</span><span>🔴 Absent</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={s.card}>
              <div style={{ textAlign: "center", padding: "32px", color: "#888" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔗</div>
                <p>Your account is not linked to a student profile yet. Contact your admin.</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* ===== ADMIN SECTION ===== */}
      {role === "admin" && stats && (
        <>
          {/* Stats */}
          <div style={s.statsRow}>
            <StatBox icon="👥" label="Total Students" value={stats.students.total} sub={`${stats.students.active} active`} color="#4f46e5" />
            <StatBox icon="👤" label="Total Users" value={stats.users.total} sub={`${stats.users.admin} admins · ${stats.users.student} students`} color="#0891b2" />
            <StatBox icon="💰" label="Fees Collected" value={`₹${stats.fees.paid.toLocaleString()}`} sub="paid" color="#16a34a" />
            <StatBox icon="⏳" label="Remaining Fees" value={`₹${stats.fees.remaining.toLocaleString()}`} sub="outstanding" color="#f59e0b" />
          </div>

          {/* Recent Activity */}
          {recentActivity && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={s.card}>
                <div style={s.cardTitle}>🆕 Recent Students Added</div>
                {recentActivity.recentStudents.length > 0 ? (
                  recentActivity.recentStudents.map(st => (
                    <div key={st._id} style={s.activityRow}>
                      <div style={s.activityDot} />
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

              <div style={s.card}>
                <div style={s.cardTitle}>💳 Recent Fee Records</div>
                {recentActivity.recentFees.length > 0 ? (
                  recentActivity.recentFees.map(fee => (
                    <div key={fee._id} style={s.activityRow}>
                      <div style={s.activityDot} />
                      <div>
                        <div style={{ fontWeight: "600", fontSize: "14px" }}>
                          {fee.studentId?.name || "Unknown"} — ₹{fee.amount}
                        </div>
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

      {/* ===== CHANGE PASSWORD MODAL ===== */}
      <Modal isOpen={showPasswordModal} onClose={() => { setShowPasswordModal(false); setPwForm({ current: "", newPw: "", confirm: "" }); }} title="🔑 Change Password">
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {["current", "newPw", "confirm"].map((field, i) => (
            <div key={field}>
              <label style={s.label}>{["Current Password", "New Password", "Confirm New Password"][i]}</label>
              <input
                type="password"
                value={pwForm[field]}
                onChange={e => setPwForm({ ...pwForm, [field]: e.target.value })}
                style={s.input}
                placeholder={["Enter current password", "Min 6 characters", "Repeat new password"][i]}
              />
            </div>
          ))}
          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            <Button onClick={handleChangePassword} disabled={pwLoading}>
              {pwLoading ? "Saving..." : "Change Password"}
            </Button>
            <Button variant="outline" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* ===== REGEN 2FA MODAL ===== */}
      <Modal
        isOpen={showRegenerate2FAModal}
        onClose={() => { setShowRegenerate2FAModal(false); setQrCode(""); setSecret(""); }}
        title="🔄 Regenerate 2FA"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ fontSize: "14px", color: "#374151" }}>
            Scan the new QR code with your authenticator app. The old code will stop working.
          </p>
          {qrCode && <img src={qrCode} alt="2FA QR Code" style={{ maxWidth: "220px", border: "1px solid #d1d5db", borderRadius: "8px", padding: "8px" }} />}
          {secret && (
            <div style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "12px" }}>
              <div style={{ fontSize: "12px", color: "#888", marginBottom: "6px" }}>Manual entry code:</div>
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
    <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
      <div style={{ fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
      <div style={{ fontSize: "14px", fontWeight: "600", color: "#1a1a2e", fontFamily: mono ? "monospace" : "inherit" }}>{value || "—"}</div>
    </div>
  );
}

function StatBox({ icon, label, value, sub, color, bar }) {
  return (
    <div style={{ backgroundColor: "#fff", borderRadius: "10px", padding: "20px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
      <div style={{ fontSize: "22px", marginBottom: "8px" }}>{icon}</div>
      <div style={{ fontSize: "24px", fontWeight: "700", color }}>{value}</div>
      <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>{label}</div>
      {sub && <div style={{ fontSize: "12px", color: "#aaa", marginTop: "2px" }}>{sub}</div>}
      {bar != null && (
        <div style={{ marginTop: "10px", height: "4px", backgroundColor: "#e5e7eb", borderRadius: "4px" }}>
          <div style={{ height: "100%", width: `${Math.min(bar, 100)}%`, backgroundColor: color, borderRadius: "4px", transition: "width 0.4s" }} />
        </div>
      )}
    </div>
  );
}

const s = {
  card: { backgroundColor: "#fff", borderRadius: "10px", padding: "24px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", marginBottom: "20px" },
  cardTitle: { fontSize: "15px", fontWeight: "700", color: "#1a1a2e", marginBottom: "16px" },
  accountHeader: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid #f3f4f6" },
  avatar: { width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#4f46e5", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "24px", flexShrink: 0 },
  username: { fontSize: "20px", fontWeight: "700", color: "#1a1a2e" },
  meta: { display: "flex", alignItems: "center", gap: "10px", marginTop: "6px" },
  roleBadge: { padding: "3px 10px", borderRadius: "12px", color: "#fff", fontSize: "12px", fontWeight: "600" },
  since: { fontSize: "12px", color: "#9ca3af" },
  infoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "20px" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "10px 12px", textAlign: "left", fontSize: "11px", fontWeight: "600", color: "#6b7280", backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", textTransform: "uppercase" },
  td: { padding: "12px", fontSize: "14px", color: "#374151", borderBottom: "1px solid #f3f4f6" },
  activityRow: { display: "flex", gap: "12px", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #f3f4f6" },
  activityDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#4f46e5", marginTop: "5px", flexShrink: 0 },
  label: { display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" },
};
