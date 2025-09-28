// src/components/SavingsCardModal.jsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function SavingsCardModal({ goal, onClose, onSave }) {
  const [localGoal, setLocalGoal] = useState(
    goal || { title: "", target_amount: "", deadline: "" }
  );

  useEffect(() => {
    if (goal) {
      setLocalGoal({
        ...goal,
        target_amount: goal.target_amount === 0 ? "" : goal.target_amount,
        title: goal.title || "",
        deadline: goal.deadline || "",
      });
    }
  }, [goal]);

  const handleSave = () => {
    if (!localGoal.title || localGoal.target_amount === "") {
      alert("Please fill in the goal title and target amount.");
      return;
    }

    onSave({
      ...localGoal,
      target_amount: Number(localGoal.target_amount) || 0,
      title: localGoal.title.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4">
          {goal ? "Edit Savings Goal" : "Add Savings Goal"}
        </h2>

        {/* Goal Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Goal Title</label>
          <input
            type="text"
            value={localGoal.title}
            onChange={(e) =>
              setLocalGoal({ ...localGoal, title: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. New Laptop, Emergency Fund"
          />
        </div>

        {/* Target Amount */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Target Amount
          </label>
          <input
            type="number"
            value={localGoal.target_amount}
            onChange={(e) =>
              setLocalGoal({ ...localGoal, target_amount: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Enter target amount"
          />
        </div>

        {/* Deadline */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Deadline</label>
          <input
            type="date"
            value={localGoal.deadline}
            onChange={(e) =>
              setLocalGoal({ ...localGoal, deadline: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
