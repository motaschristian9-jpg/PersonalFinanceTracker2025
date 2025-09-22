import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTransactions,
  fetchBudgets,
  fetchGoals,
  fetchReports,
  fetchProfile,
  addTransaction,
  addBudget,
  addGoal,
  updateTransaction,
  updateBudget,
  updateGoal,
  deleteTransaction,
  deleteBudget,
  deleteGoal,
} from "./api";

// ------------------ HELPER ------------------
const useFetch = (key, fetchFn) =>
  useQuery({
    queryKey: [key],
    queryFn: fetchFn,
    refetchOnWindowFocus: false,
  });

// ------------------ QUERIES ------------------
export const useProfile = () => useFetch("profile", fetchProfile);
export const useTransactions = () =>
  useFetch("transactions", fetchTransactions);
export const useBudgets = () => useFetch("budgets", fetchBudgets);
export const useGoals = () => useFetch("goals", fetchGoals);
export const useReports = () => useFetch("reports", fetchReports);

// ------------------ ADD MUTATIONS ------------------
export const useAddTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries(["transactions"]);
      queryClient.invalidateQueries(["reports"]);
    },
  });
};

export const useAddBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addBudget,
    onSuccess: () => queryClient.invalidateQueries(["budgets"]),
  });
};

export const useAddGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addGoal,
    onSuccess: () => queryClient.invalidateQueries(["goals"]),
  });
};

// ------------------ UPDATE MUTATIONS ------------------
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["transactions"]);
      queryClient.invalidateQueries(["reports"]);
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateBudget(id, data),
    onSuccess: () => queryClient.invalidateQueries(["budgets"]),
  });
};

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateGoal(id, data),
    onSuccess: () => queryClient.invalidateQueries(["goals"]),
  });
};

// ------------------ DELETE MUTATIONS ------------------
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries(["transactions"]);
      queryClient.invalidateQueries(["reports"]);
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => queryClient.invalidateQueries(["budgets"]),
  });
};

export const useDeleteGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => queryClient.invalidateQueries(["goals"]),
  });
};
