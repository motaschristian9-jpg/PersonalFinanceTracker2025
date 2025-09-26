import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import SignUpPage from "./pages/AuthPages/SignUpPage";
import LoginPage from "./pages/AuthPages/LoginPage";
import ForgotPasswordPage from "./pages/AuthPages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/AuthPages/ResetPasswordPage";
import Dashboard from "./pages/UserPages/DashboardPage";
import Transactions from "./pages/UserPages/TransactionsPage";
import Income from "./pages/UserPages/IncomePage";
import Expenses from "./pages/UserPages/ExpensesPage";
import Budget from "./pages/UserPages/BudgetPage";
import Savings from "./pages/UserPages/SavingsPage";
import Reports from "./pages/UserPages/ReportsPage";
import Settings from "./pages/UserPages/SettingsPage";
import Profile from "./pages/UserPages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import UserLayout from "./layouts/UserLayout";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        {[
          { path: "/", element: <Landing /> },
          { path: "/signup", element: <SignUpPage /> },
          { path: "/login", element: <LoginPage /> },
          { path: "/forgot-password", element: <ForgotPasswordPage /> },
          { path: "/reset-password", element: <ResetPasswordPage /> },
        ].map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<PublicRoute>{route.element}</PublicRoute>}
          />
        ))}

        {/* Protected Routes wrapped in UserLayout */}
        <Route
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="income" element={<Income />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="budgets" element={<Budget />} />
          <Route path="savings" element={<Savings />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
