import React, { useState, useEffect } from "react";
import { Edit, X, Plus } from "lucide-react";
import Swal from "sweetalert2";

export default function BudgetModal({
  budget,
  transactions = [],
  onClose,
  onEditBudget,
  onAddExpense,
  onDeleteTransaction,
}) {
  const [localBudget, setLocalBudget] = useState(
    budget || { allocated: 0, spent: 0, description: "" }
  );
  const [allocatedInput, setAllocatedInput] = useState(
    localBudget.amount?.toString() || ""
  );

  const [isEditing, setIsEditing] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [descriptionInput, setDescriptionInput] = useState(
    localBudget.description || ""
  );

  const remaining = isEditing
    ? Number(allocatedInput || 0) - Number(localBudget.spent || 0)
    : Number(localBudget.amount || 0) - Number(localBudget.spent || 0);

  useEffect(() => {
    if (budget) {
      setLocalBudget({
        allocated: Number(budget.allocated ?? 0),
        spent: Number(budget.spent ?? 0),
        description: budget.description || "",
        ...budget,
      });
      setAllocatedInput(budget.allocated?.toString() || "");
      setDescriptionInput(budget.description || "");
    }
  }, [budget]);

  if (!budget) return null;

  const handleSaveChanges = async () => {
    await onEditBudget({
      ...localBudget,
      allocated: Number(allocatedInput) || 0,
      description: descriptionInput || "",
    });
    setIsEditing(false);
  };

  const handleAddExpense = async () => {
    if (!expenseAmount || Number(expenseAmount) <= 0) return;

    // ✅ Check remaining locally before sending
    const remainingAmount =
      Number(localBudget.amount || 0) - Number(localBudget.spent || 0);
    if (Number(expenseAmount) > remainingAmount) {
      Swal.fire({
        icon: "error",
        title: "Exceeded Budget",
        text: `You only have ₱${remainingAmount.toLocaleString()} remaining in this budget.`,
        confirmButtonColor: "#EF4444",
      });
      return; // Stop submission
    }

    // Call parent handler
    const success = await onAddExpense({
      budget_id: budget.budget_id,
      amount: Number(expenseAmount),
      description: "Budget Expense",
    });

    // ✅ Only update spent if the expense was successfully added
    if (success !== false) {
      setLocalBudget((prev) => ({
        ...prev,
        spent: Number(prev.spent) + Number(expenseAmount),
      }));
      setExpenseAmount("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      <div
        className="relative z-10 bg-white rounded-xl shadow-lg w-full max-w-4xl overflow-y-auto flex flex-col md:flex-row p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Budget Details */}
        <div className="w-full md:w-1/2 pr-0 md:pr-6 border-b md:border-b-0 md:border-r mb-4 md:mb-0">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold">
                Budget: {localBudget.category}
              </h2>
              {!isEditing && (
                <p className="text-gray-600 text-sm">
                  {localBudget.description || "No description"}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Edit size={16} /> {isEditing ? "Cancel" : "Edit"}
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Budget Info */}
          <div className="mb-4 space-y-3">
            {isEditing ? (
              <div className="flex flex-col gap-2">
                {/* Allocated */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Allocated:
                  </span>
                  <input
                    type="number"
                    value={allocatedInput}
                    onChange={(e) => setAllocatedInput(e.target.value)}
                    className="w-60 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="Allocated"
                  />
                </div>

                {/* Description */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Description:
                  </span>
                  <input
                    type="text"
                    value={descriptionInput}
                    onChange={(e) => setDescriptionInput(e.target.value)}
                    className="w-60 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="Description"
                  />
                </div>

                {/* Start Date */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Start Date:
                  </span>
                  <input
                    type="date"
                    value={localBudget.start_date}
                    onChange={(e) =>
                      setLocalBudget({
                        ...localBudget,
                        start_date: e.target.value,
                      })
                    }
                    className="w-60 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>

                {/* End Date */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    End Date:
                  </span>
                  <input
                    type="date"
                    value={localBudget.end_date}
                    onChange={(e) =>
                      setLocalBudget({
                        ...localBudget,
                        end_date: e.target.value,
                      })
                    }
                    className="w-60 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </div>
            ) : (
              <>
                {/* Allocated */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Allocated:
                  </span>
                  <span className="text-sm font-semibold">
                    ₱{Number(localBudget.amount).toLocaleString()}
                  </span>
                </div>

                {/* Spent */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Spent:
                  </span>
                  <span className="text-sm font-semibold">
                    ₱{Number(localBudget.spent).toLocaleString()}
                  </span>
                </div>

                {/* Remaining */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Remaining:
                  </span>
                  <span className="text-sm font-semibold">
                    ₱{remaining.toLocaleString()}
                  </span>
                </div>

                {/* Add Expense Section */}
                <div className="mt-2">
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      placeholder="Add expense"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      className="w-66 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                      onClick={handleAddExpense}
                      className="bg-green-600 text-white px-2 py-2 rounded hover:bg-green-700 flex items-center gap-1"
                    >
                      <Plus size={16} /> Add Expense
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Save Changes Button */}
          {isEditing && (
            <button
              onClick={handleSaveChanges}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Save Changes
            </button>
          )}
        </div>

        {/* Right: Transaction History */}
        <div className="w-full md:w-1/2 md:pl-6 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-2">Transaction History</h3>
          {transactions.length === 0 ? (
            <p className="text-gray-500">No transactions yet.</p>
          ) : (
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr
                    key={tx.id ?? index}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="px-3 py-2">
                      {tx.transaction_date
                        ? new Date(tx.transaction_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-3 py-2">
                      ₱{tx.amount ? Number(tx.amount).toLocaleString() : "-"}
                    </td>
                    <td className="px-3 py-2 flex gap-2">
                      {onDeleteTransaction && (
                        <button
                          className="text-red-600 hover:text-red-800 flex items-center gap-1"
                          onClick={async () => {
                            await onDeleteTransaction(tx);

                            // ✅ Update local spent immediately for realtime Remaining update
                            setLocalBudget((prev) => ({
                              ...prev,
                              spent:
                                Number(prev.spent) - Number(tx.amount || 0),
                            }));
                          }}
                        >
                          <X size={14} /> Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
