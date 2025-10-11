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
  addContribution,
  updateTransaction,
  updateBudget,
  updateGoal,
  deleteTransaction,
  deleteBudget,
  deleteGoal,
  deleteContribution,
  addExpenseToBudget, // <- import new API function
  changePassword,
  updateProfile,
  updateUserCurrency, // <- import new API function
} from "./api";

// ------------------ HELPER ------------------
const useFetch = (key, fetchFn, defaultValue = []) => {
  const queryResult = useQuery({
    queryKey: [key],
    queryFn: async () => {
      const res = await fetchFn();
      return res.data;
    },
    refetchOnWindowFocus: false,
  });

  return {
    ...queryResult,
    data: queryResult.data ?? defaultValue,
  };
};

// ------------------ QUERIES ------------------
export const useProfile = () => useFetch("user", fetchProfile);

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

    // ⚡ Optimistic update
    onMutate: async (newTxData) => {
      await queryClient.cancelQueries(["transactions"]);

      const previousTransactions = queryClient.getQueryData(["transactions"]);

      // Add new transaction instantly
      queryClient.setQueryData(["transactions"], (old = []) => [
        ...old,
        { id: Date.now(), ...newTxData }, // Temporary ID until backend responds
      ]);

      return { previousTransactions };
    },

    // ⛔ Rollback on failure
    onError: (err, newTxData, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(
          ["transactions"],
          context.previousTransactions
        );
      }
    },

    // ✅ Smooth revalidation after success
    onSettled: () => {
      setTimeout(() => {
        queryClient.invalidateQueries(["transactions"]);
      }, 300);
    },
  });
};

export const useAddBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addBudget,
    onMutate: async (newBudgetData) => {
      await queryClient.cancelQueries({ queryKey: ["budgets"] });
      const previousBudgetData = queryClient.getQueryData(["budgets"]);
      queryClient.setQueryData(["budgets"], (old = []) => [
        ...old,
        {
          ...newBudgetData,
          budget_id: Date.now(),
          amount: Number(newBudgetData.amount) || 0,
          description: newBudgetData.description || "",
        },
      ]);
      return { previousBudgetData };
    },
    onError: (context) => {
      if (context?.previousBudgetData) {
        queryClient.setQueryData(["budgets"], context.previousBudgetData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(["budgets"]);
    },
  });
};

export const useAddGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addGoal,
    onMutate: async (newGoalData) => {
      await queryClient.cancelQueries(["goals"]);
      const previousGoalData = queryClient.getQueryData(["goals"]);
      queryClient.setQueryData(["goals"], (old = []) => [...old, newGoalData]);
      return { previousGoalData };
    },
    onError: (context) => {
      if (context?.previousGoalData) {
        queryClient.setQueryData(["goals"], context.previousGoalData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(["goals"]);
    },
  });
};

export const useAddContribution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addContribution,

    // NOTE: Removed onMutate and onSuccess handlers to eliminate temporary IDs.
    // The hook now relies on full refetching after the API call is complete,
    // ensuring the UI only shows items that have the real database ID.

    // Rollback on error (Optional, but good for reporting UI)
    onError: (err) => {
      // You can still perform simple error reporting here if needed,
      // but no need for complex cache rollback since we removed onMutate.
      console.error("Failed to add contribution:", err);
    },

    // ✅ Refetch after success or error (This forces the UI to get fresh data)
    onSettled: () => {
      // These calls ensure the UI fetches the complete and accurate list of goals
      // (which now includes the new contribution with its REAL database ID).
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
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

    // ✅ Optimistic update
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["transactions"] });

      const previousTransactions = queryClient.getQueryData(["transactions"]);

      // Instantly reflect updated transaction in UI
      queryClient.setQueryData(["transactions"], (old = []) =>
        old.map((tx) => (tx.id === id ? { ...tx, ...data } : tx))
      );

      return { previousTransactions };
    },

    // 🔁 Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(
          ["transactions"],
          context.previousTransactions
        );
      }
    },

    // 🕐 Slightly delay refetch for smoother UX
    onSettled: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
      }, 500);
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

    // 👇 Optimistic Update
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries(["goals"]);

      // Snapshot the previous goals
      const previousGoals = queryClient.getQueryData(["goals"]);

      // Optimistically update the cache
      queryClient.setQueryData(["goals"], (oldGoals) =>
        oldGoals
          ? oldGoals.map((goal) =>
              goal.id === id ? { ...goal, ...data } : goal
            )
          : []
      );

      // Return context so we can rollback if error
      return { previousGoals };
    },

    // If error, rollback to previous state
    onError: (err, variables, context) => {
      if (context?.previousGoals) {
        queryClient.setQueryData(["goals"], context.previousGoals);
      }
    },

    // After success or failure, refetch goals
    onSettled: () => {
      queryClient.invalidateQueries(["goals"]);
    },
  });
};

