import React from "react";

export default function Badge({ status, children }) {
  const badgeVariants = {
    admin: { backgroundColor: "#ede9fe", color: "#4f46e5" },
    user: { backgroundColor: "#f0fdf4", color: "#16a34a" },
    student: { backgroundColor: "#f0fdf4", color: "#16a34a" },
    active: { backgroundColor: "#d1fae5", color: "#065f46" },
    inactive: { backgroundColor: "#fee2e2", color: "#991b1b" },
    completed: { backgroundColor: "#dbeafe", color: "#1e40af" },
    paid: { backgroundColor: "#d1fae5", color: "#065f46" },
    pending: { backgroundColor: "#fef3c7", color: "#92400e" },
    overdue: { backgroundColor: "#fee2e2", color: "#991b1b" },
  };

  const style = {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "100px",
    fontSize: "12px",
    fontWeight: "600",
    ...badgeVariants[status] || { backgroundColor: "#f3f4f6", color: "#6b7280" }
  };

  return <span style={style}>{children || status}</span>;
}
