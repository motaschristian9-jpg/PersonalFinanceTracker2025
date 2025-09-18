// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom"

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token") // 👈 JWT stored after login

  if (!token) {
    // If no token, redirect to login
    return <Navigate to="/login" replace />
  }

  return children
}
