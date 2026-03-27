import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import ProfileAvatar from "@/components/shared/ProfileAvatar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";

const Coaches = () => {
  const [coaches, setCoaches] = useState<any[]>([]);

  useEffect(() => {
    const loadCoaches = async () => {
      const { data: profileCoaches } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "coach")
        .eq("onboarding_completed", true)
        .order("created_at", { ascending: false });

      if (profileCoaches?.length) {
        setCoaches(profileCoaches);
        return;
      }

      const { data } = await supabase
        .from("coach_profiles")
        .select("*, profiles!coach_profiles_user_id_fkey(full_name, avatar_url, bio, profile_slug)")
        .eq("is_active", true)
        .order("rating", { ascending: false });

      setCoaches(data || []);
    };

    loadCoaches();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-wide section-spacing">
        <h1 className="mb-2 text-4xl font-bold text-foreground">Expert Coaches</h1>
        <p className="mb-8 text-muted-foreground">Work with verified experts and get real results faster.</p>
        {coaches.length === 0 ? (
          <p className="text-muted-foreground">No coaches available yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coaches.map((c) => {
              const profile = c.profiles || c;
              return (
                <Link
                  key={c.id || c.user_id}
                  to={profile.profile_slug ? `/profile/${profile.profile_slug}` : `/coaches/${c.id || c.user_id}`}
                  className="rounded-3xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <ProfileAvatar src={profile.avatar_url} name={profile.full_name} className="h-14 w-14" />
                    <div>
                      <h3 className="font-semibold text-foreground">{profile.full_name || "Coach"}</h3>
                      <p className="text-xs text-muted-foreground">{c.headline || c.profession || "Coach"}</p>
                    </div>
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium text-foreground">{Number(c.rating || 5).toFixed(1)}</span>
                    {c.is_verified ? <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Verified</span> : null}
                  </div>
                  <p className="line-clamp-3 text-sm text-muted-foreground">{profile.bio || "Professional coach available for bookings and video courses."}</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Coaches;
