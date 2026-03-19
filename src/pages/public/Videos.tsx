import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const Videos = () => {
  const [videos, setVideos] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("videos").select("*").eq("status", "published").order("created_at", { ascending: false }).then(({ data }) => setVideos(data || []));
  }, []);

  return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="container-wide section-spacing">
        <h1 className="text-4xl font-bold text-foreground mb-2">Videos</h1>
        <p className="text-muted-foreground mb-8">Premium video content from expert creators.</p>
        {videos.length === 0 ? (
          <p className="text-muted-foreground">No videos available yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map(v => (
              <Link key={v.id} to={`/videos/${v.slug}`} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-secondary" />
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-1">{v.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{v.description}</p>
                  <span className="font-mono font-bold text-foreground">${Number(v.price).toFixed(2)}</span>
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
