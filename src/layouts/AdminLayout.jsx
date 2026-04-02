import React from "react";
import Sidebar from "../components/Sidebar";

export default function AdminLayout({ children }) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f6fa" }}>
      <Sidebar />
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px" }}>
        {children}
      </div>
    </div>
  );
}
