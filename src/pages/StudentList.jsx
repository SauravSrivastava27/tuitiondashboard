import { useEffect, useState } from "react";
import api from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/students")
      .then(res => setStudents(res.data));
  }, []);

  const handleDelete = async (id) => {
    await api.delete(`/api/students/${id}`);
    setStudents(students.filter(s => s._id !== id));
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      navigate("/login");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to="/add">+ Add Student</Link>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th><th>School</th><th>Class</th>
            <th>Contact</th><th>Fee</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s._id}>
              <td>{s.name}</td><td>{s.school}</td>
              <td>{s.className}</td><td>{s.contactNo}</td>
              <td>₹{s.fee}</td>
              <td>
                <Link to={`/edit/${s._id}`}>Edit</Link>
                <button onClick={() => handleDelete(s._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}