import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import api from "../api";
import Card from "../components/Card";
import LoadingSpinner from "../components/LoadingSpinner";
import { analyticsService } from "../services/apiService";

export default function AdminReports() {
  const [feeSummary, setFeeSummary] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const [feeRes, activityRes] = await Promise.all([
          analyticsService.getFeeSummary(),
          analyticsService.getRecentActivity()
        ]);
        setFeeSummary(feeRes.data);
        setRecentActivity(activityRes.data);
      } catch (err) {
        console.error("Failed to load reports:", err);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  if (loading) return <AdminLayout><LoadingSpinner /></AdminLayout>;

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
  };

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
    <AdminLayout>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 6px" }}>
          Reports & Analytics
        </h1>
        <p style={{ fontSize: "14px", color: "#666", margin: 0, marginBottom: "24px" }}>
          Detailed reports and analytics of your tuition business
        </p>

        {/* Fee Summary */}
        <Card title="💰 Fee Collection Summary" icon="📊">
          {feeSummary?.summary && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" }}>
              {feeSummary.summary.map((item) => (
                <div key={item._id} style={{ padding: "12px", backgroundColor: "#f9fafb", borderRadius: "6px" }}>
                  <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px", textTransform: "capitalize" }}>
                    {item._id} Fees
                  </div>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a2e", marginBottom: "4px" }}>
                    {item.count} payments
                  </div>
                  <div style={{ fontSize: "14px", color: "#4f46e5", fontWeight: "600" }}>
                    ₹{item.total.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "600", color: "#374151" }}>Total Collected</span>
              <span style={{ fontSize: "20px", fontWeight: "700", color: "#16a34a" }}>
                ₹{feeSummary?.totalCollected?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </Card>

        {/* Monthly Breakdown */}
        <Card title="📈 Monthly Fee Collection">
          {feeSummary?.byMonth && feeSummary.byMonth.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Month/Year</th>
                    <th style={thStyle}>Payments</th>
                    <th style={thStyle}>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {feeSummary.byMonth.map((item) => (
                    <tr key={`${item._id.year}-${item._id.month}`}>
                      <td style={tdStyle}>
                        {new Date(item._id.year, item._id.month - 1).toLocaleDateString("en-IN", {
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td style={tdStyle}>{item.count}</td>
                      <td style={tdStyle}>₹{item.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: "20px", textAlign: "center", color: "#aaa" }}>
              No monthly data available
            </div>
          )}
        </Card>

        {/* Recent Activities */}
        {recentActivity && (
          <>
            <Card title="📚 Recent Students">
              {recentActivity.recentStudents && recentActivity.recentStudents.length > 0 ? (
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Name</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Join Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.recentStudents.map((student) => (
                      <tr key={student._id}>
                        <td style={tdStyle}>{student.name}</td>
                        <td style={tdStyle}>
                          <span style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: "100px",
                            fontSize: "12px",
                            fontWeight: "600",
                            backgroundColor: student.status === "active" ? "#d1fae5" : "#fee2e2",
                            color: student.status === "active" ? "#065f46" : "#991b1b"
                          }}>
                            {student.status}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          {new Date(student.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: "20px", textAlign: "center", color: "#aaa" }}>
                  No recent students
                </div>
              )}
            </Card>

            <Card title="💳 Recent Fees">
              {recentActivity.recentFees && recentActivity.recentFees.length > 0 ? (
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Student</th>
                      <th style={thStyle}>Amount</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.recentFees.map((fee) => (
                      <tr key={fee._id}>
                        <td style={tdStyle}>{fee.studentId?.name || "Unknown"}</td>
                        <td style={tdStyle}>₹{fee.amount}</td>
                        <td style={tdStyle}>
                          <span style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: "100px",
                            fontSize: "12px",
                            fontWeight: "600",
                            backgroundColor: fee.status === "paid" ? "#d1fae5" : "#fef3c7",
                            color: fee.status === "paid" ? "#065f46" : "#92400e"
                          }}>
                            {fee.status}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          {new Date(fee.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: "20px", textAlign: "center", color: "#aaa" }}>
                  No recent fees
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
