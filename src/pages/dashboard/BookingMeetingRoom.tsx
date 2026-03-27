import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ExternalLink, MessageSquare, ShieldCheck, Video } from "lucide-react";
import { format } from "date-fns";

const BookingMeetingRoom = () => {
  const { bookingId } = useParams();
  const { primaryRole } = useAuth();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingId) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .maybeSingle();

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setLoading(false);
        return;
      }

      const meetingLink = (data as any).meeting_url || (data as any).meeting_link || (data as any).session_room_url || `https://meet.jit.si/coursevia-${data.id}`;

      if (!(data as any).meeting_url) {
        const { error: updateError } = await supabase
          .from("bookings")
          .update({
            meeting_url: meetingLink,
            status: data.status === "pending" ? "confirmed" : data.status,
          } as any)
          .eq("id", data.id);
        if (updateError) {
          toast.error(updateError.message);
        }
      }

      setBooking({ ...data, meeting_url: meetingLink });
      setLoading(false);
    };

    loadBooking();
  }, [bookingId]);

  const layoutRole = useMemo(() => {
    if (primaryRole === "coach" || primaryRole === "therapist" || primaryRole === "creator" || primaryRole === "admin") {
      return primaryRole;
    }
    return "learner" as const;
  }, [primaryRole]);

  const openMessage = () => {
    if (!booking) return;
    const otherPartyId = layoutRole === "learner"
      ? booking.coach_id || booking.provider_id
      : booking.learner_id || booking.user_id;

    if (!otherPartyId) {
      toast.error("Messaging is not available for this booking yet.");
      return;
    }

    const messageBase = layoutRole === "learner" ? "/dashboard/messages" : `/${layoutRole}/messages`;
    window.location.href = `${messageBase}?user=${otherPartyId}`;
  };

  return (
    <DashboardLayout role={layoutRole as any}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <ShieldCheck className="h-4 w-4" /> Secure live session
            </div>
            <h1 className="text-2xl font-bold text-foreground">Session Room</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your live meeting opens safely inside Coursevia using a protected Jitsi room.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={openMessage}>
              <MessageSquare className="mr-2 h-4 w-4" /> Message participant
            </Button>
            {booking?.meeting_url ? (
              <Button variant="outline" onClick={() => window.open(booking.meeting_url, "_blank", "noopener,noreferrer")}>
                <ExternalLink className="mr-2 h-4 w-4" /> Open in new tab
              </Button>
            ) : null}
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">Loading session room...</div>
        ) : !booking ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">We could not find this booking.</div>
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Booking</p>
                <p className="mt-2 font-semibold text-foreground">{booking.id}</p>
                <p className="mt-1 text-sm text-muted-foreground">Status: {booking.status || "confirmed"}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Schedule</p>
                <p className="mt-2 font-semibold text-foreground">
                  {booking.scheduled_at ? format(new Date(booking.scheduled_at), "PPP p") : "Available now"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Join a few minutes before the meeting starts.</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Room</p>
                <p className="mt-2 flex items-center gap-2 font-semibold text-foreground"><Video className="h-4 w-4" /> Live room ready</p>
                <p className="mt-1 text-sm text-muted-foreground">Camera and microphone permissions are required.</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <iframe
                title="Coursevia Session Room"
                src={booking.meeting_url || booking.meeting_link || booking.session_room_url || `https://meet.jit.si/coursevia-${bookingId}`}
                allow="camera; microphone; fullscreen; display-capture"
                className="h-[78vh] w-full"
              />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BookingMeetingRoom;
