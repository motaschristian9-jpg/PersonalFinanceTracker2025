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
  addExpenseToBudget, // <- import new API function
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

// ------------------ ADD MUTATIONS ------------------
export const useAddTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addTransaction,
    onMutate: async (newTransaction) => {
      await queryClient.cancelQueries(["transactions"]);
      const previousTransactions = queryClient.getQueryData(["transactions"]);
      queryClient.setQueryData(["transactions"], (old = []) => [
        ...old,
        { id: Date.now(), ...newTransaction },
      ]);
      return { previousTransactions };
    },
    onError: (err, newTransaction, context) => {
      queryClient.setQueryData(["transactions"], context.previousTransactions);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["transactions"]);
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

export const useAddExpenseToBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addExpenseToBudget,
    onSuccess: () => {
      queryClient.invalidateQueries(["budgets"]);
      queryClient.invalidateQueries(["transactions"]);
    },
  });
};

// ------------------ UPDATE MUTATIONS ------------------
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateTransaction(id, data),

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries(["transactions"]);

      const previousTransactions = queryClient.getQueryData(["transactions"]);

      queryClient.setQueryData(["transactions"], (old = []) =>
        old.map((tx) => (tx.id === id ? { ...tx, ...data } : tx))
      );

      return { previousTransactions };
    },

    onError: (err, variables, context) => {
      queryClient.setQueryData(["transactions"], context.previousTransactions);
    },

    onSettled: () => {
      queryClient.invalidateQueries(["transactions"]);
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

    onMutate: async (id) => {
      await queryClient.cancelQueries(["transactions"]);

      const previousTransactions = queryClient.getQueryData(["transactions"]);

      queryClient.setQueryData(["transactions"], (old = []) =>
        old.filter((tx) => tx.id !== id)
      );

      return { previousTransactions };
    },

    onError: (err, id, context) => {
      queryClient.setQueryData(["transactions"], context.previousTransactions);
    },

    onSettled: () => {
      queryClient.invalidateQueries(["transactions"]);
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
