// src/pages/UserPages/SavingsPage.jsx
import { useState, useMemo } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { Plus, Edit, Trash, Download } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

export default function SavingsPage() {
  // Example savings goals (dummy data)
  const [goals] = useState([
    {
      id: 1,
      name: "Emergency Fund",
      target: 50000,
      saved: 20000,
      deadline: "2025-12-31",
      status: "On Track",
    },
    {
      id: 2,
      name: "New Laptop",
      target: 60000,
      saved: 60000,
      deadline: "2025-07-01",
      status: "Completed",
    },
    {
      id: 3,
      name: "Vacation",
      target: 40000,
      saved: 10000,
      deadline: "2025-11-30",
      status: "Behind",
    },
  ]);

  // Chart data
  const progressData = useMemo(() => {
    const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);
    const totalSaved = goals.reduce((sum, g) => sum + g.saved, 0);
    return [
      { name: "Saved", value: totalSaved },
      { name: "Remaining", value: totalTarget - totalSaved },
    ];
  }, [goals]);

  const barData = useMemo(() => {
    return goals.map((g) => ({
      name: g.name,
      Saved: g.saved,
      Target: g.target,
    }));
  }, [goals]);

  const COLORS = ["#10B981", "#F87171"];

  return (
    <DashboardLayout active="savings">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search savings goals..."
            className="border rounded-md px-3 py-2 w-64"
          />
          <select className="border rounded-md px-3 py-2">
            <option>Sort by Goal Amount</option>
            <option>Sort by Progress</option>
            <option>Sort by Deadline</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download size={16} /> Export
          </Button>
          {/* Profile + Notifications placeholder */}
          <div className="w-10 h-10 rounded-full bg-gray-300"></div>
        </div>
      </div>

      {/* Page Title & Quick Actions */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🎯 Savings Goals</h1>
        <Button className="flex items-center gap-2">
          <Plus size={16} /> Add New Goal
        </Button>
      </div>

      {/* Active Goals (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {goals.map((goal) => {
          const remaining = goal.target - goal.saved;
          const progress = (goal.saved / goal.target) * 100;
          return (
            <Card key={goal.id}>
              <CardHeader>
                <CardTitle>{goal.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Target: ₱{goal.target.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Saved: ₱{goal.saved.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Remaining: ₱{remaining.toLocaleString()}
                </p>
                <Progress value={progress} className="my-2" />
                <p className="text-sm">Deadline: {goal.deadline}</p>
                <p
                  className={`text-sm font-semibold ${
                    goal.status === "Completed"
                      ? "text-green-600"
                      : goal.status === "Behind"
                      ? "text-red-600"
                      : "text-blue-600"
                  }`}
                >
                  Status: {goal.status}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Savings Table */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Detailed Goals</h2>
        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2 border">Goal Name</th>
                <th className="px-4 py-2 border">Target</th>
                <th className="px-4 py-2 border">Saved</th>
                <th className="px-4 py-2 border">Remaining</th>
                <th className="px-4 py-2 border">Deadline</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {goals.map((goal) => {
                const remaining = goal.target - goal.saved;
                return (
                  <tr key={goal.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{goal.name}</td>
                    <td className="px-4 py-2 border">
                      ₱{goal.target.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 border">
                      ₱{goal.saved.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 border">
                      ₱{remaining.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 border">{goal.deadline}</td>
                    <td className="px-4 py-2 border">{goal.status}</td>
                    <td className="px-4 py-2 border flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit size={14} />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Trash size={14} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights Section with Recharts */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Savings Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={progressData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    label
                  >
                    {progressData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Savings per Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Target" fill="#93C5FD" />
                  <Bar dataKey="Saved" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">💡 Savings Tips</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Add ₱500 weekly to reach your Vacation goal by December.</li>
          <li>You’ve completed 2 out of 5 goals this year!</li>
        </ul>
      </div>

      {/* Footer */}
      <footer className="border-t pt-4 mt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Personal Finance Tracker. All rights
        reserved.
      </footer>
    </DashboardLayout>
  );
}
