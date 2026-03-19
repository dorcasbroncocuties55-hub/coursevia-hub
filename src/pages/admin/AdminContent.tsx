import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const AdminContent = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("courses").select("*").order("created_at", { ascending: false }).then(({ data }) => setCourses(data || []));
    supabase.from("videos").select("*").order("created_at", { ascending: false }).then(({ data }) => setVideos(data || []));
  }, []);

  return (
    <DashboardLayout role="admin">
      <h1 className="text-2xl font-bold text-foreground mb-6">Content Manager</h1>
      <h2 className="text-lg font-semibold text-foreground mb-3">Courses ({courses.length})</h2>
      <div className="bg-card border border-border rounded-lg overflow-hidden mb-6">
        <table className="w-full"><thead><tr className="border-b border-border bg-secondary/50">
          <th className="text-left text-xs font-medium text-muted-foreground p-3">Title</th>
          <th className="text-left text-xs font-medium text-muted-foreground p-3">Price</th>
          <th className="text-left text-xs font-medium text-muted-foreground p-3">Status</th>
        </tr></thead><tbody>{courses.map(c => (
          <tr key={c.id} className="border-b border-border last:border-0">
            <td className="p-3 text-sm">{c.title}</td>
            <td className="p-3 text-sm font-mono">${Number(c.price).toFixed(2)}</td>
            <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${c.status === "published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{c.status}</span></td>
          </tr>
        ))}</tbody></table>
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-3">Videos ({videos.length})</h2>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full"><thead><tr className="border-b border-border bg-secondary/50">
          <th className="text-left text-xs font-medium text-muted-foreground p-3">Title</th>
          <th className="text-left text-xs font-medium text-muted-foreground p-3">Price</th>
          <th className="text-left text-xs font-medium text-muted-foreground p-3">Status</th>
        </tr></thead><tbody>{videos.map(v => (
          <tr key={v.id} className="border-b border-border last:border-0">
            <td className="p-3 text-sm">{v.title}</td>
            <td className="p-3 text-sm font-mono">${Number(v.price).toFixed(2)}</td>
            <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${v.status === "published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{v.status}</span></td>
          </tr>
        ))}</tbody></table>
      </div>
    </DashboardLayout>
  );
};
export default AdminContent;
