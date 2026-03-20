import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield } from "lucide-react";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { toast.error(error.message); setLoading(false); return; }
    
    // Check admin role using the has_role function
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
    const isAdmin = roles?.some(r => r.role === "admin");
    
    if (!isAdmin) {
      await supabase.auth.signOut();
      toast.error("Access denied. Admin privileges required.");
      setLoading(false);
      return;
    }
    toast.success("Welcome, Admin!");
    navigate("/admin/dashboard");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <Shield size={24} className="text-primary" />
          <span className="text-xl font-bold text-foreground">Coursevia Admin</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Admin Access</h1>
        <p className="text-muted-foreground text-sm mb-8">Sign in with your admin credentials.</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div><Label>Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in as Admin"}</Button>
        </form>
      </div>
    </div>
  );
};
export default AdminLogin;
