import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const statusTone: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  learner_approved: "bg-green-50 text-green-700 border-green-200",
};

const LearnerBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const loadBookings = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("bookings")
      .select("*, coach_profiles(*, profiles(*))")
      .eq("learner_id", user.id)
      .order("created_at", { ascending: false });

    setBookings(data || []);
  };

  useEffect(() => {
    loadBookings();
  }, [user]);

  const handleApproveCompletion = async (bookingId: string) => {
    try {
      setApprovingId(bookingId);
      const { error } = await supabase.rpc("approve_booking_completion", {
        p_booking_id: bookingId,
      } as any);

      if (error) {
        const fallback = await supabase
          .from("bookings")
          .update({ status: "learner_approved" } as any)
          .eq("id", bookingId)
          .eq("learner_id", user?.id || "");

        if (fallback.error) throw error;
      }

      toast.success("Session approved. Provider earnings will stay pending for 8 days before payout.");
      await loadBookings();
    } catch (error: any) {
      toast.error(error?.message || "Could not approve this booking.");
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <DashboardLayout role="learner">
      <h1 className="mb-6 text-2xl font-bold text-foreground">My Bookings</h1>
      {bookings.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No bookings yet.</p>
          <a href="/coaches" className="mt-2 inline-block text-sm text-primary hover:underline">Find a coach</a>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const providerName = b.coach_profiles?.profiles?.full_name || "Provider";
            const status = b.status || "pending";
            const canApprove = ["completed", "session_finished", "awaiting_learner_approval"].includes(status);
            return (
              <div key={b.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">{providerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {b.scheduled_at ? format(new Date(b.scheduled_at), "PPP p") : "Schedule pending"}
                    </p>
                    {b.notes ? <p className="text-sm text-muted-foreground">{b.notes}</p> : null}
                  </div>

                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${statusTone[status] || "bg-slate-50 text-slate-700 border-slate-200"}`}>
                      {status.replaceAll("_", " ")}
                    </span>

                    {canApprove ? (
                      <Button onClick={() => handleApproveCompletion(b.id)} disabled={approvingId === b.id}>
                        {approvingId === b.id ? "Approving..." : "Approve finished session"}
                      </Button>
                    ) : status === "learner_approved" ? (
                      <p className="text-xs text-muted-foreground">Approved. The provider's earnings are now in the 8-day pending window.</p>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default LearnerBookings;
