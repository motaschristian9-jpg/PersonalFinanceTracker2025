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
const useFetch = (key, fetchFn, defaultValue = []) => {
  const { data = defaultValue, ...rest } = useQuery({
    queryKey: [key],
    queryFn: async () => {
      const res = await fetchFn();
      return res.data; // <-- unwrap once here
    },
    refetchOnWindowFocus: false,
  });

  return { data, ...rest };
};

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

    // Optimistic update
    onMutate: async (newBudget) => {
      await queryClient.cancelQueries({ queryKey: ["budgets"] });

      const previousBudgets = queryClient.getQueryData(["budgets"]);

      // Optimistically update cache
      queryClient.setQueryData(["budgets"], (old = []) => [
        ...old,
        {
          ...newBudget,
          budget_id: Date.now(), // temporary ID until server responds
          allocated: Number(newBudget.amount) || 0,
          description: newBudget.description || "",
        },
      ]);

      return { previousBudgets };
    },

    // Rollback if error
    onError: (err, newBudget, context) => {
      if (context?.previousBudgets) {
        queryClient.setQueryData(["budgets"], context.previousBudgets);
      }
    },

    // Always refetch to sync with server
    onSettled: () => {
      queryClient.invalidateQueries(["budgets"]);
    },
  });
};

export const useAddGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addGoal,
    // Optimistic UI update
    onMutate: async (newGoal) => {
      // Cancel any outgoing refetches for "goals"
      await queryClient.cancelQueries(["goals"]);

      // Snapshot previous value
      const previousGoals = queryClient.getQueryData(["goals"]);

      // Optimistically update the cache
      queryClient.setQueryData(["goals"], (oldGoals = []) => [
        ...oldGoals,
        newGoal,
      ]);

      // Return context with previous value for rollback
      return { previousGoals };
    },
    // Rollback on error
    onError: (err, newGoal, context) => {
      if (context?.previousGoals) {
        queryClient.setQueryData(["goals"], context.previousGoals);
      }
    },
    // Always refetch after mutation
    onSettled: () => {
      queryClient.invalidateQueries(["goals"]);
    },
  });
};

export const useAddExpenseToBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addExpenseToBudget,

    onMutate: async (newExpense) => {
      await queryClient.cancelQueries(["budgets"]);
      await queryClient.cancelQueries(["transactions"]);

      const prevBudgets = queryClient.getQueryData(["budgets"]);
      const prevTransactions = queryClient.getQueryData(["transactions"]);

      // Optimistically update budgets
      if (prevBudgets) {
        queryClient.setQueryData(["budgets"], (old) =>
          old.map((budget) =>
            budget.id === newExpense.budgetId
              ? {
                  ...budget,
                  expenses: [...(budget.expenses ?? []), newExpense], // ✅ safe spread
                  spent: (budget.spent ?? 0) + newExpense.amount,
                }
              : budget
          )
        );
      }

      // Optimistically update transactions
      if (prevTransactions) {
        queryClient.setQueryData(["transactions"], (old) => [
          ...old,
          {
            ...newExpense,
            id: Date.now(), // temp id
            type: "expense",
          },
        ]);
      }

      return { prevBudgets, prevTransactions };
    },

    onError: (_err, _newExpense, context) => {
      if (context?.prevBudgets) {
        queryClient.setQueryData(["budgets"], context.prevBudgets);
      }
      if (context?.prevTransactions) {
        queryClient.setQueryData(["transactions"], context.prevTransactions);
      }
    },

    onSettled: () => {
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
    mutationFn: updateBudget,

    onMutate: async (updatedBudget) => {
      await queryClient.cancelQueries({ queryKey: ["budgets"] });

      // Snapshot of current budgets before update
      const previousBudgets = queryClient.getQueryData(["budgets"]);

      // Optimistically update cache
      queryClient.setQueryData(["budgets"], (old = []) =>
        old.map((budget) =>
          budget.budget_id === updatedBudget.id
            ? {
                ...budget,
                ...updatedBudget,
                allocated: Number(updatedBudget.amount) ?? budget.allocated,
                description: updatedBudget.description ?? budget.description,
              }
            : budget
        )
      );

      // Pass snapshot for rollback if error
      return { previousBudgets };
    },

    onError: (err, newBudget, context) => {
      if (context?.previousBudgets) {
        queryClient.setQueryData(["budgets"], context.previousBudgets);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries(["budgets"]);
    },
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

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["budgets"] });

      // Snapshot before deletion
      const previousBudgets = queryClient.getQueryData(["budgets"]);

      // Optimistically remove budget
      queryClient.setQueryData(["budgets"], (old = []) =>
        old.filter((budget) => budget.budget_id !== id)
      );

      return { previousBudgets };
    },

    onError: (err, id, context) => {
      if (context?.previousBudgets) {
        queryClient.setQueryData(["budgets"], context.previousBudgets);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries(["budgets"]);
    },
  });
};

export const useDeleteGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => queryClient.invalidateQueries(["goals"]),
  });
};
