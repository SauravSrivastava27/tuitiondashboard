import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate, useParams } from "react-router-dom";
import StudentLayout from "../layouts/StudentLayout";
import Input from "../components/Input";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/pages/StudentForm.scss";

const emptyForm = { name: "", address: "", guardianName: "", school: "", className: "", contactNo: "", fee: "", status: "active" };

export default function StudentForm() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      setPageLoading(true);
      api.get(`/api/students/${id}`)
        .then(res => setForm(res.data))
        .catch(() => setMessage("Failed to load student"))
        .finally(() => setPageLoading(false));
    }
  }, [id]);

  const validateForm = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.guardianName.trim()) e.guardianName = "Guardian name is required";
    if (!form.school.trim()) e.school = "School is required";
    if (!form.className.trim()) e.className = "Class is required";
    if (!form.contactNo.trim()) e.contactNo = "Contact number is required";
    if (!/^\d{10}$/.test(form.contactNo)) e.contactNo = "Contact must be 10 digits";
    if (!form.fee || parseFloat(form.fee) <= 0) e.fee = "Fee must be a positive number";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) { const ne = { ...errors }; delete ne[name]; setErrors(ne); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setLoading(true);
    setMessage("");
    try {
      if (id) {
        await api.put(`/api/students/${id}`, form);
        setMessage("Student updated successfully!");
      } else {
        await api.post("/api/students", form);
        setMessage("Student added successfully!");
      }
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setMessage(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <StudentLayout><LoadingSpinner /></StudentLayout>;

  return (
    <StudentLayout>
      <div className="student-form">
        <h1 className="student-form__title">{id ? "Edit Student" : "Add New Student"}</h1>
        <p className="student-form__subtitle">{id ? "Update student information" : "Register a new student in the system"}</p>

        {message && (
          <div className={`student-form__banner student-form__banner--${message.includes("Error") ? "error" : "success"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="student-form__field-group">
            <Input label="Student Name" name="name" value={form.name} onChange={handleChange} error={errors.name} required placeholder="Full name" />
          </div>
          <div className="student-form__field-group">
            <Input label="Address" name="address" value={form.address} onChange={handleChange} error={errors.address} required placeholder="Residential address" />
          </div>
          <div className="student-form__field-group">
            <Input label="Guardian Name" name="guardianName" value={form.guardianName} onChange={handleChange} error={errors.guardianName} required placeholder="Parent or guardian name" />
          </div>
          <div className="student-form__grid">
            <div>
              <Input label="School" name="school" value={form.school} onChange={handleChange} error={errors.school} required placeholder="School name" />
            </div>
            <div>
              <Input label="Class/Grade" name="className" value={form.className} onChange={handleChange} error={errors.className} required placeholder="Class name (e.g., 10th)" />
            </div>
          </div>
          <div className="student-form__grid">
            <div>
              <Input label="Contact Number" name="contactNo" value={form.contactNo} onChange={handleChange} error={errors.contactNo} required placeholder="10-digit number" />
            </div>
            <div>
              <Input label="Fee Amount (₹)" name="fee" type="number" value={form.fee} onChange={handleChange} error={errors.fee} required placeholder="Monthly fee" />
            </div>
          </div>
          <div className="student-form__field-group">
            <label className="student-form__status-label">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="student-form__status-select">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="student-form__actions">
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : id ? "Update Student" : "Add Student"}</Button>
            <Button type="button" variant="outline" onClick={() => navigate("/dashboard")} disabled={loading}>Cancel</Button>
          </div>
        </form>
      </div>
    </StudentLayout>
  );
}
