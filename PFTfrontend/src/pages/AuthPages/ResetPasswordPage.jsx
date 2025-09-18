import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../api/api"; // your api.js

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      Swal.fire({
        icon: "error",
        title: "Invalid Link",
        text: "Missing token or email. Please request a new password reset.",
        confirmButtonColor: "#10B981",
      }).then(() => navigate("/forgot-password"));
    }
  }, [token, email, navigate]);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please fill in both password fields.",
        confirmButtonColor: "#10B981",
      });
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Passwords do not match.",
        confirmButtonColor: "#10B981",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/reset-password", {
        token,
        email,
        password,
        password_confirmation: confirmPassword,
      });

      setLoading(false);

      Swal.fire({
        icon: "success",
        title: "Password Reset!",
        text: response.data.message,
        confirmButtonColor: "#10B981",
      }).then(() => {
        navigate("/login");
      });
    } catch (error) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message || "Something went wrong. Try again.",
        confirmButtonColor: "#10B981",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4">
      {/* Logo/Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">YourAppLogo</h1>
        <Link
          to="/login"
          className="text-gray-500 mt-2 inline-block hover:text-gray-700"
        >
          ← Back to Login
        </Link>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Reset Password
        </h2>
        <p className="text-gray-500 mb-6 text-sm">
          Enter your new password below to update your account password.
        </p>

        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-emerald-500 text-white py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            {loading && (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            )}
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>

        <p className="text-gray-400 text-xs mt-4">
          Make sure your password is at least 8 characters long.
        </p>
      </div>

      {/* Footer Socials */}
      <div className="mt-8 flex gap-4">
        <a href="#" className="text-gray-400 hover:text-gray-600">
          Facebook
        </a>
        <a href="#" className="text-gray-400 hover:text-gray-600">
          Twitter
        </a>
        <a href="#" className="text-gray-400 hover:text-gray-600">
          Instagram
        </a>
      </div>
    </div>
  );
}
