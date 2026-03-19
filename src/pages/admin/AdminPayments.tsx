import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AdminPayments = () => {
  const [payments, setPayments] = useState<any[]>([]);

  const fetchPayments = async () => {
    const { data } = await supabase.from("payments").select("*").order("created_at", { ascending: false });
    setPayments(data || []);
  };

  useEffect(() => { fetchPayments(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("payments").update({ status }).eq("id", id);
    toast.success("Payment updated");
    fetchPayments();
  };

  return (
    <DashboardLayout role="admin">
      <h1 className="text-2xl font-bold text-foreground mb-6">Payments</h1>
      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        <table className="w-full">
          <thead><tr className="border-b border-border bg-secondary/50">
            <th className="text-left text-xs font-medium text-muted-foreground p-3">Date</th>
            <th className="text-left text-xs font-medium text-muted-foreground p-3">Type</th>
            <th className="text-left text-xs font-medium text-muted-foreground p-3">Amount</th>
            <th className="text-left text-xs font-medium text-muted-foreground p-3">Method</th>
            <th className="text-left text-xs font-medium text-muted-foreground p-3">Status</th>
            <th className="text-left text-xs font-medium text-muted-foreground p-3">Actions</th>
          </tr></thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="p-3 text-sm">{format(new Date(p.created_at), "PP")}</td>
                <td className="p-3 text-sm capitalize">{p.payment_type}</td>
                <td className="p-3 text-sm font-mono">${Number(p.amount).toFixed(2)}</td>
                <td className="p-3 text-sm capitalize">{p.payment_method || "—"}</td>
                <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "completed" ? "bg-green-100 text-green-700" : p.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{p.status}</span></td>
                <td className="p-3">{p.status === "pending" && <Button size="sm" variant="outline" onClick={() => updateStatus(p.id, "completed")}>Approve</Button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};
export default AdminPayments;
