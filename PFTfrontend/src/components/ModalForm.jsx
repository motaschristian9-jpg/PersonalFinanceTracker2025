import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { useAddTransaction, useAddBudget, useAddGoal } from "../api/queries";

export default function ModalForm({
  isOpen,
  type,
  formData,
  setFormData,
  editingId,
  onClose,
  onSubmit,
}) {
  // Hooks must always be at the top
  const [loading, setLoading] = useState(false);
  const addTransactionMutation = useAddTransaction();
  const addBudgetMutation = useAddBudget();
  const addGoalMutation = useAddGoal();

  // Early return if modal is closed
  if (!isOpen) return null;

  // Categories
  const incomeCategories = [
    "Salary",
    "Freelance",
    "Investment",
    "Gift",
    "Other",
  ];
  const expenseCategories = [
    "Food",
    "Transport",
    "Bills",
    "Entertainment",
    "Shopping",
    "Other",
  ];
  const categories = type === "income" ? incomeCategories : expenseCategories;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let payload = {};

      // Validate and prepare payload
      if (type === "income" || type === "expense") {
        if (!formData.amount || !formData.transac_date || !formData.category) {
          throw new Error("Category, amount, and date are required.");
        }

        payload = {
          type: type.charAt(0).toUpperCase() + type.slice(1),
          category:
            formData.category !== "Other"
              ? formData.category
              : formData.customCategory?.trim() || "Other",
          amount: Number(formData.amount),
          transaction_date: formData.transac_date,
          description: formData.description || "",
          editingId: formData.editingId || null, // optional if editing
        };
      } else if (type === "budget") {
        if (
          !formData.category ||
          !formData.amount ||
          !formData.start_date ||
          !formData.end_date
        ) {
          throw new Error("All budget fields are required.");
        }

        payload = {
          category:
            formData.category !== "Other"
              ? formData.category
              : formData.customCategory?.trim() || "Other",
          amount: Number(formData.amount),
          start_date: formData.start_date,
          end_date: formData.end_date,
        };
      } else if (type === "goal") {
        if (!formData.title || !formData.target_amount) {
          throw new Error("Title and target amount are required.");
        }

        payload = {
          title: formData.title,
          target_amount: Number(formData.target_amount),
          deadline: formData.deadline || null,
        };
      } else {
        throw new Error("Invalid form type");
      }

      
      // Call parent onSubmit
      await onSubmit(payload);

      // Parent will handle closing the modal
    } catch (err) {
      console.error("Form submission error:", err);

      const errorMessage =
        err.response?.data?.message ||
        (err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join("\n")
          : err.message || "Something went wrong. Please try again.");

      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: errorMessage,
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative z-10">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X />
        </button>

        <h2 className="text-xl font-bold mb-4 capitalize">
          {type === "income" && "Add Income"}
          {type === "expense" && "Add Expense"}
          {type === "budget" && "Set Budget"}
          {type === "goal" && "Add Savings Goal"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Transactions */}
          {(type === "income" || type === "expense") && (
            <>
              <label className="text-sm text-gray-500">Category</label>
              <select
                value={formData.category || ""}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
                className="border px-2 py-1 rounded"
              >
                <option value="" disabled>
                  Select category
                </option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {formData.category === "Other" && (
                <input
                  type="text"
                  placeholder="Specify category"
                  value={formData.customCategory || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, customCategory: e.target.value })
                  }
                  required
                  className="border px-2 py-1 rounded"
                />
              )}

              <label className="text-sm text-gray-500">Description</label>
              <input
                type="text"
                placeholder="Description (optional)"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="border px-2 py-1 rounded"
              />

              <label className="text-sm text-gray-500">Amount</label>
              <input
                type="number"
                placeholder="Amount"
                value={formData.amount || ""}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
                className="border px-2 py-1 rounded"
              />

              <label className="text-sm text-gray-500">Date</label>
              <input
                type="date"
                value={formData.transac_date || ""}
                onChange={(e) =>
                  setFormData({ ...formData, transac_date: e.target.value })
                }
                required
                className="border px-2 py-1 rounded"
              />
            </>
          )}

          {/* Budget */}
          {type === "budget" && (
            <>
              <label className="text-sm text-gray-500">Category</label>
              <select
                value={formData.category || ""}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
                className="border px-2 py-1 rounded"
              >
                <option value="" disabled>
                  Select category
                </option>
                {expenseCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>

              {formData.category === "Other" && (
                <input
                  type="text"
                  placeholder="Specify category"
                  value={formData.customCategory || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, customCategory: e.target.value })
                  }
                  required
                  className="border px-2 py-1 rounded"
                />
              )}

              <label className="text-sm text-gray-500">Amount</label>
              <input
                type="number"
                placeholder="Amount"
                value={formData.amount || ""}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
                className="border px-2 py-1 rounded"
              />

              <label className="text-sm text-gray-500">Start Date</label>
              <input
                type="date"
                value={formData.start_date || ""}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                required
                className="border px-2 py-1 rounded"
              />

              <label className="text-sm text-gray-500">End Date</label>
              <input
                type="date"
                value={formData.end_date || ""}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                required
                className="border px-2 py-1 rounded"
              />
            </>
          )}

          {/* Goals */}
          {type === "goal" && (
            <>
              <label className="text-sm text-gray-500">Title</label>
              <input
                type="text"
                placeholder="Title"
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                className="border px-2 py-1 rounded"
              />

              <label className="text-sm text-gray-500">Target Amount</label>
              <input
                type="number"
                placeholder="Target Amount"
                value={formData.target_amount || ""}
                onChange={(e) =>
                  setFormData({ ...formData, target_amount: e.target.value })
                }
                required
                className="border px-2 py-1 rounded"
              />

              <label className="text-sm text-gray-500">Deadline</label>
              <input
                type="date"
                value={formData.deadline || ""}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                className="border px-2 py-1 rounded"
              />
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 flex justify-center items-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
