import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import ProviderDashboard from "./pages/ProviderDashboard";
import ReceiverDashboard from "./pages/ReceiverDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* PROVIDER PROFILE */}
        <Route
          path="/provider/profile"
          element={
            <ProtectedRoute role="provider">
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* RECEIVER PROFILE */}
        <Route
          path="/receiver/profile"
          element={
            <ProtectedRoute role="receiver">
              <Profile />
            </ProtectedRoute>
          }
        />


        {/* ✅ PROVIDER ROUTES */}
        <Route
          path="/provider/dashboard"
          element={
            <ProtectedRoute role="provider">
              <ProviderDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/list-food"
          element={
            <ProtectedRoute role="provider">
              <ProviderDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/requests"
          element={
            <ProtectedRoute role="provider">
              <ProviderDashboard />
            </ProtectedRoute>
          }
        />

        {/* ✅ RECEIVER ROUTES */}
        <Route
          path="/receiver/dashboard"
          element={
            <ProtectedRoute role="receiver">
              <ReceiverDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/receiver/browse-food"
          element={
            <ProtectedRoute role="receiver">
              <ReceiverDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/receiver/my-requests"
          element={
            <ProtectedRoute role="receiver">
              <ReceiverDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
