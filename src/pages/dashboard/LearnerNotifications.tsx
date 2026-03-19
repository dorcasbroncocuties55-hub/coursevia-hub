import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";

const LearnerNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => setNotifications(data || []));
  }, [user]);

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  return (
    <DashboardLayout role="learner">
      <h1 className="text-2xl font-bold text-foreground mb-6">Notifications</h1>
      {notifications.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <Bell size={24} className="mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <button key={n.id} onClick={() => markRead(n.id)} className={`w-full text-left bg-card border border-border rounded-lg p-4 transition-colors ${!n.is_read ? "border-primary/30 bg-primary/5" : ""}`}>
              <p className="text-sm font-medium text-foreground">{n.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
            </button>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};
export default LearnerNotifications;
