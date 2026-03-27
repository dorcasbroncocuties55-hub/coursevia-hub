import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Calendar, Clock, ExternalLink, MessageSquare, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Role = "coach" | "therapist";

type Props = {
  role: Role;
  mode: "bookings" | "sessions" | "calendar" | "clients";
};

const getLabel = (role: Role) => (role === "coach" ? "Coach" : "Therapist");

const ProviderBookingsBoard = ({ role, mode }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      try {
        const { data: coachProfile, error: coachProfileError } = await supabase
          .from("coach_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (coachProfileError) throw coachProfileError;
        if (!coachProfile?.id) {
          setBookings([]);
          setLoading(false);
          return;
        }

        const { data: rows, error } = await supabase
          .from("bookings")
          .select("*")
          .eq("coach_id", coachProfile.id)
          .order("scheduled_at", { ascending: true });

        if (error) throw error;

        const learnerIds = Array.from(new Set((rows || []).map((row) => row.learner_id).filter(Boolean)));
        let profileMap = new Map<string, any>();

        if (learnerIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, full_name")
            .in("user_id", learnerIds);

          profileMap = new Map((profiles || []).map((profile) => [profile.user_id, profile]));
        }

        const enriched = (rows || []).map((row) => ({
          ...row,
          learner_name: profileMap.get(row.learner_id)?.full_name || null,
          meeting_url: row.meeting_url || row.meeting_link || row.session_room_url || null,
        }));

        setBookings(enriched);
      } catch (error) {
        console.error(error);
        toast.error("Unable to load your sessions right now.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const filtered = useMemo(() => {
    if (mode === "sessions") {
      return bookings.filter((b) => ["confirmed", "in_progress", "completed"].includes(String(b.status || "")));
    }
    return bookings;
  }, [bookings, mode]);

  const title = useMemo(() => {
    if (mode === "bookings") return `${getLabel(role)} Bookings`;
    if (mode === "sessions") return `${getLabel(role)} Live Sessions`;
    if (mode === "calendar") return `${getLabel(role)} Calendar`;
    return `${getLabel(role)} Clients`;
  }, [mode, role]);

  const subtitle = useMemo(() => {
    if (mode === "bookings") return "Review, confirm, and manage session requests in one place.";
    if (mode === "sessions") return "Open the shared session room for confirmed client meetings.";
    if (mode === "calendar") return "A simple view of upcoming appointment times.";
    return "People who have booked or completed a session with you.";
  }, [mode]);

  const markComplete = async (bookingId: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "completed" } as any)
      .eq("id", bookingId);

    if (error) {
      toast.error(error.message);
      return;
    }

    setBookings((prev) => prev.map((item) => item.id === bookingId ? { ...item, status: "completed" } : item));
    toast.success("Session marked as completed.");
  };

  const ensureMeetingAndOpen = async (booking: any) => {
    const existingLink = booking.meeting_url || booking.meeting_link || booking.session_room_url;
    if (existingLink) {
      navigate(`/session/${booking.id}`);
      return;
    }

    const meetingLink = `https://meet.jit.si/coursevia-${booking.id}`;
    const { error } = await supabase
      .from("bookings")
      .update({
        meeting_url: meetingLink,
        status: booking.status === "pending" ? "confirmed" : booking.status,
      } as any)
      .eq("id", booking.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    setBookings((prev) => prev.map((item) => item.id === booking.id ? { ...item, meeting_url: meetingLink, status: item.status === "pending" ? "confirmed" : item.status } : item));
    navigate(`/session/${booking.id}`);
  };

  const openMessages = (booking: any) => {
    const learnerId = booking.learner_id || booking.user_id;
    if (!learnerId) {
      toast.error("Client messaging is not available for this booking yet.");
      return;
    }
    navigate(`/${role}/messages?user=${learnerId}`);
  };

  const renderEmpty = () => {
    if (mode === "clients") {
      return "No clients yet. When learners book a session, they will appear here.";
    }
    if (mode === "calendar") {
      return "No upcoming appointments are scheduled yet.";
    }
    if (mode === "sessions") {
      return "No confirmed sessions are ready yet. Confirmed bookings will appear here.";
    }
    return "No bookings yet. New bookings will appear here automatically.";
  };

  const clients = Array.from(
    new Map(
      bookings
        .filter((booking) => booking.learner_id || booking.user_id)
        .map((booking) => [booking.learner_id || booking.user_id, booking])
    ).values()
  );

  return (
    <DashboardLayout role={role}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">Loading…</div>
        ) : mode === "clients" ? (
          clients.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">{renderEmpty()}</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {clients.map((booking: any) => {
                const learnerLabel = booking.learner_name || booking.client_name || booking.notes || "Coursevia client";
                return (
                  <div key={booking.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-foreground">{learnerLabel}</p>
                        <p className="text-sm text-muted-foreground">Latest status: {booking.status || "pending"}</p>
                      </div>
                      <div className="rounded-full bg-primary/10 p-3 text-primary">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <Button className="flex-1" variant="outline" onClick={() => openMessages(booking)}>
                        Message client
                      </Button>
                      <Button className="flex-1" onClick={() => ensureMeetingAndOpen(booking)}>
                        Open session
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">{renderEmpty()}</div>
            ) : (
              filtered.map((booking) => {
                const scheduledAt = booking.scheduled_at || booking.booking_date || booking.created_at;
                const learnerLabel = booking.learner_name || booking.client_name || booking.notes || "Client session";
                const status = String(booking.status || "pending").toLowerCase();
                const hasMeeting = Boolean(booking.meeting_url || booking.meeting_link || booking.session_room_url);
                return (
                  <div key={booking.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      <div className="space-y-3">
                        <div>
                          <p className="text-lg font-semibold text-foreground">{learnerLabel}</p>
                          <p className="text-sm text-muted-foreground">Booking ID: {booking.id}</p>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />{scheduledAt ? format(new Date(scheduledAt), "PPP") : "Schedule pending"}</div>
                          <div className="flex items-center gap-2"><Clock className="h-4 w-4" />{scheduledAt ? format(new Date(scheduledAt), "p") : "Time pending"}</div>
                          <div className="flex items-center gap-2"><Video className="h-4 w-4" />{hasMeeting ? "Live room ready" : "Room will be generated when you open session"}</div>
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-3 xl:items-end">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          status === "confirmed" ? "bg-green-100 text-green-700" :
                          status === "completed" ? "bg-slate-100 text-slate-700" :
                          status === "cancelled" ? "bg-red-100 text-red-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {status.replaceAll("_", " ")}
                        </span>

                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" onClick={() => openMessages(booking)}>
                            Message
                          </Button>
                          <Button variant="outline" onClick={() => ensureMeetingAndOpen(booking)}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            {hasMeeting ? "Join session" : "Create room"}
                          </Button>
                          {status !== "completed" ? (
                            <Button onClick={() => markComplete(booking.id)}>Mark complete</Button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProviderBookingsBoard;
