import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { getUsername, getStudentId, isAdmin, clearAuth } from "../utils/auth";
import StudentLayout from "../layouts/StudentLayout";
import Badge from "../components/Badge";
import LoadingSpinner from "../components/LoadingSpinner";

export default function StudentList() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const studentId = getStudentId();

  useEffect(() => {
    if (!studentId || studentId === "null") {
      setLoading(false);
      return;
    }
    api.get(`/api/students/${studentId}`)
      .then(res => setStudent(res.data))
      .catch(() => setStudent(null))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <StudentLayout><LoadingSpinner /></StudentLayout>;

  if (!studentId || studentId === "null" || !student) {
    return (
      <StudentLayout>
        <div style={styles.notLinked}>
          <div style={styles.notLinkedIcon}>🔗</div>
          <h2 style={styles.notLinkedTitle}>Profile Not Linked</h2>
          <p style={styles.notLinkedText}>
            Your account is not yet linked to a student profile. Please contact your admin.
          </p>
        </div>
      </StudentLayout>
    );
  }

  const attendance = student.attendance || [];
  const presentDays = attendance.filter(a => a.present).length;
  const attendancePct = attendance.length > 0
    ? Math.round((presentDays / attendance.length) * 100)
    : null;

  return (
    <StudentLayout>
      {/* Welcome Banner */}
      <div style={styles.banner}>
        <div style={styles.bannerLeft}>
          <div style={styles.bannerAvatar}>{student.name[0]?.toUpperCase()}</div>
          <div>
            <div style={styles.bannerName}>{student.name}</div>
            <div style={styles.bannerSub}>{student.className} &bull; {student.school}</div>
          </div>
        </div>
        <Badge status={student.status}>{student.status}</Badge>
      </div>

      {/* Stats Row */}
      <div style={styles.statsRow}>
        <StatCard label="Monthly Fee" value={`₹${student.fee?.toLocaleString()}`} color="#4f46e5" icon="💰" />
        <StatCard label="Fee Status" value={student.feeStatus} color={student.feeStatus === "paid" ? "#16a34a" : "#ef4444"} icon="📋" />
        <StatCard
          label="Attendance"
          value={attendancePct !== null ? `${attendancePct}%` : "N/A"}
          color={attendancePct >= 75 ? "#16a34a" : "#f59e0b"}
          icon="📅"
        />
        <StatCard
          label="Subjects"
          value={student.subjects?.length || 0}
          color="#0891b2"
          icon="📚"
        />
      </div>

      <div style={styles.grid}>
        {/* Personal Info */}
        <Section title="👤 Personal Info">
          <InfoRow label="Guardian" value={student.guardianName} />
          <InfoRow label="Contact" value={student.contactNo} />
          <InfoRow label="Address" value={student.address} />
          <InfoRow label="Joined" value={new Date(student.joinDate).toLocaleDateString("en-IN")} />
        </Section>

        {/* Academic Progress */}
        <Section title="🎓 Academic Progress">
          <InfoRow label="Level" value={student.progress?.academicLevel || "—"} />
          <InfoRow label="Grade" value={student.progress?.performanceGrade || "—"} />
          <InfoRow
            label="Last Review"
            value={student.progress?.lastReviewDate
              ? new Date(student.progress.lastReviewDate).toLocaleDateString("en-IN")
              : "—"}
          />
        </Section>
      </div>

      {/* Subjects */}
      {student.subjects?.length > 0 && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>📖 Subjects</div>
          <table style={styles.table}>
            <thead>
              <tr>
                {["Subject", "Grade", "Marks"].map(h => <th key={h} style={styles.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {student.subjects.map((s, i) => (
                <tr key={i}>
                  <td style={styles.td}>{s.name}</td>
                  <td style={styles.td}><Badge status={s.grade || "pending"}>{s.grade || "—"}</Badge></td>
                  <td style={styles.td}>{s.marks ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent Attendance */}
      {attendance.length > 0 && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>📅 Recent Attendance</div>
          <div style={styles.attendanceRow}>
            {[...attendance].reverse().slice(0, 30).map((a, i) => (
              <div
                key={i}
                title={new Date(a.date).toLocaleDateString("en-IN")}
                style={{
                  ...styles.dot,
                  backgroundColor: a.present ? "#16a34a" : "#ef4444",
                }}
              />
            ))}
          </div>
          <div style={styles.attendanceLegend}>
            <span><span style={{ ...styles.dot, backgroundColor: "#16a34a", display: "inline-block" }} /> Present</span>
            <span><span style={{ ...styles.dot, backgroundColor: "#ef4444", display: "inline-block" }} /> Absent</span>
            {attendancePct !== null && <span style={{ marginLeft: "auto", fontWeight: "600", color: "#374151" }}>{presentDays}/{attendance.length} days ({attendancePct}%)</span>}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div style={styles.quickLinks}>
        <QuickLink icon="💳" label="View Fees" onClick={() => navigate("/fees")} />
        <QuickLink icon="👤" label="My Profile" onClick={() => navigate("/profile")} />
      </div>
    </StudentLayout>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statIcon}>{icon}</div>
      <div style={{ fontSize: "22px", fontWeight: "700", color }}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>{children}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={styles.infoRow}>
      <div style={styles.infoLabel}>{label}</div>
      <div style={styles.infoValue}>{value || "—"}</div>
    </div>
  );
}

function QuickLink({ icon, label, onClick }) {
  return (
    <button onClick={onClick} style={styles.quickLinkBtn}>
      <span style={{ fontSize: "22px" }}>{icon}</span>
      <span style={{ fontWeight: "600", fontSize: "14px" }}>{label}</span>
    </button>
  );
}

const styles = {
  banner: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#4f46e5", borderRadius: "12px", padding: "24px 28px",
    marginBottom: "24px", color: "#fff",
  },
  bannerLeft: { display: "flex", alignItems: "center", gap: "16px" },
  bannerAvatar: {
    width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: "700", fontSize: "24px", flexShrink: 0,
  },
  bannerName: { fontSize: "22px", fontWeight: "700" },
  bannerSub: { fontSize: "14px", opacity: 0.85, marginTop: "2px" },

  statsRow: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "16px", marginBottom: "24px",
  },
  statCard: {
    backgroundColor: "#fff", borderRadius: "10px", padding: "20px 16px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.07)", textAlign: "center",
  },
  statIcon: { fontSize: "24px", marginBottom: "8px" },
  statLabel: { fontSize: "12px", color: "#888", marginTop: "4px", fontWeight: "500" },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "16px" },

  card: {
    backgroundColor: "#fff", borderRadius: "10px", padding: "20px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.07)", marginBottom: "16px",
  },
  cardTitle: { fontSize: "15px", fontWeight: "700", color: "#1a1a2e", marginBottom: "16px" },

  infoRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" },
  infoLabel: { fontSize: "13px", color: "#888", whiteSpace: "nowrap" },
  infoValue: { fontSize: "14px", fontWeight: "600", color: "#374151", textAlign: "right" },

  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "10px 12px", textAlign: "left", fontSize: "11px", fontWeight: "600",
    color: "#6b7280", backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb",
    textTransform: "uppercase",
  },
  td: { padding: "12px", fontSize: "14px", color: "#374151", borderBottom: "1px solid #f3f4f6" },

  attendanceRow: { display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" },
  dot: { width: "14px", height: "14px", borderRadius: "3px", cursor: "default" },
  attendanceLegend: { display: "flex", gap: "16px", alignItems: "center", fontSize: "12px", color: "#888" },

  quickLinks: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "8px" },
  quickLinkBtn: {
    backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px",
    padding: "18px 16px", display: "flex", flexDirection: "column", alignItems: "center",
    gap: "8px", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    transition: "box-shadow 0.2s",
  },

  notLinked: { textAlign: "center", padding: "80px 24px" },
  notLinkedIcon: { fontSize: "64px", marginBottom: "16px" },
  notLinkedTitle: { fontSize: "22px", fontWeight: "700", color: "#1a1a2e", marginBottom: "8px" },
  notLinkedText: { fontSize: "14px", color: "#888", maxWidth: "320px", margin: "0 auto" },
};
