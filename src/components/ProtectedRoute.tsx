import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: AppRole;
  requireOnboarding?: boolean;
}

const ProtectedRoute = ({
  children,
  requiredRole,
  requireOnboarding = true,
}: ProtectedRouteProps) => {
  const { user, roles, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireOnboarding && profile && !profile.onboarding_completed && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  if (requiredRole && !roles.includes(requiredRole)) {
    if (roles.includes("admin")) return <Navigate to="/admin/dashboard" replace />;
    if (roles.includes("therapist")) return <Navigate to="/therapist/dashboard" replace />;
    if (roles.includes("coach")) return <Navigate to="/coach/dashboard" replace />;
    if (roles.includes("creator")) return <Navigate to="/creator/dashboard" replace />;
    if (roles.includes("learner")) return <Navigate to="/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
