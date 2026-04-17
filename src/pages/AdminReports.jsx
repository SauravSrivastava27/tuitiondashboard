import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import Card from "../components/Card";
import LoadingSpinner from "../components/LoadingSpinner";
import { analyticsService } from "../services/apiService";
import "../styles/pages/AdminReports.scss";

export default function AdminReports() {
  const [feeSummary, setFeeSummary] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const [feeRes, activityRes] = await Promise.all([
          analyticsService.getFeeSummary(),
          analyticsService.getRecentActivity()
        ]);
        setFeeSummary(feeRes.data);
        setRecentActivity(activityRes.data);
      } catch (err) {
        console.error("Failed to load reports:", err);
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  if (loading) return <AdminLayout><LoadingSpinner /></AdminLayout>;

  return (
    <AdminLayout>
      <div>
        <h1 className="admin-reports__title">Reports & Analytics</h1>
        <p className="admin-reports__subtitle">Detailed reports and analytics of your tuition business</p>

        <Card title="💰 Fee Collection Summary" icon="📊">
          {feeSummary?.summary && (
            <div className="admin-reports__summary-grid">
              {feeSummary.summary.map((item) => (
                <div key={item._id} className="admin-reports__summary-item">
                  <div className="admin-reports__summary-label">{item._id} Fees</div>
                  <div className="admin-reports__summary-count">{item.count} payments</div>
                  <div className="admin-reports__summary-amount">₹{item.total.toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
          <div className="admin-reports__total-row">
            <span className="admin-reports__total-label">Total Collected</span>
            <span className="admin-reports__total-value">₹{feeSummary?.totalCollected?.toLocaleString() || 0}</span>
          </div>
        </Card>

        <Card title="📈 Monthly Fee Collection">
          {feeSummary?.byMonth && feeSummary.byMonth.length > 0 ? (
            <div className="admin-reports__table-wrapper">
              <table className="admin-reports__table">
                <thead>
                  <tr>
                    <th className="admin-reports__th">Month/Year</th>
                    <th className="admin-reports__th">Payments</th>
                    <th className="admin-reports__th">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {feeSummary.byMonth.map((item) => (
                    <tr key={`${item._id.year}-${item._id.month}`}>
                      <td className="admin-reports__td">
                        {new Date(item._id.year, item._id.month - 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                      </td>
                      <td className="admin-reports__td">{item.count}</td>
                      <td className="admin-reports__td">₹{item.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-reports__empty">No monthly data available</div>
          )}
        </Card>

        {recentActivity && (
          <>
            <Card title="📚 Recent Students">
              {recentActivity.recentStudents?.length > 0 ? (
                <table className="admin-reports__table">
                  <thead>
                    <tr>
                      <th className="admin-reports__th">Name</th>
                      <th className="admin-reports__th">Status</th>
                      <th className="admin-reports__th">Join Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.recentStudents.map((student) => (
                      <tr key={student._id}>
                        <td className="admin-reports__td">{student.name}</td>
                        <td className="admin-reports__td">
                          <span className={`admin-reports__status-badge admin-reports__status-badge--${student.status}`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="admin-reports__td">{new Date(student.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="admin-reports__empty">No recent students</div>
              )}
            </Card>

            <Card title="💳 Recent Fees">
              {recentActivity.recentFees?.length > 0 ? (
                <table className="admin-reports__table">
                  <thead>
                    <tr>
                      <th className="admin-reports__th">Student</th>
                      <th className="admin-reports__th">Amount</th>
                      <th className="admin-reports__th">Status</th>
                      <th className="admin-reports__th">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.recentFees.map((fee) => (
                      <tr key={fee._id}>
                        <td className="admin-reports__td">{fee.studentId?.name || "Unknown"}</td>
                        <td className="admin-reports__td">₹{fee.amount}</td>
                        <td className="admin-reports__td">
                          <span className={`admin-reports__status-badge admin-reports__status-badge--${fee.status}`}>
                            {fee.status}
                          </span>
                        </td>
                        <td className="admin-reports__td">{new Date(fee.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="admin-reports__empty">No recent fees</div>
              )}
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
