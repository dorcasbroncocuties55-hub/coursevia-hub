import { supabase } from "@/integrations/supabase/client";
import { createBooking } from "./bookingService";

export type CustomOfferPayload = {
  sender_id: string;
  receiver_id: string;
  title: string;
  description: string;
  price: number;
  duration_minutes: number;
  scheduled_at?: string | null;
};

export const sendOffer = async (offer: CustomOfferPayload) => {
  const { data, error } = await supabase
    .from("custom_offers")
    .insert({
      sender_id: offer.sender_id,
      receiver_id: offer.receiver_id,
      title: offer.title,
      description: offer.description,
      price: offer.price,
      duration_minutes: offer.duration_minutes,
      scheduled_at: offer.scheduled_at ?? null,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;

  const { error: messageError } = await supabase.from("messages").insert({
    sender_id: offer.sender_id,
    receiver_id: offer.receiver_id,
    message_type: "custom_offer",
    offer_id: data.id,
    content: `Custom offer: ${offer.title}`,
  });

  if (messageError) throw messageError;

  return data;
};

export const acceptOffer = async (offer: any) => {
  const { error: updateError } = await supabase
    .from("custom_offers")
    .update({ status: "accepted" })
    .eq("id", offer.id);

  if (updateError) throw updateError;

  await createBooking({
    provider_id: offer.sender_id,
    learner_id: offer.receiver_id,
    booking_type: offer.scheduled_at ? "scheduled" : "instant",
    scheduled_time: offer.scheduled_at ?? null,
    duration: offer.duration_minutes ?? 60,
  });
};

export const declineOffer = async (offerId: string) => {
  const { error } = await supabase
    .from("custom_offers")
    .update({ status: "declined" })
    .eq("id", offerId);

  if (error) throw error;
};

export const getOfferById = async (offerId: string) => {
  const { data, error } = await supabase
    .from("custom_offers")
    .select("*")
    .eq("id", offerId)
    .single();

  if (error) throw error;
  return data;
};