import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import StudentList from "./pages/StudentList";
import StudentForm from "./pages/StudentForm";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><StudentList /></PrivateRoute>} />
        <Route path="/add" element={<PrivateRoute><StudentForm /></PrivateRoute>} />
        <Route path="/edit/:id" element={<PrivateRoute><StudentForm /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
