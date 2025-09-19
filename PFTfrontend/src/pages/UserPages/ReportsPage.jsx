// src/pages/UserPages/ReportsPage.jsx
import React from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const ReportsPage = () => {
  // Dummy data for charts
  const expenseData = [
    { name: "Food", value: 4000 },
    { name: "Transport", value: 2000 },
    { name: "Bills", value: 3000 },
    { name: "Entertainment", value: 1500 },
  ];

  const incomeExpenseData = [
    { month: "Jan", income: 12000, expenses: 8000 },
    { month: "Feb", income: 15000, expenses: 10000 },
    { month: "Mar", income: 14000, expenses: 9000 },
  ];

  const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"];

  return (
    <DashboardLayout activePage="reports">
      {/* Topbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-2">
          <input type="date" className="border rounded-lg p-2 text-sm" />
          <input type="date" className="border rounded-lg p-2 text-sm" />
        </div>
        <div className="flex space-x-2">
          <Button>📥 Export PDF/CSV</Button>
          <Button variant="outline">🖨️ Print</Button>
        </div>
      </div>

      {/* Page Title & Quick Actions */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📈 Reports & Analytics</h1>
        <div className="space-x-2">
          <Button>📊 Generate Report</Button>
          <Button variant="outline">📥 Export Report</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <h2 className="font-semibold">💰 Total Income</h2>
          <p className="text-2xl font-bold text-green-600">₱42,000</p>
        </Card>
        <Card>
          <h2 className="font-semibold">💸 Total Expenses</h2>
          <p className="text-2xl font-bold text-red-600">₱28,500</p>
        </Card>
        <Card>
          <h2 className="font-semibold">🏦 Net Balance</h2>
          <p className="text-2xl font-bold text-blue-600">₱13,500</p>
        </Card>
        <Card>
          <h2 className="font-semibold">🎯 Savings Achieved</h2>
          <p className="text-2xl font-bold text-purple-600">₱8,000</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Pie Chart */}
        <Card>
          <h2 className="font-semibold mb-4">Expense Breakdown</h2>
          <PieChart width={300} height={300}>
            <Pie
              data={expenseData}
              dataKey="value"
              nameKey="name"
              outerRadius={120}
              fill="#8884d8"
              label
            >
              {expenseData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </Card>

        {/* Line/Bar Chart */}
        <Card>
          <h2 className="font-semibold mb-4">Income vs Expenses</h2>
          <LineChart width={400} height={300} data={incomeExpenseData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#10B981" />
            <Line type="monotone" dataKey="expenses" stroke="#EF4444" />
          </LineChart>
        </Card>
      </div>

      {/* Budget Utilization */}
      <Card className="mb-8">
        <h2 className="font-semibold mb-4">Budget Utilization</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm mb-1">Food</p>
            <Progress value={70} />
          </div>
          <div>
            <p className="text-sm mb-1">Transport</p>
            <Progress value={50} />
          </div>
          <div>
            <p className="text-sm mb-1">Bills</p>
            <Progress value={90} />
          </div>
        </div>
      </Card>

      {/* Tables */}
      <div className="space-y-8">
        <Card>
          <h2 className="font-semibold mb-4">Income Report</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2">Source</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-2">Salary</td>
                <td className="p-2">₱15,000</td>
                <td className="p-2">2025-09-01</td>
              </tr>
              <tr className="border-t">
                <td className="p-2">Freelance</td>
                <td className="p-2">₱5,000</td>
                <td className="p-2">2025-09-10</td>
              </tr>
            </tbody>
          </table>
        </Card>

        <Card>
          <h2 className="font-semibold mb-4">Expense Report</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2">Category</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-2">Food</td>
                <td className="p-2">₱4,000</td>
                <td className="p-2">2025-09-05</td>
              </tr>
              <tr className="border-t">
                <td className="p-2">Transport</td>
                <td className="p-2">₱2,000</td>
                <td className="p-2">2025-09-08</td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
