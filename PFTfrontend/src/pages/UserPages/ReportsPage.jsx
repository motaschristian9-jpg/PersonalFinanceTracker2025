import React, { useState } from "react";
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
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Calendar,
  BarChart3,
  FileText,
  FileDown,
} from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";

const ReportsPage = () => {
  const { user, transactions, budgets, goals, reports } = useOutletContext();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [appliedRange, setAppliedRange] = useState({ from: "", to: "" });

  // Dummy data for charts
  const expenseData = React.useMemo(() => {
    if (!transactions) return [];

    const from = appliedRange?.from ? new Date(appliedRange.from) : null;
    const to = appliedRange?.to ? new Date(appliedRange.to) : null;

    return (
      transactions
        // ✅ filter by expense type
        .filter((t) => t.type?.toLowerCase() === "expense")
        // ✅ filter by applied date range
        .filter((t) => {
          const txDate = new Date(t.transaction_date || t.date);
          if (from && txDate < from) return false;
          if (to && txDate > to) return false;
          return true;
        })
        // ✅ group by category
        .reduce((acc, tx) => {
          const existing = acc.find((item) => item.name === tx.category);
          if (existing) {
            existing.value += parseFloat(tx.amount) || 0;
          } else {
            acc.push({ name: tx.category, value: parseFloat(tx.amount) || 0 });
          }
          return acc;
        }, [])
    );
  }, [transactions, appliedRange]);

  const incomeExpenseData = React.useMemo(() => {
    if (!transactions) return [];

    // Prepare a map for totals by month
    const monthlyTotals = {};

    transactions.forEach((tx) => {
      const dateStr = tx.transaction_date;
      if (!dateStr) return;

      const date = new Date(dateStr);

      // ✅ Apply date filter
      const from = appliedRange?.from ? new Date(appliedRange.from) : null;
      const to = appliedRange?.to ? new Date(appliedRange.to) : null;

      if (from && date < from) return; // skip before start
      if (to && date > to) return; // skip after end

      const month = date.toLocaleString("en-US", { month: "short" }); // e.g. "Jan"

      if (!monthlyTotals[month]) {
        monthlyTotals[month] = { month, income: 0, expenses: 0 };
      }

      if (tx.type.toLowerCase() === "income") {
        monthlyTotals[month].income += Number(tx.amount) || 0;
      } else if (tx.type.toLowerCase() === "expense") {
        monthlyTotals[month].expenses += Number(tx.amount) || 0;
      }
    });

    // Convert map → array sorted by month order
    const monthOrder = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return monthOrder
      .map((m) => monthlyTotals[m]) // ensure correct order
      .filter(Boolean); // remove months with no data
  }, [transactions, appliedRange]);

  const budgetUtilization = React.useMemo(() => {
    if (!budgets || !transactions) return [];

    return budgets.map((budget) => {
      // ✅ Apply date filter
      const from = appliedRange?.from ? new Date(appliedRange.from) : null;
      const to = appliedRange?.to ? new Date(appliedRange.to) : null;

      const spent = transactions
        .filter((tx) => {
          if (tx.type !== "expense" || tx.budget_id !== budget.budget_id)
            return false;

          const date = new Date(tx.transaction_date || tx.date); // support both fields
          if (from && date < from) return false;
          if (to && date > to) return false;

          return true;
        })
        .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

      const allocated = Number(budget.amount || 0);
      const percentage =
        allocated > 0 ? Math.round((spent / allocated) * 100) : 0;

      return {
        category: budget.category || "Uncategorized",
        allocated,
        spent,
        percentage,
      };
    });
  }, [budgets, transactions, appliedRange]);

  const incomeReports = React.useMemo(() => {
    if (!transactions) return [];

    const from = appliedRange?.from ? new Date(appliedRange.from) : null;
    const to = appliedRange?.to ? new Date(appliedRange.to) : null;

    return transactions
      .filter((tx) => {
        if (tx.type !== "income") return false;

        const date = new Date(tx.transaction_date || tx.date);
        if (from && date < from) return false;
        if (to && date > to) return false;

        return true;
      })
      .map((tx) => ({
        source: tx.source || tx.category || "Other", // use source if available, else fallback
        amount: Number(tx.amount || 0),
        date: tx.transaction_date,
        type: tx.typeDetail || "Income", // optional if you have sub-types
      }));
  }, [transactions, appliedRange]);

  const expenseReports = React.useMemo(() => {
    if (!transactions) return [];

    const from = appliedRange?.from ? new Date(appliedRange.from) : null;
    const to = appliedRange?.to ? new Date(appliedRange.to) : null;

    return transactions
      .filter((tx) => {
        if (tx.type !== "expense") return false;

        const date = new Date(tx.transaction_date || tx.date);
        if (from && date < from) return false;
        if (to && date > to) return false;

        return true;
      })
      .map((tx) => ({
        category: tx.category || "Uncategorized",
        amount: Number(tx.amount || 0),
        date: tx.transaction_date,
        description: tx.description || "No description",
      }));
  }, [transactions, appliedRange]);

  const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];
  const handleApplyFilter = () => {
    setAppliedRange({ from: dateFrom, to: dateTo });
  };

  const handleExport = (type) => {
    // Export functionality would go here
    console.log(`Exporting ${type}...`);
  };

  const totalSaved = goals.reduce((sum, g) => {
    const goalContributions = g.contributions ?? [];
    const goalTotal = goalContributions.reduce(
      (s, c) => s + Number(c.amount || 0),
      0
    );
    return sum + goalTotal;
  }, 0);

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-0">
      {/* Page Header */}
      <section className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-200/30 to-purple-300/20 rounded-2xl blur opacity-40"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100/50 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  Reports & Analytics
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Comprehensive financial insights and analysis
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <button className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-purple-200 text-purple-700 rounded-xl shadow-lg hover:shadow-xl hover:bg-purple-50 transform hover:-translate-y-0.5 transition-all duration-300 text-sm sm:text-base">
                <FileDown size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="font-medium">Export</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Date Range Filter */}
      <section className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-200/30 to-blue-300/20 rounded-xl blur opacity-40"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100/50 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <Calendar size={18} />
              <span>Report Period</span>
            </h3>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 text-sm"
                />
                <span className="hidden sm:flex items-center text-gray-500">
                  to
                </span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 text-sm"
                />
              </div>
              <button
                onClick={handleApplyFilter}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all duration-300 text-sm"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-green-100/50 p-4 sm:p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-white" size={18} />
              </div>
              <div>
                <h3 className="text-gray-600 font-medium text-xs sm:text-sm">
                  Total Income
                </h3>
                <p className="text-lg sm:text-2xl font-bold text-green-600">
                  ₱{Number(reports?.totalIncome || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-200/30 to-red-300/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-red-100/50 p-4 sm:p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <TrendingDown className="text-white" size={18} />
              </div>
              <div>
                <h3 className="text-gray-600 font-medium text-xs sm:text-sm">
                  Total Expenses
                </h3>
                <p className="text-lg sm:text-2xl font-bold text-red-600">
                  ₱{Number(reports?.totalExpenses || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-200/30 to-blue-300/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100/50 p-4 sm:p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <DollarSign className="text-white" size={18} />
              </div>
              <div>
                <h3 className="text-gray-600 font-medium text-xs sm:text-sm">
                  Net Balance
                </h3>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">
                  ₱{Number(reports?.balance || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-200/30 to-purple-300/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100/50 p-4 sm:p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Target className="text-white" size={18} />
              </div>
              <div>
                <h3 className="text-gray-600 font-medium text-xs sm:text-sm">
                  Savings Achieved
                </h3>
                <p className="text-lg sm:text-2xl font-bold text-purple-600">
                  ₱{Number(totalSaved || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Expense Breakdown PieChart */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-200/30 to-orange-300/20 rounded-xl blur opacity-40"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-orange-100/50 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <BarChart3 size={18} />
              <span>Expense Breakdown</span>
            </h3>
            <div className="w-full h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius="80%"
                    fill="#8884d8"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {expenseData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      `₱${value.toLocaleString()}`,
                      "Amount",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Income vs Expenses LineChart */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-200/30 to-blue-300/20 rounded-xl blur opacity-40"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100/50 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <BarChart3 size={18} />
              <span>Income vs Expenses</span>
            </h3>
            <div className="w-full h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={incomeExpenseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value, name) => [
                      `₱${value.toLocaleString()}`,
                      name === "income" ? "Income" : "Expenses",
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#EF4444"
                    strokeWidth={3}
                    dot={{ fill: "#EF4444", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Budget Utilization */}
      <section className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-xl blur opacity-40"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-green-100/50 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center space-x-2">
            <Target size={18} />
            <span>Budget Utilization</span>
          </h3>
          <div className="space-y-6">
            {budgetUtilization.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {item.category}
                  </span>
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">
                      ₱{item.spent.toLocaleString()}
                    </span>
                    <span className="text-gray-400"> / </span>
                    <span>₱{item.allocated.toLocaleString()}</span>
                    <span className="ml-2 font-medium">
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      item.percentage >= 90
                        ? "bg-red-500"
                        : item.percentage >= 70
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reports Tables */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Income Report */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-xl blur opacity-40"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-green-100/50 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-green-100/50">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                <TrendingUp size={18} />
                <span>Income Report</span>
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Recent income transactions
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-green-50/50">
                  <tr>
                    <th className="py-3 px-4 font-semibold text-gray-700 text-sm">
                      Category
                    </th>
                    <th className="py-3 px-4 font-semibold text-gray-700 text-sm">
                      Amount
                    </th>
                    <th className="py-3 px-4 font-semibold text-gray-700 text-sm hidden sm:table-cell">
                      Description
                    </th>
                    <th className="py-3 px-4 font-semibold text-gray-700 text-sm">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {incomeReports.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100/50 hover:bg-green-50/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-800">
                          {item.source}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-green-600">
                        ₱{item.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm hidden sm:table-cell">
                        {item.description || "—"}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Expense Report */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-200/30 to-red-300/20 rounded-xl blur opacity-40"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-red-100/50 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-red-100/50">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                <TrendingDown size={18} />
                <span>Expense Report</span>
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Recent expense transactions
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-red-50/50">
                  <tr>
                    <th className="py-3 px-4 font-semibold text-gray-700 text-sm">
                      Category
                    </th>
                    <th className="py-3 px-4 font-semibold text-gray-700 text-sm">
                      Amount
                    </th>
                    <th className="py-3 px-4 font-semibold text-gray-700 text-sm hidden sm:table-cell">
                      Description
                    </th>
                    <th className="py-3 px-4 font-semibold text-gray-700 text-sm">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {expenseReports.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100/50 hover:bg-red-50/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-800">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-red-600">
                        ₱{item.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm hidden sm:table-cell">
                        {item.description}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Financial Insights */}
      <section className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-200/30 to-yellow-300/20 rounded-xl blur opacity-40"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-yellow-100/50 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <FileText size={18} />
            <span>Financial Insights</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-800 mb-2">
                Spending Pattern
              </h4>
              <p className="text-sm text-blue-700">
                Your highest spending category is Food (₱4,000), representing
                35% of total expenses.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <h4 className="font-semibold text-green-800 mb-2">
                Savings Rate
              </h4>
              <p className="text-sm text-green-700">
                You've saved 32% of your income this period, which is above the
                recommended 20%.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <h4 className="font-semibold text-purple-800 mb-2">
                Budget Performance
              </h4>
              <p className="text-sm text-purple-700">
                Bills category is at 90% utilization. Consider adjusting your
                budget allocation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReportsPage;
