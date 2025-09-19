import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      localStorage.setItem("sidebarOpen", JSON.stringify(!prev));
      return !prev;
    });
  };

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
        } sticky top-0 h-screen border-r bg-white text-gray-800 p-4 flex flex-col transition-all`}
      >
        {/* Brand + Collapse Button */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-2xl font-bold text-emerald-600">
            {sidebarOpen ? "MoneyTracker" : "MT"}
          </span>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded hover:bg-gray-100"
          >
            <span className="text-gray-600">{sidebarOpen ? "←" : "→"}</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col space-y-2">
          {menuItems.map((item, idx) => {
            const isActive = location.pathname === item.path;
            return (
              <a
                key={idx}
                href={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors relative
                  ${
                    isActive
                      ? "bg-emerald-50 text-emerald-600 font-semibold"
                      : "text-gray-700 hover:text-emerald-600 hover:bg-gray-50"
                  }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600 rounded-r"></span>
                )}
                {item.icon}
                {sidebarOpen && <span>{item.label}</span>}
              </a>
            );
          })}
        </nav>
      </aside>

      {/* Main Section */}
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
        <main className="flex-1 p-6 space-y-6">{children}</main>

        {/* Footer */}
        <footer className="border-t bg-gray-50 py-6 px-4 text-center text-sm text-gray-500">
          © 2025 MoneyTracker · Follow us:
          <span className="ml-2">🌐 📘 🐦 📸</span>
        </footer>
      </div>
    </div>
  );
}
