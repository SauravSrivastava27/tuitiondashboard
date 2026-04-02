import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate, useParams } from "react-router-dom";
import StudentLayout from "../layouts/StudentLayout";
import Input from "../components/Input";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";

const emptyForm = {
  name: "",
  address: "",
  guardianName: "",
  school: "",
  className: "",
  contactNo: "",
  fee: "",
  status: "active"
};

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
        .catch(err => {
          setMessage("Failed to load student");
          console.error(err);
        })
        .finally(() => setPageLoading(false));
    }
  }, [id]);

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.guardianName.trim()) newErrors.guardianName = "Guardian name is required";
    if (!form.school.trim()) newErrors.school = "School is required";
    if (!form.className.trim()) newErrors.className = "Class is required";
    if (!form.contactNo.trim()) newErrors.contactNo = "Contact number is required";
    if (!/^\d{10}$/.test(form.contactNo)) newErrors.contactNo = "Contact must be 10 digits";
    if (!form.fee || parseFloat(form.fee) <= 0) newErrors.fee = "Fee must be a positive number";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error for this field
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

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

  const formStyle = {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "32px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
    maxWidth: "600px",
    margin: "0 auto",
  };

  const fieldGroupStyle = {
    marginBottom: "20px",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "20px",
  };

  const buttonsStyle = {
    display: "flex",
    gap: "12px",
    marginTop: "32px",
  };

  if (pageLoading) return <StudentLayout><LoadingSpinner /></StudentLayout>;

  return (
    <StudentLayout>
      <div style={formStyle}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 6px" }}>
          {id ? "Edit Student" : "Add New Student"}
        </h1>
        <p style={{ fontSize: "14px", color: "#666", margin: "0 0 24px" }}>
          {id ? "Update student information" : "Register a new student in the system"}
        </p>

        {message && (
          <div style={{
            backgroundColor: message.includes("Error") ? "#fee2e2" : "#d1fae5",
            color: message.includes("Error") ? "#991b1b" : "#065f46",
            padding: "12px 16px",
            borderRadius: "6px",
            marginBottom: "20px",
            fontSize: "14px",
            fontWeight: "500",
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div style={fieldGroupStyle}>
            <Input
              label="Student Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              required
              placeholder="Full name"
            />
          </div>

          {/* Address */}
          <div style={fieldGroupStyle}>
            <Input
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              error={errors.address}
              required
              placeholder="Residential address"
            />
          </div>

          {/* Guardian Name */}
          <div style={fieldGroupStyle}>
            <Input
              label="Guardian Name"
              name="guardianName"
              value={form.guardianName}
              onChange={handleChange}
              error={errors.guardianName}
              required
              placeholder="Parent or guardian name"
            />
          </div>

          {/* School and Class Row */}
          <div style={gridStyle}>
            <div>
              <Input
                label="School"
                name="school"
                value={form.school}
                onChange={handleChange}
                error={errors.school}
                required
                placeholder="School name"
              />
            </div>
            <div>
              <Input
                label="Class/Grade"
                name="className"
                value={form.className}
                onChange={handleChange}
                error={errors.className}
                required
                placeholder="Class name (e.g., 10th)"
              />
            </div>
          </div>

          {/* Contact and Fee Row */}
          <div style={gridStyle}>
            <div>
              <Input
                label="Contact Number"
                name="contactNo"
                value={form.contactNo}
                onChange={handleChange}
                error={errors.contactNo}
                required
                placeholder="10-digit number"
              />
            </div>
            <div>
              <Input
                label="Fee Amount (₹)"
                name="fee"
                type="number"
                value={form.fee}
                onChange={handleChange}
                error={errors.fee}
                required
                placeholder="Monthly fee"
              />
            </div>
          </div>

          {/* Status */}
          <div style={fieldGroupStyle}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "#fff",
                cursor: "pointer",
                boxSizing: "border-box",
                fontFamily: "'Segoe UI', Roboto, sans-serif",
              }}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Submit Buttons */}
          <div style={buttonsStyle}>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? "Saving..." : id ? "Update Student" : "Add Student"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </StudentLayout>
  );
}