import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import AuthPage from "./components/auth/AuthPage";
import ProviderDashboard from "./pages/ProviderDashboard";
import ProviderListings from "./pages/ProviderListings";
import ProviderRequests from "./pages/ProviderRequests";
import DonorDashboard from "./pages/DonorDashboard";
import DonorFindFood from "./pages/DonorFindFood";
import DonorRequests from "./pages/DonorRequests";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/provider" element={
              <ProtectedRoute requiredUserType="food_provider">
                <ProviderDashboard />
              </ProtectedRoute>
            } />
            <Route path="/provider/listings" element={
              <ProtectedRoute requiredUserType="food_provider">
                <ProviderListings />
              </ProtectedRoute>
            } />
            <Route path="/provider/requests" element={
              <ProtectedRoute requiredUserType="food_provider">
                <ProviderRequests />
              </ProtectedRoute>
            } />
            <Route path="/donor" element={
              <ProtectedRoute requiredUserType="food_donor">
                <DonorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/donor/find" element={
              <ProtectedRoute requiredUserType="food_donor">
                <DonorFindFood />
              </ProtectedRoute>
            } />
            <Route path="/donor/requests" element={
              <ProtectedRoute requiredUserType="food_donor">
                <DonorRequests />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
