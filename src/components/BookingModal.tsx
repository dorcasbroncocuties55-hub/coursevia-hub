import { useState } from "react";
import { createBooking } from "@/services/bookingService";
import { checkConflict } from "@/services/conflictService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { initializeCheckout } from "@/lib/paymentGateway";

type Props = {
  provider: {
    id: string;
    provider_type?: string;
    coach_profile_id?: string;
  };
  learner: {
    id: string;
  };
  selectedService?: any;
};

export default function BookingModal({
  provider,
  learner,
  selectedService,
}: Props) {
  const [type, setType] = useState<"instant" | "scheduled">("instant");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMessageProvider = async () => {
    window.location.href = `/dashboard/messages?user=${provider.id}`;
  };

  const handleBooking = async () => {
    setLoading(true);

    try {
      if (type === "scheduled") {
        if (!date) {
          toast.error("Please choose date and time");
          setLoading(false);
          return;
        }

        const conflict = await checkConflict(provider.id, date);

        if (conflict) {
          const chooseAnother = window.confirm(
            "This time is not available.

Press OK to choose another time.
Press Cancel to message the provider."
          );

          if (!chooseAnother) {
            await handleMessageProvider();
          }

          setLoading(false);
          return;
        }
      }

      const booking = await createBooking({
        provider_id: provider.id,
        learner_id: learner.id,
        booking_type: type,
        scheduled_time: type === "scheduled" ? date : null,
        duration: selectedService?.duration_minutes || 60,
        service_id: selectedService?.id || null,
        notes,
        provider_type: provider.provider_type,
        coach_profile_id: selectedService?.coach_id || provider.coach_profile_id || null,
      });

      if (selectedService?.price && Number(selectedService.price) > 0) {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser?.email) {
          throw new Error("A valid learner email is required before starting payment.");
        }

        const checkout = await initializeCheckout({
          email: authUser.email,
          user_id: learner.id,
          type: "booking",
          amount: Number(selectedService.price),
          content_id: booking.id,
          content_title: selectedService?.title || "Session booking",
        });

        toast.success("Booking created. Redirecting to secure checkout...");
        window.location.assign(checkout.authorization_url);
        return;
      }

      toast.success("Booking created successfully.");
      window.location.href = "/dashboard/bookings";
    } catch (error: any) {
      toast.error(error.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {selectedService && (
        <div className="rounded-2xl border bg-slate-50 p-4">
          <div className="text-sm text-slate-500">Selected Service</div>
          <div className="font-semibold">{selectedService.title}</div>
          <div className="text-sm text-slate-600">
            {selectedService.duration_minutes || 60} mins
          </div>
          <div className="text-sm font-semibold">
            ${Number(selectedService.price || 0).toFixed(2)}
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          onClick={() => setType("instant")}
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            type === "instant" ? "bg-blue-600 text-white" : "bg-white"
          }`}
        >
          Start in 1 Hour
        </button>

        <button
          onClick={() => setType("scheduled")}
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            type === "scheduled" ? "bg-blue-600 text-white" : "bg-white"
          }`}
        >
          Choose Date & Time
        </button>
      </div>

      {type === "scheduled" && (
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-xl border px-3 py-3"
        />
      )}

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add booking note (optional)"
        className="min-h-[120px] w-full rounded-xl border px-3 py-3"
      />

      <div className="flex gap-3">
        <button
          onClick={handleBooking}
          disabled={loading}
          className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Processing..." : "Confirm Booking"}
        </button>

        <button
          onClick={handleMessageProvider}
          className="rounded-xl border px-4 py-3 text-sm font-medium"
        >
          Message Provider
        </button>
      </div>
    </div>
  );
}