// ------------------ DELETE MUTATIONS ------------------
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTransaction,

    // Optimistic update for instant UI response
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["transactions"] });

      const previousTransactions = queryClient.getQueryData(["transactions"]);

      queryClient.setQueryData(["transactions"], (old = []) =>
        old.filter((tx) => tx.id !== id)
      );

      return { previousTransactions };
    },

    // Rollback if error
    onError: (error, id, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(
          ["transactions"],
          context.previousTransactions
        );
      }
    },

    // ✅ Instead of invalidating immediately (causing flicker),
    // we delay it slightly to keep UI smooth.
    onSettled: async () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
      }, 500);
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

export const useDeleteContribution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteContribution, // ✅ you need to define this API call

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["goals"] });

      // Snapshot before deletion
      const previousGoals = queryClient.getQueryData(["goals"]);

      // Optimistically update contributions
      queryClient.setQueryData(["goals"], (oldGoals = []) =>
        oldGoals.map((goal) => ({
          ...goal,
          contributions:
            goal.contributions?.filter(
              (contribution) => contribution.id !== id
            ) ?? [],
        }))
      );

      return { previousGoals };
    },

    onError: (err, id, context) => {
      if (context?.previousGoals) {
        queryClient.setQueryData(["goals"], context.previousGoals);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries(["goals"]);
      queryClient.invalidateQueries(["reports"]);
    },
  });
};

export const useDeleteGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGoal,

    // Optimistic update
    onMutate: async (goalId) => {
      await queryClient.cancelQueries({ queryKey: ["goals"] });

      // Snapshot previous goals
      const previousGoals = queryClient.getQueryData(["goals"]);

      // Remove goal immediately from cache
      queryClient.setQueryData(["goals"], (old = []) =>
        old.filter((goal) => goal.id !== goalId)
      );

      return { previousGoals };
    },

    onError: (err, goalId, context) => {
      // Revert cache if error
      if (context?.previousGoals) {
        queryClient.setQueryData(["goals"], context.previousGoals);
      }
    },

    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries(["goals"]);
    },
  });
};

export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changePassword,

    onMutate: async (passwordData) => {
      // Cancel queries if needed
      await queryClient.cancelQueries(["user"]);

      const previousUser = queryClient.getQueryData(["user"]);

      // Optimistic update: mark user as "updating password"
      if (previousUser) {
        queryClient.setQueryData(["user"], {
          ...previousUser,
          updatingPassword: true,
        });
      }

      return { previousUser };
    },

    onError: (err, passwordData, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(["user"], context.previousUser);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries(["user"]);
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, profileData }) => updateProfile(userId, profileData),

    // Optional: Optimistic update
    onMutate: async ({ userId, profileData }) => {
      await queryClient.cancelQueries(["user", userId]);
      const previousUser = queryClient.getQueryData(["user", userId]);

      queryClient.setQueryData(["user", userId], (old) => ({
        ...old,
        ...profileData,
      }));

      return { previousUser };
    },

    onError: (err, variables, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(
          ["user", variables.userId],
          context.previousUser
        );
      }
    },

    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries(["user", variables.userId]);
    },
  });
};

export const useUpdateCurrency = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserCurrency,

    onMutate: async (newCurrency) => {
      await queryClient.cancelQueries({ queryKey: ["user"] });

      // Take a snapshot of current user data
      const previousUser = queryClient.getQueryData(["user"]);

      // Optimistically update user's currency symbol in cache
      queryClient.setQueryData(["user"], (old) => ({
        ...old,
        currency_symbol: newCurrency.currency_symbol,
      }));

      return { previousUser };
    },

    onError: (err, newCurrency, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(["user"], context.previousUser);
      }
    },

    onSettled: () => {
      // Always refetch the latest user data
      queryClient.invalidateQueries(["user"]);
    },
  });
};
