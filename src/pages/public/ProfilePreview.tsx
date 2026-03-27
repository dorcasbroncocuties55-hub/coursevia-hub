import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import ProfileAvatar from "@/components/shared/ProfileAvatar";
import { useAuth } from "@/contexts/AuthContext";
import { Star, ShieldCheck } from "lucide-react";

const ProfilePreview = () => {
  const { slug } = useParams();
  const { user, primaryRole } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);

  const messagePath = useMemo(() => {
    if (!profile?.user_id) return "/login";
    if (!user) return "/login";
    if (primaryRole === "coach") return `/coach/messages?user=${profile.user_id}`;
    if (primaryRole === "creator") return `/creator/messages?user=${profile.user_id}`;
    if (primaryRole === "therapist") return `/therapist/messages?user=${profile.user_id}`;
    return `/dashboard/messages?user=${profile.user_id}`;
  }, [profile?.user_id, primaryRole, user]);

  useEffect(() => {
    if (!slug) return;

    const loadProfile = async () => {
      let profileQuery = await supabase
        .from("profiles")
        .select("*")
        .eq("profile_slug", slug)
        .maybeSingle();

      if (!profileQuery.data) {
        profileQuery = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", slug)
          .maybeSingle();
      }

      const data = profileQuery.data;
      setProfile(data || null);

      if (data?.user_id) {
        const { data: videoData } = await supabase
          .from("videos")
          .select("*")
          .eq("creator_id", data.user_id)
          .eq("status", "published")
          .order("created_at", { ascending: false });

        setVideos(videoData || []);
      }
    };

    loadProfile();
  }, [slug]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-wide section-spacing space-y-8">
        {!profile ? (
          <div className="rounded-lg border border-border bg-card p-10 text-center">
            <p className="text-muted-foreground">Profile not found.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
              <div className="space-y-4 rounded-[28px] border border-border bg-card p-8 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <ProfileAvatar
                    src={profile.avatar_url}
                    name={profile.full_name}
                    className="h-24 w-24 border border-border"
                    fallbackClassName="bg-slate-950 text-2xl font-semibold text-white"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm uppercase tracking-[0.2em] text-primary">
                        {profile.role || "Professional"}
                      </p>
                      {profile.is_verified ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"><ShieldCheck className="h-3.5 w-3.5" /> Verified</span> : null}
                    </div>
                    <h1 className="text-4xl font-bold text-foreground">
                      {profile.full_name || "Professional Profile"}
                    </h1>
                    <p className="mt-1 text-lg text-muted-foreground">
                      {profile.profession || "Trusted specialist"}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1 text-amber-500">
                        {[1, 2, 3, 4, 5].map((star) => <Star key={star} className="h-4 w-4 fill-current" />)}
                      </div>
                      <span className="font-medium text-foreground">{Number(profile.rating || 5).toFixed(1)}</span>
                      <span className="text-muted-foreground">friendly professional experience</span>
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  {profile.bio || "This professional has not added a bio yet."}
                </p>

                <div className="grid gap-4 pt-2 sm:grid-cols-2">
                  <div className="rounded-xl bg-secondary/40 p-4">
                    <p className="text-xs text-muted-foreground">Experience</p>
                    <p className="font-semibold">{profile.experience || "Available on request"}</p>
                  </div>
                  <div className="rounded-xl bg-secondary/40 p-4">
                    <p className="text-xs text-muted-foreground">Certification</p>
                    <p className="font-semibold">{profile.certification || "Available on request"}</p>
                  </div>
                  <div className="rounded-xl bg-secondary/40 p-4">
                    <p className="text-xs text-muted-foreground">Hourly rate</p>
                    <p className="font-semibold">${Number(profile.hourly_rate || 0).toFixed(2)}</p>
                  </div>
                  <div className="rounded-xl bg-secondary/40 p-4">
                    <p className="text-xs text-muted-foreground">Session fee</p>
                    <p className="font-semibold">${Number(profile.booking_price || 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-border bg-card p-8">
                <h2 className="text-xl font-semibold text-foreground">Work with this professional</h2>
                <p className="text-sm text-muted-foreground">
                  Book a session or send a direct message through the platform to discuss your goals.
                </p>
                <div className="space-y-3">
                  <Button asChild className="w-full">
                    <Link to={user ? messagePath : "/login"}>Contact now</Link>
                  </Button>
                  <Button asChild className="w-full" variant="outline">
                    <Link to={user ? `/profile/${profile.profile_slug || profile.user_id}` : "/login"}>View booking options</Link>
                  </Button>
                </div>
                <p className="text-xs leading-6 text-muted-foreground">
                  Subscribers can message professionals, build playlists, download eligible content, and report issues directly from their account while purchases remain secure and separate when required.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Published videos</h2>
              {videos.length === 0 ? (
                <p className="text-sm text-muted-foreground">No videos have been published yet.</p>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {videos.map((video) => (
                    <Link
                      key={video.id}
                      to={`/videos/${video.slug}`}
                      className="overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
                    >
                      <div className="aspect-video overflow-hidden bg-secondary">
                        {video.thumbnail_url ? (
                          <img src={video.thumbnail_url} alt={video.title} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="space-y-2 p-4">
                        <h3 className="font-semibold text-foreground">{video.title}</h3>
                        <p className="line-clamp-2 text-sm text-muted-foreground">{video.description}</p>
                        <p className="font-semibold text-foreground">${Number(video.price || 0).toFixed(2)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePreview;
