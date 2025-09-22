import React, { useState, useEffect } from "react";
import { Edit, Trash2, X } from "lucide-react";

export default function BudgetModal({
  budget,
  transactions = [],
  onClose,
  onEditBudget,
  onEditTransaction,
  onDeleteTransaction,
}) {
  // Initialize localBudget safely
  const [localBudget, setLocalBudget] = useState(
    budget || { amount: 0, notes: "" }
  );

  useEffect(() => {
    if (budget) {
      setLocalBudget({
        ...budget,
        amount: budget.amount ?? 0,
        notes: budget.notes || "",
      });
    }
  }, [budget]);

  if (!budget) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-11/12 md:w-3/4 lg:w-2/3 max-h-[80vh] overflow-y-auto flex">
        {/* Left: Budget Details */}
        <div className="w-full md:w-1/2 p-6 border-r">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Budget: {budget.category}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Budget Amount
            </label>
            <input
              type="number"
              value={localBudget.amount ?? 0}
              onChange={(e) =>
                setLocalBudget({ ...localBudget, amount: e.target.value })
              }
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Notes
            </label>
            <textarea
              value={localBudget.notes || ""}
              onChange={(e) =>
                setLocalBudget({ ...localBudget, notes: e.target.value })
              }
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={3}
            />
          </div>

          <button
            onClick={() => onEditBudget(localBudget)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>

        {/* Right: Mini Transaction History */}
        <div className="w-full md:w-1/2 p-6 overflow-y-auto">
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
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2">
                      {tx.date ? new Date(tx.date).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-3 py-2">
                      ₱{tx.amount ? Number(tx.amount).toLocaleString() : "-"}
                    </td>
                    <td className="px-3 py-2 flex gap-2">
                      {onEditTransaction && (
                        <button
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          onClick={() => onEditTransaction(tx)}
                        >
                          <Edit size={14} /> Edit
                        </button>
                      )}
                      {onDeleteTransaction && (
                        <button
                          className="text-red-600 hover:text-red-800 flex items-center gap-1"
                          onClick={() => onDeleteTransaction(tx)}
                        >
                          <Trash2 size={14} /> Delete
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
