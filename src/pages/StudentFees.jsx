import { useEffect, useState } from "react";
import StudentLayout from "../layouts/StudentLayout";
import api from "../api";
import Card from "../components/Card";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/pages/StudentFees.scss";

export default function StudentFees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/fees/my")
      .then(res => setFees(res.data.fees || []))
      .catch(err => console.error("Failed to load fees:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <StudentLayout><LoadingSpinner /></StudentLayout>;

  const totalAmount = fees.reduce((s, f) => s + f.amount, 0);
  const totalPaid = fees.reduce((s, f) => s + (f.paidAmount || 0), 0);
  const totalRemaining = totalAmount - totalPaid;

  return (
    <StudentLayout>
      <h1 className="student-fees__title">My Fees</h1>
      <p className="student-fees__subtitle">Track your fee payments</p>

      <div className="student-fees__summary-grid">
        <SummaryCard label="Total Amount" value={`₹${totalAmount.toLocaleString()}`} color="#4f46e5" icon="💰" />
        <SummaryCard label="Paid" value={`₹${totalPaid.toLocaleString()}`} color="#16a34a" icon="✅" />
        <SummaryCard label="Remaining" value={`₹${totalRemaining.toLocaleString()}`} color={totalRemaining > 0 ? "#ef4444" : "#16a34a"} icon={totalRemaining > 0 ? "⚠️" : "🎉"} />
      </div>

      {totalAmount > 0 && (
        <div className="student-fees__progress-card">
          <div className="student-fees__progress-header">
            <span>Overall Payment Progress</span>
            <span className="student-fees__progress-pct">{Math.round((totalPaid / totalAmount) * 100)}% paid</span>
          </div>
          <div className="student-fees__progress-track">
            <div
              className="student-fees__progress-fill"
              style={{
                width: `${Math.min((totalPaid / totalAmount) * 100, 100)}%`,
                backgroundColor: totalPaid >= totalAmount ? "#16a34a" : "#4f46e5",
              }}
            />
          </div>
          <div className="student-fees__progress-footer">
            <span>Paid: ₹{totalPaid.toLocaleString()}</span>
            <span>Remaining: ₹{totalRemaining.toLocaleString()}</span>
          </div>
        </div>
      )}

      <Card title="📋 Fee Records">
        {fees.length > 0 ? (
          <div className="student-fees__table-overflow">
            <table className="student-fees__table">
              <thead>
                <tr>
                  {["Total Amount", "Paid", "Remaining", "Due Date", "Method", "Notes"].map(h => (
                    <th key={h} className="student-fees__th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fees.map(fee => {
                  const paid = fee.paidAmount || 0;
                  const rem = fee.amount - paid;
                  return (
                    <tr key={fee._id}>
                      <td className="student-fees__td student-fees__td--bold">₹{fee.amount.toLocaleString()}</td>
                      <td className={`student-fees__td ${paid > 0 ? "student-fees__td--paid" : "student-fees__td--unpaid"}`}>₹{paid.toLocaleString()}</td>
                      <td className={`student-fees__td ${rem <= 0 ? "student-fees__td--remaining-paid" : "student-fees__td--remaining-due"}`}>
                        {rem <= 0 ? "✓ Fully Paid" : `₹${rem.toLocaleString()}`}
                      </td>
                      <td className="student-fees__td">{new Date(fee.dueDate).toLocaleDateString("en-IN")}</td>
                      <td className="student-fees__td">{fee.paymentMethod}</td>
                      <td className="student-fees__td student-fees__td--notes">{fee.notes || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="student-fees__empty">No fee records found</div>
        )}
      </Card>
    </StudentLayout>
  );
}

function SummaryCard({ label, value, color, icon }) {
  return (
    <div className="student-fees__summary-card">
      <div className="student-fees__summary-icon">{icon}</div>
      <div style={{ fontSize: "22px", fontWeight: "700", color }}>{value}</div>
      <div className="student-fees__summary-label">{label}</div>
    </div>
  );
}
