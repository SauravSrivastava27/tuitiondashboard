import React from "react";

export default function Badge({ status, children, className = "" }) {
  const badgeVariants = {
    admin: "bg-nb-blue/20 text-nb-blue",
    user: "bg-nb-green/20 text-nb-green",
    student: "bg-nb-green/20 text-nb-green",
    active: "bg-nb-green text-black",
    inactive: "bg-nb-pink text-white",
    completed: "bg-nb-blue text-black",
    paid: "bg-nb-green text-black",
    pending: "bg-nb-yellow text-black",
    overdue: "bg-nb-pink text-white",
  };

  const variantClass = badgeVariants[status] || "bg-gray-200 text-gray-700";

  return (
    <span className={`nb-badge ${variantClass} ${className}`}>
      {children || status}
    </span>
  );
}

