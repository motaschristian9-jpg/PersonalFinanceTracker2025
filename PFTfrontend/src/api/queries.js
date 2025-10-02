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
    onMutate: async (newTxData) => {
      await queryClient.cancelQueries(["transactions"]);
      const previousTxData = queryClient.getQueryData(["transactions"]);
      queryClient.setQueryData(["transactions"], (old = []) => [
        ...old,
        { id: Date.now(), ...newTxData },
      ]);
      return { previousTxData };
    },
    onError: (context) => {
      queryClient.setQueryData(["transactions"], context.previousTxData);
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

    // ✅ Optimistic update
    onMutate: async (newContribution) => {
      await queryClient.cancelQueries(["goals"]);
      await queryClient.cancelQueries(["reports"]);

      // Snapshot previous values
      const previousGoals = queryClient.getQueryData(["goals"]);
      const previousReports = queryClient.getQueryData(["reports"]);

      // Optimistically update goals
      if (previousGoals) {
        queryClient.setQueryData(["goals"], (oldGoals) =>
          oldGoals.map((goal) =>
            goal.goal_id === newContribution.goal_id
              ? {
                  ...goal,
                  contributions: [
                    ...(goal.contributions || []),
                    { ...newContribution, id: Date.now() }, // fake id for now
                  ],
                }
              : goal
          )
        );
      }

      // (Optional) update reports optimistically too
      // Example: add to totalSaved
      if (previousReports) {
        queryClient.setQueryData(["reports"], (oldReports) => ({
          ...oldReports,
          totalSaved:
            (oldReports.totalSaved || 0) + Number(newContribution.amount),
        }));
      }

      return { previousGoals, previousReports };
    },

    // Rollback on error
    onError: (err, newContribution, context) => {
      if (context?.previousGoals) {
        queryClient.setQueryData(["goals"], context.previousGoals);
      }
      if (context?.previousReports) {
        queryClient.setQueryData(["reports"], context.previousReports);
      }
    },

    // ✅ Refetch after success or error
    onSettled: () => {
      queryClient.invalidateQueries(["goals"]);
      queryClient.invalidateQueries(["reports"]);
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
