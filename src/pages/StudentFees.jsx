import React, { useEffect, useState } from "react";
import StudentLayout from "../layouts/StudentLayout";
import api from "../api";
import Card from "../components/Card";
import LoadingSpinner from "../components/LoadingSpinner";

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

  const totalAmount   = fees.reduce((s, f) => s + f.amount, 0);
  const totalPaid     = fees.reduce((s, f) => s + (f.paidAmount || 0), 0);
  const totalRemaining = totalAmount - totalPaid;

  const th = {
    padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600",
    color: "#6b7280", backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb",
    textTransform: "uppercase", letterSpacing: "0.5px",
  };
  const td = { padding: "14px 16px", fontSize: "14px", color: "#374151", borderBottom: "1px solid #f3f4f6" };

  return (
    <StudentLayout>
      <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 6px" }}>My Fees</h1>
      <p style={{ fontSize: "14px", color: "#666", margin: "0 0 24px" }}>Track your fee payments</p>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <SummaryCard label="Total Amount" value={`₹${totalAmount.toLocaleString()}`} color="#4f46e5" icon="💰" />
        <SummaryCard label="Paid" value={`₹${totalPaid.toLocaleString()}`} color="#16a34a" icon="✅" />
        <SummaryCard label="Remaining" value={`₹${totalRemaining.toLocaleString()}`} color={totalRemaining > 0 ? "#ef4444" : "#16a34a"} icon={totalRemaining > 0 ? "⚠️" : "🎉"} />
      </div>

      {/* Overall progress bar */}
      {totalAmount > 0 && (
        <div style={{ backgroundColor: "#fff", borderRadius: "10px", padding: "20px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>
            <span>Overall Payment Progress</span>
            <span style={{ fontWeight: "600", color: "#1a1a2e" }}>
              {Math.round((totalPaid / totalAmount) * 100)}% paid
            </span>
          </div>
          <div style={{ height: "10px", backgroundColor: "#e5e7eb", borderRadius: "99px", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${Math.min((totalPaid / totalAmount) * 100, 100)}%`,
              backgroundColor: totalPaid >= totalAmount ? "#16a34a" : "#4f46e5",
              borderRadius: "99px",
              transition: "width 0.5s ease",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#9ca3af", marginTop: "6px" }}>
            <span>Paid: ₹{totalPaid.toLocaleString()}</span>
            <span>Remaining: ₹{totalRemaining.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Fee Records Table */}
      <Card title="📋 Fee Records">
        {fees.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Total Amount</th>
                  <th style={th}>Paid</th>
                  <th style={th}>Remaining</th>
                  <th style={th}>Due Date</th>
                  <th style={th}>Method</th>
                  <th style={th}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {fees.map(fee => {
                  const paid = fee.paidAmount || 0;
                  const rem  = fee.amount - paid;
                  return (
                    <tr key={fee._id}>
                      <td style={{ ...td, fontWeight: "600" }}>₹{fee.amount.toLocaleString()}</td>
                      <td style={{ ...td, color: paid > 0 ? "#16a34a" : "#9ca3af", fontWeight: paid > 0 ? "600" : "400" }}>
                        ₹{paid.toLocaleString()}
                      </td>
                      <td style={{ ...td, fontWeight: "700", color: rem <= 0 ? "#16a34a" : "#ef4444" }}>
                        {rem <= 0 ? "✓ Fully Paid" : `₹${rem.toLocaleString()}`}
                      </td>
                      <td style={td}>{new Date(fee.dueDate).toLocaleDateString("en-IN")}</td>
                      <td style={td}>{fee.paymentMethod}</td>
                      <td style={{ ...td, color: "#9ca3af", fontSize: "13px" }}>{fee.notes || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "40px", textAlign: "center", color: "#aaa" }}>No fee records found</div>
        )}
      </Card>
    </StudentLayout>
  );
}

function SummaryCard({ label, value, color, icon }) {
  return (
    <div style={{ backgroundColor: "#fff", borderRadius: "10px", padding: "20px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", textAlign: "center" }}>
      <div style={{ fontSize: "28px", marginBottom: "8px" }}>{icon}</div>
      <div style={{ fontSize: "22px", fontWeight: "700", color }}>{value}</div>
      <div style={{ fontSize: "12px", color: "#888", marginTop: "4px", fontWeight: "500" }}>{label}</div>
    </div>
  );
}
