import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";

const Coaches = () => {
  const [coaches, setCoaches] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("coach_profiles").select("*, profiles!coach_profiles_user_id_fkey(full_name, avatar_url, bio)").eq("is_active", true).order("rating", { ascending: false }).then(({ data }) => setCoaches(data || []));
  }, []);

  return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="container-wide section-spacing">
        <h1 className="text-4xl font-bold text-foreground mb-2">Expert Coaches</h1>
        <p className="text-muted-foreground mb-8">Work with verified experts and get real results faster.</p>
        {coaches.length === 0 ? (
          <p className="text-muted-foreground">No coaches available yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coaches.map(c => (
              <Link key={c.id} to={`/coaches/${c.id}`} className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {c.profiles?.full_name?.[0]?.toUpperCase() || "C"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{c.profiles?.full_name}</h3>
                    <p className="text-xs text-muted-foreground">{c.headline || "Coach"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Star size={14} className="text-accent fill-accent" />
                  <span className="text-sm font-medium text-foreground">{Number(c.rating).toFixed(1)}</span>
                  {c.is_verified && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified</span>}
                </div>
                <p className="text-sm text-muted-foreground font-mono">${Number(c.hourly_rate || 0).toFixed(2)}/hr</p>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};
export default Coaches;
