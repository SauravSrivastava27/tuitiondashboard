import { useEffect, useState } from "react";
import StudentLayout from "../layouts/StudentLayout";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import Badge from "../components/Badge";
import LoadingSpinner from "../components/LoadingSpinner";
import { getUsername } from "../utils/auth";
import "../styles/pages/StudentProfile.scss";

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const username = getUsername();
    setProfile({ username });
    setFormData({ username });
    setLoading(false);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      setMessage("");
      setMessage("Profile updated successfully");
      setProfile(formData);
      setIsEditing(false);
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("Error updating profile");
    }
  };

  if (loading) return <StudentLayout><LoadingSpinner /></StudentLayout>;
  if (!profile) return <StudentLayout><div style={{ textAlign: "center", color: "#888" }}>Failed to load profile</div></StudentLayout>;

  return (
    <StudentLayout>
      <div>
        <h1 className="student-profile__title">My Profile</h1>
        <p className="student-profile__subtitle">Manage your account settings</p>

        {message && (
          <div className={`student-profile__banner student-profile__banner--${message.includes("Error") ? "error" : "success"}`}>
            {message}
          </div>
        )}

        <Card title="👤 Account Information">
          <div className="student-profile__account-info">
            {isEditing ? (
              <>
                <Input label="Username" name="username" value={formData.username || ""} onChange={handleChange} disabled />
                <div className="student-profile__edit-actions">
                  <Button onClick={handleSave}>Save Changes</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <div className="student-profile__field-label">Username</div>
                  <div className="student-profile__field-value">{profile.username}</div>
                </div>
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              </>
            )}
          </div>
        </Card>

        <Card title="🔒 Security">
          <div className="student-profile__account-info">
            <p className="student-profile__security-text">Keep your account secure by using a strong password and enabling 2-factor authentication.</p>
            <Button variant="secondary" size="sm">Change Password</Button>
          </div>
        </Card>

        <Card title="🔐 Two-Factor Authentication">
          <div className="student-profile__account-info">
            <p className="student-profile__security-text">Two-factor authentication adds an extra layer of security to your account.</p>
            <Badge status="active">Enabled</Badge>
            <div className="student-profile__2fa-actions">
              <Button variant="secondary" size="sm">View Secret</Button>
            </div>
          </div>
        </Card>

        <Card title="📋 Recent Login Activity">
          <div className="student-profile__login-activity">
            <p>Last login: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
            <p className="student-profile__login-note">Currently logged in from this device</p>
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
}
