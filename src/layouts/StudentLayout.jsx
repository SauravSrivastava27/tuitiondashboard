import React from "react";
import StudentNav from "../components/StudentNav";

export default function StudentLayout({ children }) {
  return (
    <div className="min-h-screen nb-pattern bg-nb-blue/5 transition-colors duration-500">
      <StudentNav />
      <div className="max-w-[1240px] mx-auto p-8 pt-24">
        {children}
      </div>
    </div>
  );
}


