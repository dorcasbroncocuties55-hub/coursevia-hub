import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Video, Calendar, Bell } from "lucide-react";

const LearnerDashboard = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ courses: 0, videos: 0, bookings: 0, notifications: 0 });

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [courses, videos, bookings, notifs] = await Promise.all([
        supabase.from("content_access").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("content_type", "course"),
        supabase.from("content_access").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("content_type", "video"),
        supabase.from("bookings").select("id", { count: "exact", head: true }).eq("learner_id", user.id),
        supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false),
      ]);
      setStats({
        courses: courses.count || 0,
        videos: videos.count || 0,
        bookings: bookings.count || 0,
        notifications: notifs.count || 0,
      });
    };
    fetchStats();
  }, [user]);

  const cards = [
    { label: "My Courses", value: stats.courses, icon: BookOpen, color: "text-primary" },
    { label: "My Videos", value: stats.videos, icon: Video, color: "text-accent" },
    { label: "Bookings", value: stats.bookings, icon: Calendar, color: "text-primary" },
    { label: "Unread Alerts", value: stats.notifications, icon: Bell, color: "text-accent" },
  ];

  return (
    <DashboardLayout role="learner">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {profile?.full_name || "Learner"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Here's your learning overview.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{card.label}</span>
              <card.icon size={18} className={card.color} />
            </div>
            <p className="text-2xl font-bold text-foreground font-mono">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
        <p className="text-sm text-muted-foreground">Your recent courses, bookings, and activity will appear here.</p>
      </div>
    </DashboardLayout>
  );
};

export default LearnerDashboard;
