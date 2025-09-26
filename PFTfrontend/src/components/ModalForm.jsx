import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

export default function ModalForm({
  isOpen,
  type,
  formData,
  setFormData,
  editingId,
  selectedBudget = null,
  onClose,
  onSubmit,
}) {
  const [loading, setLoading] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState(""); // new state for budget expense

  if (!isOpen) return null;

  // Define categories separately
  const expenseCategories = [
    "Food",
    "Transport",
    "Bills",
    "Entertainment",
    "Shopping",
    "Other",
  ];

  const incomeCategories = [
    "Salary",
    "Business",
    "Investments",
    "Freelancing",
    "Gifts",
    "Other",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let payload = {};

      if (type === "income" || type === "expense") {
        if (
          !formData.amount ||
          !formData.transaction_date ||
          !formData.category
        ) {
          throw new Error("Category, amount, and date are required.");
        }

        payload = {
          type: type.charAt(0).toUpperCase() + type.slice(1),
          category: formData.category,
          amount: Number(formData.amount),
          transaction_date: formData.transaction_date,
          description: formData.description || "",
          editingId: editingId || null,
        };
      } else if (type === "budget") {
        if (selectedBudget && expenseAmount) {
          payload = {
            budget_id: selectedBudget.budget_id,
            amount: Number(expenseAmount),
          };
        } else {
          if (
            !formData.category ||
            !formData.amount ||
            !formData.start_date ||
            !formData.end_date
          ) {
            throw new Error("All budget fields are required.");
          }
          payload = {
            category: formData.category,
            amount: Number(formData.amount),
            start_date: formData.start_date,
            end_date: formData.end_date,
            description: formData.description || "",
            editingId: editingId || null,
          };
        }
      } else {
        throw new Error("Invalid form type");
      }

      await onSubmit(payload);

      if (expenseAmount) setExpenseAmount("");
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
          {type === "income" && (editingId ? "Edit Income" : "Add Income")}
          {type === "expense" && (editingId ? "Edit Expense" : "Add Expense")}
          {type === "budget" &&
            (selectedBudget
              ? `Budget: ${selectedBudget.category}`
              : "Set Budget")}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Income / Expense */}
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
                {(type === "income" ? incomeCategories : expenseCategories).map(
                  (cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  )
                )}
              </select>

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
                value={formData.transaction_date || ""}
                onChange={(e) =>
                  setFormData({ ...formData, transaction_date: e.target.value })
                }
                required
                className="border px-2 py-1 rounded"
              />
            </>
          )}

          {/* Budget */}
          {type === "budget" && (
            <>
              {!selectedBudget && (
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
                  </select>

                  <label className="text-sm text-gray-500">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter a short description"
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="border px-2 py-1 rounded w-full"
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

              {selectedBudget && (
                <>
                  <label className="text-sm text-gray-500">Add Expense</label>
                  <input
                    type="number"
                    placeholder="Expense Amount"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="border px-2 py-1 rounded"
                  />
                </>
              )}
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
