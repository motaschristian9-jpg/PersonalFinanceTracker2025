import axios from "axios";

// Axios instance
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // Laravel API base
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor → add token
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor → handle expired/unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("⚠️ Unauthorized! Token may have expired.");
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      // window.location.href = "/login"; // uncomment to auto-redirect
    }
    return Promise.reject(error);
  }
);

export default api;

/* -------------------------
   API Helper Functions
   ------------------------- */

// --- User ---
export const fetchProfile = () => api.get("/profile");

// --- Transactions ---
export const fetchTransactions = () => api.get("/dashboard/transactions");

export const addTransaction = (data) => {
  return api.post("/dashboard/transactions", {
    type: data.type?.toLowerCase() === "income" ? "Income" : "Expense",
    category: data.category === "Other" ? data.customCategory : data.category,
    amount: Number(data.amount),
    transaction_date: data.transaction_date,
    description: data.description || "",
  });
};

export const updateTransaction = (id, data) => {
  // Use PUT with the transaction id
  return api.put(`/dashboard/transactions/${id}`, data);
};

export const deleteTransaction = (id) =>
  api.delete(`/dashboard/transactions/${id}`);

// --- Budgets ---
export const fetchBudgets = () => api.get("/dashboard/budgets");

export const addBudget = (data) =>
  api.post("/dashboard/budgets", {
    category: data.category === "Other" ? data.customCategory : data.category,
    amount: Number(data.amount), // must match 'amount' in backend
    start_date: data.start_date, // must match 'start_date' in backend
    end_date: data.end_date, // must match 'end_date' in backend
  });

export const updateBudget = (id, data) =>
  api.put(`/dashboard/budgets/${id}`, {
    category: data.category === "Other" ? data.customCategory : data.category,
    limit: Number(data.limit),
  });

export const deleteBudget = (id) => api.delete(`/dashboard/budgets/${id}`);

// --- Savings Goals ---
export const fetchGoals = () => api.get("/dashboard/savings-goals");
export const addGoal = (data) =>
  api.post("/dashboard/savings-goals", {
    title: data.title,
    target_amount: Number(data.target_amount),
    deadline: data.deadline || null,
  });
export const updateGoal = (id, data) =>
  api.put(`/dashboard/savings-goals/${id}`, {
    title: data.title,
    target_amount: Number(data.target_amount),
    deadline: data.deadline || null,
  });
export const deleteGoal = (id) => api.delete(`/dashboard/savings-goals/${id}`);

// --- Reports ---
export const fetchReports = () => api.get("/dashboard/reports");
export const generateReport = (data) => api.post("/dashboard/reports", data);
