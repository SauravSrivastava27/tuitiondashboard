export const getRole = () => localStorage.getItem("role");
export const getUsername = () => localStorage.getItem("username");
export const isAdmin = () => getRole() === "admin";
export const isUser = () => getRole() === "user";

export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
};
