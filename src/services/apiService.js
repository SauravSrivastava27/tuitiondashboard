import api from "../api";

export const studentService = {
  getAll: (page = 1, limit = 10, search = "", status = "") => {
    const params = new URLSearchParams({
      page,
      limit,
      ...(search && { search }),
      ...(status && { status })
    });
    return api.get(`/api/students?${params}`);
  },

  getById: (id) => api.get(`/api/students/${id}`),

  create: (data) => api.post("/api/students", data),

  update: (id, data) => api.put(`/api/students/${id}`, data),

  delete: (id) => api.delete(`/api/students/${id}`),

  addNote: (id, text) => api.post(`/api/students/${id}/notes`, { text }),

  updateProgress: (id, data) => api.post(`/api/students/${id}/progress`, data),

  markAttendance: (id, date, present) => api.post(`/api/students/${id}/attendance`, { date, present }),

  addSubject: (id, name, grade, marks) => api.post(`/api/students/${id}/subjects`, { name, grade, marks }),

  getProgress: (id) => api.get(`/api/students/${id}/progress`)
};

export const analyticsService = {
  getDashboard: () => api.get("/api/analytics/dashboard"),
  getStudentStatus: () => api.get("/api/analytics/student-status"),
  getFeeSummary: () => api.get("/api/analytics/fee-summary"),
  getRecentActivity: () => api.get("/api/analytics/recent-activity")
};

export const feeService = {
  getAll: (page = 1, limit = 10, studentId = "", status = "") => {
    const params = new URLSearchParams({
      page,
      limit,
      ...(studentId && { studentId }),
      ...(status && { status })
    });
    return api.get(`/api/fees?${params}`);
  },

  create: (data) => api.post("/api/fees", data),

  update: (id, data) => api.put(`/api/fees/${id}`, data),

  delete: (id) => api.delete(`/api/fees/${id}`),

  getSummary: () => api.get("/api/fees/summary")
};

export const userService = {
  getAll: () => api.get("/api/users"),

  getById: (id) => api.get(`/api/users/${id}`),

  updateRole: (id, role, studentId) => api.patch(`/api/users/${id}/role`, { role, ...(studentId && { studentId }) }),

  updateProfile: (id, username, phone) => api.put(`/api/users/${id}/profile`, { username, phone }),

  delete: (id) => api.delete(`/api/users/${id}`)
};
