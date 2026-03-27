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
  const { user, roles, profile, primaryRole, loading } = useAuth();
  const location = useLocation();

  const resolvedRoles = Array.from(new Set([...(roles || []), ...(profile?.role ? [profile.role] : [])]));

  const getDefaultRoute = () => {
    if (primaryRole === "admin" || resolvedRoles.includes("admin" as AppRole)) return "/admin/dashboard";
    if (primaryRole === "therapist" || resolvedRoles.includes("therapist" as AppRole)) return "/therapist/dashboard";
    if (primaryRole === "coach" || resolvedRoles.includes("coach" as AppRole)) return "/coach/dashboard";
    if (primaryRole === "creator" || resolvedRoles.includes("creator" as AppRole)) return "/creator/dashboard";
    return "/dashboard";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: `${location.pathname}${location.search}${location.hash}` }} replace />;
  }

  if (requireOnboarding && !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (
    requireOnboarding &&
    profile &&
    !profile.onboarding_completed &&
    location.pathname !== "/onboarding" &&
    !(resolvedRoles.includes("admin" as AppRole) || primaryRole === "admin")
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  if (requiredRole && !(resolvedRoles.includes(requiredRole) || primaryRole === requiredRole)) {
    return <Navigate to={getDefaultRoute()} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;