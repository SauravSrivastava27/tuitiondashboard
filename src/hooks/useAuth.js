import { useState, useEffect } from "react";
import { getUsername, getRole, getStudentId } from "../utils/auth";

export function useAuth() {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuth({
        token,
        username: getUsername(),
        role: getRole(),
        studentId: getStudentId(),
        isAdmin: getRole() === "admin",
        isStudent: getRole() === "student"
      });
    }
    setLoading(false);
  }, []);

  return { auth, loading };
}
