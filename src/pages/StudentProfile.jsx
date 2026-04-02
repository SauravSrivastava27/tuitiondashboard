import React, { useEffect, useState } from "react";
import StudentLayout from "../layouts/StudentLayout";
import api from "../api";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import { getUsername } from "../utils/auth";

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    // In a real app, we'd fetch user profile from /api/users/:id
    // For now, we'll just show the localStorage data
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
      // In a real app, would call api.put("/api/users/:id/profile", formData)
      setMessage("Profile updated successfully");
      setProfile(formData);
      setIsEditing(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Error updating profile");
    }
  };

  if (loading) return <StudentLayout><LoadingSpinner /></StudentLayout>;
  if (!profile) return <StudentLayout><div style={{ textAlign: "center", color: "#888" }}>Failed to load profile</div></StudentLayout>;

  return (
    <StudentLayout>
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 6px" }}>
          My Profile
        </h1>
        <p style={{ fontSize: "14px", color: "#666", margin: "0 0 24px" }}>
          Manage your account settings
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

        {/* Account Information */}
        <Card title="👤 Account Information">
          <div style={{ maxWidth: "400px" }}>
            {isEditing ? (
              <>
                <Input
                  label="Username"
                  name="username"
                  value={formData.username || ""}
                  onChange={handleChange}
                  disabled
                />
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <Button onClick={handleSave}>Save Changes</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              </>
            ) : (
              <>
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>Username</div>
                  <div style={{ fontSize: "16px", fontWeight: "600", color: "#1a1a2e" }}>{profile.username}</div>
                </div>
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              </>
            )}
          </div>
        </Card>

        {/* Security */}
        <Card title="🔒 Security">
          <div style={{ maxWidth: "400px" }}>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}>
              Keep your account secure by using a strong password and enabling 2-factor authentication.
            </p>
            <Button variant="secondary" size="sm">
              Change Password
            </Button>
          </div>
        </Card>

        {/* 2FA Settings */}
        <Card title="🔐 Two-Factor Authentication">
          <div style={{ maxWidth: "400px" }}>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}>
              Two-factor authentication adds an extra layer of security to your account.
            </p>
            <Badge status="active">Enabled</Badge>
            <div style={{ marginTop: "16px" }}>
              <Button variant="secondary" size="sm">
                View Secret
              </Button>
            </div>
          </div>
        </Card>

        {/* Login History */}
        <Card title="📋 Recent Login Activity">
          <div style={{ fontSize: "14px", color: "#666" }}>
            <p>Last login: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
            <p style={{ fontSize: "12px", color: "#999", margin: 0 }}>
              Currently logged in from this device
            </p>
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
}
