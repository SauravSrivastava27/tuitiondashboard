import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import api from "../api";
import Card from "../components/Card";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/analytics/dashboard")
      .then(res => setStats(res.data))
      .catch(err => console.error("Failed to load dashboard stats:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><LoadingSpinner /></AdminLayout>;

  if (!stats) return <AdminLayout><div style={{ textAlign: "center", color: "#888" }}>Failed to load dashboard</div></AdminLayout>;

  const data = stats;

  const StatCard = ({ title, value, icon, color }) => (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>{title}</div>
          <div style={{ fontSize: "28px", fontWeight: "700", color }}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
        </div>
        <div style={{ fontSize: "40px" }}>{icon}</div>
      </div>
    </Card>
  );

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  };

  const sectionStyle = {
    marginTop: "30px",
  };

  const titleStyle = {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: "12px",
  };

  return (
    <AdminLayout>
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 6px" }}>
          Dashboard
        </h1>
        <p style={{ fontSize: "14px", color: "#666", margin: 0, marginBottom: "30px" }}>
          Overview of your tuition management system
        </p>

        {/* Students Stats */}
        <div style={sectionStyle}>
          <h3 style={titleStyle}>📚 Students</h3>
          <div style={gridStyle}>
            <StatCard title="Total Students" value={data.students.total} icon="👫" color="#4f46e5" />
            <StatCard title="Active Students" value={data.students.active} icon="✅" color="#16a34a" />
            <StatCard title="Completed" value={data.students.completed} icon="🏆" color="#ea b308" />
            <StatCard title="Inactive" value={data.students.inactive} icon="⏸" color="#ef4444" />
          </div>
        </div>

        {/* Fees Stats */}
        <div style={sectionStyle}>
          <h3 style={titleStyle}>💰 Fees</h3>
          <div style={gridStyle}>
            <StatCard
              title="Total Fees"
              value={`₹${data.fees.total.toLocaleString()}`}
              icon="💵"
              color="#4f46e5"
            />
            <StatCard
              title="Paid"
              value={`₹${data.fees.paid.toLocaleString()}`}
              icon="✅"
              color="#16a34a"
            />
            <StatCard
              title="Pending"
              value={`₹${data.fees.pending.toLocaleString()}`}
              icon="⏳"
              color="#f59e0b"
            />
            <StatCard
              title="Overdue"
              value={`₹${data.fees.overdue.toLocaleString()}`}
              icon="⚠️"
              color="#ef4444"
            />
          </div>
        </div>

        {/* Users Stats */}
        <div style={sectionStyle}>
          <h3 style={titleStyle}>👥 Users</h3>
          <div style={gridStyle}>
            <StatCard title="Total Users" value={data.users.total} icon="📋" color="#4f46e5" />
            <StatCard title="Admin Users" value={data.users.admin} icon="⚙️" color="#8b5cf6" />
            <StatCard title="Student Users" value={data.users.student} icon="👤" color="#3b82f6" />
          </div>
        </div>

        {/* Recently Created Users */}
        {data.recentlyCreatedUsers && data.recentlyCreatedUsers.length > 0 && (
          <div style={sectionStyle}>
            <h3 style={titleStyle}>✨ Recently Created Users</h3>
            <Card>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {data.recentlyCreatedUsers.map(user => (
                  <div
                    key={user._id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px",
                      backgroundColor: "#f9fafb",
                      borderRadius: "6px",
                      borderLeft: "4px solid #10b981"
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>
                        {user.studentName}
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                        Username: <code style={{ backgroundColor: "#fff", padding: "2px 6px", borderRadius: "3px", fontFamily: "monospace" }}>{user.username}</code>
                      </div>
                    </div>
                    <div style={{ fontSize: "12px", color: "#9ca3af", whiteSpace: "nowrap" }}>
                      {new Date(user.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div style={sectionStyle}>
          <h3 style={titleStyle}>Quick Actions</h3>
          <Card>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <a href="/admin/students" style={{
                padding: "10px 16px",
                backgroundColor: "#4f46e5",
                color: "#fff",
                borderRadius: "6px",
                textDecoration: "none",
                fontWeight: "600",
                fontSize: "14px",
              }}>
                Add Student
              </a>
              <a href="/admin/fees" style={{
                padding: "10px 16px",
                backgroundColor: "#4f46e5",
                color: "#fff",
                borderRadius: "6px",
                textDecoration: "none",
                fontWeight: "600",
                fontSize: "14px",
              }}>
                Record Fee Payment
              </a>
              <a href="/admin/reports" style={{
                padding: "10px 16px",
                backgroundColor: "#4f46e5",
                color: "#fff",
                borderRadius: "6px",
                textDecoration: "none",
                fontWeight: "600",
                fontSize: "14px",
              }}>
                View Reports
              </a>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
