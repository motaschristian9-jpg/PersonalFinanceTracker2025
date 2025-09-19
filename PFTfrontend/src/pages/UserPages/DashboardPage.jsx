import DashboardLayout from "../../layouts/DashboardLayout";
import { PlusCircle, MinusCircle, PieChart, Target } from "lucide-react";
import {
  PieChart as RePieChart,
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

export default function Dashboard() {
  // Sample chart data
  const expenseData = [
    { name: "Food", value: 400 },
    { name: "Transport", value: 200 },
    { name: "Shopping", value: 300 },
    { name: "Bills", value: 250 },
  ];

  const incomeExpenseData = [
    { month: "Jan", income: 4000, expenses: 2400 },
    { month: "Feb", income: 4200, expenses: 2600 },
    { month: "Mar", income: 3900, expenses: 2800 },
    { month: "Apr", income: 4500, expenses: 3000 },
  ];

  const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"];

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <section>
        <h1 className="text-2xl font-bold">Hello, Christian 👋</h1>
        <p className="text-gray-600">
          Here’s your financial summary for September 2025.
        </p>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
          💰 <h3 className="font-semibold">Total Income</h3>
          <p className="text-xl font-bold">
            $4,200 <span className="text-green-500">↑ 5%</span>
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          💸 <h3 className="font-semibold">Total Expenses</h3>
          <p className="text-xl font-bold">
            $2,900 <span className="text-red-500">↓ 3%</span>
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          🏦 <h3 className="font-semibold">Current Balance</h3>
          <p className="text-xl font-bold">$1,300</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          🎯 <h3 className="font-semibold">Savings Progress</h3>
          <p className="text-xl font-bold">65%</p>
        </div>
      </section>

      {/* Charts Section */}
      <section className="grid md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white p-4 rounded-xl shadow h-64">
          <h3 className="font-semibold mb-2">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height="90%">
            <RePieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label
              >
                {expenseData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </RePieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-4 rounded-xl shadow h-64">
          <h3 className="font-semibold mb-2">Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={incomeExpenseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#10B981" />
              <Bar dataKey="expenses" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="flex space-x-4">
        <button className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700">
          <PlusCircle size={18} className="mr-2" /> Add Income
        </button>
        <button className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600">
          <MinusCircle size={18} className="mr-2" /> Add Expense
        </button>
        <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600">
          <PieChart size={18} className="mr-2" /> Set Budget
        </button>
        <button className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600">
          <Target size={18} className="mr-2" /> Add Savings Goal
        </button>
      </section>

      {/* Recent Transactions */}
      <section className="bg-white rounded-xl shadow p-4">
        <h3 className="font-semibold mb-4">Recent Transactions</h3>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-500 border-b">
              <th className="py-2">Date</th>
              <th className="py-2">Category</th>
              <th className="py-2">Amount</th>
              <th className="py-2">Type</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Sep 15</td>
              <td>Food</td>
              <td>$25</td>
              <td>Expense</td>
            </tr>
            <tr>
              <td>Sep 12</td>
              <td>Salary</td>
              <td>$2,000</td>
              <td>Income</td>
            </tr>
          </tbody>
        </table>
        <button className="mt-3 text-emerald-600 hover:underline">
          View All Transactions
        </button>
      </section>

      {/* Savings & Budgets */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold mb-2">Savings Goals</h3>
          <div className="bg-gray-100 rounded-full h-3 w-full mb-2">
            <div className="bg-emerald-600 h-3 rounded-full w-2/3"></div>
          </div>
          <p className="text-sm text-gray-600">Vacation Fund: 65% reached</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold mb-2">Budget Categories</h3>
          <p className="text-sm text-gray-600">Food: $120 remaining</p>
          <p className="text-sm text-red-500">Shopping: Overspent by $50</p>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-white rounded-xl shadow p-4">
        <h3 className="font-semibold mb-2">Notifications</h3>
        <ul className="text-sm text-gray-700">
          <li>⚠️ Overspending in Shopping category</li>
          <li>🎯 Savings milestone reached: 65% of Vacation Fund</li>
        </ul>
      </section>
    </DashboardLayout>
  );
}
