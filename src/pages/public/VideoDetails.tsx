import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const VideoDetails = () => {
  const { slug } = useParams();
  const [video, setVideo] = useState<any>(null);

  useEffect(() => {
    if (!slug) return;
    supabase.from("videos").select("*").eq("slug", slug).single().then(({ data }) => setVideo(data));
  }, [slug]);

  if (!video) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="container-wide section-spacing">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold text-foreground mb-3">{video.title}</h1>
          <p className="text-muted-foreground leading-relaxed mb-6">{video.description}</p>
          <span className="text-2xl font-bold text-foreground font-mono block mb-6">${Number(video.price).toFixed(2)}</span>
          <Button variant="hero" size="lg" onClick={() => toast.info("Payment flow coming soon")}>Purchase Video</Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default VideoDetails;
