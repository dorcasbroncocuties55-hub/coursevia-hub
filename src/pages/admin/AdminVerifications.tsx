import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

const AdminVerifications = () => {
  const [requests, setRequests] = useState<any[]>([]);

  const fetchRequests = async () => {
    const { data } = await supabase.from("verification_requests")
      .select("*, verification_documents(*)")
      .order("created_at", { ascending: false });
    
    // Fetch profiles separately to avoid FK issues
    if (data && data.length > 0) {
      const userIds = data.map((r) => r.user_id);
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, avatar_url").in("user_id", userIds);
      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);
      setRequests(data.map((r) => ({ ...r, profile: profileMap.get(r.user_id) })));
    } else {
      setRequests([]);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (id: string, userId: string, status: string) => {
    const { error } = await supabase.from("verification_requests").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }

    // If approved and user is a coach, mark coach profile as verified
    if (status === "approved") {
      await supabase.from("coach_profiles").update({ is_verified: true }).eq("user_id", userId);
      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Verification Approved",
        message: "Your identity has been verified! You can now offer services.",
        type: "verification",
      });
    } else {
      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Verification Rejected",
        message: "Your verification was not approved. Please resubmit with valid documents.",
        type: "verification",
      });
    }

    toast.success(`Verification ${status}`);
    fetchRequests();
  };

  return (
    <DashboardLayout role="admin">
      <h1 className="text-2xl font-bold text-foreground mb-6">Verifications</h1>
      {requests.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">No verification requests.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(r => (
            <div key={r.id} className="bg-card border border-border rounded-lg p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {r.profile?.full_name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{r.profile?.full_name || "Unknown User"}</p>
                    <p className="text-xs text-muted-foreground">{r.country} · {r.phone}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(r.created_at), "PPpp")}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  r.status === "approved" ? "bg-primary/10 text-primary" :
                  r.status === "pending" ? "bg-accent/10 text-accent" :
                  "bg-destructive/10 text-destructive"
                }`}>{r.status}</span>
              </div>

              {/* Documents */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {r.id_document_url && (
                  <div className="border border-border rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">ID Document</p>
                    <a href={r.id_document_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">View Document</a>
                  </div>
                )}
                {r.selfie_url && (
                  <div className="border border-border rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Selfie</p>
                    <img src={r.selfie_url} alt="Selfie" className="w-16 h-16 rounded-lg object-cover" />
                  </div>
                )}
              </div>

              {/* Additional documents */}
              {r.verification_documents?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Additional Documents</p>
                  <div className="flex gap-2 flex-wrap">
                    {r.verification_documents.map((doc: any) => (
                      <a key={doc.id} href={doc.document_url} target="_blank" rel="noopener noreferrer"
                        className="text-xs bg-secondary px-3 py-1.5 rounded-lg text-foreground hover:bg-secondary/80">
                        {doc.document_type}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {r.status === "pending" && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleAction(r.id, r.user_id, "approved")}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => handleAction(r.id, r.user_id, "rejected")}>Reject</Button>
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
