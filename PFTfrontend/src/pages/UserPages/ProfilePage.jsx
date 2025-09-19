// src/pages/UserPages/ProfilePage.jsx
import React from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

const ProfilePage = () => {
  return (
    <DashboardLayout activePage="settings">
      {/* Page Title */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">👤 Profile</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Picture */}
        <Card>
          <div className="flex flex-col items-center p-6">
            <img
              src="https://via.placeholder.com/120"
              alt="profile"
              className="w-32 h-32 rounded-full mb-4"
            />
            <input type="file" className="mb-4 text-sm" />
            <Button>Update Picture</Button>
          </div>
        </Card>

        {/* Profile Info */}
        <Card className="md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                className="border rounded-lg p-2"
              />
              <input
                type="email"
                placeholder="Email"
                className="border rounded-lg p-2"
              />
              <input
                type="text"
                placeholder="Username"
                className="border rounded-lg p-2"
              />
              <input
                type="password"
                placeholder="Password"
                className="border rounded-lg p-2"
              />
            </div>
            <Button>Save Changes</Button>
          </form>
        </Card>
      </div>

      {/* Security Section */}
      <div className="mt-6">
        <Card>
          <h2 className="text-lg font-semibold mb-4">🔒 Security</h2>
          <div className="space-y-3">
            <Button variant="outline">Change Password</Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
