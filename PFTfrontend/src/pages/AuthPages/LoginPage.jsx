import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import api from "../../api/api"; // import your api.js

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please enter both email and password.",
        confirmButtonColor: "#10B981",
      });
      return;
    }

    setLoading(true);

    try {
      // Call backend login API
      const response = await api.post(
        "/login",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data.token) {
        setLoading(false);

        // ✅ Store token based on rememberMe
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem("token", response.data.token);
        storage.setItem("user", JSON.stringify(response.data.user));

        Swal.fire({
          icon: "success",
          title: "Login Successful!",
          text: `Welcome back, ${response.data.user?.name || "User"} 😊`,
          confirmButtonColor: "#10B981",
        }).then(() => {
          navigate("/dashboard");
        });
      } else {
        setLoading(false);
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: response.data.message || "Invalid credentials",
          confirmButtonColor: "#10B981",
        });
      }
    } catch (err) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err.response?.data?.message ||
          "Something went wrong. Please try again.",
        confirmButtonColor: "#10B981",
      });
    }
  };

  const handleGoogleLogin = () => {
    Swal.fire({
      icon: "info",
      title: "Google Login",
      text: "Google login clicked 🚀 (Integrate real OAuth here)",
      confirmButtonColor: "#10B981",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 relative z-10">
        <header className="text-center mb-8">
          <Link
            to="/"
            className="block text-3xl font-bold text-emerald-600 hover:opacity-80"
          >
            MoneyTracker
          </Link>
          <p className="mt-2 text-sm text-gray-600">
            New here?{" "}
            <Link
              to="/signup"
              className="text-emerald-600 font-medium hover:underline"
            >
              Create an account →
            </Link>
          </p>
        </header>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-600">
            Log in to track your income, expenses, and savings.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="h-4 w-4 text-emerald-600"
              />
              <span className="text-gray-600">Remember Me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-emerald-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Login"}
          </button>
        </form>

        <div className="mt-6">
          <div className="flex items-center gap-2">
            <hr className="flex-grow border-gray-300" />
            <span className="text-sm text-gray-500">or</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <button
            onClick={handleGoogleLogin}
            className="mt-4 w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>
        </div>

        <p className="mt-6 text-xs text-gray-500 text-center">
          We value your privacy. Your data is secure with us.
        </p>
      </div>
    </div>
  );
}
