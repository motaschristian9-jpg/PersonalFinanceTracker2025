// src/pages/UserPages/SavingsPage.jsx
import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { Plus, Edit, Trash, Download } from "lucide-react";
import {
  PieChart,
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
import SavingsCardModal from "../../components/SavingsCardModal"; // ✅ modal
import Swal from "sweetalert2";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAddGoal } from "../../api/queries";

export default function SavingsPage() {
  const queryClient = useQueryClient();
  const { user, transactions, budgets, goals, reports } = useOutletContext();
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // ✅ Mutations
  const createGoalMutation = useAddGoal();

  const updateGoalMutation = useMutation({
    mutationFn: (goalData) =>
      api.put(`/dashboard/savings/${goalData.goal_id}`, goalData),
    onSuccess: (res, goalData) => {
      queryClient.invalidateQueries(["savings"]);
      setGoals((prev) =>
        prev.map((g) => (g.goal_id === goalData.goal_id ? res.data : g))
      );
      Swal.fire("Updated!", "Your savings goal has been updated.", "success");
      setIsModalOpen(false);
    },
    onError: () => {
      Swal.fire("Error", "Failed to update the goal.", "error");
    },
  });

  // ✅ Add new goal
  const handleAddGoal = () => {
    setSelectedGoal(null);
    setIsModalOpen(true);
  };

  // ✅ Edit goal
  const handleEditGoal = (goal) => {
    setSelectedGoal(goal);
    setIsModalOpen(true);
  };

  // ✅ Delete goal
  const handleDeleteGoal = async (goalId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This goal will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/dashboard/savings/${goalId}`);
      setGoals((prev) => prev.filter((g) => g.goal_id !== goalId));
      Swal.fire("Deleted!", "Your savings goal has been removed.", "success");
    } catch (error) {
      console.error("Error deleting goal:", error);
      Swal.fire("Error", "Failed to delete the goal.", "error");
    }
  };

  // ✅ Save goal (create or update) using mutations
  const handleSaveGoal = (goalData) => {
    if (goalData.goal_id) {
      // Update existing goal
      updateGoalMutation.mutate(goalData, {
        onSuccess: (response) => {
          Swal.fire({
            icon: "success",
            title: "Goal Updated",
            text: "Your savings goal was updated successfully!",
            showConfirmButton: true,
            confirmButtonText: "OK",
          });
        },
        onError: (error) => {
          Swal.fire({
            icon: "error",
            title: "Update Failed",
            text: error.response?.data?.message || "Something went wrong!",
            showConfirmButton: true,
            confirmButtonText: "OK",
          });
        },
      });
    } else {
      // Create new goal
      createGoalMutation.mutate(goalData, {
        onSuccess: (response) => {
          Swal.fire({
            icon: "success",
            title: "Goal Added",
            text: "Your savings goal was added successfully!",
            showConfirmButton: true,
            confirmButtonText: "OK",
          });
        },
        onError: (error) => {
          Swal.fire({
            icon: "error",
            title: "Creation Failed",
            text: error.response?.data?.message || "Something went wrong!",
            showConfirmButton: true,
            confirmButtonText: "OK",
          });
        },
      });
    }
  };

  // ✅ Chart data
  const progressData = useMemo(() => {
    const totalTarget = goals.reduce(
      (sum, g) => sum + Number(g.target_amount),
      0
    );
    const totalSaved = goals.reduce(
      (sum, g) => sum + Number(g.current_amount),
      0
    );
    return [
      { name: "Saved", value: totalSaved },
      { name: "Remaining", value: totalTarget - totalSaved },
    ];
  }, [goals]);

  const barData = useMemo(() => {
    return goals.map((g) => ({
      name: g.title,
      Saved: Number(g.current_amount),
      Target: Number(g.target_amount),
    }));
  }, [goals]);

  const COLORS = ["#10B981", "#F87171"];

  // ✅ Status helper
  const getStatus = (goal) => {
    if (Number(goal.current_amount) >= Number(goal.target_amount))
      return "Completed";
    const now = new Date();
    const deadline = goal.deadline ? new Date(goal.deadline) : null;
    if (deadline && now > deadline) return "Behind";
    return "On Track";
  };

  return (
    <div>
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search savings goals..."
            className="border rounded-md px-3 py-2 w-64"
          />
          <select className="border rounded-md px-3 py-2">
            <option>Sort by Goal Amount</option>
            <option>Sort by Progress</option>
            <option>Sort by Deadline</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download size={16} /> Export
          </Button>
          <div className="w-10 h-10 rounded-full bg-gray-300"></div>
        </div>
      </div>

      {/* Page Title & Quick Actions */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🎯 Savings Goals</h1>
        <Button className="flex items-center gap-2" onClick={handleAddGoal}>
          <Plus size={16} /> Add New Goal
        </Button>
      </div>

      {/* Active Goals (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {goals.map((goal) => {
          const remaining =
            Number(goal.target_amount) - Number(goal.current_amount);
          const progress =
            (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
          const status = getStatus(goal);
          return (
            <Card key={goal.goal_id}>
              <CardHeader>
                <CardTitle>{goal.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Target: ₱{Number(goal.target_amount).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Saved: ₱{Number(goal.current_amount).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Remaining: ₱{remaining.toLocaleString()}
                </p>
                <Progress value={progress} className="my-2" />
                <p className="text-sm">Deadline: {goal.deadline || "N/A"}</p>
                <p
                  className={`text-sm font-semibold ${
                    status === "Completed"
                      ? "text-green-600"
                      : status === "Behind"
                      ? "text-red-600"
                      : "text-blue-600"
                  }`}
                >
                  Status: {status}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Savings Table */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Detailed Goals</h2>
        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2 border">Goal Name</th>
                <th className="px-4 py-2 border">Target</th>
                <th className="px-4 py-2 border">Saved</th>
                <th className="px-4 py-2 border">Remaining</th>
                <th className="px-4 py-2 border">Deadline</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {goals.map((goal) => {
                const remaining =
                  Number(goal.target_amount) - Number(goal.current_amount);
                const status = getStatus(goal);
                return (
                  <tr key={goal.goal_id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{goal.title}</td>
                    <td className="px-4 py-2 border">
                      ₱{Number(goal.target_amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 border">
                      ₱{Number(goal.current_amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 border">
                      ₱{remaining.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 border">
                      {goal.deadline || "N/A"}
                    </td>
                    <td className="px-4 py-2 border">{status}</td>
                    <td className="px-4 py-2 border flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditGoal(goal)}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteGoal(goal.goal_id)}
                      >
                        <Trash size={14} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights Section with Recharts */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Savings Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={progressData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    label
                  >
                    {progressData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Savings per Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Target" fill="#93C5FD" />
                  <Bar dataKey="Saved" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">💡 Savings Tips</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Add ₱500 weekly to reach your Vacation goal by December.</li>
          <li>
            You’ve completed{" "}
            {goals.filter((g) => getStatus(g) === "Completed").length} goals so
            far!
          </li>
        </ul>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <SavingsCardModal
          goal={selectedGoal}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveGoal}
        />
      )}
    </div>
  );
}
