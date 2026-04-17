import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import api from "../api";
import Button from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";
import LoadingSpinner from "../components/LoadingSpinner";
import { feeService } from "../services/apiService";
import "../styles/pages/AdminFeeManagement.scss";

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
      if (!formData.studentId || !formData.amount || !formData.dueDate) { alert("Please fill all required fields"); return; }
      const payload = {
        amount: parseFloat(formData.amount),
        paidAmount: parseFloat(formData.paidAmount) || 0,
        dueDate: new Date(formData.dueDate),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      };
      if (editingFee) { await feeService.update(editingFee._id, payload); }
      else { await feeService.create({ ...payload, studentId: formData.studentId }); }
      setShowModal(false);
      await loadFees();
    } catch (err) { console.error("Failed to save fee:", err); alert("Error saving fee"); }
  };

  const handleDeleteFee = async (feeId) => {
    if (!window.confirm("Delete this fee record?")) return;
    try { await feeService.delete(feeId); setFees(fees.filter(f => f._id !== feeId)); }
    catch (err) { console.error("Failed to delete fee:", err); }
  };

  const remaining = (parseFloat(formData.amount) || 0) - (parseFloat(formData.paidAmount) || 0);

  return (
    <AdminLayout>
      <div>
        <div className="admin-fee-mgmt__header">
          <div>
            <h1 className="admin-fee-mgmt__title">Fee Management</h1>
            <p className="admin-fee-mgmt__subtitle">Record and track student fee payments</p>
          </div>
          <Button onClick={handleAddFee}>+ Record Fee Payment</Button>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="admin-fee-mgmt__table-wrapper">
            <table className="admin-fee-mgmt__table">
              <thead>
                <tr>
                  {["Student", "Total Amount", "Paid", "Remaining", "Due Date", "Method", "Notes", "Actions"].map(h => (
                    <th key={h} className="admin-fee-mgmt__th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fees.map(fee => {
                  const paid = fee.paidAmount || 0;
                  const rem = fee.amount - paid;
                  return (
                    <tr key={fee._id}>
                      <td className="admin-fee-mgmt__td admin-fee-mgmt__td--bold">{fee.studentId?.name || "Unknown"}</td>
                      <td className="admin-fee-mgmt__td">₹{fee.amount.toLocaleString()}</td>
                      <td className={`admin-fee-mgmt__td ${paid > 0 ? "admin-fee-mgmt__td--paid" : "admin-fee-mgmt__td--unpaid"}`}>₹{paid.toLocaleString()}</td>
                      <td className={`admin-fee-mgmt__td ${rem <= 0 ? "admin-fee-mgmt__td--remaining-paid" : "admin-fee-mgmt__td--remaining-due"}`}>
                        {rem <= 0 ? "✓ Fully Paid" : `₹${rem.toLocaleString()}`}
                      </td>
                      <td className="admin-fee-mgmt__td">{new Date(fee.dueDate).toLocaleDateString("en-IN")}</td>
                      <td className="admin-fee-mgmt__td">{fee.paymentMethod}</td>
                      <td className="admin-fee-mgmt__td admin-fee-mgmt__td--notes">{fee.notes || "—"}</td>
                      <td className="admin-fee-mgmt__td">
                        <div className="admin-fee-mgmt__row-actions">
                          <Button variant="outline" size="sm" onClick={() => handleEditFee(fee)}>Edit</Button>
                          <Button variant="danger" size="sm" onClick={() => handleDeleteFee(fee._id)}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {fees.length === 0 && <div className="admin-fee-mgmt__empty">No fee records found</div>}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingFee ? "Edit Fee Record" : "Record Fee Payment"}>
        <div className="admin-fee-mgmt__modal-form">
          <div>
            <label className="admin-fee-mgmt__modal-label">Student *</label>
            <select
              value={formData.studentId || ""}
              onChange={(e) => {
                const selected = students.find(s => s._id === e.target.value);
                setFormData({ ...formData, studentId: e.target.value, amount: selected?.fee || "" });
              }}
              disabled={!!editingFee}
              className={`admin-fee-mgmt__modal-select admin-fee-mgmt__modal-select--${editingFee ? "disabled" : "enabled"}`}
            >
              <option value="">— Select a student —</option>
              {students.map(s => <option key={s._id} value={s._id}>{s.name} — {s.className} ({s.school})</option>)}
            </select>
          </div>

          <Input label="Total Amount (₹) *" type="number" value={formData.amount || ""} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
          <Input label="Paid Amount (₹)" type="number" value={formData.paidAmount ?? 0} onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })} />

          {formData.amount > 0 && (
            <div className={`admin-fee-mgmt__remaining-preview admin-fee-mgmt__remaining-preview--${remaining <= 0 ? "paid" : "due"}`}>
              <span>{remaining <= 0 ? "✓ Fully Paid" : `Remaining: ₹${remaining.toLocaleString()}`}</span>
              <span>Paid: ₹{(parseFloat(formData.paidAmount) || 0).toLocaleString()} / ₹{(parseFloat(formData.amount) || 0).toLocaleString()}</span>
            </div>
          )}

          <Input label="Due Date *" type="date" value={formData.dueDate || ""} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />

          <div>
            <label className="admin-fee-mgmt__modal-label">Payment Method</label>
            <select value={formData.paymentMethod || "cash"} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} className="admin-fee-mgmt__modal-select admin-fee-mgmt__modal-select--enabled">
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="online">Online</option>
              <option value="other">Other</option>
            </select>
          </div>

          <Input label="Notes" value={formData.notes || ""} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />

          <div className="admin-fee-mgmt__modal-actions">
            <Button onClick={handleSaveFee}>{editingFee ? "Update" : "Save"}</Button>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
