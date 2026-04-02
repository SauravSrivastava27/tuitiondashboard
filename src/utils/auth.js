export const getRole = () => localStorage.getItem("role");
export const getUsername = () => localStorage.getItem("username");
export const getStudentId = () => localStorage.getItem("studentId");
export const isAdmin = () => getRole() === "admin";
export const isUser = () => getRole() === "student";

export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  localStorage.removeItem("studentId");
};

