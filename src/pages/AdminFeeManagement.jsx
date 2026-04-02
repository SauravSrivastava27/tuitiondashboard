import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import api from "../api";
import Button from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";
import Badge from "../components/Badge";
import LoadingSpinner from "../components/LoadingSpinner";
import { feeService, studentService } from "../services/apiService";

export default function AdminFeeManagement() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [feesRes] = await Promise.all([
          feeService.getAll(1, 100, "", status)
        ]);
        setFees(feesRes.data.fees);
      } catch (err) {
        console.error("Failed to load fees:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [status]);

  const handleAddFee = () => {
    setFormData({
      studentId: "",
      amount: "",
      dueDate: "",
      paymentMethod: "cash",
      notes: ""
    });
    setShowModal(true);
  };

  const handleSaveFee = async () => {
    try {
      if (!formData.studentId || !formData.amount || !formData.dueDate) {
        alert("Please fill all required fields");
        return;
      }

      await feeService.create({
        studentId: formData.studentId,
        amount: parseFloat(formData.amount),
        dueDate: new Date(formData.dueDate),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      });

      setShowModal(false);
      const feesRes = await feeService.getAll(1, 100, "", status);
      setFees(feesRes.data.fees);
    } catch (err) {
      console.error("Failed to save fee:", err);
      alert("Error saving fee");
    }
  };

  const handleDeleteFee = async (feeId) => {
    if (!window.confirm("Delete this fee record?")) return;
    try {
      await feeService.delete(feeId);
      setFees(fees.filter(f => f._id !== feeId));
    } catch (err) {
      console.error("Failed to delete fee:", err);
      alert("Error deleting fee");
    }
  };

  const handleStatusChange = async (feeId, newStatus) => {
    try {
      await feeService.update(feeId, { status: newStatus });
      setFees(fees.map(f => f._id === feeId ? { ...f, status: newStatus } : f));
    } catch (err) {
      console.error("Failed to update fee status:", err);
      alert("Error updating fee status");
    }
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
  };

  const thStyle = {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  const tdStyle = {
    padding: "14px 16px",
    fontSize: "14px",
    color: "#374151",
    borderBottom: "1px solid #f3f4f6",
  };

  return (
    <AdminLayout>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 4px" }}>
              Fee Management
            </h1>
            <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
              Record and track student fees
            </p>
          </div>
          <Button onClick={handleAddFee}>+ Record Fee Payment</Button>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              backgroundColor: "#fff",
              cursor: "pointer"
            }}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "10px",
            boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
            overflow: "hidden"
          }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Student</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Due Date</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Payment Method</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fees.map(fee => (
                  <tr key={fee._id}>
                    <td style={tdStyle}>
                      {fee.studentId?.name || "Unknown"}
                    </td>
                    <td style={tdStyle}>₹{fee.amount}</td>
                    <td style={tdStyle}>
                      {new Date(fee.dueDate).toLocaleDateString()}
                    </td>
                    <td style={tdStyle}>
                      <select
                        value={fee.status}
                        onChange={(e) => handleStatusChange(fee._id, e.target.value)}
                        style={{
                          padding: "4px 8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          fontSize: "12px",
                          backgroundColor: "#fff",
                          cursor: "pointer"
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </td>
                    <td style={tdStyle}>{fee.paymentMethod}</td>
                    <td style={tdStyle}>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteFee(fee._id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {fees.length === 0 && (
              <div style={{ padding: "40px", textAlign: "center", color: "#aaa" }}>
                No fees found
              </div>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Fee Payment">
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
              Student
            </label>
            <input
              type="text"
              placeholder="Student ID"
              value={formData.studentId || ""}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
            />
          </div>
          <Input
            label="Amount"
            type="number"
            value={formData.amount || ""}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate || ""}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
          />
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
              Payment Method
            </label>
            <select
              value={formData.paymentMethod || "cash"}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "#fff",
                cursor: "pointer",
                boxSizing: "border-box"
              }}
            >
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="online">Online</option>
              <option value="other">Other</option>
            </select>
          </div>
          <Input
            label="Notes"
            value={formData.notes || ""}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <Button onClick={handleSaveFee}>Save</Button>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
