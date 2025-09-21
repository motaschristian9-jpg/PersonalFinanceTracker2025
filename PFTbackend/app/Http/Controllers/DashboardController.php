<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\Budget;
use App\Models\SavingsGoal;

class DashboardController extends Controller
{
    // Get all transactions for authenticated user
    public function transactions(Request $request)
    {
        $transactions = Transaction::where('user_id', $request->user()->id)
            ->latest()
            ->take(10)
            ->get();

        return response()->json($transactions);
    }

    // Add a new transaction (income or expense)
    public function storeTransaction(Request $request)
    {
        $request->validate([
            'type' => 'required|in:Income,Expense',
            'category' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'transaction_date' => 'required|date',
            'description' => 'nullable|string|max:500', // Added description
        ]);

        $transaction = Transaction::create([
            'user_id' => $request->user()->id,
            'type' => $request->type,
            'category' => $request->category,
            'amount' => $request->amount,
            'transaction_date' => $request->transaction_date,
            'description' => $request->description ?? '', // Store empty string if null
        ]);

        return response()->json([
            'message' => 'Transaction added successfully',
            'transaction' => $transaction,
        ]);
    }

    // Delete a transaction
    public function deleteTransaction($id)
    {
        $transaction = Transaction::where('user_id', auth()->id())
            ->where('transaction_id', $id) // use your actual primary key
            ->first();


        if (!$transaction) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        $transaction->delete();

        return response()->json(['message' => 'Transaction deleted successfully']);
    }

    public function updateTransaction(Request $request, $id)
    {
        $transaction = Transaction::where('transaction_id', $id)->first();

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
            'data' => $transaction
        ]);
    }


    // Get budgets for authenticated user
    public function budgets(Request $request)
    {
        $budgets = Budget::where('user_id', $request->user()->id)->get();
        return response()->json($budgets);
    }

    // Add a new budget
    public function storeBudget(Request $request)
    {
        $request->validate([
            'category' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $budget = Budget::create([
            'user_id' => $request->user()->id,
            'category' => $request->category,
            'amount' => $request->amount,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
        ]);

        return response()->json([
            'message' => 'Budget added successfully',
            'budget' => $budget,
        ]);
    }

    // Get savings goals for authenticated user
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
            'current_amount' => 0, // optional, initialize as 0
        ]);

        return response()->json([
            'message' => 'Savings goal added successfully',
            'goal' => $goal,
        ]);
    }

    // Get summary report (income, expenses, balance, savings progress)
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
