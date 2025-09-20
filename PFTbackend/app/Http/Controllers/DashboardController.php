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
            ->take(10) // limit to recent 10 for dashboard
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
        ]);

        $transaction = Transaction::create([
            'user_id' => $request->user()->id,
            'type' => $request->type,
            'category' => $request->category,
            'amount' => $request->amount,
            'transaction_date' => $request->transaction_date,
        ]);

        return response()->json([
            'message' => 'Transaction added successfully',
            'transaction' => $transaction,
        ]);
    }

    // Get budgets for authenticated user
    public function budgets(Request $request)
    {
        $budgets = Budget::where('user_id', $request->user()->id)->get();
        return response()->json($budgets);
    }

    // Get savings goals for authenticated user
    public function goals(Request $request)
    {
        $goals = SavingsGoal::where('user_id', $request->user()->id)->get();
        return response()->json($goals);
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
