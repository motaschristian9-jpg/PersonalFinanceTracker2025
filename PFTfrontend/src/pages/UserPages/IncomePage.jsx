// src/pages/UserPages/IncomePage.jsx
import DashboardLayout from "../../layouts/DashboardLayout";
import { Plus, Filter, Calendar, FileDown, Edit, Trash2 } from "lucide-react";

export default function IncomePage() {
  return (
    <DashboardLayout>
      {/* Page Title & Quick Actions */}
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Income</h1>
          <p className="text-gray-600">Track and manage your income records.</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
            <Plus size={18} className="mr-2" /> Add Income
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
              <option>All Sources</option>
              <option>Salary</option>
              <option>Freelance</option>
              <option>Investments</option>
              <option>Business</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <select className="border rounded-lg px-3 py-2 text-sm">
              <option>All Types</option>
              <option>Regular Income</option>
              <option>One-Time Income</option>
            </select>
          </div>
        </div>
      </section>

      {/* Income Table */}
      <section className="bg-white p-4 rounded-lg shadow-sm border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="py-2 px-3">Date</th>
              <th className="py-2 px-3">Source/Category</th>
              <th className="py-2 px-3">Description</th>
              <th className="py-2 px-3">Amount</th>
              <th className="py-2 px-3">Type</th>
              <th className="py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50">
              <td className="py-2 px-3">2025-09-15</td>
              <td className="py-2 px-3">Salary</td>
              <td className="py-2 px-3">Monthly paycheck</td>
              <td className="py-2 px-3 text-emerald-600 font-semibold">
                ₱50,000
              </td>
              <td className="py-2 px-3">Regular</td>
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
              <td className="py-2 px-3">2025-09-10</td>
              <td className="py-2 px-3">Freelance</td>
              <td className="py-2 px-3">Web design project</td>
              <td className="py-2 px-3 text-emerald-600 font-semibold">
                ₱15,000
              </td>
              <td className="py-2 px-3">One-Time</td>
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

      {/* Income Summary */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">💰 Total Income</p>
          <p className="text-lg font-bold text-emerald-600">₱65,000</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">📈 Highest Income Source</p>
          <p className="text-lg font-bold">Salary</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">📅 Avg. Monthly Income</p>
          <p className="text-lg font-bold">₱40,000</p>
        </div>
      </section>
    </DashboardLayout>
  );
}
