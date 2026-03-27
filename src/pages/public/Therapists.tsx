import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import ProfileAvatar from "@/components/shared/ProfileAvatar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";

const Therapists = () => {
  const [therapists, setTherapists] = useState<any[]>([]);

  useEffect(() => {
    const loadTherapists = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "therapist")
        .eq("onboarding_completed", true)
        .order("created_at", { ascending: false });

      setTherapists(data || []);
    };

    loadTherapists();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-wide section-spacing">
        <h1 className="mb-2 text-4xl font-bold text-foreground">Therapists</h1>
        <p className="mb-8 text-muted-foreground">
          Connect with professional therapists for guided support and private sessions.
        </p>

        {therapists.length === 0 ? (
          <p className="text-muted-foreground">No therapists available yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {therapists.map((therapist) => (
              <Link
                key={therapist.user_id}
                to={`/profile/${therapist.profile_slug || therapist.user_id}`}
                className="rounded-3xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-3 flex items-center gap-3">
                  <ProfileAvatar src={therapist.avatar_url} name={therapist.full_name} className="h-14 w-14" />
                  <div>
                    <h3 className="font-semibold text-foreground">{therapist.full_name || "Therapist"}</h3>
                    <p className="text-xs text-muted-foreground">{therapist.profession || therapist.headline || "Therapist"}</p>
                  </div>
                </div>

                <div className="mb-2 flex items-center gap-2">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium text-foreground">{Number(therapist.rating || 5).toFixed(1)}</span>
                  {therapist.is_verified ? <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Verified</span> : null}
                </div>

                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {therapist.bio || "Professional therapist helping clients through guided support sessions."}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Therapists;
