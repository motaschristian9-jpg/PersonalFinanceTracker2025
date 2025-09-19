import DashboardLayout from "../../layouts/DashboardLayout";
import { PlusCircle, MinusCircle, Edit, Trash } from "lucide-react";

export default function Transactions() {
  return (
    <DashboardLayout>
      {/* Page Title & Quick Actions */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📜 Transactions</h1>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
            <PlusCircle className="mr-2 h-5 w-5" /> Add Income
          </button>
          <button className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
            <MinusCircle className="mr-2 h-5 w-5" /> Add Expense
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="🔍 Search transactions..."
            className="border rounded-lg px-3 py-2 w-full"
          />
          <select className="border rounded-lg px-3 py-2 w-full">
            <option>Date Range</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>Custom</option>
          </select>
          <select className="border rounded-lg px-3 py-2 w-full">
            <option>All Categories</option>
            <option>Food</option>
            <option>Transport</option>
            <option>Rent</option>
            <option>Salary</option>
          </select>
          <select className="border rounded-lg px-3 py-2 w-full">
            <option>All Types</option>
            <option>Income</option>
            <option>Expense</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 border-b">Date</th>
              <th className="py-3 px-4 border-b">Category</th>
              <th className="py-3 px-4 border-b">Description</th>
              <th className="py-3 px-4 border-b">Amount</th>
              <th className="py-3 px-4 border-b">Type</th>
              <th className="py-3 px-4 border-b text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50">
              <td className="py-3 px-4 border-b">2025-09-18</td>
              <td className="py-3 px-4 border-b">Food</td>
              <td className="py-3 px-4 border-b">Lunch</td>
              <td className="py-3 px-4 border-b text-red-500">- ₱250</td>
              <td className="py-3 px-4 border-b">Expense</td>
              <td className="py-3 px-4 border-b text-right space-x-2">
                <button className="text-blue-500 hover:text-blue-700">
                  <Edit size={18} />
                </button>
                <button className="text-red-500 hover:text-red-700">
                  <Trash size={18} />
                </button>
              </td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-3 px-4 border-b">2025-09-17</td>
              <td className="py-3 px-4 border-b">Salary</td>
              <td className="py-3 px-4 border-b">Monthly Pay</td>
              <td className="py-3 px-4 border-b text-green-600">+ ₱20,000</td>
              <td className="py-3 px-4 border-b">Income</td>
              <td className="py-3 px-4 border-b text-right space-x-2">
                <button className="text-blue-500 hover:text-blue-700">
                  <Edit size={18} />
                </button>
                <button className="text-red-500 hover:text-red-700">
                  <Trash size={18} />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-gray-500">💰 Total Income</h3>
          <p className="text-2xl font-bold text-green-600">₱20,000</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-gray-500">💸 Total Expenses</h3>
          <p className="text-2xl font-bold text-red-500">₱250</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-gray-500">🏦 Net Balance</h3>
          <p className="text-2xl font-bold text-emerald-600">₱19,750</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
