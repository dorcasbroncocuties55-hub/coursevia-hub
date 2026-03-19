import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AdminReports = () => {
  const [reports, setReports] = useState<any[]>([]);
  const fetchReports = async () => {
    const { data } = await supabase.from("reports").select("*").order("created_at", { ascending: false });
    setReports(data || []);
  };
  useEffect(() => { fetchReports(); }, []);

  const resolve = async (id: string, status: string) => {
    await supabase.from("reports").update({ status }).eq("id", id);
    toast.success("Report updated");
    fetchReports();
  };

  return (
    <DashboardLayout role="admin">
      <h1 className="text-2xl font-bold text-foreground mb-6">Reports</h1>
      {reports.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center"><p className="text-muted-foreground">No reports.</p></div>
      ) : (
        <div className="space-y-3">{reports.map(r => (
          <div key={r.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-foreground">{r.reason}</p>
                <p className="text-xs text-muted-foreground mt-1">{r.description}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === "resolved" ? "bg-green-100 text-green-700" : r.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"}`}>{r.status}</span>
            </div>
            {r.status === "pending" && (
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={() => resolve(r.id, "resolved")}>Resolve</Button>
                <Button size="sm" variant="outline" onClick={() => resolve(r.id, "dismissed")}>Dismiss</Button>
              </div>
            )}
          </div>
        ))}</div>
      )}
    </DashboardLayout>
  );
};
export default AdminReports;
