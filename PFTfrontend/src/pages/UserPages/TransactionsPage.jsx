import { useState } from "react";
import {
  PlusCircle,
  MinusCircle,
  Edit,
  Trash,
  Loader2,
  Search,
  Filter,
} from "lucide-react";
import ModalForm from "../../components/ModalForm";
import Swal from "sweetalert2";
import {
  useAddTransaction,
  useDeleteTransaction,
  useUpdateTransaction,
} from "../../api/queries";
import { useOutletContext } from "react-router-dom";

export default function Transactions() {
  const { transactions } = useOutletContext();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [searchText, setSearchText] = useState("");

  // ================= Mutations =================
  const addTransactionMutation = useAddTransaction();

  const updateTransactionMutation = useUpdateTransaction();

  const deleteTransactionMutation = useDeleteTransaction();

  // ================= Modal Handlers =================
  const handleOpenModal = (type, transaction = null) => {
    setModalType(type);

    if (transaction) {
      const txId = transaction.transaction_id;
      setEditingId(txId);

      setFormData({
        category: transaction.category,
        amount: transaction.amount,
        description: transaction.description || "",
        transaction_date: transaction.transaction_date,
      });
    } else {
      setEditingId(null);
      setFormData({
        category: "",
        amount: "",
        description: "",
        transac_date: "",
        title: "",
        target_amount: "",
        deadline: "",
      });
    }

    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (payload) => {
    try {
      const txData = {
        type: modalType === "income" ? "Income" : "Expense",
        category: payload.category,
        amount: Number(payload.amount),
        transaction_date: payload.transaction_date,
        description: payload.description || "",
      };

      if (editingId) {
        await updateTransactionMutation.mutateAsync({
          id: editingId,
          data: txData,
        });

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Transaction updated!",
          confirmButtonColor: "#10B981",
        });
      } else {
        await addTransactionMutation.mutateAsync(txData);

        Swal.fire({
          icon: "success",
          title: "Success",
          text: modalType === "income" ? "Income added!" : "Expense added!",
          confirmButtonColor: "#10B981",
        });
      }

      setModalOpen(false);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  const handleDelete = (txId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This transaction will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#10B981",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteTransactionMutation.mutate(txId, {
          onSuccess: () => {
            Swal.fire("Deleted!", "Transaction has been deleted.", "success");
          },
          onError: (error) => {
            Swal.fire(
              "Error!",
              error.response?.data?.message || "Failed to delete transaction.",
              "error"
            );
          },
        });
      }
    });
  };

  // ================= Filtered Transactions =================
  const filteredTransactions = transactions.filter((tx) => {
    const typeMatch =
      filterType === "all" ? true : tx.type?.toLowerCase() === filterType;
    const descMatch = tx.description
      ?.toLowerCase()
      .includes(searchText.toLowerCase());
    return typeMatch && descMatch;
  });

  // ================= Totals =================
  const totalIncome = transactions
    .filter((t) => t.type?.toLowerCase() === "income")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.type?.toLowerCase() === "expense")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const netBalance = totalIncome - totalExpenses;

  return (
    <div>
      {/* Page Title & Quick Actions */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📜 Transactions</h1>
        <div className="flex space-x-3">
          <button
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            onClick={() => handleOpenModal("income")}
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Add Income
          </button>
          <button
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            onClick={() => handleOpenModal("expense")}
          >
            <MinusCircle className="mr-2 h-5 w-5" /> Add Expense
          </button>
        </div>
      </div>

      <section className="bg-white p-4 rounded-lg shadow-sm border space-y-3">
        <div className="flex flex-wrap items-center gap-4">
          {/* Filter by Type */}
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {/* Search Description */}
          <div className="flex items-center space-x-2">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search description..."
              className="border rounded-lg px-3 py-2 text-sm w-48 md:w-64"
            />
          </div>
        </div>
      </section>

      {/* Transactions Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="max-h-64 overflow-y-auto">
          {" "}
          {/* smaller height */}
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 border-b">Date</th>
                <th className="py-3 px-4 border-b">Category</th>
                <th className="py-3 px-4 border-b">Description</th>
                <th className="py-3 px-4 border-b">Amount</th>
                <th className="py-3 px-4 border-b">Type</th>
                <th className="py-3 px-4 border-b text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const txId = tx.id || tx._id || tx.transaction_id;
                  return (
                    <tr key={txId} className="hover:bg-gray-50">
                      <td className="py-3 px-4 border-b">
                        {tx.transaction_date
                          ? new Date(tx.transaction_date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="py-3 px-4 border-b">
                        {tx.category || "-"}
                      </td>
                      <td className="py-3 px-4 border-b">
                        {tx.description || "-"}
                      </td>
                      <td
                        className={`py-3 px-4 border-b ${
                          tx.type?.toLowerCase() === "income"
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {tx.type?.toLowerCase() === "income" ? "+" : "-"} ₱
                        {Number(tx.amount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 border-b">{tx.type || "-"}</td>
                      <td className="py-3 px-4 border-b text-right space-x-2">
                        <button
                          className="text-blue-500 hover:text-blue-700"
                          onClick={() =>
                            handleOpenModal(tx.type?.toLowerCase(), tx)
                          }
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(txId)}
                        >
                          <Trash size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-gray-500">💰 Total Income</h3>
          <p className="text-2xl font-bold text-green-600">
            ₱{totalIncome.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-gray-500">💸 Total Expenses</h3>
          <p className="text-2xl font-bold text-red-500">
            ₱{totalExpenses.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-gray-500">🏦 Net Balance</h3>
          <p className="text-2xl font-bold text-emerald-600">
            ₱{netBalance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Modal Form */}
      <ModalForm
        isOpen={modalOpen}
        type={modalType}
        formData={formData}
        setFormData={setFormData}
        editingId={editingId}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
