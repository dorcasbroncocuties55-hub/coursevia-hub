import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Video, Wallet, Users } from "lucide-react";

const CreatorDashboard = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ courses: 0, videos: 0, balance: 0, students: 0 });

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [courses, videos, wallet] = await Promise.all([
        supabase.from("courses").select("id", { count: "exact", head: true }).eq("creator_id", user.id),
        supabase.from("videos").select("id", { count: "exact", head: true }).eq("creator_id", user.id),
        supabase.from("wallets").select("balance").eq("user_id", user.id).single(),
      ]);
      setStats({
        courses: courses.count || 0,
        videos: videos.count || 0,
        balance: Number(wallet.data?.balance) || 0,
        students: 0,
      });
    };
    fetch();
  }, [user]);

  const cards = [
    { label: "Courses", value: stats.courses, icon: BookOpen },
    { label: "Videos", value: stats.videos, icon: Video },
    { label: "Wallet", value: `$${stats.balance.toFixed(2)}`, icon: Wallet },
    { label: "Students", value: stats.students, icon: Users },
  ];

  return (
    <DashboardLayout role="creator">
      <h1 className="text-2xl font-bold text-foreground mb-2">Creator Dashboard</h1>
      <p className="text-muted-foreground text-sm mb-8">Welcome back, {profile?.full_name || "Creator"}</p>
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
export default CreatorDashboard;
