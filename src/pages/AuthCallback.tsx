import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { normalizeRole, roleToDashboardPath } from "@/lib/authRoles";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const finishAuth = async () => {
      try {
        const requestedRoleRaw = window.localStorage.getItem("coursevia_oauth_role");
        const requestedRole = requestedRoleRaw ? normalizeRole(requestedRoleRaw) : null;

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (!session?.user) {
          toast.error("Authentication failed. Please try again.");
          navigate("/login", { replace: true });
          return;
        }

        if (requestedRole) {
          const { error: updateUserError } = await supabase.auth.updateUser({
            data: {
              requested_role: requestedRole,
              role: requestedRole,
              account_type: requestedRole,
              provider_type: requestedRole === "learner" ? null : requestedRole,
            },
          });

          if (updateUserError) {
            console.error("OAuth metadata update error:", updateUserError);
          }
        }

        const { error: repairError } = await supabase.rpc("ensure_my_profile_and_role", requestedRole ? {
          p_requested_role: requestedRole,
        } : {});

        if (repairError) {
          console.error("ensure_my_profile_and_role error:", repairError);
        }

        const [{ data: profile }, { data: roleRows }] = await Promise.all([
          supabase
            .from("profiles")
            .select("onboarding_completed, role")
            .eq("user_id", session.user.id)
            .maybeSingle(),
          supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id),
        ]);

        window.localStorage.removeItem("coursevia_oauth_role");

        if (!profile?.onboarding_completed) {
          navigate("/onboarding", { replace: true });
          return;
        }

        const role = roleRows?.[0]?.role || profile?.role || session.user.user_metadata?.requested_role;
        navigate(roleToDashboardPath(role), { replace: true });
      } catch (error: any) {
        console.error("Auth callback error:", error);
        toast.error(error?.message || "Authentication failed");
        navigate("/login", { replace: true });
      }
    };

    finishAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground">Completing sign in...</p>
    </div>
  );
};

export default AuthCallback;
