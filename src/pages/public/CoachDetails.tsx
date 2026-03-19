import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { toast } from "sonner";

const CoachDetails = () => {
  const { id } = useParams();
  const [coach, setCoach] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    supabase.from("coach_profiles").select("*, profiles!coach_profiles_user_id_fkey(full_name, avatar_url, bio)").eq("id", id).single().then(({ data }) => setCoach(data));
    supabase.from("coach_services").select("*").eq("coach_id", id).eq("is_active", true).then(({ data }) => setServices(data || []));
  }, [id]);

  if (!coach) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="container-wide section-spacing">
        <div className="max-w-3xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
              {coach.profiles?.full_name?.[0]?.toUpperCase() || "C"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{coach.profiles?.full_name}</h1>
              <p className="text-muted-foreground">{coach.headline || "Coach"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-6">
            <Star size={16} className="text-accent fill-accent" />
            <span className="font-medium text-foreground">{Number(coach.rating).toFixed(1)}</span>
            {coach.is_verified && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified by Coursevia</span>}
            <span className="text-sm text-muted-foreground font-mono">${Number(coach.hourly_rate || 0).toFixed(2)}/hr</span>
          </div>
          {coach.profiles?.bio && <p className="text-muted-foreground leading-relaxed mb-6">{coach.profiles.bio}</p>}
          {coach.skills?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {coach.skills.map((s: string) => <span key={s} className="text-xs bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full">{s}</span>)}
            </div>
          )}
          <h2 className="text-lg font-semibold text-foreground mb-4">Services</h2>
          {services.length === 0 ? <p className="text-sm text-muted-foreground">No services listed yet.</p> : (
            <div className="space-y-3">
              {services.map(s => (
                <div key={s.id} className="bg-card border border-border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-foreground">{s.title}</p>
                    <p className="text-sm text-muted-foreground">{s.duration_minutes} min · <span className="font-mono">${Number(s.price).toFixed(2)}</span></p>
                  </div>
                  <Button size="sm" onClick={() => toast.info("Booking flow coming soon")}>Book Now</Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default CoachDetails;
