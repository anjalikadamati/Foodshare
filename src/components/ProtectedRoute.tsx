import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: "food_provider" | "food_donor";
}

const ProtectedRoute = ({ children, requiredUserType }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check user type if required
  if (requiredUserType && profile && profile.user_type !== requiredUserType) {
    // Redirect to correct dashboard based on user type
    if (profile.user_type === 'food_provider') {
      return <Navigate to="/provider" replace />;
    } else if (profile.user_type === 'food_donor') {
      return <Navigate to="/donor" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;