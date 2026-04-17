import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { getStudentId } from "../utils/auth";
import StudentLayout from "../layouts/StudentLayout";
import Badge from "../components/Badge";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/pages/StudentList.scss";

export default function StudentList() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const studentId = getStudentId();

  useEffect(() => {
    if (!studentId || studentId === "null") { setLoading(false); return; }
    api.get(`/api/students/${studentId}`)
      .then(res => setStudent(res.data))
      .catch(() => setStudent(null))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <StudentLayout><LoadingSpinner /></StudentLayout>;

  if (!studentId || studentId === "null" || !student) {
    return (
      <StudentLayout>
        <div className="student-list__not-linked">
          <div className="student-list__not-linked-icon">🔗</div>
          <h2 className="student-list__not-linked-title">Profile Not Linked</h2>
          <p className="student-list__not-linked-text">Your account is not yet linked to a student profile. Please contact your admin.</p>
        </div>
      </StudentLayout>
    );
  }

  const attendance = student.attendance || [];
  const presentDays = attendance.filter(a => a.present).length;
  const attendancePct = attendance.length > 0 ? Math.round((presentDays / attendance.length) * 100) : null;

  return (
    <StudentLayout>
      <div className="student-list__banner">
        <div className="student-list__banner-left">
          <div className="student-list__banner-avatar">{student.name[0]?.toUpperCase()}</div>
          <div>
            <div className="student-list__banner-name">{student.name}</div>
            <div className="student-list__banner-sub">{student.className} &bull; {student.school}</div>
          </div>
        </div>
        <Badge status={student.status}>{student.status}</Badge>
      </div>

      <div className="student-list__stats-row">
        <StatCard label="Monthly Fee" value={`₹${student.fee?.toLocaleString()}`} color="#4f46e5" icon="💰" />
        <StatCard label="Fee Status" value={student.feeStatus} color={student.feeStatus === "paid" ? "#16a34a" : "#ef4444"} icon="📋" />
        <StatCard
          label="Attendance"
          value={attendancePct !== null ? `${attendancePct}%` : "N/A"}
          color={attendancePct >= 75 ? "#16a34a" : "#f59e0b"}
          icon="📅"
        />
        <StatCard label="Subjects" value={student.subjects?.length || 0} color="#0891b2" icon="📚" />
      </div>

      <div className="student-list__grid">
        <Section title="👤 Personal Info">
          <InfoRow label="Guardian" value={student.guardianName} />
          <InfoRow label="Contact" value={student.contactNo} />
          <InfoRow label="Address" value={student.address} />
          <InfoRow label="Joined" value={new Date(student.joinDate).toLocaleDateString("en-IN")} />
        </Section>
        <Section title="🎓 Academic Progress">
          <InfoRow label="Level" value={student.progress?.academicLevel || "—"} />
          <InfoRow label="Grade" value={student.progress?.performanceGrade || "—"} />
          <InfoRow
            label="Last Review"
            value={student.progress?.lastReviewDate ? new Date(student.progress.lastReviewDate).toLocaleDateString("en-IN") : "—"}
          />
        </Section>
      </div>

      {student.subjects?.length > 0 && (
        <div className="student-list__card">
          <div className="student-list__card-title">📖 Subjects</div>
          <table className="student-list__table">
            <thead>
              <tr>{["Subject", "Grade", "Marks"].map(h => <th key={h} className="student-list__th">{h}</th>)}</tr>
            </thead>
            <tbody>
              {student.subjects.map((s, i) => (
                <tr key={i}>
                  <td className="student-list__td">{s.name}</td>
                  <td className="student-list__td"><Badge status={s.grade || "pending"}>{s.grade || "—"}</Badge></td>
                  <td className="student-list__td">{s.marks ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {attendance.length > 0 && (
        <div className="student-list__card">
          <div className="student-list__card-title">📅 Recent Attendance</div>
          <div className="student-list__attendance-row">
            {[...attendance].reverse().slice(0, 30).map((a, i) => (
              <div key={i} title={new Date(a.date).toLocaleDateString("en-IN")}
                className="student-list__dot"
                style={{ backgroundColor: a.present ? "#16a34a" : "#ef4444" }}
              />
            ))}
          </div>
          <div className="student-list__attendance-legend">
            <span><span className="student-list__dot" style={{ backgroundColor: "#16a34a" }} /> Present</span>
            <span><span className="student-list__dot" style={{ backgroundColor: "#ef4444" }} /> Absent</span>
            {attendancePct !== null && <span style={{ marginLeft: "auto", fontWeight: "600", color: "#374151" }}>{presentDays}/{attendance.length} days ({attendancePct}%)</span>}
          </div>
        </div>
      )}

      <div className="student-list__quick-links">
        <QuickLink icon="💳" label="View Fees" onClick={() => navigate("/fees")} />
        <QuickLink icon="👤" label="My Profile" onClick={() => navigate("/profile")} />
      </div>
    </StudentLayout>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div className="student-list__stat-card">
      <div className="student-list__stat-icon">{icon}</div>
      <div style={{ fontSize: "22px", fontWeight: "700", color }}>{value}</div>
      <div className="student-list__stat-label">{label}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="student-list__card">
      <div className="student-list__card-title">{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>{children}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="student-list__info-row">
      <div className="student-list__info-label">{label}</div>
      <div className="student-list__info-value">{value || "—"}</div>
    </div>
  );
}

function QuickLink({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="student-list__quick-link-btn">
      <span style={{ fontSize: "22px" }}>{icon}</span>
      <span style={{ fontWeight: "600", fontSize: "14px" }}>{label}</span>
    </button>
  );
}
