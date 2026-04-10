import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import ProfileAvatar from "@/components/shared/ProfileAvatar";
import { useAuth } from "@/contexts/AuthContext";
import {
  Star, ShieldCheck, MapPin, Globe, MessageCircle, Phone,
  Calendar, ChevronRight, ArrowLeft, ChevronLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ProfilePreview = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, primaryRole } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
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
        const [videoRes, serviceRes] = await Promise.all([
          supabase
            .from("videos")
            .select("*")
            .eq("creator_id", data.user_id)
            .eq("status", "published")
            .order("created_at", { ascending: false }),
          supabase
            .from("coach_services")
            .select("*")
            .eq("coach_id", data.user_id)
            .eq("is_active", true) as any,
        ]);
        setVideos(videoRes.data || []);
        setServices(serviceRes.data || []);
      }
    };
    loadProfile();
  }, [slug]);

  const isProvider = profile?.role === "therapist" || profile?.role === "coach";
  const backPath = profile?.role === "therapist" ? "/find-therapists" : profile?.role === "coach" ? "/find-coaches" : "/";
  const name = profile?.full_name || "Professional";
  const title = profile?.profession || profile?.headline || (profile?.role === "therapist" ? "Licensed Therapist" : "Professional Coach");
  const location = [profile?.city, profile?.country].filter(Boolean).join(", ");
  const languages = Array.isArray(profile?.languages) ? profile.languages : [];
  const specialties = profile?.specialization_type
    ? profile.specialization_type.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {!profile ? (
        <div className="container-wide section-spacing">
          <div className="rounded-2xl border border-border bg-card p-16 text-center">
            <p className="text-lg text-muted-foreground">Profile not found.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Back nav */}
          {isProvider && (
            <div className="border-b border-border bg-muted/30">
              <div className="container-wide flex items-center justify-between py-3">
                <button onClick={() => navigate(backPath)} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                  <ArrowLeft size={16} /> Back to Results
                </button>
              </div>
            </div>
          )}

          {/* Profile Header */}
          <section className="border-b border-border bg-gradient-to-br from-primary/8 via-background to-accent/5">
            <div className="container-wide py-8 md:py-12">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex gap-5">
                  <ProfileAvatar
                    src={profile.avatar_url}
                    name={name}
                    className="h-28 w-28 rounded-2xl border-2 border-border shadow-md"
                  />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
                      <h1 className="text-2xl font-bold text-foreground md:text-3xl">{name}</h1>
                    </div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    {profile.is_verified && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                        <ShieldCheck size={14} className="text-emerald-600" />
                        Verified by Coursevia
                      </span>
                    )}
                    <p className="max-w-lg text-sm italic text-muted-foreground leading-relaxed">
                      "{profile.bio?.slice(0, 200) || "Dedicated professional committed to helping clients achieve meaningful results."}"
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button className="gap-1.5" asChild>
                    <Link to={user ? messagePath : "/login"}>
                      <MessageCircle size={16} /> Message Now
                    </Link>
                  </Button>
                  <Button variant="outline" className="gap-1.5">
                    <Phone size={16} /> Request Number
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Breadcrumb */}
          {isProvider && profile.country && (
            <div className="container-wide py-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link to={backPath} className="hover:text-primary">Home</Link>
                <ChevronRight size={12} />
                <Link to={`${backPath}/${profile.country?.toLowerCase().replaceAll(" ", "-")}`} className="hover:text-primary">{profile.country}</Link>
                {profile.city && (
                  <>
                    <ChevronRight size={12} />
                    <span>{profile.city}</span>
                  </>
                )}
                <ChevronRight size={12} />
                <span className="text-foreground font-medium">{name}</span>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="container-wide py-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
              {/* Left Column */}
              <div className="space-y-10">
                {/* About Me */}
                <section>
                  <h2 className="mb-4 text-xl font-bold text-foreground border-b border-border pb-3">About Me</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                    {profile.bio || "This professional has not added a bio yet."}
                  </p>
                </section>

                {/* Approach */}
                {profile.business_description && (
                  <section>
                    <h2 className="mb-4 text-xl font-bold text-foreground border-b border-border pb-3">Approach</h2>
                    <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                      {profile.business_description}
                    </p>
                  </section>
                )}

                {/* Services */}
                {(services.length > 0 || specialties.length > 0) && (
                  <section>
                    <h2 className="mb-4 text-xl font-bold text-foreground border-b border-border pb-3">Services</h2>
                    <div className="grid gap-8 sm:grid-cols-2">
                      {services.length > 0 && (
                        <div>
                          <h3 className="mb-3 text-sm font-bold text-foreground">Services Offered:</h3>
                          <ul className="space-y-2">
                            {services.map((s) => (
                              <li key={s.id} className="flex items-start gap-2 text-sm text-primary">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                <span>
                                  {s.title}
                                  {s.price ? <span className="ml-1 text-muted-foreground">(${s.price})</span> : null}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {specialties.length > 0 && (
                        <div>
                          <h3 className="mb-3 text-sm font-bold text-foreground">Works With:</h3>
                          <ul className="space-y-2">
                            {specialties.map((s: string) => (
                              <li key={s} className="flex items-center gap-2 text-sm text-primary">
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* Area of Expertise */}
                {specialties.length > 0 && (
                  <section>
                    <h2 className="mb-4 text-xl font-bold text-foreground border-b border-border pb-3">Area of Expertise</h2>
                    <div className="flex flex-wrap gap-2">
                      {specialties.map((s: string) => (
                        <Badge key={s} variant="outline" className="text-xs px-3 py-1">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </section>
                )}

                {/* Qualifications */}
                {(profile.certification || profile.experience) && (
                  <section>
                    <h2 className="mb-4 text-xl font-bold text-foreground border-b border-border pb-3">Qualifications</h2>
                    <div className="space-y-2 text-sm text-foreground">
                      {profile.certification && (
                        <p className="font-medium">{profile.certification}</p>
                      )}
                      {profile.experience && (
                        <p className="text-muted-foreground">{profile.experience}</p>
                      )}
                    </div>
                  </section>
                )}

                {/* Published Videos */}
                {videos.length > 0 && (
                  <section>
                    <h2 className="mb-4 text-xl font-bold text-foreground border-b border-border pb-3">Published Videos</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {videos.map((video) => (
                        <Link
                          key={video.id}
                          to={`/videos/${video.slug}`}
                          className="overflow-hidden rounded-xl border border-border bg-card transition hover:shadow-md"
                        >
                          <div className="aspect-video overflow-hidden bg-muted">
                            {video.thumbnail_url && (
                              <img src={video.thumbnail_url} alt={video.title} className="h-full w-full object-cover" />
                            )}
                          </div>
                          <div className="p-3">
                            <h3 className="text-sm font-semibold text-foreground">{video.title}</h3>
                            <p className="text-xs text-muted-foreground">${Number(video.price || 0).toFixed(2)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Right Sidebar */}
              <div className="space-y-5">
                {/* Contact Card */}
                <div className="sticky top-24 space-y-5">
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <h3 className="mb-1 text-base font-bold text-foreground">Contact {name.split(" ")[0]}</h3>
                    <p className="mb-4 text-xs text-muted-foreground">Ask a quick question or arrange a time to meet.</p>
                    <Button className="w-full" asChild>
                      <Link to={user ? messagePath : "/login"}>Reach Out</Link>
                    </Button>
                  </div>

                  {/* Basic Information */}
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <h3 className="mb-3 text-base font-bold text-foreground">Basic Information</h3>
                    <div className="space-y-3 text-sm">
                      <p className="font-semibold text-emerald-600">Available for new appointments</p>
                      {languages.length > 0 && (
                        <div className="flex items-start gap-2">
                          <Globe size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                          <div>
                            <span className="text-muted-foreground">Languages: </span>
                            <span className="font-medium text-foreground">{languages.join(", ")}</span>
                          </div>
                        </div>
                      )}
                      {location && (
                        <div className="flex items-start gap-2">
                          <MapPin size={14} className="mt-0.5 shrink-0 text-primary" />
                          <span className="text-primary">{location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing */}
                  {(profile.booking_price || profile.hourly_rate) && (
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                      <h3 className="mb-3 text-base font-bold text-foreground">Session Pricing</h3>
                      <div className="space-y-2 text-sm">
                        {profile.booking_price && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Session fee</span>
                            <span className="font-semibold text-foreground">${Number(profile.booking_price).toFixed(2)}</span>
                          </div>
                        )}
                        {profile.hourly_rate && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Hourly rate</span>
                            <span className="font-semibold text-foreground">${Number(profile.hourly_rate).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                      <Button className="mt-4 w-full gap-1.5" variant="outline">
                        <Calendar size={14} /> Book Session
                      </Button>
                    </div>
                  )}

                  {/* Rating */}
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm text-center">
                    <div className="flex items-center justify-center gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={18} className="fill-current" />
                      ))}
                    </div>
                    <p className="mt-1 text-2xl font-bold text-foreground">{Number(profile.rating || 5).toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">{profile.total_reviews || 0} reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
};

export default ProfilePreview;
