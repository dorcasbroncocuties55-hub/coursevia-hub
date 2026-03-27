import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { roleToDashboardPath } from "@/lib/authRoles";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, roles, primaryRole, profile, loading: authLoading } = useAuth();

  const defaultDashboardPath =
    primaryRole === "admin"
      ? "/admin/dashboard"
      : primaryRole === "therapist"
        ? "/therapist/dashboard"
        : primaryRole === "coach"
          ? "/coach/dashboard"
          : primaryRole === "creator"
            ? "/creator/dashboard"
            : "/dashboard";

  const redirectPath =
    typeof location.state?.from === "string"
      ? location.state.from
      : profile && !profile.onboarding_completed
        ? "/onboarding"
        : defaultDashboardPath;

  const prefillEmail =
    typeof location.state?.prefillEmail === "string" ? location.state.prefillEmail : "";

  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    if (typeof location.state?.from === "string") {
      navigate(location.state.from, { replace: true });
      return;
    }

    if (profile && !profile.onboarding_completed) {
      navigate("/onboarding", { replace: true });
      return;
    }

    navigate(roleToDashboardPath(primaryRole || profile?.role || "learner"), { replace: true });
  }, [user, roles, primaryRole, profile, authLoading, navigate, location.state]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!password) {
      toast.error("Password is required");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (data.session) {
        await supabase.rpc("ensure_my_profile_and_role");
        toast.success("Login successful");
        navigate(redirectPath, { replace: true });
      }
    } catch (error: any) {
      const message = error?.message?.toLowerCase() || "";

      if (message.includes("invalid login credentials")) {
        toast.error("Wrong email or password.");
      } else if (message.includes("email not confirmed")) {
        toast.error("Please confirm your email before signing in.");
      } else {
        toast.error(error?.message || "Failed to sign in");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      window.localStorage.removeItem("coursevia_oauth_role");

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error(error?.message || "Google sign-in failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <Link to="/" className="text-xl font-bold text-primary">
            Coursevia
          </Link>

          <h1 className="text-2xl font-bold text-foreground mt-8 mb-2">
            Welcome back
          </h1>

          <p className="text-muted-foreground text-sm mb-8">
            Sign in to continue.
          </p>

          <Button
            variant="outline"
            className="w-full mb-6"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? "Please wait..." : "Continue with Google"}
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              state={{ from: location.state?.from, prefillEmail: email }}
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-primary/5 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Learn from the best, grow without limits
          </h2>
          <p className="text-muted-foreground">
            Access courses, coaching, and premium content — all in one platform.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
