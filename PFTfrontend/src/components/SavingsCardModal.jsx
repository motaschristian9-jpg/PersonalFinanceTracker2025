import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  DollarSign,
  Calendar,
  Plus,
  TrendingUp,
  PiggyBank,
  Target,
} from "lucide-react";

export default function SavingsCardModal({
  goal,
  onClose,
  onAddSavings,
  transactions = [],
  currentSaved = 0,
}) {
  const [savingsAmount, setSavingsAmount] = useState("");

  useEffect(() => {
    // Handle body scroll lock when modal is open
    document.body.style.overflow = "hidden";

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    // Handle escape key
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  if (!goal) return null;

  const handleAddSavings = async () => {
    if (!savingsAmount || Number(savingsAmount) <= 0) {
      alert("Please enter a valid savings amount.");
      return;
    }

    const remainingAmount = Number(goal.target_amount) - currentSaved;
    if (Number(savingsAmount) > remainingAmount) {
      alert(
        `You only need ₱${remainingAmount.toLocaleString()} more to reach your goal.`
      );
      return;
    }

    if (onAddSavings) {
      const success = await onAddSavings({
        goal_id: goal.id || goal.goal_id,
        amount: Number(savingsAmount),
        description: "Savings deposit",
      });

      if (success !== false) {
        setSavingsAmount("");
        alert(
          `₱${Number(
            savingsAmount
          ).toLocaleString()} added to your savings goal.`
        );
      }
    }
  };

  const targetAmount = Number(goal.target_amount) || 0;
  const savedAmount = currentSaved || 0;
  const remainingAmount = Math.max(0, targetAmount - savedAmount);
  const progressPercentage =
    targetAmount > 0 ? Math.min((savedAmount / targetAmount) * 100, 100) : 0;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div
        className="relative z-10 w-full max-w-6xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>

        <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-green-100/50 overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-100/50 bg-gradient-to-r from-green-50/50 to-emerald-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <PiggyBank className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    {goal.title}
                  </h2>
                  {goal.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {goal.description}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col lg:flex-row overflow-y-auto max-h-[70vh]">
            {/* Left Panel: Goal Details & Progress */}
            <div className="flex-1 p-4 sm:p-6 lg:border-r border-gray-100/50">
              {/* Progress Overview */}
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-200/30 to-blue-300/20 rounded-xl blur opacity-30"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100/50 p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                      <TrendingUp size={18} />
                      <span>Progress Overview</span>
                    </h3>

                    <div className="space-y-4">
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">
                            {progressPercentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-300 ${
                              progressPercentage >= 100
                                ? "bg-green-500"
                                : progressPercentage >= 75
                                ? "bg-blue-500"
                                : progressPercentage >= 50
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{
                              width: `${Math.min(progressPercentage, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Savings Stats Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-green-600 font-medium mb-1">
                            Target
                          </p>
                          <p className="text-lg font-bold text-green-700">
                            ₱{targetAmount.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-blue-600 font-medium mb-1">
                            Saved
                          </p>
                          <p className="text-lg font-bold text-blue-700">
                            ₱{savedAmount.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-orange-600 font-medium mb-1">
                            Remaining
                          </p>
                          <p className="text-lg font-bold text-orange-700">
                            ₱{remainingAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Deadline Info */}
                      {goal.deadline && (
                        <div className="bg-purple-50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Calendar size={16} className="text-purple-600" />
                            <span className="text-sm font-medium text-purple-800">
                              Target Date
                            </span>
                          </div>
                          <p className="text-purple-700 font-bold">
                            {new Date(goal.deadline).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Savings Section */}
              <div className="relative mb-6">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-200/30 to-purple-300/20 rounded-xl blur opacity-30"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100/50 p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <Plus size={18} />
                    <span>Add Savings</span>
                  </h3>

                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 relative">
                        <DollarSign
                          size={18}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="number"
                          placeholder="Enter savings amount"
                          value={savingsAmount}
                          onChange={(e) => setSavingsAmount(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                          min="0"
                          step="0.01"
                          max={remainingAmount}
                        />
                      </div>
                      <button
                        onClick={handleAddSavings}
                        disabled={!savingsAmount || Number(savingsAmount) <= 0}
                        className="px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        <Plus size={16} />
                        <span>Add Savings</span>
                      </button>
                    </div>

                    {remainingAmount > 0 && (
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-sm text-green-700">
                          <span className="font-medium">
                            Remaining to goal:
                          </span>{" "}
                          ₱{remainingAmount.toLocaleString()}
                        </p>
                      </div>
                    )}

                    {progressPercentage >= 100 && (
                      <div className="bg-green-100 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-800 font-medium text-center">
                          Congratulations! You've reached your savings goal!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Transaction History */}
            <div className="flex-1 p-4 sm:p-6 bg-gray-50/30">
              <div className="relative h-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-gray-200/30 to-gray-300/20 rounded-xl blur opacity-30"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100/50 p-4 sm:p-6 h-full flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <Calendar size={18} />
                    <span>Savings History</span>
                  </h3>

                  <div className="flex-1 overflow-y-auto">
                    {transactions.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <PiggyBank className="text-gray-400" size={24} />
                        </div>
                        <p className="text-gray-500 font-medium">
                          No savings yet
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          Start adding savings to track your progress
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {transactions.map((tx, index) => (
                          <div
                            key={tx.id ?? index}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <TrendingUp
                                  size={14}
                                  className="text-green-600"
                                />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">
                                  ₱
                                  {tx.amount
                                    ? Number(tx.amount).toLocaleString()
                                    : "-"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {tx.transaction_date
                                    ? new Date(
                                        tx.transaction_date
                                      ).toLocaleDateString()
                                    : "-"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
