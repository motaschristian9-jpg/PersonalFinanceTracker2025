<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Middleware\JWTMiddleware;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\DashboardController;

// -------------------------
// Public Routes
// -------------------------
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::post('forgot-password', [ForgotPasswordController::class, 'sendResetLink']);
Route::post('reset-password', [ResetPasswordController::class, 'reset']);
Route::post('auth/google', [GoogleAuthController::class, 'loginWithGoogle']);
Route::post('auth/google/login', [GoogleAuthController::class, 'loginExistingGoogleUser']);

// -------------------------
// Protected Routes (JWT Middleware)
// -------------------------
Route::middleware([JWTMiddleware::class])->group(function () {
    // User
    Route::get('profile', [AuthController::class, 'profile']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('refresh', [AuthController::class, 'refresh']);

    // Dashboard
    Route::prefix('dashboard')->group(function () {
        Route::get('transactions', [DashboardController::class, 'transactions']);
        Route::post('transactions', [DashboardController::class, 'storeTransaction']);

        Route::get('budgets', [DashboardController::class, 'budgets']);
        Route::post('budgets', [DashboardController::class, 'storeBudget']);

        Route::get('savings-goals', [DashboardController::class, 'goals']);
        Route::post('savings-goals', [DashboardController::class, 'storeGoal']);
        Route::get('reports', [DashboardController::class, 'reports']);
    });
});
