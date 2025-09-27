// src/pages/UserPages/BudgetsPage.jsx
import { useState, useMemo } from "react";
import { Card } from "../../components/ui/card";
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
import { Plus, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import ModalForm from "../../components/ModalForm";
import BudgetCardModal from "../../components/BudgetCardModal";

import { useOutletContext } from "react-router-dom";
import {
  useAddBudget,
  useAddExpenseToBudget,
  useDeleteBudget,
  useDeleteTransaction,
  useUpdateBudget,
} from "../../api/queries";

export default function BudgetsPage() {
  const { transactions, budgets } = useOutletContext();

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [activeBudget, setActiveBudget] = useState(null);

  const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"];
  const MAX_BUDGETS = 5;

  const safeNumber = (n) => (typeof n === "number" ? n : 0);

  const budgetSpent = (budgetId) => {
    return transactions
      .filter((tx) => tx.budget_id === budgetId)
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
  };

  const chartData = useMemo(() => {
    return budgets
      .filter((b) => Number(b.amount) > 0)
      .map((b) => ({
        category: b.category,
        allocated: Number(b.amount),
        spent: transactions
          .filter((tx) => tx.budget_id === b.budget_id)
          .reduce((sum, tx) => sum + Number(tx.amount), 0),
      }));
  }, [budgets, transactions]);

  // Mutations
  const budgetMutation = useAddBudget();

  const updateBudgetMutation = useUpdateBudget();

  const deleteBudgetMutation = useDeleteBudget();

  const addExpenseMutation = useAddExpenseToBudget();

  const deleteTransactionMutation = useDeleteTransaction();

  // Handlers
  const handleDeleteTransaction = async (transaction) => {
    const result = await Swal.fire({
      title: `Delete this transaction?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteTransactionMutation.mutateAsync(transaction.transaction_id);
        Swal.fire("Deleted!", "The transaction has been deleted.", "success");
      } catch (error) {
        Swal.fire("Error!", "Could not delete transaction.", "error");
      }
    }
  };

  const handleAddExpense = async ({ budget_id, amount, description }) => {
    const localBudget = budgets.find((b) => b.budget_id === budget_id);
    if (!localBudget) return false;

    const spent = budgetSpent(budget_id);
    const remaining = Number(localBudget.amount) - spent;

    if (Number(amount) > remaining) {
      Swal.fire({
        icon: "error",
        title: "Exceeded Budget",
        text: `You only have ₱${remaining.toLocaleString()} remaining in this budget.`,
        confirmButtonColor: "#EF4444",
      });
      return false; // expense rejected
    }

    try {
      await addExpenseMutation.mutateAsync({ budget_id, amount, description });
      Swal.fire({
        icon: "success",
        title: "Expense added!",
        confirmButtonColor: "#10B981",
      });
      return true; // success
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: error.response?.data?.message || "Something went wrong.",
        confirmButtonColor: "#EF4444",
      });
      return false; // failed
    }
  };

  const handleEditBudget = async (updatedBudget) => {
    try {
      await updateBudgetMutation.mutateAsync({
        id: updatedBudget.budget_id,
        amount: updatedBudget.allocated,
        start_date: updatedBudget.start_date,
        end_date: updatedBudget.end_date,
        description: updatedBudget.description || "",
      });
      setBudgetModalOpen(false);
      setActiveBudget(null);
      Swal.fire({
        icon: "success",
        title: "Budget updated!",
        confirmButtonColor: "#10B981",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: error.response?.data?.message || "Something went wrong.",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  const handleOpenModal = (budget = null) => {
    if (!budget && budgets.length >= MAX_BUDGETS) {
      Swal.fire({
        icon: "warning",
        title: "Limit Reached",
        text: `You can only create up to ${MAX_BUDGETS} budgets.`,
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (budget) {
      setSelectedBudget(budget);
      setFormData({
        category: budget.category ?? "",
        amount: safeNumber(budget.allocated),
        start_date: budget.start_date || "",
        end_date: budget.end_date || "",
        description: budget.description || "",
      });
      setEditingId(budget.budget_id);
    } else {
      setSelectedBudget(null);
      setFormData({
        category: "",
        amount: "",
        start_date: "",
        end_date: "",
        description: "",
      });
      setEditingId(null);
    }

    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBudget(null);
    setFormData({});
    setEditingId(null);
  };

  const handleSubmit = async (data) => {
    try {
      if (editingId) {
        await updateBudgetMutation.mutateAsync({
          id: editingId,
          ...data,
        });
        Swal.fire({
          icon: "success",
          title: "Budget updated!",
          confirmButtonColor: "#10B981",
        });
      } else {
        await budgetMutation.mutateAsync({ ...data });
        Swal.fire({
          icon: "success",
          title: "Budget added!",
          confirmButtonColor: "#10B981",
        });
      }
      handleCloseModal();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: error.response?.data?.message || "Something went wrong.",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  const handleDelete = (budget) => {
    Swal.fire({
      title: `Delete ${budget.category}?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteBudgetMutation.mutateAsync(budget.budget_id);
        Swal.fire(
          "Deleted!",
          `${budget.category} budget has been deleted.`,
          "success"
        );
      }
    });
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📊 Budgets</h1>
        <Button
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          onClick={() => handleOpenModal()}
        >
          <Plus size={18} /> Add New Budget
        </Button>
      </div>

      {/* Budgets Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {budgets.map((b, i) => {
          const spent = budgetSpent(b.budget_id);
          const allocated = Number(b.amount);

          const remaining = allocated - spent;
          const percent = Math.min((spent / allocated) * 100, 100);
          const statusColor = remaining > 0 ? "green" : "red";
          const status = remaining > 0 ? "On Track" : "Over Budget";

          return (
            <div
              key={i}
              className="p-6 rounded-2xl border bg-white shadow-md hover:shadow-lg cursor-pointer transition-all duration-300 flex flex-col md:flex-row justify-between"
              style={{
                borderTopWidth: "4px",
                borderTopColor: statusColor === "green" ? "#10B981" : "#EF4444",
              }}
              onClick={() => {
                setActiveBudget(null);
                setTimeout(() => {
                  setActiveBudget({ ...b, spent, remaining });
                  setBudgetModalOpen(true);
                }, 50);
              }}
            >
              <div className="mb-4 md:mb-0 md:w-1/2">
                <h2 className="font-semibold text-lg mb-3">
                  {b.category ?? "Unknown"}{" "}
                  <span className="text-gray-500 font-normal text-sm">
                    ({b.description || "No Description"})
                  </span>
                </h2>

                <div className="flex flex-col md:flex-row gap-2 mb-3 text-sm text-gray-500">
                  <div className="flex-1 bg-gray-50 p-2 rounded">
                    <span className="font-medium">Start:</span>{" "}
                    {b.start_date
                      ? new Date(b.start_date).toLocaleDateString()
                      : "-"}
                  </div>
                  <div className="flex-1 bg-gray-50 p-2 rounded">
                    <span className="font-medium">End:</span>{" "}
                    {b.end_date
                      ? new Date(b.end_date).toLocaleDateString()
                      : "-"}
                  </div>
                </div>

                <div className="mb-3 space-y-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Allocated:</span> ₱
                    {allocated.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Spent:</span> ₱
                    {spent.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Remaining:</span> ₱
                    {remaining.toLocaleString()}
                  </p>
                </div>

                <Progress
                  value={percent}
                  className="w-full h-3 rounded-full mt-2 mb-2"
                />

                <span
                  className={`inline-block mt-2 px-3 py-1 text-sm font-medium rounded-full ${
                    statusColor === "green"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {status}
                </span>
              </div>
            </div>
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
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((b, i) => {
                const allocated = safeNumber(Number(b.amount));
                const spent = budgetSpent(b.budget_id);
                const remaining = allocated - spent;
                return (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{b.category ?? "Unknown"}</td>
                    <td className="px-4 py-3">₱{allocated.toLocaleString()}</td>
                    <td className="px-4 py-3">₱{spent.toLocaleString()}</td>
                    <td className="px-4 py-3">₱{remaining.toLocaleString()}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(b)}
                      >
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

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Budget Distribution PieChart */}
        <Card className="p-4">
          <h2 className="font-semibold mb-4">Budget Distribution</h2>
          <PieChart width={350} height={300}>
            <Pie
              data={chartData}
              dataKey="allocated" // fixed typo
              nameKey="category"
              outerRadius={120}
              fill="#8884d8"
              label
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </Card>

        {/* Budget vs Spending BarChart */}
        <Card className="p-4">
          <h2 className="font-semibold mb-4">Budget vs Spending</h2>
          <BarChart width={400} height={300} data={chartData}>
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

      {/* Budget Add/Edit Modal */}
      <ModalForm
        isOpen={modalOpen}
        type="budget"
        formData={formData}
        setFormData={setFormData}
        editingId={editingId}
        selectedBudget={selectedBudget}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />

      {/* Budget Card Modal */}
      {budgetModalOpen && (
        <BudgetCardModal
          budget={activeBudget}
          transactions={transactions.filter(
            (tx) => tx.budget_id === activeBudget?.budget_id
          )}
          onClose={() => {
            setBudgetModalOpen(false);
            setActiveBudget(null);
          }}
          onEditBudget={handleEditBudget}
          onAddExpense={handleAddExpense}
          onDeleteTransaction={handleDeleteTransaction} // add this
        />
      )}
    </div>
  );
}
