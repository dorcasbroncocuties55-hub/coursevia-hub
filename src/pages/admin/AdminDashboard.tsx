import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Users, CreditCard, Shield, BookOpen } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, payments: 0, verifications: 0, courses: 0 });

  useEffect(() => {
    const fetch = async () => {
      const [users, payments, verifications, courses] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("payments").select("id", { count: "exact", head: true }),
        supabase.from("verification_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("courses").select("id", { count: "exact", head: true }),
      ]);
      setStats({ users: users.count || 0, payments: payments.count || 0, verifications: verifications.count || 0, courses: courses.count || 0 });
    };
    fetch();
  }, []);

  const cards = [
    { label: "Total Users", value: stats.users, icon: Users },
    { label: "Total Payments", value: stats.payments, icon: CreditCard },
    { label: "Pending Verifications", value: stats.verifications, icon: Shield },
    { label: "Total Courses", value: stats.courses, icon: BookOpen },
  ];

  return (
    <DashboardLayout role="admin">
      <h1 className="text-2xl font-bold text-foreground mb-2">Admin Dashboard</h1>
      <p className="text-muted-foreground text-sm mb-8">Platform overview and management.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <c.icon size={18} className="text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground font-mono">{c.value}</p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};
export default AdminDashboard;
