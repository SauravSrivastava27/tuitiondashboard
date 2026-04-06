import React from "react";
import Sidebar from "../components/Sidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen nb-pattern transition-colors duration-500">
      <Sidebar />
      <div className="max-w-[1440px] mx-auto p-8 pt-10">
        {children}
      </div>
    </div>
  );
}


