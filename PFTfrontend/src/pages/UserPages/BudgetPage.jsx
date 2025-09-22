// src/pages/UserPages/BudgetsPage.jsx
import React, { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
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
import { Plus, Edit, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ModalForm from "../../components/ModalForm";
import BudgetCardModal from "../../components/BudgetCardModal";

import {
  fetchBudgets,
  addBudget,
  updateBudget,
  deleteBudget,
  addExpenseToBudget,
} from "../../api/api";

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"];

const BudgetsPage = () => {
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [selectedBudget, setSelectedBudget] = useState(null);

  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [activeBudget, setActiveBudget] = useState(null);

  const safeNumber = (n) => (typeof n === "number" ? n : 0);

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ["budgets"],
    queryFn: async () => {
      const res = await fetchBudgets();
      return res.data.map((b) => ({
        ...b,
        allocated: Number(b.amount) || 0,
        spent: Number(b.spent ?? 0),
      }));
    },
    refetchOnWindowFocus: false,
  });

  const budgetMutation = useMutation({
    mutationFn: addBudget,
    onSuccess: () => queryClient.invalidateQueries(["budgets"]),
  });

  const updateBudgetMutation = useMutation({
    mutationFn: updateBudget,
    onSuccess: () => queryClient.invalidateQueries(["budgets"]),
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => queryClient.invalidateQueries(["budgets"]),
  });

  const addExpenseMutation = useMutation({
    mutationFn: addExpenseToBudget,
    onSuccess: () => queryClient.invalidateQueries(["budgets"]),
  });

  const handleOpenModal = (budget = null) => {
    if (budget) {
      setSelectedBudget(budget);
      setFormData({
        category: budget.category ?? "",
        amount: safeNumber(budget.allocated),
        start_date: budget.start_date || "",
        end_date: budget.end_date || "",
      });
      setEditingId(budget.budget_id);
    } else {
      setSelectedBudget(null);
      setFormData({ category: "", amount: "", start_date: "", end_date: "" });
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
        await updateBudgetMutation.mutateAsync({ id: editingId, ...data });
        Swal.fire({
          icon: "success",
          title: "Budget updated!",
          confirmButtonColor: "#10B981",
        });
      } else {
        await budgetMutation.mutateAsync(data);
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

  if (isLoading)
    return (
      <DashboardLayout>
        <p className="p-6">Loading budgets...</p>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
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

      {/* Active Budgets Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {budgets.map((b, i) => {
          const allocated = safeNumber(b.allocated);
          const spent = safeNumber(b.spent);
          const remaining = allocated - spent;
          const percent = allocated > 0 ? (spent / allocated) * 100 : 0;

          // Determine status
          let status = "✅ On Track";
          if (spent >= allocated && allocated > 0) status = "❌ Overspent";
          else if (percent > 80) status = "⚠️ Near Limit";

          return (
            <div
              key={i}
              className="p-6 rounded-2xl border bg-white shadow-md hover:shadow-lg cursor-pointer"
              onClick={() => {
                setActiveBudget(b);
                setBudgetModalOpen(true);
              }}
            >
              <h2 className="font-semibold text-lg mb-2">
                {b.category ?? "Unknown"}
              </h2>
              <p className="text-sm text-gray-500">
                Allocated: ₱{allocated.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                Spent: ₱{spent.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mb-2">
                Remaining: ₱{remaining.toLocaleString()}
              </p>

              {/* Progress Bar */}
              <Progress value={percent} className="mt-2 mb-2" />

              {/* Status */}
              <p
                className={`mt-2 text-sm font-medium ${
                  status.includes("❌")
                    ? "text-red-500"
                    : status.includes("⚠️")
                    ? "text-yellow-500"
                    : "text-green-500"
                }`}
              >
                {status}
              </p>
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
                const allocated = safeNumber(b.allocated);
                const spent = safeNumber(b.spent);
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
                        variant="outline"
                        onClick={() => handleOpenModal(b)}
                      >
                        <Edit size={16} />
                      </Button>
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
        <Card className="p-4">
          <h2 className="font-semibold mb-4">Budget Distribution</h2>
          <PieChart width={350} height={300}>
            <Pie
              data={budgets.filter((b) => b.allocated > 0)}
              dataKey="allocated"
              nameKey="category"
              outerRadius={120}
              fill="#8884d8"
              label
            >
              {budgets
                .filter((b) => b.allocated > 0)
                .map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold mb-4">Budget vs Spending</h2>
          <BarChart
            width={400}
            height={300}
            data={budgets.filter((b) => b.allocated > 0)}
          >
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

      {/* Semi Transaction History Modal */}
      <BudgetCardModal
        isOpen={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        budget={activeBudget}
        transactions={activeBudget?.transactions || []} // <-- safe default
        onAddExpense={addExpenseMutation.mutateAsync}
      />
    </DashboardLayout>
  );
};

export default BudgetsPage;
