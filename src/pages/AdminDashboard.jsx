import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import api from "../api";
import LoadingSpinner from "../components/LoadingSpinner";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) : "—";

const STATUS_STYLE = {
  active:    "bg-green-100 text-green-700 border-green-300",
  inactive:  "bg-red-100 text-red-600 border-red-300",
  completed: "bg-blue-100 text-blue-700 border-blue-300",
  paid:      "bg-green-100 text-green-700 border-green-300",
  pending:   "bg-yellow-100 text-yellow-700 border-yellow-300",
  overdue:   "bg-red-100 text-red-600 border-red-300",
};

const StatusPill = ({ status }) => (
  <span className={`px-2 py-0.5 border font-black text-[9px] uppercase tracking-widest ${STATUS_STYLE[status] || "bg-gray-100 border-gray-300"}`}>
    {status}
  </span>
);

// Attendance Quick-Mark Modal
function AttendanceModal({ onClose }) {
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [present, setPresent] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/students?limit=200").then(res => setStudents(res.data.students || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedId) return setError("Please select a student");
    setSaving(true);
    setError("");
    try {
      await api.post(`/api/students/${selectedId}/attendance`, { date, present });
      setDone(true);
      setTimeout(onClose, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to mark attendance");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="nb-card max-w-md w-full border-3 border-nb-black shadow-[10px_10px_0px_black]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black uppercase tracking-tighter">📅 Mark Attendance</h3>
          <button onClick={onClose} className="font-black text-xl hover:text-nb-pink transition-colors">✕</button>
        </div>

        {done ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-3">✅</div>
            <p className="font-black uppercase tracking-widest text-nb-green">Attendance Saved!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-nb-black/50 mb-1 block">Student</label>
              <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
                className="nb-input w-full" required>
                <option value="">-- Select Student --</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-nb-black/50 mb-1 block">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="nb-input w-full" required />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-nb-black/50 mb-2 block">Status</label>
              <div className="flex gap-3">
                <button type="button"
                  onClick={() => setPresent(true)}
                  className={`flex-1 py-3 font-black text-sm uppercase tracking-widest border-3 border-nb-black transition-all ${present ? "bg-nb-green shadow-[4px_4px_0px_black]" : "bg-white hover:bg-nb-green/10"}`}>
                  ✅ Present
                </button>
                <button type="button"
                  onClick={() => setPresent(false)}
                  className={`flex-1 py-3 font-black text-sm uppercase tracking-widest border-3 border-nb-black transition-all ${!present ? "bg-nb-pink text-white shadow-[4px_4px_0px_black]" : "bg-white hover:bg-nb-pink/10"}`}>
                  ❌ Absent
                </button>
              </div>
            </div>
            {error && <p className="text-xs font-bold text-nb-pink uppercase">{error}</p>}
            <button type="submit" disabled={saving}
              className="nb-button-primary py-3 font-black text-sm uppercase tracking-widest disabled:opacity-50">
              {saving ? "Saving..." : "Save Attendance"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAttendance, setShowAttendance] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/analytics/dashboard")
      .then(res => setStats(res.data))
      .catch(err => console.error("Dashboard stats error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><LoadingSpinner /></AdminLayout>;
  if (!stats) return <AdminLayout><div className="text-center font-bold text-nb-pink py-12 uppercase tracking-widest">Failed to load dashboard</div></AdminLayout>;

  const { students, fees, users, recentStudents, recentFees } = stats;
  const adminName = localStorage.getItem("name") || "Admin";

  const collectionRate = fees.collectionRate || 0;
  const barColor = collectionRate >= 75 ? "#22c55e" : collectionRate >= 40 ? "#FFE600" : "#ef4444";

  const studentPieData = [
    { name: "Active",    value: students.active,    color: "#22c55e" },
    { name: "Inactive",  value: students.inactive,  color: "#ef4444" },
    { name: "Graduated", value: students.completed, color: "#3b82f6" },
  ].filter(d => d.value > 0);

  const feesPieData = [
    { name: "Paid",    value: fees.paidCount,    color: "#22c55e" },
    { name: "Pending", value: fees.pendingCount, color: "#FFE600" },
    { name: "Overdue", value: fees.overdueCount, color: "#ef4444" },
  ].filter(d => d.value > 0);

  return (
    <AdminLayout>
      {showAttendance && <AttendanceModal onClose={() => setShowAttendance(false)} />}

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">

        {/* Header */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-nb-black/40">Welcome back</p>
          <h1 className="text-5xl font-black uppercase tracking-tighter [text-shadow:3px_3px_0_#FFE600] mt-1">{adminName}</h1>
          <p className="text-xs font-bold text-nb-black/40 uppercase tracking-widest mt-1">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

          {/* Card 1: Students (merged) — click → students page */}
          <button onClick={() => navigate("/admin/students")}
            className="nb-card border-3 border-nb-black shadow-[6px_6px_0px_black] bg-nb-yellow/10 text-left hover:shadow-[3px_3px_0px_black] hover:translate-x-[3px] hover:translate-y-[3px] transition-all group">
            <div className="text-[9px] font-black uppercase tracking-widest text-nb-black/40 mb-2">Students</div>
            <div className="flex items-end justify-between mb-3">
              <div className="text-5xl font-black tracking-tighter leading-none">{students.total}</div>
              <div className="text-3xl group-hover:scale-110 transition-transform">🎓</div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-green-100 text-green-700 border border-green-300">{students.active} Active</span>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-blue-100 text-blue-700 border border-blue-300">{students.completed} Graduated</span>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-red-100 text-red-600 border border-red-300">{students.inactive} Inactive</span>
            </div>
          </button>

          {/* Card 2: Fee Collection — click → fees page */}
          <button onClick={() => navigate("/admin/fees")}
            className="nb-card border-3 border-nb-black shadow-[6px_6px_0px_black] bg-nb-green/5 text-left hover:shadow-[3px_3px_0px_black] hover:translate-x-[3px] hover:translate-y-[3px] transition-all group">
            <div className="text-[9px] font-black uppercase tracking-widest text-nb-black/40 mb-2">Fee Collection</div>
            <div className="flex items-end justify-between mb-3">
              <div>
                <div className="text-3xl font-black tracking-tighter leading-none" style={{ color: barColor }}>{collectionRate}%</div>
                <div className="text-[10px] font-bold text-nb-black/40 mt-0.5">₹{fmt(fees.paid)} / ₹{fmt(fees.total)}</div>
              </div>
              <div className="text-3xl group-hover:scale-110 transition-transform">💰</div>
            </div>
            <div className="w-full h-3 border-2 border-nb-black bg-nb-black/5 overflow-hidden">
              <div className="h-full transition-all duration-700" style={{ width: `${collectionRate}%`, backgroundColor: barColor }} />
            </div>
            <div className="flex gap-3 mt-2 flex-wrap">
              <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-green-100 text-green-700 border border-green-300">{fees.paidCount} Paid</span>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-yellow-100 text-yellow-700 border border-yellow-300">{fees.pendingCount} Pending</span>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-red-100 text-red-600 border border-red-300">{fees.overdueCount} Overdue</span>
            </div>
          </button>

          {/* Card 3: Attendance — click → open modal */}
          <button onClick={() => setShowAttendance(true)}
            className="nb-card border-3 border-nb-black shadow-[6px_6px_0px_black] bg-nb-blue/5 text-left hover:shadow-[3px_3px_0px_black] hover:translate-x-[3px] hover:translate-y-[3px] transition-all group">
            <div className="text-[9px] font-black uppercase tracking-widest text-nb-black/40 mb-2">Attendance</div>
            <div className="flex items-end justify-between mb-3">
              <div className="text-5xl font-black tracking-tighter leading-none">📅</div>
              <div className="text-3xl group-hover:scale-110 transition-transform">✏️</div>
            </div>
            <div className="text-sm font-black uppercase tracking-tight text-nb-blue">Mark Attendance</div>
            <div className="text-[10px] font-bold text-nb-black/40 mt-1">Click to select a student and record today's attendance</div>
          </button>

          {/* Card 4: Reports / Status Chart — click → reports page */}
          <button onClick={() => navigate("/admin/reports")}
            className="nb-card border-3 border-nb-black shadow-[6px_6px_0px_black] bg-nb-pink/5 text-left hover:shadow-[3px_3px_0px_black] hover:translate-x-[3px] hover:translate-y-[3px] transition-all group p-4">
            <div className="text-[9px] font-black uppercase tracking-widest text-nb-black/40 mb-1">Reports</div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-black tracking-tighter">Fee Status</span>
              <span className="text-lg group-hover:scale-110 transition-transform">📊</span>
            </div>
            {feesPieData.length > 0 ? (
              <div className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={feesPieData} dataKey="value" cx="50%" cy="50%" outerRadius={44} innerRadius={22} paddingAngle={3}>
                      {feesPieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="#000" strokeWidth={1.5} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ fontWeight: "bold", fontSize: 11, border: "2px solid black" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-28 flex items-center justify-center text-[10px] font-bold text-nb-black/30 uppercase">No fee data</div>
            )}
            <div className="flex gap-3 flex-wrap mt-1">
              {feesPieData.map(d => (
                <span key={d.name} className="flex items-center gap-1 text-[9px] font-black uppercase">
                  <span className="w-2 h-2 rounded-full border border-nb-black/30 flex-shrink-0" style={{ background: d.color }} />
                  {d.name}
                </span>
              ))}
            </div>
          </button>
        </div>

        {/* Two-column: Recent Enrollments + Recent Fee Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Recent Enrollments */}
          <div className="nb-card border-3 border-nb-black shadow-[6px_6px_0px_black] p-0 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b-3 border-nb-black bg-nb-yellow/30">
              <span className="text-xs font-black uppercase tracking-widest">Recent Enrollments</span>
              <button onClick={() => navigate("/admin/students")}
                className="text-[9px] font-black uppercase tracking-widest text-nb-black/40 hover:text-nb-black transition-colors">
                View All →
              </button>
            </div>
            {recentStudents.length === 0 ? (
              <div className="p-8 text-center text-xs font-bold text-nb-black/40 uppercase">No students yet</div>
            ) : (
              <div className="divide-y-2 divide-nb-black/10">
                {recentStudents.map(s => (
                  <div key={s._id} className="flex items-center justify-between px-6 py-3 hover:bg-nb-yellow/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 border-2 border-nb-black bg-nb-yellow flex items-center justify-center font-black text-sm flex-shrink-0">
                        {s.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="font-black text-sm uppercase tracking-tight leading-none">{s.name}</div>
                        <div className="text-[10px] text-nb-black/40 font-bold mt-0.5">{fmtDate(s.joinDate)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {s.fee > 0 && <span className="text-xs font-black text-nb-black/60">₹{fmt(s.fee)}/mo</span>}
                      <StatusPill status={s.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Fee Activity */}
          <div className="nb-card border-3 border-nb-black shadow-[6px_6px_0px_black] p-0 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b-3 border-nb-black bg-nb-green/20">
              <span className="text-xs font-black uppercase tracking-widest">Recent Fee Activity</span>
              <button onClick={() => navigate("/admin/fees")}
                className="text-[9px] font-black uppercase tracking-widest text-nb-black/40 hover:text-nb-black transition-colors">
                View All →
              </button>
            </div>
            {recentFees.length === 0 ? (
              <div className="p-8 text-center text-xs font-bold text-nb-black/40 uppercase">No fee records yet</div>
            ) : (
              <div className="divide-y-2 divide-nb-black/10">
                {recentFees.map(f => (
                  <div key={f._id} className="flex items-center justify-between px-6 py-3 hover:bg-nb-green/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 border-2 border-nb-black bg-nb-green/20 flex items-center justify-center font-black text-sm flex-shrink-0">
                        {f.studentName?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="font-black text-sm uppercase tracking-tight leading-none">{f.studentName}</div>
                        <div className="text-[10px] text-nb-black/40 font-bold mt-0.5">
                          Due: {fmtDate(f.dueDate)}{f.paidDate ? ` · Paid: ${fmtDate(f.paidDate)}` : ""}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-black">₹{fmt(f.amount)}</div>
                        {f.paidAmount > 0 && f.paidAmount < f.amount && (
                          <div className="text-[10px] font-bold text-nb-black/40">Paid: ₹{fmt(f.paidAmount)}</div>
                        )}
                      </div>
                      <StatusPill status={f.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="nb-card border-3 border-nb-black shadow-[6px_6px_0px_black]">
          <div className="text-[9px] font-black uppercase tracking-widest text-nb-black/40 mb-4">Quick Actions</div>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => navigate("/admin/students")} className="nb-button-primary text-xs !px-6 py-3">+ Add Student</button>
            <button onClick={() => navigate("/admin/fees")} className="nb-button-secondary text-xs !px-6 py-3">₹ Record Payment</button>
            <button onClick={() => setShowAttendance(true)} className="nb-button-accent text-xs !px-6 py-3">📅 Mark Attendance</button>
            <button onClick={() => navigate("/admin/users")}
              className="border-3 border-nb-black bg-white font-black text-xs px-6 py-3 shadow-[4px_4px_0px_black] hover:shadow-[2px_2px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-widest">
              👤 Manage Users
            </button>
            <button onClick={() => navigate("/admin/reports")}
              className="border-3 border-nb-black bg-white font-black text-xs px-6 py-3 shadow-[4px_4px_0px_black] hover:shadow-[2px_2px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-widest">
              📊 Reports
            </button>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
