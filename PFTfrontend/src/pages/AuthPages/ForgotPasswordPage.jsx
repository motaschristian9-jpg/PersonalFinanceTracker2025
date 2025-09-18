import { useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../api/api"; // your api.js

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!email) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please enter your registered email.",
        confirmButtonColor: "#10B981",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/forgot-password", { email });

      setLoading(false);

      Swal.fire({
        icon: "success",
        title: "Link Sent!",
        text: response.data.message,
        confirmButtonColor: "#10B981",
      });

      setEmail(""); // Clear input
    } catch (error) {
      setLoading(false);

      // Check if Laravel returned validation errors
      const errors = error.response?.data?.errors;
      const message = errors
        ? Object.values(errors).flat().join("\n")
        : error.response?.data?.message || "Something went wrong. Try again.";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
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
          Forgot Password?
        </h2>
        <p className="text-gray-500 mb-6 text-sm">
          Enter your registered email address and we’ll send you a link to reset
          your password.
        </p>

        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-emerald-500 text-white py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="text-gray-400 text-xs mt-4">
          If you don’t receive the email in a few minutes, please check your
          spam/junk folder or try again.
        </p>
        <p className="text-gray-400 text-xs mt-1">
          For security, password reset links expire in 15 minutes.
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
