import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const Videos = () => {
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("content_items" as any)
        .select("*")
        .in("content_type", ["single_video", "episode_series"])
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setVideos(data as any[]);
        return;
      }

      const fallback = await supabase
        .from("videos")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      setVideos(fallback.data || []);
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-wide section-spacing">
        <h1 className="text-4xl font-bold text-foreground mb-2">Videos</h1>
        <p className="text-muted-foreground mb-8">
          Premium standalone videos and multi-episode series from expert creators.
        </p>
        {videos.length === 0 ? (
          <p className="text-muted-foreground">No videos available yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Link
                key={video.id}
                to={`/videos/${video.slug}`}
                className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {video.thumbnail_url ? (
                  <img src={video.thumbnail_url} alt={video.title} className="aspect-video w-full object-cover" />
                ) : (
                  <div className="aspect-video bg-secondary" />
                )}
                <div className="p-4">
                  <p className="text-xs uppercase tracking-wide text-primary mb-2">
                    {video.content_type === "episode_series" ? "Episode Series" : "Single Video"}
                  </p>
                  <h3 className="font-semibold text-foreground mb-1">{video.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{video.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-foreground">${Number(video.price || 0).toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground">
                      {video.content_type === "episode_series" ? "Multi-part" : "Focused lesson"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Videos;
