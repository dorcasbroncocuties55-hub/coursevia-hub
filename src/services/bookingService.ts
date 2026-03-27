import { supabase } from "@/integrations/supabase/client";

type CreateBookingArgs = {
  provider_id: string;
  learner_id: string;
  booking_type: "instant" | "scheduled";
  scheduled_time?: string | null;
  duration?: number;
  service_id?: string | null;
  notes?: string;
  provider_type?: string;
  coach_profile_id?: string | null;
};

const resolveCoachId = async ({
  provider_id,
  coach_profile_id,
}: {
  provider_id: string;
  coach_profile_id?: string | null;
}) => {
  if (coach_profile_id) return coach_profile_id;

  const { data, error } = await supabase
    .from("coach_profiles")
    .select("id")
    .eq("user_id", provider_id)
    .maybeSingle();

  if (error) throw error;
  if (!data?.id) {
    throw new Error("Provider profile was not found. Please complete the provider profile first.");
  }

  return data.id;
};

export const createBooking = async ({
  provider_id,
  learner_id,
  booking_type,
  scheduled_time,
  duration = 60,
  service_id = null,
  notes = "",
  coach_profile_id = null,
}: CreateBookingArgs) => {
  const coachId = await resolveCoachId({ provider_id, coach_profile_id });

  let scheduledAt: Date;

  if (booking_type === "instant") {
    scheduledAt = new Date(Date.now() + 60 * 60 * 1000);
  } else {
    if (!scheduled_time) {
      throw new Error("Scheduled booking requires a date and time");
    }
    scheduledAt = new Date(scheduled_time);
  }

  if (Number.isNaN(scheduledAt.getTime())) {
    throw new Error("Invalid booking date selected.");
  }

  const meetingUrl = `https://meet.jit.si/coursevia-${crypto.randomUUID()}`;

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      coach_id: coachId,
      learner_id,
      service_id,
      duration_minutes: duration,
      notes,
      status: "pending",
      meeting_url: meetingUrl,
      scheduled_at: scheduledAt.toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
};
