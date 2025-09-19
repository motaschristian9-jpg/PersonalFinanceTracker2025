// src/pages/UserPages/ExpensesPage.jsx
import DashboardLayout from "../../layouts/DashboardLayout";
import { Minus, Filter, Calendar, FileDown, Edit, Trash2 } from "lucide-react";

export default function ExpensesPage() {
  return (
    <DashboardLayout>
      {/* Page Title & Quick Actions */}
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Expenses</h1>
          <p className="text-gray-600">Track and manage your expenses.</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
            <Minus size={18} className="mr-2" /> Add Expense
          </button>
          <button className="flex items-center border px-4 py-2 rounded-lg hover:bg-gray-100">
            <FileDown size={18} className="mr-2" /> Export
          </button>
        </div>
      </section>

      {/* Filters & Categories */}
      <section className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Calendar size={18} className="text-gray-500" />
            <select className="border rounded-lg px-3 py-2 text-sm">
              <option>This Month</option>
              <option>Last Month</option>
              <option>Custom Range</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-500" />
            <select className="border rounded-lg px-3 py-2 text-sm">
              <option>All Categories</option>
              <option>Food</option>
              <option>Transport</option>
              <option>Rent</option>
              <option>Utilities</option>
              <option>Entertainment</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <select className="border rounded-lg px-3 py-2 text-sm">
              <option>All Types</option>
              <option>Fixed</option>
              <option>Variable</option>
            </select>
          </div>
        </div>
      </section>

      {/* Expenses Table */}
      <section className="bg-white p-4 rounded-lg shadow-sm border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="py-2 px-3">Date</th>
              <th className="py-2 px-3">Category</th>
              <th className="py-2 px-3">Description</th>
              <th className="py-2 px-3">Amount</th>
              <th className="py-2 px-3">Type</th>
              <th className="py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50">
              <td className="py-2 px-3">2025-09-16</td>
              <td className="py-2 px-3">Food</td>
              <td className="py-2 px-3">Groceries</td>
              <td className="py-2 px-3 text-red-600 font-semibold">₱5,000</td>
              <td className="py-2 px-3">Variable</td>
              <td className="py-2 px-3 flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800">
                  <Edit size={16} />
                </button>
                <button className="text-red-600 hover:text-red-800">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
            <tr className="border-b hover:bg-gray-50">
              <td className="py-2 px-3">2025-09-12</td>
              <td className="py-2 px-3">Rent</td>
              <td className="py-2 px-3">Apartment</td>
              <td className="py-2 px-3 text-red-600 font-semibold">₱20,000</td>
              <td className="py-2 px-3">Fixed</td>
              <td className="py-2 px-3 flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800">
                  <Edit size={16} />
                </button>
                <button className="text-red-600 hover:text-red-800">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Expenses Summary */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">💸 Total Expenses</p>
          <p className="text-lg font-bold text-red-600">₱25,000</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">🏷️ Largest Expense Category</p>
          <p className="text-lg font-bold">Rent</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">⚖️ Avg. Monthly Expenses</p>
          <p className="text-lg font-bold">₱22,000</p>
        </div>
      </section>
    </DashboardLayout>
  );
}
