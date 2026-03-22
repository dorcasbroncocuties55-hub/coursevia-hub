import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { CheckCircle, XCircle, Eye, Clock, Shield } from "lucide-react";

const AdminVerifications = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchRequests = async () => {
    const { data } = await supabase.from("verification_requests")
      .select("*, verification_documents(*)")
      .order("created_at", { ascending: false });

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

    if (status === "approved") {
      await supabase.from("coach_profiles").update({ is_verified: true }).eq("user_id", userId);
      await supabase.rpc("create_notification", {
        _user_id: userId,
        _title: "Verification Approved ✓",
        _message: "Your identity has been verified! You can now offer services and accept bookings.",
        _type: "verification",
      });
    } else {
      await supabase.rpc("create_notification", {
        _user_id: userId,
        _title: "Verification Rejected",
        _message: "Your verification was not approved. Please resubmit with valid documents.",
        _type: "verification",
      });
    }

    toast.success(`Verification ${status}`);
    fetchRequests();
  };

  const statusBadge = (status: string) => {
    if (status === "approved") return <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary"><CheckCircle size={12} /> Approved</span>;
    if (status === "pending") return <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-600"><Clock size={12} /> Pending</span>;
    return <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-destructive/10 text-destructive"><XCircle size={12} /> Rejected</span>;
  };

  return (
    <DashboardLayout role="admin">
      <div className="flex items-center gap-2 mb-6">
        <Shield size={24} className="text-primary" />
        <h1 className="text-2xl font-bold text-foreground">KYC Verifications</h1>
      </div>

      {requests.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Shield size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No verification requests yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(r => (
            <div key={r.id} className="bg-card border border-border rounded-xl p-6">
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {r.profile?.full_name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{r.profile?.full_name || "Unknown User"}</p>
                    <p className="text-xs text-muted-foreground">{r.country} · {r.phone}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(r.created_at), "PPpp")}</p>
                  </div>
                </div>
                {statusBadge(r.status)}
              </div>

              {/* Documents side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                {r.id_document_url && (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="bg-secondary/50 px-3 py-1.5 text-xs font-medium text-muted-foreground flex items-center justify-between">
                      <span>National ID Document</span>
                      <button onClick={() => setPreviewImage(r.id_document_url)} className="text-primary hover:underline flex items-center gap-1"><Eye size={12} /> View</button>
                    </div>
                    {r.id_document_url.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                      <img src={r.id_document_url} alt="ID" className="w-full h-40 object-cover cursor-pointer" onClick={() => setPreviewImage(r.id_document_url)} />
                    ) : (
                      <div className="p-4 text-center">
                        <a href={r.id_document_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">Open Document (PDF)</a>
                      </div>
                    )}
                  </div>
                )}
                {r.selfie_url && (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="bg-secondary/50 px-3 py-1.5 text-xs font-medium text-muted-foreground flex items-center justify-between">
                      <span>Live Selfie Capture</span>
                      <button onClick={() => setPreviewImage(r.selfie_url)} className="text-primary hover:underline flex items-center gap-1"><Eye size={12} /> View</button>
                    </div>
                    <img src={r.selfie_url} alt="Selfie" className="w-full h-40 object-cover cursor-pointer" onClick={() => setPreviewImage(r.selfie_url)} />
                  </div>
                )}
              </div>

              {/* Additional docs */}
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
                <div className="flex gap-3">
                  <Button size="sm" onClick={() => handleAction(r.id, r.user_id, "approved")} className="gap-1.5">
                    <CheckCircle size={14} /> Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleAction(r.id, r.user_id, "rejected")} className="gap-1.5">
                    <XCircle size={14} /> Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Full-screen image preview */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-3xl max-h-[90vh]">
            <img src={previewImage} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
            <button onClick={() => setPreviewImage(null)} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70">
              <XCircle size={20} />
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminVerifications;
