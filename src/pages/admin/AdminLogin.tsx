import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Shield } from "lucide-react";

type Mode = "login" | "signup";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [bootstrapOpen, setBootstrapOpen] = useState(false);
  const [checkingBootstrap, setCheckingBootstrap] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkBootstrap = async () => {
      const { data, error } = await supabase.rpc("is_admin_bootstrap_open");
      if (error) {
        console.error("Failed to check admin bootstrap:", error);
        setBootstrapOpen(false);
      } else {
        setBootstrapOpen(Boolean(data));
      }
      setCheckingBootstrap(false);
    };

    checkBootstrap();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);

    const isAdmin = roles?.some((r) => r.role === "admin");

    if (!isAdmin) {
      await supabase.auth.signOut();
      toast.error("Access denied. Admin privileges required.");
      setLoading(false);
      return;
    }

    toast.success("Welcome, Admin!");
    navigate("/admin/dashboard", { replace: true });
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bootstrapOpen) {
      toast.error("Admin self-create is closed. Create new admins from the admin dashboard.");
      return;
    }

    if (!fullName.trim()) {
      toast.error("Full name is required.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/admin-login`,
        data: {
          full_name: fullName.trim(),
          requested_role: "admin",
        },
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Admin account created. You can now sign in.");
    setMode("login");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-8">
          <Shield size={24} className="text-primary" />
          <span className="text-xl font-bold text-foreground">Coursevia Admin</span>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              mode === "login"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => bootstrapOpen && setMode("signup")}
            disabled={!bootstrapOpen || checkingBootstrap}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              mode === "signup"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            Create admin
          </button>
        </div>

        {mode === "login" ? (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-2">Admin Access</h1>
            <p className="text-muted-foreground text-sm mb-8">Sign in with your admin credentials.</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="admin-password">Password</Label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in as Admin"}
              </Button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-2">Create first admin</h1>
            <p className="text-muted-foreground text-sm mb-8">
              Direct admin creation is available here only until the first admin account is created.
            </p>
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Admin name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading || !bootstrapOpen || checkingBootstrap}>
                {loading ? "Creating admin account..." : "Create admin account"}
              </Button>
            </form>
          </>
        )}

        {!checkingBootstrap && !bootstrapOpen && (
          <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
            First-admin self-create is already closed. New admin accounts should now be created by an existing admin inside the dashboard.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
