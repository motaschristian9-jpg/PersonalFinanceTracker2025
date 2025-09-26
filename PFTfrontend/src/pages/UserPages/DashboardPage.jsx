import Swal from "sweetalert2";
import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { PlusCircle, MinusCircle, PieChart, Target } from "lucide-react";
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
import { useAddTransaction } from "../../api/queries";
import {
  addTransaction,
  addBudget,
  addGoal,
} from "../../api/api";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { user, transactions, budgets, goals, reports } = useOutletContext();

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [formData, setFormData] = useState({});

  const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"];

  // ================= Queries =================

  // ================= Mutations =================
  const addTransactionMutation = useAddTransaction();

  const transactionMutation = useMutation({
    mutationFn: addTransaction,
    onSuccess: () => queryClient.invalidateQueries(["transactions", "reports"]),
  });

  const budgetMutation = useMutation({
    mutationFn: addBudget,
    onSuccess: () => queryClient.invalidateQueries(["budgets"]),
  });

  const goalMutation = useMutation({
    mutationFn: addGoal,
    onSuccess: () => queryClient.invalidateQueries(["goals"]),
  });

  // ================= Modal Handlers =================
  const handleOpenModal = (type) => {
    setModalType(type); // "income", "expense", etc.
    setFormData({
      category: "",
      customCategory: "",
      amount: "",
      description: "",
      transac_date: "",
      title: "",
      target_amount: "",
      deadline: "",
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
          category:
            data.category === "Other" ? data.customCategory : data.category,
          amount: parseFloat(data.amount),
          transaction_date: data.transaction_date,
          description: data.description || "",
        };

        // Always add new transaction (no editing in dashboard)
        await addTransactionMutation.mutateAsync(txData);
        message = modalType === "income" ? "Income added!" : "Expense added!";
      } else if (modalType === "budget") {
        const budgetData = {
          category:
            data.category === "Other" ? data.customCategory : data.category,
          amount: Number(data.limit || data.amount),
          start_date: data.start_date,
          end_date: data.end_date,
          description: data.description || "", // optional description
        };
        await budgetMutation.mutateAsync(budgetData);
        message = "Budget set!";
      } else if (modalType === "goal") {
        const goalData = {
          title: data.title,
          target_amount: Number(data.target_amount),
          deadline: data.deadline || null,
        };
        await goalMutation.mutateAsync(goalData);
        message = "Savings goal added!";
      }

      handleCloseModal();

      Swal.fire({
        icon: "success",
        title: "Success",
        text: message,
        confirmButtonColor: "#10B981",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
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
    <div>
      {/* Welcome */}
      <section>
        <h1 className="text-2xl font-bold">Hello, {user?.name || "User"} 👋</h1>
        <p className="text-gray-600">
          Here’s your financial summary for{" "}
          {new Date().toLocaleString("default", { month: "long" })}{" "}
          {new Date().getFullYear()}.
        </p>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 my-4">
        <div className="bg-white p-4 rounded-xl shadow">
          💰 <h3 className="font-semibold">Total Income</h3>
          <p className="text-xl font-bold">
            ₱{Number(reports?.totalIncome || 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          💸 <h3 className="font-semibold">Total Expenses</h3>
          <p className="text-xl font-bold">
            ₱{Number(reports?.totalExpenses || 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          🏦 <h3 className="font-semibold">Net Savings</h3>
          <p className="text-xl font-bold">
            ₱{Number(reports?.balance || 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          🎯 <h3 className="font-semibold">Savings Progress</h3>
          <p className="text-xl font-bold">
            {reports?.savingsProgress ? `${reports.savingsProgress}%` : "0%"}
          </p>
        </div>
      </section>

      {/* Charts */}
      <section className="grid md:grid-cols-2 gap-6 my-4">
        <div className="bg-white p-4 rounded-xl shadow h-90">
          <h3 className="font-semibold mb-2">Expense Breakdown</h3>
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

        <div className="bg-white p-4 rounded-xl shadow h-90">
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
      <section className="flex flex-wrap gap-4 my-4">
        <button
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700"
          onClick={() => handleOpenModal("income")}
        >
          <PlusCircle size={18} className="mr-2" /> Add Income
        </button>
        <button
          className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600"
          onClick={() => handleOpenModal("expense")}
        >
          <MinusCircle size={18} className="mr-2" /> Add Expense
        </button>
        <button
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
          onClick={() => handleOpenModal("budget")}
        >
          <PieChart size={18} className="mr-2" /> Add New Budget
        </button>
        <button
          className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600"
          onClick={() => handleOpenModal("goal")}
        >
          <Target size={18} className="mr-2" /> Add Savings Goal
        </button>
      </section>

      {/* Modal */}
      <ModalForm
        isOpen={modalOpen}
        type={modalType}
        formData={formData}
        setFormData={setFormData}
        onClose={handleCloseModal}
        refetch={() =>
          queryClient.invalidateQueries([
            "transactions",
            "budgets",
            "goals",
            "reports",
          ])
        }
        onSubmit={handleSubmit}
      />

      {/* Recent Transactions */}
      <section className="bg-white rounded-xl shadow p-4 my-4">
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
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-gray-500 py-4">
                  No transactions yet.
                </td>
              </tr>
            ) : (
              transactions.slice(0, 5).map((tx, index) => (
                <tr key={tx.id || `tx-${index}`} className="hover:bg-gray-50">
                  <td>{new Date(tx.transaction_date).toLocaleDateString()}</td>
                  <td>{tx.category}</td>
                  <td>₱{Number(tx.amount).toFixed(2)}</td>
                  <td>{tx.type}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="mt-3 text-right">
          <Link
            to="/transactions"
            className="text-emerald-600 hover:underline font-medium"
          >
            View All Transactions
          </Link>
        </div>
      </section>

      {/* Savings & Budgets */}
      <section className="grid md:grid-cols-2 gap-6 my-4">
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold mb-2">Savings Goals</h3>
          {goals.length === 0 ? (
            <p className="text-gray-500">No goals yet.</p>
          ) : (
            goals.map((g, index) => (
              <div key={g.goal_id || `goal-${index}`} className="mb-3">
                <div className="bg-gray-100 rounded-full h-3 w-full mb-1">
                  <div
                    className="bg-emerald-600 h-3 rounded-full"
                    style={{
                      width: `${(g.current_amount / g.target_amount) * 100}%`,
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  {g.title}:{" "}
                  {Math.round((g.current_amount / g.target_amount) * 100)}%
                  reached
                </p>
              </div>
            ))
          )}
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold mb-2">Budget Categories</h3>
          {budgets.length === 0 ? (
            <p className="text-gray-500">No budgets yet.</p>
          ) : (
            budgets.map((b, index) => (
              <p
                key={b.id || `budget-${index}`}
                className="text-sm text-gray-600"
              >
                {b.category}: ₱{b.limit} (spent ₱{b.spent})
              </p>
            ))
          )}
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-white rounded-xl shadow p-4 my-4">
        <h3 className="font-semibold mb-2">Notifications</h3>
        <ul className="text-sm text-gray-700">
          {(() => {
            const notifications = [];

            budgets.forEach((b) => {
              const percentSpent = (b.spent / b.limit) * 100;
              if (percentSpent >= 100)
                notifications.push({
                  id: `budget-${b.id}-over`,
                  message: `⚠️ You have overspent your ${b.category} budget!`,
                });
              else if (percentSpent >= 80)
                notifications.push({
                  id: `budget-${b.id}-warn`,
                  message: `⚠️ You have used ${Math.floor(
                    percentSpent
                  )}% of your ${b.category} budget.`,
                });
            });

            goals.forEach((g) => {
              const progress = (g.current_amount / g.target_amount) * 100;
              if (progress >= 100)
                notifications.push({
                  id: `goal-${g.goal_id}-complete`,
                  message: `🎉 You’ve reached your savings goal: ${g.title}!`,
                });
              else if (progress >= 80)
                notifications.push({
                  id: `goal-${g.goal_id}-high`,
                  message: `🎯 You’re ${Math.floor(progress)}% of the way to ${
                    g.title
                  }. Almost there!`,
                });
              else if (progress >= 50)
                notifications.push({
                  id: `goal-${g.goal_id}-mid`,
                  message: `🎯 You’ve reached 50% of ${g.title}. Keep going!`,
                });
            });

            if (notifications.length === 0) return <li>No notifications</li>;

            return notifications.map((n) => <li key={n.id}>{n.message}</li>);
          })()}
        </ul>
      </section>
    </div>
  );
}
