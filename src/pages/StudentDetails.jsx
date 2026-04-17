import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentLayout from "../layouts/StudentLayout";
import api from "../api";
import Card from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/pages/StudentDetails.scss";

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
  if (!student) return <StudentLayout><div className="student-details__empty">Student not found</div></StudentLayout>;

  return (
    <StudentLayout>
      <div>
        <Button variant="outline" onClick={() => navigate("/dashboard")} style={{ marginBottom: "20px" }}>← Back to Students</Button>

        <Card>
          <div className="student-details__info-grid">
            {[
              { label: "Name", value: student.name, cls: "--name" },
              { label: "School", value: student.school, cls: "--lg" },
              { label: "Class", value: student.className, cls: "--lg" },
              { label: "Guardian", value: student.guardianName, cls: "--lg" },
              { label: "Contact", value: student.contactNo, cls: "--lg" },
              { label: "Address", value: student.address },
            ].map(({ label, value, cls }) => (
              <div key={label}>
                <div className="student-details__info-item-label">{label}</div>
                <div className={`student-details__info-item-value${cls || ""}`}>{value}</div>
              </div>
            ))}
            <div>
              <div className="student-details__info-item-label">Status</div>
              <div><Badge status={student.status}>{student.status}</Badge></div>
            </div>
            <div>
              <div className="student-details__info-item-label">Monthly Fee</div>
              <div className="student-details__info-item-value--fee">₹{student.fee}</div>
            </div>
          </div>
        </Card>

        {progress && (
          <>
            <Card title="📈 Academic Progress">
              <div className="student-details__progress-grid">
                <div>
                  <div className="student-details__info-item-label">Academic Level</div>
                  <div className="student-details__info-item-value--lg">{progress.progress?.academicLevel || "—"}</div>
                </div>
                <div>
                  <div className="student-details__info-item-label">Performance Grade</div>
                  <div className="student-details__info-item-value--lg">{progress.progress?.performanceGrade || "—"}</div>
                </div>
                <div>
                  <div className="student-details__info-item-label">Last Review</div>
                  <div>{progress.progress?.lastReviewDate ? new Date(progress.progress.lastReviewDate).toLocaleDateString() : "—"}</div>
                </div>
              </div>
            </Card>

            {progress.subjects?.length > 0 && (
              <Card title="📚 Subjects">
                <table className="student-details__table">
                  <thead>
                    <tr>
                      <th className="student-details__th">Subject</th>
                      <th className="student-details__th">Grade</th>
                      <th className="student-details__th">Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {progress.subjects.map((subject, idx) => (
                      <tr key={idx}>
                        <td className="student-details__td">{subject.name}</td>
                        <td className="student-details__td"><Badge status={subject.grade || "pending"}>{subject.grade || "—"}</Badge></td>
                        <td className="student-details__td">{subject.marks || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}

            {progress.attendance?.length > 0 && (
              <Card title="📅 Recent Attendance">
                <div className="student-details__attendance-summary">
                  <div><strong>Total Days: </strong>{progress.attendance.length}</div>
                  <div><strong>Present: </strong><span className="student-details__present">{progress.attendance.filter(a => a.present).length}</span></div>
                  <div><strong>Absent: </strong><span className="student-details__absent">{progress.attendance.filter(a => !a.present).length}</span></div>
                </div>
              </Card>
            )}
          </>
        )}

        {student.notes?.length > 0 && (
          <Card title="📝 Notes">
            <div className="student-details__notes-list">
              {student.notes.map((note, idx) => (
                <div key={idx} className="student-details__note-item">
                  <div className="student-details__note-text">{note.text}</div>
                  <div className="student-details__note-date">{new Date(note.addedAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </StudentLayout>
  );
}
