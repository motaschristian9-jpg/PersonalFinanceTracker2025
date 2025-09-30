import Swal from "sweetalert2";
import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  PlusCircle,
  MinusCircle,
  PieChart,
  Target,
  TrendingUp,
  TrendingDown,
  Wallet,
  Banknote,
  Goal,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

import ModalForm from "../../components/ModalForm";
import SavingsCardModal from "../../components/SavingsCardModal";
import { useAddTransaction, useAddGoal, useAddBudget } from "../../api/queries";
import { addTransaction, addBudget } from "../../api/api";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { user, transactions, budgets, goals, reports } = useOutletContext();

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [formData, setFormData] = useState({});

  // Savings goal modal states (only for viewing existing goals)
  const [savingsModalOpen, setSavingsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"];
  const MAX_ITEMS = 9;
  const budgetSpent = (budgetId) => {
    return transactions
      .filter((tx) => tx.budget_id === budgetId)
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
  };

  // ================= Mutations =================
  const addTransactionMutation = useAddTransaction();

  const addBudgetMutation = useAddBudget();

  const addGoalMutation = useAddGoal();

  // ================= Modal Handlers =================
  const handleOpenModal = (type) => {
    if (
      (type === "budget" && budgets.length >= MAX_ITEMS) ||
      (type === "goal" && goals.length >= MAX_ITEMS)
    ) {
      Swal.fire({
        icon: "warning",
        title: "Limit Reached",
        text: `You can only create up to ${MAX_ITEMS} ${
          type === "budget" ? "budgets" : "savings goals"
        }.`,
        confirmButtonColor: "#F59E0B",
      });
      return;
    }

    setModalType(type);
    setFormData({
      category: "",
      customCategory: "",
      amount: "",
      description: "",
      transaction_date: "",
      title: "",
      target_amount: "",
      deadline: "",
      start_date: "",
      end_date: "",
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);

  const handleSubmit = async (data) => {
    try {
      let message = "";

      if (modalType === "income" || modalType === "expense") {
        const txData = {
          type: modalType === "income" ? "Income" : "Expense",
          category: data.category,
          amount: parseFloat(data.amount),
          transaction_date: data.transaction_date,
          description: data.description || "",
        };

        await addTransactionMutation.mutateAsync(txData);
        message = modalType === "income" ? "Income added!" : "Expense added!";
      } else if (modalType === "budget") {
        const budgetData = {
          category: data.category,
          amount: Number(data.amount),
          start_date: data.start_date,
          end_date: data.end_date,
          description: data.description || "",
        };

        await addBudgetMutation.mutateAsync(budgetData);
        message = "Budget set!";
      } else if (modalType === "goal") {
        const goalData = {
          title: data.title,
          target_amount: Number(data.target_amount),
          deadline: data.deadline || null,
        };

        await addGoalMutation.mutateAsync(goalData);
        message = "Savings goal created!";

        queryClient.invalidateQueries(["goals", "reports"]);
      }

      handleCloseModal();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: message,
        confirmButtonColor: "#10B981",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  // ================= View Goal Handler =================
  const handleViewGoal = (goal) => {
    setSelectedGoal(goal);
    setSavingsModalOpen(true);
  };

  // ================= Chart Data =================
  const expenseData = transactions
    .filter((t) => t.type?.toLowerCase() === "expense")
    .reduce((acc, tx) => {
      const existing = acc.find((item) => item.name === tx.category);
      if (existing) existing.value += parseFloat(tx.amount);
      else acc.push({ name: tx.category, value: parseFloat(tx.amount) });
      return acc;
    }, []);

  const incomeExpenseData = reports
    ? [
        {
          month: new Date().toLocaleString("default", { month: "long" }),
          income: reports.totalIncome,
          expenses: reports.totalExpenses,
        },
      ]
    : [];

  // ================= Render =================
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 p-6 lg:p-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Wallet className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Hello,{" "}
                <span className="bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                  {user?.name || "User"}
                </span>{" "}
                👋
              </h1>
              <p className="text-gray-600 mt-1">
                Here's your financial summary for{" "}
                <span className="font-medium text-green-700">
                  {new Date().toLocaleString("default", { month: "long" })}{" "}
                  {new Date().getFullYear()}
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-green-100/50 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 text-sm">
                  Total Income
                </h3>
                <p className="text-2xl font-bold text-green-600">
                  ₱{Number(reports?.totalIncome || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-200/30 to-red-300/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-red-100/50 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <TrendingDown className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 text-sm">
                  Total Expenses
                </h3>
                <p className="text-2xl font-bold text-red-500">
                  ₱{Number(reports?.totalExpenses || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-200/30 to-blue-300/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100/50 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Banknote className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 text-sm">
                  Net Savings
                </h3>
                <p className="text-2xl font-bold text-gray-800">
                  ₱{Number(reports?.balance || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-200/30 to-purple-300/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100/50 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Goal className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 text-sm">
                  Savings Progress
                </h3>
                <p className="text-2xl font-bold text-gray-800">
                  {reports?.savingsProgress
                    ? `${reports.savingsProgress}%`
                    : "0%"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Expense Breakdown
            </h3>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <RePieChart>
                  <Pie
                    data={expenseData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
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
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-200/30 to-blue-300/20 rounded-2xl blur opacity-40"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100/50 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Income vs Expenses
            </h3>
            <ResponsiveContainer width="100%" height={300}>
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
        </div>
      </section>

      {/* Quick Actions */}
      <section className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-gray-200/30 to-gray-300/20 rounded-2xl blur opacity-40"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 p-6 lg:p-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              className="flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              onClick={() => handleOpenModal("income")}
            >
              <PlusCircle size={20} />
              <span className="font-medium">Add Income</span>
            </button>
            <button
              className="flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              onClick={() => handleOpenModal("expense")}
            >
              <MinusCircle size={20} />
              <span className="font-medium">Add Expense</span>
            </button>
            <button
              className="flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              onClick={() => handleOpenModal("budget")}
            >
              <PieChart size={20} />
              <span className="font-medium">Add Budget</span>
            </button>
            <button
              className="flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              onClick={() => handleOpenModal("goal")}
            >
              <Target size={20} />
              <span className="font-medium">Add Goal</span>
            </button>
          </div>
        </div>
      </section>

      {/* Modal for Income, Expense, Budget, Goal */}
      <ModalForm
        isOpen={modalOpen}
        type={modalType}
        formData={formData}
        setFormData={setFormData}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />

      {/* Savings Goal Modal (View Only) */}
      {savingsModalOpen && (
        <SavingsCardModal
          goal={selectedGoal}
          onClose={() => {
            setSavingsModalOpen(false);
            setSelectedGoal(null);
          }}
          onAddSavings={(savingsData) => {
            // Handle adding savings to existing goal
            console.log("Adding savings:", savingsData);
            // You would implement the actual API call here
            return true; // Return success/failure
          }}
          transactions={[]} // Pass goal-specific transactions here
          currentSaved={selectedGoal?.current_amount || 0}
        />
      )}

      {/* Recent Transactions */}
      <section className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 p-6 lg:p-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            Recent Transactions
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-600 border-b border-gray-200">
                  <th className="py-3 font-semibold">Date</th>
                  <th className="py-3 font-semibold">Category</th>
                  <th className="py-3 font-semibold">Amount</th>
                  <th className="py-3 font-semibold">Type</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center text-gray-500 py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <Wallet className="text-gray-300" size={48} />
                        <span>No transactions yet.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.slice(0, 5).map((tx, index) => (
                    <tr
                      key={tx.id || `tx-${index}`}
                      className="hover:bg-green-50/50 transition-colors"
                    >
                      <td className="py-3">
                        {new Date(tx.transaction_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 font-medium">{tx.category}</td>
                      <td className="py-3 font-bold">
                        ₱{Number(tx.amount).toFixed(2)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            tx.type === "income"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-6 text-right">
            <Link
              to="/transactions"
              className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
            >
              <span>View All Transactions</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Savings & Budgets */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-200/30 to-purple-300/20 rounded-2xl blur opacity-40"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100/50 p-6 lg:p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Savings Goals
            </h3>
            <div className="space-y-4">
              {goals.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Target className="text-gray-300 mx-auto mb-3" size={48} />
                  <p>No goals yet.</p>
                </div>
              ) : (
                goals.map((g, index) => (
                  <div
                    key={g.goal_id || `goal-${index}`}
                    className="space-y-2 cursor-pointer hover:bg-purple-50/50 p-3 rounded-lg transition-colors"
                    onClick={() => handleViewGoal(g)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">
                        {g.title}
                      </span>
                      <span className="text-sm font-medium text-purple-600">
                        {Math.round((g.current_amount / g.target_amount) * 100)}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            (g.current_amount / g.target_amount) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      ₱{Number(g.current_amount || 0).toFixed(2)} of ₱
                      {Number(g.target_amount || 0).toFixed(2)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-200/30 to-blue-300/20 rounded-2xl blur opacity-40"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100/50 p-6 lg:p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Budget Categories
            </h3>
            <div className="space-y-3">
              {budgets.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <PieChart className="text-gray-300 mx-auto mb-3" size={48} />
                  <p>No budgets yet.</p>
                </div>
              ) : (
                budgets.map((b, index) => {
                  const spent = budgetSpent(b.budget_id); // 👈 calculate spent for this budget
                  return (
                    <div
                      key={b.id || `budget-${index}`}
                      className="flex justify-between items-center p-3 bg-blue-50/50 rounded-lg"
                    >
                      <span className="font-medium text-gray-800">
                        {b.category}
                      </span>
                      <div className="text-right">
                        <div className="text-sm font-bold text-blue-600">
                          ₱{b.amount}
                        </div>
                        <div className="text-xs text-gray-600">
                          Spent: ₱{spent}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-200/30 to-yellow-300/20 rounded-2xl blur opacity-40"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-yellow-100/50 p-6 lg:p-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            Notifications
          </h3>
          <div className="space-y-3">
            {(() => {
              const notifications = [];

              budgets.forEach((b) => {
                const percentSpent = (b.spent / b.limit) * 100;
                if (percentSpent >= 100)
                  notifications.push({
                    id: `budget-${b.id}-over`,
                    message: `⚠️ You have overspent your ${b.category} budget!`,
                    type: "error",
                  });
                else if (percentSpent >= 80)
                  notifications.push({
                    id: `budget-${b.id}-warn`,
                    message: `⚠️ You have used ${Math.floor(
                      percentSpent
                    )}% of your ${b.category} budget.`,
                    type: "warning",
                  });
              });

              goals.forEach((g) => {
                const progress = (g.current_amount / g.target_amount) * 100;
                if (progress >= 100)
                  notifications.push({
                    id: `goal-${g.goal_id}-complete`,
                    message: `🎉 You've reached your savings goal: ${g.title}!`,
                    type: "success",
                  });
                else if (progress >= 80)
                  notifications.push({
                    id: `goal-${g.goal_id}-high`,
                    message: `🎯 You're ${Math.floor(
                      progress
                    )}% of the way to ${g.title}. Almost there!`,
                    type: "info",
                  });
                else if (progress >= 50)
                  notifications.push({
                    id: `goal-${g.goal_id}-mid`,
                    message: `🎯 You've reached 50% of ${g.title}. Keep going!`,
                    type: "info",
                  });
              });

              if (notifications.length === 0) {
                return (
                  <div className="text-center text-gray-500 py-4">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">🔔</span>
                      </div>
                      <span>No notifications</span>
                    </div>
                  </div>
                );
              }

              return notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    n.type === "error"
                      ? "bg-red-50 border-red-500 text-red-800"
                      : n.type === "warning"
                      ? "bg-yellow-50 border-yellow-500 text-yellow-800"
                      : n.type === "success"
                      ? "bg-green-50 border-green-500 text-green-800"
                      : "bg-blue-50 border-blue-500 text-blue-800"
                  }`}
                >
                  {n.message}
                </div>
              ));
            })()}
          </div>
        </div>
      </section>
    </div>
  );
}
