import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import StudentList from "./pages/StudentList";
import StudentForm from "./pages/StudentForm";
import StudentDetails from "./pages/StudentDetails";
import StudentProfile from "./pages/StudentProfile";
import StudentFees from "./pages/StudentFees";
import UserProfile from "./pages/UserProfile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import First2FASetup from "./pages/First2FASetup";
import Landing from "./pages/Landing";
import AdminDashboard from "./pages/AdminDashboard";
import AdminStudentManagement from "./pages/AdminStudentManagement";
import AdminPanel from "./pages/AdminPanel";
import AdminFeeManagement from "./pages/AdminFeeManagement";
import AdminReports from "./pages/AdminReports";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token) return <Navigate to="/login" replace />;
  if (role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/setup-2fa" element={<First2FASetup />} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="/admin/students" element={<AdminRoute><AdminStudentManagement /></AdminRoute>} />
        <Route path="/admin/fees" element={<AdminRoute><AdminFeeManagement /></AdminRoute>} />
        <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />

        {/* Legacy admin route (redirect) */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Student/Dashboard routes */}
        <Route path="/dashboard" element={<PrivateRoute><StudentList /></PrivateRoute>} />
        <Route path="/add" element={<PrivateRoute><StudentForm /></PrivateRoute>} />
        <Route path="/edit/:id" element={<PrivateRoute><StudentForm /></PrivateRoute>} />
        <Route path="/student/:id" element={<PrivateRoute><StudentDetails /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
        <Route path="/fees" element={<PrivateRoute><StudentFees /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
