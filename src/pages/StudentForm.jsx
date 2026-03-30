import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate, useParams } from "react-router-dom";

const emptyForm = {
  name: "", address: "", guardianName: "",
  school: "", className: "", contactNo: "", fee: ""
};

export default function StudentForm() {
  const [form, setForm] = useState(emptyForm);
  const navigate = useNavigate();
  const { id } = useParams(); // present when editing

  useEffect(() => {
    if (id) {
      api.get(`/api/students/${id}`)
        .then(res => setForm(res.data));
    }
  }, [id]);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (id) {
      await api.put(`/api/students/${id}`, form);
    } else {
      await api.post("/api/students", form);
    }
    navigate("/");
  };

  return (
    <form onSubmit={handleSubmit}>
      {["name","address","guardianName","school","className","contactNo","fee"]
        .map(field => (
          <input key={field} name={field} placeholder={field}
            value={form[field]} onChange={handleChange} required />
        ))}
      <button type="submit">{id ? "Update" : "Add"} Student</button>
    </form>
  );
}