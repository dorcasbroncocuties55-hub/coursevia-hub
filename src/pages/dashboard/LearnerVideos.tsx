import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const LearnerVideos = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;

      const [{ data: accessRows }, { data: completedPayments }, { data: approvedPurchases }] =
        await Promise.all([
          supabase
            .from("content_access")
            .select("content_id")
            .eq("user_id", user.id)
            .eq("content_type", "video"),
          supabase
            .from("payments")
            .select("reference_id")
            .eq("payer_id", user.id)
            .eq("payment_type", "video")
            .eq("status", "completed"),
          supabase
            .from("video_purchases")
            .select("video_id")
            .eq("user_id", user.id)
            .eq("status", "approved"),
        ]);

      const ids = Array.from(
        new Set([
          ...(accessRows || []).map((row: any) => row.content_id),
          ...(completedPayments || []).map((row: any) => row.reference_id),
          ...(approvedPurchases || []).map((row: any) => row.video_id),
        ].filter(Boolean)),
      );

      if (ids.length === 0) {
        setItems([]);
        return;
      }

      const { data: unifiedItems } = await supabase
        .from("content_items" as any)
        .select("id, title, slug, thumbnail_url, price, content_type")
        .in("id", ids)
        .order("created_at", { ascending: false });

      const unified = (unifiedItems as any[]) || [];
      const unifiedIds = new Set(unified.map((item) => item.id));
      const fallbackIds = ids.filter((id) => !unifiedIds.has(id));

      let fallback: any[] = [];
      if (fallbackIds.length > 0) {
        const { data } = await supabase
          .from("videos")
          .select("id, title, slug, thumbnail_url, price")
          .in("id", fallbackIds)
          .order("created_at", { ascending: false });

        fallback = ((data as any[]) || []).map((item) => ({
          ...item,
          content_type: "single_video",
        }));
      }

      setItems([...unified, ...fallback]);
    };

    load();
  }, [user]);

  return (
    <DashboardLayout role="learner">
      <h1 className="text-2xl font-bold text-foreground mb-6">My Videos</h1>
      {items.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">You have not unlocked any videos yet.</p>
          <a href="/videos" className="text-primary hover:underline text-sm mt-2 inline-block">
            Browse videos
          </a>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/videos/${item.slug}`}
              className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {item.thumbnail_url ? (
                <img src={item.thumbnail_url} alt={item.title} className="aspect-video w-full object-cover" />
              ) : (
                <div className="aspect-video bg-secondary" />
              )}
              <div className="p-4">
                <p className="text-xs uppercase tracking-wide text-primary mb-2">
                  {item.content_type === "episode_series" ? "Episode Series" : "Single Video"}
                </p>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default LearnerVideos;
