import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import ProfileAvatar from "@/components/shared/ProfileAvatar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";

const Creators = () => {
  const [creators, setCreators] = useState<any[]>([]);

  useEffect(() => {
    const loadCreators = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "creator")
        .eq("onboarding_completed", true)
        .order("created_at", { ascending: false });

      setCreators(data || []);
    };

    loadCreators();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-wide section-spacing">
        <h1 className="mb-2 text-4xl font-bold text-foreground">Creators</h1>
        <p className="mb-8 text-muted-foreground">
          Discover professional creators sharing premium lessons and videos on Coursevia.
        </p>

        {creators.length === 0 ? (
          <p className="text-muted-foreground">No creators available yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {creators.map((creator) => (
              <Link
                key={creator.user_id}
                to={`/profile/${creator.profile_slug || creator.user_id}`}
                className="rounded-3xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-4 flex items-center gap-3">
                  <ProfileAvatar src={creator.avatar_url} name={creator.full_name} className="h-14 w-14" />
                  <div>
                    <h3 className="font-semibold text-foreground">{creator.full_name || "Unnamed Creator"}</h3>
                    <p className="text-xs text-muted-foreground">{creator.profession || creator.headline || "Creator"}</p>
                  </div>
                </div>
                <div className="mb-2 flex items-center gap-2">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium text-foreground">{Number(creator.rating || 5).toFixed(1)}</span>
                  {creator.is_verified ? <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Verified</span> : null}
                </div>
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {creator.bio || "Creator profile coming soon."}
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

export default Creators;
