import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  List,
  DollarSign,
  CreditCard,
  PieChart,
  Target,
  BarChart2,
  Settings,
  Bell,
  Search,
  LogOut,
  User,
  PlusCircle,
  MinusCircle,
} from "lucide-react";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();
  const handleLogout = () => {
    // Clear both storages
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    // Navigate to login page
    navigate("/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/dashboard",
    },
    { label: "Transactions", icon: <List size={20} />, path: "/transactions" },
    { label: "Income", icon: <DollarSign size={20} />, path: "/income" },
    { label: "Expenses", icon: <CreditCard size={20} />, path: "/expenses" },
    { label: "Budgets", icon: <PieChart size={20} />, path: "/budgets" },
    { label: "Savings", icon: <Target size={20} />, path: "/savings" },
    { label: "Reports", icon: <BarChart2 size={20} />, path: "/reports" },
    { label: "Settings", icon: <Settings size={20} />, path: "/settings" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } border-r bg-white text-gray-800 p-4 flex flex-col transition-all`}
      >
        {/* Logo */}
        <div className="mb-6 text-2xl font-bold text-emerald-600">
          {sidebarOpen ? "MoneyTracker" : "MT"}
        </div>

        {/* Menu */}
        <nav className="flex flex-col space-y-4">
          {menuItems.map((item, idx) => (
            <a
              key={idx}
              href={item.path}
              className="flex items-center space-x-3 text-gray-700 hover:text-emerald-600"
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="flex items-center justify-between bg-white border-b px-6 py-3">
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-1">
            <Search className="text-gray-500 mr-2" size={18} />
            <input
              type="text"
              placeholder="Search transactions..."
              className="bg-transparent outline-none text-sm"
            />
          </div>

          <div className="flex items-center space-x-4">
            <Bell className="text-gray-600 cursor-pointer" />

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <img
                src="https://via.placeholder.com/40"
                alt="User"
                className="w-9 h-9 rounded-full cursor-pointer"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md">
                  <a
                    href="/profile"
                    className="flex items-center px-3 py-2 hover:bg-gray-100"
                  >
                    <User size={16} className="mr-2" /> Profile
                  </a>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-3 py-2 hover:bg-gray-100 w-full text-left"
                  >
                    <LogOut size={16} className="mr-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="p-6 flex-1 space-y-6">
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
            <div className="bg-white p-4 rounded-xl shadow h-64">
              <h3 className="font-semibold mb-2">Expense Breakdown</h3>
              <div className="h-full flex items-center justify-center text-gray-400">
                [Pie Chart]
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow h-64">
              <h3 className="font-semibold mb-2">Income vs Expenses</h3>
              <div className="h-full flex items-center justify-center text-gray-400">
                [Bar/Line Chart]
              </div>
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
              <p className="text-sm text-gray-600">
                Vacation Fund: 65% reached
              </p>
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
        </main>

        {/* Footer */}
        <footer className="border-t bg-gray-50 py-6 px-4 text-center text-sm text-gray-500">
          © 2025 MoneyTracker · Follow us:
          <span className="ml-2">🌐 📘 🐦 📸</span>
        </footer>
      </div>
    </div>
  );
}
