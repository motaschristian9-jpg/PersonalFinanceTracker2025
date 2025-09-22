// src/pages/UserPages/IncomePage.jsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
  Plus,
  Filter,
  Calendar,
  FileDown,
  Edit,
  Trash2,
  Search,
} from "lucide-react";
import ModalForm from "../../components/ModalForm";
import { exportToExcel } from "../../utils/exportUtils";
import {
  fetchTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from "../../api/api";

export default function IncomePage() {
  const queryClient = useQueryClient();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("This Month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [sourceFilter, setSourceFilter] = useState("All Sources");

  // Fetch all transactions, then filter Income
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => (await fetchTransactions()).data,
  });

  const incomeTransactions = transactions.filter(
    (t) => t.type?.toLowerCase() === "income"
  );

  // Mutations
  const addMutation = useMutation({
    mutationFn: addTransaction,
    onSuccess: () => queryClient.invalidateQueries(["transactions"]),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateTransaction(id, data),
    onSuccess: () => queryClient.invalidateQueries(["transactions"]),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => queryClient.invalidateQueries(["transactions"]),
  });

  // Modal handling
  const handleAdd = () => {
    setFormData({});
    setEditingId(null);
    setModalOpen(true);
  };

  const handleEdit = (tx) => {
    setEditingId(tx.transaction_id);
    const formattedDate = tx.transaction_date
      ? new Date(tx.transaction_date).toISOString().split("T")[0]
      : "";

    setFormData({
      category: tx.category || "",
      amount: tx.amount || "",
      description: tx.description || "",
      transaction_date: formattedDate,
    });

    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the income record.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
    });
    if (confirm.isConfirmed) {
      await deleteMutation.mutateAsync(id);
      Swal.fire("Deleted!", "Income record has been deleted.", "success");
    }
  };

  const handleSubmit = async (data) => {
    const payload = {
      type: "Income",
      category: data.category,
      amount: parseFloat(data.amount),
      transaction_date: data.transaction_date,
      description: data.description || "",
    };

    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, data: payload });
      Swal.fire("Updated!", "Income updated successfully.", "success");
    } else {
      await addMutation.mutateAsync(payload);
      Swal.fire("Added!", "New income record added.", "success");
    }

    setModalOpen(false);
    setEditingId(null);
  };

  // Filtering logic
  const filteredIncome = incomeTransactions.filter((tx) => {
    const descMatch = tx.description
      ?.toLowerCase()
      .includes(search.toLowerCase());

    let dateMatch = true;
    const txDate = new Date(tx.transaction_date);

    if (dateFilter === "This Month") {
      const now = new Date();
      dateMatch =
        txDate.getMonth() === now.getMonth() &&
        txDate.getFullYear() === now.getFullYear();
    } else if (dateFilter === "Last Month") {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      dateMatch =
        txDate.getMonth() === lastMonth.getMonth() &&
        txDate.getFullYear() === lastMonth.getFullYear();
    } else if (dateFilter === "Custom Range" && customStart && customEnd) {
      const start = new Date(customStart);
      const end = new Date(customEnd);
      dateMatch = txDate >= start && txDate <= end;
    }

    let sourceMatch = true;
    if (sourceFilter !== "All Sources") {
      if (sourceFilter === "Others") {
        const mainSources = ["Salary", "Freelance", "Investments", "Business"];
        sourceMatch = !mainSources.includes(tx.category);
      } else {
        sourceMatch = tx.category === sourceFilter;
      }
    }

    return descMatch && dateMatch && sourceMatch;
  });

  // Summary calculations
  const totalIncome = filteredIncome.reduce(
    (sum, tx) => sum + Number(tx.amount || 0),
    0
  );

  const highestSource =
    filteredIncome.length > 0
      ? filteredIncome.reduce((max, tx) =>
          Number(tx.amount) > Number(max.amount) ? tx : max
        ).category
      : "—";

  const avgMonthlyIncome =
    totalIncome /
      new Set(
        filteredIncome.map((tx) => new Date(tx.transaction_date).getMonth())
      ).size || 0;

  return (
    <DashboardLayout>
      {/* Page Title & Quick Actions */}
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Income</h1>
          <p className="text-gray-600">Track and manage your income records.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleAdd}
            className="flex items-center bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
          >
            <Plus size={18} className="mr-2" /> Add Income
          </button>
          <button
            onClick={() =>
              exportToExcel(filteredIncome, {
                totalIncome,
                highestSource,
                avgMonthlyIncome,
              })
            }
            className="flex items-center border px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            <FileDown size={18} className="mr-2" /> Export
          </button>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="bg-white p-4 rounded-lg shadow-sm border space-y-3">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex items-center space-x-2">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {/* Date filter */}
          <div className="flex items-center space-x-2">
            <Calendar size={18} className="text-gray-500" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option>This Month</option>
              <option>Last Month</option>
              <option>Custom Range</option>
            </select>
          </div>

          {/* Custom Range */}
          {dateFilter === "Custom Range" && (
            <div className="flex space-x-2 items-center">
              <label className="flex items-center space-x-1 text-sm text-gray-600">
                <span>From:</span>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm"
                />
              </label>

              <label className="flex items-center space-x-1 text-sm text-gray-600">
                <span>To:</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm"
                />
              </label>
            </div>
          )}

          {/* Source filter */}
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-500" />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option>All Sources</option>
              <option>Salary</option>
              <option>Freelance</option>
              <option>Investments</option>
              <option>Business</option>
              <option>Others</option>
            </select>
          </div>
        </div>
      </section>

      {/* Income Table */}
      <section className="bg-white p-4 rounded-lg shadow-sm border">
        {isLoading ? (
          <p>Loading income...</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Source/Category</th>
                <th className="py-2 px-3">Description</th>
                <th className="py-2 px-3">Amount</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncome.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No income records found.
                  </td>
                </tr>
              ) : (
                filteredIncome.map((tx) => (
                  <tr
                    key={tx.transaction_id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-2 px-3">
                      {new Date(tx.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3">{tx.category}</td>
                    <td className="py-2 px-3">{tx.description}</td>
                    <td className="py-2 px-3 text-emerald-600 font-semibold">
                      ₱{Number(tx.amount).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 flex space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => handleEdit(tx)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDelete(tx.transaction_id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </section>

      {/* Income Summary */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">💰 Total Income</p>
          <p className="text-lg font-bold text-emerald-600">
            ₱{totalIncome.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">📈 Highest Income Source</p>
          <p className="text-lg font-bold">{highestSource}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">📅 Avg. Monthly Income</p>
          <p className="text-lg font-bold">
            ₱{avgMonthlyIncome.toFixed(2).toLocaleString()}
          </p>
        </div>
      </section>

      {/* Modal for Add/Edit */}
      <ModalForm
        isOpen={modalOpen}
        type="income"
        formData={formData}
        setFormData={setFormData}
        editingId={editingId}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </DashboardLayout>
  );
}
