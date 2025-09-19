// src/pages/UserPages/BudgetsPage.jsx
import React from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { Plus, Edit, Trash2 } from "lucide-react";

// Sample Data
const budgets = [
  { category: "Food", allocated: 8000, spent: 6000 },
  { category: "Transport", allocated: 4000, spent: 3500 },
  { category: "Entertainment", allocated: 3000, spent: 3200 },
  { category: "Rent", allocated: 10000, spent: 10000 },
];

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"];

const BudgetsPage = () => {
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📊 Budgets</h1>
        <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
          <Plus size={18} /> Add New Budget
        </Button>
      </div>

      {/* Active Budgets Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {budgets.map((b, i) => {
          const remaining = b.allocated - b.spent;
          const percent = Math.min((b.spent / b.allocated) * 100, 100);
          let status = "✅ On Track";
          if (b.spent >= b.allocated) status = "❌ Overspent";
          else if (percent > 80) status = "⚠️ Near Limit";

          return (
            <Card key={i} className="p-4 shadow-md">
              <CardContent>
                <h2 className="font-semibold text-lg">{b.category}</h2>
                <p className="text-sm text-gray-500">
                  Allocated: ₱{b.allocated.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Spent: ₱{b.spent.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Remaining: ₱{remaining.toLocaleString()}
                </p>
                <Progress value={percent} className="mt-2" />
                <p className="mt-2 text-sm font-medium">{status}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Budget Table */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Budget Details</h2>
        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Allocated</th>
                <th className="px-4 py-3">Spent</th>
                <th className="px-4 py-3">Remaining</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((b, i) => {
                const remaining = b.allocated - b.spent;
                let status = "✅ On Track";
                if (b.spent >= b.allocated) status = "❌ Overspent";
                else if (b.spent / b.allocated > 0.8) status = "⚠️ Near Limit";

                return (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{b.category}</td>
                    <td className="px-4 py-3">
                      ₱{b.allocated.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">₱{b.spent.toLocaleString()}</td>
                    <td className="px-4 py-3">₱{remaining.toLocaleString()}</td>
                    <td className="px-4 py-3">{status}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit size={16} />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Pie Chart */}
        <Card className="p-4">
          <h2 className="font-semibold mb-4">Budget Distribution</h2>
          <PieChart width={350} height={300}>
            <Pie
              data={budgets}
              dataKey="allocated"
              nameKey="category"
              outerRadius={120}
              fill="#8884d8"
              label
            >
              {budgets.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </Card>

        {/* Bar Chart */}
        <Card className="p-4">
          <h2 className="font-semibold mb-4">Budget vs Spending</h2>
          <BarChart width={400} height={300} data={budgets}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="allocated" fill="#3B82F6" name="Allocated" />
            <Bar dataKey="spent" fill="#EF4444" name="Spent" />
          </BarChart>
        </Card>
      </div>

      {/* Recommendations */}
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h2 className="font-semibold text-lg mb-2">
          💡 Budget Recommendations
        </h2>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>
            ⚠️ You’re overspending on Entertainment. Consider adjusting this
            budget.
          </li>
          <li>✅ Great job! You saved ₱500 in Transport this month.</li>
        </ul>
      </div>
    </DashboardLayout>
  );
};

export default BudgetsPage;
