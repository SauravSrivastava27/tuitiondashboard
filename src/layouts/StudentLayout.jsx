import React from "react";
import StudentNav from "../components/StudentNav";

export default function StudentLayout({ children }) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f6fa" }}>
      <StudentNav />
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px" }}>
        {children}
      </div>
    </div>
  );
}
