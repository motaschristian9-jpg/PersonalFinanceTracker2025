<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\Budget;
use App\Models\SavingsGoal;

class DashboardController extends Controller
{
    // -------------------
    // Transactions
    // -------------------
    public function transactions(Request $request)
    {
        $transactions = Transaction::where('user_id', $request->user()->id)
            ->latest()
            ->take(10)
            ->get();

        return response()->json($transactions);
    }

    public function storeTransaction(Request $request)
    {
        $request->validate([
            'type' => 'required|in:Income,Expense',
            'category' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'transaction_date' => 'required|date',
            'description' => 'nullable|string|max:500',
        ]);

        $transaction = Transaction::create([
            'user_id' => $request->user()->id,
            'type' => $request->type,
            'category' => $request->category,
            'amount' => $request->amount,
            'transaction_date' => $request->transaction_date,
            'description' => $request->description ?? '',
        ]);

        return response()->json([
            'message' => 'Transaction added successfully',
            'transaction' => $transaction,
        ]);
    }

    public function updateTransaction(Request $request, $id)
    {
        $transaction = Transaction::where('transaction_id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$transaction) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        $transaction->update([
            'type' => $request->type,
            'category' => $request->category,
            'amount' => $request->amount,
            'transaction_date' => $request->transaction_date,
            'description' => $request->description,
        ]);

        return response()->json([
            'message' => 'Transaction updated successfully',
            'transaction' => $transaction,
        ]);
    }

    public function deleteTransaction($id)
    {
        $transaction = Transaction::where('transaction_id', $id)
            ->where('user_id', auth()->id())
            ->first();

        if (!$transaction) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        $transaction->delete();

        return response()->json(['message' => 'Transaction deleted successfully']);
    }

    // -------------------
    // Budgets
    // -------------------
    public function budgets(Request $request)
    {
        $budgets = Budget::where('user_id', $request->user()->id)->get();
        return response()->json($budgets);
    }

    public function storeBudget(Request $request)
{
    $request->validate([
        'category' => 'required|string|max:255',
        'amount' => 'required|numeric|min:0',
        'start_date' => 'required|date',
        'end_date' => 'required|date|after_or_equal:start_date',
        'description' => 'nullable|string|max:1000', // optional description
    ]);

    $budget = Budget::create([
        'user_id' => $request->user()->id,
        'category' => $request->category,
        'amount' => $request->amount,
        'start_date' => $request->start_date,
        'end_date' => $request->end_date,
        'description' => $request->description ?? null, // set to null if not provided
    ]);

    return response()->json([
        'message' => 'Budget added successfully',
        'budget' => $budget,
    ]);
}


    public function updateBudget(Request $request, $id)
    {
        $budget = Budget::where('budget_id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$budget) {
            return response()->json(['message' => 'Budget not found'], 404);
        }

        $request->validate([
            'amount' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'description' => 'nullable|string|max:255', // new optional field
        ]);

        $budget->update([
            'amount' => $request->amount,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'description' => $request->description ?? null, // handle optional description
        ]);

        return response()->json([
            'message' => 'Budget updated successfully',
            'budget' => $budget,
        ]);
    }


    // Add an expense to a specific budget
    public function addExpenseToBudget(Request $request, $budgetId)
    {
        $budget = Budget::where('id', $budgetId)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$budget) {
            return response()->json(['message' => 'Budget not found'], 404);
        }

        $request->validate([
            'amount' => 'required|numeric|min:0',
            'transaction_date' => 'required|date',
            'description' => 'nullable|string|max:500',
        ]);

        $transaction = Transaction::create([
            'user_id' => $request->user()->id,
            'type' => 'Expense',
            'category' => $budget->category,
            'amount' => $request->amount,
            'transaction_date' => $request->transaction_date,
            'description' => $request->description ?? '',
        ]);

        // Optionally, you can update spent amount in budget here if you have a column
        // $budget->spent += $request->amount;
        // $budget->save();

        return response()->json([
            'message' => 'Expense added to budget successfully',
            'transaction' => $transaction,
        ]);
    }

    public function deleteBudget($id)
    {
        $budget = Budget::where('id', $id)
            ->where('user_id', auth()->id())
            ->first();

        if (!$budget) {
            return response()->json(['message' => 'Budget not found'], 404);
        }

        $budget->delete();

        return response()->json(['message' => 'Budget deleted successfully']);
    }

    // -------------------
    // Savings Goals
    // -------------------
    public function goals(Request $request)
    {
        $goals = SavingsGoal::where('user_id', $request->user()->id)->get();
        return response()->json($goals);
    }

    public function storeGoal(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'target_amount' => 'required|numeric|min:0',
            'deadline' => 'nullable|date',
        ]);

        $goal = SavingsGoal::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'target_amount' => $request->target_amount,
            'deadline' => $request->deadline,
            'current_amount' => 0,
        ]);

        return response()->json([
            'message' => 'Savings goal added successfully',
            'goal' => $goal,
        ]);
    }

    // -------------------
    // Reports
    // -------------------
    public function reports(Request $request)
    {
        $userId = $request->user()->id;

        $totalIncome = Transaction::where('user_id', $userId)
            ->where('type', 'Income')
            ->sum('amount');

        $totalExpenses = Transaction::where('user_id', $userId)
            ->where('type', 'Expense')
            ->sum('amount');

        $balance = $totalIncome - $totalExpenses;

        $totalSaved = SavingsGoal::where('user_id', $userId)->sum('current_amount');
        $totalTarget = SavingsGoal::where('user_id', $userId)->sum('target_amount');
        $savingsProgress = $totalTarget > 0 ? round(($totalSaved / $totalTarget) * 100) : 0;

        return response()->json([
            'totalIncome' => $totalIncome,
            'totalExpenses' => $totalExpenses,
            'balance' => $balance,
            'savingsProgress' => $savingsProgress,
        ]);
    }
}
