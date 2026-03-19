import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AdminVerifications = () => {
  const [requests, setRequests] = useState<any[]>([]);

  const fetchRequests = async () => {
    const { data } = await supabase.from("verification_requests").select("*, profiles!verification_requests_user_id_fkey(full_name)").order("created_at", { ascending: false });
    setRequests(data || []);
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (id: string, status: string) => {
    const { error } = await supabase.from("verification_requests").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(`Verification ${status}`); fetchRequests(); }
  };

  return (
    <DashboardLayout role="admin">
      <h1 className="text-2xl font-bold text-foreground mb-6">Verifications</h1>
      {requests.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center"><p className="text-muted-foreground">No verification requests.</p></div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => (
            <div key={r.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-foreground">{r.profiles?.full_name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{r.country} · {r.phone}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  r.status === "approved" ? "bg-green-100 text-green-700" :
                  r.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                }`}>{r.status}</span>
              </div>
              {r.status === "pending" && (
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={() => handleAction(r.id, "approved")}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => handleAction(r.id, "rejected")}>Reject</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};
export default AdminVerifications;
