import { supabase } from "@/integrations/supabase/client";

export const checkConflict = async (providerId: string, selectedTime: string) => {
  const selected = new Date(selectedTime);
  if (Number.isNaN(selected.getTime())) return false;

  const { data: coachProfile, error: coachError } = await supabase
    .from("coach_profiles")
    .select("id")
    .eq("user_id", providerId)
    .maybeSingle();

  if (coachError || !coachProfile?.id) {
    return false;
  }

  const { data } = await supabase
    .from("bookings")
    .select("scheduled_at, duration_minutes, status")
    .eq("coach_id", coachProfile.id)
    .in("status", ["pending", "confirmed", "in_progress"]);

  return Boolean(
    data?.some((booking) => {
      const start = new Date(booking.scheduled_at);
      const duration = Number(booking.duration_minutes || 60);
      const end = new Date(start.getTime() + duration * 60 * 1000);
      return selected >= start && selected < end;
    })
  );
};
