import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Users, Calendar, Wallet, Star } from "lucide-react";

const CoachDashboard = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ clients: 0, bookings: 0, balance: 0, rating: 0 });

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [coachProfile, wallet, bookings] = await Promise.all([
        supabase.from("coach_profiles").select("total_students, rating").eq("user_id", user.id).single(),
        supabase.from("wallets").select("balance").eq("user_id", user.id).single(),
        supabase.from("bookings").select("id", { count: "exact", head: true })
          .eq("coach_id", (await supabase.from("coach_profiles").select("id").eq("user_id", user.id).single()).data?.id || ""),
      ]);
      setStats({
        clients: coachProfile.data?.total_students || 0,
        bookings: bookings.count || 0,
        balance: Number(wallet.data?.balance) || 0,
        rating: Number(coachProfile.data?.rating) || 0,
      });
    };
    fetch();
  }, [user]);

  const cards = [
    { label: "Total Clients", value: stats.clients, icon: Users },
    { label: "Bookings", value: stats.bookings, icon: Calendar },
    { label: "Wallet Balance", value: `$${stats.balance.toFixed(2)}`, icon: Wallet },
    { label: "Rating", value: stats.rating.toFixed(1), icon: Star },
  ];

  return (
    <DashboardLayout role="coach">
      <h1 className="text-2xl font-bold text-foreground mb-2">Coach Dashboard</h1>
      <p className="text-muted-foreground text-sm mb-8">Welcome back, {profile?.full_name || "Coach"}</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
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
export default CoachDashboard;
