import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Lock, Play } from "lucide-react";
import PaymentModal from "@/components/PaymentModal";

const VideoDetails = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [video, setVideo] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [creator, setCreator] = useState<any>(null);
  const timerRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!slug) return;
    supabase.from("videos").select("*").eq("slug", slug).eq("status", "published").single().then(async ({ data }) => {
      setVideo(data);
      if (data) {
        // Fetch creator profile
        const { data: profile } = await supabase.from("profiles").select("full_name, avatar_url").eq("user_id", data.creator_id).single();
        setCreator(profile);

        // Check access
        if (user) {
          const { data: access } = await supabase.from("content_access")
            .select("id").eq("user_id", user.id).eq("content_id", data.id).eq("content_type", "video").maybeSingle();
          if (access || Number(data.price) === 0) setHasAccess(true);
        } else if (Number(data?.price) === 0) {
          setHasAccess(true);
        }
      }
    });
  }, [slug, user]);

  // 10-second preview lock
  useEffect(() => {
    if (!video || hasAccess || Number(video.price) === 0) return;
    timerRef.current = setTimeout(() => {
      setIsLocked(true);
      if (videoRef.current) videoRef.current.pause();
    }, 10000);
    return () => clearTimeout(timerRef.current);
  }, [video, hasAccess]);

  if (!video) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-wide section-spacing">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
              {video.video_url ? (
                <video
                  ref={videoRef}
                  src={video.video_url}
                  controls={!isLocked}
                  className={`w-full h-full object-cover ${isLocked ? "blur-lg" : ""}`}
                  poster={video.thumbnail_url || undefined}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Play size={48} />
                </div>
              )}

              {/* Lock Overlay */}
              {isLocked && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10">
                  <Lock size={48} className="mb-4" />
                  <h3 className="text-xl font-bold mb-2">Preview ended</h3>
                  <p className="text-sm text-white/70 mb-6 text-center max-w-xs">
                    Purchase this video to continue watching the full content.
                  </p>
                  <Button onClick={() => user ? setShowPayment(true) : toast.info("Please sign in to purchase")} variant="hero" size="lg">
                    Purchase for ${Number(video.price).toFixed(2)}
                  </Button>
                </div>
              )}
            </div>

            <h1 className="text-2xl font-bold text-foreground mt-6 mb-2">{video.title}</h1>
            <div className="flex items-center gap-3 mb-4">
              {creator && (
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    {creator.full_name?.[0]?.toUpperCase() || "C"}
                  </div>
                  <span className="text-sm text-muted-foreground">{creator.full_name}</span>
                </div>
              )}
              {video.total_views > 0 && (
                <span className="text-xs text-muted-foreground">{video.total_views} views</span>
              )}
            </div>
            <p className="text-muted-foreground leading-relaxed">{video.description}</p>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              <span className="text-3xl font-bold text-foreground font-mono block mb-4">
                {Number(video.price) === 0 ? "Free" : `$${Number(video.price).toFixed(2)}`}
              </span>

              {hasAccess ? (
                <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg p-3 text-center text-sm font-medium">
                  ✓ You have access to this video
                </div>
              ) : (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    if (!user) { toast.info("Please sign in to purchase"); return; }
                    setShowPayment(true);
                  }}
                >
                  Purchase Video
                </Button>
              )}

              {video.duration_seconds && (
                <p className="text-xs text-muted-foreground mt-4">
                  Duration: {Math.floor(video.duration_seconds / 60)}m {video.duration_seconds % 60}s
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          contentType="video"
          contentId={video.id}
          contentTitle={video.title}
          amount={Number(video.price)}
          onClose={() => setShowPayment(false)}
          onSuccess={() => { setHasAccess(true); setIsLocked(false); setShowPayment(false); }}
        />
      )}

      <Footer />
    </div>
  );
};

export default VideoDetails;
