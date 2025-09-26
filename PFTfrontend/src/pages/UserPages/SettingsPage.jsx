// src/pages/UserPages/SettingsPage.jsx
import React from "react";
import DashboardLayout from "../../layouts/UserLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

const SettingsPage = () => {
  return (
    <DashboardLayout activePage="settings">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">⚙️ Settings</h1>
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <button className="p-2 rounded-full hover:bg-gray-100">🔔</button>
          {/* Profile Menu */}
          <img
            src="https://via.placeholder.com/40"
            alt="profile"
            className="w-10 h-10 rounded-full cursor-pointer"
          />
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Account Settings */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">👤 Account Settings</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="border rounded-lg p-2" placeholder="Name" />
              <input className="border rounded-lg p-2" placeholder="Email" />
              <input className="border rounded-lg p-2" placeholder="Username" />
              <input
                type="password"
                className="border rounded-lg p-2"
                placeholder="Password"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Profile Picture</label>
              <input type="file" className="border rounded-lg p-2 w-full" />
            </div>
            <Button>Save Changes</Button>
          </form>
        </Card>

        {/* Preferences */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">🌙 Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Theme</span>
              <select className="border rounded-lg p-2">
                <option>Light</option>
                <option>Dark</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span>Currency</span>
              <select className="border rounded-lg p-2">
                <option>₱</option>
                <option>$</option>
                <option>€</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span>Date Format</span>
              <select className="border rounded-lg p-2">
                <option>MM/DD/YYYY</option>
                <option>DD/MM/YYYY</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span>Notifications</span>
              <select className="border rounded-lg p-2">
                <option>Email</option>
                <option>App Alerts</option>
                <option>Both</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Finance Settings */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">💱 Finance Settings</h2>
          <div className="space-y-3">
            <Button variant="outline">Manage Categories</Button>
            <Button variant="outline">Default Budget Rules</Button>
            <Button variant="outline">Savings Goal Templates</Button>
          </div>
        </Card>

        {/* Data Management */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">📂 Data Management</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">📥 Import Data</Button>
            <Button variant="outline">📤 Export Data</Button>
            <Button variant="outline" className="text-red-600">
              🗑️ Clear Data
            </Button>
          </div>
        </Card>

        {/* Security & Privacy */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">🔒 Security & Privacy</h2>
          <div className="space-y-3">
            <Button variant="outline">Change Password</Button>
            <Button variant="outline">Enable 2FA</Button>
            <div className="text-sm text-blue-600 space-x-4">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </Card>

        {/* Support & Help */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">❓ Support & Help</h2>
          <div className="space-y-3">
            <Button variant="outline">FAQ</Button>
            <Button variant="outline">Contact Support</Button>
            <Button variant="outline">User Guide</Button>
          </div>
        </Card>

        {/* Logout */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">🚪 Logout</h2>
          <Button className="bg-red-600 hover:bg-red-700">Logout</Button>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
