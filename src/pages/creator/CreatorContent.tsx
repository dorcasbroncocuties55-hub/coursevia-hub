import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const CreatorContent = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("courses").select("*").eq("creator_id", user.id).order("created_at", { ascending: false }).then(({ data }) => setCourses(data || []));
    supabase.from("videos").select("*").eq("creator_id", user.id).order("created_at", { ascending: false }).then(({ data }) => setVideos(data || []));
  }, [user]);

  return (
    <DashboardLayout role="creator">
      <h1 className="text-2xl font-bold text-foreground mb-6">Content Manager</h1>
      <h2 className="text-lg font-semibold text-foreground mb-3">Courses ({courses.length})</h2>
      {courses.length === 0 ? (
        <p className="text-sm text-muted-foreground mb-6">No courses yet.</p>
      ) : (
        <div className="space-y-2 mb-6">
          {courses.map(c => (
            <div key={c.id} className="bg-card border border-border rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground">{c.title}</p>
                <p className="text-xs text-muted-foreground capitalize">{c.status} · ${Number(c.price).toFixed(2)}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === "published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{c.status}</span>
            </div>
          ))}
        </div>
      )}
      <h2 className="text-lg font-semibold text-foreground mb-3">Videos ({videos.length})</h2>
      {videos.length === 0 ? (
        <p className="text-sm text-muted-foreground">No videos yet.</p>
      ) : (
        <div className="space-y-2">
          {videos.map(v => (
            <div key={v.id} className="bg-card border border-border rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground">{v.title}</p>
                <p className="text-xs text-muted-foreground capitalize">{v.status} · ${Number(v.price).toFixed(2)}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${v.status === "published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{v.status}</span>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};
export default CreatorContent;
