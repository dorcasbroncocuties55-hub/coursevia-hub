import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProviderProfileHeader from "@/components/providers/ProviderProfileHeader";
import ProviderAvailabilityCard from "@/components/providers/ProviderAvailabilityCard";
import ProviderServiceCard from "@/components/providers/ProviderServiceCard";
import BookingModal from "@/components/BookingModal";

export default function ProviderProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    setLoading(true);

    const [{ data: authData }, profileRes] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from("profiles").select("*").eq("user_id", id).single(),
    ]);

    setCurrentUser(authData?.user || null);

    if (profileRes.error) {
      setLoading(false);
      return;
    }

    setProfile(profileRes.data);

    const { data: providerProfile } = await supabase
      .from("coach_profiles")
      .select("id")
      .eq("user_id", id)
      .maybeSingle();

    const coachProfileId = providerProfile?.id;

    const [servicesRes, availabilityRes, badgeRes] = await Promise.all([
      coachProfileId
        ? supabase.from("coach_services").select("*").eq("coach_id", coachProfileId).eq("is_active", true).order("created_at", { ascending: false })
        : Promise.resolve({ data: [], error: null } as any),
      coachProfileId
        ? supabase.from("coach_availability").select("*").eq("coach_id", coachProfileId).eq("is_available", true).order("day_of_week", { ascending: true })
        : Promise.resolve({ data: [], error: null } as any),
      supabase.from("user_badges").select("id, badges(id, name, description)").eq("user_id", id),
    ]);

    setServices(servicesRes.data || []);
    setAvailability(availabilityRes.data || []);
    setBadges((badgeRes.data || []).map((row: any) => row.badges).filter(Boolean));
    setLoading(false);
  };

  useEffect(() => {
    if (id) loadProfile();
  }, [id]);

  const handleBookGeneral = () => {
    setSelectedService(null);
    setShowBooking(true);
  };

  const handleBookService = (service: any) => {
    setSelectedService(service);
    setShowBooking(true);
  };

  const handleMessage = async () => {
    if (!currentUser?.id) {
      navigate("/login");
      return;
    }

    navigate(`/messages?user=${id}`);
  };

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-8">Loading provider profile...</div>;
  if (!profile) return <div className="mx-auto max-w-7xl px-4 py-8">Provider not found.</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
      <ProviderProfileHeader profile={profile} badges={badges} onBook={handleBookGeneral} onMessage={handleMessage} />

      <div className="grid gap-6 lg:grid-cols-[1.4fr,0.8fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">About</h2>
            <p className="text-sm leading-7 text-slate-700">
              {profile.bio || "This provider is available for coaching or therapy sessions through the platform."}
            </p>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Services</h2>
            {!services.length ? (
              <p className="text-sm text-slate-500">No services added yet.</p>
            ) : (
              <div className="grid gap-4">
                {services.map((service) => <ProviderServiceCard key={service.id} service={service} onBook={handleBookService} />)}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <ProviderAvailabilityCard availability={availability} />

          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Quick Facts</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-xl border bg-slate-50 px-4 py-3">
                <span className="text-slate-500">Type</span>
                <span className="font-medium capitalize">{profile.provider_type || profile.role || "provider"}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border bg-slate-50 px-4 py-3">
                <span className="text-slate-500">Services</span>
                <span className="font-medium">{services.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border bg-slate-50 px-4 py-3">
                <span className="text-slate-500">Availability Slots</span>
                <span className="font-medium">{availability.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBooking && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Book Session</h2>
              <button onClick={() => setShowBooking(false)} className="rounded-lg border px-3 py-2 text-sm">Close</button>
            </div>
            <BookingModal
              provider={{ id: id || "", provider_type: profile.provider_type }}
              learner={{ id: currentUser.id }}
              selectedService={selectedService}
            />
          </div>
        </div>
      )}
    </div>
  );
}
