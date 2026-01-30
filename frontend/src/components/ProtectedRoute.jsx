import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("access_token");
  const user = JSON.parse(localStorage.getItem("user"));

  // ❌ Not logged in
  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  // ❌ Role mismatch (provider trying receiver route or vice versa)
  if (role && user.role !== role) {
    return <Navigate to="/login" />;
  }

  // ✅ Allowed
  return children;
}
