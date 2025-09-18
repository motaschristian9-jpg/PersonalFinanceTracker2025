import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../api/api";
import { useGoogleLogin } from "@react-oauth/google";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      return Swal.fire("Error", "All fields are required!", "error");
    }

    if (formData.password !== formData.password_confirmation) {
      return Swal.fire("Error", "Passwords do not match!", "error");
    }

    try {
      await api.post("/register", formData);

      Swal.fire("Success!", "Account created successfully.", "success");

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      if (err.response && err.response.data) {
        Swal.fire(
          "Error",
          err.response.data.message || "Registration failed",
          "error"
        );
      } else {
        Swal.fire("Error", "Something went wrong. Try again later.", "error");
      }
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Get user info from Google
        const resUser = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          }
        );
        const userInfo = await resUser.json();

        // Send user info to backend
        const res = await api.post("/auth/google", {
          email: userInfo.email,
          name: userInfo.name,
        });

        localStorage.setItem("token", res.data.token);

        Swal.fire({
          icon: "success",
          title: "Welcome!",
          text: `Hello, ${res.data.user.name}`,
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Signup Failed",
          text: "Could not sign up with Google. Please try again.",
        });
      }
    },
    onError: (err) => {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Google Login Failed",
        text: "Please try again.",
      });
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header / Branding */}
      <header className="flex justify-between items-center p-6 max-w-6xl mx-auto w-full">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/logo.svg" alt="MoneyTracker Logo" className="h-8 w-8" />
          <span className="text-xl font-bold text-emerald-600">
            MoneyTracker
          </span>
        </Link>
        <Link
          to="/login"
          className="text-sm text-gray-600 hover:text-emerald-600"
        >
          Already have an account? <span className="font-medium">Sign In</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 max-w-6xl mx-auto w-full">
        {/* Left side */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50 p-8">
          <div className="text-center space-y-4">
            <img
              src="/finance-illustration.svg"
              alt="Finance Graphic"
              className="max-w-sm mx-auto"
            />
            <h2 className="text-2xl font-semibold text-gray-800">
              Take control of your finances today.
            </h2>
            <p className="text-gray-600">
              Track your income, expenses, and savings effortlessly.
            </p>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-6">
            {/* Title */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800">
                Create Your Account
              </h1>
              <p className="text-gray-600 mt-2">
                Get started in minutes. Track your income, expenses, and savings
                effortlessly.
              </p>
            </div>

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-gray-500"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition"
              >
                Sign Up
              </button>
            </form>

            {/* Alternative Sign Up */}
            <div className="space-y-2">
              <p className="text-center text-gray-500 text-sm">Or</p>
              <div>
                <button
                  onClick={() => loginWithGoogle()}
                  className="w-full border py-2 rounded-lg hover:bg-gray-50"
                >
                  Continue with Google
                </button>
              </div>
            </div>

            {/* Security Note */}
            <p className="text-center text-xs text-gray-500 mt-4">
              🔒 Your data is safe. We never share your financial information
              with third parties.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
