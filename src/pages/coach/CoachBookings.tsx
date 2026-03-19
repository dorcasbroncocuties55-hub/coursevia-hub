import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const CoachBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: cp } = await supabase.from("coach_profiles").select("id").eq("user_id", user.id).single();
      if (cp) {
        const { data } = await supabase.from("bookings").select("*").eq("coach_id", cp.id).order("created_at", { ascending: false });
        setBookings(data || []);
      }
    };
    fetch();
  }, [user]);

  return (
    <DashboardLayout role="coach">
      <h1 className="text-2xl font-bold text-foreground mb-6">Bookings</h1>
      {bookings.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center"><p className="text-muted-foreground">No bookings yet.</p></div>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => (
            <div key={b.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{b.notes || "Session"}</p>
                <p className="text-sm text-muted-foreground">{format(new Date(b.scheduled_at), "PPp")}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                b.status === "confirmed" ? "bg-green-100 text-green-700" :
                b.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"
              }`}>{b.status}</span>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};
export default CoachBookings;
