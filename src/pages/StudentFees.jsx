import React, { useEffect, useState } from "react";
import StudentLayout from "../layouts/StudentLayout";
import api from "../api";
import Card from "../components/Card";
import Badge from "../components/Badge";
import LoadingSpinner from "../components/LoadingSpinner";

export default function StudentFees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/fees")
      .then(res => setFees(res.data.fees))
      .catch(err => console.error("Failed to load fees:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <StudentLayout><LoadingSpinner /></StudentLayout>;

  const totalFees = fees.reduce((sum, f) => sum + f.amount, 0);
  const paidFees = fees.filter(f => f.status === "paid").reduce((sum, f) => sum + f.amount, 0);
  const pendingFees = fees.filter(f => f.status === "pending").reduce((sum, f) => sum + f.amount, 0);
  const overdueFees = fees.filter(f => f.status === "overdue").reduce((sum, f) => sum + f.amount, 0);

  const StatBox = ({ label, value, color }) => (
    <div style={{
      padding: "16px",
      backgroundColor: "#f9fafb",
      borderRadius: "6px",
      textAlign: "center"
    }}>
      <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontSize: "20px", fontWeight: "700", color }}>{value}</div>
    </div>
  );

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
        <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 6px" }}>
          Fee Management
        </h1>
        <p style={{ fontSize: "14px", color: "#666", margin: "0 0 24px" }}>
          Track your fee payments and due dates
        </p>

        {/* Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <StatBox label="Total Fees" value={`₹${totalFees.toLocaleString()}`} color="#4f46e5" />
          <StatBox label="Paid" value={`₹${paidFees.toLocaleString()}`} color="#16a34a" />
          <StatBox label="Pending" value={`₹${pendingFees.toLocaleString()}`} color="#f59e0b" />
          <StatBox label="Overdue" value={`₹${overdueFees.toLocaleString()}`} color="#ef4444" />
        </div>

        {/* Fee Details */}
        <Card title="📋 Fee Records">
          {fees.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Amount</th>
                    <th style={thStyle}>Due Date</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Method</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((fee) => (
                    <tr key={fee._id}>
                      <td style={tdStyle}>
                        {new Date(fee.createdAt).toLocaleDateString()}
                      </td>
                      <td style={tdStyle}>₹{fee.amount}</td>
                      <td style={tdStyle}>
                        {new Date(fee.dueDate).toLocaleDateString()}
                      </td>
                      <td style={tdStyle}>
                        <Badge status={fee.status}>{fee.status}</Badge>
                      </td>
                      <td style={tdStyle}>{fee.paymentMethod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: "40px", textAlign: "center", color: "#aaa" }}>
              No fee records found
            </div>
          )}
        </Card>

        {/* Payment Instructions */}
        <Card title="💳 Payment Instructions">
          <div style={{ fontSize: "14px", color: "#666", lineHeight: "1.6" }}>
            <p><strong>How to Pay:</strong></p>
            <ol style={{ margin: "8px 0", paddingLeft: "20px" }}>
              <li>Contact your tuition center or administrator</li>
              <li>Provide your student details</li>
              <li>Make payment as per the available methods</li>
              <li>Get a receipt for your records</li>
            </ol>
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
}
