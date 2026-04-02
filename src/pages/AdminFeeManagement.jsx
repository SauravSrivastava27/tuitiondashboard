import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import api from "../api";
import Button from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";
import LoadingSpinner from "../components/LoadingSpinner";
import { feeService } from "../services/apiService";

export default function AdminFeeManagement() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [formData, setFormData] = useState({});

  const loadFees = async () => {
    const feesRes = await feeService.getAll(1, 100, "", "");
    setFees(feesRes.data.fees);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [feesRes, studentsRes] = await Promise.all([
          feeService.getAll(1, 100, "", ""),
          api.get("/api/students?limit=1000"),
        ]);
        setFees(feesRes.data.fees);
        setStudents(studentsRes.data.students || studentsRes.data);
      } catch (err) {
        console.error("Failed to load fees:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAddFee = () => {
    setEditingFee(null);
    setFormData({ studentId: "", amount: "", paidAmount: 0, dueDate: "", paymentMethod: "cash", notes: "" });
    setShowModal(true);
  };

  const handleEditFee = (fee) => {
    setEditingFee(fee);
    setFormData({
      studentId: fee.studentId?._id || fee.studentId,
      amount: fee.amount,
      paidAmount: fee.paidAmount || 0,
      dueDate: fee.dueDate ? new Date(fee.dueDate).toISOString().split("T")[0] : "",
      paymentMethod: fee.paymentMethod || "cash",
      notes: fee.notes || "",
    });
    setShowModal(true);
  };

  const handleSaveFee = async () => {
    try {
      if (!formData.studentId || !formData.amount || !formData.dueDate) {
        alert("Please fill all required fields");
        return;
      }
      const payload = {
        amount: parseFloat(formData.amount),
        paidAmount: parseFloat(formData.paidAmount) || 0,
        dueDate: new Date(formData.dueDate),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      };
      if (editingFee) {
        await feeService.update(editingFee._id, payload);
      } else {
        await feeService.create({ ...payload, studentId: formData.studentId });
      }
      setShowModal(false);
      await loadFees();
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
    }
  };

  const remaining = (parseFloat(formData.amount) || 0) - (parseFloat(formData.paidAmount) || 0);

  const th = {
    padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600",
    color: "#6b7280", backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb",
    textTransform: "uppercase", letterSpacing: "0.5px",
  };
  const td = { padding: "14px 16px", fontSize: "14px", color: "#374151", borderBottom: "1px solid #f3f4f6" };

  return (
    <AdminLayout>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 4px" }}>Fee Management</h1>
            <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>Record and track student fee payments</p>
          </div>
          <Button onClick={handleAddFee}>+ Record Fee Payment</Button>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div style={{ backgroundColor: "#fff", borderRadius: "10px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Student</th>
                  <th style={th}>Total Amount</th>
                  <th style={th}>Paid</th>
                  <th style={th}>Remaining</th>
                  <th style={th}>Due Date</th>
                  <th style={th}>Method</th>
                  <th style={th}>Notes</th>
                  <th style={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fees.map(fee => {
                  const paid = fee.paidAmount || 0;
                  const rem = fee.amount - paid;
                  return (
                    <tr key={fee._id}>
                      <td style={{ ...td, fontWeight: "600" }}>{fee.studentId?.name || "Unknown"}</td>
                      <td style={td}>₹{fee.amount.toLocaleString()}</td>
                      <td style={{ ...td, color: paid > 0 ? "#16a34a" : "#9ca3af", fontWeight: "600" }}>
                        ₹{paid.toLocaleString()}
                      </td>
                      <td style={{ ...td, fontWeight: "700", color: rem <= 0 ? "#16a34a" : "#ef4444" }}>
                        {rem <= 0 ? "✓ Fully Paid" : `₹${rem.toLocaleString()}`}
                      </td>
                      <td style={td}>{new Date(fee.dueDate).toLocaleDateString("en-IN")}</td>
                      <td style={td}>{fee.paymentMethod}</td>
                      <td style={{ ...td, color: "#9ca3af", fontSize: "13px" }}>{fee.notes || "—"}</td>
                      <td style={td}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <Button variant="outline" size="sm" onClick={() => handleEditFee(fee)}>Edit</Button>
                          <Button variant="danger" size="sm" onClick={() => handleDeleteFee(fee._id)}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {fees.length === 0 && (
              <div style={{ padding: "40px", textAlign: "center", color: "#aaa" }}>No fee records found</div>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingFee ? "Edit Fee Record" : "Record Fee Payment"}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* Student */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
              Student *
            </label>
            <select
              value={formData.studentId || ""}
              onChange={(e) => {
                const selected = students.find(s => s._id === e.target.value);
                setFormData({ ...formData, studentId: e.target.value, amount: selected?.fee || "" });
              }}
              disabled={!!editingFee}
              style={{
                width: "100%", padding: "10px 12px", border: "1px solid #d1d5db",
                borderRadius: "6px", fontSize: "14px", boxSizing: "border-box",
                backgroundColor: editingFee ? "#f3f4f6" : "#fff",
                cursor: editingFee ? "not-allowed" : "pointer",
              }}
            >
              <option value="">— Select a student —</option>
              {students.map(s => (
                <option key={s._id} value={s._id}>{s.name} — {s.className} ({s.school})</option>
              ))}
            </select>
          </div>

          <Input
            label="Total Amount (₹) *"
            type="number"
            value={formData.amount || ""}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />

          <Input
            label="Paid Amount (₹)"
            type="number"
            value={formData.paidAmount ?? 0}
            onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
          />

          {/* Live remaining preview */}
          {formData.amount > 0 && (
            <div style={{
              padding: "12px 16px", borderRadius: "8px", fontWeight: "600", fontSize: "14px",
              display: "flex", justifyContent: "space-between",
              backgroundColor: remaining <= 0 ? "#d1fae5" : "#fff7ed",
              color: remaining <= 0 ? "#065f46" : "#92400e",
              border: `1px solid ${remaining <= 0 ? "#6ee7b7" : "#fcd34d"}`,
            }}>
              <span>{remaining <= 0 ? "✓ Fully Paid" : `Remaining: ₹${remaining.toLocaleString()}`}</span>
              <span>Paid: ₹{(parseFloat(formData.paidAmount) || 0).toLocaleString()} / ₹{(parseFloat(formData.amount) || 0).toLocaleString()}</span>
            </div>
          )}

          <Input
            label="Due Date *"
            type="date"
            value={formData.dueDate || ""}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
              Payment Method
            </label>
            <select
              value={formData.paymentMethod || "cash"}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", backgroundColor: "#fff", cursor: "pointer", boxSizing: "border-box" }}
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

          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            <Button onClick={handleSaveFee}>{editingFee ? "Update" : "Save"}</Button>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
