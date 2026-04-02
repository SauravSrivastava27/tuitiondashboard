import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentLayout from "../layouts/StudentLayout";
import api from "../api";
import Card from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";
import LoadingSpinner from "../components/LoadingSpinner";

export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [studentRes, progressRes] = await Promise.all([
          api.get(`/api/students/${id}`),
          api.get(`/api/students/${id}/progress`)
        ]);
        setStudent(studentRes.data);
        setProgress(progressRes.data);
      } catch (err) {
        console.error("Failed to load student details:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) return <StudentLayout><LoadingSpinner /></StudentLayout>;
  if (!student) return <StudentLayout><div style={{ textAlign: "center", color: "#888" }}>Student not found</div></StudentLayout>;

  const thStyle = {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
  };

  const tdStyle = {
    padding: "12px 16px",
    fontSize: "14px",
    color: "#374151",
    borderBottom: "1px solid #f3f4f6",
  };

  return (
    <StudentLayout>
      <div>
        <Button variant="outline" onClick={() => navigate("/dashboard")} style={{ marginBottom: "20px" }}>
          ← Back to Students
        </Button>

        {/* Student Info */}
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
            <div>
              <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>Name</div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a2e" }}>{student.name}</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>School</div>
              <div style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>{student.school}</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>Class</div>
              <div style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>{student.className}</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>Status</div>
              <div><Badge status={student.status}>{student.status}</Badge></div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>Monthly Fee</div>
              <div style={{ fontSize: "16px", fontWeight: "600", color: "#4f46e5" }}>₹{student.fee}</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>Guardian</div>
              <div style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>{student.guardianName}</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>Contact</div>
              <div style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>{student.contactNo}</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>Address</div>
              <div style={{ fontSize: "14px", color: "#374151" }}>{student.address}</div>
            </div>
          </div>
        </Card>

        {/* Progress Section */}
        {progress && (
          <>
            <Card title="📈 Academic Progress">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>Academic Level</div>
                  <div style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>
                    {progress.progress?.academicLevel || "—"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>Performance Grade</div>
                  <div style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>
                    {progress.progress?.performanceGrade || "—"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>Last Review</div>
                  <div style={{ fontSize: "14px", color: "#374151" }}>
                    {progress.progress?.lastReviewDate ? new Date(progress.progress.lastReviewDate).toLocaleDateString() : "—"}
                  </div>
                </div>
              </div>
            </Card>

            {/* Subjects */}
            {progress.subjects && progress.subjects.length > 0 && (
              <Card title="📚 Subjects">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Subject</th>
                      <th style={thStyle}>Grade</th>
                      <th style={thStyle}>Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {progress.subjects.map((subject, idx) => (
                      <tr key={idx}>
                        <td style={tdStyle}>{subject.name}</td>
                        <td style={tdStyle}>
                          <Badge status={subject.grade || "pending"}>{subject.grade || "—"}</Badge>
                        </td>
                        <td style={tdStyle}>{subject.marks || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}

            {/* Attendance */}
            {progress.attendance && progress.attendance.length > 0 && (
              <Card title="📅 Recent Attendance">
                <div style={{ fontSize: "14px", color: "#374151" }}>
                  <div style={{ marginBottom: "12px" }}>
                    <strong>Total Days: </strong>{progress.attendance.length}
                  </div>
                  <div>
                    <strong>Present: </strong>
                    <span style={{ color: "#16a34a", fontWeight: "600" }}>
                      {progress.attendance.filter(a => a.present).length}
                    </span>
                  </div>
                  <div>
                    <strong>Absent: </strong>
                    <span style={{ color: "#ef4444", fontWeight: "600" }}>
                      {progress.attendance.filter(a => !a.present).length}
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}

        {/* Notes */}
        {student.notes && student.notes.length > 0 && (
          <Card title="📝 Notes">
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {student.notes.map((note, idx) => (
                <div key={idx} style={{
                  padding: "12px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "6px",
                  borderLeft: "3px solid #4f46e5"
                }}>
                  <div style={{ fontSize: "14px", color: "#374151", marginBottom: "4px" }}>{note.text}</div>
                  <div style={{ fontSize: "12px", color: "#999" }}>
                    {new Date(note.addedAt).tolocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </StudentLayout>
  );
}
